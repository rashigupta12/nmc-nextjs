// ============================================================
// Clopidogrel Report — Complete HTML Template Generator
// Based on PHP reportPages.php template
// Theme color: #1F487C (Deep blue) | Font: Poppins
// ============================================================

import { PdfGeneratorOptions } from '../reportEngine/types';

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

// Status color class for CSS
function getStatusClass(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('extensive') || s.includes('ultra')) return 'extensive ultra';
  if (s.includes('intermediate')) return 'intermediate';
  if (s.includes('poor')) return 'poor';
  return '';
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

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
.bg-color, .resultTable th, .reference-table th { background-color: ${themeColor}; color: white; }

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

.reference-table tbody tr:nth-child(1),
.reference-table tbody tr:nth-child(2) { background: #81c784; }
.reference-table tbody tr:nth-child(3) { background: #ffcc80; }
.reference-table tbody tr:nth-child(4) { background: #e57373; }

/* Status Colors */
.extensive, .ultra { color: green; }
.intermediate { color: #dfbb0e; }
.poor { color: red; }

/* Report Header */
.reportHeader {
  display: flex;
  justify-content: space-between;
  height: 100px;
  margin-top: 60px;
  margin-bottom: 60px;
}
.logo { width: 28%; }
.nabl { margin: auto; width: 10%; }
.qrCode { margin: auto; width: 10%; }
.address { width: 40%; font-size: 14px; }

.cpicLevel {
  font-size: 12px;
  font-style: italic;
  font-weight: bold;
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
}

.footer-text {
  position: absolute;
  bottom: 25px;
  font-size: 12px;
  font-weight: 600;
  left: 50px;
}

/* Profile Table */
.profile-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.profile-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  vertical-align: top;
}
.profile-table td:first-child {
  background: ${themeColor};
  color: white;
  font-weight: 600;
  width: 40%;
}
.profile-table td:last-child {
  background: #f0f0f0;
}

/* Page numbering */
.page-number {
  font-size: 14px;
  position: absolute;
  left: 104mm;
  bottom: 0;
  z-index: 1000;
  background: #cacaca;
  color: black;
  padding: 10px 15px;
}
`;
}

// ─── Reusable fragments ───────────────────────────────────────────────────────

function rptHeader(title = 'CLOPIDOGREL REPORT'): string {
  return `<div class="rpt-header">${title}</div>`;
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

// Page 1: Patient Information + Test Results
function page1(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  const reportData = opts.reportData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd = (reportData?.PatientDetails || {}) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sd = (reportData?.SampleDetails || {}) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addDetails = (reportData?.addDetails || {}) as any;

  const status = addDetails.status || '—';
  const statusClass = getStatusClass(status);
  const reportGenDate = sd.report_date || '—';
  const sampleCollDate = sd.sample_date || '—';

  return `
  <div class="page backImg" style="page-break-after:always;">
    ${rptHeader()}
    <div class="content-box">
      <!-- Report Header with Logo and Address -->
      <div class="reportHeader">
        <div class="logo"><img src="${opts.vendor?.coverLogoUrl || ''}" alt="logo" style="width:100%;"></div>
        <div class="address">
          ${opts.vendor?.vendorAddress ? `<p style="margin:0;">${opts.vendor.vendorAddress}</p>` : ''}
        </div>
      </div>

      <!-- Patient Profile -->
      <div style="width:100%;text-align:center">
        <div style="margin-top:20px">
          <h3 style="text-decoration:underline;color:${tc}">Personalized Genotyping Report for Clopidogrel Sensitivity</h3>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th colspan="2">Patient Information</th>
            <th>Test Details</th>
            <th>Referring Physician Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Patient Name:</b> <span>${pd.name || '—'}</span></td>
            <td><b>Patient Id:</b> ${pd.patientId || '—'}</td>
            <td><b>Test Id:</b> NMC_CLOPI</td>
            <td><b>Physician Name:</b> ${pd.referredBy || '—'}</td>
          </tr>
          <tr>
            <td><b>Sample ID:</b> ${sd.vendorSampleId || '—'}</td>
            <td>
              <b>Age:</b> ${pd.age || '—'}<br>
              <b>Gender:</b> ${pd.gender === 'M' ? 'MALE' : pd.gender === 'F' ? 'FEMALE' : 'TRANSGENDER'}
            </td>
            <td><b>Collection Date:</b> ${sampleCollDate}</td>
            <td><b>Institution:</b> ${pd.hospital || '—'}</td>
          </tr>
          <tr>
            <td><b>Height:</b> ${pd.height || '—'} cm</td>
            <td><b>Weight:</b> ${pd.weight || '—'} kg</td>
            <td><b>Specimen Type:</b> ${sd.sampleType || '—'}</td>
            <td><b>Report Date:</b> ${reportGenDate}</td>
          </tr>
        </tbody>
      </table>

      <!-- Result Section -->
      <div style="margin-top:40px;">
        <h3 class="text-color" style="margin:2rem 0 8px 0">TEST RESULT</h3>
        <p style="margin-top:0">Based on combined genotype results, the individual may be an <span class="${statusClass}">${status}</span>.</p>
      </div>

      <table class="resultTable">
        <thead>
          <tr>
            <th>Drug</th>
            <th style="width:190px">Drug Response Status</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Clopidogrel</b></td>
            <td class="${statusClass}">${status}</td>
            <td>${addDetails.recommendation || '—'}</td>
          </tr>
        </tbody>
      </table>

      <!-- Interpretation Section -->
      <div style="margin-top:30px;">
        <h3 class="text-color" style="margin:2rem 0 8px 0">INTERPRETATION</h3>
        <p style="margin-top:0">Patient Specific Genotyping Information and Corresponding Drug Response information:</p>
      </div>

      <table class="drug-table">
        <thead>
          <tr>
            <th>DRUG</th>
            <th style="width:150px">GENE</th>
            <th>REFERENCE GENOTYPE</th>
            <th>OBSERVED GENOTYPE</th>
            <th>COMBINED GENOTYPE RESULT</th>
            <th>PHENOTYPE INTERPRETED*</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="3"><b>Clopidogrel</b></td>
            <td>CYP2C19 *2</td>
            <td>GG</td>
            <td>${addDetails.cyp2c19_2 || '—'}</td>
            <td rowspan="3">${addDetails.combinedGenotype || '—'}</td>
            <td rowspan="3" class="${statusClass}"><b>${status}</b></td>
          </tr>
          <tr>
            <td>CYP2C19 *3</td>
            <td>GG</td>
            <td>${addDetails.cyp2c19_3 || '—'}</td>
          </tr>
          <tr>
            <td>CYP2C19 *17</td>
            <td>CC</td>
            <td>${addDetails.cyp2c19_17 || '—'}</td>
          </tr>
        </tbody>
      </table>

      <p><i><b>*As per CPIC guidelines, see below reference table</b></i></p>
      <p class="text-color">${addDetails.recommendation || '—'}</p>
      <div class="cpicLevel">CPIC Level of Evidence- 1A</div>

      <p class="text-color footer-text">Patient Id: ${pd.patientId || '—'}</p>
    </div>
  </div>`;
}

// Page 2: Reference Table + Disclaimers
function page2(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  const reportData = opts.reportData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd = (reportData?.PatientDetails || {}) as any;

  return `
  <div class="page backImg" style="page-break-after:always;">
    ${rptHeader()}
    <div class="content-box">
      <!-- Report Header -->
      <div class="reportHeader">
        <div class="logo"><img src="${opts.vendor?.coverLogoUrl || ''}" alt="logo" style="width:100%;"></div>
        <div class="address">
          ${opts.vendor?.vendorAddress ? `<p style="margin:0;">${opts.vendor.vendorAddress}</p>` : ''}
        </div>
      </div>

      <!-- Reference Table -->
      <table class="reference-table" style="margin-top:20px;">
        <thead>
          <tr>
            <th style="width:190px">Allele Combinations</th>
            <th style="width:275px">Implications</th>
            <th>Recommendations</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>*1/*17, *17/*17 (UM)</td>
            <td>Increased platelet inhibition; decreased residual platelet aggregation</td>
            <td>Clopidogrel - label recommended dosage and administration</td>
          </tr>
          <tr>
            <td>*1/*1 (EM)</td>
            <td>Normal platelet inhibition; Normal residual platelet aggregation</td>
            <td>Clopidogrel - label recommended dosage and administration</td>
          </tr>
          <tr>
            <td>*1/*2, *1/*3 and *2/*17 (IM)</td>
            <td>Reduced platelet inhibition; Increased residual platelet aggregation; Increased risk for adverse cardiovascular events</td>
            <td>Alternative antiplatelet therapy e.g., prasugrel, ticagrelor (If no contraindication).</td>
          </tr>
          <tr>
            <td>*2/*2, *2/*3 and *3/*3 (PM)</td>
            <td>Significantly reduced platelet inhibition; Increased residual platelet aggregation; Increased risk for adverse cardiovascular event</td>
            <td>Alternative antiplatelet therapy e.g., prasugrel, ticagrelor (If no contraindication)</td>
          </tr>
        </tbody>
      </table>

      <p><b>UM: Ultra Metabolizer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         EM: Extensive Metabolizer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         IM: Intermediate Metabolizer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         PM: Poor Metabolizer</b></p>

      <p><b style="text-decoration:underline">TEST METHODOLOGY:</b> SNP analysis by PCR followed by Genotyping technology.</p>

      <p><b style="text-decoration:underline">TEST LIMITATIONS:</b> There may be other variants in the genes under testing which are not included in this test and may influence the response to drugs. The DNA testing is not a substitute for clinical monitoring.</p>

      <p><b style="text-decoration:underline">DISCLAIMER OF LIABILITY:</b> The information contained in this report is provided as a service and does not constitute medical advice. The information in this report is based on published research; however, the research data evolves and with time new or amended data is expected to be added to drug information. While this report is believed to be accurate and complete as of the date issued, THE DATA IS PROVIDED "AS IS", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. This test is intended to assist a physician to tailor her/his patient's treatment. There are various factors which needs to be taken into consideration before prescribing any drug and the PHYSICIAN/EXPERT judgment is final.</p>

      <!-- Scientist Signature -->
      <div style="margin-top:40px;">
        <div style="display:flex;align-items:center;gap:15px;">
          <img src="${ASSETS}/nmc_report_img/signature.png" alt="Signature" style="height:40px;width:auto;">
          <p style="border-top:1px solid #000;display:inline-block;padding-top:5px;">Scientist / Authorized Signatory</p>
        </div>
      </div>

      <p class="text-color footer-text" style="display:flex;justify-content:space-between;width:100%;left:50px;right:50px;">
        <span>Patient Id : ${pd.patientId || '—'}</span>
        <span style="position:absolute;left:50%;transform:translateX(-50%);">Page 2 of 3</span>
      </p>
    </div>
  </div>`;
}

// Page 3: Scientific References
function page3(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  const reportData = opts.reportData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd = (reportData?.PatientDetails || {}) as any;

  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div class="content-box">
      <!-- Report Header -->
      <div class="reportHeader">
        <div class="logo"><img src="${opts.vendor?.coverLogoUrl || ''}" alt="logo" style="width:100%;"></div>
        <div class="address">
          ${opts.vendor?.vendorAddress ? `<p style="margin:0;">${opts.vendor.vendorAddress}</p>` : ''}
        </div>
      </div>

      <h4 style="text-decoration:underline; margin-top:1rem;color:${tc}">SCIENTIFIC REFERENCES:</h4>
      <ul>
        <li>
          <i>
            Genetic polymorphisms of cyp2c19 influences the response to clopidogrel in ischemic heart disease patients in the south india n tamilian population. European journal of clinical pharmacology. 2013. Subraja k, et al.
          </i>
        </li>
        <li>
          <i>
            CYP2C19 poor metabolizer is associated with clinical outcome of clopidogrel therapy in acute myocardial infarction but not stable angina. Circulation. Cardiovascular genetics. 2013. Kim ho-sook, et al.
          </i>
        </li>
        <li>
          <i>
            The effect of CYP2C19 genotype on the time course of platelet aggregation inhibition after clopidogrel administration. Journal of clinical pharmacology. 2013. Kim Ho-Sook, et al.
          </i>
        </li>
        <li>
          <i>
            United States Food and Drug Administration. HIGHLIGHTS OF PRESCRIBING INFORMATION. [Web-based PDF] May 2018. <a href="https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/020839s070lbl.pdf">https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/020839s070lbl.pdf</a>
          </i>
        </li>
        <li>
          <i>
            CPIC Guidelines for Guideline for Clopidogrel and CYP2C19: Updated on November 2017: <a href="https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/">https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/</a>
          </i>
        </li>
      </ul>

      <p class="endOfReport" style="margin-top:60px;">- -End of Report - -</p>

      <p class="text-color footer-text">Patient Id: ${pd.patientId || '—'}</p>
    </div>
  </div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildClopidogrelReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const textColor = getTextColor();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Clopidogrel Genotyping Report</title>
  <style>${buildCSS(themeColor, textColor)}</style>
</head>
<body>
  <!-- Page 1: Patient Info + Results -->
  ${page1(opts)}
  
  <!-- Page 2: Reference Table + Disclaimers -->
  ${page2(opts)}
  
  <!-- Page 3: Scientific References -->
  ${page3(opts)}

  <script>
    (function() {
      var pages = document.querySelectorAll('.page');
      var total = pages.length;
      pages.forEach(function(page, index) {
        var span = document.createElement('span');
        span.style.cssText = 'font-size:14px;position:absolute;left:104mm;bottom:0;z-index:1000;background:#cacaca;color:black;padding:10px 15px;';
        span.textContent = (index + 1) + '/' + total;
        page.appendChild(span);
      });
    })();
  </script>
</body>
</html>`;
}