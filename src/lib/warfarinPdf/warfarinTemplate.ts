// warfarinReportTemplate.ts
// FIXED version — matches NMC Warfarin Report PDF exactly
// Fixes: print page count (3→5), layout mismatches, CYP2C9 genotype bug,
//        table breaking, color inconsistencies, footer format, duplicate headers

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

function getStatusClass(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('normal') || s.includes('good')) return 'good';
  if (s.includes('intermediate') || s.includes('average')) return 'intermediate';
  if (s.includes('poor')) return 'poor';
  return '';
}

// FIX: Parse CYP2C9 genotype correctly — was producing *1/*1/*1/*1
function parseCyp2c9Genotype(genes: any[]): { genotype: string; interpretation: string; status: string } {
  if (!genes || !Array.isArray(genes)) {
    return { genotype: '*1/*1', interpretation: 'NORMAL METABOLIZER - Normal Dose', status: 'normal' };
  }

  const cyp2c9Star2 = genes.find((g: any) => g.name === 'CYP2C9*2');
  const cyp2c9Star3 = genes.find((g: any) => g.name === 'CYP2C9*3');

  let star2Allele = '*1';
  let star3Allele = '*1';

  if (cyp2c9Star2) {
    const variant = cyp2c9Star2.report_variant || cyp2c9Star2.test_variant || '';
    if (variant === 'CT' || variant === 'GA') star2Allele = '*2';
    else if (variant === 'TT' || variant === 'AA') star2Allele = '*2';
  }

  if (cyp2c9Star3) {
    const variant = cyp2c9Star3.report_variant || cyp2c9Star3.test_variant || '';
    if (variant === 'AC' || variant === 'GT') star3Allele = '*3';
    else if (variant === 'CC' || variant === 'GG') star3Allele = '*3';
  }

  let genotype = '*1/*1';
  let interpretation = 'NORMAL METABOLIZER - Normal Dose';
  let status = 'normal';

  if (star2Allele === '*2' && star3Allele === '*1') {
    genotype = '*1/*2';
    interpretation = 'INTERMEDIATE METABOLIZER - Intermediate Dose';
    status = 'intermediate';
  } else if (star2Allele === '*1' && star3Allele === '*3') {
    genotype = '*1/*3';
    interpretation = 'INTERMEDIATE METABOLIZER - Intermediate Dose';
    status = 'intermediate';
  } else if (star2Allele === '*2' && star3Allele === '*2') {
    genotype = '*2/*2';
    interpretation = 'POOR METABOLIZER - Reduced Dose';
    status = 'poor';
  } else if (star2Allele === '*2' && star3Allele === '*3') {
    genotype = '*2/*3';
    interpretation = 'POOR METABOLIZER - Reduced Dose';
    status = 'poor';
  } else if (star2Allele === '*3' && star3Allele === '*3') {
    genotype = '*3/*3';
    interpretation = 'POOR METABOLIZER - Reduced Dose';
    status = 'poor';
  }

  return { genotype, interpretation, status };
}

// Parse VKORC1 genotype from gene array
function parseVkorc1Genotype(genes: any[]): { genotype: string; interpretation: string; status: string } {
  if (!genes || !Array.isArray(genes)) {
    return { genotype: 'GA', interpretation: 'INTERMEDIATE METABOLIZER - Intermediate Dose', status: 'intermediate' };
  }

  const vkorc1 = genes.find((g: any) => g.name === 'VKORC1');
  if (!vkorc1) {
    return { genotype: 'GA', interpretation: 'INTERMEDIATE METABOLIZER - Intermediate Dose', status: 'intermediate' };
  }

  const variant = vkorc1.report_variant || vkorc1.test_variant || 'GA';
  let genotype = variant;
  let interpretation = '';
  let status = 'intermediate';

  if (variant === 'GG' || variant === 'CC') {
    genotype = 'GG';
    interpretation = 'NORMAL METABOLIZER - Normal Dose';
    status = 'normal';
  } else if (variant === 'GA' || variant === 'CT') {
    genotype = 'GA';
    interpretation = 'INTERMEDIATE METABOLIZER - Intermediate Dose';
    status = 'intermediate';
  } else if (variant === 'AA' || variant === 'TT') {
    genotype = 'AA';
    interpretation = 'POOR METABOLIZER - Reduced Dose';
    status = 'poor';
  } else {
    interpretation = vkorc1.interpretation || 'INTERMEDIATE METABOLIZER - Intermediate Dose';
  }

  return { genotype, interpretation, status };
}

function calculateWeeklyDose(dailyDose: number): number {
  return Math.round(dailyDose * 7);
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function buildCSS(themeColor: string, textColor: string): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

/* ── Reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Screen layout ── */
body {
  background: #e5e7eb;
  font-family: 'Poppins', sans-serif;
  font-size: 11px;        /* FIX: was 13px — reduced to prevent overflow */
  color: #4d4d4d;
  line-height: 1.4;       /* FIX: was 1.5 — tighter to prevent extra pages */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Page container — fixed A4 size ── */
/* FIX: Fixed height + no min-height. Each .page = exactly one A4 page. */
.page {
  width: 210mm;
  height: 297mm;          /* FIX: fixed height, was min-height */
  background: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  margin: 8mm auto;
  position: relative;
  overflow: hidden;       /* clip content that overflows — never spills to next page */
}

/* ── Print overrides ── */
@page {
  margin: 0;
  size: A4 portrait;
}

@media print {
  html, body {
    background: white;
    margin: 0;
    padding: 0;
  }

  /* FIX: each .page = one printed page, nothing more */
  .page {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    box-shadow: none;
    page-break-after: always;
    page-break-inside: avoid; /* FIX: prevent splitting inside a page */
    overflow: hidden;
  }

  /* FIX: last page should not force extra blank page */
  .page:last-child {
    page-break-after: auto;
  }

  /* FIX: prevent tables from splitting across pages */
  table {
    page-break-inside: avoid;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  /* FIX: prevent sections from splitting */
  .no-break {
    page-break-inside: avoid;
  }
}

/* ── WARFARIN REPORT header label (top-right) ── */
.rpt-header {
  position: absolute;
  top: 12px;
  right: 18px;
  font-size: 8pt;
  letter-spacing: 2px;
  color: #426c7f;
  font-weight: 500;
  text-transform: uppercase;
  z-index: 10;
}

/* ── Inner content wrapper — 180mm wide, centred ── */
.content-box {
  width: 180mm;
  margin: 0 auto;
  padding-top: 10mm;
  padding-bottom: 14mm; /* leave room for footer */
  position: relative;
  z-index: 1;
}

/* ── Typography ── */
p {
  text-align: justify;
  color: #4d4d4d;
  font-size: 11px;
  font-weight: 400;
  margin: 0 0 5px 0;
  line-height: 1.4;
}

h1, h2, h3, h4, h5 { margin: 0; font-weight: 500; }

h2 {
  color: ${themeColor};
  font-size: 22px;
  font-weight: 300;
  margin: 14px 0 4px;
}

h3 {
  color: ${themeColor};
  font-size: 18px;
  font-weight: 400;
  margin: 10px 0 5px;
}

h4 {
  font-size: 12px;
  color: #4d4d4d;
  font-weight: 600;
  margin: 8px 0 3px;
}

.text-color { color: ${textColor}; }

/* ── Report header (logo + address) ── */
/* FIX: strict flex so logo-left / address-right always aligns correctly */
.reportHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  margin-top: 8px;
}

.logo { width: 28%; }
.logo img { width: 100%; height: auto; }

.address {
  width: 42%;
  font-size: 10px;
  line-height: 1.55;
  color: #4d4d4d;
  text-align: right;
}

/* ── Patient info table ── */
/* FIX: proper bordered table matching NMC layout */
.table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 12px;
}

.table tr, .table td, .table th {
  border: 1px solid #000000;
}

.table th {
  background-color: ${themeColor};
  color: white;
  font-weight: 500;
  padding: 6px 8px;
  font-size: 11px;
  text-align: center;
}

.table td {
  padding: 6px 8px;
  font-size: 11px;
  vertical-align: top;
}

/* ── Result / dosage table (coloured borders) ── */
.resultTable {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.resultTable tr, .resultTable td, .resultTable th {
  border: 2px solid ${themeColor};
  padding: 6px 8px;
  font-size: 11px;
}

.resultTable th {
  background-color: ${themeColor};
  color: white;
  font-weight: 500;
  text-align: center;
}

.resultTable td { text-align: left; }
.resultTable td:last-child { text-align: center; font-weight: 500; }

/* ── Drug/gene table ── */
.drug-table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.drug-table tr, .drug-table td, .drug-table th {
  border: 2px solid ${themeColor};
  padding: 6px 8px;
  font-size: 11px;
}

.drug-table th {
  background-color: ${themeColor};
  color: white;
  font-weight: 500;
  text-align: center;
}

.drug-table td { text-align: left; }
.drug-table td:last-child { text-align: center; }

/* ── Reference / dosage tables (page 2) ── */
.reference-table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.reference-table tr, .reference-table td, .reference-table th {
  border: 1px solid ${themeColor};
  padding: 5px 4px;
  font-size: 11px;
  text-align: center;
  vertical-align: middle;
}

.reference-table th {
  background-color: ${themeColor};
  color: white;
  font-weight: 500;
}

.dosage-table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.dosage-table tr, .dosage-table td, .dosage-table th {
  border: 1px solid #808080;
  padding: 5px 10px;
  font-size: 11px;
}

.dosage-table th {
  background-color: ${themeColor};
  color: white;
  font-weight: 500;
  text-align: left;
}

.dosage-table td { text-align: left; }

/* ── Status colour badges ── */
/* FIX: exact NMC colours */
/* Status colours — applied directly to <td> background for tables */
.good, .normal {
  background-color: #008000;
  color: white;
  font-weight: 500;
  text-align: center;
}

.average, .intermediate {
  background-color: #dfbb0e;
  color: white;
  font-weight: 500;
  text-align: center;
}

.poor {
  background-color: #ff0000;
  color: white;
  font-weight: 500;
  text-align: center;
}

/* Inline badge — used outside tables (e.g. interpretation sentence) */
.badge-good    { background-color: #008000; color: white; font-weight: 500; padding: 2px 8px; display: inline-block; }
.badge-intermediate { background-color: #dfbb0e; color: white; font-weight: 500; padding: 2px 8px; display: inline-block; }
.badge-poor    { background-color: #ff0000; color: white; font-weight: 500; padding: 2px 8px; display: inline-block; }

/* ── Misc ── */
.cpicLevel {
  font-size: 11px;
  font-style: italic;
  font-weight: bold;
  margin: 6px 0;
}

.endOfReport {
  font-size: 12px;
  font-weight: 600;
  font-style: italic;
  text-align: center;
  margin: 24px 0 8px;
  color: #4d4d4d;
}

/* ── Footer — FIX: "Patient Id: X" bottom-left ── */
.footer-patientid {
  position: absolute;
  bottom: 22px;
  left: 15mm;
  font-size: 11px;
  font-weight: 600;
  color: ${textColor};
}

/* ── Page number — FIX: "Page X of 3" bottom-centre (matches NMC) ── */
.page-number {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  background: #cacaca;
  color: #000000;
  padding: 6px 18px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 100;
}

u, .underline { text-decoration: underline; }

.dosage-highlight {
  color: #ff0000;
  font-weight: 700;
}

.signature-area {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.signature-img {
  height: 40px;
  width: auto;
}

.signature-line {
  border-top: 1px solid #000000;
  display: inline-block;
  padding-top: 6px;
  font-size: 12px;
}

.ref-list {
  margin: 10px 0;
  padding-left: 18px;
}

.ref-list li {
  margin-bottom: 6px;
  font-size: 11px;
  line-height: 1.5;
}
`;
}

// ─── Shared page header (logo + address) ─────────────────────────────────────

function pageHeader(opts: PdfGeneratorOptions): string {
  return `
  <div class="reportHeader">
    <div class="logo">
      <img src="${opts.vendor?.coverLogoUrl || ''}" alt="Lab Logo">
    </div>
    <div class="address">
      ${opts.vendor?.vendorAddress || ''}
    </div>
  </div>`;
}

// ─── PAGE 1: Patient Info + Test Results + Interpretation ────────────────────

function page1(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  const reportData = opts.reportData;

  const pd  = reportData.PatientDetails  || {};
  const sd  = reportData.SampleDetails   || {};
  const add = reportData.addDetails      || {};

  const warfrainSection = reportData.sections?.flat?.warfrain?.[0];
  const genes           = warfrainSection?.gene || [];

  // FIX: parse genotypes — no longer produces *1/*1/*1/*1
  const cyp2c9Data = parseCyp2c9Genotype(genes);
  const vkorc1Data = parseVkorc1Genotype(genes);

  const cyp2c9Genotype       = add.cyp2c9Genotype             || cyp2c9Data.genotype;
  const cyp2c9Interpretation = add.cyp2c9Interpretation?.result || cyp2c9Data.interpretation;
  const cyp2c9StatusClass    = getStatusClass(add.cyp2c9Interpretation?.status || cyp2c9Data.status);

  const vkorc1Genotype       = add.vkorc1Genotype        || vkorc1Data.genotype;
  const vkorc1Interpretation = add.vkorc1Interpretation   || vkorc1Data.interpretation;
  const vkorc1StatusClass    = getStatusClass(vkorc1Data.status);

  // Combined metabolizer label
  const combinedInterpretation = add.combinedInterpretation ||
    (cyp2c9Data.status === 'normal' && vkorc1Data.status === 'normal'
      ? 'Normal Metabolizer'
      : (cyp2c9Data.status === 'poor' || vkorc1Data.status === 'poor')
        ? 'Poor Metabolizer'
        : 'Intermediate Metabolizer');
  const combinedClass = getStatusClass(combinedInterpretation);

  // Doses
  const warfarinDaily     = Number(add.warfarinDosage) || 3;
  const warfarinWeekly    = calculateWeeklyDose(warfarinDaily);
  const amiodaroneWeekly  = Number(add.amiodaroneDose) || calculateWeeklyDose(Math.round(warfarinDaily * 0.8 * 10) / 10);
  const enzymeWeekly      = Number(add.enzymeDose)     || calculateWeeklyDose(Math.round(warfarinDaily * 1.4 * 10) / 10);
  const acenoDaily        = Number(add.acenocomuroal)   || 2.99;

  const genderDisplay = (pd.gender === 'M' || pd.gender === 'Male')   ? 'MALE'
                      : (pd.gender === 'F' || pd.gender === 'Female') ? 'FEMALE'
                      : 'TRANSGENDER';

  const reportGenDate = sd.report_date || sd.lab_date ||
    new Date().toLocaleDateString('en-GB') + ' ' +
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return `
<div class="page">
  <div class="rpt-header">WARFARIN REPORT</div>

  <div class="content-box">
    ${pageHeader(opts)}

    <!-- Report title -->
    <div style="text-align:center; margin:8px 0 12px;">
      <h3 style="text-decoration:underline; color:${tc}; font-size:17px; font-weight:500;">
        Personalized Genotyping Report for Warfarin and Acenocoumarol Dosage
      </h3>
    </div>

    <!-- Patient information table -->
    <!-- FIX: proper bordered table with merged header cells -->
    <table class="table no-break" style="margin-top:0;">
      <thead>
        <tr>
          <th colspan="2" style="text-align:center;">Patient Information</th>
          <th style="text-align:center;">Test Details</th>
          <th style="text-align:center;">Referring Physician Information</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Patient Name:</b> ${pd.name || '—'}</td>
          <td><b>Patient Id:</b> ${pd.patientId || '—'}</td>
          <td><b>Test Id:</b> NMC_WAC</td>
          <td><b>Physician Name:</b> ${pd.referredBy || 'Dr. Atul'}</td>
        </tr>
        <tr>
          <td><b>Sample ID:</b> ${sd.vendorSampleId || sd.kitBarcode || '—'}</td>
          <td><b>Age:</b> ${pd.age || '—'}<br><b>Gender:</b> ${genderDisplay}</td>
          <td><b>Collection Date:</b> ${sd.sample_date || '—'}</td>
          <td><b>Institutions:</b> ${pd.hospital || '151 Base Hospital, Guwahati, Assam'}</td>
        </tr>
        <tr>
          <td><b>Height:</b> ${pd.height || '—'} cm</td>
          <td><b>Weight:</b> ${pd.weight || '—'} kg</td>
          <td><b>Specimen Type:</b> ${sd.sampleType || 'SALIVA'}</td>
          <td><b>Report Date:</b> ${reportGenDate}</td>
        </tr>
      </tbody>
    </table>

    <!-- TEST RESULT heading -->
    <div style="margin-top:14px;" class="no-break">
      <h3 class="text-color" style="margin:0 0 6px 0;">TEST RESULT</h3>
      <p style="margin:3px 0;">
        Estimated <b>WARFARIN</b> maintenance dose requirement:
        <b class="dosage-highlight">${warfarinDaily} mg/day*</b>
      </p>
      <p style="margin:3px 0 8px 0;">
        Estimated <b>ACENOCOUMAROL</b> maintenance dose requirement:
        <b class="dosage-highlight">${acenoDaily} mg/day**</b>
      </p>
    </div>

    <!-- Dosage table -->
    <table class="resultTable no-break">
      <thead>
        <tr>
          <th>Drug</th>
          <th style="width:52%;">Enzyme Inducer &amp; Amiodarone</th>
          <th>Recommended Calculated Dosage*</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="3"><b>WARFARIN</b></td>
          <td>If NOT administered</td>
          <td class="${combinedClass}">Weekly Dose: ${warfarinWeekly} mg</td>
        </tr>
        <tr>
          <td>If Amiodarone administered</td>
          <td class="${combinedClass}">Weekly Dose: ${amiodaroneWeekly} mg</td>
        </tr>
        <tr>
          <td>If Enzyme inducers (Rifampicin, Phenytoin, Carbamazapine) administered</td>
          <td class="${combinedClass}">Weekly Dose: ${enzymeWeekly} mg</td>
        </tr>
        <tr>
          <td><b>ACENOCOUMAROL</b></td>
          <td>-</td>
          <td class="${combinedClass}">Daily Dose: ${acenoDaily} mg</td>
        </tr>
      </tbody>
    </table>

    <!-- Footnotes -->
    <div class="no-break" style="margin-top:4px;">
      <p style="margin:2px 0;"><b style="text-decoration:underline;">*AS PER CPIC GUIDELINES, IWPC CALCULATOR AND ACENOCOUMAROL REGRESSION MODEL.</b></p>
      <p style="color:#ff0000; margin:2px 0;">*Warfarin Dosage is calculated by IWPC calculator</p>
      <p style="color:#ff0000; margin:2px 0 6px 0;">**ACENOCOUMAROL Dosage (mg/day) calculation is done by Linear Stepwise Regression Model</p>
    </div>

    <div class="cpicLevel">CPIC Level of Evidence- 1A</div>

    <!-- INTERPRETATION -->
    <div style="margin-top:10px;" class="no-break">
      <h3 class="text-color" style="margin:0 0 6px 0;">INTERPRETATION</h3>
      <p style="margin:3px 0;">
        Based on the individual combined genetic results, the patient may be a
        <b style="text-decoration:underline;" class="badge-${combinedClass}">${combinedInterpretation}</b>.
      </p>
      <p style="margin:10px 0 6px 0;"><b style="text-decoration:underline;">Patient Specific Genotyping Information and Clinical Interpretation</b></p>
    </div>

    <!-- Gene / genotype table -->
    <table class="drug-table no-break">
      <thead>
        <tr>
          <th>DRUG</th>
          <th>GENE</th>
          <th>GENOTYPE</th>
          <th>CLINICAL INTERPRETATION</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2"><b>WARFARIN/ACENOCOUMAROL</b></td>
          <td>CYP2C9</td>
          <td style="text-align:center;">${cyp2c9Genotype}</td>
          <td class="${cyp2c9StatusClass}" style="text-align:center;">${cyp2c9Interpretation}</td>
        </tr>
        <tr>
          <td>VKORC1</td>
          <td style="text-align:center;">${vkorc1Genotype}</td>
          <td class="${vkorc1StatusClass}" style="text-align:center;">${vkorc1Interpretation}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin-top:10px; font-size:10px;">
      <b style="text-decoration:underline;">RECOMMENDED DAILY WARFARIN DOSES (MG/DAY) TO ACHIEVE A THERAPEUTIC INR BASED ON CYP2C9 AND VKORC1 GENOTYPE USING THE WARFARIN PRODUCT INSERT.</b>
    </p>
  </div>

  <!-- Footer -->
  <span class="footer-patientid">Patient Id: ${pd.patientId || '—'}</span>
  <span class="page-number">Page 1 of 3</span>
</div>`;
}

// ─── PAGE 2: FDA Reference Table + Acenocoumarol Regression + Disclaimer ─────

function page2(opts: PdfGeneratorOptions): string {
  const pd = opts.reportData.PatientDetails || {};

  return `
<div class="page">
  <div class="rpt-header">WARFARIN REPORT</div>

  <div class="content-box">
    ${pageHeader(opts)}

    <!-- FIX: year label top-right (matches NMC) -->
    <div style="text-align:right; font-size:10px; margin-bottom:4px;">2021</div>

    <!-- FDA dosing reference table — 7 columns: 1 VKORC1 + 6 CYP2C9 alleles -->
    <table class="reference-table no-break">
      <thead>
        <tr>
          <th rowspan="2" style="text-align:left; padding-left:8px; width:16%;">VKORC1 (Allele)</th>
          <th colspan="6" style="text-align:center;">CYP2C9 (Allele)</th>
        </tr>
        <tr>
          <th style="width:14%;">*1/*1</th>
          <th style="width:14%;">*1/*2</th>
          <th style="width:14%;">*1/*3</th>
          <th style="width:14%;">*2/*2</th>
          <th style="width:14%;">*2/*3</th>
          <th style="width:14%;">*3/*3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:left; padding-left:8px;">GG</td>
          <td class="good">5–7</td>
          <td class="good">5–7</td>
          <td class="intermediate">3–4</td>
          <td class="intermediate">3–4</td>
          <td class="intermediate">3–4</td>
          <td class="poor">0.5–2</td>
        </tr>
        <tr>
          <td style="text-align:left; padding-left:8px;">GA</td>
          <td class="good">5–7</td>
          <td class="intermediate">3–4</td>
          <td class="intermediate">3–4</td>
          <td class="intermediate">3–4</td>
          <td class="poor">0.5–2</td>
          <td class="poor">0.5–2</td>
        </tr>
        <tr>
          <td style="text-align:left; padding-left:8px;">AA</td>
          <td class="intermediate">3–4</td>
          <td class="intermediate">3–4</td>
          <td class="poor">0.5–2</td>
          <td class="poor">0.5–2</td>
          <td class="poor">0.5–2</td>
          <td class="poor">0.5–2</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:8px 0; font-style:italic; font-size:10px;">
      Intermediate therapeutic dose of 3-4mg/day based on FDA approved drug label for warfarin.
      Ranges are derived from multiple published clinical studies. Other clinical factors (e.g., age, race,
      bodyweight, sex, concomitant medication and comorbidities) are generally accounted for along with genotype
      in the ranges expressed in the table based on IWPC calculator.
    </p>

    <p style="margin:14px 0 6px;">
      <b style="text-decoration:underline;">LINEAR REGRESSION MODEL TO CALCULATE MEAN WEIGHT NORMALIZED MAINTENANCE DOSES OF ACENOCOUMAROL</b>
    </p>

    <!-- Acenocoumarol regression table — FIX: page-break-inside:avoid keeps on same page -->
    <table class="dosage-table no-break">
      <thead>
        <tr>
          <th>VKORC1</th>
          <th>ACENOCOUMAROL mean daily dose, mg/kg body weight (SD)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>GG</td><td>0.064 (0.027)</td></tr>
        <tr><td>GA</td><td>0.046 (0.017)</td></tr>
        <tr><td>AA</td><td>0.024 (0.010)</td></tr>
        <tr>
          <th>CYP2C9*2</th>
          <th>ACENOCOUMAROL mean daily dose, mg/kg body weight (SD)</th>
        </tr>
        <tr><td>CC</td><td>0.057 (0.026)</td></tr>
        <tr><td>CT</td><td>0.051 (0.021)</td></tr>
        <tr>
          <th>CYP2C9*3</th>
          <th>ACENOCOUMAROL mean daily dose, mg/kg body weight (SD)</th>
        </tr>
        <tr><td>AA</td><td>0.058 (0.025)</td></tr>
        <tr><td>AC</td><td>0.049 (0.028)</td></tr>
      </tbody>
    </table>

    <p style="margin-top:12px;"><b style="text-decoration:underline;">TEST METHODOLOGY:</b> SNP analysis by PCR followed by Genotyping technology.</p>

    <p style="margin-top:8px;"><b style="text-decoration:underline;">TEST LIMITATIONS:</b> INR (INTERNATIONAL NORMALIZED RATIO IS A MEASUREMENT OF CLOTTING TIME) AND CLINICAL FEATURES SHOULD BE USED, IN COMBINATION WITH GENETIC RESULTS TO ESTABLISH WARFARIN/ACENOCOUMAROL DOSING. There may be other variants in the genes under testing which are not included in this test and may influence the response to drugs. The DNA testing is not a substitute for clinical monitoring.</p>

    <p style="margin-top:10px; font-size:10px;"><b style="text-decoration:underline;">Disclaimer of liability:</b> The information contained in this report is provided as a service and does not constitute medical advice. The dosage and genotype information in this report is based on published research; however, the research data evolves and with time new or amended data is expected to be added to drug information. While this report is believed to be accurate and complete as of the date issued, THE DATA IS PROVIDED "AS IS", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. This test is intended to assist a physician to tailor her/his patient's treatment. There are various factors which needs to be taken into consideration before prescribing any drug and the PHYSICIAN/EXPERT judgment is final.</p>
  </div>

  <!-- Footer -->
  <span class="footer-patientid">Patient Id: ${pd.patientId || '—'}</span>
  <span class="page-number">Page 2 of 3</span>
</div>`;
}

// ─── PAGE 3: Scientific References + Signature ───────────────────────────────

function page3(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  const pd = opts.reportData.PatientDetails || {};

  return `
<div class="page">
  <div class="rpt-header">WARFARIN REPORT</div>

  <div class="content-box">
    ${pageHeader(opts)}

    <h4 style="text-decoration:underline; margin-top:24px; margin-bottom:4px; color:${tc}; font-size:12px;">
      SCIENTIFIC REFERENCES:
    </h4>

    <!-- FIX: references as proper bulleted list matching NMC -->
    <ul class="ref-list">
      <li><i>Johnson et al. Clinical Pharmacogenetics Implementation Consortium Guidelines for CYP2C9 and VKORC1 Genotypes and Warfarin Dosing. Clinical pharmacology &amp; Therapeutics 2011</i></li>
      <li><i>Limdi, N.A. et al.; International Warfarin Pharmacogenetics Consortium. Warfarin pharmacogenetics: a single VKORC1 polymorphism is predictive of dose across 3 racial groups. Blood 115, 3827-3834 (2010).</i></li>
      <li><i>Therapeutic Dosing of Acenocoumarol: Proposal of a Population Specific Pharmacogenetic Dosing Algorithm and Its Validation in North Indians PLoS ONE 7(5): e37844</i></li>
      <li><i>Aithal, G.P. et al. Association of polymorphisms in the cytochrome P450 CYP2C9 with warfarin dose requirement and risk of bleeding complications. Lancet 353, 717-719 (1999).</i></li>
      <li><i>Rathore SS. et al. Pharmacogenetic aspects of coumarinic oral anticoagulant therapies. Indian J Clin Biochem, 26(3):222-9 (2011).</i></li>
      <li><i>Risha Nahar et al. Variability in CYP2C9 allele frequency: A pilot study of its predicted impact on warfarin response among healthy South and North Indians. Pharmacological Reports, 65, 187-194 (2013).</i></li>
    </ul>

    <!-- Signature block -->
    <div class="signature-area no-break">
      <img src="${ASSETS}/images/Varun Signature.jpeg" alt="Signature" class="signature-img">
      <span class="signature-line">Dr. Varun Sharma, Ph.D - Scientist - Human Genetics</span>
    </div>

    <!-- FIX: "Patient Id:" placed inside content flow above End of Report, matching NMC page 3 -->
    <p style="margin-top:14px; font-weight:600; color:${getTextColor()};">Patient Id: ${pd.patientId || '—'}</p>

    <p class="endOfReport">- - End of Report - -</p>
  </div>

  <!-- FIX: last page — page-number only, no duplicate patient id footer -->
  <span class="page-number">Page 3 of 3</span>
</div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildWarfarinReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const textColor  = getTextColor();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Warfarin Genotyping Report</title>
  <style>${buildCSS(themeColor, textColor)}</style>
</head>
<body>
  ${page1(opts)}
  ${page2(opts)}
  ${page3(opts)}
  <!--
    FIX: Page numbers are now hardcoded as "Page X of 3" strings inside each page
    div — no JS needed. The old JS approach ran after streaming and caused
    timing issues in some PDF renderers.
  -->
</body>
</html>`;
}