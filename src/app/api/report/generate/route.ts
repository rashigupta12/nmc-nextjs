// app/api/report/generate/route.ts
// ============================================================
// Next.js App Router — Generic Report Generator
//
// POST /api/report/generate
// Body: {
//   sample_id:   string,
//   report_type: string,
//   format?:     "pdf" | "html" | "json"
// }
// ============================================================

export const maxDuration = 60;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

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

import { connectToMongoDB } from '@/lib/mongodb';
import { db } from '@/db'; // Drizzle DB connection
import { 
  PatientsTable, 
  SamplesTable, 
  TestCatalogTable 
} from '@/db/schema';

// Model imports — registers all MongoDB models (genetic data only)
import '@/models/geneReportTemp';
import '@/models/genePageData';
import '@/models/genePageDesc';
import '@/models/patientFinalReport';
import '@/models/genericReportRecommendation';

const RequestSchema = z.object({
  sample_id: z.string().min(1, 'sample_id is required'),
  report_type: z.string().min(1, 'report_type is required'),
  format: z.enum(['pdf', 'html', 'json']).optional().default('html'),
});

// Helper to convert Neon patient to format expected by GenericReportService
function convertNeonPatientToRawInput(patient: any) {
  console.log('[ConvertNeonPatient] Converting patient data:', {
    patientId: patient.patientId,
    name: `${patient.patientFName} ${patient.patientLName}`,
    age: patient.age,
    gender: patient.gender
  });
  
  return {
    patientId: patient.patientId,
    patientFName: patient.patientFName,
    patientMName: patient.patientMName || '',
    patientLName: patient.patientLName,
    age: patient.age,
    gender: patient.gender,
    email: patient.email,
    weight: patient.weight,
    height: patient.height,
  };
}

// Helper to convert Neon sample to format expected by GenericReportService
function convertNeonSampleToRawInput(sample: any) {
  console.log('[ConvertNeonSample] Converting sample data:', {
    sampleId: sample.sampleId,
    orderNo: sample.orderNo,
    status: sample.status,
    hasGeneticData: !!sample.reportGenerated
  });
  
  return {
    sampleId: sample.sampleId,
    orderNo: sample.orderNo?.toString(),
    test: sample.testCatalogId, // Use testCatalogId instead of test
    collectionDate: sample.createdAt,
    receivedDate: sample.receivedAt,
    status: sample.status,
    geneticData: { reportGenerated: sample.reportGenerated },
  };
}

export async function POST(request: NextRequest) {
  console.log('[ReportGen] ========== STARTING REPORT GENERATION ==========');
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    console.log('[ReportGen] Request body received:', {
      sample_id: body.sample_id,
      report_type: body.report_type,
      format: body.format || 'html'
    });
    
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[ReportGen] Validation failed:', parsed.error.errors[0].message);
      return NextResponse.json(
        { Success: 'false', Error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { sample_id, report_type, format } = parsed.data;
    console.log(`[ReportGen] Processing report - Type: ${report_type}, Format: ${format}, Sample: ${sample_id}`);

    if (!isValidReportType(report_type)) {
      console.error(`[ReportGen] Invalid report type: "${report_type}"`);
      return NextResponse.json(
        { Success: 'false', Error: `Unknown report_type: "${report_type}"` },
        { status: 400 }
      );
    }

    const config = getReportConfig(report_type);
    console.log('[ReportGen] Report config loaded:', {
      vendor: config.vendor,
      pageDataSourceType: config.pageDataSource.type,
      hasTemplateFn: !!config.templateFn,
      hasPatientAdditionalModel: !!config.patientAdditionalModel
    });

    // ─── Connect to MongoDB (for genetic data only) ────────────────────────────
    console.log('[ReportGen] Connecting to MongoDB...');
    const mongoStart = Date.now();
    await connectToMongoDB();
    console.log(`[ReportGen] MongoDB connected in ${Date.now() - mongoStart}ms`);

    // ─── Fetch Sample from Neon (PostgreSQL) using Drizzle ─────────────────────
    console.log(`[ReportGen] Fetching sample from Neon: ${sample_id.toUpperCase()}`);
    const dbStart = Date.now();
    const samples = await db
      .select()
      .from(SamplesTable)
      .where(eq(SamplesTable.sampleId, sample_id.toUpperCase()))
      .limit(1);
    
    const sample = samples[0];
    console.log(`[ReportGen] Sample fetch completed in ${Date.now() - dbStart}ms`);
    
    if (!sample) {
      console.error(`[ReportGen] Sample not found: ${sample_id}`);
      return NextResponse.json(
        { Success: 'false', Error: 'Sample not found in Neon' },
        { status: 404 }
      );
    }
    
    console.log('[ReportGen] Sample found:', {
      id: sample.id,
      sampleId: sample.sampleId,
      patientId: sample.patientId,
      testCatalogId: sample.testCatalogId,
      status: sample.status,
      // orderNo: sample.orderNo
    });

    // ─── Fetch Patient from Neon (PostgreSQL) using Drizzle ────────────────────
    let patient: any = null;
    
    if (config.pageDataSource.type === 'direct') {
      console.log(`[ReportGen] Fetching patient by patientId string: ${sample.patientId}`);
      const patients = await db
        .select()
        .from(PatientsTable)
        .where(eq(PatientsTable.patientId, sample.patientId))
        .limit(1);
      patient = patients[0];
    } else {
      console.log(`[ReportGen] Fetching patient by UUID: ${sample.patientId}`);
      const patients = await db
        .select()
        .from(PatientsTable)
        .where(eq(PatientsTable.id, sample.patientId))
        .limit(1);
      patient = patients[0];
    }

    if (!patient) {
      console.error(`[ReportGen] Patient not found for patientId: ${sample.patientId}`);
      return NextResponse.json(
        { Success: 'false', Error: 'Patient not found in Neon' },
        { status: 404 }
      );
    }
    
    console.log('[ReportGen] Patient found:', {
      id: patient.id,
      patientId: patient.patientId,
      name: `${patient.patientFName} ${patient.patientLName}`,
      age: patient.age,
      gender: patient.gender
    });

    // ─── Get test catalog info from Neon ───────────────────────────────────────
    let testId: string | null = null;
    
    if (config.pageDataSource.type === 'testMaster') {
      testId = config.pageDataSource.testId;
      console.log(`[ReportGen] Using testMaster testId: ${testId}`);
    } else if (config.pageDataSource.type === 'direct') {
      testId = sample.testCatalogId;
      console.log(`[ReportGen] Using direct testId from sample: ${testId}`);
    }

    if (!testId) {
      console.error('[ReportGen] testId could not be determined from config or sample');
      return NextResponse.json(
        { Success: 'false', Error: 'testId could not be determined' },
        { status: 500 }
      );
    }

    // Optional: Verify test exists in Neon
    console.log(`[ReportGen] Verifying test catalog entry for testId: ${testId}`);
    const testCatalog = await db
      .select()
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.id, testId))
      .limit(1);

    if (!testCatalog[0]) {
      console.warn(`[ReportGen] Test catalog entry not found for testId: ${testId}`);
    } else {
      console.log('[ReportGen] Test catalog found:', {
        id: testCatalog[0].id,
        testCode: testCatalog[0].testCode,
        testName: testCatalog[0].testName
      });
    }

    // ─── Fetch GeneReportTemp rows from MongoDB ─────────────────────────────────
    console.log('[ReportGen] Fetching gene report data from MongoDB...');
    const geneStart = Date.now();
    const geneReportData = await resolveGeneReportData(
      sample.patientId,     // This could be UUID or patientId string
      sample.id,            // UUID from Neon samples table
      testId                // UUID from test_catalog
    );
    console.log(`[ReportGen] Found ${geneReportData.length} gene records in ${Date.now() - geneStart}ms`);
    
    if (geneReportData.length === 0) {
      console.warn('[ReportGen] No gene records found for this sample');
    } else {
      console.log('[ReportGen] Gene records summary:', geneReportData);
    }

    // ─── Fetch page data from MongoDB ──────────────────────────────────────────
    console.log('[ReportGen] Fetching page data from MongoDB...');
    const pageDataStart = Date.now();
    const { pageData, pageDesc } = await resolvePageData(config.pageDataSource);
    console.log(`[ReportGen] Page data fetched in ${Date.now() - pageDataStart}ms`);
    console.log('[ReportGen] Page data summary:', {
      pageDataCount: Object.keys(pageData || {}).length,
      pageDescCount: Object.keys(pageDesc || {}).length
    });

    // ─── Fetch patient additional from PatientFinalReport (MongoDB) ─────────────
    console.log('[ReportGen] Fetching patient additional data from MongoDB...');
    const patientAdditionalStart = Date.now();
    const patientAdditional = await resolvePatientAdditional(
      config.patientAdditionalModel || 'PatientFinalReport',
      sample.patientId,     // Could be UUID or patientId string
      sample.id,            // UUID from Neon samples table
      testId                // UUID from test_catalog
    );
    console.log(`[ReportGen] Patient additional data fetched in ${Date.now() - patientAdditionalStart}ms`);
    console.log('[ReportGen] Patient additional data:', patientAdditional ? 'Found' : 'Not found');

    // ─── Build sample object for engine ────────────────────────────────────────
    const sampleForEngine = convertNeonSampleToRawInput(sample);

    // ─── Convert Neon patient to expected format ───────────────────────────────
    const rawPatientInput = convertNeonPatientToRawInput(patient);

    // ─── Run the engine ────────────────────────────────────────────────────────
    console.log('[ReportGen] Initializing GenericReportService...');
    const serviceStart = Date.now();
    const service = new GenericReportService(config);
    console.log(`[ReportGen] Service initialized in ${Date.now() - serviceStart}ms`);
    
    console.log('[ReportGen] Processing report data...');
    const processStart = Date.now();
    const genericResp = await service.processReportData(
      rawPatientInput,
      sampleForEngine,
      geneReportData,
      pageData,
      pageDesc,
      patientAdditional
    );
    console.log(`[ReportGen] Report data processed in ${Date.now() - processStart}ms`);
    console.log('[ReportGen] Processed data summary:', {
      hasPatientDetails: !!genericResp.PatientDetails,
      hasSampleDetails: !!genericResp.SampleDetails,
      hasSections: !!genericResp.sections,
      sectionsCount: Object.keys(genericResp.sections || {}).length,
      hasAddDetails: !!genericResp.addDetails,
      reportTypeId: genericResp.meta?.reportTypeId,
      reportLabel: genericResp.meta?.reportLabel
    });

    // ─── Build PDF options ─────────────────────────────────────────────────────
    console.log('[ReportGen] Building PDF options...');
    const pdfOpts = buildPdfOptions(report_type, genericResp, config.vendor);
    console.log('[ReportGen] PDF options built successfully');

    // ─── Handle JSON format ────────────────────────────────────────────────────
    if (format === 'json') {
      console.log('[ReportGen] Returning JSON response');
      const response = {
        success: true,
        report_type,
        sample_id,
        data: {
          templateData: pdfOpts,
          engineData: genericResp,
          metadata: {
            generatedAt: new Date().toISOString(),
            patientId: patient.id,
            patientName: `${patient.patientFName} ${patient.patientLName}`,
            sampleId: sample.sampleId,
            sampleUuid: sample.id,
            testId: testId,
            testCode: testCatalog[0]?.testCode,
          },
        },
      };
      
      console.log(`[ReportGen] JSON generation completed in ${Date.now() - startTime}ms`);
      return NextResponse.json(response, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    // ─── Render HTML ───────────────────────────────────────────────────────────
    console.log('[ReportGen] Rendering HTML template...');
    const renderStart = Date.now();
    const html = config.templateFn(pdfOpts);
    console.log(`[ReportGen] HTML rendered in ${Date.now() - renderStart}ms`);
    console.log('[ReportGen] HTML size:', html.length, 'characters');

    if (format === 'html') {
      console.log('[ReportGen] Returning HTML response');
      console.log(`[ReportGen] HTML generation completed in ${Date.now() - startTime}ms`);
      return new NextResponse(renderHtml(html), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // ─── Generate PDF ──────────────────────────────────────────────────────────
    console.log('[ReportGen] Generating PDF...');
    const pdfStart = Date.now();
    const pdfBuffer = await renderHtmlToPdf(html);
    console.log(`[ReportGen] PDF generated in ${Date.now() - pdfStart}ms`);
    console.log('[ReportGen] PDF size:', pdfBuffer.length, 'bytes');
    
    const filename = `${report_type}-report-${sample_id}.pdf`;
    console.log(`[ReportGen] Returning PDF response: ${filename}`);
    console.log(`[ReportGen] Total execution time: ${Date.now() - startTime}ms`);
    console.log('[ReportGen] ========== REPORT GENERATION COMPLETED ==========');

    return new NextResponse(pdfBuffer.buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });

  } catch (error: any) {
    console.error('[ReportGen] ========== ERROR IN REPORT GENERATION ==========');
    console.error('[ReportGen] Error message:', error?.message);
    console.error('[ReportGen] Error stack:', error?.stack);
    console.error('[ReportGen] Error details:', error);
    
    return NextResponse.json(
      { Success: 'false', Error: error?.message ?? 'Report generation failed' },
      { status: 500 }
    );
  }
}