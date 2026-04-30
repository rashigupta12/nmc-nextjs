// ============================================================
// Sleep Report — HTML Template Generator
// Converted from PHP template (docs/April/Sleep Report/Sleep/report_pages.php)
// Theme color: #ffa700 (amber) | Font: Poppins
// ============================================================

import { PdfGeneratorOptions } from '@/lib/reportEngine/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ASSETS = BASE_URL;

// ─── Image Registry (matches PHP base_url('assets/...') exactly) ─────────────

const IMG = {
  // Status gauge icons
  good:    `${ASSETS}/reportimg/imunity/good.png`,
  average: `${ASSETS}/reportimg/imunity/average.png`,
  poor:    `${ASSETS}/reportimg/imunity/poor.png`,

  // Sleep section images
  sleepApneaCover:     `${ASSETS}/reportimg/sleep_img/Sleep_Apnea_page_cover.jpg`,
  sleepApnea18:        `${ASSETS}/reportimg/sleep_img/Sleep_Apnea_page_18.jpg`,
  sleepApnea18_2:      `${ASSETS}/reportimg/sleep_img/sleep_apnea_page_18_2.jpg`,
  osa19:               `${ASSETS}/reportimg/sleep_img/OSA_19.jpg`,
  sleepDurationCover:  `${ASSETS}/reportimg/sleep_img/sleep_duration_cover.jpg`,
  sleepDuration22:     `${ASSETS}/reportimg/sleep_img/page_22.jpg`,
  sleepDuration23:     `${ASSETS}/reportimg/sleep_img/page_23.jpg`,
  sleepDurationGap:    `${ASSETS}/reportimg/sleep_img/Sleep_Duration_Gapfill.jpg`,
  caffeineCover:       `${ASSETS}/reportimg/sleep_img/page_24.jpg`,
  caffeine25:          `${ASSETS}/reportimg/sleep_img/page_25.jpg`,
  caffeine26:          `${ASSETS}/reportimg/sleep_img/page_26.jpg`,
  caffeineGap:         `${ASSETS}/reportimg/sleep_img/Sleeplessness_or_Insomnia_Gapfill.jpg`,
  shortSleepCover:     `${ASSETS}/reportimg/sleep_img/page_28.jpg`,
  shortSleep27:        `${ASSETS}/reportimg/sleep_img/page_27.jpg`,
  fragmentationCover:  `${ASSETS}/reportimg/sleep_img/page_30.jpg`,
  fragmentation31:     `${ASSETS}/reportimg/sleep_img/swf_page_31.jpg`,
  bruxismCover:        `${ASSETS}/reportimg/sleep_img/Sleep_Bruxism.jpg`,
  pgxCover:            `${ASSETS}/reportimg/sleep_img/Pgx.jpg`,
  pgx35:               `${ASSETS}/reportimg/sleep_img/page_35.jpg`,
  rlsCover:            `${ASSETS}/reportimg/sleep_img/Restless-Legs-Syndrome.jpg`,
  narcolepsyCover:     `${ASSETS}/reportimg/sleep_img/Narcolepsy.jpg`,
  narcolepsyPage:      `${ASSETS}/reportimg/sleep_img/Narcolepsy_page.jpg`,
  coadCover:           `${ASSETS}/reportimg/sleep_img/Chronic-Obstructive-Airway-Disease_cover.jpg`,
  coadPage:            `${ASSETS}/reportimg/sleep_img/Chronic-Obstructive-Airway-Disease.jpg`,
  micronutrientsCover: `${ASSETS}/reportimg/sleep_img/micronutrients.jpg`,
  micronutrientsPage:  `${ASSETS}/reportimg/sleep_img/micronutrients_page.jpg`,
  micronutrientsGap:   `${ASSETS}/reportimg/sleep_img/Micronutrients_Gapfill.jpg`,
  vitB6:               `${ASSETS}/reportimg/sleep_img/b6.jpg`,
  vitB9:               `${ASSETS}/reportimg/sleep_img/b9.jpg`,
  vitB12:              `${ASSETS}/reportimg/sleep_img/b12.jpg`,
  vitC:                `${ASSETS}/reportimg/sleep_img/vc.jpg`,
  vitD:                `${ASSETS}/reportimg/sleep_img/vd.jpg`,
  vitE:                `${ASSETS}/reportimg/sleep_img/ve.jpg`,
  magnesium:           `${ASSETS}/reportimg/sleep_img/mag.jpg`,
  iron:                `${ASSETS}/reportimg/sleep_img/iron.jpg`,
  sensitivityCover:    `${ASSETS}/reportimg/sleep_img/Sensitivity-and-Intolerance.jpg`,
  lactose:             `${ASSETS}/reportimg/sleep_img/lactose.jpg`,
  gluten:              `${ASSETS}/reportimg/sleep_img/gluten.jpg`,
  alcohol:             `${ASSETS}/reportimg/sleep_img/alcohol.jpg`,
  weightCover:         `${ASSETS}/reportimg/sleep_img/wtmanagement.jpg`,
  weight1:             `${ASSETS}/reportimg/sleep_img/wt1.jpg`,
  weightGap:           `${ASSETS}/reportimg/sleep_img/Weight_management_gapfill.jpg`,
  pdo:                 `${ASSETS}/reportimg/sleep_img/pdo.jpg`,
  adpl:                `${ASSETS}/reportimg/sleep_img/adpl.jpg`,
  fat:                 `${ASSETS}/reportimg/sleep_img/fat.jpg`,
  eatingCover:         `${ASSETS}/reportimg/sleep_img/eth.jpg`,
  satiety:             `${ASSETS}/reportimg/sleep_img/satiety.jpg`,
  fatPage:             `${ASSETS}/reportimg/sleep_img/fat_page.jpg`,
  eatingPeople:        `${ASSETS}/reportimg/sleep_img/people-eating-food.jpg`,
  lipidCover:          `${ASSETS}/reportimg/sleep_img/Genetic-Lipid-Profile.jpg`,
  lipid:               `${ASSETS}/reportimg/sleep_img/ldl.jpg`,
  lipidGap:            `${ASSETS}/reportimg/sleep_img/Genetic_lipid_profile_Gapfill.jpg`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#ffa700';
}

function gaugeImg(status: string, width = 50): string {
  const s = (status || 'good').toLowerCase();
  const key = s === 'poor' ? 'poor' : s === 'average' ? 'average' : 'good';
  return `<img src="${(IMG as any)[key]}" width="${width}" alt="${key}" style="display:block;margin:auto;"/>`;
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

.page.backImg {
  background-image: url('${ASSETS}/reportimg/sleep_img/Sleep_Apnea_page_18.jpg');
  background-size: 55%;
  background-position: right bottom;
  background-repeat: no-repeat;
  opacity: 0.95;
}

@page { margin: 0; size: 210mm 297mm; }
@media print {
  body { background: white; }
  .page { margin: 0; box-shadow: none; width: 100%; min-height: 100vh; }
}

/* Header */
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

/* Content box */
.content-box {
  margin: 0 auto;
  width: 180mm;
  position: relative;
  z-index: 1;
}

/* Typography */
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

/* Gene variants table (matches PHP .gene-varients) */
.gene-varients { width: 100%; border-collapse: collapse; }
.gene-varients tr:not(:first-child) { border-top: 10px solid white !important; }
.gene-varients td { vertical-align: top; padding: 6px 8px; }
.gene-varients td:first-child {
  background: ${themeColor};
  width: 25% !important;
  height: 100px;
}
.gene-varients td:last-child {
  background: #DFDFDF;
  width: 75% !important;
}

.gene-Id-style {
  border-bottom: 0.5px solid white;
  padding-bottom: 5px;
}
.gene-Id-style span { color: white; font-weight: 700; font-size: 11px; display: block; }

.gene-Id-style2 {
  border-bottom: 0.5px solid black;
  padding-bottom: 5px;
}
.gene-Id-style2 span { font-weight: 700; font-size: 13px; color: rgb(77,77,77); }

/* Response table (matches PHP .response) */
.response {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  margin-bottom: 5px;
}
.response td { vertical-align: top; padding: 10px 12px; }
.response td:first-child {
  width: 25% !important;
  background-color: #DFDFDF;
  text-align: center;
}
.response td.rImage {
  background: ${themeColor} !important;
  background-image: url('${ASSETS}/reportimg/imunity/recommend.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 20% 20%;
}
.response tr:first-child td:last-child {
  background: ${themeColor};
  color: white;
  height: 100px;
  padding: 0 20px;
}
.response tr:last-child td:last-child {
  background: #DFDFDF;
  padding: 0 20px;
  border-top: 10px solid white;
}
.response h4 {
  font-weight: 400;
  font-size: 13px;
  padding: 10px 0;
  border-bottom: 1px solid;
  margin: 0;
}
.response tr:first-child td:last-child h4 {
  color: white;
  border-bottom-color: white;
}
.response tr:last-child td:last-child h4 {
  color: ${themeColor};
  border-bottom-color: black;
}
.response tr:first-child td:last-child p { color: white !important; margin-top: 5px; line-height: 20px; }
.response tr:last-child td:last-child p { margin-top: 0; line-height: 20px; }
.response img { margin: auto; display: block; }

/* Condition header box (matches PHP immune_profile_header_box) */
.cond-header-wrap { position: relative; margin-bottom: 12px; }
.cond-header-img { width: 100%; height: 160px; object-fit: cover; object-position: center; display: block; }
.cond-title-box {
  position: absolute; top: 0; left: 0;
  background: white; padding: 5px 14px; max-width: 60%;
}
.cond-title-box h3 { color: ${themeColor}; font-size: 18px; font-weight: 700; margin: 0; }

/* Cover page heading */
.cover-page-heading {
  font-size: 40px !important;
  color: white !important;
  font-weight: bolder !important;
  position: absolute !important;
  bottom: 90px !important;
  left: 0 !important;
  right: 0 !important;
  text-align: center;
}
.cover-page-heading::after {
  content: "";
  border-bottom: 4px solid white;
  width: 182px;
  position: absolute;
  bottom: 0;
  top: 104px;
  left: 328px;
}
.cover-page-heading-mask {
  background: linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%);
  width: 100%;
  height: 19%;
  position: absolute;
  bottom: 0;
}

/* Page background for gene tables */
.backImg::after {
  content: '';
  background-image: url('${ASSETS}/reportimg/sleep_img/Sleep_Apnea_page_18.jpg');
  opacity: 0.05;
  position: absolute;
  bottom: 0; right: 0;
  width: 55%; height: 50%;
  z-index: 0;
  pointer-events: none;
}
`;
}

// ─── Reusable fragments ───────────────────────────────────────────────────────

function rptHeader(title = 'SLEEP REPORT'): string {
  return `<div class="rpt-header">${title}</div>`;
}

// ─── Gene + Response block builder ────────────────────────────────────────────

interface GeneRow {
  report_variant: string;
  gene: string;
  gene_desc: string;
}

function buildGeneVariantRows(genes: GeneRow[]): string {
  return genes.map(g => `
  <tr>
    <td>
      <div class="gene-Id-style"><span>Your Genotype</span></div>
      <div style="padding-top:8px;color:white">${g.report_variant || '—'}</div>
    </td>
    <td>
      <div class="gene-Id-style2"><span>${g.gene || '—'}</span></div>
      <p>${g.gene_desc || ''}</p>
    </td>
  </tr>`).join('');
}

function buildResponseBlock(
  status: string,
  interpretation: string,
  recommendation: string,
  tc: string
): string {
  return `
  <table class="response">
    <tbody>
      <tr>
        <td>
          <h4 style="color:${tc}">Your Response</h4>
          ${gaugeImg(status)}
        </td>
        <td>
          <h4 style="color:white">Interpretation</h4>
          <p style="color:white">${interpretation || '—'}</p>
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

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

/** Cover page for a section (matches PHP sample pages with cover-page-heading) */
function sectionCoverPage(
  bgImage: string,
  title: string
): string {
  return `
  <div class="page" style="page-break-after:always;background-image:url('${bgImage}');background-size:cover;background-position:center;">
    <div class="cover-page-heading-mask">
      <h2 class="cover-page-heading">${title}</h2>
    </div>
  </div>`;
}

/** One condition detail page (matches PHP pattern: header img + gene table + response) */
function conditionPage(
  heading: string,
  condDesc: string,
  headerImg: string,
  genes: GeneRow[],
  status: string,
  interpretation: string,
  recommendation: string,
  opts: PdfGeneratorOptions,
  pnTarget?: string
): string {
  const tc = getThemeColor(opts);
  const target = pnTarget ? ` data-pn-target="${pnTarget}"` : '';
  
  return `
  <div class="page${target}" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:80px;"></div>
    <div class="content-box">
      <div class="cond-header-wrap">
        <img src="${headerImg}" class="cond-header-img" alt="${heading}" onerror="this.style.display='none'"/>
        <div class="cond-title-box">
          <h3 style="color:${tc};font-size:18px;font-weight:700;margin:0;">${heading}</h3>
        </div>
      </div>
      ${condDesc ? `<p style="margin-top:8px;">${condDesc}</p>` : ''}
      <table class="gene-varients" style="width:100%">
        <tbody>${buildGeneVariantRows(genes)}</tbody>
      </table>
      ${buildResponseBlock(status, interpretation, recommendation, tc)}
    </div>
  </div>`;
}

/** Condition page with genes on one page, response on next (backImg style) */
function conditionPageSplit(
  heading: string,
  condDesc: string,
  headerImg: string,
  genes: GeneRow[],
  status: string,
  interpretation: string,
  recommendation: string,
  opts: PdfGeneratorOptions,
  pnTarget?: string
): string {
  const tc = getThemeColor(opts);
  const target = pnTarget ? ` data-pn-target="${pnTarget}"` : '';
  
  return `
  <div class="page backImg${target}" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:80px;"></div>
    <div class="content-box">
      <div class="cond-header-wrap">
        <img src="${headerImg}" class="cond-header-img" alt="${heading}" onerror="this.style.display='none'"/>
        <div class="cond-title-box">
          <h3 style="color:${tc};font-size:18px;font-weight:700;margin:0;">${heading}</h3>
        </div>
      </div>
      <br>
      <div class="content-box detox-content">
        <table class="gene-varients" style="width:100%">
          <tbody>${buildGeneVariantRows(genes)}</tbody>
        </table>
        ${buildResponseBlock(status, interpretation, recommendation, tc)}
      </div>
    </div>
  </div>`;
}

// ─── Sleep Report Condition Definitions ──────────────────────────────────────
// All 11 conditions that should appear in every sleep report

const SLEEP_CONDITIONS = [
  { key: 'obstructiveSleepStatus', name: 'Obstructive Sleep Apnea (OSA)', desc: '' },
  { key: 'durationOfSleepStatus', name: 'Duration of sleep', desc: '' },
  { key: 'caffineInsomniaStatus', name: 'Caffine related Insomnia', desc: '' },
  { key: 'restlessLegsStatus', name: 'Restless legs syndrome (RLS)', desc: '' },
  { key: 'narcolepsyStatus', name: 'Narcolepsy', desc: '' },
  { key: 'chronicObstructiveStatus', name: 'Chronic Obstructive Airway Disease', desc: '' },
  { key: 'lactoseIntoleranceStatus', name: 'Lactose Intolerance', desc: '' },
  { key: 'glutenIntoleranceStatus', name: 'Gluten Intolerance', desc: '' },
  { key: 'higherHDLStatus', name: 'Higher HDL Cholestrol', desc: '' },
  { key: 'vitB9Status', name: 'Vitamin B9', desc: '' },
  { key: 'vitDStatus', name: 'Vitamin D and Calcium (Ca)', desc: '' },
];

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildSleepReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const pd = opts.reportData?.PatientDetails || {};
  const sd = opts.reportData?.SampleDetails || {};
  
  // Get sections data from the report (engine-processed gene data)
  const sections = opts.reportData?.sections || {};
  const flatData = sections['flat'] || {};
  
  // Get patient additional data (auto-filled recommendations)
  const addDetails = opts.reportData?.addDetails || {};
  
  // Build condition data array from flatData (engine-processed gene data)
  const engineConditions: any[] = Array.isArray(flatData) ? flatData : [];
  
  // Build complete condition list from SLEEP_CONDITIONS definitions
  // Merge engine data with patientAdditional data for each condition
  const conditions = SLEEP_CONDITIONS.map(condDef => {
    // Find matching engine condition by name
    const engineCond = engineConditions.find(ec => {
      const ecName = (ec.display_condition || ec.condition_name || '').toLowerCase();
      const defName = condDef.name.toLowerCase();
      return ecName.includes(defName) || defName.includes(ecName);
    });
    
    // Get status from patientAdditional (auto-fill takes priority)
    const status = addDetails[condDef.key] || engineCond?.condition_status || 'Good';
    
    // Get recommendation and interpretation from patientAdditional
    const recKey = condDef.key.replace('Status', 'Recommendation');
    const interKey = condDef.key.replace('Status', 'Interpritation');
    const interpretation = addDetails[interKey] || engineCond?.interpretation || '—';
    const recommendation = addDetails[recKey] || engineCond?.recommendation || '—';
    
    // Get genes from engine data
    const genes: GeneRow[] = (engineCond?.genes || engineCond?.gene || []).map((g: any) => ({
      report_variant: g.report_variant || g.test_variant || '—',
      gene: g.gene || g.gene_name || '—',
      gene_desc: g.gene_desc || g.gene_description || '',
    }));
    
    return {
      display_condition: condDef.name,
      condition_name: condDef.name,
      condition_desc: condDef.desc,
      condition_status: status,
      interpretation,
      recommendation,
      genes,
    };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Sleep Health Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page" style="page-break-after:always;background-image:url('${IMG.sleepApneaCover}');background-size:cover;background-position:center;">
    <div class="cover-page-heading-mask">
      <h2 class="cover-page-heading">Obstructive Sleep Apnea</h2>
    </div>
    <p style="position:absolute;bottom:35px;left:0;right:0;text-align:center;font-size:13px;color:rgb(77,77,77);margin:0;">
      Patient Name: ${pd.name || '—'}
    </p>
  </div>

  <!-- Profile Page -->
  <div class="page" style="page-break-after:always;">
    ${rptHeader()}
    <div style="height:30px;"></div>
    <div class="content-box">
      <div style="text-align:center;margin-bottom:12px;">
        <span style="font-weight:700;font-size:16px;color:#426c7f;">NMC Genetics</span>
      </div>
      <div style="background:${themeColor};text-align:center;padding:8px 0;margin-bottom:20px;">
        <div style="font-weight:700;font-size:13px;color:#000;">SAMPLE ID: ${sd.kitBarcode || sd.vendorSampleId || '—'}</div>
      </div>
      <h3 style="color:${themeColor};font-size:22px;font-weight:400;margin:0 0 8px;">Your Profile</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr>
          <td style="background:${themeColor};padding:9px 12px;color:#fff;font-weight:600;width:48%;">PATIENT NAME</td>
          <td style="background:#f0f0f0;padding:9px 12px;width:52%;">${pd.name || '—'}</td>
        </tr>
        <tr>
          <td style="background:${themeColor};padding:9px 12px;color:#fff;font-weight:600;">AGE</td>
          <td style="background:#f0f0f0;padding:9px 12px;">${pd.age || '—'}</td>
        </tr>
        <tr>
          <td style="background:${themeColor};padding:9px 12px;color:#fff;font-weight:600;">GENDER</td>
          <td style="background:#f0f0f0;padding:9px 12px;">${pd.gender || '—'}</td>
        </tr>
        <tr>
          <td style="background:${themeColor};padding:9px 12px;color:#fff;font-weight:600;">SAMPLE ID</td>
          <td style="background:#f0f0f0;padding:9px 12px;">${sd.kitBarcode || sd.vendorSampleId || '—'}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Condition Pages - Generated from data -->
  ${conditions.map((cond: any, idx: number) => {
    const genes: GeneRow[] = (cond.genes || []).map((g: any) => ({
      report_variant: g.report_variant || g.test_variant || '—',
      gene: g.gene || g.gene_name || '—',
      gene_desc: g.gene_desc || g.gene_description || '',
    }));
    
    const status = cond.condition_status || cond.status || 'Good';
    const interpretation = cond.interpretation || cond.interpritation || cond.interKey || '—';
    const recommendation = cond.recommendation || cond.recKey || '—';
    
    return conditionPage(
      cond.display_condition || cond.condition_name || `Condition ${idx + 1}`,
      cond.condition_desc || '',
      IMG.sleepApnea18,
      genes,
      status,
      interpretation,
      recommendation,
      opts,
      `page${idx + 1}`
    );
  }).join('')}

  <!-- Last Page -->
  <div class="page" style="page-break-after:always;background:#333;">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:white;padding:40px;">
      <h2 style="color:white;">Sleep Health Report</h2>
      <p style="color:#ccc;margin-top:20px;">Generated by NMC Genetics</p>
    </div>
  </div>

  <script>
    // Page numbering
    (function() {
      var pages = document.querySelectorAll('.page');
      var total = pages.length;
      pages.forEach(function(page, i) {
        var span = document.createElement('span');
        span.style.cssText = 'font-size:14px;position:absolute;left:104mm;bottom:0;z-index:1000;background:#cacaca;color:black;padding:10px 15px;';
        span.textContent = (i + 1) + '/' + total;
        page.appendChild(span);
      });
    })();
  </script>
</body>
</html>`;
}