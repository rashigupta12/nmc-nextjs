// ============================================================
// Men's Health Report — Complete HTML Template Generator
// v2: Condition-name-based mapping (no index dependency)
//     Alopecia genes merged across all matching flat keys
// ============================================================

import { PdfGeneratorOptions, GenericApiResponse, ConditionData, GeneData } from '../reportEngine/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ASSETS = BASE_URL;

// ─── Image Registry ───────────────────────────────────────────────────────────

const IMG = {
  good:                   `${ASSETS}/reportimg/imunity/good.png`,
  average:                `${ASSETS}/reportimg/imunity/average.png`,
  poor:                   `${ASSETS}/reportimg/imunity/poor.png`,
  recommend:              `${ASSETS}/reportimg/imunity/recommend.png`,

  mainCover:              `${ASSETS}/reportimg/mens_images/mens_cover.jpg`,

  testicularAtrophyCover: `${ASSETS}/reportimg/mens_images/Pituitary-Testicular-Endocrine-Function-Risk--Testicular-atrophy.jpg`,
  testicularAtrophyDesc:  `${ASSETS}/reportimg/mens_images/ptert-p-14.jpg`,

  maleInfertilityCover:   `${ASSETS}/reportimg/mens_images/ARFRMI_cover.jpg`,
  maleInfertilityDesc:    `${ASSETS}/reportimg/mens_images/ARFRMI.jpg`,

  alopeciaCover:          `${ASSETS}/reportimg/mens_images/alopecia-Areata.jpg`,
  alopeciaDesc:           `${ASSETS}/reportimg/mens_images/alopecia-Areata-p-23.jpg`,

  thumb1:                 `${ASSETS}/reportimg/mens_images/thumbnail-1.jpg`,
  thumb2:                 `${ASSETS}/reportimg/mens_images/thumbnail-2.jpg`,
  thumb4:                 `${ASSETS}/reportimg/mens_images/thumbnail-4.jpg`,

  backCover:              `${ASSETS}/reportimg/imunity/Last Page.jpg`,
  quoteIcon:              `${ASSETS}/reportimg/imunity/quote.png`,

  dna1:                   `${ASSETS}/reportimg/dna1.png`,
  geneMutation:           `${ASSETS}/reportimg/genemutation.png`,
  geneMutationImg:        `${ASSETS}/reportimg/genemutation.jpg`,
};

// ─── Config Map (condition-name-based, NOT index-based) ───────────────────────

interface CondCfg {
  cover:     string;
  descImg:   string;
  pnTarget:  string;
  addKey?:   string;
  order:     number;   // controls render order
}

const CONDITION_CFG_MAP: CondCfg[] = [
  {
    cover:    IMG.testicularAtrophyCover,
    descImg:  IMG.testicularAtrophyDesc,
    pnTarget: 'One',
    order:    1,
  },
  {
    cover:    IMG.maleInfertilityCover,
    descImg:  IMG.maleInfertilityDesc,
    pnTarget: 'Two',
    order:    2,
  },
  {
    cover:    IMG.alopeciaCover,
    descImg:  IMG.alopeciaDesc,
    pnTarget: 'Four',
    addKey:   'alopeciaAreata',
    order:    3,
  },
];

function resolveCfg(conditionName: string): CondCfg | null {
  const n = (conditionName || '').toLowerCase();
  if (n.includes('testicular'))                      return CONDITION_CFG_MAP[0];
  if (n.includes('infertility') || n.includes('reproductive')) return CONDITION_CFG_MAP[1];
  if (n.includes('alopecia')    || n.includes('baldness'))      return CONDITION_CFG_MAP[2];
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#2b6e8c';
}

function gaugeImg(status: string, width = 165): string {
  const s   = (status || 'good').toLowerCase();
  const key = s === 'poor' ? 'poor' : s === 'average' ? 'average' : 'good';
  return `<img src="${(IMG as any)[key]}" width="${width}" alt="${key}" style="display:block;margin:auto;"/>`;
}

function formatGenes(genes: GeneData[]): string {
  if (!genes || genes.length === 0) return '—';
  return genes.map(g => g.name).join(', ');
}

function statusCellClass(status: string): string {
  const s = (status || 'good').toLowerCase();
  if (s === 'poor')    return 'poor-cell';
  if (s === 'average') return 'average-cell';
  return 'good-cell';
}

// ─── Merged condition builder ─────────────────────────────────────────────────
//
// The flat object can have MULTIPLE keys that belong to the SAME condition
// (e.g. "AR (Androgen Receptor)" AND "Risk of Spot Baldness in Males (Alopecia Areata)"
//  both resolve to the alopecia cfg).
// We merge them: first matching entry wins for meta (name, desc, status, etc.),
// and ALL genes across every matching entry are concatenated.

interface MergedCondition {
  cfg:            CondCfg;
  condition_name: string;
  condition_desc: string;
  heading1:       string;
  heading_desc1:  string;
  status:         string;
  interpretation: string;
  recommendation: string;
  genes:          GeneData[];
}

function buildMergedConditions(
  flatData:   Record<string, ConditionData[]>,
  addDetails: Record<string, any>,
): MergedCondition[] {

  // Map keyed by cfg.order so we don't duplicate sections
  const byOrder = new Map<number, MergedCondition>();

  for (const conds of Object.values(flatData)) {
    if (!conds?.length) continue;

    const primaryCond = conds[0];
    const cfg         = resolveCfg(primaryCond.condition_name);
    if (!cfg) continue;

    const existing = byOrder.get(cfg.order);

    if (!existing) {
      // First time we see this cfg — set up the merged entry
      let status         = primaryCond.condition_status || 'Good';
      let interpretation = primaryCond.interpretation   || '';
      let recommendation = primaryCond.recommendation   || '';

      if (cfg.addKey && addDetails) {
        status         = addDetails[`${cfg.addKey}Status`]          || status;
        interpretation = addDetails[`${cfg.addKey}Interpritation`]  || interpretation;
        recommendation = addDetails[`${cfg.addKey}Recommendation`]  || recommendation;
      }

      // Collect all genes from every ConditionData entry in this flat key
      const genes: GeneData[] = [];
      for (const c of conds) {
        if (c.gene?.length) genes.push(...c.gene);
      }

      byOrder.set(cfg.order, {
        cfg,
        condition_name: primaryCond.condition_name,
        condition_desc: primaryCond.condition_desc   || '',
        heading1:       primaryCond.heading1         || '',
        heading_desc1:  primaryCond.heading_desc1    || '',
        status,
        interpretation,
        recommendation,
        genes,
      });

    } else {
      // We've already registered this cfg — just APPEND genes from this flat key
      for (const c of conds) {
        if (c.gene?.length) existing.genes.push(...c.gene);
      }

      // If the first entry had empty desc/heading, try to fill from this one
      if (!existing.condition_desc && primaryCond.condition_desc) {
        existing.condition_desc  = primaryCond.condition_desc;
        existing.heading1        = primaryCond.heading1      || '';
        existing.heading_desc1   = primaryCond.heading_desc1 || '';
      }
    }
  }

  // Sort by defined order so pages always render: testicular → infertility → alopecia
  return Array.from(byOrder.values()).sort((a, b) => a.cfg.order - b.cfg.order);
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function buildCSS(themeColor: string): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Poppins', sans-serif;
  background: #e0e0e0;
  font-size: 14px;
  color: #4d4d4d;
}

/* ── Page Shell ─────────────────────────────────── */
.page {
  box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
  margin: 5mm auto;
  width: 210mm;
  min-height: 297mm;
  height: 297mm;
  background-color: white;
  position: relative;
  page-break-after: always;
  overflow: hidden;
}
@page { margin: 0; size: 210mm 297mm; }
@media print {
  body { background: white; }
  .page { margin: 0; box-shadow: none; width: 210mm; height: 297mm; }
}

/* ── No-break ───────────────────────────────────── */
.no-break  { page-break-inside: avoid; }
table      { page-break-inside: avoid; }
tr         { page-break-inside: avoid; }

/* ── Header right ───────────────────────────────── */
.rpt-header {
  position: absolute; top: 0; right: 0;
  display: flex; align-items: flex-end; z-index: 10;
}
.rpt-header-bar {
  width: 105px; height: 60px;
  background: ${themeColor};
  display: inline-block; flex-shrink: 0;
}
.rpt-header-text {
  font-size: 7.8pt; letter-spacing: 2.2px; color: #426c7f;
  font-weight: 500; text-transform: uppercase;
  padding: 0 13px 11px 0; white-space: nowrap; align-self: flex-end;
}

/* ── Header left ────────────────────────────────── */
.rpt-header-left {
  position: absolute; top: 0; left: 0;
  display: flex; align-items: flex-end; z-index: 10;
}
.rpt-header-left .rpt-header-bar { order: -1; }
.rpt-header-left .rpt-header-text {
  font-size: 7.8pt; letter-spacing: 2.2px; color: #426c7f;
  font-weight: 500; text-transform: uppercase;
  padding: 0 0 11px 13px; white-space: nowrap; align-self: flex-end;
}

/* ── Content wrapper ────────────────────────────── */
.content-box {
  margin: 0 auto; width: 180mm;
  padding-top: 74px; position: relative; z-index: 1;
}

/* ── Dotted bg ──────────────────────────────────── */
.dot-bg {
  position: absolute; bottom: 0; right: 0;
  width: 65%; height: 55%;
  background-image: radial-gradient(circle, #bbb 1px, transparent 1px);
  background-size: 20px 20px; opacity: 0.32;
  z-index: 0; pointer-events: none;
}

/* ── Typography ─────────────────────────────────── */
p {
  text-align: justify; color: #4d4d4d;
  font-size: 13.5px; font-weight: 400;
  margin: 0 0 9px 0; line-height: 1.68;
}
h3 { color: ${themeColor}; font-size: 21px; font-weight: 600; margin: 0 0 10px; }
h4 { font-size: 14px; color: #4d4d4d; font-weight: 600; margin: 9px 0 5px; }
ul { padding-left: 20px; }
ul li { margin-bottom: 6px; font-size: 13.5px; line-height: 1.65; color: #4d4d4d; }

/* ── Cover ──────────────────────────────────────── */
.cover-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center top;
  width: 100%; height: 100%;
}
.cover-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: white; padding: 32px 0 26px; text-align: center; z-index: 5;
}
.cover-dna-title {
  font-size: 34px; font-weight: 700; color: ${themeColor};
  letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 6px; line-height: 1.2;
}
.cover-sub    { font-size: 17px; color: #666; letter-spacing: 1.5px; margin-bottom: 5px; }
.cover-patient { font-size: 15px; color: #555; }

/* ── Profile ────────────────────────────────────── */
.logo-center { text-align: center; margin-bottom: 16px; }
.logo-center img { max-height: 74px; max-width: 200px; }
.sample-box {
  background: ${themeColor}; color: white; text-align: center;
  padding: 12px 20px; width: 60%; margin: 0 auto 20px; border-radius: 4px;
}
.sample-box .s-id { font-size: 14.5px; font-weight: 700; letter-spacing: 0.5px; }
.sample-box .s-dt { font-size: 12.5px; font-weight: 300; margin-top: 3px; opacity: 0.9; }
.prof-title { font-size: 26px; font-weight: 700; color: ${themeColor}; margin-bottom: 12px; }
.prof-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
.prof-table tr { page-break-inside: avoid; }
.prof-table td { padding: 8.5px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13.5px; vertical-align: middle; }
.prof-table td:first-child {
  background: ${themeColor}; color: white; font-weight: 700;
  width: 44%; text-transform: uppercase; letter-spacing: 0.3px; font-size: 12.5px;
}
.prof-table td:last-child { background: #f2f2f2; color: #333; text-transform: capitalize; }
.prof-footer { position: absolute; bottom: 26px; left: 0; right: 0; padding: 0 15mm; }
.prof-footer img { max-height: 56px; display: block; }
.prof-footer .fn { font-size: 13px; font-weight: 700; color: #333; margin-top: 4px; }
.prof-footer .ft { font-size: 12px; color: #666; }

/* ── Intro 2-col boxes ──────────────────────────── */
.intro-box { background: ${themeColor}; padding: 15px 17px; vertical-align: top; }
.intro-box h4 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.intro-box p  { color: rgba(255,255,255,0.93); font-size: 13px; line-height: 1.6; margin: 0 0 6px; text-align: justify; }

/* ── Risk table ─────────────────────────────────── */
.risk-table { width: 100%; border-collapse: collapse; margin-top: 14px; }
.risk-table th {
  background: #f0f0f0; font-size: 13.5px; font-weight: 700;
  padding: 9px 11px; text-align: left; border: 1px solid #ccc; color: #333;
}
.risk-table td { border: 1px solid #ccc; padding: 9px 11px; font-size: 13px; vertical-align: middle; line-height: 1.5; }
.zone-box { width: 82px; height: 22px; border-radius: 3px; display: inline-block; vertical-align: middle; }
.zone-green  { background: #4caf50; }
.zone-orange { background: #ff9800; }
.zone-red    { background: #f44336; }

/* ── TOC ────────────────────────────────────────── */
.toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
.toc-card { position: relative; overflow: hidden; border-radius: 3px; }
.toc-card-img { width: 100%; height: 192px; object-fit: cover; display: block; }
.toc-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.52); padding: 10px 12px; }
.toc-overlay span { color: white; font-size: 12.5px; font-weight: 500; line-height: 1.45; display: block; }
.toc-entry { display: flex; justify-content: space-between; font-size: 12.5px; color: #4d4d4d; padding: 6px 2px 0; line-height: 1.4; }
.toc-pg { font-weight: 700; color: ${themeColor}; flex-shrink: 0; padding-left: 8px; }

/* ── Summary ────────────────────────────────────── */
.sum-pill {
  background: ${themeColor}; color: white;
  font-size: 15.5px; font-weight: 600;
  border-radius: 30px; padding: 10px 24px;
  display: inline-block; margin-bottom: 18px;
}
.sum-table { width: 100%; border-collapse: collapse; }
.sum-table thead th {
  background: #e8e8e8; font-size: 13.5px; font-weight: 700;
  padding: 10px 11px; text-align: left;
  border-bottom: 2px solid #ccc; color: #333;
}
.sum-table tr { border-bottom: 1px solid #ddd; page-break-inside: avoid; }
.sum-table td { padding: 12px 11px; font-size: 13.5px; vertical-align: middle; }
.sum-table td:nth-child(2) { font-weight: 700; text-align: center; }
.good-cell    { color: #2e7d32 !important; }
.average-cell { color: #e65100 !important; }
.poor-cell    { color: #c62828 !important; }

/* ── Condition hero ─────────────────────────────── */
.cond-hero { position: absolute; inset: 0; background-size: cover; background-position: center; width: 100%; height: 100%; }
.cond-hero-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.50); padding: 30px 28px 40px;
  text-align: center; z-index: 3;
}
.cond-hero-title {
  color: white; font-size: 26px; font-weight: 600;
  text-shadow: 0 2px 8px rgba(0,0,0,0.45);
  text-decoration: underline; text-underline-offset: 7px;
}

/* ── Condition description ──────────────────────── */
.cond-banner-wrap { position: relative; margin-bottom: 13px; page-break-inside: avoid; }
.cond-banner-img  { width: 100%; height: 158px; object-fit: cover; object-position: center; display: block; }
.cond-title-bar   { background: white; padding: 7px 15px; position: absolute; top: 0; left: 0; z-index: 5; }
.cond-title-bar h3 { color: ${themeColor}; font-size: 19px; font-weight: 700; margin: 0; line-height: 1.35; }

/* ── Gene block ─────────────────────────────────── */
.gene-block { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: avoid; }
.gene-left  { background: ${themeColor}; width: 27%; padding: 12px 14px; vertical-align: top; }
.gene-right { background: #DFDFDF; width: 73%; padding: 12px 14px; vertical-align: top; }
.gene-lbl   { border-bottom: 1px solid rgba(255,255,255,0.45); padding-bottom: 5px; margin-bottom: 8px; }
.gene-lbl span { color: white; font-weight: 700; font-size: 10.5px; text-transform: uppercase; display: block; letter-spacing: 0.5px; }
.gene-val   { color: white; font-size: 17px; font-weight: 700; }
.gene-name-lbl  { border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 8px; }
.gene-name-lbl span { font-weight: 700; font-size: 14px; color: #4d4d4d; }
.gene-desc  { font-size: 12.5px; line-height: 1.6; color: #4d4d4d; margin: 0; text-align: justify; }

/* ── Response block ─────────────────────────────── */
.resp-block { width: 100%; border-collapse: collapse; margin-bottom: 7px; page-break-inside: avoid; }
.resp-left  { background: #DFDFDF; width: 27%; padding: 12px 8px; text-align: center; vertical-align: middle; }
.resp-right { background: ${themeColor}; width: 73%; padding: 14px 17px; vertical-align: top; }
.resp-yr    { font-size: 13px; font-weight: 600; color: ${themeColor}; margin-bottom: 9px; }
.resp-lbl   { font-size: 14px; font-weight: 600; color: white; border-bottom: 1px solid rgba(255,255,255,0.45); padding-bottom: 6px; margin-bottom: 8px; }
.resp-txt   { font-size: 13px; color: white; line-height: 1.6; margin: 0; text-align: justify; }

/* ── Recommendation block ───────────────────────── */
.rec-block { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
.rec-left  {
  background: ${themeColor}; width: 27%;
  background-image: url('${IMG.recommend}');
  background-repeat: no-repeat; background-size: contain; background-position: center;
  vertical-align: top; min-height: 90px;
}
.rec-right { background: #DFDFDF; width: 73%; padding: 14px 17px; vertical-align: top; }
.rec-lbl   { font-size: 14px; font-weight: 600; color: ${themeColor}; border-bottom: 1px solid #999; padding-bottom: 6px; margin-bottom: 8px; }
.rec-txt   { font-size: 13px; color: #4d4d4d; line-height: 1.6; margin: 0; text-align: justify; }

/* ── References ─────────────────────────────────── */
.ref-list { list-style: none; padding: 0; margin: 0; counter-reset: ref; }
.ref-list li {
  counter-increment: ref; font-size: 12px; line-height: 1.65;
  margin-bottom: 12px; padding-left: 22px;
  position: relative; font-weight: 600;
}
.ref-list li::before { content: counter(ref) "."; position: absolute; left: 0; }

/* ── Page number ────────────────────────────────── */
.page-num {
  font-size: 12.5px; position: absolute;
  left: 50%; transform: translateX(-50%);
  bottom: 0; z-index: 1000;
  background: #cacaca; color: #222;
  padding: 5px 16px; border-radius: 2px 2px 0 0; font-weight: 500;
}

/* ── Last page ──────────────────────────────────── */
.last-box {
  position: absolute; top: 55px; left: 50%; transform: translateX(-50%);
  width: 83%; border: 2px solid white; border-radius: 20px;
  padding: 24px 44px 36px; z-index: 9;
}
.last-quote-icon { width: 54px; opacity: 0.9; display: block; margin-bottom: 12px; }
.last-quote { color: white; font-size: 16.5px; font-weight: 300; line-height: 1.7; margin-bottom: 14px; text-align: justify; }
.last-author { color: white; font-size: 20px; font-weight: 600; }
`;
}

// ─── Header fragments ─────────────────────────────────────────────────────────

function hdrRight(): string {
  return `<div class="rpt-header"><span class="rpt-header-text">MEN'S HEALTH REPORT</span><span class="rpt-header-bar"></span></div>`;
}
function hdrLeft(): string {
  return `<div class="rpt-header-left"><span class="rpt-header-bar"></span><span class="rpt-header-text">MEN'S HEALTH REPORT</span></div>`;
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

function coverPage(opts: PdfGeneratorOptions): string {
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  return `
<div class="page hidepageno">
  <div class="cover-bg" style="background-image:url('${IMG.mainCover}');"></div>
  <div class="cover-bottom">
    <div class="cover-dna-title">DNA Men's Health Test</div>
    <div class="cover-sub">MEN'S HEALTH REPORT</div>
    <div class="cover-patient">Patient Name : ${pd.name || '—'}</div>
  </div>
</div>`;
}

function profilePage(opts: PdfGeneratorOptions): string {
  const pd     = (opts.reportData?.PatientDetails || {}) as any;
  const sd     = (opts.reportData?.SampleDetails  || {}) as any;
  const gLabel = pd.gender === 'M' ? 'Male' : pd.gender === 'F' ? 'Female' : pd.gender || '—';
  return `
<div class="page" style="background:#f8f8f8;">
  ${hdrRight()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="logo-center">
      <img src="${opts.vendor?.coverLogoUrl || ''}" alt="logo"/>
    </div>
    <div class="sample-box">
      <div class="s-id">SAMPLE ID: ${sd.vendorSampleId || sd.kitBarcode || '—'}</div>
      <div class="s-dt">Date of report : ${sd.report_date || '—'}</div>
    </div>
    <div class="prof-title">Your Profile</div>
    <table class="prof-table no-break">
      <tr><td>PATIENT NAME</td><td>${pd.name   || '—'}</td></tr>
      <tr><td>AGE (YEARS)</td> <td>${pd.age    || '—'}</td></tr>
      <tr><td>WEIGHT (KG)</td> <td>${pd.weight || '—'}</td></tr>
      <tr><td>GENDER</td>      <td>${gLabel}</td></tr>
      <tr><td>HEIGHT (CM)</td> <td>${pd.height || '—'}</td></tr>
      <tr><td>PATIENT ID</td>  <td>${pd.patientId || '—'}</td></tr>
      <tr><td>TEST ID</td>     <td>NMC-MH01</td></tr>
    </table>
    <table class="prof-table no-break" style="margin-top:14px;">
      <tr><td>SAMPLE ID</td>              <td>${sd.vendorSampleId || '—'}</td></tr>
      <tr><td>SAMPLE TYPE</td>            <td>${sd.sampleType     || '—'}</td></tr>
      <tr><td>SAMPLE COLLECTION DATE</td> <td>${sd.sample_date    || '—'}</td></tr>
      <tr><td>REPORT GENERATION DATE</td> <td>${sd.report_date    || '—'}</td></tr>
      <tr><td>REFERRED BY (DOCTOR)</td>   <td>${pd.referredBy     || '—'}</td></tr>
      <tr><td>REFERRED BY (HOSPITAL)</td> <td>${pd.hospital       || '—'}</td></tr>
    </table>
  </div>
  <div class="prof-footer">
    <img src="${opts.vendor?.logoUrl || ''}" alt="signature"/>
    <div class="fn">${opts.vendor?.vendorName || 'NMC Genetics'}</div>
    <div class="ft">Scientist - Human Genetics</div>
  </div>
</div>`;
}

function welcomePage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Welcome</h3>
    <h4 style="margin:12px 0 12px;font-size:14.5px;">Dear ${pd.name || 'Patient'} ,</h4>
    <p>Neotech (Formerly Known as NMC Genetics) is pleased to present your personalized Wellness DNA Report, based on your unique genetic profile. This report offers important insights into how your genes influence your overall well-being covering aspects such as weight management, nutritional needs, and lifestyle traits. The recommendations provided are supported by decades of global scientific research, including data from clinical trials and genomic studies curated by our expert team.</p>
    <p>Your DNA was extracted from your provided sample and processed in our advanced genetic testing facility using internationally validated protocols. Through this analysis, we've uncovered how your body may respond to key vitamins (like A, B, C), macronutrients (such as carbohydrates and fats), food sensitivities, and various wellness-related traits such as metabolic response, and recovery tendencies.</p>
    <p>Based on these findings, we've put together a set of personalized lifestyle and nutritional suggestions tailored to your genetic makeup. Our scientific knowledge base is continuously updated, allowing you to access improved insights and refresh your wellness plan over time.</p>
    <p>With this report, your wellness consultant or healthcare advisor now has a personalized guide to help you design a holistic lifestyle plan that supports your health goals. By following these science-based recommendations and seeking professional guidance, you can take confident steps toward long-term health and wellness.</p>
    <p style="margin-top:14px;">Wishing you good health!</p>
    <div style="margin-top:24px;">
      <img src="${opts.vendor?.logoUrl || ''}" style="max-height:62px;" alt="signature"/>
      <p style="margin-top:7px;">For Neotech<br><strong style="font-size:13.5px;">(Neotech Worldlab Pvt. Ltd.)</strong></p>
    </div>
  </div>
</div>`;
}

function aboutPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">About Us</h3>
    <p style="margin-top:11px;">At Neotech (Formerly Known as NMC Genetics), we combine the precision of genomics with the power of data integration and analytics to shape the future of personalized healthcare. As a next-generation clinical genomics company, our vision is to bridge the gap between cutting-edge science and real-world patient care through intelligent data-driven solutions.</p>
    <p>Backed by a state-of-the-art laboratory and advanced computational platforms, we transform complex genetic and clinical data into clear, actionable insights that empower healthcare professionals to deliver more informed, proactive, and personalized care.</p>
    <p>Our strength lies in our multidisciplinary team of molecular biologists, bioinformaticians, and data scientists, working together to decode the human genome and translate it into better health outcomes. Whether it's guiding nutritional choices, identifying disease risks, or enabling early interventions — data and DNA are at the heart of everything we do.</p>
    <p>With a strong focus on clinical genomics, predictive health, and precision medicine, Neotech (Formerly Known as NMC Genetics) is not just a lab — it's a visionary platform where data meets biology to transform healthcare as we know it.</p>
  </div>
</div>`;
}

function legalDisclaimerPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Legal Disclaimer</h3>
    <p style="margin-top:11px;">Legal Disclaimer: This report is based on your unique DNA analysis, conducted using your provided sample, and focuses on a selected panel of genes associated with general health and wellness traits. Neotech provides genetic testing services strictly for informational and investigational purposes only. The insights and suggestions presented in this report are not intended to replace professional medical advice, diagnosis, or treatment.</p>
    <p>This report is designed to be interpreted exclusively by qualified and licensed professionals, including but not limited to medical practitioners, clinical geneticists, registered dietitians, certified nutritionists, wellness consultants, and other licensed healthcare professionals. Neotech does not practice medicine, and this report does not constitute a medical or diagnostic document, nor should it be used as the sole basis for any clinical decisions. Although genetic information is unique to each individual, its interpretation is inherently probabilistic and must be considered alongside clinical context and other health assessments. The insights presented herein are not predictive of any specific future disease or health outcome.</p>
    <p>The interpretation of genetic data requires expert clinical judgment, and the information provided should be seen as a supportive tool, not a substitute for professional evaluation or clinical diagnostics. While Neotech provides general wellness-oriented recommendations, these do not account for your complete medical history, existing conditions, allergies, medications, or ongoing treatments even if such information has been shared with us.</p>
    <p><strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, Neotech, its affiliates, officers, employees, agents, and representatives shall not be held liable for any claims, demands, losses, liabilities, damages, or expenses (whether direct, indirect, incidental, consequential, special, punitive, or exemplary) arising out of or related to the use of, misuse of, reliance upon, or inability to use the information or recommendations contained in this report.</p>
    <p><strong>Consumer Rights:</strong> This disclaimer does not affect any statutory rights you may have as a consumer under applicable law. If you are unsure how to interpret the information provided in this report, please seek clarification from a certified healthcare professional.</p>
  </div>
</div>`;
}

function mensHealthInfoPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Men's Health</h3>
    <p style="margin-top:11px;">For many men, health is not the high priority in their lives. The ailments that cause the most deaths and illnesses in men are either preventable or treatable. But men are usually less willing than women to visit doctors for checkups or preventative care, to seek treatment during the early stages of an ailment or to seek mental health advice. Men are also more likely to engage in risky behavior like drinking alcohol in excess, smoking tobacco and driving dangerously. Luckily, there are many easy steps that men can take to improve their health.</p>
    <p><strong>Some facts about men's health</strong></p>
    <ul>
      <li>Major risks to men's health include heart disease, cancer, depression and the tendency to engage in risky behavior.</li>
      <li>Men are less likely than women to visit the doctor, resulting in more hospitalizations and deaths from preventable conditions.</li>
      <li>Harmful substances and the natural aging process are the top detriments to men's sexual health.</li>
      <li>Regular checkups and health screenings can result in longer, healthier lives in most men.</li>
      <li>Living a healthy lifestyle can prevent and treat most problems associated with men's health.</li>
    </ul>
  </div>
</div>`;
}

function introductionPage1(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Introduction</h3>
    <p style="margin:11px 0 16px;">DNA is the building block of all living organisms. Human DNA consists of about 3 billion bases, and more than 99% of those bases are the same in all people. The order or sequence of these bases is the set of instructions for building and maintaining an organism, similar in a way by which letters of the alphabet appear in a certain order to form words and sentences.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;" class="no-break">
      <tr>
        <td class="intro-box" style="width:48%;">
          <h4>What is DNA?</h4>
          <p>DNA (Deoxyribonucleic), is the hereditary material in humans and almost all other organisms.</p>
          <p>Most DNA is located in the cell nucleus (where it is called nuclear DNA), but a small amount of DNA can also be found in the mitochondria (where it is called mitochondrial DNA or mtDNA). The information in DNA is stored as a code made up of four chemical bases: adenine (A), guanine (G), cytosine (C), and thymine (T).</p>
        </td>
        <td style="width:52%;padding-left:18px;vertical-align:middle;">
          <img src="${IMG.dna1}" style="width:100%;display:block;" alt="DNA diagram"/>
        </td>
      </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;" class="no-break">
      <tr>
        <td style="width:48%;padding-right:18px;vertical-align:middle;">
          <img src="${IMG.geneMutation}" style="width:100%;display:block;" alt="Gene diagram"/>
        </td>
        <td class="intro-box" style="width:52%;">
          <h4>What is Gene??</h4>
          <p>A gene is the basic physical and functional unit of heredity. Genes are made up of DNA.</p>
          <p>Some genes act as instructions to make molecules called proteins. However, many genes do not code for proteins. In humans, genes vary in size from a few hundred DNA bases to more than 2 million bases. The Human Genome Project estimated that humans have between 20,000 and 25,000 genes. Every person has two copies of each gene, one inherited from each parent.</p>
        </td>
      </tr>
    </table>
  </div>
</div>`;
}

function introductionPage2(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;" class="no-break">
      <tr>
        <td class="intro-box" style="width:48%;">
          <h4>What is a gene mutation and how do mutations occur?</h4>
          <p>A gene mutation is a permanent alteration in the DNA sequence that makes up a gene, such that the sequence differs from what is found in most people.</p>
          <p>Mutations range in size; they can affect anywhere from a single DNA building block (base pair) to a large segment of a chromosome that includes multiple genes.</p>
        </td>
        <td style="width:52%;padding-left:18px;vertical-align:middle;">
          <img src="${IMG.geneMutationImg}" style="width:100%;display:block;" alt="Mutation diagram"/>
        </td>
      </tr>
    </table>
    <p style="margin-bottom:7px;">Gene mutations can be classified in two major ways:</p>
    <ul style="margin-bottom:14px;">
      <li>Hereditary (or germline) mutations or germline are inherited from a parent and are present throughout a person's life in virtually every cell in the body.</li>
      <li>Acquired (or somatic) mutations occur at some time during a person's life and are present only in certain cells, not in every cell in the body.</li>
    </ul>
    <h3 style="color:${tc};font-size:16px;margin-bottom:6px;">What is Genetic testing?</h3>
    <p>Genetic testing is a type of medical test that identifies changes in chromosomes, genes, or proteins. The results of a genetic test can confirm or rule out a suspected genetic condition or help determine a person's chance of developing or passing on a genetic disorder. Genetic tests can be performed using either saliva, blood, tissue or other human cells.</p>
    <h3 style="color:${tc};font-size:16px;margin:11px 0 6px;">What do the results of Genetic tests mean?</h3>
    <p>A positive test result means that the laboratory found a change in a particular gene, chromosome, or protein of interest. Depending on the purpose of the test, this result may confirm a diagnosis, indicate that a person is a carrier of a particular genetic mutation, identify an increased risk of developing a disease in the future, or suggest a need for further testing.</p>
    <p>A negative test result means that the laboratory did not find a change in the gene, chromosome, or protein under consideration. This result can indicate that a person is not affected by a particular disorder, is not a carrier of a specific genetic mutation, or does not have an increased risk of developing a certain disease. However, there is still the possibility that any unknown genetic variation can still be a risk factor.</p>
    <p>A variant of unknown significance (VUS) can also be found in a genetic sequence for which the association with disease risk is unclear.</p>
  </div>
</div>`;
}

function geneticWellbeingPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:18px;">How genetic testing impacts your wellbeing?</h3>
    <p style="margin-top:11px;">Genetic defects can affect our health, although in many cases they don't manifest into a disease, but increases the risk of disease. External factors (such as the environment or lifestyle) influences the manifestation of the disease. For example, If a person is intolerant to lactose, due to a genetic defect, this person is perfectly healthy as long as he or she does not consume milk or milk products. In many cases health issues appear only in conjunction with certain environmental influences - in this case, consuming products that contain lactose.</p>
    <p>Genetic variations called SNPs (pronounced "snips") or "deletions" or "additions" can affect the way our bodies absorb, metabolize, and utilize nutrients, and determine how effectively we eliminate Xenobiotics (drugs, pollutants) and even potential carcinogens. By understanding the mechanisms by which these genes work and analyzing data generated from genome-wide association studies (known as GWAS) and Mendelian randomization, scientists can now understand what impact SNPs may have on disease risk and relationship with certain gene-environmental contexts.</p>
    <p>Another example is, if a regulatory gene for iron intake is defective, this can increase the risk of iron assimilation into the body. Your healthcare practitioner can adjust iron intake through natural foods and supplements to mitigate the risk of iron deficiency.</p>
    <p>Once researchers understand how specific genotypes can affect how our genes function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.</p>
    <p>A healthy lifestyle is, of course, generally preferable, because it can neutralize many genetic predispositions even without knowing underlying risks. However, genetic testing provides you with appropriate information about underlying risk factors and help an individual to implement pro-active health plan with his/her healthcare practitioner to lead a healthy life.</p>
    <p style="margin-top:11px;font-weight:700;">SOME FACTS:</p>
    <p>In human beings, 99.9% bases are same, remaining 0.1% makes a person unique in terms of:</p>
    <ul>
      <li>Different attributes / characteristics / traits</li>
      <li>How a person looks and what disease risks he or she may have</li>
      <li>Harmless (no change in our normal health)</li>
      <li>Harmful (can develop into diseases like diabetes, cancer, heart disease, Huntington's disease, and hemophilia)</li>
      <li>Latent (These variations found in genes but are not harmful on their own. The change in each gene function only becomes apparent under certain conditions e.g. increase in stress and susceptibility to heart attack)</li>
    </ul>
  </div>
</div>`;
}

function aboutReportPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:21px;">About Your Men's Health Report</h3>
    <p style="margin-top:11px;">This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence. We use hundreds of studies to bring you the genetic information in the Genetic report.</p>
    <p>The reporting format is very consistent and very lucid to understand. The report comprises of following sections in that order.</p>
    <ol style="padding-left:20px;margin:9px 0 13px;font-size:13.5px;line-height:1.65;">
      <li style="margin-bottom:8px;"><strong>Summarized results section :</strong> This section comprise of master summary.</li>
      <li><strong>Detailed report section :</strong> This section gives the detailed overview of every condition. There is summarized results table, a group of relevant traits, corresponding genetic response and interpretations are listed. Each trait or phenotype has its response is marked as good, bad or average.</li>
    </ol>
    <p>This information provides you insight into specific risks such as effect of the marker on men's diseases. Summary of recommendations in terms do's and dont's of lifestyle, nutrition, supplementation or exercise are included. This is how the result for a genetic marker associated to an individual trait is graded:</p>
    <table class="risk-table no-break">
      <thead>
        <tr><th>Response</th><th>Risk Level</th><th>Zone</th><th>Interpretation</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Good</td><td>Low/Normal risk</td>
          <td><span class="zone-box zone-green"></span></td>
          <td>Your genetic predisposition to the disease is normal or low.</td>
        </tr>
        <tr>
          <td>Average</td><td>Medium risk</td>
          <td><span class="zone-box zone-orange"></span></td>
          <td>Your genetic predisposition to the disease is average. Hence, act as per the recommendations.</td>
        </tr>
        <tr>
          <td>Poor</td><td>High Risk</td>
          <td><span class="zone-box zone-red"></span></td>
          <td>Your genetic predisposition to the disease is high. Hence, act as per the recommendations or consult your healthcare practitioner.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`;
}

function tableOfContentsPage(opts: PdfGeneratorOptions): string {
  const tc    = getThemeColor(opts);
  const items = [
    { img: IMG.thumb1, label: 'Pituitary-Testicular Endocrine Function Risk / Testicular atrophy', pnKey: 'One'  },
    { img: IMG.thumb2, label: 'Abnormal Reproductive Function Risk / Male infertility',             pnKey: 'Two'  },
    { img: IMG.thumb4, label: 'Risk of Spot Baldness in Males (Alopecia Areata)',                   pnKey: 'Four' },
  ];
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Table of contents</h3>
    <div class="toc-grid">
      ${items.slice(0, 2).map(it => `
      <div>
        <div class="toc-card">
          <img src="${it.img}" class="toc-card-img" alt="${it.label}"/>
          <div class="toc-overlay"><span>${it.label}</span></div>
        </div>
        <div class="toc-entry">
          <span>${it.label}</span>
          <span class="toc-pg" data-pn="${it.pnKey}">—</span>
        </div>
      </div>`).join('')}
    </div>
    <div style="max-width:50%;margin-top:16px;">
      <div class="toc-card">
        <img src="${items[2].img}" class="toc-card-img" alt="${items[2].label}"/>
        <div class="toc-overlay"><span>${items[2].label}</span></div>
      </div>
      <div class="toc-entry">
        <span>${items[2].label}</span>
        <span class="toc-pg" data-pn="${items[2].pnKey}">—</span>
      </div>
    </div>
  </div>
</div>`;
}

// ── Summary — de-duplicated by condition name ─────────────────────────────────
function summaryPage(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const rows = merged.map(mc => {
    const genes = formatGenes(mc.genes);
    return `<tr class="no-break">
      <td>${mc.condition_name}</td>
      <td class="${statusCellClass(mc.status)}">${mc.status}</td>
      <td>${genes}</td>
    </tr>`;
  }).join('');

  return `
<div class="page" style="background:#f8f8f8;">
  ${hdrRight()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="sum-pill">Your summarized test report</div>
    <table class="sum-table no-break">
      <thead>
        <tr>
          <th style="width:46%;">Condition</th>
          <th style="width:16%;text-align:center;">Result</th>
          <th style="width:38%;">Genes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

// ── Condition pages — driven entirely by MergedCondition[] ────────────────────
function buildConditionPages(
  opts:   PdfGeneratorOptions,
  merged: MergedCondition[],
): string {
  const tc    = getThemeColor(opts);
  const pages: string[] = [];

  merged.forEach((mc, idx) => {
    const { cfg } = mc;
    const isEven  = idx % 2 === 0;

    // ── Hero cover (no page number) ──────────────────────────────────
    pages.push(`
<div class="page hidepageno">
  <div class="cond-hero" style="background-image:url('${cfg.cover}');"></div>
  <div class="cond-hero-bottom">
    <div class="cond-hero-title">${mc.condition_name}</div>
  </div>
</div>`);

    // ── Description page ─────────────────────────────────────────────
    pages.push(`
<div class="page" style="background:#f8f8f8;" data-pn-target="${cfg.pnTarget}">
  ${isEven ? hdrRight() : hdrLeft()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="cond-banner-wrap no-break">
      <img src="${cfg.descImg}" class="cond-banner-img" alt="${mc.condition_name}"/>
      <div class="cond-title-bar"><h3>${mc.condition_name}</h3></div>
    </div>
    <p style="margin-bottom:9px;">${mc.condition_desc}</p>
    ${mc.heading1      ? `<h4 style="color:${tc};margin:9px 0 5px;">${mc.heading1}</h4>`  : ''}
    ${mc.heading_desc1 ? `<div style="font-size:13.5px;line-height:1.65;">${mc.heading_desc1}</div>` : ''}
  </div>
</div>`);

    // ── Gene + Response + Recommendation page ────────────────────────
    if (mc.genes.length > 0) {
      const geneRows = mc.genes.map((gene: GeneData) => `
<table class="gene-block no-break" style="margin-bottom:8px;">
  <tr>
    <td class="gene-left">
      <div class="gene-lbl"><span>Your Genotype</span></div>
      <div class="gene-val">${gene.report_variant || gene.test_variant || '—'}</div>
    </td>
    <td class="gene-right">
      <div class="gene-name-lbl"><span>${gene.name || '—'}</span></div>
      <p class="gene-desc">${gene.gene_description || '—'}</p>
    </td>
  </tr>
</table>`).join('');

      pages.push(`
<div class="page" style="background:#f8f8f8;">
  ${isEven ? hdrLeft() : hdrRight()}
  <div class="dot-bg"></div>
  <div class="content-box">
    ${geneRows}
    <table class="resp-block no-break" style="margin-bottom:7px;">
      <tr>
        <td class="resp-left">
          <div class="resp-yr">Your Response</div>
          ${gaugeImg(mc.status, 160)}
        </td>
        <td class="resp-right">
          <div class="resp-lbl">Interpretation</div>
          <p class="resp-txt">${mc.interpretation}</p>
        </td>
      </tr>
    </table>
    <table class="rec-block no-break">
      <tr>
        <td class="rec-left" style="height:90px;"></td>
        <td class="rec-right">
          <div class="rec-lbl">Recommendation</div>
          <p class="rec-txt">${mc.recommendation}</p>
        </td>
      </tr>
    </table>
  </div>
</div>`);
    }
  });

  return pages.join('\n');
}

function sciencePage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Science behind the test</h3>
    <h4 style="margin:13px 0 6px;">Test Methodology</h4>
    <p>Genomic DNA is extracted from individual's Saliva/Tissue/Blood by commercial DNA extraction kits. The genotyping and variant detection is carried out based on illumina Infinium® array protocol. The DNA is then, amplified, fragmented and hybridized to known DNA fragments immobilized in arrays on a BeadChip. Millions of such known DNA fragments (50mer probes) containing the target genetic variants are immobilized on the chip. The hybridized chip is then washed to remove non-hybridized DNA fragments. Single-base extension of the oligos on the BeadChip, using the captured DNA as a template, incorporates detectable labels on the BeadChip and determines the genotype call for the sample. The Illumina iScan® or BeadArray Reader scans the BeadChip, using a laser to excite the fluorophore of the single-base extension product on the beads. The scanner records high-resolution images of the light emitted from the fluorophores.</p>
    <h4 style="margin:11px 0 6px;">Analytical Performance</h4>
    <p>The genotyping was performed using a custom genotyping array platform (Illumina Inc). This test is a laboratory developed test with high reproducibility > 99% and high call rates > 98% to detect the variants and its performance has been validated in-house. Note that some of the genotypes may be imputed.</p>
    <h4 style="margin:11px 0 6px;">Analysis</h4>
    <p>Illumina GenomeStudio® Software is used for efficient genotyping data normalization, genotype calling, clustering, data intensity analysis. Genotypes are called for each sample by their signal intensity (norm R) and Allele Frequency (Norm Theta) relative to canonical cluster positions for a given SNP marker. The report is manually reviewed by experts before release.</p>
  </div>
</div>`;
}

function referencesPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:27px;margin-bottom:22px;">References</h3>
    <ol class="ref-list">
      <li>Richards, J. Brent, et al. "Male-pattern baldness susceptibility locus at 20p11." Nature genetics 40.11 (2008): 1282</li>
      <li>Ohlsson, Claes et al. "Genetic determinants of serum testosterone concentrations in men." PLoS genetics vol. 7,10 (2011): e1002313. doi:10.1371/journal.pgen.1002313</li>
    </ol>
  </div>
</div>`;
}

function blankPage(): string {
  return `
<div class="page">
  <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-size:13.5px;">
    This page has been left blank intentionally.
  </div>
</div>`;
}

function lastPage(opts: PdfGeneratorOptions): string {
  return `
<div class="page hidepageno" style="background-image:url('${IMG.backCover}');background-size:cover;background-position:center;">
  <div class="last-box">
    <img src="${IMG.quoteIcon}" class="last-quote-icon" alt="Quote"/>
    <p class="last-quote">Health "Happiness doesn't come from being rich, nor merely from being successful in your career, nor by self-indulgence. One step towards happiness is to make yourself healthy and strong while you are a boy so that you can be useful and so you can enjoy life when you are a man".</p>
    <div class="last-author">-Robert Baden-Powell</div>
  </div>
</div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildMenHealthReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData as GenericApiResponse;
  const flatData   = (reportData?.sections?.['flat'] || {}) as Record<string, ConditionData[]>;
  const addDetails = (reportData?.addDetails || {}) as Record<string, any>;

  // ✅ Build merged conditions ONCE — used by both summaryPage and buildConditionPages
  const merged = buildMergedConditions(flatData, addDetails);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Men's Health Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${aboutPage(opts)}
  ${legalDisclaimerPage(opts)}
  ${mensHealthInfoPage(opts)}
  ${introductionPage1(opts)}
  ${introductionPage2(opts)}
  ${geneticWellbeingPage(opts)}
  ${aboutReportPage(opts)}
  ${tableOfContentsPage(opts)}
  ${summaryPage(opts, merged)}
  ${buildConditionPages(opts, merged)}
  ${sciencePage(opts)}
  ${referencesPage(opts)}
  ${blankPage()}
  ${lastPage(opts)}

  <script>
    (function () {
      const allPages      = Array.from(document.querySelectorAll('.page'));
      const numberedPages = allPages.filter(p => !p.classList.contains('hidepageno'));
      const total         = numberedPages.length;
      let   num           = 0;

      numberedPages.forEach(page => {
        num++;
        const stamp       = document.createElement('span');
        stamp.className   = 'page-num';
        stamp.textContent = num + '/' + total;
        page.appendChild(stamp);
      });

      // Wire TOC page numbers to actual positions
      document.querySelectorAll('[data-pn-target]').forEach(target => {
        const key    = target.getAttribute('data-pn-target');
        const idx    = numberedPages.indexOf(target as HTMLElement);
        const pageNo = idx >= 0 ? idx + 1 : '—';
        document.querySelectorAll('[data-pn="' + key + '"]').forEach(el => {
          el.textContent = String(pageNo);
        });
      });
    })();
  </script>
</body>
</html>`;
}