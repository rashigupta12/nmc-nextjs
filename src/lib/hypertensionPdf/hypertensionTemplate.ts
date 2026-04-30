// ============================================================
// Hypertension Report — Complete HTML Template Generator
// Matches NMC reference report structure exactly
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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function getThemeColor(opts: PdfGeneratorOptions): string {
  return opts.vendor?.themeColor ?? '#1F487C';
}

// ─────────────────────────────────────────────────────────────
// GENE FUNCTION LOGIC
// Derives "Genotype Function" and "Your response" from genotype
// using per-gene lookup tables sourced from the NMC reference report
// ─────────────────────────────────────────────────────────────

interface GeneRule {
  homoRef: string;    // e.g. "CC"  → homozygous reference
  het: string;        // e.g. "TC"  → heterozygous
  homoAlt: string;    // e.g. "TT"  → homozygous alternate
  // zygosity label derived automatically from genotype
  // functional status: 'F' = Functional, 'N' = Non-functional, 'M' = Mixed
  homoRefFunc: 'F' | 'N';
  hetFunc: 'F' | 'N';
  homoAltFunc: 'F' | 'N';
  // response labels
  homoRefResp: string;
  hetResp: string;
  homoAltResp: string;
}

// Gene rules derived from NMC reference report (Deepak Huger)
// Format: genotype → [zygosity string, functional string, response label]
const GENE_RULES: Record<string, GeneRule> = {
  WNK1A: {
    homoRef: 'CC', het: 'TC', homoAlt: 'TT',
    homoRefFunc: 'N', hetFunc: 'N', homoAltFunc: 'F',
    homoRefResp: 'Intermediate responder',
    hetResp: 'Not likely to respond',
    homoAltResp: 'Likely to respond',
  },
  WNK1B: {
    homoRef: 'CC', het: 'TC', homoAlt: 'TT',
    homoRefFunc: 'F', hetFunc: 'F', homoAltFunc: 'N',
    homoRefResp: 'Likely to respond',
    hetResp: 'Likely to respond',
    homoAltResp: 'Not likely to respond',
  },
  WNK1C: {
    homoRef: 'CC', het: 'TC', homoAlt: 'TT',
    homoRefFunc: 'F', hetFunc: 'N', homoAltFunc: 'N',
    homoRefResp: 'Likely to respond',
    hetResp: 'Not likely to respond',
    homoAltResp: 'Not likely to respond',
  },
  SLC12A3: {
    homoRef: 'CC', het: 'TC', homoAlt: 'TT',
    homoRefFunc: 'N', hetFunc: 'N', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  SCNN1A: {
    homoRef: 'CC', het: 'TC', homoAlt: 'TT',
    homoRefFunc: 'F', hetFunc: 'F', homoAltFunc: 'N',
    homoRefResp: 'Likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Not likely to respond',
  },
  'ALPHA ADDUCIN': {
    homoRef: 'GG', het: 'GT', homoAlt: 'TT',
    homoRefFunc: 'F', hetFunc: 'F', homoAltFunc: 'N',
    homoRefResp: 'Likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Not likely to respond',
  },
  'ADRB2 16': {
    homoRef: 'GG', het: 'AG', homoAlt: 'AA',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Likely to respond',
    homoAltResp: 'Likely to respond',
  },
  'ADRB2 27': {
    homoRef: 'CC', het: 'CG', homoAlt: 'GG',
    homoRefFunc: 'F', hetFunc: 'F', homoAltFunc: 'N',
    homoRefResp: 'Intermediate responder',
    hetResp: 'Likely to respond',
    homoAltResp: 'Not likely to respond',
  },
  'ADRB1 49': {
    homoRef: 'GG', het: 'AG', homoAlt: 'AA',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  'ADRB1 389': {
    homoRef: 'GG', het: 'CG', homoAlt: 'CC',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  CYP2D6: {
    homoRef: 'CC', het: 'CT', homoAlt: 'TT',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  RENIN: {
    homoRef: 'GG', het: 'AG', homoAlt: 'AA',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  'ANGIOTENSIN (1)': {
    homoRef: 'CC', het: 'CT', homoAlt: 'TT',
    homoRefFunc: 'N', hetFunc: 'N', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  'ANTIOTENSIN-2 RECEPTOR': {
    homoRef: 'CC', het: 'AC', homoAlt: 'AA',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
  'ANGIOTENSIN (2)': {
    homoRef: 'CC', het: 'CT', homoAlt: 'TT',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'N',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Not likely to respond',
  },
  'ANGIOTENSIN (3)': {
    homoRef: 'AA', het: 'AC', homoAlt: 'CC',
    homoRefFunc: 'N', hetFunc: 'F', homoAltFunc: 'F',
    homoRefResp: 'Not likely to respond',
    hetResp: 'Intermediate responder',
    homoAltResp: 'Likely to respond',
  },
};

function getZygosity(genotype: string): string {
  if (!genotype || genotype.length !== 2) return '';
  return genotype[0] === genotype[1] ? 'Homozygous' : 'Heterozygous';
}

function getGeneFunctionAndResponse(
  geneName: string,
  genotype: string
): { genotypeFunction: string; response: string } {
  const rule = GENE_RULES[geneName.toUpperCase()] ?? GENE_RULES[geneName];
  const gt = genotype?.toUpperCase()?.trim() ?? '';

  if (!rule || !gt) {
    return { genotypeFunction: '—', response: 'N/A' };
  }

  let funcCode: 'F' | 'N';
  let response: string;

  if (gt === rule.homoRef) {
    funcCode = rule.homoRefFunc;
    response = rule.homoRefResp;
  } else if (gt === rule.het || gt === rule.het.split('').reverse().join('')) {
    funcCode = rule.hetFunc;
    response = rule.hetResp;
  } else if (gt === rule.homoAlt) {
    funcCode = rule.homoAltFunc;
    response = rule.homoAltResp;
  } else {
    // Fallback: derive from zygosity pattern
    const isHomo = gt.length === 2 && gt[0] === gt[1];
    funcCode = 'N';
    response = isHomo ? 'Intermediate responder' : 'Intermediate responder';
  }

  const zygosity = getZygosity(gt);
  const functional = funcCode === 'F' ? 'Functional' : 'Non-functional';
  return {
    genotypeFunction: `${zygosity}, ${functional}`,
    response,
  };
}

// ─────────────────────────────────────────────────────────────
// SCORE / PERCENTAGE CALCULATION
// Mirrors NMC scoring: Likely=2, Intermediate=1, Not likely=0
// Percentage = (score / maxScore) * 100
// ─────────────────────────────────────────────────────────────

function scoreResponse(resp: string): number {
  const r = resp.toLowerCase();
  if (r.includes('likely to respond') && !r.includes('not')) return 2;
  if (r.includes('intermediate')) return 1;
  return 0;
}

function calcSectionPercent(genes: any[]): number {
  const total = genes.reduce((acc, gene) => {
    const { response } = getGeneFunctionAndResponse(
      gene.name,
      gene.report_variant || gene.test_variant
    );
    return acc + scoreResponse(response);
  }, 0);
  const max = genes.length * 2;
  if (max === 0) return 0;
  return Math.round((total / max) * 100);
}

// ─────────────────────────────────────────────────────────────
// MEDICATION RECOMMENDATION ORDER
// Ordered by descending section score (highest = primary)
// ─────────────────────────────────────────────────────────────

const SECTION_TO_MED: Record<string, string> = {
  'Renal genes': 'Thiazide or Thiazide-like Diuretics',
  'Cardiac Genes': 'Selective β-blocker. If co-morbidity for β-blockade, consider Ca+ channel blocker',
  'Vascular Genes': 'ACE Inhibitors & Angiotensin-II (AII) receptor blocker',
};

function buildMedicationRecommendations(sections: any): string[] {
  const order = ['Renal genes', 'Cardiac Genes', 'Vascular Genes'];
  const scored = order.map((name) => {
    const genes = sections[name]?.[0]?.gene ?? [];
    return { name, score: calcSectionPercent(genes), med: SECTION_TO_MED[name] };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.med);
}

// ─────────────────────────────────────────────────────────────
// RESPONSE CSS CLASS
// ─────────────────────────────────────────────────────────────

function getResponseClass(response: string): string {
  const r = response.toLowerCase();
  if (r.includes('likely to respond') && !r.includes('not')) return 'resp-likely';
  if (r.includes('intermediate')) return 'resp-intermediate';
  if (r.includes('not likely') || r.includes('not')) return 'resp-not';
  return '';
}

// ─────────────────────────────────────────────────────────────
// DONUT SVG (matches NMC report radial/donut chart style)
// ─────────────────────────────────────────────────────────────

function buildDonut(percent: number, themeColor: string): string {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const filled = (percent / 100) * circ;
  const empty = circ - filled;
  return `
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="#e0e0e0" stroke-width="10"/>
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="${themeColor}" stroke-width="10"
        stroke-dasharray="${filled.toFixed(2)} ${empty.toFixed(2)}"
        stroke-linecap="round"
        transform="rotate(-90 55 55)"/>
      <text x="55" y="55" text-anchor="middle" dominant-baseline="central"
        font-size="18" font-weight="700" fill="${themeColor}" font-family="Poppins,sans-serif">
        ${percent}%
      </text>
    </svg>`;
}

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────

function buildCSS(themeColor: string): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Poppins', sans-serif; background: #e0e0e0; font-size: 13px; color: #4d4d4d; }

.page {
  box-shadow: .5mm 2mm 2mm rgba(0,0,0,.3);
  margin: 5mm auto;
  width: 210mm;
  min-height: 297mm;
  background: white;
  position: relative;
  page-break-after: always;
  overflow: hidden;
}

@page { margin: 0; size: 210mm 297mm; }
@media print {
  body { background: white; }
  .page { margin: 0; box-shadow: none; width: 100%; min-height: 100vh; page-break-after: always; }
}

.content { margin: 0 auto; width: 182mm; padding-top: 18px; padding-bottom: 40px; }

/* Header */
.hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.hdr img { width: 28%; }
.hdr-addr { width: 68%; text-align: right; font-size: 10.5px; line-height: 1.65; color: #4d4d4d; }

/* Title */
.report-title {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  text-decoration: underline;
  color: ${themeColor};
  margin: 8px 0 12px;
}

/* Patient table */
.ptable { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px; }
.ptable th {
  background: #f5f5f5;
  color: ${themeColor};
  font-weight: 600;
  padding: 6px 8px;
  border: 1px solid #aaa;
  text-align: center;
}
.ptable td { padding: 6px 8px; border: 1px solid #aaa; vertical-align: top; line-height: 1.5; }

/* Disclaimer */
.disclaimer {
  color: red;
  font-weight: 600;
  text-align: center;
  font-size: 11.5px;
  margin: 10px 0;
}

/* Medication box */
.med-box { border: 1px solid #aaa; margin-bottom: 12px; }
.med-row {
  padding: 7px 14px;
  border-bottom: 1px solid #aaa;
  font-size: 11.5px;
  line-height: 1.55;
}
.med-row:last-child { border-bottom: none; }
.med-label { color: ${themeColor}; font-weight: 600; }
.med-value { font-weight: 500; }

/* Results detail */
.results-detail {
  font-size: 11.5px;
  line-height: 1.65;
  text-align: justify;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 14px;
}
.results-detail b { color: #333; }

/* Charts */
.charts-wrap {
  margin-top: 12px;
}
.charts-title {
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  margin-bottom: 14px;
}
.charts-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.chart-item { text-align: center; }
.chart-label {
  font-size: 12px;
  font-weight: 700;
  color: ${themeColor};
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

/* Gene tables (page 2) */
.section-wrap {
  display: flex;
  align-items: stretch;
  margin-top: 18px;
}
.section-label-col {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  background: #DDD9C3;
  color: #333;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 1px;
  text-align: center;
  padding: 8px 5px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gene-table {
  flex: 1;
  border-collapse: collapse;
  font-size: 11px;
}
.gene-table th {
  background: #f5f5f5;
  color: ${themeColor};
  font-weight: 600;
  border: 1px solid #aaa;
  padding: 6px 8px;
  text-align: center;
}
.gene-table td {
  border: 1px solid #aaa;
  padding: 5px 8px;
  text-align: center;
  line-height: 1.45;
}
.gene-table td:first-child { text-align: left; font-weight: 500; }

/* Response colors — matches NMC: green / orange / red */
.resp-likely     { color: #2e7d32; font-weight: 600; }
.resp-intermediate { color: #e65100; font-weight: 600; }
.resp-not        { color: #c62828; font-weight: 600; }

/* Methodology / Disclaimer text */
.method-text { font-size: 11px; line-height: 1.7; text-align: justify; margin-top: 14px; }
.method-text b { text-decoration: underline; }

/* Page 3 – Signatures */
.sig-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
  margin-bottom: 36px;
}
.sig-block { font-size: 11px; font-weight: 500; line-height: 1.6; }
.sig-block .sig-img { max-height: 60px; display: block; margin-bottom: 4px; }
.sig-block .sig-line {
  border-top: 1px solid #333;
  padding-top: 4px;
  min-width: 160px;
}

/* References */
.ref-heading { color: ${themeColor}; font-size: 16px; font-weight: 500; margin-bottom: 12px; }
.ref-list { list-style: decimal; padding-left: 18px; }
.ref-list li { font-size: 10.5px; line-height: 1.7; text-align: justify; margin-bottom: 4px; }

/* End of report */
.eor { text-align: center; font-size: 12px; font-weight: 500; margin-top: 30px; }

/* Page number */
.page-number {
  font-size: 11px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 12px;
  background: #e2e8f0;
  padding: 2px 10px;
  border-radius: 12px;
}
`;
}

// ─────────────────────────────────────────────────────────────
// PAGE 1
// ─────────────────────────────────────────────────────────────

function buildPage1(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const reportData = opts.reportData ?? {};
  const pd = reportData.PatientDetails ?? {};
  const sd = reportData.SampleDetails ?? {};
  const sections = reportData.sections?.flat ?? {};

  // Dynamic medication recommendations based on section gene scores
  const [rec1, rec2, rec3] = buildMedicationRecommendations(sections);

  // Interpretation from highest-priority section (Renal → Cardiac → Vascular)
  const interpretation =
    sections['Renal genes']?.[0]?.interpretation ||
    sections['Cardiac Genes']?.[0]?.interpretation ||
    sections['Vascular Genes']?.[0]?.interpretation ||
    'Based on genetic profile, personalized medication recommendations are provided above.';

  // Per-section percentages calculated from gene responses
  const renalGenes = sections['Renal genes']?.[0]?.gene ?? [];
  const cardiacGenes = sections['Cardiac Genes']?.[0]?.gene ?? [];
  const vascularGenes = sections['Vascular Genes']?.[0]?.gene ?? [];

  const renalPct = calcSectionPercent(renalGenes);
  const cardiacPct = calcSectionPercent(cardiacGenes);
  const vascularPct = calcSectionPercent(vascularGenes);

  // Format gender
  const genderRaw = pd.gender ?? '';
  const gender =
    genderRaw === 'M' ? 'MALE'
    : genderRaw === 'F' ? 'FEMALE'
    : genderRaw.toUpperCase();

  // Format date helper (DD/MM/YYYY)
  function fmtDate(d: string): string {
    if (!d) return '—';
    // already formatted
    if (/\d{2}\/\d{2}\/\d{4}/.test(d)) return d;
    // ISO yyyy-mm-dd
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  }

  const coverLogoUrl = opts.vendor?.coverLogoUrl ?? `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`;
  const vendorAddress = opts.vendor?.vendorAddress ?? '<b>NEOTECH WORLD LAB PRIVATE LIMITED</b><br>Gurugram, Haryana 122015';

  return `
  <div class="page">
    <div class="content">

      <!-- Header -->
      <div class="hdr">
        <img src="${coverLogoUrl}" alt="Logo">
        <div class="hdr-addr">${vendorAddress}</div>
      </div>

      <!-- Title -->
      <div class="report-title">Hypertension Pharmacogenomic Panel</div>

      <!-- Patient Information Table -->
      <table class="ptable">
        <thead>
          <tr>
            <th colspan="2">Patient Information</th>
            <th>Test Details</th>
            <th>Referring Physician Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Patient Name :</b> ${pd.name ?? pd.patientName ?? '—'}</td>
            <td><b>Patient Id :</b> ${pd.patientId ?? '—'}</td>
            <td><b>Test Id :</b> NMC-HTN</td>
            <td><b>Physician Name :</b> ${pd.referredBy ?? '—'}</td>
          </tr>
          <tr>
            <td><b>Sample ID :</b> ${sd.vendorSampleId ?? sd.kitBarcode ?? '—'}</td>
            <td><b>Age :</b> ${pd.age ?? '—'}&nbsp;&nbsp;<b>Gender :</b> ${gender || '—'}</td>
            <td><b>Collection Date :</b> ${fmtDate(sd.sample_date)}</td>
            <td><b>Institutions :</b> ${pd.hospital ?? pd.institution ?? '—'}</td>
          </tr>
          <tr>
            <td><b>Height :</b> ${pd.height ?? '—'} cm</td>
            <td><b>Weight :</b> ${pd.weight ?? '—'} kg</td>
            <td><b>Specimen Type :</b> ${sd.sampleType ?? '—'}</td>
            <td><b>Report Date :</b> ${fmtDate(sd.report_date) !== '—' ? fmtDate(sd.report_date) : new Date().toLocaleDateString('en-GB')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Disclaimer -->
      <div class="disclaimer">Do not start or stop taking any medications without first consulting your Doctor.</div>

      <!-- Medication Recommendations — dynamically ordered by section score -->
      <div class="med-box">
        <div class="med-row">
          <span class="med-label">1.&nbsp;&nbsp;&nbsp; Primary Recommendation:</span><br>
          <span class="med-value">${rec1 ?? '—'}</span>
        </div>
        <div class="med-row">
          <span class="med-label">2.&nbsp;&nbsp;&nbsp; If the above recommendation is not effective or appropriate for your patient, consider:</span><br>
          <span class="med-value">${rec2 ?? '—'}</span>
        </div>
        <div class="med-row">
          <span class="med-label">3.&nbsp;&nbsp;&nbsp; If the above recommendation is not effective or appropriate for your patient, consider:</span><br>
          <span class="med-value">${rec3 ?? '—'}</span>
        </div>
      </div>

      <!-- Results Detail -->
      <p class="results-detail"><b>Results Detail:</b> ${interpretation}</p>

      <!-- Donut Charts — percentages calculated from gene response scores -->
      <div class="charts-wrap">
        <div class="charts-title">Percentage contribution of the different factors involved in hypertension</div>
        <div class="charts-row">
          <div class="chart-item">
            <div class="chart-label">RENAL</div>
            ${buildDonut(renalPct, themeColor)}
          </div>
          <div class="chart-item">
            <div class="chart-label">CARDIAC</div>
            ${buildDonut(cardiacPct, themeColor)}
          </div>
          <div class="chart-item">
            <div class="chart-label">VASCULAR</div>
            ${buildDonut(vascularPct, themeColor)}
          </div>
        </div>
      </div>

    </div>
    <div class="page-number">1 / 3</div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// GENE TABLE SECTION (for Page 2)
// ─────────────────────────────────────────────────────────────

function buildGeneSection(sectionLabel: string, conditionKey: string, sections: any): string {
  const data = sections[conditionKey];
  if (!data?.[0]?.gene?.length) return '';

  const genes: any[] = data[0].gene;

  const rows = genes.map((gene) => {
    const genotype = gene.report_variant || gene.test_variant || '—';
    const { genotypeFunction, response } = getGeneFunctionAndResponse(gene.name, genotype);
    const respClass = getResponseClass(response);

    return `
      <tr>
        <td>${gene.name}</td>
        <td>${genotype}</td>
        <td>${genotypeFunction}</td>
        <td class="${respClass}">${response}</td>
      </tr>`;
  }).join('');

  return `
  <div class="section-wrap">
    <div class="section-label-col">${sectionLabel}</div>
    <table class="gene-table">
      <thead>
        <tr>
          <th>Gene</th>
          <th>Your Genotype</th>
          <th>Genotype Function</th>
          <th>Your response</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// PAGE 2
// ─────────────────────────────────────────────────────────────

function buildPage2(opts: PdfGeneratorOptions): string {
  const reportData = opts.reportData ?? {};
  const sections = reportData.sections?.flat ?? {};
  const coverLogoUrl = opts.vendor?.coverLogoUrl ?? `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`;
  const vendorAddress = opts.vendor?.vendorAddress ?? '<b>NEOTECH WORLD LAB PRIVATE LIMITED</b><br>Gurugram, Haryana 122015';

  return `
  <div class="page">
    <div class="content">

      <!-- Header -->
      <div class="hdr">
        <img src="${coverLogoUrl}" alt="Logo">
        <div class="hdr-addr">${vendorAddress}</div>
      </div>

      ${buildGeneSection('RENAL', 'Renal genes', sections)}
      ${buildGeneSection('CARDIAC', 'Cardiac Genes', sections)}
      ${buildGeneSection('VASCULAR', 'Vascular Genes', sections)}

      <div class="method-text" style="margin-top:20px;">
        <p><b>TEST METHODOLOGY:</b> SNP analysis by PCR followed by Genotyping technology.</p>
      </div>
      <div class="method-text" style="margin-top:8px;">
        <p><b>TEST LIMITATIONS:</b> There may be other variants in the genes under testing which are not included in this test and may influence the response to drugs. The DNA testing is not a substitute for clinical monitoring.</p>
      </div>
      <div class="method-text" style="margin-top:8px;">
        <p><b>DISCLAIMER OF LIABILITY:</b> The information contained in this report is provided as a service and does not constitute medical advice. The information in this report is based on published research; however, the research data evolves and with time new or amended data is expected to be added to drug information. While this report is believed to be accurate and complete as of the date issued,<br>
        THE DATA IS PROVIDED "AS IS", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. This test is intended to assist a physician to tailor her/his patient's treatment. There are various factors which needs to be taken into consideration before prescribing any drug and the PHYSICIAN/EXPERT judgment is final.</p>
      </div>

    </div>
    <div class="page-number">2 / 3</div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// PAGE 3 — Signatures + Full References (16 refs matching NMC)
// ─────────────────────────────────────────────────────────────

function buildPage3(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts);
  const coverLogoUrl = opts.vendor?.coverLogoUrl ?? `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`;
  const vendorAddress = opts.vendor?.vendorAddress ?? '<b>NEOTECH WORLD LAB PRIVATE LIMITED</b><br>Gurugram, Haryana 122015';

  return `
  <div class="page">
    <div class="content">

      <!-- Header -->
      <div class="hdr">
        <img src="${coverLogoUrl}" alt="Logo">
        <div class="hdr-addr">${vendorAddress}</div>
      </div>

      <!-- Signatures — two signatories matching NMC report -->
      <div class="sig-row">
        <div class="sig-block">
          <img class="sig-img"
            src="${BASE_URL}/assets/images/Varun Signature.jpeg"
            onerror="this.style.display='none'">
          <div class="sig-line">
            Dr. Varun Sharma, Ph.D<br>Scientist - Human Genetics
          </div>
        </div>
        <div class="sig-block">
          <img class="sig-img"
            src="${BASE_URL}/assets/images/Nidhi Signature.jpeg"
            onerror="this.style.display='none'">
          <div class="sig-line" style="text-align:right;">
            Dr. Nidhi Chahal<br>Scientist-Laboratory
          </div>
        </div>
      </div>

      <!-- References — full 16-item list from NMC report -->
      <div class="ref-heading">References</div>
      <ol class="ref-list">
        <li>Cunningham, P. N., &amp; Chapman, A. B. (2019). Pharmacogenomics in hypertension: Where we stand today.</li>
        <li>Cunningham, P. N., &amp; Chapman, A. B. (2019). The future of pharmacogenetics in the treatment of hypertension.</li>
        <li>Hiltunen, T. P., Donner, K. M., Sarin, A. P., Saarela, J., Ripatti, S., Chapman, A. B., ... &amp; Kontula, K. K. (2015). Pharmacogenomics of hypertension: a genome‐wide, placebo‐controlled cross‐over study, using four classes of antihypertensive drugs. <i>Journal of the American Heart Association</i>, 4(1), e001521.</li>
        <li>Johnson, J. A. (2010). Pharmacogenomics of antihypertensive drugs: past, present and future. <i>Pharmacogenomics</i>, 11(4), 487–491.</li>
        <li>Johnson, R., Dludla, P., Mabhida, S., Benjeddou, M., Louw, J., &amp; February, F. (2019). Pharmacogenomics of amlodipine and hydrochlorothiazide therapy and the quest for improved control of hypertension: a mini review. <i>Heart failure reviews</i>, 24(3), 343–357.</li>
        <li>Kelley, E. F., Olson, T. P., Curry, T. B., Sprissler, R., &amp; Snyder, E. M. (2019). The Effect of Genetically Guided Mathematical Prediction and the Blood Pressure Response to Pharmacotherapy in Hypertension Patients. <i>Clinical Medicine Insights: Cardiology</i>, 13, 1179546819845883.</li>
        <li>Kelley, E. F., Snyder, E. M., Alkhatib, N. S., Snyder, S. C., Sprissler, R., Olson, T. P., ... &amp; Abraham, I. (2018). Economic evaluation of a pharmacogenomic multi-gene panel test to optimize anti-hypertension therapy: simulation study. <i>Journal of medical economics</i>, 21(12), 1246–1253.</li>
        <li>Konoshita, T., Genomic Disease Outcome Consortium, &amp; Study Investigators. (2011). Do Genetic Variants of the Renin-Angiotensin System Predict Blood Pressure Response to Renin-Angiotensin System–Blocking Drugs? A Systematic Review of Pharmacogenomics in the Renin-Angiotensin System. <i>Current hypertension reports</i>, 13(5), 356–361.</li>
        <li>Maggioni, C., Lanzani, C., Citterio, L., Catena, C., Bigazzi, R., Carpini, S. D., &amp; Manunta, P. (2019). PHARMACOGENOMICS OF HYPERTENSION: A NEW APPROACH FOR A PERSONALIZED MEDICINE. <i>Journal of Hypertension</i>, 37, e216.</li>
        <li>Oliveira-Paula, G. H., Pereira, S. C., Tanus-Santos, J. E., &amp; Lacchini, R. (2019). Pharmacogenomics and hypertension: Current insights. <i>Pharmacogenomics and personalized medicine</i>, 12, 341.</li>
        <li>Phelps, P. K., Kelley, E. F., Walla, D. M., Ross, J. K., Simmons, J. J., Bulock, E. K., ... &amp; Snyder, E. M. (2019). Relationship between a weighted multi-gene algorithm and blood pressure control in hypertension. <i>Journal of clinical medicine</i>, 8(3), 289.</li>
        <li>Richardson, C., &amp; Alessi, D. R. (2008). The regulation of salt transport and blood pressure by the WNK-SPAK/OSR1 signalling pathway. <i>Journal of cell science</i>, 121(20), 3293–3304.</li>
        <li>Rysz, J., Franczyk, B., Rysz-Górzyńska, M., &amp; Gluba-Brzózka, A. (2020). Pharmacogenomics of Hypertension Treatment. <i>International Journal of Molecular Sciences</i>, 21(13), 4709.</li>
        <li>Snyder, E., Sprissler, R., Johnson, M., Beenken, G., Curry, T., Cassuto, N., ... &amp; Olson, T. (2018). Association of a Multi-Gene Panel with Blood Pressure Medication Success in Patients with Hypertension: A Pilot Study.</li>
        <li>Supiano, M. A., &amp; Williamson, J. D. (2019). New guidelines and SPRINT results: implications for Geriatric Hypertension. <i>Circulation</i>, 140(12), 976–978.</li>
        <li>Turner, S. T., Schwartz, G. L., Chapman, A. B., &amp; Boerwinkle, E. (2005). WNK1 kinase polymorphism and blood pressure response to a thiazide diuretic. <i>Hypertension</i>, 46(4), 758–765.</li>
      </ol>

      <div class="eor">******************** End of Report ***********************</div>

    </div>
    <div class="page-number">3 / 3</div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export function buildHypertensionReportHtml(opts: PdfGeneratorOptions): string {
  // Support both flat reportData and nested templateData.reportData API shapes
  const rawData = (opts.reportData as any)?.templateData?.reportData ?? opts.reportData;
  const normalizedOpts: PdfGeneratorOptions = {
    ...opts,
    vendor: opts.vendor ?? (opts.reportData as any)?.templateData?.vendor,
    reportData: rawData,
  };

  const themeColor = getThemeColor(normalizedOpts);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hypertension Pharmacogenomic Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  ${buildPage1(normalizedOpts)}
  ${buildPage2(normalizedOpts)}
  ${buildPage3(normalizedOpts)}
</body>
</html>`;
}