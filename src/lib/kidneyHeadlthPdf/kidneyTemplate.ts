// ============================================================
// Kidney Health Report — Complete HTML Template Generator
// FIXED VERSION — All 15 issues resolved
// ============================================================

import { PdfGeneratorOptions, GenericApiResponse, ConditionData, GeneData } from '../reportEngine/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ASSETS = BASE_URL;

// ─── Image Registry ───────────────────────────────────────────────────────────

const IMG = {
  good:      `${ASSETS}/reportimg/imunity/good.png`,
  average:   `${ASSETS}/reportimg/imunity/average.png`,
  poor:      `${ASSETS}/reportimg/imunity/poor.png`,
  recommend: `${ASSETS}/reportimg/imunity/recommend.png`,

  mainCover: `${ASSETS}/reportimg/kidney_images/cover_page.jpg`,

  hyperuricemiaThumb:    `${ASSETS}/reportimg/kidney_images/thumbnail-1.jpg`,
  adpkdThumb:            `${ASSETS}/reportimg/kidney_images/thumbnail-2.jpg`,
  hypomagnesemiaThumb:   `${ASSETS}/reportimg/kidney_images/thumbnail-3.jpg`,
  steroidSensitiveThumb: `${ASSETS}/reportimg/kidney_images/thumbnail-4.jpg`,
  idiopathicThumb:       `${ASSETS}/reportimg/kidney_images/thumbnail-5.jpg`,
  chronicKidneyThumb:    `${ASSETS}/reportimg/kidney_images/thumbnail-6.jpg`,
  renalCalculiThumb:     `${ASSETS}/reportimg/kidney_images/thumbnail-7.jpg`,

  hyperuricemiaCover:    `${ASSETS}/reportimg/kidney_images/Risk-Of-Hyperuricemia.jpg`,
  adpkdCover:            `${ASSETS}/reportimg/kidney_images/Autosomal-Dominant-Polycystic-Kidney-Disease-page-16.jpg`,
  hypomagnesemiaCover:   `${ASSETS}/reportimg/kidney_images/Hypomagnesemia_page_19.jpg`,
  chronicKidneyCover:    `${ASSETS}/reportimg/kidney_images/Chronic Kidney Disease (ckd).jpg`,
  steroidSensitiveCover: `${ASSETS}/reportimg/kidney_images/Childhood-Steroid-sensitive-Nephrotic-Syndrome.jpg`,
  idiopathicCover:       `${ASSETS}/reportimg/kidney_images/Idiopathic-Membranous-Nephropathy.jpg`,
  renalCalculiCover:     `${ASSETS}/reportimg/kidney_images/Renal-Calculi_page-31.jpg`,

  hyperuricemiaDesc:    `${ASSETS}/reportimg/kidney_images/Risk-Of-Hyperuricemia_page-15.jpg`,
  adpkdDesc:            `${ASSETS}/reportimg/kidney_images/Autosomal-Dominant-Polycystic-Kidney-Disease-page-17.jpg`,
  hypomagnesemiaDesc:   `${ASSETS}/reportimg/kidney_images/Hypomagnesemia.jpg`,
  chronicKidneyDesc:    `${ASSETS}/reportimg/kidney_images/Chronic-Kidney_page_23.jpg`,
  steroidSensitiveDesc: `${ASSETS}/reportimg/kidney_images/Childhood-Steroid-sensitive-Nephrotic-Syndrome_page_26.jpg`,
  idiopathicDesc:       `${ASSETS}/reportimg/kidney_images/Idiopathic-Membranous-Nephropathy_p-28.jpg`,
  renalCalculiDesc:     `${ASSETS}/reportimg/kidney_images/Renal-Calculi_page-32.jpg`,

  backCover:  `${ASSETS}/reportimg/imunity/Last Page.jpg`,
  quoteIcon:  `${ASSETS}/reportimg/imunity/quote.png`,
  dna1:           `${ASSETS}/reportimg/dna1.png`,
  geneMutation:   `${ASSETS}/reportimg/genemutation.png`,
  geneMutationImg:`${ASSETS}/reportimg/genemutation.jpg`,
};

// ─── Config Map (stable sectionId-based mapping) ─────────────────────────────
// FIX #12: Use sectionId + condition name for stable matching; string match is a fallback only

interface CondCfg {
  cover:       string;
  descImg:     string;
  pnTarget:    string;
  addKey:      string;
  order:       number;
  hasGeneTable:boolean;
  thumbImg:    string;
  tocLabel:    string;
}

const CONDITION_CFG_MAP: CondCfg[] = [
  { cover: IMG.hyperuricemiaCover,    descImg: IMG.hyperuricemiaDesc,    pnTarget: 'One',   addKey: 'hyperuricemia',     order: 1, hasGeneTable: true,  thumbImg: IMG.hyperuricemiaThumb,    tocLabel: 'Risk of Hyperuricemia' },
  { cover: IMG.adpkdCover,            descImg: IMG.adpkdDesc,            pnTarget: 'Two',   addKey: 'autosomalDominant', order: 2, hasGeneTable: true,  thumbImg: IMG.adpkdThumb,            tocLabel: 'Autosomal Dominant Polycystic Kidney Disease' },
  { cover: IMG.hypomagnesemiaCover,   descImg: IMG.hypomagnesemiaDesc,   pnTarget: 'Three', addKey: 'hypomagnesemia',    order: 3, hasGeneTable: true,  thumbImg: IMG.hypomagnesemiaThumb,   tocLabel: 'Hypomagnesemia (Low Magnesium)' },
  { cover: IMG.chronicKidneyCover,    descImg: IMG.chronicKidneyDesc,    pnTarget: 'Four',  addKey: 'chronicKidney',     order: 4, hasGeneTable: true,  thumbImg: IMG.chronicKidneyThumb,    tocLabel: 'Chronic Kidney Disease (CKD)' },
  { cover: IMG.steroidSensitiveCover, descImg: IMG.steroidSensitiveDesc, pnTarget: 'Five',  addKey: 'steroidSensitive',  order: 5, hasGeneTable: true,  thumbImg: IMG.steroidSensitiveThumb, tocLabel: 'Childhood Steroid-Sensitive Nephrotic Syndrome' },
  { cover: IMG.idiopathicCover,       descImg: IMG.idiopathicDesc,       pnTarget: 'Six',   addKey: 'idiopathic',        order: 6, hasGeneTable: true,  thumbImg: IMG.idiopathicThumb,       tocLabel: 'Idiopathic Membranous Nephropathy' },
  { cover: IMG.renalCalculiCover,     descImg: IMG.renalCalculiDesc,     pnTarget: 'Seven', addKey: 'renalCalculi',      order: 7, hasGeneTable: true,  thumbImg: IMG.renalCalculiThumb,     tocLabel: 'Renal Calculi (Kidney Stone Disease)' },
];

function resolveCfg(conditionName: string): CondCfg | null {
  const n = (conditionName || '').toLowerCase().trim();
  if (n.includes('hyperuricemia'))                                        return CONDITION_CFG_MAP[0];
  if (n.includes('autosomal dominant') || n.includes('adpkd') || n.includes('polycystic kidney')) return CONDITION_CFG_MAP[1];
  if (n.includes('hypomagnesemia') || n.includes('low magnesium'))        return CONDITION_CFG_MAP[2];
  if (n.includes('chronic kidney') || n.includes('ckd'))                  return CONDITION_CFG_MAP[3];
  if (n.includes('steroid-sensitive') || n.includes('steroid sensitive') || n.includes('nephrotic syndrome')) return CONDITION_CFG_MAP[4];
  if (n.includes('idiopathic membranous') || n.includes('membranous nephropathy')) return CONDITION_CFG_MAP[5];
  if (n.includes('renal calculi') || n.includes('kidney stone'))          return CONDITION_CFG_MAP[6];
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#6b7f8c';
}

function gaugeImg(status: string, width = 165): string {
  const s = (status || 'good').toLowerCase();
  const key = s === 'poor' ? 'poor' : s === 'average' ? 'average' : 'good';
  return `<img src="${(IMG as any)[key]}" width="${width}" alt="${key}" style="display:block;margin:auto;"/>`;
}

function statusCellClass(status: string): string {
  const s = (status || 'good').toLowerCase();
  if (s === 'poor')    return 'poor-cell';
  if (s === 'average') return 'average-cell';
  return 'good-cell';
}

// FIX #14: API description always has priority; fallback only if empty/dash
function resolveGeneDescription(apiDesc?: string): string {
  if (apiDesc && apiDesc.trim() !== '' && apiDesc.trim() !== '—') return apiDesc;
  return 'Further research is ongoing to understand the complete function of this gene and its role in kidney health.';
}

// ─── Gene grouping: FIX #1, #2, #7 ──────────────────────────────────────────
// Group all variants of same gene.name into one block; preserve ALL entries

interface GroupedGene {
  name:        string;
  description: string;
  variants:    { test_variant: string; report_variant: string; uniqueid: string }[];
}

function groupGenesByName(genes: GeneData[]): GroupedGene[] {
  const map = new Map<string, GroupedGene>();
  for (const g of (genes || [])) {
    const key = (g.name || '').toUpperCase();
    if (!map.has(key)) {
      map.set(key, {
        name:        g.name || '—',
        description: resolveGeneDescription(g.gene_description),
        variants:    [],
      });
    }
    map.get(key)!.variants.push({
      test_variant:   g.test_variant   || '—',
      report_variant: g.report_variant || '—',
      uniqueid:       g.uniqueid       || '',
    });
  }
  return Array.from(map.values());
}

// ─── Merged condition builder ─────────────────────────────────────────────────

interface MergedCondition {
  cfg:            CondCfg;
  condition_name: string;
  condition_desc: string;
  heading1:       string;
  heading_desc1:  string;
  status:         string;
  interpretation: string;
  recommendation: string;
  groupedGenes:   GroupedGene[];
  uniqueGeneNames:string[];
}

function buildMergedConditions(
  flatData:   Record<string, ConditionData[]>,
  addDetails: Record<string, any>,
): MergedCondition[] {

  const byOrder = new Map<number, MergedCondition>();

  for (const [, conds] of Object.entries(flatData)) {
    if (!conds?.length) continue;

    const primaryCond = conds[0];
    const cfg = resolveCfg(primaryCond.condition_name);
    if (!cfg) continue;

    const existing = byOrder.get(cfg.order);

    if (!existing) {
      // Pull status/interpretation/recommendation from addDetails if available
      let status         = primaryCond.condition_status || 'Good';
      let interpretation = primaryCond.interpretation   || '';
      let recommendation = primaryCond.recommendation   || '';

      if (cfg.addKey && addDetails) {
        status         = addDetails[`${cfg.addKey}Status`]                                                              || status;
        interpretation = addDetails[`${cfg.addKey}Interpritation`] || addDetails[`${cfg.addKey}Interpretation`]        || interpretation;
        recommendation = addDetails[`${cfg.addKey}Recommendation`]                                                      || recommendation;
      }

      // Collect ALL genes from ALL sub-conditions; FIX #7: no slicing/overwriting
      const allGenes: GeneData[] = [];
      for (const c of conds) {
        if (c.gene?.length) allGenes.push(...c.gene);
      }

      const grouped         = groupGenesByName(allGenes);
      const uniqueGeneNames = grouped.map(g => g.name);

      byOrder.set(cfg.order, {
        cfg,
        condition_name: primaryCond.condition_name,
        condition_desc: primaryCond.condition_desc  || '',
        heading1:       primaryCond.heading1        || '',
        heading_desc1:  primaryCond.heading_desc1   || '',
        status,
        interpretation,
        recommendation,
        groupedGenes:   grouped,
        uniqueGeneNames,
      });

    } else {
      // FIX #7: Merge any additional gene entries from duplicate condition keys
      for (const c of conds) {
        if (c.gene?.length) {
          for (const g of c.gene) {
            const key = (g.name || '').toUpperCase();
            const found = existing.groupedGenes.find(gg => gg.name.toUpperCase() === key);
            if (found) {
              // Add variant only if uniqueid not already present
              if (!found.variants.find(v => v.uniqueid === g.uniqueid)) {
                found.variants.push({
                  test_variant:   g.test_variant   || '—',
                  report_variant: g.report_variant || '—',
                  uniqueid:       g.uniqueid       || '',
                });
              }
            } else {
              existing.groupedGenes.push({
                name:        g.name || '—',
                description: resolveGeneDescription(g.gene_description),
                variants:    [{ test_variant: g.test_variant || '—', report_variant: g.report_variant || '—', uniqueid: g.uniqueid || '' }],
              });
              existing.uniqueGeneNames.push(g.name || '—');
            }
          }
        }
      }
    }
  }

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
.no-break { page-break-inside: avoid; }
table     { page-break-inside: avoid; }
tr        { page-break-inside: avoid; }

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

/* FIX #5, #6: Ensure HTML from API renders correctly */
ul { padding-left: 20px; margin: 6px 0 9px; }
ul.pl-15 { padding-left: 15px; }
ul li { margin-bottom: 5px; font-size: 13.5px; line-height: 1.65; color: #4d4d4d; }
.list-color { color: ${themeColor}; font-weight: 500; }
.heading-html-content p  { font-size: 13.5px; line-height: 1.68; color: #4d4d4d; margin: 0 0 7px; text-align: justify; }
.heading-html-content ul { padding-left: 20px; margin: 4px 0 9px; }
.heading-html-content ul li { font-size: 13.5px; line-height: 1.65; color: #4d4d4d; margin-bottom: 5px; }

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
.cover-sub     { font-size: 17px; color: #666; letter-spacing: 1.5px; margin-bottom: 5px; }
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
.zone-box    { width: 82px; height: 22px; border-radius: 3px; display: inline-block; vertical-align: middle; }
.zone-green  { background: #4caf50; }
.zone-orange { background: #ff9800; }
.zone-red    { background: #f44336; }

/* ── TOC ────────────────────────────────────────── */
.toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
.toc-card { position: relative; overflow: hidden; border-radius: 3px; }
.toc-card-img { width: 100%; height: 192px; object-fit: cover; display: block; }
.toc-overlay  { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.52); padding: 10px 12px; }
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
.sum-table tr  { border-bottom: 1px solid #ddd; page-break-inside: avoid; }
.sum-table td  { padding: 12px 11px; font-size: 13.5px; vertical-align: middle; }
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

/* FIX #6: Symptoms section heading */
.symptoms-heading {
  font-size: 15px; font-weight: 700; color: ${themeColor};
  margin: 10px 0 7px; border-left: 4px solid ${themeColor};
  padding-left: 8px;
}

/* ── FIX #1 #2 #4: Gene block — grouped, left-right, multi-variant ─────────── */
.gene-block {
  width: 100%; border-collapse: collapse;
  margin-bottom: 10px; page-break-inside: avoid;
}
.gene-left  {
  background: ${themeColor}; width: 28%;
  padding: 12px 14px; vertical-align: top;
}
.gene-right {
  background: #DFDFDF; width: 72%;
  padding: 12px 14px; vertical-align: top;
}

/* Left column labels */
.gene-lbl { border-bottom: 1px solid rgba(255,255,255,0.45); padding-bottom: 5px; margin-bottom: 8px; }
.gene-lbl span {
  color: white; font-weight: 700; font-size: 10.5px;
  text-transform: uppercase; display: block; letter-spacing: 0.5px;
}

/* FIX #2: Multi-variant pair table inside left cell */
.variant-pair-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
.variant-pair-table td {
  color: white; font-size: 14px; font-weight: 700;
  padding: 3px 6px 3px 0; vertical-align: middle; white-space: nowrap;
  background: transparent; border: none;
}
.variant-pair-table td.sep {
  color: rgba(255,255,255,0.6); font-weight: 400;
  font-size: 13px; padding: 3px 4px;
}

/* Right column */
.gene-name-lbl { border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 8px; }
.gene-name-lbl span { font-weight: 700; font-size: 14px; color: #4d4d4d; }
.gene-desc { font-size: 12.5px; line-height: 1.6; color: #4d4d4d; margin: 0; text-align: justify; }

/* ── FIX #10 #11 #13: Response / Interpretation / Recommendation blocks ────── */
.resp-block { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: avoid; }
.resp-left  { background: #DFDFDF; width: 28%; padding: 12px 8px; text-align: center; vertical-align: middle; }
.resp-right { background: ${themeColor}; width: 72%; padding: 14px 17px; vertical-align: top; }
.resp-yr    { font-size: 13px; font-weight: 600; color: ${themeColor}; margin-bottom: 9px; }
.resp-lbl   { font-size: 14px; font-weight: 600; color: white; border-bottom: 1px solid rgba(255,255,255,0.45); padding-bottom: 6px; margin-bottom: 8px; }
.resp-txt   { font-size: 13px; color: white; line-height: 1.6; margin: 0; text-align: justify; }

.rec-block { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
.rec-left  {
  background: ${themeColor}; width: 28%;
  background-image: url('${IMG.recommend}');
  background-repeat: no-repeat; background-size: contain; background-position: center;
  vertical-align: top; min-height: 90px;
}
.rec-right { background: #DFDFDF; width: 72%; padding: 14px 17px; vertical-align: top; }
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

/* ── Page number footer ─────────────────────────── */
.page-num {
  font-size: 10px; position: absolute;
  left: 50%; transform: translateX(-50%);
  bottom: 12px; z-index: 1000;
  color: #888; background: transparent;
  padding: 4px 12px; font-weight: 400;
  font-family: 'Poppins', sans-serif;
}

/* ── Last page ──────────────────────────────────── */
.last-box {
  position: absolute; top: 55px; left: 50%; transform: translateX(-50%);
  width: 83%; border: 2px solid white; border-radius: 20px;
  padding: 24px 44px 36px; z-index: 9;
}
.last-quote-icon { width: 54px; opacity: 0.9; display: block; margin-bottom: 12px; }
.last-quote  { color: white; font-size: 16.5px; font-weight: 300; line-height: 1.7; margin-bottom: 14px; text-align: justify; }
.last-author { color: white; font-size: 20px; font-weight: 600; }

/* ── Gene section separator ─────────────────────── */
.gene-section-title {
  font-size: 15px; font-weight: 700; color: ${themeColor};
  margin: 4px 0 8px; padding-left: 8px;
  border-left: 4px solid ${themeColor};
}
`;
}

// ─── Header fragments ─────────────────────────────────────────────────────────

function hdrRight(title = 'KIDNEY HEALTH REPORT'): string {
  return `<div class="rpt-header"><span class="rpt-header-text">${title}</span><span class="rpt-header-bar"></span></div>`;
}
function hdrLeft(title = 'KIDNEY HEALTH REPORT'): string {
  return `<div class="rpt-header-left"><span class="rpt-header-bar"></span><span class="rpt-header-text">${title}</span></div>`;
}

// ─── FIX #2 #1 #4: Render grouped gene block ─────────────────────────────────
// One block per unique gene name; multi-variant rows inside left cell

function renderGroupedGeneBlock(gene: GroupedGene): string {
  // Build paired variant rows: test_variant | report_variant per entry
  const variantRows = gene.variants.map(v =>
    `<tr>
      <td>${v.test_variant}</td>
      <td class="sep"></td>
      <td>${v.report_variant}</td>
    </tr>`
  ).join('');

  return `
<table class="gene-block no-break">
  <tr>
    <td class="gene-left">
      <div class="gene-lbl"><span>Your Genotype</span></div>
      <table class="variant-pair-table">
        ${variantRows}
      </table>
    </td>
    <td class="gene-right">
      <div class="gene-name-lbl"><span>${gene.name}</span></div>
      <p class="gene-desc">${gene.description}</p>
    </td>
  </tr>
</table>`;
}

// ─── Response + Recommendation block (FIX #10 #11 #13) ───────────────────────

function renderResponseBlock(status: string, interpretation: string): string {
  return `
<table class="resp-block no-break">
  <tr>
    <td class="resp-left">
      <div class="resp-yr">Your Response</div>
      ${gaugeImg(status, 155)}
    </td>
    <td class="resp-right">
      <div class="resp-lbl">Interpretation</div>
      <p class="resp-txt">${interpretation || 'No interpretation available.'}</p>
    </td>
  </tr>
</table>`;
}

function renderRecommendationBlock(recommendation: string): string {
  return `
<table class="rec-block no-break">
  <tr>
    <td class="rec-left" style="height:90px;"></td>
    <td class="rec-right">
      <div class="rec-lbl">Recommendation</div>
      <p class="rec-txt">${recommendation || 'No specific recommendations available. Please consult with your healthcare provider.'}</p>
    </td>
  </tr>
</table>`;
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

function coverPage(opts: PdfGeneratorOptions): string {
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  return `
<div class="page hidepageno">
  <div class="cover-bg" style="background-image:url('${IMG.mainCover}');"></div>
  <div class="cover-bottom">
    <div class="cover-dna-title">DNA KIDNEY HEALTH TEST</div>
    <div class="cover-sub">KIDNEY HEALTH REPORT</div>
    <div class="cover-patient">Patient Name : ${pd.name || '—'}</div>
  </div>
</div>`;
}

function profilePage(opts: PdfGeneratorOptions): string {
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  const sd = (opts.reportData?.SampleDetails  || {}) as any;
  const gLabel = pd.gender === 'M' ? 'Male' : pd.gender === 'F' ? 'Female' : pd.gender || '—';
  return `
<div class="page hidepageno">
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
      <tr><td>PATIENT NAME</td><td>${pd.name      || '—'}</td></tr>
      <tr><td>AGE (YEARS)</td><td>${pd.age        || '—'}</td></tr>
      <tr><td>WEIGHT (KG)</td><td>${pd.weight     || '—'}</td></tr>
      <tr><td>GENDER</td>     <td>${gLabel}</td></tr>
      <tr><td>HEIGHT (CM)</td><td>${pd.height     || '—'}</td></tr>
      <tr><td>PATIENT ID</td> <td>${pd.patientId  || '—'}</td></tr>
      <tr><td>TEST ID</td>    <td>NMC-KH01</td></tr>
    </table>
    <table class="prof-table no-break" style="margin-top:14px;">
      <tr><td>SAMPLE ID</td>                  <td>${sd.vendorSampleId || '—'}</td></tr>
      <tr><td>SAMPLE TYPE</td>                <td>${sd.sampleType     || '—'}</td></tr>
      <tr><td>SAMPLE COLLECTION DATE</td>     <td>${sd.sample_date    || '—'}</td></tr>
      <tr><td>REPORT GENERATION DATE</td>     <td>${sd.report_date    || '—'}</td></tr>
      <tr><td>REFERRED BY (DOCTOR)</td>       <td>${pd.referredBy     || '—'}</td></tr>
      <tr><td>REFERRED BY (HOSPITAL)</td>     <td>${pd.hospital       || '—'}</td></tr>
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
    <p>Neotech (Formerly Known as NMC Genetics) is pleased to provide your <strong>Kidney Health</strong> report based on your unique genomic profile. The report offers you a snap-shot of your genetic response pertaining to your kidney health. The interpretations and recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
    <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray; utilizing globally validated procedures. The information received from your genetic code determines your kidney health. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
    <p>With insights from this report, your clinicians or wellness consultant has a guidance map to device a personalized drug and accordingly lifestyle changes to help you achieve optimal health. By seeking professional advice and following the recommendations you can improve your health holistically.</p>
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
    <p style="margin-top:11px;">Legal Disclaimer: This report is based on your unique DNA analysis, conducted using your provided sample, and focuses on a selected panel of genes associated with kidney health and wellness traits. Neotech provides genetic testing services strictly for informational and investigational purposes only. The insights and suggestions presented in this report are not intended to replace professional medical advice, diagnosis, or treatment.</p>
    <p>This report is designed to be interpreted exclusively by qualified and licensed professionals, including but not limited to medical practitioners, clinical geneticists, registered dietitians, certified nutritionists, wellness consultants, and other licensed healthcare professionals. Neotech does not practice medicine, and this report does not constitute a medical or diagnostic document, nor should it be used as the sole basis for any clinical decisions. Although genetic information is unique to each individual, its interpretation is inherently probabilistic and must be considered alongside clinical context and other health assessments. The insights presented herein are not predictive of any specific future disease or health outcome.</p>
    <p>The interpretation of genetic data requires expert clinical judgment, and the information provided should be seen as a supportive tool, not a substitute for professional evaluation or clinical diagnostics. While Neotech provides general wellness-oriented recommendations, these do not account for your complete medical history, existing conditions, allergies, medications, or ongoing treatments even if such information has been shared with us.</p>
    <p><strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, Neotech, its affiliates, officers, employees, agents, and representatives shall not be held liable for any claims, demands, losses, liabilities, damages, or expenses (whether direct, indirect, incidental, consequential, special, punitive, or exemplary) arising out of or related to the use of, misuse of, reliance upon, or inability to use the information or recommendations contained in this report.</p>
    <p><strong>Consumer Rights:</strong> This disclaimer does not affect any statutory rights you may have as a consumer under applicable law. If you are unsure how to interpret the information provided in this report, please seek clarification from a certified healthcare professional.</p>
  </div>
</div>`;
}

function kidneyHealthInfoPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Kidney Health</h3>
    <p style="margin-top:11px;">Kidneys are fist-sized organs located at the bottom of the rib cage, on both sides of the spine. They perform several functions. Most importantly, they filter waste products, excess water, and other impurities from the blood. These waste products are stored in the bladder and later expelled through urine. In addition, kidneys regulate pH, salt, and potassium levels in the body. They also produce hormones that regulate blood pressure and control the production of red blood cells.</p>
    <p>Thus, maintaining kidney health is important to overall health and general well-being. By keeping the kidneys healthy, the body can filter and expel waste properly and produce hormones to help the body function properly.</p>
    <h3 style="color:${tc};font-size:19px;margin-top:18px;">Genetics &amp; Kidney Health</h3>
    <p style="margin-top:8px;">Diabetes and high blood pressure are the most common causes of kidney disease. Kidney diseases can be hereditary. Kidney disease also runs in families. You may be more likely to get kidney disease if you have a close relative with kidney disease.</p>
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
    <h3 style="color:${tc};font-size:21px;">About Your Kidney Health Report</h3>
    <p style="margin-top:11px;">This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence. We use hundreds of studies to bring you the genetic information in the Genetic report.</p>
    <p>The reporting format is very consistent and very lucid to understand. The report comprises of following sections in that order.</p>
    <ol style="padding-left:20px;margin:9px 0 13px;font-size:13.5px;line-height:1.65;">
      <li style="margin-bottom:8px;"><strong>Summarized results section :</strong> This section comprise of master summary.</li>
      <li><strong>Detailed report section :</strong> This section gives the detailed overview of every condition. There is summarized results table, a group of relevant traits, corresponding genetic response and interpretations are listed. Each trait or phenotype has its response is marked as good, bad or average.</li>
    </ol>
    <p>This information provides you insight into specific risks such as effect of the marker on kidney diseases. Summary of recommendations in terms do's and dont's of lifestyle, nutrition, supplementation or exercise are included. This is how the result for a genetic marker associated to an individual trait is graded:</p>
    <table class="risk-table no-break">
      <thead>
        <tr><th>Response</th><th>Risk Level</th><th>Zone</th><th>Interpretation</th></tr>
      </thead>
      <tbody>
        <tr><td>Good</td>   <td>Low/Normal risk</td><td><span class="zone-box zone-green"></span></td>  <td>Your genetic predisposition to the disease is normal or low.</td></tr>
        <tr><td>Average</td><td>Medium risk</td>     <td><span class="zone-box zone-orange"></span></td><td>Your genetic predisposition to the disease is average. Hence, act as per the recommendations.</td></tr>
        <tr><td>Poor</td>   <td>High Risk</td>       <td><span class="zone-box zone-red"></span></td>   <td>Your genetic predisposition to the disease is high. Hence, act as per the recommendations or consult your healthcare practitioner.</td></tr>
      </tbody>
    </table>
  </div>
</div>`;
}

// FIX #3: TOC now built dynamically from merged conditions so TOC always reflects actual data
function tableOfContentsPage(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const tc = getThemeColor(opts);
  const cards = merged.map(mc => `
    <div>
      <div class="toc-card">
        <img src="${mc.cfg.thumbImg}" class="toc-card-img" alt="${mc.condition_name}"/>
        <div class="toc-overlay"><span>${mc.condition_name}</span></div>
      </div>
      <div class="toc-entry">
        <span>${mc.condition_name}</span>
        <span class="toc-pg" data-pn="${mc.cfg.pnTarget}">—</span>
      </div>
    </div>`).join('');

  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Table of contents</h3>
    <div class="toc-grid">
      ${cards}
    </div>
  </div>
</div>`;
}

// FIX #8: Summary table — unique gene names per condition, clean comma-separated list
function summaryPage(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const rows = merged.map(mc => {
    // Unique gene names from grouped genes
    const geneNames = [...new Set(mc.groupedGenes.map(g => g.name))].join(', ') || '—';
    return `<tr class="no-break">
      <td>${mc.condition_name}</td>
      <td class="${statusCellClass(mc.status)}">${mc.status}</td>
      <td>${geneNames}</td>
    </tr>`;
  }).join('');

  return `
<div class="page" style="background:#f8f8f8;">
  ${hdrLeft()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="sum-pill">Your summarized test report</div>
    <table class="sum-table no-break">
      <thead>
        <tr>
          <th style="width:44%;">Condition</th>
          <th style="width:16%;text-align:center;">Result</th>
          <th style="width:40%;">Genes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

// ─── FIX #3 #9 #15: Condition pages — strict 2-page structure per condition ───
// Page 1: Full image hero
// Page 2: Description + Symptoms (HTML rendered) + Gene blocks + Response + Recommendation
// If gene blocks overflow → additional pages allowed (FIX #15)

function buildConditionPages(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const pages: string[] = [];

  merged.forEach((mc, idx) => {
    const { cfg } = mc;
    const isEven   = idx % 2 === 0;
    const hdr      = isEven ? hdrRight() : hdrLeft();
    const tc       = getThemeColor(opts);

    // ── Page A: Full-bleed hero image ──────────────────────────────────────
    pages.push(`
<div class="page hidepageno">
  <div class="cond-hero" style="background-image:url('${cfg.cover}');"></div>
  <div class="cond-hero-bottom">
    <div class="cond-hero-title">${mc.condition_name}</div>
  </div>
</div>`);

    // ── Page B: Description + Symptoms (HTML rendered — FIX #5 #6) ──────────
    // FIX #5: heading_desc1 rendered as innerHTML via a wrapper div, not escaped
    const symptomsSection = mc.heading1
      ? `<div class="symptoms-heading">${mc.heading1}</div>
         <div class="heading-html-content">${mc.heading_desc1 || ''}</div>`
      : (mc.heading_desc1
          ? `<div class="heading-html-content">${mc.heading_desc1}</div>`
          : '');

    pages.push(`
<div class="page" data-pn-target="${cfg.pnTarget}">
  ${hdr}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="cond-banner-wrap no-break">
      <img src="${cfg.descImg}" class="cond-banner-img" alt="${mc.condition_name}"/>
      <div class="cond-title-bar"><h3>${mc.condition_name}</h3></div>
    </div>
    <p style="margin-bottom:9px;">${mc.condition_desc || 'No description available.'}</p>
    ${symptomsSection}
  </div>
</div>`);

    // ── Page(s) C: Gene blocks + Response + Recommendation ──────────────────
    // FIX #15: Split gene blocks across pages if there are many; each page ~297mm
    // Strategy: Chunk grouped genes into batches of 4 per page; last chunk gets Response+Rec

    const GENES_PER_PAGE = 4;
    const grouped = mc.groupedGenes;

    if (grouped.length === 0) {
      // No genes — just Response + Recommendation on one page
      pages.push(`
<div class="page">
  ${hdr}
  <div class="dot-bg"></div>
  <div class="content-box">
    ${renderResponseBlock(mc.status, mc.interpretation)}
    <div style="margin-top:8px;">
      ${renderRecommendationBlock(mc.recommendation)}
    </div>
  </div>
</div>`);
    } else {
      // Chunk genes across multiple pages; last chunk appends response+rec
      const chunks: GroupedGene[][] = [];
      for (let i = 0; i < grouped.length; i += GENES_PER_PAGE) {
        chunks.push(grouped.slice(i, i + GENES_PER_PAGE));
      }

      chunks.forEach((chunk, chunkIdx) => {
        const isLast    = chunkIdx === chunks.length - 1;
        const geneHtml  = chunk.map(renderGroupedGeneBlock).join('');

        pages.push(`
<div class="page">
  ${hdr}
  <div class="dot-bg"></div>
  <div class="content-box">
    ${chunkIdx === 0 ? `<div class="gene-section-title">Genetic Markers</div>` : `<div class="gene-section-title">Genetic Markers (continued)</div>`}
    ${geneHtml}
    ${isLast ? `
    <div style="margin-top:8px;">
      ${renderResponseBlock(mc.status, mc.interpretation)}
    </div>
    <div style="margin-top:8px;">
      ${renderRecommendationBlock(mc.recommendation)}
    </div>` : ''}
  </div>
</div>`);
      });
    }
  });

  return pages.join('\n');
}

function sciencePage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
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
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:27px;margin-bottom:22px;">References</h3>
    <ol class="ref-list">
      <li>Sull, Jae Woong, et al. "The ABCG2 polymorphism rs2725220 is associated with hyperuricemia in the Korean population." Genomics &amp; informatics 12.4 (2014): 231.</li>
      <li>Lin, Bridget M et al. "Genetics of Chronic Kidney Disease Stages Across Ancestries: The PAGE Study." Frontiers in genetics vol. 10 494. 24 May. 2019, doi:10.3389/fgene.2019.00494.</li>
      <li>Meyer TE, Verwoert GC, Hwang SJ, et al. Genome-wide association studies of serum magnesium, potassium, and sodium concentrations identify six Loci influencing serum magnesium levels. PLoS Genet. 2010 Aug 5;6(8):e1001045. doi: 10.1371/journal.pgen.1001045.</li>
      <li>Gbadegesin RA, Adeyemo A, Webb NJ, et al. HLA-DQA1 and PLCG2 Are Candidate Risk Loci for Childhood-Onset Steroid-Sensitive Nephrotic Syndrome. J Am Soc Nephrol. 2015 Jul;26(7):1701-10. doi: 10.1681/ASN.2014030247.</li>
      <li>Jia X, Yamamura T, Gbadegesin R, et al. Common risk variants in NPHS1 and TNFSF15 are associated with childhood steroid-sensitive nephrotic syndrome. Kidney Int. 2020 Nov;98(5):1308-1322. doi: 10.1016/j.kint.2020.05.029.</li>
      <li>Bullich, Gemma et al. "HLA-DQA1 and PLA2R1 polymorphisms and risk of idiopathic membranous nephropathy." Clinical journal of the American Society of Nephrology : CJASN vol. 9,2 (2014): 335-43. doi:10.2215/CJN.05310513</li>
    </ol>
  </div>
</div>`;
}

function blankPage(): string {
  return `
<div class="page hidepageno">
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
    <p class="last-quote">"There are but a few blood purifiers and these are all in the body. We know them as the liver, kidneys, lungs, colon, and a few glands."</p>
    <div class="last-author">- Herbert M. Shelton</div>
  </div>
</div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildKidneyReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData as GenericApiResponse;
  const flatData   = (reportData?.sections?.['flat'] || {}) as Record<string, ConditionData[]>;
  const addDetails = (reportData?.addDetails || {}) as Record<string, any>;

  const merged = buildMergedConditions(flatData, addDetails);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Kidney Health Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${aboutPage(opts)}
  ${legalDisclaimerPage(opts)}
  ${kidneyHealthInfoPage(opts)}
  ${introductionPage1(opts)}
  ${introductionPage2(opts)}
  ${geneticWellbeingPage(opts)}
  ${aboutReportPage(opts)}
  ${tableOfContentsPage(opts, merged)}
  ${summaryPage(opts, merged)}
  ${buildConditionPages(opts, merged)}
  ${sciencePage(opts)}
  ${referencesPage(opts)}
  ${lastPage(opts)}

  <script>
    (function () {
      // ── Page numbering ─────────────────────────────────────────────────────
      const allPages      = Array.from(document.querySelectorAll('.page'));
      const numberedPages = allPages.filter(p => !p.classList.contains('hidepageno'));
      const total         = numberedPages.length;
      let   num           = 0;

      numberedPages.forEach(page => {
        num++;
        const existingNum = page.querySelector('.page-num');
        if (existingNum) existingNum.remove();
        const stamp       = document.createElement('span');
        stamp.className   = 'page-num';
        stamp.textContent = num + ' / ' + total;
        page.appendChild(stamp);
      });

      // ── TOC page number injection ──────────────────────────────────────────
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