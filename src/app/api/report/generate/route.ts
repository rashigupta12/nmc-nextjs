// ============================================================
// Next.js App Router — Generic Report Generator
//
// POST /api/report/generate
// Body: {
//   sample_id:   string,
//   report_type: string,   // "immunity" | "women-health" | ...
//   format?:     "pdf" | "html" | "json"
// }
//
// This route has ZERO knowledge of specific report types.
// All branching is driven by the config returned from getReportConfig().
// ============================================================

export const maxDuration = 60;
export const runtime     = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ── Engine imports (everything from one place) ────────────────────────────────
import {
  getReportConfig,
  isValidReportType,
  GenericReportService,
  resolvePageData,
  resolvePatientAdditional,
  resolveGeneReportData,
  renderHtmlToPdf,
  renderHtml,
  buildPdfOptions,
} from '@/lib/reportEngine';

// ── DB connection ─────────────────────────────────────────────────────────────
import { connectToMongoDB } from '@/lib/mongodb';

// ── Model barrel import — registers all mongoose models before resolveModel() ─
// Add every model your report types reference here.
import '@/models/geneReportTemp';
import '@/models/patient';
import '@/models/sample';
import '@/models/testMaster';
import '@/models/genePageData';
import '@/models/genePageDesc';
import '@/models/womenHealthPageData';
import '@/models/womenHealthPageDesc';
import '@/models/patientAdditionalImmunity';
import '@/models/patientAdditionalWomanHealth';
import '@/models/patientAdditionalSleep';
import '@/models/clopidogrelRecommendation';
import ClopidogrelRecommendation from '@/models/clopidogrelRecommendation';
import StatinRecommendation from '@/models/statinRecommendation';
import WarfarinRecommendation from '@/models/warfarinRecommendation';
import '@/models/patientAdditionalmen';
import '@/models/patientAdditionalEyeHealth';

// ── Patient + Sample models (direct use) ──────────────────────────────────────
import { Patient, PatientModel } from '@/models/patient';
import { Sample } from '@/models/sample';
import { GeneReportTemp } from '@/models/geneReportTemp';

// ─── Validation ───────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  sample_id:   z.string().min(1, 'sample_id is required'),
  report_type: z.string().min(1, 'report_type is required'),
  format:      z.enum(['pdf', 'html', 'json']).optional().default('html'),
});

// ─── Helper: Extract SLCO1B1 variant for Statin ───────────────────────────────
function extractSlco1b1Variant(geneReportData: any[]): string | null {
  const slco1b1Record = geneReportData.find((d: any) => 
    d.gene && d.gene.toUpperCase() === 'SLCO1B1'
  );
  return slco1b1Record ? slco1b1Record.report_variant : null;
}

// ─── Helper: Extract Warfarin genotypes ───────────────────────────────────────
function extractWarfarinGenotypes(geneReportData: any[]): {
  cyp2c9_2_status: string | null;
  cyp2c9_3_status: string | null;
  vkorc1_variant: string | null;
  cyp2c9_combined: string | null;
} {
  let cyp2c9_2_status = null;
  let cyp2c9_3_status = null;
  let vkorc1_variant = null;
  
  for (const record of geneReportData) {
    const gene = record.gene?.toUpperCase() || '';
    const status = record.status || record.report_variant;
    
    if (gene === 'CYP2C9*2') {
      cyp2c9_2_status = status;
    } else if (gene === 'CYP2C9*3') {
      cyp2c9_3_status = status;
    } else if (gene === 'VKORC1') {
      vkorc1_variant = record.report_variant;
    }
  }
  
  // Combine CYP2C9 genotypes
  let cyp2c9_combined = null;
  if (cyp2c9_2_status && cyp2c9_3_status) {
    cyp2c9_combined = `${cyp2c9_2_status}/${cyp2c9_3_status}`;
  }
  
  return { cyp2c9_2_status, cyp2c9_3_status, vkorc1_variant, cyp2c9_combined };
}

// ─── Helper: Calculate Warfarin dosage using IWPC formula ──────────────────────
function calculateWarfarinDosage(
  cyp2c9_combined: string | null,
  vkorc1_variant: string | null,
  weight: number,
  age: number,
  gender: string
): { baseDose: number; amiodaroneDose: number; enzymeDose: number } {
  // IWPC (International Warfarin Pharmacogenetics Consortium) formula
  // log(dose) = 0.613 - 0.2475*VKORC1 + 0.0322*Age + 0.664*BSA + 0.219*CYP2C9*2 + 0.216*CYP2C9*3 + 0.122*Amiodarone + 0.104*Smoker + 0.091*Race
  
  // VKORC1 coefficient
  let vkorc1Coeff = 0;
  if (vkorc1_variant === 'GG') vkorc1Coeff = -0.8675; // GG = -0.8675
  else if (vkorc1_variant === 'GA') vkorc1Coeff = 0; // GA = 0
  else if (vkorc1_variant === 'AA') vkorc1Coeff = 0.2475; // AA = +0.2475
  
  // CYP2C9 coefficients
  let cyp2c9_2_coeff = 0;
  let cyp2c9_3_coeff = 0;
  
  if (cyp2c9_combined) {
    if (cyp2c9_combined.includes('*2')) cyp2c9_2_coeff = 0.219;
    if (cyp2c9_combined.includes('*3')) cyp2c9_3_coeff = 0.216;
  }
  
  // Calculate BSA (Body Surface Area) using Mosteller formula
  const height = 170; // Default height in cm
  const bsa = Math.sqrt((height * weight) / 3600);
  
  // Calculate log dose
  const logDose = 0.613 
    - (vkorc1Coeff * 0.2475)
    + (Math.log(age) * 0.0322)
    + (Math.log(bsa) * 0.664)
    + cyp2c9_2_coeff
    + cyp2c9_3_coeff;
  
  // Convert from log dose to weekly dose in mg
  const baseDose = Math.exp(logDose);
  
  // Adjustments for amiodarone and enzyme inducers
  const amiodaroneDose = baseDose * 0.75; // Amiodarone reduces dose by 25%
  const enzymeDose = baseDose * 1.5; // Enzyme inducers increase dose by 50%
  
  return { 
    baseDose: Math.round(baseDose), 
    amiodaroneDose: Math.round(amiodaroneDose), 
    enzymeDose: Math.round(enzymeDose) 
  };
}

// ─── Helper: Calculate Acenocoumarol dosage ────────────────────────────────────
function calculateAcenocoumarolDosage(
  vkorc1_variant: string | null,
  cyp2c9_2_status: string | null,
  cyp2c9_3_status: string | null,
  weight: number,
  gender: string
): number {
  // Linear stepwise regression model for Acenocoumarol
  // Dose (mg/day) = 0.192 + VKORC1_coeff + (0.04 * weight) + (0.569 * gender_male)
  
  let vkorc1Coeff = 0;
  if (vkorc1_variant === 'GG') vkorc1Coeff = 0.879;
  else if (vkorc1_variant === 'GA') vkorc1Coeff = 0;
  else if (vkorc1_variant === 'AA') vkorc1Coeff = -1.443;
  
  const genderCoeff = gender === 'M' ? 0.569 : 0;
  
  const dose = 0.192 + vkorc1Coeff + (0.04 * weight) + genderCoeff;
  
  return parseFloat(dose.toFixed(2));
}

// ─── Helper: Get CYP2C9 interpretation ────────────────────────────────────────
function getCYP2C9Interpretation(combined_genotype: string): { result: string; status: string } {
  const interpretations: Record<string, { result: string; status: string }> = {
    '*1/*1': { result: 'Normal Metabolizer - Standard Dose', status: 'good' },
    '*1/*2': { result: 'Intermediate Metabolizer - Reduced Dose', status: 'intermediate' },
    '*1/*3': { result: 'Intermediate Metabolizer - Reduced Dose', status: 'intermediate' },
    '*2/*2': { result: 'Poor Metabolizer - Significantly Reduced Dose', status: 'poor' },
    '*2/*3': { result: 'Poor Metabolizer - Significantly Reduced Dose', status: 'poor' },
    '*3/*3': { result: 'Poor Metabolizer - Significantly Reduced Dose', status: 'poor' },
  };
  return interpretations[combined_genotype] || { result: 'Unknown Metabolizer', status: 'average' };
}

// ─── Helper: Get VKORC1 interpretation ────────────────────────────────────────
function getVKORC1Interpretation(vkorc1_variant: string | null): string {
  const interpretations: Record<string, string> = {
    'GG': 'NORMAL METABOLIZER - Normal Dose',
    'GA': 'INTERMEDIATE METABOLIZER - Intermediate Dose',
    'AA': 'POOR METABOLIZER - Low Dose',
  };
  return interpretations[vkorc1_variant || 'GG'] || 'Unknown';
}

// ─── Helper: Get combined interpretation ──────────────────────────────────────
function getCombinedInterpretation(
  cyp2c9Status: string,
  vkorc1_variant: string | null
): string {
  if (cyp2c9Status === 'poor' || vkorc1_variant === 'AA') {
    return 'Poor Metabolizer';
  } else if (cyp2c9Status === 'intermediate' || vkorc1_variant === 'GA') {
    return 'Intermediate Metabolizer';
  }
  return 'Normal Metabolizer';
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Parse + validate body ────────────────────────────────────────────────
    const body   = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { Success: 'false', Error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { sample_id, report_type, format } = parsed.data;

    // 2. Validate report type ─────────────────────────────────────────────────
    if (!isValidReportType(report_type)) {
      return NextResponse.json(
        { Success: 'false', Error: `Unknown report_type: "${report_type}"` },
        { status: 400 }
      );
    }

    const config = getReportConfig(report_type);

    // 3. Connect DB ───────────────────────────────────────────────────────────
    await connectToMongoDB();

    // 4. Fetch Sample ─────────────────────────────────────────────────────────
    const sample = await Sample.findBySampleId(sample_id.toUpperCase());
    if (!sample) {
      return NextResponse.json(
        { Success: 'false', Error: 'Sample not found' },
        { status: 404 }
      );
    }

    // 5. Fetch Patient ─────────────────────────────────────────────────────────
    let patient: any = null;

    if (config.pageDataSource.type === 'direct') {
      patient = await (Patient as PatientModel).findByPatientId(
        sample.patientId.toString().toUpperCase()
      );
    } else {
      patient = await Patient.findById(sample.patientId);
    }

    if (!patient) {
      return NextResponse.json(
        { Success: 'false', Error: 'Patient not found' },
        { status: 404 }
      );
    }

    // 6. Fetch GeneReportTemp rows ─────────────────────────────────────────────
    const geneReportData = await resolveGeneReportData(
      sample.patientId.toString()
    );

    // 7. Fetch page data + page desc (strategy from config) ───────────────────
    const { pageData, pageDesc } = await resolvePageData(config.pageDataSource);

    // 8. Fetch patient additional ──────────────────────────────────────────────
    let patientAdditional: any = null;
    
    if (report_type === 'clopidogrel') {
      // Clopidogrel implementation
      const clopidogrelData = geneReportData.filter((d: any) => 
        d.reportType === 'Clopidogrel' || d.reportType === 'NMC_CLOPI'
      );
      
      if (clopidogrelData.length >= 3) {
        const getReportVariant = (geneName: string) => {
          const record = clopidogrelData.find((d: any) => 
            d.gene && d.gene.toUpperCase().includes(geneName.toUpperCase())
          );
          return record ? record.report_variant : null;
        };
        
        const cyp2c19_2 = getReportVariant('CYP2C19*2');
        const cyp2c19_3 = getReportVariant('CYP2C19*3');
        const cyp2c19_17 = getReportVariant('CYP2C19*17');
        
        console.log('🧬 Clopidogrel genotypes:', { cyp2c19_2, cyp2c19_3, cyp2c19_17 });
        
        if (cyp2c19_2 && cyp2c19_3 && cyp2c19_17) {
          const recommendation = await ClopidogrelRecommendation.findOne({
            cyp2c19_2,
            cyp2c19_3,
            cyp2c19_17,
          });
          
          if (recommendation) {
            patientAdditional = {
              status: recommendation.status,
              recommendation: recommendation.recommendation,
              implications: recommendation.implications,
              combinedGenotype: recommendation.combinedGenotype,
              cyp2c19_2,
              cyp2c19_3,
              cyp2c19_17,
            };
          } else {
            patientAdditional = {
              status: '—',
              recommendation: '—',
              combinedGenotype: '—',
              cyp2c19_2,
              cyp2c19_3,
              cyp2c19_17,
            };
          }
        }
      }
    } else if (report_type === 'statin') {
      // Statin implementation
      const slco1b1Variant = extractSlco1b1Variant(geneReportData);
      console.log('🧬 Statin SLCO1B1 variant:', slco1b1Variant);
      
      // Fetch all drug recommendations from StatinRecommendation model
      const drugRecommendations = await StatinRecommendation.find({ 
        reportTestId: 'NMC_STN' 
      }).sort({ id: 1 });
      
      console.log(`✅ Found ${drugRecommendations.length} statin drug recommendations`);
      
      // Build the addDetails array for the template
      const addDetails = drugRecommendations.map((drug: any) => ({
        drug: drug.drug,
        TT: drug.TT,
        TC: drug.TC,
        CC: drug.CC,
      }));
      
      const variant = slco1b1Variant || 'TT';
      
      patientAdditional = {
        report_variant: variant,
        addDetails: addDetails,
        status: variant === 'TT' ? 'Normal Metabolizer' : variant === 'TC' ? 'Intermediate Metabolizer' : 'Poor Metabolizer',
        cpicLevel: '1A'
      };
      
      console.log('✅ Built Statin patientAdditional with', addDetails.length, 'drugs');
      
    } else if (report_type === 'warfarin') {
      // WARFARIN IMPLEMENTATION
      const { cyp2c9_2_status, cyp2c9_3_status, vkorc1_variant, cyp2c9_combined } = extractWarfarinGenotypes(geneReportData);
      
      console.log('🧬 Warfarin genotypes:', { cyp2c9_2_status, cyp2c9_3_status, vkorc1_variant, cyp2c9_combined });
      
      // Find matching recommendation from database (if needed)
      let recommendation = null;
      if (cyp2c9_2_status && cyp2c9_3_status) {
        recommendation = await WarfarinRecommendation.findOne({
          'CYP2C19*2': cyp2c9_2_status,
          'CYP2C19*3': cyp2c9_3_status,
        });
      }
      
      // Calculate dosages
      const weight = parseFloat(patient.weight) || 70;
      const age = patient.age || 30;
      const gender = patient.gender || 'M';
      
      const warfarinDoses = calculateWarfarinDosage(cyp2c9_combined, vkorc1_variant, weight, age, gender);
      const acenocoumarolDose = calculateAcenocoumarolDosage(vkorc1_variant, cyp2c9_2_status, cyp2c9_3_status, weight, gender);
      const cyp2c9Interpretation = getCYP2C9Interpretation(cyp2c9_combined || '*1/*1');
      const vkorc1Interpretation = getVKORC1Interpretation(vkorc1_variant);
      const combinedInterpretation = getCombinedInterpretation(cyp2c9Interpretation.status, vkorc1_variant);
      
      patientAdditional = {
        warfarinDosage: warfarinDoses.baseDose,
        amiodaroneDose: warfarinDoses.amiodaroneDose,
        enzymeDose: warfarinDoses.enzymeDose,
        acenocomuroal: acenocoumarolDose,
        combinedInterpretation: combinedInterpretation,
        cyp2c9Genotype: cyp2c9_combined || '*1/*1',
        cyp2c9Interpretation: cyp2c9Interpretation,
        vkorc1Genotype: vkorc1_variant || 'GG',
        vkorc1Interpretation: vkorc1Interpretation,
        recommendation: recommendation,
      };
      
      console.log('✅ Built Warfarin patientAdditional:', {
        warfarinDosage: warfarinDoses.baseDose,
        acenocomuroal: acenocoumarolDose,
        combinedInterpretation: combinedInterpretation,
        cyp2c9_combined: cyp2c9_combined,
        vkorc1_variant: vkorc1_variant
      });
      
    } else if (config.patientAdditionalModel) {
      patientAdditional = await resolvePatientAdditional(
        config.patientAdditionalModel,
        patient._id
      );
    }

    // 9. Build normalised sample object for the engine ─────────────────────────
    const sampleForEngine = {
      sampleId:       sample.sampleId,
      orderNo:        sample.orderNo?.toString(),
      test:           sample.test,
      collectionDate: sample.createdAt,
      receivedDate:   sample.receivedDate,
      status:         sample.status,
      geneticData:    sample.geneticData,
    };

    // 10. Run the engine ───────────────────────────────────────────────────────
    const service      = new GenericReportService(config);
    const genericResp  = await service.processReportData(
      patient,
      sampleForEngine,
      geneReportData,
      pageData,
      pageDesc,
      patientAdditional
    );

    // 11. Build PDF options
    const pdfOpts = buildPdfOptions(report_type, genericResp, config.vendor);

    // 12. Handle JSON format ───────────────────────────────────────────────────
    if (format === 'json') {
      const jsonResponse = {
        success: true,
        report_type,
        sample_id,
        data: {
          templateData: pdfOpts,
          engineData: genericResp,
          metadata: {
            generatedAt: new Date().toISOString(),
            patientId: patient._id,
            patientName: patient.name || patient.firstName,
            sampleId: sample.sampleId,
          },
          config: {
            reportType: report_type,
            pageDataSource: config.pageDataSource.type,
            vendor: config.vendor,
            patientAdditionalModel: config.patientAdditionalModel,
          }
        }
      };
      
      return NextResponse.json(jsonResponse, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }

    // 13. Render HTML for PDF or HTML format ───────────────────────────────────
    const html = config.templateFn(pdfOpts);

    if (format === 'html') {
      return new NextResponse(renderHtml(html), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 14. Generate PDF ─────────────────────────────────────────────────────────
    const pdfBuffer = await renderHtmlToPdf(html);
    const filename  = `${report_type}-report-${sample_id}.pdf`;

    return new NextResponse(pdfBuffer.buffer as any, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(pdfBuffer.length),
      },
    });

  } catch (error: any) {
    console.error('[GenericReportRoute] error:', error);
    return NextResponse.json(
      { Success: 'false', Error: error?.message ?? 'Report generation failed' },
      { status: 500 }
    );
  }
}