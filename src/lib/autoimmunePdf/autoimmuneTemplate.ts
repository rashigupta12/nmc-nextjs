// ============================================================
// Autoimmune Health Report — Complete HTML Template Generator
// Based on NMC_Autoimmune_Report PDF sample + API data structure
// Mirrors kidney template architecture with autoimmune-specific conditions
// ============================================================

import { PdfGeneratorOptions, GenericApiResponse, ConditionData, GeneData } from '../reportEngine/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ASSETS = BASE_URL;

// ─── Image Registry ───────────────────────────────────────────────────────────

const IMG = {
  // Status gauge images
  good:      `${ASSETS}/reportimg/imunity/good.png`,
  average:   `${ASSETS}/reportimg/imunity/average.png`,
  poor:      `${ASSETS}/reportimg/imunity/poor.png`,
  recommend: `${ASSETS}/reportimg/imunity/recommend.png`,

  // Cover / back cover
  mainCover: `${ASSETS}/assets/reportimg/autoimmune_img/coverPage.jpg`,
  backCover: `${ASSETS}/reportimg/imunity/Last Page.jpg`,
  quoteIcon: `${ASSETS}/reportimg/imunity/quote.png`,

  // Intro / DNA images
  dna1:            `${ASSETS}/reportimg/dna1.png`,
  geneMutation:    `${ASSETS}/reportimg/genemutation.png`,
  geneMutationImg: `${ASSETS}/reportimg/genemutation.jpg`,

  // TOC / Condition thumbnail images
  ankylosingSpondylitisThumb:    `${ASSETS}/reportimg/autoimmune_img/thumbnail-1.jpg`,
  crohnsDiseaseThumb:            `${ASSETS}/reportimg/autoimmune_img/thumbnail-2.jpg`,
  celiacDiseaseThumb:            `${ASSETS}/reportimg/autoimmune_img/thumbnail-3.jpg`,
  hashimotoThumb:                `${ASSETS}/reportimg/autoimmune_img/thumbnail-4.jpg`,
  gravesDiseaseThumb:            `${ASSETS}/reportimg/autoimmune_img/thumbnail-5.jpg`,
  cutaneousLupusThumb:           `${ASSETS}/reportimg/autoimmune_img/thumbnail-6.jpg`,
  systemicLupusThumb:            `${ASSETS}/reportimg/autoimmune_img/thumbnail-7.jpg`,
  rheumatoidArthritisThumb:      `${ASSETS}/reportimg/autoimmune_img/thumbnail-8.jpg`,
  multipleSclerosisThumb:        `${ASSETS}/reportimg/autoimmune_img/thumbnail-9.jpg`,
  sjogrensThumb:                 `${ASSETS}/reportimg/autoimmune_img/thumbnail-10.jpg`,
  primaryBiliaryThumb:           `${ASSETS}/reportimg/autoimmune_img/thumbnail-11.jpg`,
  ulcerativeColitisThumb:        `${ASSETS}/reportimg/autoimmune_img/thumbnail-12.jpg`,
  idiopathicMembranousThumb:     `${ASSETS}/reportimg/autoimmune_img/thumbnail-13.jpg`,
  psoriasisThumb:                `${ASSETS}/reportimg/autoimmune_img/thumbnail-14.jpg`,

  // Full-bleed hero / cover images per condition
  ankylosingSpondylitisCover:    `${ASSETS}/reportimg/autoimmune_img/Ankylosing-Spondylitis.jpg`,
  crohnsDiseaseCover:            `${ASSETS}/reportimg/autoimmune_img/Crohns-Disease.jpg`,
  celiacDiseaseCover:            `${ASSETS}/reportimg/autoimmune_img/Celiac-Disease.jpg`,
  hashimotoCover:                `${ASSETS}/reportimg/autoimmune_img/Hashimoto-Thyroiditis.jpg`,
  gravesDiseaseCover:            `${ASSETS}/reportimg/autoimmune_img/Graves-Disease.jpg`,
  cutaneousLupusCover:           `${ASSETS}/reportimg/autoimmune_img/Cutaneous-Lupus-Erythematosus.jpg`,
  systemicLupusCover:            `${ASSETS}/reportimg/autoimmune_img/Cutaneous-Lupus-Erythematosus.jpg`,
  rheumatoidArthritisCover:      `${ASSETS}/reportimg/autoimmune_img/Systemic-Lupus-Erythematosus.jpg`,
  multipleSlerosisCover:         `${ASSETS}/reportimg/autoimmune_img/Multiple-Sclerosis.jpg`,
  sjogrensCover:                 `${ASSETS}/reportimg/autoimmune_img/Sjogrens-Syndrome.jpg`,
  primaryBiliaryCover:           `${ASSETS}/reportimg/autoimmune_img/Primary-Biliary-Cirrhosis.jpg`,
  ulcerativeColitisCover:        `${ASSETS}/reportimg/autoimmune_img/Ulcerative-Colitis.jpg`,
  idiopathicMembranousCover:     `${ASSETS}/reportimg/autoimmune_img/Idiopathic-Membranous-Nephropathy.jpg`,
  psoriasisCover:                `${ASSETS}/reportimg/autoimmune_img/Psorasis.jpg`,

  // Description banner images (shown above condition body text)
  ankylosingSpondylitisDesc:     `${ASSETS}/reportimg/autoimmune_img/Ankylosing-Spondylitis_p-16.jpg`,
  crohnsDiseaseDesc:             `${ASSETS}/reportimg/autoimmune_img/Crohns-Disease_p-19.jpg`,
  celiacDiseaseDesc:             `${ASSETS}/reportimg/autoimmune_img/Celiac-Disease_p-22.jpg`,
  hashimotoDesc:                 `${ASSETS}/reportimg/autoimmune_img/Hashimoto-Thyroiditis_p-25.jpg`,
  gravesDiseaseDesc:             `${ASSETS}/reportimg/autoimmune_img/Graves-Disease_p-28.jpg`,
  cutaneousLupusDesc:            `${ASSETS}/reportimg/autoimmune_img/Cutaneous-Lupus-Erythematosus_p31.jpg`,
  systemicLupusDesc:             `${ASSETS}/reportimg/autoimmune_img/Cutaneous-Lupus-Erythematosus_p31.jpg`,
  rheumatoidArthritisDesc:       `${ASSETS}/reportimg/autoimmune_img/Rheumatoid-Arthritis_p-37.jpg`,
  multipleSclerosisDesc:         `${ASSETS}/reportimg/autoimmune_img/Multiple-Sclerosis_p-40.jpg`,
  sjogrensDesc:                  `${ASSETS}/reportimg/autoimmune_img/Sj-Grens-Syndrome_p43.jpg`,
  primaryBiliaryDesc:            `${ASSETS}/reportimg/autoimmune_img/Primary-Biliary-Cirrhosis_p-46.jpg`,
  ulcerativeColitisDesc:         `${ASSETS}/reportimg/autoimmune_img/Ulcerative-Colitis_p49.jpg`,
  idiopathicMembranousDesc:      `${ASSETS}/reportimg/autoimmune_img/Idiopathic-Membranous-Nephropathy_p-52.jpg`,
  psoriasisDesc:                 `${ASSETS}/reportimg/autoimmune_img/Psoriasis_p55.jpg`,
};

// ─── Condition Configuration Map ──────────────────────────────────────────────

interface ConditionCfg {
  coverImg:    string;
  descImg:     string;
  thumbImg:    string;
  pnTarget:    string;
  order:       number;
  tocLabel:    string;
}

/**
 * Maps condition_name (from API) → display config.
 * Matching is case-insensitive substring matching.
 */
const CONDITION_CFG_MAP: ConditionCfg[] = [
  {
    coverImg:  IMG.ankylosingSpondylitisCover,
    descImg:   IMG.ankylosingSpondylitisDesc,
    thumbImg:  IMG.ankylosingSpondylitisThumb,
    pnTarget:  'One',
    order:     1,
    tocLabel:  'Ankylosing Spondylitis',
  },
  {
    coverImg:  IMG.crohnsDiseaseCover,
    descImg:   IMG.crohnsDiseaseDesc,
    thumbImg:  IMG.crohnsDiseaseThumb,
    pnTarget:  'Two',
    order:     2,
    tocLabel:  "Crohn's Disease",
  },
  {
    coverImg:  IMG.celiacDiseaseCover,
    descImg:   IMG.celiacDiseaseDesc,
    thumbImg:  IMG.celiacDiseaseThumb,
    pnTarget:  'Three',
    order:     3,
    tocLabel:  'Celiac Disease',
  },
  {
    coverImg:  IMG.hashimotoCover,
    descImg:   IMG.hashimotoDesc,
    thumbImg:  IMG.hashimotoThumb,
    pnTarget:  'Four',
    order:     4,
    tocLabel:  'Hashimoto Thyroiditis',
  },
  {
    coverImg:  IMG.gravesDiseaseCover,
    descImg:   IMG.gravesDiseaseDesc,
    thumbImg:  IMG.gravesDiseaseThumb,
    pnTarget:  'Five',
    order:     5,
    tocLabel:  "Graves' Disease",
  },
  {
    coverImg:  IMG.cutaneousLupusCover,
    descImg:   IMG.cutaneousLupusDesc,
    thumbImg:  IMG.cutaneousLupusThumb,
    pnTarget:  'Six',
    order:     6,
    tocLabel:  'Cutaneous Lupus Erythematosus',
  },
  {
    coverImg:  IMG.systemicLupusCover,
    descImg:   IMG.systemicLupusDesc,
    thumbImg:  IMG.systemicLupusThumb,
    pnTarget:  'Seven',
    order:     7,
    tocLabel:  'Systemic lupus erythematosus',
  },
  {
    coverImg:  IMG.rheumatoidArthritisCover,
    descImg:   IMG.rheumatoidArthritisDesc,
    thumbImg:  IMG.rheumatoidArthritisThumb,
    pnTarget:  'Eight',
    order:     8,
    tocLabel:  'Rheumatoid Arthritis',
  },
  {
    coverImg:  IMG.multipleSlerosisCover,
    descImg:   IMG.multipleSclerosisDesc,
    thumbImg:  IMG.multipleSclerosisThumb,
    pnTarget:  'Nine',
    order:     9,
    tocLabel:  'Multiple Sclerosis',
  },
  {
    coverImg:  IMG.sjogrensCover,
    descImg:   IMG.sjogrensDesc,
    thumbImg:  IMG.sjogrensThumb,
    pnTarget:  'Ten',
    order:     10,
    tocLabel:  "Sjögren's Syndrome",
  },
  {
    coverImg:  IMG.primaryBiliaryCover,
    descImg:   IMG.primaryBiliaryDesc,
    thumbImg:  IMG.primaryBiliaryThumb,
    pnTarget:  'Eleven',
    order:     11,
    tocLabel:  'Primary Biliary Cirrhosis',
  },
  {
    coverImg:  IMG.ulcerativeColitisCover,
    descImg:   IMG.ulcerativeColitisDesc,
    thumbImg:  IMG.ulcerativeColitisThumb,
    pnTarget:  'Twelve',
    order:     12,
    tocLabel:  'Ulcerative Colitis',
  },
  {
    coverImg:  IMG.idiopathicMembranousCover,
    descImg:   IMG.idiopathicMembranousDesc,
    thumbImg:  IMG.idiopathicMembranousThumb,
    pnTarget:  'Thirteen',
    order:     13,
    tocLabel:  'Idiopathic Membranous Nephropathy',
  },
  {
    coverImg:  IMG.psoriasisCover,
    descImg:   IMG.psoriasisDesc,
    thumbImg:  IMG.psoriasisThumb,
    pnTarget:  'Fourteen',
    order:     14,
    tocLabel:  'Psoriasis',
  },
];

function resolveCfg(conditionName: string): ConditionCfg | null {
  const n = (conditionName || '').toLowerCase().trim();
  if (n.includes('ankylosing') || n.includes('spondylitis'))                           return CONDITION_CFG_MAP[0];
  if (n.includes('crohn'))                                                              return CONDITION_CFG_MAP[1];
  if (n.includes('celiac'))                                                             return CONDITION_CFG_MAP[2];
  if (n.includes('hashimoto'))                                                          return CONDITION_CFG_MAP[3];
  if (n.includes('graves') || n.includes('grave'))                                     return CONDITION_CFG_MAP[4];
  if (n.includes('cutaneous lupus') || n.includes('cutaneous'))                        return CONDITION_CFG_MAP[5];
  if (n.includes('systemic lupus') || n.includes('sle'))                               return CONDITION_CFG_MAP[6];
  if (n.includes('rheumatoid'))                                                         return CONDITION_CFG_MAP[7];
  if (n.includes('multiple sclerosis') || n.includes('sclerosis'))                     return CONDITION_CFG_MAP[8];
  if (n.includes('sj') && (n.includes('gren') || n.includes('grens')))                return CONDITION_CFG_MAP[9];
  if (n.includes('primary biliary') || n.includes('biliary'))                          return CONDITION_CFG_MAP[10];
  if (n.includes('ulcerative') || n.includes('colitis'))                               return CONDITION_CFG_MAP[11];
  if (n.includes('idiopathic') || n.includes('membranous nephropathy'))                return CONDITION_CFG_MAP[12];
  if (n.includes('psoriasis'))                                                          return CONDITION_CFG_MAP[13];
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#5b244e';
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

function resolveGeneDescription(apiDesc?: string): string {
  if (apiDesc && apiDesc.trim() !== '' && apiDesc.trim() !== '—') return apiDesc;
  return 'Further research is ongoing to understand the complete function of this gene and its role in autoimmune disease.';
}

// ─── Gene Grouping ────────────────────────────────────────────────────────────

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
    // Deduplicate by uniqueid
    const existing = map.get(key)!;
    if (!existing.variants.find(v => v.uniqueid === g.uniqueid)) {
      existing.variants.push({
        test_variant:   g.test_variant   || '—',
        report_variant: g.report_variant || '—',
        uniqueid:       g.uniqueid       || '',
      });
    }
  }
  return Array.from(map.values());
}

// ─── Merged Condition Builder ─────────────────────────────────────────────────

interface MergedCondition {
  cfg:            ConditionCfg;
  condition_name: string;
  display_name:   string;
  condition_desc: string;
  heading1:       string;
  heading_desc1:  string;
  status:         string;
  interpretation: string;
  recommendation: string;
  groupedGenes:   GroupedGene[];
  uniqueGeneNames:string[];
}

/**
 * The autoimmune API returns data.sections.flat as a Record<string, ConditionData[]>
 * where the key is either the condition name or display_condition.
 * Each array entry corresponds to one sub-condition/gene group.
 * We merge all entries with the same resolved condition config into one MergedCondition.
 */
function buildMergedConditions(
  flatData:   Record<string, ConditionData[]>,
  addDetails: Record<string, any> | null,
): MergedCondition[] {
  const byOrder = new Map<number, MergedCondition>();

  for (const [, conds] of Object.entries(flatData)) {
    if (!conds?.length) continue;

    const primaryCond = conds[0];
    // Use condition_name for matching; fallback to display_condition
    const nameToMatch = primaryCond.condition_name || primaryCond.display_condition || '';
    const cfg = resolveCfg(nameToMatch);
    if (!cfg) continue;

    const existing = byOrder.get(cfg.order);

    if (!existing) {
      // Pull status/interpretation/recommendation from addDetails (manual overrides) if available
      let status         = primaryCond.condition_status || 'Good';
      let interpretation = primaryCond.interpretation   || '';
      let recommendation = primaryCond.recommendation   || '';

      if (addDetails) {
        // Try all known addDetails keys based on condition
        status         = resolveAddDetailsField(cfg, addDetails, 'Status')         || status;
        interpretation = resolveAddDetailsField(cfg, addDetails, 'Interpretation') || interpretation;
        recommendation = resolveAddDetailsField(cfg, addDetails, 'Recommendation') || recommendation;
      }

      const allGenes: GeneData[] = [];
      for (const c of conds) {
        if (c.gene?.length) allGenes.push(...c.gene);
      }

      const grouped         = groupGenesByName(allGenes);
      const uniqueGeneNames = grouped.map(g => g.name);

      byOrder.set(cfg.order, {
        cfg,
        condition_name: primaryCond.condition_name || nameToMatch,
        display_name:   primaryCond.display_condition || primaryCond.condition_name || nameToMatch,
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
      // Merge additional genes from duplicate keys
      for (const c of conds) {
        if (!c.gene?.length) continue;
        for (const g of c.gene) {
          const key   = (g.name || '').toUpperCase();
          const found = existing.groupedGenes.find(gg => gg.name.toUpperCase() === key);
          if (found) {
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

  return Array.from(byOrder.values()).sort((a, b) => a.cfg.order - b.cfg.order);
}

/**
 * Resolves addDetails fields using the known key patterns from the PHP backend.
 * e.g. ankylosingSpondylitisStatus, crohnsDiseaseStatus, systemicLupusInterpretation, etc.
 */
function resolveAddDetailsField(
  cfg:        ConditionCfg,
  addDetails: Record<string, any>,
  fieldType:  'Status' | 'Interpretation' | 'Recommendation',
): string {
  const order = cfg.order;
  // Map order to addDetails key prefixes (matching PHP saveAutoimmuneAdditional)
  const keyPrefixMap: Record<number, string[]> = {
    1:  ['ankylosingSpondylitis'],
    2:  ['crohnsDisease'],
    3:  ['celiacDisease'],
    4:  ['hashimotoThyroiditis', 'hashimoto'],
    5:  ['gravesDisease', 'graves'],
    6:  ['cutaneousLupus', 'cutaneous'],
    7:  ['systemicLupus'],
    8:  ['rheumatoidArthritis'],
    9:  ['multipleSclerosis', 'multiple'],
    10: ['sjGrens', 'sjogrens'],
    11: ['primaryBiliary'],
    12: ['ulcerativeColitis', 'ulcerative'],
    13: ['idiopathicMembranous', 'idiopathic'],
    14: ['psoriasis'],
  };

  const prefixes = keyPrefixMap[order] || [];
  for (const prefix of prefixes) {
    // Try exact fieldType
    const key1 = `${prefix}${fieldType}`;
    if (addDetails[key1]) return addDetails[key1];
    // Also try "Interpritation" typo (PHP uses this typo)
    if (fieldType === 'Interpretation') {
      const key2 = `${prefix}Interpritation`;
      if (addDetails[key2]) return addDetails[key2];
    }
  }
  return '';
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

/* ── Header (right-aligned) ─────────────────────── */
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

/* ── Header (left-aligned) ──────────────────────── */
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

/* ── Dotted background ──────────────────────────── */
.dot-bg {
  position: absolute; bottom: 0; right: 0;
  width: 65%; height: 55%;
  background-image: radial-gradient(circle, #bbb 1px, transparent 1px);
  background-size: 20px 20px; opacity: 0.32;
  z-index: 0; pointer-events: none;
}

/* ── Typography ─────────────────────────────────── */
p  { text-align: justify; color: #4d4d4d; font-size: 13.5px; font-weight: 400; margin: 0 0 9px 0; line-height: 1.68; }
h2 { font-size: 16px; color: ${themeColor}; font-weight: 600; margin: 10px 0 6px; }
h3 { color: ${themeColor}; font-size: 21px; font-weight: 600; margin: 0 0 10px; }
h4 { font-size: 14px; color: #4d4d4d; font-weight: 600; margin: 9px 0 5px; }
ul { padding-left: 20px; margin: 6px 0 9px; }
ul li { margin-bottom: 5px; font-size: 13.5px; line-height: 1.65; color: #4d4d4d; }
ol { padding-left: 20px; margin: 6px 0 9px; }
ol li { margin-bottom: 8px; font-size: 13.5px; line-height: 1.65; color: #4d4d4d; }
strong { font-weight: 700; }

/* Rendered HTML from API condition_desc / heading_desc1 */
.html-content p  { font-size: 13.5px; line-height: 1.68; color: #4d4d4d; margin: 0 0 7px; text-align: justify; }
.html-content ul { padding-left: 20px; margin: 4px 0 9px; }
.html-content ul li { font-size: 13.5px; line-height: 1.65; color: #4d4d4d; margin-bottom: 5px; }
.html-content h2 { font-size: 15px; color: ${themeColor}; font-weight: 700; margin: 10px 0 6px; }
.html-content h3 { font-size: 15px; color: ${themeColor}; font-weight: 700; margin: 10px 0 6px; }

/* ── Cover page ─────────────────────────────────── */
.cover-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center top;
  width: 100%; height: 100%;
}
.cover-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: white; padding: 32px 0 26px; text-align: center; z-index: 5;
}
.cover-dna-title  { font-size: 34px; font-weight: 700; color: ${themeColor}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; line-height: 1.2; }
.cover-sub        { font-size: 17px; color: #666; letter-spacing: 1.5px; margin-bottom: 5px; }
.cover-patient    { font-size: 15px; color: #555; }

/* ── Profile page ───────────────────────────────── */
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

/* ── Intro 2-col colored boxes ──────────────────── */
.intro-box { background: ${themeColor}; padding: 15px 17px; vertical-align: top; }
.intro-box h4 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.intro-box p  { color: rgba(255,255,255,0.93); font-size: 13px; line-height: 1.6; margin: 0 0 6px; text-align: justify; }

/* ── Risk level grading table ───────────────────── */
.risk-table { width: 100%; border-collapse: collapse; margin-top: 14px; }
.risk-table th { background: #f0f0f0; font-size: 13.5px; font-weight: 700; padding: 9px 11px; text-align: left; border: 1px solid #ccc; color: #333; }
.risk-table td { border: 1px solid #ccc; padding: 9px 11px; font-size: 13px; vertical-align: middle; line-height: 1.5; }
.zone-box    { width: 82px; height: 22px; border-radius: 3px; display: inline-block; vertical-align: middle; }
.zone-green  { background: #4caf50; }
.zone-orange { background: #ff9800; }
.zone-red    { background: #f44336; }

/* ── Table of Contents ──────────────────────────── */
.toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
.toc-card { position: relative; overflow: hidden; border-radius: 3px; }
.toc-card-img  { width: 100%; height: 192px; object-fit: cover; display: block; }
.toc-overlay   { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.52); padding: 10px 12px; }
.toc-overlay span { color: white; font-size: 12.5px; font-weight: 500; line-height: 1.45; display: block; }
.toc-entry { display: flex; justify-content: space-between; font-size: 12.5px; color: #4d4d4d; padding: 6px 2px 0; line-height: 1.4; }
.toc-pg    { font-weight: 700; color: ${themeColor}; flex-shrink: 0; padding-left: 8px; }

/* ── Summary table ──────────────────────────────── */
.sum-pill { background: ${themeColor}; color: white; font-size: 15.5px; font-weight: 600; border-radius: 30px; padding: 10px 24px; display: inline-block; margin-bottom: 18px; }
.sum-table { width: 100%; border-collapse: collapse; }
.sum-table thead th { background: #e8e8e8; font-size: 13.5px; font-weight: 700; padding: 10px 11px; text-align: left; border-bottom: 2px solid #ccc; color: #333; }
.sum-table tr  { border-bottom: 1px solid #ddd; page-break-inside: avoid; }
.sum-table td  { padding: 12px 11px; font-size: 13.5px; vertical-align: middle; }
.sum-table td:nth-child(2) { font-weight: 700; text-align: center; }
.good-cell    { color: #2e7d32 !important; }
.average-cell { color: #e65100 !important; }
.poor-cell    { color: #c62828 !important; }

/* ── Condition hero (full-bleed splash) ─────────── */
.cond-hero { position: absolute; inset: 0; background-size: cover; background-position: center; width: 100%; height: 100%; }
.cond-hero-bottom { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.50); padding: 30px 28px 40px; text-align: center; z-index: 3; }
.cond-hero-title  { color: white; font-size: 26px; font-weight: 600; text-shadow: 0 2px 8px rgba(0,0,0,0.45); text-decoration: underline; text-underline-offset: 7px; }

/* ── Condition description page ─────────────────── */
.cond-banner-wrap { position: relative; margin-bottom: 13px; page-break-inside: avoid; }
.cond-banner-img  { width: 100%; height: 158px; object-fit: cover; object-position: center; display: block; }
.cond-title-bar   { background: white; padding: 7px 15px; position: absolute; top: 0; left: 0; z-index: 5; }
.cond-title-bar h3 { color: ${themeColor}; font-size: 19px; font-weight: 700; margin: 0; line-height: 1.35; }

/* Symptoms section heading */
.symptoms-heading { font-size: 15px; font-weight: 700; color: ${themeColor}; margin: 10px 0 7px; border-left: 4px solid ${themeColor}; padding-left: 8px; }

/* ── Gene block (left = genotype, right = gene info) */
.gene-block { width: 100%; border-collapse: collapse; margin-bottom: 10px; page-break-inside: avoid; }
.gene-left  { background: ${themeColor}; width: 28%; padding: 12px 14px; vertical-align: top; }
.gene-right { background: #DFDFDF; width: 72%; padding: 12px 14px; vertical-align: top; }
.gene-lbl   { border-bottom: 1px solid rgba(255,255,255,0.45); padding-bottom: 5px; margin-bottom: 8px; }
.gene-lbl span { color: white; font-weight: 700; font-size: 10.5px; text-transform: uppercase; display: block; letter-spacing: 0.5px; }
.variant-pair-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
.variant-pair-table td { color: white; font-size: 14px; font-weight: 700; padding: 3px 6px 3px 0; vertical-align: middle; white-space: nowrap; background: transparent; border: none; }
.variant-pair-table td.sep { color: rgba(255,255,255,0.6); font-weight: 400; font-size: 13px; padding: 3px 4px; }
.gene-name-lbl { border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 8px; }
.gene-name-lbl span { font-weight: 700; font-size: 14px; color: #4d4d4d; }
.gene-desc { font-size: 12.5px; line-height: 1.6; color: #4d4d4d; margin: 0; text-align: justify; }

/* ── Your Response block ────────────────────────── */
.resp-block { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: avoid; }
.resp-left  { background: #DFDFDF; width: 28%; padding: 12px 8px; text-align: center; vertical-align: middle; }
.resp-right { background: ${themeColor}; width: 72%; padding: 14px 17px; vertical-align: top; }
.resp-yr    { font-size: 13px; font-weight: 600; color: ${themeColor}; margin-bottom: 9px; }
.resp-lbl   { font-size: 14px; font-weight: 600; color: white; border-bottom: 1px solid rgba(255,255,255,0.45); padding-bottom: 6px; margin-bottom: 8px; }
.resp-txt   { font-size: 13px; color: white; line-height: 1.6; margin: 0; text-align: justify; }

/* ── Disease Management (recommendation) block ──── */
.rec-block { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
.rec-left  {
  background: ${themeColor}; width: 28%;
  background-image: url('${IMG.recommend}');
  background-repeat: no-repeat; background-size: contain; background-position: center;
  vertical-align: top; min-height: 90px;
}
.rec-right  { background: #DFDFDF; width: 72%; padding: 14px 17px; vertical-align: top; }
.rec-lbl    { font-size: 14px; font-weight: 600; color: ${themeColor}; border-bottom: 1px solid #999; padding-bottom: 6px; margin-bottom: 8px; }
.rec-txt    { font-size: 13px; color: #4d4d4d; line-height: 1.6; margin: 0; text-align: justify; }
.rec-txt ul { padding-left: 18px; margin: 5px 0; }
.rec-txt ul li { font-size: 13px; color: #4d4d4d; margin-bottom: 4px; }

/* ── Gene section header ────────────────────────── */
.gene-section-title { font-size: 15px; font-weight: 700; color: ${themeColor}; margin: 4px 0 8px; padding-left: 8px; border-left: 4px solid ${themeColor}; }

/* ── References ─────────────────────────────────── */
.ref-list { list-style: none; padding: 0; margin: 0; counter-reset: ref; }
.ref-list li { counter-increment: ref; font-size: 12px; line-height: 1.65; margin-bottom: 10px; padding-left: 22px; position: relative; font-weight: 600; }
.ref-list li::before { content: counter(ref) "."; position: absolute; left: 0; }

/* ── Page number stamp ──────────────────────────── */
.page-num { font-size: 10px; position: absolute; left: 50%; transform: translateX(-50%); bottom: 12px; z-index: 1000; color: #888; background: transparent; padding: 4px 12px; font-weight: 400; font-family: 'Poppins', sans-serif; }

/* ── Last / back cover page ─────────────────────── */
.last-box { position: absolute; top: 55px; left: 50%; transform: translateX(-50%); width: 83%; border: 2px solid white; border-radius: 20px; padding: 24px 44px 36px; z-index: 9; }
.last-quote-icon { width: 54px; opacity: 0.9; display: block; margin-bottom: 12px; }
.last-quote  { color: white; font-size: 16.5px; font-weight: 300; line-height: 1.7; margin-bottom: 14px; text-align: justify; }
.last-author { color: white; font-size: 20px; font-weight: 600; }
`;
}

// ─── Header Fragments ─────────────────────────────────────────────────────────

const REPORT_TITLE = 'AUTOIMMUNE REPORT';

function hdrRight(): string {
  return `<div class="rpt-header"><span class="rpt-header-text">${REPORT_TITLE}</span><span class="rpt-header-bar"></span></div>`;
}
function hdrLeft(): string {
  return `<div class="rpt-header-left"><span class="rpt-header-bar"></span><span class="rpt-header-text">${REPORT_TITLE}</span></div>`;
}

// ─── Gene Block Renderer ──────────────────────────────────────────────────────

function renderGroupedGeneBlock(gene: GroupedGene): string {
  const variantRows = gene.variants.map(v =>
    `<tr><td>${v.test_variant}</td><td class="sep"></td><td>${v.report_variant}</td></tr>`
  ).join('');

  return `
<table class="gene-block no-break">
  <tr>
    <td class="gene-left">
      <div class="gene-lbl"><span>Your Genotype</span></div>
      <table class="variant-pair-table">${variantRows}</table>
    </td>
    <td class="gene-right">
      <div class="gene-name-lbl"><span>${gene.name}</span></div>
      <p class="gene-desc">${gene.description}</p>
    </td>
  </tr>
</table>`;
}

// ─── Response + Recommendation Block Renderers ────────────────────────────────

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
      <div class="rec-lbl">Disease Management</div>
      <div class="rec-txt">${recommendation || 'Please consult with your healthcare provider for personalized recommendations.'}</div>
    </td>
  </tr>
</table>`;
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

function coverPage(opts: PdfGeneratorOptions): string {
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  const coverImg = opts.vendor?.coverPageImg || IMG.mainCover;
  return `
<div class="page hidepageno">
  <div class="cover-bg" style="background-image:url('${coverImg}');"></div>
  <div class="cover-bottom">
    <div class="cover-dna-title">DNA AUTOIMMUNE TEST</div>
    <div class="cover-sub">AUTOIMMUNE REPORT</div>
    <div class="cover-patient">Patient Name : ${pd.name || '—'}</div>
  </div>
</div>`;
}

function profilePage(opts: PdfGeneratorOptions): string {
  const pd  = (opts.reportData?.PatientDetails || {}) as any;
  const sd  = (opts.reportData?.SampleDetails  || {}) as any;
  const gLabel = pd.gender === 'M' ? 'MALE' : pd.gender === 'F' ? 'FEMALE' : (pd.gender || '—').toUpperCase();
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
      <tr><td>PATIENT NAME</td><td style="text-transform:capitalize">${pd.name      || '—'}</td></tr>
      <tr><td>AGE (YEARS)</td><td>${pd.age        || '—'}</td></tr>
      <tr><td>WEIGHT (KG)</td><td>${pd.weight     || '—'}</td></tr>
      <tr><td>GENDER</td>     <td>${gLabel}</td></tr>
      <tr><td>HEIGHT (CM)</td><td>${pd.height     || '—'}</td></tr>
      <tr><td>PATIENT ID</td> <td>${pd.patientId  || '—'}</td></tr>
      <tr><td>TEST ID</td>    <td>NMC-AI01</td></tr>
    </table>
    <table class="prof-table no-break" style="margin-top:14px;">
      <tr><td>SAMPLE ID</td>                <td>${sd.vendorSampleId || '—'}</td></tr>
      <tr><td>SAMPLE TYPE</td>              <td>${sd.sampleType     || '—'}</td></tr>
      <tr><td>SAMPLE COLLECTION DATE</td>   <td>${sd.sample_date    || '—'}</td></tr>
      <tr><td>REPORT GENERATION DATE</td>   <td>${sd.report_date    || '—'}</td></tr>
      <tr><td>REFERRED BY (DOCTOR)</td>     <td>${pd.referredBy     || '—'}</td></tr>
      <tr><td>REFERRED BY(HOSPITAL)</td>    <td>${pd.hospital       || '—'}</td></tr>
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
    <p>Neotech (Formerly Known as NMC Genetics) is pleased to provide your <strong>Autoimmune</strong> report based on your unique genomic profile. The report offers you a snap-shot of your genetic response pertaining to your autoimmune health. The interpretations and recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
    <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray; utilizing globally validated procedures. The information received from your genetic code determines your autoimmune risk profile. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
    <p>With insights from this report, your clinicians or wellness consultant has a guidance map to devise a personalized plan and accordingly lifestyle changes to help you achieve optimal health. By seeking professional advice and following the recommendations you can improve your health holistically.</p>
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
    <p style="margin-top:11px;">This report is based on your unique DNA results obtained by testing your buccal swabs or blood samples or saliva samples in response to a selection of key genes that are associated with the individual health. NMC Genetics provides genetic assessment services only for investigational purposes and the information thus given should be interpreted and used exclusively only by qualified medical practitioners, certified physicians, dieticians, nutritionist, sports therapists and others in similar professions. The company does not provide any medical advice and this report does not constitute a medical diagnostic report.</p>
    <p>Genetic results are unique but being associated with a futuristic technology, the same must be used only under proper advice. NMC Genetics does not guarantee or in any way confirm any future disease or ailment associated with the genetic data disclosed in this report. For any contraindications you are advised to get supportive tests conducted from appropriate hospitals/laboratories.</p>
    <p>Interpretation of genetic data is a matter of expert opinion. Before taking any action based on this report, you are advised to meet and seek the advice of a qualified medical / nutritionist / fitness practitioner / dermatologist or as the case may be a qualified expert of that field.</p>
    <p>The company's role is limited to providing results of genetic tests and providing a broad set of general recommendations. More detailed instructions that may be specific to you are to be made by qualified professional practitioners only.</p>
    <p><strong>Limitation of Liability:</strong> To the fullest extent permitted by law, neither NMC Genetics and nor its officers, employees or representatives will be liable for any claim, proceedings, loss or damage of any kind arising out of or in connection with acting, or not acting, on the assertions or recommendations in the report.</p>
  </div>
</div>`;
}

function autoimmuneInfoPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Autoimmune Diseases</h3>
    <p style="margin-top:11px;">An autoimmune disease is a condition in which your immune system mistakenly attacks your body. The immune system normally guards against germs like bacteria and viruses. When it senses these foreign invaders, it sends out an army of fighter cells to attack them. Normally, the immune system can tell the difference between foreign cells and your own cells.</p>
    <p>In an autoimmune disease, the immune system mistakes part of your body, like your joints or skin, as foreign. It releases proteins called autoantibodies that attack healthy cells.</p>
    <h3 style="color:${tc};font-size:19px;margin-top:18px;">Genetics &amp; Autoimmune Diseases</h3>
    <p style="margin-top:8px;">Genetics plays a role in autoimmune diseases. Genes act by producing specific proteins that may contribute to a particular phenotype. Every human carries between 80,000 and 100,000 genes; the products of these genes—acting together and in combination with the environment—enable autoimmune complications.</p>
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
      <li>Hereditary (or germline) mutations are inherited from a parent and are present throughout a person's life in virtually every cell in the body.</li>
      <li>Acquired (or somatic) mutations occur at some time during a person's life and are present only in certain cells, not in every cell in the body.</li>
    </ul>
    <h3 style="color:${tc};font-size:16px;margin-bottom:6px;">What is Genetic testing?</h3>
    <p>Genetic testing is a type of medical test that identifies changes in chromosomes, genes, or proteins. The results of a genetic test can confirm or rule out a suspected genetic condition or help determine a person's chance of developing or passing on a genetic disorder.</p>
    <h3 style="color:${tc};font-size:16px;margin:11px 0 6px;">What do the results of Genetic tests mean?</h3>
    <p>A positive test result means that the laboratory found a change in a particular gene, chromosome, or protein of interest. Depending on the purpose of the test, this result may confirm a diagnosis, indicate that a person is a carrier of a particular genetic mutation, or identify an increased risk of developing a disease in the future.</p>
    <p>A negative test result means that the laboratory did not find a change in the gene, chromosome, or protein under consideration. However, there is still the possibility that any unknown genetic variation can still be a risk factor.</p>
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
    <p style="margin-top:11px;">Genetic defects can affect our health, although in many cases they don't manifest into a disease, but increases the risk of disease. External factors (such as the environment or lifestyle) influences the manifestation of the disease.</p>
    <p>Genetic variations called SNPs (pronounced "snips") or "deletions" or "additions" can affect the way our bodies absorb, metabolize, and utilize nutrients, and determine how effectively we eliminate Xenobiotics (drugs, pollutants) and even potential carcinogens. By understanding the mechanisms by which these genes work and analyzing data generated from genome-wide association studies (known as GWAS) and Mendelian randomization, scientists can now understand what impact SNPs may have on disease risk and relationship with certain gene-environmental contexts.</p>
    <p>Once researchers understand how specific genotypes can affect how our genes function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.</p>
    <p>A healthy lifestyle is, of course, generally preferable, because it can neutralize many genetic predispositions even without knowing underlying risks. However, genetic testing provides you with appropriate information about underlying risk factors and help an individual to implement pro-active health plan with his/her healthcare practitioner to lead a healthy life.</p>
    <p style="margin-top:11px;font-weight:700;">SOME FACTS:</p>
    <p>In human beings, 99.9% bases are same, remaining 0.1% makes a person unique in terms of:</p>
    <ul>
      <li>Different attributes / characteristics / traits</li>
      <li>How a person looks and what disease risks he or she may have</li>
      <li>Harmless (no change in our normal health)</li>
      <li>Harmful (can develop into diseases like diabetes, cancer, heart disease, Huntington's disease, and hemophilia)</li>
      <li>Latent (These variations found in genes but are not harmful on their own. The change in each gene function only becomes apparent under certain conditions)</li>
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
    <h3 style="color:${tc};font-size:21px;">About Your AUTOIMMUNE Report</h3>
    <p style="margin-top:11px;">This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence. We use hundreds of studies to bring you the genetic information in the Genetic report.</p>
    <p>The reporting format is very consistent and very lucid to understand. The report comprises of following sections in that order.</p>
    <ol style="padding-left:20px;margin:9px 0 13px;font-size:13.5px;line-height:1.65;">
      <li style="margin-bottom:8px;"><strong>Summarized results section:</strong> This section comprises of master summary.</li>
      <li><strong>Detailed report section:</strong> This section gives the detailed overview of every condition. There is summarized results table, a group of relevant traits, corresponding genetic response and interpretations are listed. Each trait or phenotype has its response marked as good, average or poor.</li>
    </ol>
    <p>This information provides you insight into specific risks such as effect of the marker on autoimmune diseases. Summary of recommendations in terms of do's and don'ts of lifestyle, nutrition, supplementation or exercise are included. This is how the result for a genetic marker associated to an individual trait is graded:</p>
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

function tableOfContentsPage(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const tc = getThemeColor(opts);
  // Render all TOC cards dynamically from actual merged data
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
    <div class="toc-grid">${cards}</div>
  </div>
</div>`;
}

function summaryPage(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const rows = merged.map(mc => {
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
          <th style="width:40%;">Condition</th>
          <th style="width:15%;text-align:center;">Result</th>
          <th style="width:45%;">Genes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

/**
 * Builds all condition detail pages.
 * Per condition:
 *   - Page A: Full-bleed hero image splash
 *   - Page B: Description (condition_desc + heading1 + heading_desc1 as rendered HTML)
 *   - Page(s) C+: Gene blocks (4 per page), last chunk appends Response + Recommendation
 */
function buildConditionPages(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const pages: string[] = [];
  const GENES_PER_PAGE = 4;

  merged.forEach((mc, idx) => {
    const { cfg } = mc;
    const isEven  = idx % 2 === 0;
    const hdr     = isEven ? hdrRight() : hdrLeft();

    // ── Page A: Full-bleed hero ────────────────────────────────────────────
    pages.push(`
<div class="page hidepageno">
  <div class="cond-hero" style="background-image:url('${cfg.coverImg}');"></div>
  <div class="cond-hero-bottom">
    <div class="cond-hero-title">${mc.condition_name}</div>
  </div>
</div>`);

    // ── Page B: Description ────────────────────────────────────────────────
    // condition_desc and heading_desc1 both come as raw HTML from the API
    const symptomsSection = mc.heading1
      ? `<div class="symptoms-heading">${mc.heading1}</div>
         <div class="html-content">${mc.heading_desc1 || ''}</div>`
      : (mc.heading_desc1 ? `<div class="html-content">${mc.heading_desc1}</div>` : '');

    pages.push(`
<div class="page" data-pn-target="${cfg.pnTarget}">
  ${hdr}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="cond-banner-wrap no-break">
      <img src="${cfg.descImg}" class="cond-banner-img" alt="${mc.condition_name}"/>
      <div class="cond-title-bar"><h3>${mc.condition_name}</h3></div>
    </div>
    <div class="html-content">${mc.condition_desc || 'No description available.'}</div>
    ${symptomsSection}
  </div>
</div>`);

    // ── Page(s) C: Gene blocks + Response + Recommendation ─────────────────
    const grouped = mc.groupedGenes;

    if (grouped.length === 0) {
      pages.push(`
<div class="page">
  ${hdr}
  <div class="dot-bg"></div>
  <div class="content-box">
    ${renderResponseBlock(mc.status, mc.interpretation)}
    <div style="margin-top:8px;">${renderRecommendationBlock(mc.recommendation)}</div>
  </div>
</div>`);
    } else {
      const chunks: GroupedGene[][] = [];
      for (let i = 0; i < grouped.length; i += GENES_PER_PAGE) {
        chunks.push(grouped.slice(i, i + GENES_PER_PAGE));
      }

      chunks.forEach((chunk, chunkIdx) => {
        const isLast   = chunkIdx === chunks.length - 1;
        const geneHtml = chunk.map(renderGroupedGeneBlock).join('');
        const label    = chunkIdx === 0 ? 'Genetic Markers' : 'Genetic Markers (continued)';

        pages.push(`
<div class="page">
  ${hdr}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="gene-section-title">${label}</div>
    ${geneHtml}
    ${isLast ? `
    <div style="margin-top:8px;">${renderResponseBlock(mc.status, mc.interpretation)}</div>
    <div style="margin-top:8px;">${renderRecommendationBlock(mc.recommendation)}</div>` : ''}
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
    <p>Genomic DNA is extracted from individual's Saliva/Tissue/Blood by commercial DNA extraction kits. The genotyping and variant detection is carried out based on illumina Infinium® array protocol. The DNA is then, amplified, fragmented and hybridized to known DNA fragments immobilized in arrays on a BeadChip. Millions of such known DNA fragments (50mer probes) containing the target genetic variants are immobilized on the chip. The hybridized chip is then washed to remove non-hybridized DNA fragments. Single-base extension of the oligos on the BeadChip, using the captured DNA as a template, incorporates detectable labels on the BeadChip and determines the genotype call for the sample. The Illumina iScan® or BeadArray Reader scans the BeadChip, using a laser to excite the fluorophore of the single-base extension product on the beads.</p>
    <h4 style="margin:11px 0 6px;">Analytical Performance</h4>
    <p>The genotyping was performed using a custom genotyping array platform (Illumina Inc). This test is a laboratory developed test with high reproducibility &gt; 99% and high call rates &gt; 98% to detect the variants and its performance has been validated in-house. Note that some of the genotypes may be imputed.</p>
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
      <li>Wellcome Trust Case Control Consortium, Australo-Anglo-American Spondylitis Consortium (TASC) et al. (2007). Association scan of 14,500 nonsynonymous SNPs in four diseases identifies autoimmunity variants. <em>Nature genetics</em>, 39(11), 1329–1337. https://doi.org/10.1038/ng.2007.17</li>
      <li>Brown M. A. (2008). Breakthroughs in genetic studies of ankylosing spondylitis. <em>Rheumatology</em>, 47(2), 132–137. https://doi.org/10.1093/rheumatology/kem269</li>
      <li>Duerr, R. H., Taylor, K. D., Brant, S. R., et al. (2006). A genome-wide association study identifies IL23R as an inflammatory bowel disease gene. <em>Science</em>, 314(5804), 1461–1463. https://doi.org/10.1126/science.1135245</li>
      <li>Fernando, M. M., Stevens, C. R., Sabeti, P. C., et al. (2007). Identification of two independent risk factors for lupus within the MHC in United Kingdom families. <em>PLoS genetics</em>, 3(11), e192. https://doi.org/10.1371/journal.pgen.0030192</li>
      <li>Pawlak-Adamska, E., Frydecka, I., Bolanowski, M., et al. (2017). CD28/CTLA-4/ICOS haplotypes confers susceptibility to Graves' disease and modulates clinical phenotype of disease. <em>Endocrine</em>, 55(1), 186–199. https://doi.org/10.1007/s12020-016-1096-1</li>
      <li>Guo, L., Deshmukh, H., Lu, R., et al. (2009). Replication of the BANK1 genetic association with systemic lupus erythematosus in a European-derived population. <em>Genes and immunity</em>, 10(5), 531–538. https://doi.org/10.1038/gene.2009.18</li>
      <li>Remmers, E. F., Plenge, R. M., Lee, A. T., et al. (2007). STAT4 and the risk of rheumatoid arthritis and systemic lupus erythematosus. <em>NEJM</em>, 357(10), 977–986. https://doi.org/10.1056/NEJMoa073003</li>
      <li>International Multiple Sclerosis Genetics Consortium, Hafler, D. A., et al. (2007). Risk alleles for multiple sclerosis identified by a genomewide study. <em>NEJM</em>, 357(9), 851–862. https://doi.org/10.1056/NEJMoa073493</li>
      <li>Hirschfield, G. M., Liu, X., Han, Y., et al. (2010). Variants at IRF5-TNPO3, 17q12-21 and MMEL1 are associated with primary biliary cirrhosis. <em>Nature genetics</em>, 42(8), 655–657. https://doi.org/10.1038/ng.631</li>
      <li>Ye, B. D., Choi, H., Hong, M., et al. (2016). Identification of Ten Additional Susceptibility Loci for Ulcerative Colitis Through Immunochip Analysis in Koreans. <em>Inflammatory bowel diseases</em>, 22(1), 13–19. https://doi.org/10.1097/MIB.0000000000000584</li>
      <li>Stanescu, H. C., Arcos-Burgos, M., Medlar, A., et al. (2011). Risk HLA-DQA1 and PLA(2)R1 alleles in idiopathic membranous nephropathy. <em>NEJM</em>, 364(7), 616–626. https://doi.org/10.1056/NEJMoa1009742</li>
      <li>Zhang, X. J., Huang, W., Yang, S., et al. (2009). Psoriasis genome-wide association study identifies susceptibility variants within LCE gene cluster at 1q21. <em>Nature genetics</em>, 41(2), 205–210. https://doi.org/10.1038/ng.310</li>
    </ol>
  </div>
</div>`;
}

function lastPage(): string {
  return `
<div class="page hidepageno" style="background-image:url('${IMG.backCover}');background-size:cover;background-position:center;">
  <div class="last-box">
    <img src="${IMG.quoteIcon}" class="last-quote-icon" alt="Quote"/>
    <p class="last-quote">"For every ailment under the sun, there is a remedy, or there is none, if there be one, try to find it; If there be none, never mind it."</p>
    <div class="last-author">- Mother Goose</div>
  </div>
</div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

/**
 * Main entry point called by the report engine.
 * Accepts PdfGeneratorOptions and returns a complete HTML string.
 */
export function buildAutoimmuneReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData as GenericApiResponse;

  // The API returns data as: reportData.sections.flat (Record<string, ConditionData[]>)
  const flatData   = (reportData?.sections?.['flat'] || {}) as Record<string, ConditionData[]>;
  const addDetails = (reportData?.addDetails || null)        as Record<string, any> | null;

  // Build merged, deduped, ordered condition list from the flat API response
  const merged = buildMergedConditions(flatData, addDetails);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Autoimmune Health Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>

  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${aboutPage(opts)}
  ${legalDisclaimerPage(opts)}
  ${autoimmuneInfoPage(opts)}
  ${introductionPage1(opts)}
  ${introductionPage2(opts)}
  ${geneticWellbeingPage(opts)}
  ${aboutReportPage(opts)}
  ${tableOfContentsPage(opts, merged)}
  ${summaryPage(opts, merged)}
  ${buildConditionPages(opts, merged)}
  ${sciencePage(opts)}
  ${referencesPage(opts)}
  ${lastPage()}

  <script>
    (function () {
      /* ── Page numbering ─────────────────────────────── */
      const allPages      = Array.from(document.querySelectorAll('.page'));
      const numberedPages = allPages.filter(p => !p.classList.contains('hidepageno'));
      const total         = numberedPages.length;
      let   num           = 0;

      numberedPages.forEach(function(page) {
        num++;
        const existing = page.querySelector('.page-num');
        if (existing) existing.remove();
        const stamp       = document.createElement('span');
        stamp.className   = 'page-num';
        stamp.textContent = num + ' / ' + total;
        page.appendChild(stamp);
      });

      /* ── TOC page number injection ──────────────────── */
      document.querySelectorAll('[data-pn-target]').forEach(function(targetPage) {
        const key    = targetPage.getAttribute('data-pn-target');
        const idx    = numberedPages.indexOf(targetPage);
        const pageNo = idx >= 0 ? idx + 1 : '—';
        document.querySelectorAll('[data-pn="' + key + '"]').forEach(function(el) {
          el.textContent = String(pageNo);
        });
      });
    })();
  </script>

</body>
</html>`;
}