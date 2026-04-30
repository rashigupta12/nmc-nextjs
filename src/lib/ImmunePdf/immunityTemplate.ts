// ============================================================
// Immunity Report — HTML Template Generator
// Images corrected to exactly match PHP view image paths
// Theme color: #83f3b4 (mint green) | Font: Poppins
// ============================================================

import { ConditionData, ImmunityApiResponse, GeneData } from '@/services/immunityReportService';
import { PdfGeneratorOptions } from '@/types/immunityReport.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/**
 * ASSETS base – resolves to the public folder root (same as base_url() in PHP).
 * All image paths below are relative to this, matching the PHP `base_url('assets/...')` calls.
 */
const ASSETS = `${BASE_URL}`;

// ─── Image path registry  (matches PHP base_url('assets/...') exactly) ────────

const IMG = {
  // ── Gauge / status icons ──────────────────────────────────────────────────
  good:    `${ASSETS}/reportimg/imunity/good.png`,
  average: `${ASSETS}/reportimg/imunity/average.png`,
  poor:    `${ASSETS}/reportimg/imunity/poor.png`,

  // ── Cover / back cover ────────────────────────────────────────────────────
  coverPage:   `${ASSETS}/reportimg/imunity/coverPage.jpg`,
  lastPage:    `${ASSETS}/reportimg/imunity/Last Page.jpg`,

  // ── Profile / welcome / intro shared ─────────────────────────────────────
  signature:   `${ASSETS}/reportimg/imunity/signature.png`,

  // ── Introduction pages ────────────────────────────────────────────────────
  dna1:          `${ASSETS}/reportimg/dna1.png`,
  geneMutation:  `${ASSETS}/reportimg/genemutation.png`,
  geneMutationJpg: `${ASSETS}/reportimg/genemutation.jpg`,

  // ── Immunity intro pages ──────────────────────────────────────────────────
  immunityBg:     `${ASSETS}/reportimg/imunity/Page 9 image.jpg`,
  innateStage1:   `${ASSETS}/reportimg/imunity/Page 10_Immunity Stage.png`,
  innateStage2:   `${ASSETS}/reportimg/imunity/Page 10_Immunity Stage2.png`,

  // ── Table of Contents ─────────────────────────────────────────────────────
  tocDetox:        `${ASSETS}/reportimg/imunity/table_Detox.jpg`,
  tocMicronutrient:`${ASSETS}/reportimg/imunity/Micronutrient_table.jpg`,
  tocImmunogenomic:`${ASSETS}/reportimg/imunity/IMMUNOGENOMIC_table.jpg`,

  // ── Section cover pages ───────────────────────────────────────────────────
  detoxSectionCover:        `${ASSETS}/reportimg/imunity/Page 19_Detox.jpg`,
  micronutrientSectionCover:`${ASSETS}/reportimg/imunity/Micronutrient_cover.jpg`,
  immunogenomicSectionCover:`${ASSETS}/reportimg/imunity/IMMUNOGENOMIC_cover.jpg`,

  // ── Detoxification ────────────────────────────────────────────────────────
  liverDetox:      `${ASSETS}/reportimg/imunity/Liver-Detoxification.jpg`,
  detoxPhase1:     `${ASSETS}/reportimg/imunity/detox_phase1_img.jpg`,
  detoxPhase2:     `${ASSETS}/reportimg/imunity/phase2-detox.jpg`,
  oxidativeStress: `${ASSETS}/reportimg/imunity/oxidative_stress.jpg`,
  oxidativeImg2:   `${ASSETS}/reportimg/imunity/oxidative_img2.jpg`,

  // ── Micronutrients – condition header images ──────────────────────────────
  // These match PHP: base_url("/reportimg/header (N).jpg")
  vitaminA:   `${ASSETS}/reportimg/header (9).jpg`,
  vitaminB6:  `${ASSETS}/reportimg/header (1).jpg`,
  vitaminB9:  `${ASSETS}/reportimg/header (2).jpg`,
  vitaminB12: `${ASSETS}/reportimg/header (3).jpg`,
  vitaminC:   `${ASSETS}/reportimg/header (4).jpg`,
  vitaminD:   `${ASSETS}/reportimg/header (5).jpg`,
  vitaminE:   `${ASSETS}/reportimg/header (6).jpg`,
  vitaminK:   `${ASSETS}/reportimg/header (7).jpg`,
  magnesium:  `${ASSETS}/reportimg/header (8).jpg`,
  iron:       `${ASSETS}/reportimg/header (10).jpg`,
  selenium:   `${ASSETS}/reportimg/header (12).jpg`,
  omega3:     `${ASSETS}/reportimg/header (13).jpg`,

  // ── Micronutrients – intro illustration ──────────────────────────────────
  micronutrientsAbout: `${ASSETS}/reportimg/imunity/Micronutrients_About.jpg`,

  // ── DNA icon (used in recommendation rows) ────────────────────────────────
  dnaIcon: `${ASSETS}/reportimg/imunity/dna_icon.png`,

  // ── Quote decorations (last page) ────────────────────────────────────────
  quote: `${ASSETS}/reportimg/imunity/quote.png`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#83f3b4';
}

function formatDate(raw: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-GB');
}

function today(): string {
  return new Date().toLocaleDateString('en-GB');
}

/** Returns an <img> tag for the gauge image matching PHP strtolower($status).'.png' */
function gaugeImg(status: string, width = 50): string {
  const s = (status || 'good').toLowerCase();
  const key = s === 'poor' ? 'poor' : s === 'average' ? 'average' : 'good';
  return `<img src="${(IMG as any)[key]}" width="${width}" alt="${key}" style="display:block;"/>`;
}

/** Colored status text for summary tables */
function statusColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'good')    return '#22c55e';
  if (s === 'average') return '#f59e0b';
  return '#ef4444';
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function buildCSS(themeColor: string): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  background: #e0e0e0;
  font-size: 14px;
  color: rgb(77,77,77);
}

.page {
  box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
  margin: 5mm auto;
  width: 210mm;
  min-height: 297mm;
  background-color: white;
  position: relative;
  page-break-after: always;
  overflow: hidden;
}

@page { margin: 0; size: 210mm 297mm; }
@media print {
  body { background: white; }
  .page { margin: 0; box-shadow: none; width: 100%; min-height: 100vh; }
}

/* ── Header ── */
.rpt-header {
  position: absolute;
  top: 14px; right: 20px;
  font-size: 9pt;
  letter-spacing: 2px;
  color: #426c7f;
  font-weight: 500;
  text-transform: uppercase;
  z-index: 10;
}

/* ── Content box ── */
.content-box {
  margin: 0 auto;
  width: 180mm;
  position: relative;
  z-index: 1;
}

/* ── Typography ── */
p {
  text-align: justify;
  color: rgb(77,77,77);
  font-size: 13px;
  font-weight: 400;
  margin: 0 0 8px 0;
  line-height: 20px;
}

h1, h2, h3, h4, h5 { margin: 0; }
h2 { color: ${themeColor}; font-size: 28px; font-weight: 300; margin: 18px 0 5px; }
h3 { color: ${themeColor}; font-size: 22px; font-weight: 400; margin: 14px 0 6px; }
h4 { font-size: 14px; color: rgb(77,77,77); font-weight: 600; margin: 10px 0 4px; }

ul { padding: 0; list-style: none; }
ul li {
  text-align: justify; color: rgb(77,77,77); font-size: 13px;
  font-weight: 400; position: relative; margin-left: 20px; margin-bottom: 4px;
}
ul li::before {
  content: "•"; font-size: 13pt;
  position: absolute; top: 0; left: -20px;
  color: ${themeColor};
}

ol { padding-left: 18px; }
ol li { font-size: 13px; color: rgb(77,77,77); margin-bottom: 6px; }

table { width: 100%; border-collapse: collapse; }

/* ── Profile tables ── */
.profile-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.profile-table tr td {
  padding: 9px 12px;
  font-size: 12px;
  letter-spacing: 0.5px;
  vertical-align: middle;
}
.profile-table tr td:first-child {
  background: ${themeColor};
  color: #fff;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  width: 48%;
}
.profile-table tr td:last-child {
  background: #f0f0f0;
  color: #595858;
  width: 52%;
  padding-left: 16px;
}
.profile-table tr:not(:last-child) td { border-bottom: 2px solid white; }

/* ── Summary tables ── */
.summary-heading {
  background: ${themeColor};
  color: #000;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 25px;
  margin-bottom: 14px;
  display: block;
}
.summary-heading2 {
  background: ${themeColor};
  color: #000;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 20px;
  margin: 12px 0 6px;
  display: block;
}
.summary-sub-header {
  color: ${themeColor};
  font-weight: 600;
  font-size: 13px;
  margin: 10px 0 4px;
}
.summaryTable { width: 100%; border-collapse: collapse; }
.summaryTable .border { border-bottom: 1px solid #e5e5e5; }
.summaryTable td { padding: 6px 15px; font-size: 12px; vertical-align: middle; }
.summaryTable td.text-bl { color: rgb(77,77,77); }
.summaryTable td.good    { color: #22c55e; font-weight: 600; }
.summaryTable td.average { color: #f59e0b; font-weight: 600; }
.summaryTable td.poor    { color: #ef4444; font-weight: 600; }

/* ── Gene variants table (matches PHP .gene-varients) ── */
.gene-varients { width: 100%; border-collapse: collapse; }
.gene-varients td { vertical-align: top; padding: 6px 8px; }
.gene-Id-style {
  background: ${themeColor};
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #000;
}
.gene-Id-style span { display: block; font-size: 11px; font-weight: 700; color: #000; }
.gene-Id-style2 {
  background: #e8e8e8;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  color: rgb(77,77,77);
  border-bottom: 1px solid #bbb;
  margin-bottom: 6px;
}
.gene-Id-style2 span { font-size: 13px; font-weight: 700; color: rgb(77,77,77); }

/* ── Response table (matches PHP .response) ── */
.response { width: 100%; border-collapse: collapse; margin-top: 4px; }
.response td { vertical-align: top; padding: 10px 12px; }
.response td:first-child { background: #e8e8e8; width: 30%; text-align: center; }
.response td:last-child  { background: ${themeColor}; width: 70%; }
.response h4 { font-size: 13px; font-weight: 700; color: #000; border-bottom: 1px solid rgba(0,0,0,0.2); padding-bottom: 5px; margin-bottom: 8px; }
.response p  { font-size: 12px; color: rgb(77,77,77); line-height: 18px; margin: 0; }
.response td.rImage { background: ${themeColor}; }

/* ── Header image box (matches PHP immune_profile_header_box) ── */
.cond-header-wrap { position: relative; margin-bottom: 12px; }
.cond-header-img  { width: 100%; height: 160px; object-fit: cover; object-position: center; display: block; }
.cond-title-box   {
  position: absolute; top: 0; left: 0;
  background: white; padding: 5px 14px; max-width: 60%;
}
.cond-title-box h3 { color: ${themeColor}; font-size: 18px; font-weight: 700; margin: 0; }

/* ── TOC list ── */
.table-list { list-style: decimal; padding-left: 18px; margin: 0; }
.table-list li {
  display: flex; justify-content: space-between;
  font-size: 12px; color: rgb(77,77,77); padding: 3px 0;
  margin-left: 0;
}
.table-list li::before { content: none; }
.table-con-heading {
  display: block; background: rgba(0,0,0,0.35);
  color: white; font-weight: 600; font-size: 13px;
  padding: 2px 8px; position: absolute; bottom: 8px; left: 10px;
}

/* ── Section cover ── */
.section-cover-wrap { position: relative; width: 100%; height: 297mm; }
.section-cover      { width: 100%; height: 297mm; object-fit: cover; display: block; }
.section-cover-label {
  position: absolute; bottom: 40px; left: 0; right: 0;
  text-align: center; color: white; font-size: 24px;
  font-weight: 700; letter-spacing: 2px;
}

/* ── Info/intro boxes ── */
.info-box { background: ${themeColor}; padding: 14px 16px; margin-bottom: 12px; }
.info-box h4 { font-weight: 700; font-size: 14px; color: #000; margin-bottom: 8px; }
.info-box p  { font-size: 12px; color: rgb(77,77,77); text-align: left; margin: 0; }

/* ── About-report grading table ── */
.table-im { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; border: 1px solid #ddd; }
.table-im th { background: #f5f5f5; padding: 8px 10px; font-weight: 600; text-align: left; border: 1px solid #ddd; }
.table-im td { padding: 8px 10px; border: 1px solid #ddd; vertical-align: middle; }
.strip { display: inline-block; width: 80px; height: 18px; border-radius: 2px; }
.strip.good    { background: #22c55e; }
.strip.average { background: #f59e0b; }
.strip.poor    { background: #ef4444; }

/* ── Last page ── */
.last-page-box {
  height: 240px; width: 187mm; border-radius: 25px;
  border: 2px solid white;
  position: absolute; left: 66px; top: 100px; z-index: 9;
  padding: 30px 63px;
}
.last-page-box p  { font-size: 22px; font-weight: 300; color: white; line-height: 1.5; margin: 0 0 12px; }
.last-page-box h3 { font-size: 31px; color: white; font-weight: 400; margin: 0; }
.quote1 { width: 8%; position: relative; top: -36px; left: -31px; }
.quote2 { width: 8%; position: relative; top: -36px; left: -31px; }

/* ── Page background helper ── */
.backImg::after {
  content: '';
  background-image: url('${ASSETS}/reportimg/imunity/Page 19_Detox.jpg');
  opacity: 0.05;
  position: absolute; bottom: 0; right: 0;
  width: 55%; height: 50%; z-index: 0; pointer-events: none;
}
`;
}

// ─── Reusable fragments ───────────────────────────────────────────────────────

function rptHeader(): string {
  return `<div class="rpt-header">IMMUNITY REPORT</div>`;
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

/** Page 1 — Cover
 *
 *  Exactly matches PHP:
 *  ─────────────────────────────────────────────────────────────────────────
 *  <div class="page" hidepageno sample
 *       style="background-image: url('assets/reportimg/imunity/coverPage.jpg');">
 *
 *    <!-- "DNA IMMUNITY TEST" — positioned at top:907px left:277px, color=themeColor -->
 *    <div style="color:$theme_color; position:absolute; height:103px;
 *                top:907px; left:277px; font-size:33px; font-family:'HERO'">
 *      DNA IMMUNITY TEST
 *    </div>
 *
 *    <!-- "MY IMMUNITY REPORT" via .cover-title class -->
 *    <div class="cover-title">MY IMMUNITY REPORT</div>
 *
 *    <!-- Patient name via .patient-box -->
 *    <p class="blocktext patient-box">Patient Name : {name}</p>
 *  </div>
 *  ─────────────────────────────────────────────────────────────────────────
 *  NO logo image on the cover — that only shows if $settings['immunity_cover_page_logo'] is set.
 */
function coverPage(opts: PdfGeneratorOptions): string {
  const pd         = opts.reportData.PatientDetails;
  const themeColor = getThemeColor(opts);

  // PHP: $settings["immunity_cover_page"] OR base_url('assets/reportimg/imunity/coverPage.jpg')
  const coverImg = opts.vendor?.coverPageImg || IMG.coverPage;

  return `
  <div class="page" style="
      page-break-after: always;
      background-image: url('${coverImg}');
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
  ">

    <!-- DNA IMMUNITY TEST — matches PHP: top:907px left:277px font-size:33px font-family:HERO -->
    <div style="
        color: ${themeColor};
        position: absolute;
        height: 103px;
        top: 907px;
        left: 277px;
        font-size: 33px;
        font-family: 'HERO', 'Poppins', sans-serif;
    ">DNA IMMUNITY TEST</div>

    <!-- MY IMMUNITY REPORT — matches PHP .cover-title -->
    <div style="
        position: absolute;
        bottom: 60px;
        left: 0; right: 0;
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        color: rgb(77,77,77);
        letter-spacing: 2px;
        font-family: 'Poppins', sans-serif;
    ">MY IMMUNITY REPORT</div>

    <!-- Patient name — matches PHP .blocktext.patient-box -->
    <p style="
        position: absolute;
        bottom: 35px;
        left: 0; right: 0;
        text-align: center;
        font-size: 13px;
        color: rgb(77,77,77);
        margin: 0;
        font-family: 'Poppins', sans-serif;
    ">Patient Name : ${pd.name}</p>

  </div>`;
}

/** Page 2 — Profile  (matches PHP "Your Profile" page) */
function profilePage(opts: PdfGeneratorOptions): string {
  const pd         = opts.reportData.PatientDetails;
  const sd         = opts.reportData.SampleDetails;
  const themeColor = getThemeColor(opts);
  const logoUrl    = opts.vendor?.logoUrl || '';
  // PHP: base_url('assets/reportimg/imunity/signature.png') via default_signature()
  const sigImg     = IMG.signature;

  const sampleId   = sd.kitBarcode || sd.vendorSampleId || '';
  const reportDate = formatDate(sd.report_date) || today();

  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:30px;"></div>
    <div class="content-box">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:12px;">
        ${logoUrl
          ? `<img src="${logoUrl}" style="max-height:55px;max-width:160px;object-fit:contain;" alt="logo"/>`
          : `<span style="font-weight:700;font-size:16px;color:#426c7f;">NMC Genetics</span>`}
      </div>

      <!-- Sample ID bar -->
      <div style="background:${themeColor};text-align:center;padding:8px 0;margin-bottom:20px;">
        <div style="font-weight:700;font-size:13px;color:#000;">SAMPLE ID: ${sampleId}</div>
        <div style="font-size:12px;color:#000;">Date of report : ${reportDate}</div>
      </div>

      <h3 style="color:${themeColor};font-size:22px;font-weight:400;margin:0 0 8px;">Your Profile</h3>

      <!-- Patient info — matches PHP profile-table -->
      <table class="profile-table">
        <tr><td>PATIENT NAME</td><td>${pd.name}</td></tr>
        <tr><td>AGE (YEARS)</td><td>${pd.age}</td></tr>
        <tr><td>WEIGHT (KG)</td><td>${pd.weight || '—'}</td></tr>
        <tr><td>GENDER</td><td>${pd.gender?.toUpperCase()}</td></tr>
        <tr><td>HEIGHT (CM)</td><td>${pd.height || '—'}</td></tr>
        <tr><td>PATIENT ID</td><td>${pd.patientId}</td></tr>
        <tr><td>TEST ID</td><td>${sd.test || 'NMC-MI01'}</td></tr>
      </table>

      <div style="height:12px;"></div>

      <!-- Sample info -->
      <table class="profile-table">
        <tr><td>SAMPLE ID</td><td>${sampleId}</td></tr>
        <tr><td>SAMPLE TYPE</td><td>${sd.sampleType || 'SALIVA'}</td></tr>
        <tr><td>SAMPLE COLLECTION DATE</td><td>${formatDate(sd.sample_date)}</td></tr>
        <tr><td>REPORT GENERATION DATE</td><td>${reportDate}</td></tr>
        <tr><td>REFERRED BY (DOCTOR)</td><td>${sd.addedBy || '—'}</td></tr>
        <tr><td>REFERRED BY (HOSPITAL)</td><td>${sd.orderNo || '—'}</td></tr>
      </table>

      <!-- Signature — matches PHP default_signature() using signature.png -->
      <div style="margin-top:28px;">
        <img src="${sigImg}" style="width:initial;max-height:80px;" alt="signature" onerror="this.style.display='none'"/>
        <div style="margin-top:4px;font-size:11px;color:rgb(77,77,77);font-weight:600;">Dr. Varun Sharma, Ph.D</div>
        <div style="font-size:11px;color:rgb(77,77,77);">Scientist - Human Genetics</div>
      </div>

    </div>
  </div>`;
}

/** Page 3 — Welcome */
function welcomePage(opts: PdfGeneratorOptions): string {
  const pd         = opts.reportData.PatientDetails;
  const vendorName = opts.vendor?.vendorName || 'NMC Genetics';
  const sigImg     = IMG.signature;
  const themeColor = getThemeColor(opts);

  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 style="color:${themeColor}">Welcome</h3>
      <br>
      <h4 style="text-transform:capitalize;">Dear ${pd.name},</h4>
      <p>NMC Genetics is pleased to provide you DNA Immunity report based on your unique genomic profile. The report offers you a snap-shot of your genetic response pertaining to your immunity.</p>
      <p>The interpretations and recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
      <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray; utilizing globally validated procedures. The information received from your genetic code determines your immune response towards various diseases including COVID-19. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
      <p>With insights from this report, your clinicians or wellness consultant has a guidance map to device a personalized drug and accordingly lifestyle changes to help you achieve optimal health. By seeking professional advice and following the recommendations you can improve your health holistically.</p>
      <p>Wishing you good health!</p>
      <br>
      <img style="width:initial;max-height:80px;" src="${sigImg}" alt="sig" onerror="this.style.display='none'"/>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For ${vendorName}<br/>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="font-size:16px;">(${vendorName})</b></p>
    </div>
  </div>`;
}

/** Page 4 — About Us */
function aboutUsPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 style="color:${themeColor}">About Us</h3>
      <br>
      <p>NMC Genetics is a clinical genomics company with a vision to innovate healthcare using genomics and data science.</p>
      <p>Our services, delivered from a state-of-the-art genomics laboratory, empower clinicians and health care professionals with precise and actionable results to help improve patient care. NMC Genetics has strong focus and domain expertise in clinical genomics, preventive health, and personalized medicine.</p>
      <p>Led by a unique team of highly skilled molecular biologists, bioinformaticians and data scientists, NMC Genetics is poised for a big leap into the future of healthcare.</p>
      <p>NMC Genetics is a subsidiary of NMC Healthcare LLC. a largest private healthcare company in the UAE and ranks amongst the leading fertility service providers in the world.</p>
    </div>
  </div>`;
}

/** Page 5 — Legal Disclaimer */
function legalPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 style="color:${themeColor}">Legal Disclaimer</h3>
      <p>This report is based on your unique DNA results obtained by testing your buccal swabs or blood samples or saliva samples in response to a selection of key genes that are associated with the individual health. NMC Genetics provides genetic assessment services only for investigational purposes and the information thus given should be interpreted and used exclusively only by qualified medical practitioners, certified physicians, dieticians, nutritionist, sports therapists and others in similar professions.</p>
      <p>Genetic results are unique but being associated with a futuristic technology, the same must be used only under proper advice. NMC Genetics does not guarantee or in any way confirm any future disease or ailment associated with the genetic data disclosed in this report.</p>
      <p>Interpretation of genetic data is a matter of expert opinion. Before taking any action based on this report, you are advised to meet and seek the advice of a qualified medical / nutritionist / fitness practitioner.</p>
      <p><strong>Limitation of Liability:</strong> To the fullest extent permitted by law, neither NMC Genetics and nor its officers, employees or representatives will be liable for any claim, proceedings, loss or damage of any kind arising out of or in connection with acting, or not acting, on the assertions or recommendations in the report.</p>
    </div>
  </div>`;
}

/** Pages 6–7 — Introduction
 *  PHP uses:
 *    dna1.png         → assets/reportimg/dna1.png
 *    genemutation.png → assets/reportimg/genemutation.png
 *    genemutation.jpg → assets/reportimg/genemutation.jpg
 */
function introPages(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <!-- Page 6: Introduction -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 style="color:${tc}">Introduction</h3>
      <p style="margin-top:8px;">Human DNA consists of about 3 billion bases, and more than 99 percent of those bases are the same in all people. The order, or sequence, of these bases determines the information available for building and maintaining an organism, similar to the way in which letters of the alphabet appear in a certain order to form words and sentences.</p>

      <!-- Two-column layout matching PHP table structure -->
      <table style="margin-top:20px;">
        <tr>
          <td style="padding:10px 20px;vertical-align:top;background:${tc};">
            <h3 style="color:#000;">What is DNA?</h3>
            <p style="color:#000;">DNA (Deoxyribonucleic), is the hereditary material in humans and almost all other organisms.</p>
            <p style="color:#000;margin-top:0;">Most DNA is located in the cell nucleus (where it is called nuclear DNA), but a small amount of DNA can also be found in the mitochondria. The information in DNA is stored as a code made up of four chemical bases: adenine (A), guanine (G), cytosine (C), and thymine (T).</p>
          </td>
          <td style="padding-left:50px;width:50%;">
            <!-- PHP: base_url("assets/reportimg/dna1.png") -->
            <img src="${IMG.dna1}" alt="DNA" style="max-width:100%;"/>
          </td>
        </tr>
      </table>

      <table style="margin-top:50px;">
        <tr>
          <td style="padding-right:50px;width:50%;">
            <!-- PHP: base_url("assets/reportimg/genemutation.png") -->
            <img src="${IMG.geneMutation}" alt="Gene" style="max-width:100%;"/>
          </td>
          <td style="padding:10px 20px;vertical-align:top;background:${tc};">
            <h3 style="color:#000;">What is Gene?</h3>
            <p style="color:#000;">A gene is the basic physical and functional unit of heredity. Genes are made up of DNA.</p>
            <p style="margin-top:0;color:#000;">Some genes act as instructions to make molecules called proteins. In humans, genes vary in size from a few hundred DNA bases to more than 2 million bases. The Human Genome Project estimated that humans have between 20,000 and 25,000 genes.</p>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Page 7: Gene mutation -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <table>
        <tr>
          <td style="padding:10px 20px;vertical-align:top;background:${tc};">
            <h3 style="color:#000;">What is a gene mutation and how do mutations occur?</h3>
            <p style="color:#000;">A gene mutation is a permanent alteration in the DNA sequence that makes up a gene, such that the sequence differs from what is found in most people.</p>
            <p style="margin-top:0;color:#000;">Mutations range in size; they can affect anywhere from a single DNA building block (base pair) to a large segment of a chromosome that includes multiple genes.</p>
          </td>
          <td style="padding-left:50px;width:50%;">
            <!-- PHP: base_url("assets/reportimg/genemutation.jpg") -->
            <img src="${IMG.geneMutationJpg}" alt="Mutation" style="max-width:100%;"/>
          </td>
        </tr>
      </table>

      <p>Gene mutations can be classified in two major ways:</p>
      <ul style="padding-left:15px;">
        <li><span style="color:rgb(77,77,77);"><b>Hereditary (or germline) mutations</b> are inherited from a parent and are present throughout a person's life in virtually every cell in the body.</span></li>
        <li><span style="color:rgb(77,77,77);"><b>Acquired (or somatic) mutations</b> occur at some time during a person's life and are present only in certain cells, not in every cell in the body.</span></li>
      </ul>
      <h3 style="color:${tc};">What is Genetic testing?</h3>
      <p>Genetic testing is a type of medical test that identifies changes in chromosomes, genes, or proteins. The results of a genetic test can confirm or rule out a suspected genetic condition or help determine a person's chance of developing or passing on a genetic disorder.</p>
      <h3 style="color:${tc};">What do the results of Genetic tests mean?</h3>
      <p>A positive test result means that the laboratory found a change in a particular gene, chromosome, or protein of interest. Depending on the purpose of the test, this result may confirm a diagnosis, indicate that a person is a carrier of a particular genetic mutation, identify an increased risk of developing a disease in the future or suggest a need for further testing.</p>
      <p>A negative test result means that the laboratory did not find a change in the gene, chromosome, or protein under consideration.</p>
      <p>A variant of unknown significance (VUS) can also be found in a genetic sequence for which the association with disease risk is unclear.</p>
    </div>
  </div>`;
}

/** Pages 8–9 — Immunity intro
 *  PHP uses:
 *    Page 9 image.jpg          → assets/reportimg/imunity/Page 9 image.jpg
 *    Page 10_Immunity Stage.png → assets/reportimg/imunity/Page 10_Immunity Stage.png
 *    Page 10_Immunity Stage2.png→ assets/reportimg/imunity/Page 10_Immunity Stage2.png
 */
function immunityIntroPages(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <!-- Page 8: IMMUNITY OR IMMUNE RESPONSE -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <!-- PHP: background-image url Page 9 image.jpg, height:300px -->
      <div style="background-image:url('${IMG.immunityBg}');background-size:cover;height:300px;width:100%;">
        <h1 style="color:${tc};padding-left:25px;">IMMUNITY OR <br/> IMMUNE RESPONSE</h1>
      </div>
      <p>The immune response is a biological reaction that protects against tissue damage, toxicity, and tumors, It involves a coordinated set of interactions among host cells and the protective molecules they produce upon encountering a pathogen or antigen, the purpose of which is to prevent dangerous incursions and then to restore homeostasis.</p>
      <h3 style="color:${tc};">Immune System</h3>
      <p>The immune system protects the host from a universe of pathogenic microbes that are themselves constantly evolving. The immune system also helps the host eliminate toxic or allergenic substances that enter through mucosal surfaces.</p>
      <h3 style="color:${tc};">How does the immune system work?</h3>
      <p>The immune system has a vital role: It protects our body from harmful substances, germs, and cell changes that could make us ill. It is made up of various organs, cells, and proteins. As long as the immune system is running smoothly, we don't notice that it's there. But if it stops working properly – because it's weak or can't fight particularly aggressive germs – we get ill.</p>
      <h3 style="color:${tc};">Tasks of the immune system</h3>
      <p>The main tasks of the body's immune system are:</p>
      <ul style="padding-left:15px;">
        <li><span style="color:rgb(77,77,77);">to fight disease-causing germs (pathogens) like bacteria, viruses, parasites or fungi, and to remove them from the body,</span></li>
        <li><span style="color:rgb(77,77,77);">to recognize and neutralize harmful substances from the environment, and</span></li>
        <li><span style="color:rgb(77,77,77);">to fight disease-causing changes in the body, such as cancer cells.</span></li>
      </ul>
    </div>
  </div>

  <!-- Page 9: How is the immune system activated? -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br>
      <h3 style="color:${tc};">How is the immune system activated?</h3>
      <p style="margin-top:8px;">The immune system can be activated by a lot of different things that the body doesn't recognize as its own. These are called antigens. Examples of antigens include the proteins on the surfaces of bacteria, fungi, and viruses. When these antigens attach to special receptors on the immune cells, a whole series of processes are triggered in the body.</p>
      <p>The body's own cells have proteins on their surface, too. But those proteins don't usually trigger the immune system to fight the cells. Sometimes the immune system mistakenly thinks that the body's own cells are foreign cells. This is known as an autoimmune response.</p>
      <h3 style="color:${tc};">Innate &amp; Adaptive Immune System</h3>
      <p>There are two sub-systems within the immune system, known as the innate (non-specific) immune system and the adaptive (specific) immune system.</p>
      <p><strong>The innate immune</strong> system provides a general defense against harmful germs and substances. It mostly fights using immune cells such as natural killer cells (NK cells) and phagocytes ("eating cells").</p>
      <p><strong>The adaptive (specific) immune</strong> system makes antibodies and uses them to specifically fight certain germs that the body has previously come into contact with. This is also known as an "acquired" (learned) or specific immune response.</p>
      <br><br>
      <!-- PHP: two images side by side -->
      <table>
        <tr>
          <td style="padding-right:25px;width:50%;">
            <!-- PHP: base_url("assets/reportimg/imunity/Page 10_Immunity Stage.png") -->
            <img src="${IMG.innateStage1}" height="280" alt="Innate Immune Stage 1" style="max-width:100%;"/>
          </td>
          <td style="padding-left:25px;width:50%;">
            <!-- PHP: base_url("assets/reportimg/imunity/Page 10_Immunity Stage2.png") -->
            <img src="${IMG.innateStage2}" height="280" alt="Innate Immune Stage 2" style="max-width:100%;"/>
          </td>
        </tr>
      </table>
    </div>
  </div>`;
}

/** Pages 10–11 — Genetics role in immunity */
function geneticsRolePages(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <!-- Page 10 -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br>
      <h3 style="color:${tc};">How genetics plays a role in immunity</h3>
      <p style="margin-top:8px;">Genetic factors play a very important role in how immune cells of the healthy individual respond to pathogens. Various studies have shown genetics play a key role in immune response, by affecting body's ability to fight off the diseases. Cytokines are the proteins secreted by cells in response to infection.</p>
      <p>An individual having strong or weak immune system depends on their DNA. If both of your parents have weak immune system, it is very likely you would also have a weaker immune system making you vulnerable to many diseases.</p>
      <p>Your body has both innate and adaptive immunity. Innate immunity is present from birth whereas adaptive immunity involves your body learning how to deal with certain types of bacteria and viruses.</p>
      <p>A personalized dietary intervention based on the genetic information of immunity of individual can help in boosting the immunity. Genetic mutation in MTHFR can lead an individual either of the following genotypes:</p>
      <ul style="padding-left:15px;">
        <li><span style="color:rgb(77,77,77);"><b>Wild-Type:</b> Will have about normal MTHFR enzyme activity, hence normal folate metabolism leading to normal dietary riboflavin (B2) and folate intake.</span></li>
        <li><span style="color:rgb(77,77,77);"><b>Homozygous:</b> Will have about 70% reduction of normal MTHFR enzyme activity, hence impaired folate metabolism leading to increased dietary riboflavin (B2) and folate intake to boost the immunity.</span></li>
        <li><span style="color:rgb(77,77,77);"><b>Heterozygous:</b> Will have about a 40% reduction of normal MTHFR enzyme activity, hence impaired folate metabolism.</span></li>
      </ul>
      <p>Thus, by knowing the genetic variation in an individual's gene, diet can be customized to get maximum benefit of it.</p>
    </div>
  </div>

  <!-- Page 11 -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br>
      <h3 style="color:${tc};">How genetic testing impacts our wellbeing?</h3>
      <p style="margin-top:8px;">Genetic defects can affect our health, although in many cases they don't manifest into a disease, but increases the risk of disease. External factors (such as the environment or lifestyle) influences the manifestation of the disease.</p>
      <p>Genetic variations called SNPs (pronounced "snips") or "deletions" or "additions" can affect the way our bodies absorb, metabolize, and utilize nutrients, and determine how effectively we eliminate Xenobiotics.</p>
      <p>Once researchers understand how specific genotypes can affect how our genes function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.</p>
      <p>A healthy lifestyle is, of course, generally preferable, because it can neutralize many genetic predispositions even without knowing underlying risks. However, genetic testing provides you with appropriate information about underlying risk factors.</p>
      <h3 style="color:${tc};">SOME FACTS:</h3>
      <p>In human beings, 99.9% bases are same, remaining 0.1% makes a person unique in terms of:</p>
      <ul style="padding-left:15px;">
        <li><span style="color:rgb(77,77,77);">Different attributes / characteristics / traits</span></li>
        <li><span style="color:rgb(77,77,77);">How a person looks and what disease risks he or she may have</span></li>
        <li><span style="color:rgb(77,77,77);">Harmless (no change in our normal health)</span></li>
        <li><span style="color:rgb(77,77,77);">Harmful (can develop into diseases like diabetes, cancer, heart disease, Huntington's disease, and hemophilia)</span></li>
        <li><span style="color:rgb(77,77,77);">Latent (These variations found in genes but are not harmful on their Own. The change in each gene function Only becomes apparent under certain conditions)</span></li>
      </ul>
    </div>
  </div>`;
}

/** Page 12 — About your immunity report */
function aboutReportPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br>
      <h3 style="color:${tc};">About your immunity report</h3>
      <p style="margin-top:8px;">This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence.</p>
      <p>The report comprises of following sections:</p>
      <ol style="padding-left:15px;">
        <li><span style="color:rgb(77,77,77);"><b>Summarized results section:</b> This section is divided into master summary.</span></li>
        <li><span style="color:rgb(77,77,77);"><b>Detailed test panel sections:</b> This section comprises of Detoxification, Micronutrients and Immunogenomic profile. In each of these sections, Your Genetic Profile, a group of relevant traits, corresponding genetic response and interpretations are listed.</span></li>
      </ol>
      <p>This is how the result for a genetic marker associated to an individual trait is graded:</p>
      <!-- Grading table — matches PHP table.table-im -->
      <table class="table-im">
        <thead>
          <tr>
            <th>Response</th>
            <th>Risk Level</th>
            <th>Zone</th>
            <th>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Good</td>
            <td>Low/Normal risk</td>
            <td><span class="strip good"></span></td>
            <td>Immune response is good or normal towards the infections.</td>
          </tr>
          <tr>
            <td>Average</td>
            <td>Medium risk</td>
            <td><span class="strip average"></span></td>
            <td>Immune response is moderate towards infections. Hence, act as per the recommendations.</td>
          </tr>
          <tr>
            <td>Poor</td>
            <td>High Risk</td>
            <td><span class="strip poor"></span></td>
            <td>Immune response is poor or low towards the infections. Hence, act as per the recommendations or consult your healthcare practitioner.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

/** Page 13 — Table of Contents
 *  PHP uses:
 *    table_Detox.jpg         → assets/reportimg/imunity/table_Detox.jpg
 *    Micronutrient_table.jpg → assets/reportimg/imunity/Micronutrient_table.jpg
 *    IMMUNOGENOMIC_table.jpg → assets/reportimg/imunity/IMMUNOGENOMIC_table.jpg
 */
function tableOfContentsPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <br>
      <h3 style="color:${tc};">Table of contents</h3>
      <br>
      <table>
        <tbody>
          <tr>
            <!-- A. Detoxification -->
            <td style="width:50%;padding-right:10px;vertical-align:top;">
              <div style="position:relative;margin-bottom:8px;">
                <!-- PHP: background url('assets/reportimg/imunity/table_Detox.jpg') -->
                <div style="background:url('${IMG.tocDetox}');background-repeat:no-repeat;height:200px;background-size:cover;position:relative;">
                  <span style="display:block;background:rgba(0,0,0,0.35);color:white;font-weight:600;font-size:13px;padding:2px 8px;position:absolute;bottom:8px;left:10px;">A. Detoxification</span>
                </div>
              </div>
              <ol class="table-list">
                <li><span>A.1. Phase-I Detoxification</span><span data-pn="Phase11"></span></li>
                <li><span>A.2. Phase-II Detoxification</span><span data-pn="Phase2"></span></li>
                <li><span>A.3. Oxidative Stress</span><span data-pn="OxidativeStress"></span></li>
              </ol>
            </td>
            <!-- B. Micronutrients -->
            <td style="width:50%;padding-left:10px;vertical-align:top;">
              <div style="position:relative;margin-bottom:8px;">
                <!-- PHP: background url('assets/reportimg/imunity/Micronutrient_table.jpg') -->
                <div style="background:url('${IMG.tocMicronutrient}');background-repeat:no-repeat;height:200px;background-size:cover;position:relative;">
                  <span style="display:block;background:rgba(0,0,0,0.35);color:white;font-weight:600;font-size:13px;padding:2px 8px;position:absolute;bottom:8px;left:10px;">B. Micronutrients</span>
                </div>
              </div>
              <ol class="table-list">
                <li><span>B.1. Vitamin A</span><span data-pn="VA"></span></li>
                <li><span>B.2. Vitamin B6</span><span data-pn="VB6"></span></li>
                <li><span>B.3. Vitamin B9</span><span data-pn="VB9"></span></li>
                <li><span>B.4. Vitamin B12</span><span data-pn="VB12"></span></li>
                <li><span>B.5. Vitamin C</span><span data-pn="VC"></span></li>
                <li><span>B.6. Vitamin D &amp; Calcium (Ca)</span><span data-pn="VD"></span></li>
                <li><span>B.7. Vitamin E</span><span data-pn="VE"></span></li>
                <li><span>B.8. Vitamin K</span><span data-pn="VK"></span></li>
                <li><span>B.9. Magnesium (Mg)</span><span data-pn="MG"></span></li>
                <li><span>B.10. Iron (Fe)</span><span data-pn="IR"></span></li>
                <li><span>B.12. Omega-3 fatty acid</span><span data-pn="O3"></span></li>
              </ol>
            </td>
          </tr>
          <tr>
            <!-- C. Immunogenomic profile -->
            <td style="width:50%;padding-right:10px;padding-top:30px;vertical-align:top;">
              <div style="position:relative;margin-bottom:8px;">
                <!-- PHP: background url('assets/reportimg/imunity/IMMUNOGENOMIC_table.jpg') -->
                <div style="background:url('${IMG.tocImmunogenomic}');background-repeat:no-repeat;height:200px;background-size:cover;position:relative;">
                  <span style="display:block;background:rgba(0,0,0,0.35);color:white;font-weight:600;font-size:13px;padding:2px 8px;position:absolute;bottom:8px;left:10px;">C. Immunogenomic profile</span>
                </div>
              </div>
              <ol class="table-list">
                <li><span>C. Immunogenomic profile</span><span data-pn="Immunogenomic"></span></li>
              </ol>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

/** Summary pages 14–15 */
function summaryPages(opts: PdfGeneratorOptions): string {
  const tc     = getThemeColor(opts);
  const detox  = opts.reportData.DetoxData;
  const micro  = opts.reportData.MicronutrientData;
  const immune = opts.reportData.ImmunogenomicData;

  function summaryRow(label: string, status: string, genes: string[]): string {
    const cls = (status || 'poor').toLowerCase();
    return `
    <tr class="border">
      <td class="text-bl">${label}</td>
      <td class="${cls}">${status}</td>
      <td class="text-bl"><div>${genes.join(', ')}</div></td>
    </tr>`;
  }

  function buildSectionRows(data: typeof detox): string {
    return Object.entries(data).map(([key, items]) => {
      const cond  = items[0];
      const genes = cond.gene.map((g: GeneData) => g.name).filter(Boolean);
      return summaryRow(key, cond.condition_status, genes);
    }).join('');
  }

  function immuneSection(label: string, keys: string[]): string {
    const rows = keys.filter(k => immune[k]).map(k => {
      const cond  = immune[k][0];
      const genes = cond.gene.map((g: GeneData) => g.name).filter(Boolean);
      return summaryRow(k, cond.condition_status, genes);
    }).join('');
    if (!rows) return '';
    return `
    <tr><td colspan="3"><h4 style="text-align:left;color:${tc};padding:8px 15px;">${label}</h4></td></tr>
    ${rows}`;
  }

  return `
  <!-- Page 14 -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br>
      <span class="summary-heading">Your summarized test report</span>
      <span class="summary-heading2">DETOXIFICATION</span>
      <table class="summaryTable" style="margin-top:15px;">
        <tbody>${buildSectionRows(detox)}</tbody>
      </table>
      <span class="summary-heading2">MICRONUTRIENTS</span>
      <table class="summaryTable" style="margin-top:20px;">
        <tbody>${buildSectionRows(micro)}</tbody>
      </table>
      <span class="summary-heading2">IMMUNOGENOMIC PROFILE</span>
      <table class="summaryTable" style="margin-top:15px;">
        <tbody>
          ${immuneSection('Bacterial Infection', ['Malaria, tuberculosis, bacteremia and pneumococcal disease', 'Gram-negative Bacteria'])}
          ${immuneSection('Parasitic Infection', ['Malaria'])}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Page 15 -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br>
      <span class="summary-heading">Your summarized test report</span>
      <table class="summaryTable" style="margin-top:15px;">
        <tbody>
          ${immuneSection('Viral Infection', ['HIV', 'Respiratory disease including COVID-19', 'SARS-CoV infection'])}
          ${immuneSection('Fungal Infection', ['Fungal Infection'])}
          ${immuneSection('Other Diseases', [
            'Inflammatory conditions of the colon and small intestine',
            'Asthma',
            'Disease severity due to COVID-19 infection',
            'Inflammation (TNF expression)',
          ])}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ─── Detoxification pages ─────────────────────────────────────────────────────

/**
 * Section A cover page.
 * PHP: background-image url('assets/reportimg/imunity/Page 19_Detox.jpg')
 */
function detoxCoverPage(): string {
  return `
  <div class="page" style="page-break-after:always;background-image:url('${IMG.detoxSectionCover}');background-size:cover;">
    <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;">
      <span style="color:white;font-size:24px;font-weight:700;letter-spacing:2px;">Detoxification</span>
    </div>
  </div>`;
}

/**
 * Detox intro page 1
 * (no custom images — text only)
 */
function detoxIntroPage1(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h1 style="color:${tc};">Detoxification</h1>
      <p>Detoxification is the collection of physiological and psychological processes through which the body identifies, neutralizes, and eliminates toxic substances, metabolic by products, habits, and patterns.</p>
      <ul style="padding-left:15px;">
        <li><span><strong>Antinutrients</strong> such as high-fructose corn syrup, trans fats, caffeine, alcohol, and processed foods.</span></li>
        <li><span><strong>Internal metabolic toxins</strong> such as nitrogen, carbon dioxide, bile, urea, free radicals, and stool</span></li>
        <li><span><strong>Medications</strong> used improperly, inappropriately, or too often</span></li>
        <li><span><strong>Heavy metals</strong> such as mercury, arsenic, lead, cadmium, tin, and aluminium</span></li>
        <li><span><strong>Chemicals</strong> such as pesticides, herbicides, cleaning products, solvents, and glues</span></li>
        <li><span><strong>Allergens</strong> such as food, mold, dust, pollen, and chemicals</span></li>
        <li><span><strong>Infectious organisms</strong> such as bacteria, viruses, yeast, and parasites</span></li>
      </ul>
      <p>Further, the following social, emotional, and spiritual challenges affect health and well-being:</p>
      <ul>
        <li><span><strong>Stress,</strong> such as lack of personal time, too much work, excessive worry, too little rest, and financial strain</span></li>
        <li><span><strong>Unhealthy mental states,</strong> such as addictions, overeating, and destructive mental patterns</span></li>
        <li><span><strong>Ambient distractions,</strong> such as pervasive noises, smells, lights, and images</span></li>
        <li><span><strong>Overstimulation from advertisements,</strong> radio, computers, television, smartphones, and pagers</span></li>
        <li><span><strong>Lack of spiritual connection,</strong> a loss of meaning and purpose</span></li>
        <li><span><strong>Isolation,</strong> the lack of social support and community</span></li>
        <li><span><strong>Nature deprivation,</strong> being disconnected from natural environments</span></li>
        <li><span><strong>Negative emotions and persistent self-defeating thoughts,</strong> such as anger, fear, guilt, and hopelessness.</span></li>
      </ul>
      <p>The body and mind already possess the capacity to handle these challenges. This process of maintaining biological and mental balance is called <strong>homeostasis. Liver and gallbladder</strong> is the major system that works together synchronously to maintain health and balance. Liver detoxification includes the following:</p>
      <ol>
        <li><strong>Phase 1 detoxification</strong></li>
        <li><strong>Phase 2 detoxification</strong></li>
      </ol>
    </div>
  </div>`;
}

/**
 * Detox intro page 2 — liver diagram + Detoxification and Immunity text.
 * PHP: base_url('assets/reportimg/imunity/Liver-Detoxification.jpg')
 */
function detoxIntroPage2(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:100px;"></div>
    <div class="content-box">
      <!-- PHP: <img src="assets/reportimg/imunity/Liver-Detoxification.jpg"> -->
      <img src="${IMG.liverDetox}" alt="Detoxification" style="width:100%;max-height:260px;object-fit:contain;margin-bottom:14px;" onerror="this.style.display='none'"/>
      <p>Toxins are subjected to two types of enzymatic manipulation; classified under Phase I and Phase II detoxification. Phase I reactions include oxidation, reduction, and hydrolysis by several enzyme classes.</p>
      <h1 style="color:${tc};">Detoxification and Immunity</h1>
      <p>The human body is exposed to various types of toxins on a daily basis. Lead, polychlorinated biphenyls, chlorine, fluoride, cyanide, formaldehyde, pesticides, steroids, antibiotics, copper, mercury, ethanol, triclosan, and dioxins. These are just a few of the toxins.</p>
      <p>All these toxins affect our immune system. With a weakened immune system, our body finds it hard to fight off infections. Catching the cold and "flu" that go around can be one sign of a weak immune system.</p>
    </div>
  </div>`;
}

/** Gene-variants + response block (matches PHP .gene-varients and .response tables) */
function buildGeneAndResponse(
  genes: GeneData[],
  status: string,
  interpretation: string,
  recommendation: string,
  tc: string
): string {
  const geneRows = genes.map(g => `
  <tr>
    <td style="width:50%;vertical-align:top;">
      <div class="gene-Id-style"><span>Your Genotype</span></div>
      <div style="padding-top:8px;color:#000;">${g.report_variant || g.test_variant || '—'}</div>
    </td>
    <td style="width:50%;vertical-align:top;">
      <div class="gene-Id-style2"><span>${g.name}</span></div>
      <p>${g.gene_description || ''}</p>
    </td>
  </tr>`).join('');

  return `
  <table class="gene-varients" style="width:100%;">
    <tbody>${geneRows}</tbody>
  </table>
  <table class="response">
    <tbody>
      <tr>
        <td>
          <h4 style="color:#000;">Your Response</h4>
          ${gaugeImg(status)}
        </td>
        <td>
          <h4 style="color:#000;">Interpretation</h4>
          <p style="color:#000;">${interpretation || '—'}</p>
        </td>
      </tr>
      <tr>
        <td class="rImage"></td>
        <td>
          <h4>Recommendation</h4>
          <p>${recommendation || '—'}</p>
        </td>
      </tr>
    </tbody>
  </table>`;
}

/**
 * One condition detail page with header image.
 * imgUrl must be one of the corrected IMG.* paths.
 */
function conditionDetailPage(
  heading: string,
  condDesc: string,
  imgUrl: string,
  genes: GeneData[],
  status: string,
  interpretation: string,
  recommendation: string,
  opts: PdfGeneratorOptions,
  pnTarget?: string
): string {
  const tc     = getThemeColor(opts);
  const target = pnTarget ? ` data-pn-target="${pnTarget}"` : '';
  return `
  <div class="page"${target} style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:16px;"></div>
    <div class="content-box">
      <!-- Condition header — matches PHP immune_profile_header_box -->
      <div class="cond-header-wrap" style="margin-bottom:12px;">
        <img src="${imgUrl}" class="cond-header-img" alt="${heading}" onerror="this.style.background:'${tc}';this.style.height='100px';"/>
        <div class="cond-title-box">
          <h3 style="color:${tc};font-size:18px;font-weight:700;margin:0;">${heading}</h3>
        </div>
      </div>
      ${condDesc ? `<p style="font-size:12px;line-height:18px;margin-bottom:10px;">${condDesc}</p>` : ''}
      ${buildGeneAndResponse(genes, status, interpretation, recommendation, tc)}
    </div>
  </div>`;
}

/** Section A: Detoxification pages (cover + 2 intro + 3 conditions + oxidative extra) */
function detoxificationPages(opts: PdfGeneratorOptions): string {
  const tc       = getThemeColor(opts);
  const detoxData = opts.reportData.DetoxData;
  let pages = '';

  pages += detoxCoverPage();
  pages += detoxIntroPage1(opts);
  pages += detoxIntroPage2(opts);

  // Phase-I — PHP: base_url("/reportimg/imunity/detox_phase1_img.jpg")
  if (detoxData['Phase-I Detoxification']) {
    const cond = detoxData['Phase-I Detoxification'][0];
    pages += conditionDetailPage(
      'Phase-I Detoxification',
      cond.condition_desc || '',
      IMG.detoxPhase1,
      cond.gene, cond.condition_status, cond.interpretation, cond.recommendation,
      opts, 'Phase11'
    );
  }

  // Phase-II — PHP: base_url("/reportimg/imunity/phase2-detox.jpg")
  if (detoxData['Phase-II Detoxification']) {
    const cond = detoxData['Phase-II Detoxification'][0];
    pages += conditionDetailPage(
      'Phase-II Detoxification',
      cond.condition_desc || '',
      IMG.detoxPhase2,
      cond.gene, cond.condition_status, cond.interpretation, cond.recommendation,
      opts, 'Phase2'
    );
  }

  // Oxidative Stress — PHP: base_url("/reportimg/imunity/oxidative_stress.jpg")
  if (detoxData['Oxidative Stress']) {
    const cond = detoxData['Oxidative Stress'][0];
    pages += conditionDetailPage(
      'Oxidative Stress',
      cond.condition_desc || '',
      IMG.oxidativeStress,
      cond.gene, cond.condition_status, cond.interpretation, cond.recommendation,
      opts, 'OxidativeStress'
    );

    // Extra oxidative diagram page — PHP: base_url('assets/reportimg/imunity/oxidative_img2.jpg')
    pages += `
    <div class="page" style="page-break-after:always;">
      ${rptHeader()}
      <div style="height:80px;"></div>
      <div class="content-box">
        <table class="response">
          <tbody>
            <tr>
              <td class="rImage"></td>
              <td>
                <h4>Recommendation</h4>
                <p>${cond.recommendation}</p>
              </td>
            </tr>
          </tbody>
        </table>
        <br><br>
        <!-- PHP: base_url('assets/reportimg/imunity/oxidative_img2.jpg') -->
        <div><img src="${IMG.oxidativeImg2}" alt="Oxidative Stress" style="width:100%;max-height:300px;object-fit:contain;" onerror="this.style.display='none'"/></div>
      </div>
    </div>`;
  }

  return pages;
}

/** Section B: Micronutrients
 *
 *  Header images per vitamin — all match PHP:
 *    base_url("/reportimg/header (N).jpg")
 */
function micronutrientsPages(opts: PdfGeneratorOptions): string {
  const tc        = getThemeColor(opts);
  const microData = opts.reportData.MicronutrientData;
  let pages = '';

  // Section cover — PHP: base_url('assets/reportimg/imunity/Micronutrient_cover.jpg')
  pages += `
  <div class="page" style="page-break-after:always;background-image:url('${IMG.micronutrientSectionCover}');background-size:cover;">
    <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;">
      <span style="color:white;font-size:24px;font-weight:700;letter-spacing:2px;">MICRONUTRIENTS</span>
    </div>
  </div>`;

  // Intro page — PHP: base_url('assets/reportimg/imunity/Micronutrients_About.jpg')
  pages += `
  <div class="page" data-pn-target="Micronutrients" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:70px;"></div>
    <div class="content-box">
      <br>
      <h1 style="color:${tc};">Micronutrients</h1>
      <p>In order for your body to function and maintain brain, muscle, bone, nerves, skin, blood circulation, and immune system, the body requires a steady supply of various raw materials—both macronutrients and micronutrients. Failing to get even those small quantities may lead to weakened immune system ultimately leading to various types of diseases. Around 30 vitamins and minerals that the body cannot manufacture in sufficient amounts on its own are called "essential micronutrients." Vitamin B6, vitamin C, vitamin E, magnesium, and zinc—play roles in maintaining immune function.</p>
      <br><br>
      <!-- PHP: base_url('assets/reportimg/imunity/Micronutrients_About.jpg') -->
      <img src="${IMG.micronutrientsAbout}" alt="Micronutrients" style="width:100%;max-height:280px;object-fit:contain;" onerror="this.style.display='none'"/>
    </div>
  </div>`;

  // Per-condition — image map matches PHP header (N).jpg numbering exactly
  const conditionMap: Array<{ key: string; imgKey: keyof typeof IMG; pnTarget: string }> = [
    { key: 'Vitamin A',                   imgKey: 'vitaminA',   pnTarget: 'VA'   },
    { key: 'Vitamin B6',                  imgKey: 'vitaminB6',  pnTarget: 'VB6'  },
    { key: 'Vitamin B9',                  imgKey: 'vitaminB9',  pnTarget: 'VB9'  },
    { key: 'Vitamin B12',                 imgKey: 'vitaminB12', pnTarget: 'VB12' },
    { key: 'Vitamin C',                   imgKey: 'vitaminC',   pnTarget: 'VC'   },
    { key: 'Vitamin D and Calcium (Ca)',  imgKey: 'vitaminD',   pnTarget: 'VD'   },
    { key: 'Vitamin E',                   imgKey: 'vitaminE',   pnTarget: 'VE'   },
    { key: 'Vitamin K',                   imgKey: 'vitaminK',   pnTarget: 'VK'   },
    { key: 'Magnesium (Mg)',              imgKey: 'magnesium',  pnTarget: 'MG'   },
    { key: 'Iron (Fe)',                   imgKey: 'iron',       pnTarget: 'IR'   },
    { key: 'Omega-3 fatty acid',          imgKey: 'omega3',     pnTarget: 'O3'   },
  ];

  for (const { key, imgKey, pnTarget } of conditionMap) {
    if (!microData[key]) continue;
    const cond = microData[key][0];
    pages += conditionDetailPage(
      key,
      cond.condition_desc || '',
      IMG[imgKey] as string,
      cond.gene,
      cond.condition_status,
      cond.interpretation,
      cond.recommendation,
      opts,
      pnTarget
    );
  }

  return pages;
}

/** Section C: Immunogenomic profile
 *  PHP cover: base_url('assets/reportimg/imunity/IMMUNOGENOMIC_cover.jpg')
 */
function immunogenomicPages(opts: PdfGeneratorOptions): string {
  const tc       = getThemeColor(opts);
  const immuData = opts.reportData.ImmunogenomicData;
  let pages = '';

  // Cover — PHP: background-image IMMUNOGENOMIC_cover.jpg
  pages += `
  <div class="page" style="page-break-after:always;background-image:url('${IMG.immunogenomicSectionCover}');background-size:cover;">
    <h1 style="position:absolute;bottom:40px;left:0;right:0;text-align:center;color:white;font-size:24px;font-weight:700;letter-spacing:2px;">IMMUNOGENOMIC PROFILE</h1>
  </div>`;

  const subSections: Array<{ label: string; keys: string[]; pnTarget?: string }> = [
    { label: 'Bacterial infection',  pnTarget: 'Immunogenomic', keys: ['Malaria, tuberculosis, bacteremia and pneumococcal disease', 'Gram-negative Bacteria'] },
    { label: 'Parasitic infection',  keys: ['Malaria'] },
    { label: 'Fungal infection',     keys: ['Fungal Infection'] },
    { label: 'Viral infection',      keys: ['HIV', 'SARS-CoV infection', 'Respiratory disease including COVID-19'] },
    { label: 'Other diseases',       keys: [
      'Inflammatory conditions of the colon and small intestine',
      'Asthma',
      'Disease severity due to COVID-19 infection',
      'Inflammation (TNF expression)',
    ]},
  ];

  pages += `
  <div class="page" data-pn-target="Immunogenomic" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:70px;"></div>
    <div class="content-box">
      <br>
      <h1 style="color:${tc};">Immunogenomic profile</h1>
      <p>Your immunogenomic profile determines your genetic association with the risk of developing defects in immune competence. Immune system polymorphisms have been associated with increased risk of developing a variety of diseases including the infectious diseases.</p>

      ${subSections.map(section => {
        const sectionContent = section.keys
          .filter(k => immuData[k])
          .map(k => {
            const cond = immuData[k][0];
            const geneRows = cond.gene.map((g: GeneData) => `
            <tr>
              <td style="width:50%;vertical-align:top;">
                <div class="gene-Id-style"><span>Your Genotype</span></div>
                <div style="padding-top:8px;color:#000;">${g.report_variant || g.test_variant || '—'}</div>
              </td>
              <td style="width:50%;vertical-align:top;">
                <div class="gene-Id-style2"><span>${g.name}</span></div>
                <p>${g.gene_description || ''}</p>
              </td>
            </tr>`).join('');
            return `
            <table class="gene-varients" style="width:100%;">
              <tbody>${geneRows}</tbody>
            </table>
            <table class="response" style="margin-bottom:12px;">
              <tbody>
                <tr>
                  <td>
                    <h4 style="color:${tc};">Your Response</h4>
                    ${gaugeImg(cond.condition_status)}
                  </td>
                  <td>
                    <h4 style="color:#000;">Interpretation</h4>
                    <p style="color:#000;">${cond.interpretation || '—'}</p>
                  </td>
                </tr>
                <tr>
                  <td class="rImage"></td>
                  <td>
                    <h4>Recommendation</h4>
                    <p>${cond.recommendation || '—'}</p>
                  </td>
                </tr>
              </tbody>
            </table>`;
          }).join('');
        if (!sectionContent) return '';
        return `
        <h3 style="color:${tc};margin-bottom:10px;">${section.label}</h3>
        ${sectionContent}`;
      }).join('')}
    </div>
  </div>`;

  return pages;
}

/** Science Behind the Test */
function sciencePage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <div class="page" data-pn-target="COVID1" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:70px;"></div>
    <div class="content-box">
      <br>
      <h3 style="color:${tc};font-size:21px;">Science behind the test</h3>
      <h4 style="margin:10px 0;">Test Methodology</h4>
      <p>Genomic DNA is extracted from individual's Saliva/Tissue/Blood by commercial DNA extraction kits. The genotyping and variant detection is carried out based on illumina Infinium® array protocol. The DNA is then, amplified, fragmented and hybridized to known DNA fragments immobilized in arrays on a BeadChip. Millions of such known DNA fragments (50mer probes) containing the target genetic variants are immobilized on the chip. The hybridized chip is then washed to remove non-hybridized DNA fragments. Single-base extension of the oligos on the BeadChip, using the captured DNA as a template, incorporates detectable labels on the BeadChip and determines the genotype call for the sample. The Illumina iScan® or BeadArray Reader scans the BeadChip, using a laser to excite the fluorophore of the single-base extension product on the beads. The scanner records high-resolution images of the light emitted from the fluorophores.</p>
      <h4 style="margin:10px 0;">Analytical Performance</h4>
      <p>The genotyping was performed using a custom genotyping array platform (Illumina Inc). This test is a laboratory developed test with high reproducibility &gt; 99% and high call rates &gt; 98% to detect the variants and its performance has been validated in-house. Note that some of the genotypes may be imputed.</p>
      <h4 style="margin:10px 0;">Analysis</h4>
      <p>Illumina GenomeStudio® Software is used for efficient genotyping data normalization, genotype calling, clustering, data intensity analysis. Genotypes are called for each sample by their signal intensity (norm R) and Allele Frequency (Norm Theta) relative to canonical cluster positions for a given SNP marker. The report is manually reviewed by experts before release.</p>
    </div>
  </div>`;
}

/** References page */
function referencesPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:60px;"></div>
    <div class="content-box">
      <h3 class="header-heading" style="font-size:31px;color:${tc};">Links</h3>
      <br>
      <ol style="padding-left:16px;">
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">https://www.sciencedirect.com/science/article/pii/B9780323358682001067?via%3Dihub</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">https://www.vibrancehealth.com/blog/vibrance-immune-support-package</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">https://www.ncbi.nlm.nih.gov/books/NBK279364/</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">https://www.health.harvard.edu/staying-healthy/micronutrients-have-major-impact-on-health</li>
      </ol>
      <h3 class="header-heading" style="font-size:31px;color:${tc};">References</h3>
      <br>
      <ol style="padding-left:16px;">
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Chaplin DD. Overview of the immune response. J Allergy Clin Immunol. 2010;125(2 Suppl2):S3–S23.</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Huang, Zhiyi et al. "Role of Vitamin A in the Immune System." Journal of clinical medicine vol. 7,9 258. 6 Sep. 2018.</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Carr AC, Maggini S. Vitamin C and Immune Function. Nutrients. 2017;9(11):1211.</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Prietl B, Treiber G, Pieber TR, Amrein K. Vitamin D and immune function. Nutrients. 2013;5(7):2502–2521.</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Lee GY, Han SN. The Role of Vitamin E in Immunity. Nutrients. 2018;10(11):1614.</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Tam, M., Gómez, S. et al. Possible roles of magnesium on the immune system. Eur J Clin Nutr 57, 1193–1197 (2003).</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Gutiérrez S, Svahn SL, Johansson ME. Effects of Omega-3 Fatty Acids on Immune Cells. Int J Mol Sci. 2019;20(20):5028.</li>
        <li style="font-size:10px;margin-bottom:5px;font-weight:600;">Agnese DM et al. Human toll-like receptor 4 mutations but not CD14 polymorphisms are associated with an increased risk of gram-negative infections. J Infect Dis. 2002;186(10):1522-1525.</li>
      </ol>
    </div>
  </div>`;
}

/** Blank intentional page */
function blankPage(): string {
  return `
  <div class="page" style="page-break-after:always;display:flex;align-items:center;justify-content:center;">
    <p style="color:#888;font-style:italic;text-align:center;">This page has been left blank intentionally.</p>
  </div>`;
}

/**
 * Last page (page 48) — dark background + quote.
 * PHP:
 *   background: $settings["immunity_back_cover_page"] OR base_url('assets/reportimg/imunity/Last Page.jpg')
 *   quote.png: base_url('assets/reportimg/imunity/quote.png')
 */
function lastPage(opts: PdfGeneratorOptions): string {
  const tc           = getThemeColor(opts);
  const backCoverImg = opts.vendor?.backCoverImg || IMG.lastPage;
  return `
  <div class="page" style="page-break-after:always;background-image:url('${backCoverImg}');background-size:cover;background-position:center;">
    <div class="last-page-box">
      <!-- PHP: base_url('assets/reportimg/imunity/quote.png') -->
      <img src="${IMG.quote}" class="quote1" alt="Quote" onerror="this.style.display='none'"/>
      <img src="${IMG.quote}" class="quote2" alt="Quote" onerror="this.style.display='none'"/>
      <p style="color:white;font-size:22px;font-weight:300;padding:0 63px;margin-top:-20px;">
        Health is not the absence of germs, toxins, or cancer cells.<br/>
        It's how well your body responds to them. Sturdy immunity<br/>
        equals sturdy health
      </p>
      
    </div>
  </div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildImmunityReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Immunity Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${aboutUsPage(opts)}
  ${legalPage(opts)}
  ${introPages(opts)}
  ${immunityIntroPages(opts)}
  ${geneticsRolePages(opts)}
  ${aboutReportPage(opts)}
  ${tableOfContentsPage(opts)}
  ${summaryPages(opts)}
  ${detoxificationPages(opts)}
  ${micronutrientsPages(opts)}
  ${immunogenomicPages(opts)}
  ${sciencePage(opts)}
  ${referencesPage(opts)}
  ${lastPage(opts)}

  <script>
    // Page numbering — matches PHP generatePageNo()
    (function() {
      var pages = document.querySelectorAll('.page');
      var total = pages.length;
      pages.forEach(function(page, i) {
        var span = document.createElement('span');
        span.style.cssText = 'font-size:14px;position:absolute;left:104mm;bottom:0;z-index:1000;background:#cacaca;color:black;padding:10px 15px;';
        span.textContent = (i + 1) + '/' + total;
        page.appendChild(span);
      });

      // Link TOC page numbers — matches PHP linkPageNo()
      var pnTargets = document.querySelectorAll('[data-pn-target]');
      pnTargets.forEach(function(el) {
        var target = el.getAttribute('data-pn-target');
        var pn     = el.getAttribute('data-page-no');
        document.querySelectorAll('[data-pn="' + target + '"]').forEach(function(t) {
          t.textContent = pn || '';
        });
      });
    })();
  </script>
</body>
</html>`;
}