// template.ts
// ============================================================
// Statin Report — Complete HTML Template Generator
// Based on PHP reportPages.php template & PDF layout
// Theme color: #1F487C (Deep blue) | Font: Poppins
// Data source: API response (reportData)
// ============================================================

export interface PdfGeneratorOptions {
  vendor?: {
    themeColor?: string;
    coverLogoUrl?: string;
    vendorAddress?: string;
    vendorName?: string;
  };
  reportData: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ASSETS = BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#1F487C';
}

function getTextColor(): string {
  return '#1F487C';
}

// Status color class for CSS based on SLCO1B1 variant
function getVariantClass(variant: string): string {
  const s = (variant || '').toUpperCase();
  if (s === 'TT') return 'TT';
  if (s === 'TC') return 'TC';
  if (s === 'CC') return 'CC';
  return '';
}

// Extract variant from sections / addDetails data
function getReportVariant(reportData: any): string {
  // Priority 1: direct variant from addDetails
  if (reportData.addDetails && reportData.addDetails.report_variant) {
    return reportData.addDetails.report_variant;
  }
  
  // Priority 2: from sections.flat structure
  const flatData = reportData.sections?.flat;
  if (flatData) {
    for (const conditionName in flatData) {
      const conditions = flatData[conditionName];
      if (conditions && conditions.length > 0) {
        const condition = conditions[0];
        if (condition.gene && condition.gene.length > 0) {
          const slco1b1Gene = condition.gene.find((g: any) => g.name === 'SLCO1B1');
          if (slco1b1Gene && slco1b1Gene.report_variant) {
            return slco1b1Gene.report_variant;
          }
        }
      }
    }
  }
  
  // Priority 3: fallback from observed genotype in test result
  if (reportData.testResult?.observedGenotype) {
    return reportData.testResult.observedGenotype;
  }
  
  return 'TT'; // default fallback
}

// Extract drug recommendations from addDetails (supports both nested and flat)
function getDrugRecommendations(reportData: any): any[] {
  // Case 1: addDetails.addDetails array
  if (reportData.addDetails && reportData.addDetails.addDetails && Array.isArray(reportData.addDetails.addDetails)) {
    return reportData.addDetails.addDetails;
  }
  
  // Case 2: addDetails itself is the array
  if (Array.isArray(reportData.addDetails)) {
    return reportData.addDetails;
  }
  
  // Case 3: from drugRecommendations field
  if (reportData.drugRecommendations && Array.isArray(reportData.drugRecommendations)) {
    return reportData.drugRecommendations;
  }
  
  // Default statin list with standard dosages (used if API doesn't provide)
  return [
    { drug: "Simvastatin", TT: "80 mg/day", TC: "40 mg/day", CC: "20 mg/day" },
    { drug: "Pitavastatin", TT: "4 mg/day", TC: "2 mg/day", CC: "1 mg/day" },
    { drug: "Atorvastatin", TT: "80 mg/day", TC: "40 mg/day", CC: "20 mg/day" },
    { drug: "Pravastatin", TT: "80 mg/day", TC: "40 mg/day", CC: "40 mg/day" },
    { drug: "Rosuvastatin", TT: "40 mg/day", TC: "20 mg/day", CC: "20 mg/day" },
    { drug: "Fluvastatin", TT: "80 mg/day", TC: "80 mg/day", CC: "80 mg/day" }
  ];
}

// Get CPIC level from data
function getCpicLevel(reportData: any): string {
  if (reportData.addDetails?.cpicLevel) return reportData.addDetails.cpicLevel;
  if (reportData.cpicLevel) return reportData.cpicLevel;
  return "1A";
}

// Format date safely
function formatDate(dateValue: any): string {
  if (!dateValue) return '—';
  // if it's a string like "19/03/2026" or ISO
  if (typeof dateValue === 'string') return dateValue;
  // if it's a Date object
  if (dateValue instanceof Date) {
    return dateValue.toLocaleDateString('en-GB');
  }
  return String(dateValue);
}

// ─── CSS Builder ──────────────────────────────────────────────────────────────

function buildCSS(themeColor: string, textColor: string): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: 'Poppins', sans-serif; background: #e0e0e0; font-size: 14px; color: rgb(77,77,77); }
.page { box-shadow: .5mm 2mm 2mm rgba(0,0,0,.3); margin: 5mm auto; width: 210mm; min-height: 297mm; background-color: white; position: relative; page-break-after: always; overflow: hidden; }
.backImg { background-color: #f8f8f8; }
@page { margin: 0; size: 210mm 297mm; }
@media print { body { background: white; } .page { margin: 0; box-shadow: none; width: 100%; min-height: 100vh; } }
.rpt-header { position: absolute; top: 14px; right: 20px; font-size: 9pt; letter-spacing: 2px; color: #426c7f; font-weight: 500; text-transform: uppercase; z-index: 10; }
.content-box { margin: 0 auto; width: 180mm; position: relative; z-index: 1; }
p { text-align: justify; color: rgb(77,77,77); font-size: 13px; font-weight: 400; margin: 0 0 8px 0; line-height: 20px; }
h1, h2, h3, h4, h5 { margin: 0; }
h2 { color: ${themeColor}; font-size: 28px; font-weight: 300; margin: 18px 0 5px; }
h3 { color: ${themeColor}; font-size: 22px; font-weight: 400; margin: 14px 0 6px; }
h4 { font-size: 14px; color: rgb(77,77,77); font-weight: 600; margin: 10px 0 4px; }

/* Table Styles */
.table { margin-top: 20px; border-collapse: collapse; width: 100%; }
.table tr, .table td, .table th { border: 1px solid black; }
.table tr td { padding: 8px 10px; font-size: 14px; }
.text-color { color: ${textColor}; }
.bg-color, .resultTable th, .reference-table th, .drug-table th {
  background-color: ${themeColor};
  color: white;
}

.resultTable tr, .resultTable td, .resultTable th,
.drug-table tr, .drug-table td, .drug-table th {
  border: 3px solid ${themeColor};
  padding: 3px 10px;
  text-align: center;
}

.reference-table tr, .reference-table td, .reference-table th {
  border: 1px solid ${themeColor};
  padding: 3px 10px;
}

/* Variant Color Classes */
.TT { color: green; font-weight: 600; }
.TC { color: #dfbb0e; font-weight: 600; }
.CC { color: red; font-weight: 600; }

/* Report Header */
.reportHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: auto;
  margin-top: 60px;
  margin-bottom: 40px;
  gap: 20px;
}
.logo { width: 28%; }
.nabl { margin: auto; width: 10%; }
.qrCode { margin: auto; width: 10%; }
.address { width: 40%; font-size: 12px; line-height: 1.4; text-align: right; }

.cpicLevel {
  font-size: 12px;
  font-style: italic;
  font-weight: bold;
  margin-top: 8px;
  display: flex;
  align-content: center;
}

.endOfReport {
  font-size: 12px;
  font-weight: bold;
  font-style: italic;
  display: flex;
  align-content: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

.footer-text {
  position: absolute;
  bottom: 20px;
  font-size: 10px;
  font-weight: 500;
  left: 20px;
  color: #555;
}

/* Page numbering */
.page-number {
  font-size: 13px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 12px;
  z-index: 1000;
  background: #e2e8f0;
  color: #1e293b;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.signature-area {
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid #ccc;
  padding-top: 20px;
}
.signature-img {
  height: 50px;
  width: auto;
  object-fit: contain;
}
.signature-text {
  font-size: 12px;
  font-weight: 500;
  border-top: 1px solid #000;
  display: inline-block;
  padding-top: 5px;
}

ol.references-list {
  margin-left: 20px;
  margin-top: 8px;
}
ol.references-list li {
  font-size: 11px;
  line-height: 1.4;
  margin-bottom: 6px;
  text-align: justify;
}
`;
}

// ─── Page 1: Patient Information + Test Results ──────────────────────────────

function buildPage1(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData;
  
  // Extract data from API response (matches PDF structure)
  const pd = reportData.PatientDetails || {};
  const sd = reportData.SampleDetails || {};
  
  const variant = getReportVariant(reportData);
  const variantClass = getVariantClass(variant);
  const drugList = getDrugRecommendations(reportData);
  const cpicLevel = getCpicLevel(reportData);
  
  const reportGenDate = formatDate(sd.report_date || sd.lab_date || new Date().toLocaleDateString('en-GB'));
  const sampleCollDate = formatDate(sd.sample_date || sd.collection_date || '—');
  
  // Helper to get recommended dosage based on observed variant
  const getDosageForVariant = (drug: any, observedVariant: string): string => {
    const upperVariant = observedVariant.toUpperCase();
    if (drug[upperVariant]) return drug[upperVariant];
    if (drug.TT) return drug.TT;
    return '—';
  };
  
  return `
  <div class="page backImg" style="page-break-after:always;">
    <div class="rpt-header">STATIN REPORT</div>
    <div class="content-box">
      <!-- Report Header with Logo and Address -->
      <div class="reportHeader">
        <div class="logo">
          ${opts.vendor?.coverLogoUrl ? `<img src="${opts.vendor.coverLogoUrl}" alt="Lab Logo" style="width:100%; max-width:160px;">` : '<div style="font-weight:600; color:#1F487C;">NEOTECH WORLD LAB</div>'}
        </div>
        <div class="address">
          ${opts.vendor?.vendorAddress ? `<p style="margin:0; font-size:11px; text-align:right;">${opts.vendor.vendorAddress.replace(/\n/g, '<br>')}</p>` : '<p style="font-size:11px;">Neotech World lab Pvt. Ltd., Gurugram</p>'}
        </div>
      </div>

      <!-- Title -->
      <div style="width:100%; text-align:center; margin: 15px 0 10px;">
        <h3 style="text-decoration:underline; color:${themeColor}; font-weight:500;">Personalized Genotyping Report for Statin Dosage</h3>
      </div>

      <!-- Patient & Test Details Table -->
      <table class="table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th colspan="2">Patient Information</th>
            <th>Test Details</th>
            <th>Referring Physician Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Patient Name:</b> ${pd.name || pd.patientName || '—'}</td>
            <td><b>Patient Id:</b> ${pd.patientId || pd.id || '—'}</td>
            <td><b>Test Id:</b> ${sd.testId || 'NMC_STN'}</td>
            <td><b>Physician Name:</b> ${pd.referredBy || pd.physicianName || 'Dr. Atul'}</td>
          </tr>
          <tr>
            <td><b>Sample ID:</b> ${sd.vendorSampleId || sd.sampleId || sd.kitBarcode || '—'}</td>
            <td><b>Age:</b> ${pd.age || '—'} &nbsp; <b>Gender:</b> ${pd.gender === 'M' ? 'MALE' : pd.gender === 'F' ? 'FEMALE' : pd.gender || '—'}</td>
            <td><b>Collection Date:</b> ${sampleCollDate}</td>
            <td><b>Institution:</b> ${pd.hospital || pd.institution || '151 Base Hospital, Guwahati'}</td>
          </tr>
          <tr>
            <td><b>Height:</b> ${pd.height || '—'} cm</td>
            <td><b>Weight:</b> ${pd.weight || '—'} kg</td>
            <td><b>Specimen Type:</b> ${sd.sampleType || sd.specimenType || 'SALIVA'}</td>
            <td><b>Report Date:</b> ${reportGenDate}</td>
          </tr>
        </tbody>
      </table>

      <!-- TEST RESULT Section -->
      <div style="margin-top: 35px;">
        <h3 class="text-color" style="margin:0 0 8px 0;">TEST RESULT</h3>
      </div>

      <table class="resultTable" style="width:100%;">
        <thead>
          <tr><th>Variant Tested</th><th style="width:190px">Reference Genotype</th><th>Observed Genotype</th></tr>
        </thead>
        <tbody>
          <tr><td><b>SLCO1B1</b></td><td>TT</td><td class="${variantClass}">${variant}</td></tr>
        </tbody>
      </table>
      
      <div class="cpicLevel">CPIC Level of Evidence- ${cpicLevel}</div>
      
      <!-- INTERPRETATION & Drug Table -->
      <div style="margin-top: 30px;">
        <h3 class="text-color" style="margin:0 0 8px 0;">INTERPRETATION</h3>
        <p style="margin-top:0">Based upon observed genotype, drug administration* for respective statin is summarized in table below**</p>
      </div>

      <table class="drug-table" style="width:100%;">
        <thead><tr><th>DRUG</th><th>Recommended Dosage</th></tr></thead>
        <tbody>
          ${drugList.map((drug: any) => `
            <tr>
              <td><b>${drug.drug || drug.name || '—'}</b></td>
              <td>${getDosageForVariant(drug, variant)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="font-size:11px; margin-top:12px;"><i>*SLCO1B1 pharmacogenetics testing does not obviate the monitoring of creatine kinase and transaminase blood levels.</i></p>
      <p style="font-size:11px;"><i>**These dosage values are derived from both drug labels and validated scientific studies.</i></p>
    </div>
  </div>`;
}

// ─── Page 2: Reference Table + Methodology + Signatures + References ──────────

function buildPage2(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData;
  const pd = reportData.PatientDetails || {};
  const drugList = getDrugRecommendations(reportData);
  const variant = getReportVariant(reportData);
  
  return `
  <div class="page backImg">
    <div class="rpt-header">STATIN REPORT</div>
    <div class="content-box">
      <!-- Report Header (same as page1) -->
      <div class="reportHeader">
        <div class="logo">
          ${opts.vendor?.coverLogoUrl ? `<img src="${opts.vendor.coverLogoUrl}" alt="Lab Logo" style="width:100%; max-width:160px;">` : '<div style="font-weight:600; color:#1F487C;">NEOTECH WORLD LAB</div>'}
        </div>
        <div class="address">
          ${opts.vendor?.vendorAddress ? `<p style="margin:0; font-size:11px; text-align:right;">${opts.vendor.vendorAddress.replace(/\n/g, '<br>')}</p>` : '<p style="font-size:11px;">Neotech World lab Pvt. Ltd., Gurugram</p>'}
        </div>
      </div>

      <!-- REFERENCE DOSAGE TABLE -->
      <h4 class="text-color" style="margin-top:20px;">REFERENCE DOSAGE:</h4>
      <p style="margin-top:0">Based on a CPIC dosing guideline</p>
      
      <table class="reference-table" style="width:100%; margin-top:12px;">
        <thead>
          <tr style="background:${themeColor}; color:white;">
            <th>Drug/Genotype</th><th>TT</th><th>TC</th><th>CC</th>
          </tr>
        </thead>
        <tbody>
          ${drugList.map((drug: any) => `
            <tr>
              <td><b>${drug.drug || drug.name || '—'}</b></td>
              <td>${drug.TT || '—'}</td>
              <td>${drug.TC || '—'}</td>
              <td>${drug.CC || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Methodology & Limitations -->
      <p style="margin-top: 20px;"><b style="text-decoration:underline">TEST METHODOLOGY:</b> SNP analysis by PCR followed by Genotyping technology.</p>
      <p><b style="text-decoration:underline">TEST LIMITATIONS:</b> There may be other variants in the SLCO1B1 gene which are not included in this test and may influence the response to Statins.</p>

      <!-- Scientist Signature Section -->
      <div class="signature-area">
        <img src="${ASSETS}/images/Varun Signature.jpeg" alt="Signature" class="signature-img" onerror="this.style.display='none'">
        <div class="signature-text">Dr. Varun Sharma, Ph.D<br><span style="font-size:11px; font-weight:normal;">Scientist - Human Genetics</span></div>
        <div style="margin-left:auto; font-size:11px;">Authorized Signatory</div>
      </div>

      <!-- REFERENCES -->
      <h4 style="text-decoration:underline; margin-top: 28px; color:${themeColor};">REFERENCES:</h4>
      <ol class="references-list">
        <li>Wilke, R.A. et al.; Clinical Pharmacogenomics Implementation Consortium (CPIC). The Clinical Pharmacogenomics Implementation Consortium: CPIC guideline for SLCO1B1 and simvastatin-induced myopathy. Clin. Pharmacol.Ther. 92, 112–117 (2012)</li>
        <li>Wilke, R.A. et al. Identifying genetic risk factors for serious adverse drug reactions: current progress and challenges. Nat. Rev. Drug Discov.6, 904–916 (2007).</li>
        <li>Carr DF, et al.; SLCO1B1 Genetic Variant Associated With Statin-Induced Myopathy: A Proof-of-Concept Study Using the Clinical Practice Research Datalink. Clin Pharmacol Ther. 2013 Dec;94(6):695-70</li>
      </ol>

      <div class="endOfReport">- -End of Report - -</div>
      <div class="footer-text">Patient Id: ${pd.patientId || pd.id || '—'}</div>
    </div>
  </div>`;
}

// ─── MASTER HTML GENERATOR (exported function) ────────────────────────────────

export function buildStatinReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const textColor = getTextColor();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Statin Genotyping Report</title>
  <style>${buildCSS(themeColor, textColor)}</style>
</head>
<body>
  ${buildPage1(opts)}
  ${buildPage2(opts)}
  <script>
    (function() {
      // automatic page numbering
      const pages = document.querySelectorAll('.page');
      const total = pages.length;
      pages.forEach(function(page, idx) {
        const pageNumSpan = document.createElement('div');
        pageNumSpan.className = 'page-number';
        pageNumSpan.textContent = (idx + 1) + ' / ' + total;
        page.appendChild(pageNumSpan);
      });
    })();
  </script>
</body>
</html>`;
}