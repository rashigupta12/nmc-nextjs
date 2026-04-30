// ============================================================
// Eye Health Report — Complete HTML Template Generator
// Condition-name-based mapping (no index dependency)
// Supports: Diabetic Retinopathy, Glaucoma, Age-related MD, Retinal Occlusion
// ============================================================

import { PdfGeneratorOptions, GenericApiResponse, ConditionData, GeneData } from '../reportEngine/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const ASSETS = BASE_URL;

// ─── Image Registry ───────────────────────────────────────────────────────────

const IMG = {
  // Status icons
  good: `${ASSETS}/reportimg/imunity/good.png`,
  average: `${ASSETS}/reportimg/imunity/average.png`,
  poor: `${ASSETS}/reportimg/imunity/poor.png`,
  recommend: `${ASSETS}/reportimg/imunity/recommend.png`,

  // Cover page
  mainCover: `${ASSETS}/reportimg/eye_images/cover.jpg`,

  // Diabetic Retinopathy
  drCover: `${ASSETS}/reportimg/eye_images/Risk_Of_Diabetic_Retinopathy_cover.jpg`,
  drDesc: `${ASSETS}/reportimg/eye_images/Risk_Of_Diabetic_Retinopathy_p14.jpg`,

  // Glaucoma
  glaucomaCover: `${ASSETS}/reportimg/eye_images/Risk-of-Glaucoma_cover.jpg`,
  glaucomaDesc: `${ASSETS}/reportimg/eye_images/Risk-of-Glaucoma_page_17.jpg`,

  // Cataract
  cataractCover: `${ASSETS}/reportimg/eye_images/Risk-of-Cataract_cover.jpg`,
  cataractDesc: `${ASSETS}/reportimg/eye_images/Risk-Of-Cataract_page_19.jpg`,

  // Myopia
  myopiaCover: `${ASSETS}/reportimg/eye_images/Risk-of-Myopia-(Nearsightedness)_cover.jpg`,
  myopiaDesc: `${ASSETS}/reportimg/eye_images/Risk-of-Myopia-(Nearsightedness)_page_22.jpg`,

  // Ocular Hypertension
  ocularCover: `${ASSETS}/reportimg/eye_images/Ocular-Hypertension_cover.jpg`,
  ocularDesc: `${ASSETS}/reportimg/eye_images/Ocular-Hypertension_page_24.jpg`,

  // Age-related Macular Degeneration
  amdCover: `${ASSETS}/reportimg/eye_images/Age-related-Macular-Degeneration_cover.jpg`,
  amdDesc: `${ASSETS}/reportimg/eye_images/Image-1_Page-26.jpg`,

  // Retinal Occlusion
  roCover: `${ASSETS}/reportimg/eye_images/Retinal-Occlusion_cover.jpg`,
  roDesc: `${ASSETS}/reportimg/eye_images/Retinal-Occlusion_page_28.jpg`,

  // Thumbnails for TOC
  thumb1: `${ASSETS}/reportimg/eye_images/Risk_Of_Diabetic_Retinopathy_thumbnail_1.jpg`,
  thumb2: `${ASSETS}/reportimg/eye_images/Risk-of-Glaucoma_thumbnail_1.jpg`,
  thumb3: `${ASSETS}/reportimg/eye_images/Risk-of-Cataract_thumbnail.jpg`,
  thumb4: `${ASSETS}/reportimg/eye_images/Risk-of-Myopia-(Nearsightedness)_thumbnail.jpg`,
  thumb5: `${ASSETS}/reportimg/eye_images/Ocular-Hypertension_thumbnail.jpg`,
  thumb6: `${ASSETS}/reportimg/eye_images/Age-related-Macular-Degeneration_thumbnail.jpg`,
  thumb7: `${ASSETS}/reportimg/eye_images/Retinal-occlusion_thumbnail.jpg`,

  // Back cover
  backCover: `${ASSETS}/reportimg/imunity/Last Page.jpg`,
  quoteIcon: `${ASSETS}/reportimg/imunity/quote.png`,

  // DNA images
  dna1: `${ASSETS}/reportimg/dna1.png`,
  geneMutation: `${ASSETS}/reportimg/genemutation.png`,
  geneMutationImg: `${ASSETS}/reportimg/genemutation.jpg`,
};

// ─── Gene Description Fallback Map ───────────────────────────────────────────

const GENE_DESCRIPTIONS: Record<string, string> = {
  'VEGFA': 'This gene encodes vascular endothelial growth factor A. This growth factor induces proliferation and migration of vascular endothelial cells, and is essential for both physiological and pathological angiogenesis. Allelic variants of this gene have been associated with microvascular complications of diabetes 1 (MVCD1) and atherosclerosis.',
  'ICAM1': 'This gene encodes intercellular adhesion molecule 1 (ICAM-1). ICAM-1 is a cell surface glycoprotein that is expressed on endothelial cells and cells of the immune system. It binds to integrins of type CD11a/CD18 or CD11b/CD18 and is exploited by rhinovirus as a receptor.',
  'EPO': 'This gene encodes erythropoietin. Expression of this gene is upregulated under hypoxic conditions, in turn leading to increased erythropoiesis and enhanced oxygen-carrying capacity of the blood. Mutations in this gene have been associated with various anemias and erythrocytoses.',
  'MYOC': 'This gene encodes myocilin. MYOC is expressed in many occular tissues, including the trabecular meshwork, and was revealed to be the trabecular meshwork glucocorticoid-inducible response protein (TIGR). The trabecular meshwork is a specialized eye tissue essential in regulating intraocular pressure, and mutations in MYOC have been identified as the cause of hereditary juvenile-onset open-angle glaucoma.',
  'LOXL1-AS1': 'This gene encodes LOXL1 antisense RNA 1. It is involved in regulating LOXL1 expression and has been associated with exfoliation glaucoma.',
  'EPHA2': 'This gene encodes EPH receptor A2. EPH and EPH-related receptors have been implicated in mediating developmental events, particularly in the nervous system. Mutations in this gene are the cause of certain genetically-related cataract disorders.',
  'TGFB1': 'The encoded protein, a member of the tumor necrosis factor family, is a cytokine produced by lymphocytes. This protein also mediates a large variety of inflammatory, immunostimulatory, and antiviral responses, is involved in the formation of secondary lymphoid organs during development and plays a role in apoptosis.',
  'PTGFR': 'This gene encodes prostaglandin F receptor. This protein is a receptor for prostaglandin F2-alpha (PGF2-alpha), which is known to be a potent luteolytic agent, and may also be involved in modulating intraocular pressure and smooth muscle contraction in uterus.',
  'ARMS2': 'This gene encodes age-related maculopathy susceptibility 2. It is a component of the choroidal extracellular matrix of the eye. Mutations in this gene are associated with age-related macular degeneration.',
  'C2': 'This gene encodes complement C2. It is a serum glycoprotein that functions as part of the classical pathway of the complement system. Deficiency of C2 has been reported to associated with certain autoimmune diseases and SNPs in this gene have been associated with altered susceptibility to age-related macular degeneration.',
  'VEGF': 'This gene encodes vascular endothelial growth factor. This growth factor induces proliferation and migration of vascular endothelial cells, and is essential for both physiological and pathological angiogenesis.',
  'AGTR1': 'This gene encodes angiotensin II receptor type 1. It is a potent vasopressor hormone and a primary regulator of aldosterone secretion. It is an important effector controlling blood pressure and volume in the cardiovascular system.',
  'ADIPOQ': 'This gene encodes adiponectin, C1Q and collagen domain containing. It is expressed in adipose tissue exclusively. Mutations in this gene are associated with adiponectin deficiency.',
};

// ─── Config Map (condition-name-based) ───────────────────────────────────────

interface CondCfg {
  cover: string;
  descImg: string;
  pnTarget: string;
  addKey?: string | null;
  order: number;
  hasGeneTable: boolean;
}

const CONDITION_CFG_MAP: CondCfg[] = [
  {
    cover: IMG.drCover,
    descImg: IMG.drDesc,
    pnTarget: 'One',
    addKey: 'diabeticRetinopathy',
    order: 1,
    hasGeneTable: true,
  },
  {
    cover: IMG.glaucomaCover,
    descImg: IMG.glaucomaDesc,
    pnTarget: 'Two',
    addKey: 'glaucoma',
    order: 2,
    hasGeneTable: true,
  },
  {
    cover: IMG.cataractCover,
    descImg: IMG.cataractDesc,
    pnTarget: 'Three',
    addKey: null,
    order: 3,
    hasGeneTable: false,
  },
  {
    cover: IMG.myopiaCover,
    descImg: IMG.myopiaDesc,
    pnTarget: 'Four',
    addKey: null,
    order: 4,
    hasGeneTable: false,
  },
  {
    cover: IMG.ocularCover,
    descImg: IMG.ocularDesc,
    pnTarget: 'Five',
    addKey: null,
    order: 5,
    hasGeneTable: false,
  },
  {
    cover: IMG.amdCover,
    descImg: IMG.amdDesc,
    pnTarget: 'Six',
    addKey: 'ageRelated',
    order: 6,
    hasGeneTable: true,
  },
  {
    cover: IMG.roCover,
    descImg: IMG.roDesc,
    pnTarget: 'Seven',
    addKey: 'retinalOcclusion',
    order: 7,
    hasGeneTable: true,
  },
];

function resolveCfg(conditionName: string): CondCfg | null {
  const n = (conditionName || '').toLowerCase();
  if (n.includes('diabetic retinopathy')) return CONDITION_CFG_MAP[0];
  if (n.includes('glaucoma')) return CONDITION_CFG_MAP[1];
  if (n.includes('cataract')) return CONDITION_CFG_MAP[2];
  if (n.includes('myopia') || n.includes('nearsightedness')) return CONDITION_CFG_MAP[3];
  if (n.includes('ocular hypertension')) return CONDITION_CFG_MAP[4];
  if (n.includes('macular degeneration')) return CONDITION_CFG_MAP[5];
  if (n.includes('retinal occlusion')) return CONDITION_CFG_MAP[6];
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#3FA8A8';
}

function gaugeImg(status: string, width = 165): string {
  const s = (status || 'good').toLowerCase();
  const key = s === 'poor' ? 'poor' : s === 'average' ? 'average' : 'good';
  return `<img src="${(IMG as any)[key]}" width="${width}" alt="${key}" style="display:block;margin:auto;"/>`;
}

function formatGenes(genes: GeneData[]): string {
  if (!genes || genes.length === 0) return '—';
  return genes.map(g => g.name).join(', ');
}

function statusCellClass(status: string): string {
  const s = (status || 'good').toLowerCase();
  if (s === 'poor') return 'poor-cell';
  if (s === 'average') return 'average-cell';
  return 'good-cell';
}

function getGeneDescription(geneName: string, existingDesc?: string): string {
  if (existingDesc && existingDesc !== '—') return existingDesc;
  const name = (geneName || '').toUpperCase();
  return GENE_DESCRIPTIONS[name] || 'Further research is ongoing to understand the complete function of this gene and its role in eye health.';
}

// ─── Merged condition builder ─────────────────────────────────────────────────

interface MergedCondition {
  cfg: CondCfg;
  condition_name: string;
  condition_desc: string;
  heading1: string;
  heading_desc1: string;
  status: string;
  interpretation: string;
  recommendation: string;
  genes: GeneData[];
}

function buildMergedConditions(
  flatData: Record<string, ConditionData[]>,
  addDetails: Record<string, any>,
): MergedCondition[] {

  const byOrder = new Map<number, MergedCondition>();

  for (const conds of Object.values(flatData)) {
    if (!conds?.length) continue;

    const primaryCond = conds[0];
    const cfg = resolveCfg(primaryCond.condition_name);
    if (!cfg) continue;

    const existing = byOrder.get(cfg.order);

    if (!existing) {
      let status = primaryCond.condition_status || 'Good';
      let interpretation = primaryCond.interpretation || '';
      let recommendation = primaryCond.recommendation || '';

      if (cfg.addKey && addDetails) {
        status = addDetails[`${cfg.addKey}Status`] || status;
        if (cfg.addKey === 'retinalOcclusion') {
          interpretation = addDetails[`${cfg.addKey}Interpretation`] || interpretation;
        } else {
          interpretation = addDetails[`${cfg.addKey}Interpritation`] || interpretation;
        }
        recommendation = addDetails[`${cfg.addKey}Recommendation`] || recommendation;
      }

      const genes: GeneData[] = [];
      for (const c of conds) {
        if (c.gene?.length) {
          // Enhance genes with descriptions if missing
          const enhancedGenes = c.gene.map(g => ({
            ...g,
            gene_description: getGeneDescription(g.name, g.gene_description)
          }));
          genes.push(...enhancedGenes);
        }
      }

      byOrder.set(cfg.order, {
        cfg,
        condition_name: primaryCond.condition_name,
        condition_desc: primaryCond.condition_desc || '',
        heading1: primaryCond.heading1 || '',
        heading_desc1: primaryCond.heading_desc1 || '',
        status,
        interpretation,
        recommendation,
        genes,
      });

    } else {
      for (const c of conds) {
        if (c.gene?.length) {
          const enhancedGenes = c.gene.map(g => ({
            ...g,
            gene_description: getGeneDescription(g.name, g.gene_description)
          }));
          existing.genes.push(...enhancedGenes);
        }
      }
      if (!existing.condition_desc && primaryCond.condition_desc) {
        existing.condition_desc = primaryCond.condition_desc;
        existing.heading1 = primaryCond.heading1 || '';
        existing.heading_desc1 = primaryCond.heading_desc1 || '';
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

/* ── Page number footer ─────────────────────────── */
.page-num {
  font-size: 10px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 12px;
  z-index: 1000;
  color: #888;
  background: transparent;
  padding: 4px 12px;
  font-weight: 400;
  font-family: 'Poppins', sans-serif;
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

function hdrRight(title = "EYE HEALTH REPORT"): string {
  return `<div class="rpt-header"><span class="rpt-header-text">${title}</span><span class="rpt-header-bar"></span></div>`;
}
function hdrLeft(title = "EYE HEALTH REPORT"): string {
  return `<div class="rpt-header-left"><span class="rpt-header-bar"></span><span class="rpt-header-text">${title}</span></div>`;
}

// ─── PAGE BUILDERS ────────────────────────────────────────────────────────────

function coverPage(opts: PdfGeneratorOptions): string {
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  return `
<div class="page hidepageno">
  <div class="cover-bg" style="background-image:url('${IMG.mainCover}');"></div>
  <div class="cover-bottom">
    <div class="cover-dna-title">DNA EYE HEALTH TEST</div>
    <div class="cover-sub">EYE HEALTH REPORT</div>
    <div class="cover-patient">Patient Name : ${pd.name || '—'}</div>
  </div>
</div>`;
}

function profilePage(opts: PdfGeneratorOptions): string {
  const pd = (opts.reportData?.PatientDetails || {}) as any;
  const sd = (opts.reportData?.SampleDetails || {}) as any;
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
      <tr><td>PATIENT NAME</td><td>${pd.name || '—'}</td></tr>
      <tr><td>AGE (YEARS)</td><td>${pd.age || '—'}</td></tr>
      <tr><td>WEIGHT (KG)</td><td>${pd.weight || '—'}</td></tr>
      <tr><td>GENDER</td><td>${gLabel}</td></tr>
      <tr><td>HEIGHT (CM)</td><td>${pd.height || '—'}</td></tr>
      <tr><td>PATIENT ID</td><td>${pd.patientId || '—'}</td></tr>
      <tr><td>TEST ID</td><td>NMC-EH01</td></tr>
    </table>
    <table class="prof-table no-break" style="margin-top:14px;">
      <tr><td>SAMPLE ID</td><td>${sd.vendorSampleId || '—'}</td></tr>
      <tr><td>SAMPLE TYPE</td><td>${sd.sampleType || '—'}</td></tr>
      <tr><td>SAMPLE COLLECTION DATE</td><td>${sd.sample_date || '—'}</td></tr>
      <tr><td>REPORT GENERATION DATE</td><td>${sd.report_date || '—'}</td></tr>
      <tr><td>REFERRED BY (DOCTOR)</td><td>${pd.referredBy || '—'}</td></tr>
      <tr><td>REFERRED BY (HOSPITAL)</td><td>${pd.hospital || '—'}</td></tr>
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
    <p>Neotech (Formerly Known as NMC Genetics) is pleased to provide your <strong>Eye Health</strong> report based on your unique genomic profile. The report offers you a snap-shot of your genetic response pertaining to your eye health. The interpretations and recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
    <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray; utilizing globally validated procedures. The information received from your genetic code determines your eye health. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
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
    <p style="margin-top:11px;">Legal Disclaimer: This report is based on your unique DNA analysis, conducted using your provided sample, and focuses on a selected panel of genes associated with general health and wellness traits. Neotech provides genetic testing services strictly for informational and investigational purposes only. The insights and suggestions presented in this report are not intended to replace professional medical advice, diagnosis, or treatment.</p>
    <p>This report is designed to be interpreted exclusively by qualified and licensed professionals, including but not limited to medical practitioners, clinical geneticists, registered dietitians, certified nutritionists, wellness consultants, and other licensed healthcare professionals. Neotech does not practice medicine, and this report does not constitute a medical or diagnostic document, nor should it be used as the sole basis for any clinical decisions. Although genetic information is unique to each individual, its interpretation is inherently probabilistic and must be considered alongside clinical context and other health assessments. The insights presented herein are not predictive of any specific future disease or health outcome.</p>
    <p>The interpretation of genetic data requires expert clinical judgment, and the information provided should be seen as a supportive tool, not a substitute for professional evaluation or clinical diagnostics. While Neotech provides general wellness-oriented recommendations, these do not account for your complete medical history, existing conditions, allergies, medications, or ongoing treatments even if such information has been shared with us.</p>
    <p><strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, Neotech, its affiliates, officers, employees, agents, and representatives shall not be held liable for any claims, demands, losses, liabilities, damages, or expenses (whether direct, indirect, incidental, consequential, special, punitive, or exemplary) arising out of or related to the use of, misuse of, reliance upon, or inability to use the information or recommendations contained in this report.</p>
    <p><strong>Consumer Rights:</strong> This disclaimer does not affect any statutory rights you may have as a consumer under applicable law. If you are unsure how to interpret the information provided in this report, please seek clarification from a certified healthcare professional.</p>
  </div>
</div>`;
}

function eyeHealthInfoPage(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Eye Health</h3>
    <p style="margin-top:11px;">It is said that eyes are the windows to the soul. We don't know if that's true, but what we do know that having perfectly healthy eyes—excellent vision and clear eyes, free of pain or other symptoms—are crucial to your health and well-being. The good news is that it's easy to learn more about eye problems, symptoms, and the treatments that will keep you in tip-top shape.</p>
    <h3 style="color:${tc};font-size:19px;margin-top:18px;">Genetics &amp; Eye Health</h3>
    <p style="margin-top:8px;">Genetics plays a role in vision problems that occur in otherwise healthy eyes. Genes act by producing specific proteins that may contribute to a particular biological or behavioral trait. Every human carries between 80,000 and 100,000 genes; the products of these genes—acting together and in combination with the environment—enable vision complications. Genetic ophthalmologic researchers now have evidence that the most common vision problems among children and adults are genetically determined.</p>
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
    <h3 style="color:${tc};font-size:21px;">About Your Eye Health Report</h3>
    <p style="margin-top:11px;">This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence. We use hundreds of studies to bring you the genetic information in the Genetic report.</p>
    <p>The reporting format is very consistent and very lucid to understand. The report comprises of following sections in that order.</p>
    <ol style="padding-left:20px;margin:9px 0 13px;font-size:13.5px;line-height:1.65;">
      <li style="margin-bottom:8px;"><strong>Summarized results section :</strong> This section comprise of master summary.</li>
      <li><strong>Detailed report section :</strong> This section gives the detailed overview of every condition. There is summarized results table, a group of relevant traits, corresponding genetic response and interpretations are listed. Each trait or phenotype has its response is marked as good, bad or average.</li>
    </ol>
    <p>This information provides you insight into specific risks such as effect of the marker on eye diseases. Summary of recommendations in terms do's and dont's of lifestyle, nutrition, supplementation or exercise are included. This is how the result for a genetic marker associated to an individual trait is graded:</p>
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

function tableOfContentsPage1(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrLeft()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Table of contents</h3>
    <div class="toc-grid">
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb1}" class="toc-card-img" alt="Risk of Diabetic Retinopathy"/>
          <div class="toc-overlay"><span>Risk of Diabetic Retinopathy</span></div>
        </div>
        <div class="toc-entry"><span>Risk of Diabetic Retinopathy</span><span class="toc-pg" data-pn="One">—</span></div>
      </div>
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb2}" class="toc-card-img" alt="Risk of Glaucoma"/>
          <div class="toc-overlay"><span>Risk of Glaucoma</span></div>
        </div>
        <div class="toc-entry"><span>Risk of Glaucoma</span><span class="toc-pg" data-pn="Two">—</span></div>
      </div>
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb3}" class="toc-card-img" alt="Risk of Cataract"/>
          <div class="toc-overlay"><span>Risk of Cataract</span></div>
        </div>
        <div class="toc-entry"><span>Risk of Cataract</span><span class="toc-pg" data-pn="Three">—</span></div>
      </div>
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb4}" class="toc-card-img" alt="Risk of Myopia (Nearsightedness)"/>
          <div class="toc-overlay"><span>Risk of Myopia (Nearsightedness)</span></div>
        </div>
        <div class="toc-entry"><span>Risk of Myopia (Nearsightedness)</span><span class="toc-pg" data-pn="Four">—</span></div>
      </div>
    </div>
  </div>
</div>`;
}

function tableOfContentsPage2(opts: PdfGeneratorOptions): string {
  const tc = getThemeColor(opts);
  return `
<div class="page">
  ${hdrRight()}
  <div class="content-box">
    <h3 style="color:${tc};font-size:23px;">Table of contents</h3>
    <div class="toc-grid">
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb5}" class="toc-card-img" alt="Ocular Hypertension"/>
          <div class="toc-overlay"><span>Ocular Hypertension</span></div>
        </div>
        <div class="toc-entry"><span>Ocular Hypertension</span><span class="toc-pg" data-pn="Five">—</span></div>
      </div>
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb6}" class="toc-card-img" alt="Age-related Macular Degeneration"/>
          <div class="toc-overlay"><span>Age-related Macular Degeneration</span></div>
        </div>
        <div class="toc-entry"><span>Age-related Macular Degeneration</span><span class="toc-pg" data-pn="Six">—</span></div>
      </div>
      <div>
        <div class="toc-card">
          <img src="${IMG.thumb7}" class="toc-card-img" alt="Retinal Occlusion"/>
          <div class="toc-overlay"><span>Retinal Occlusion</span></div>
        </div>
        <div class="toc-entry"><span>Retinal Occlusion</span><span class="toc-pg" data-pn="Seven">—</span></div>
      </div>
    </div>
  </div>
</div>`;
}

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
  ${hdrLeft()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="sum-pill">Your summarized test report</div>
    <table class="sum-table no-break">
      <thead><tr><th style="width:46%;">Condition</th><th style="width:16%;text-align:center;">Result</th><th style="width:38%;">Genes</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

function buildConditionPages(opts: PdfGeneratorOptions, merged: MergedCondition[]): string {
  const pages: string[] = [];

  merged.forEach((mc, idx) => {
    const { cfg } = mc;
    const isEven = idx % 2 === 0;

    // Hero cover
    pages.push(`
<div class="page hidepageno">
  <div class="cond-hero" style="background-image:url('${cfg.cover}');"></div>
  <div class="cond-hero-bottom">
    <div class="cond-hero-title">${mc.condition_name}</div>
  </div>
</div>`);

    // Description page
    pages.push(`
<div class="page" data-pn-target="${cfg.pnTarget}">
  ${isEven ? hdrRight() : hdrLeft()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <div class="cond-banner-wrap no-break">
      <img src="${cfg.descImg}" class="cond-banner-img" alt="${mc.condition_name}"/>
      <div class="cond-title-bar"><h3>${mc.condition_name}</h3></div>
    </div>
    <p style="margin-bottom:9px;">${mc.condition_desc || 'No description available.'}</p>
    ${mc.heading1 ? `<h4 style="color:${getThemeColor(opts)};margin:9px 0 5px;">${mc.heading1}</h4>` : ''}
    ${mc.heading_desc1 ? `<div style="font-size:13.5px;line-height:1.65;">${mc.heading_desc1}</div>` : ''}
  </div>
</div>`);

    // Gene + Response + Recommendation pages
    if (cfg.hasGeneTable && mc.genes.length > 0) {
      const geneRows = mc.genes.map((gene: GeneData) => {
        const geneDesc = gene.gene_description || getGeneDescription(gene.name, gene.gene_description);
        return `
<table class="gene-block no-break" style="margin-bottom:8px;">
  <tr>
    <td class="gene-left">
      <div class="gene-lbl"><span>Your Genotype</span></div>
      <div class="gene-val">${gene.report_variant || gene.test_variant || '—'}</div>
    </td>
    <td class="gene-right">
      <div class="gene-name-lbl"><span>${gene.name || '—'}</span></div>
      <p class="gene-desc">${geneDesc}</p>
    </td>
  </tr>
</table>`;
      }).join('');

      pages.push(`
<div class="page">
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
          <p class="resp-txt">${mc.interpretation || 'No interpretation available.'}</p>
        </td>
      </tr>
    </table>
    <table class="rec-block no-break">
      <tr>
        <td class="rec-left" style="height:90px;"></td>
        <td class="rec-right">
          <div class="rec-lbl">Recommendation</div>
          <p class="rec-txt">${mc.recommendation || 'No specific recommendations available. Please consult with your healthcare provider.'}</p>
        </td>
      </tr>
    </table>
  </div>
</div>`);
    } else if (mc.genes.length > 0) {
      // Conditions without gene table still need response/recommendation
      pages.push(`
<div class="page">
  ${isEven ? hdrLeft() : hdrRight()}
  <div class="dot-bg"></div>
  <div class="content-box">
    <table class="resp-block no-break" style="margin-bottom:7px;">
      <tr>
        <td class="resp-left">
          <div class="resp-yr">Your Response</div>
          ${gaugeImg(mc.status, 160)}
        </td>
        <td class="resp-right">
          <div class="resp-lbl">Interpretation</div>
          <p class="resp-txt">${mc.interpretation || 'No interpretation available.'}</p>
        </td>
      </tr>
    </table>
    <table class="rec-block no-break">
      <tr>
        <td class="rec-left" style="height:90px;"></td>
        <td class="rec-right">
          <div class="rec-lbl">Recommendation</div>
          <p class="rec-txt">${mc.recommendation || 'No specific recommendations available. Please consult with your healthcare provider.'}</p>
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
      <li>Christodoulou A, Bagli E, Gazouli M, Moschos MM, Kitsos G. Genetic polymorphisms associated with the prevalence of retinal vein occlusion in a Greek population. Int Ophthalmol. 2019 Nov;39(11):2637-2648. doi: 10.1007/s10792-019-01113-9. Epub 2019 May 7. PMID: 31065901.</li>
      <li>Rajendran A, Dhoble P, Sundaresan P, Saravanan V, Vashist P, Nitsch D, Smeeth L, Chakravarthy U, Ravindran RD, Fletcher AE. Genetic risk factors for late age-related macular degeneration in India. Br J Ophthalmol. 2018 Sep;102(9):1213-1217. doi: 10.1136/bjophthalmol-2017-311384. Epub 2017 Dec 19. PMID: 29259020; PMCID: PMC6104670.</li>
      <li>Sundaresan P, Vashist P, Ravindran RD, Shanker A, Nitsch D, Nonyane BA, Smeeth L, Chakravarthy U, Fletcher AE. Polymorphisms in ARMS2/HTRA1 and complement genes and age-related macular degeneration in India: findings from the INDEYE study. Invest Ophthalmol Vis Sci. 2012 Nov 1;53(12):7492-7. doi: 10.1167/iovs.12-10073. PMID: 23060141; PMCID: PMC3490538.</li>
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
    <p class="last-quote">"Once you've done everything you can to protect your eyes, take care of your eye health, and safely improve your vision, then relax and be grateful for whatever sight you have"</p>
    <div class="last-author">-Ken Brandt</div>
  </div>
</div>`;
}

// ─── MASTER HTML BUILDER ──────────────────────────────────────────────────────

export function buildEyeHealthReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData as GenericApiResponse;
  const flatData = (reportData?.sections?.['flat'] || {}) as Record<string, ConditionData[]>;
  const addDetails = (reportData?.addDetails || {}) as Record<string, any>;

  const merged = buildMergedConditions(flatData, addDetails);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Eye Health Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${aboutPage(opts)}
  ${legalDisclaimerPage(opts)}
  ${eyeHealthInfoPage(opts)}
  ${introductionPage1(opts)}
  ${introductionPage2(opts)}
  ${geneticWellbeingPage(opts)}
  ${aboutReportPage(opts)}
  ${tableOfContentsPage1(opts)}
  ${tableOfContentsPage2(opts)}
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
        const existingNum = page.querySelector('.page-num');
        if (existingNum) existingNum.remove();
        
        const stamp       = document.createElement('span');
        stamp.className   = 'page-num';
        stamp.textContent = num + ' / ' + total;
        page.appendChild(stamp);
      });

      document.querySelectorAll('[data-pn-target]').forEach(target => {
        const key    = target.getAttribute('data-pn-target');
        const idx    = numberedPages.indexOf(target);
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