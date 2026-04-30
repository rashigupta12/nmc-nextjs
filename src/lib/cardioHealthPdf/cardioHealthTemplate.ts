// ============================================================
// Cardio Health Report — Complete HTML Template Generator
// Faithfully replicates the NMC Cardiomet PDF Report layout
// ============================================================

export interface PdfGeneratorOptions {
  reportData: ReportData;
  vendor?: VendorConfig;
}

export interface VendorConfig {
  themeColor?: string;
  textColor?: string;
  logoUrl?: string;
  coverPageImg?: string;
  backCoverImg?: string;
  coverLogoUrl?: string;
  signatureUrl?: string;
  sigName?: string;
  sigTitle?: string;
  vendorName?: string;
  welcomeMessage?: string;
  aboutContent?: string;
  legalContent?: string;
}

export interface ReportData {
  PatientDetails: PatientDetails;
  SampleDetails: SampleDetails;
  ReportData: Record<string, ConditionData[]>;
}

export interface PatientDetails {
  name: string;
  age: string | number;
  weight?: string | number;
  height?: string | number;
  gender: string;
  patientId: string;
  referredBy?: string;
  hospital?: string;
}

export interface SampleDetails {
  vendorSampleId?: string;
  kitBarcode?: string;
  sampleType: string;
  sample_date?: string;
  report_date?: string;
  test?: string;
}

export interface ConditionData {
  condition_name: string;
  display_condition: string;
  condition_desc: string;
  interpretation: string;
  recommendation: string;
  condition_status: string;
  risk_factors?: string;
  symptoms?: string;
  prevention?: string;
  gene: GeneData[];
}

export interface GeneData {
  name: string;
  uniqueid: string;
  report_variant?: string;
  test_variant?: string;
  response: string;
  status: string;
  gene_description: string;
}

// ─── Constants ───────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const IMG = `${BASE_URL}/reportimg/cardiomet_images`;
const ASSETS = `${BASE_URL}`;

// ─── Helpers ─────────────────────────────────────────────────
function getThemeColor(vendor?: VendorConfig): string {
  return vendor?.themeColor ?? '#ea5456';
}

function getTextColor(vendor?: VendorConfig): string {
  return vendor?.textColor ?? '#3E6F85';
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

function statusColor(status: string): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'good' || s === 'normal') return 'green';
  if (s === 'average' || s === 'moderate') return '#ffa500';
  return 'red';
}

function statusBox(response: string, status: string): string {
  const color = statusColor(status);
  const label = response || status || 'Normal';
  return `<div style="background:white;color:${color};padding:5px 8px;border-radius:2px;text-align:center;font-weight:700;font-size:12px;font-family:'Poppins',sans-serif;">${label}</div>`;
}

// ─── Page Header ─────────────────────────────────────────────
// Layout from PDF: [red accent square 12mm] [white title text] [grey bar flex] [small logo]
// The red square is always on the LEFT (inner edge), logo always on far RIGHT
function pageHeader(title: string, align: 'left' | 'right', isCover: boolean, themeColor: string, logoUrl?: string): string {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="max-height:18px;max-width:60px;object-fit:contain;display:block;" alt="Logo"/>`
    : `<span style="color:${themeColor};font-size:7pt;font-weight:700;">NMC</span>`;

  // Both left and right pages: red square left, title text, grey fill, logo right
  return `
  <div style="position:absolute;top:0;left:0;width:100%;height:22px;display:flex;align-items:stretch;z-index:100;">
    <div style="width:30px;min-width:30px;background:${themeColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    </div>
    <div style="background:white;padding:0 12px;white-space:nowrap;font-weight:600;letter-spacing:1.5px;color:${themeColor};font-size:7pt;display:flex;align-items:center;flex-shrink:0;">${title.toUpperCase()}</div>
    <div style="flex:1;background:#E7E7E7;"></div>
    <div style="background:#E7E7E7;padding:0 6px;display:flex;align-items:center;flex-shrink:0;">
      ${logoHtml}
    </div>
  </div>`;
}

// ─── Page Footer ─────────────────────────────────────────────
// PDF layout: logo bottom-left, grey bar stretches, page number at center bottom (added by script)
function pageFooter(align: 'left' | 'right', isCover: boolean, logoUrl?: string): string {
  const logo = logoUrl
    ? `<img src="${logoUrl}" style="max-height:32px;max-width:100px;object-fit:contain;" alt="logo"/>`
    : `<div style="width:80px;height:32px;"></div>`;

  return `
  <div style="position:absolute;bottom:6px;left:7mm;width:calc(100% - 14mm);display:flex;align-items:flex-end;z-index:100;gap:6px;">
    ${logo}
    <div style="flex:1;background:#E7E7E7;height:16px;margin-bottom:4px;"></div>
  </div>`;
}

// ─── Header Box (condition banner with bg image) ─────────────
function headerBox(config: { bgImagePath: string; heading: string; content?: string }, themeColor: string): string {
  return `
  <div style="position:relative;width:100%;min-height:200px;background-image:url('${config.bgImagePath}');background-size:cover;background-position:center;margin-bottom:0;">
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.42);"></div>
    <div style="position:relative;z-index:1;padding:16px 20px 12px;">
      <div style="display:flex;justify-content:flex-end;">
        <div style="background:rgba(255,255,255,0.12);border-right:4px solid ${themeColor};padding:4px 14px 4px 10px;max-width:65%;">
          <h2 style="color:white;font-size:22px;font-weight:700;margin:0;text-shadow:1px 1px 3px rgba(0,0,0,0.5);">${config.heading}</h2>
        </div>
      </div>
      ${config.content ? `<p style="color:white;font-size:11px;margin:10px 0 0 0;line-height:1.5;text-shadow:1px 1px 2px rgba(0,0,0,0.6);">${config.content}</p>` : ''}
    </div>
  </div>`;
}

// ─── Gene Row (left-red genotype box + right grey gene info) ─
function showGeneRow(
  themeColor: string,
  variant: string,
  uniqueId: string,
  response: string,
  status: string,
  geneName: string,
  geneDesc: string,
  minHeight: string = 'auto'
): string {
  return `
  <table style="width:100%;border-collapse:collapse;margin-bottom:2px;">
    <tbody>
      <tr>
        <td style="background-color:${themeColor};width:37%;vertical-align:top;padding:10px 12px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="color:white;font-size:8.5px;font-weight:600;font-family:'Poppins',sans-serif;">Your Genotype</span>
              <span style="color:white;font-size:8.5px;font-weight:600;font-family:'Poppins',sans-serif;">Unique Id/SNP</span>
            </div>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.4);margin:4px 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="color:white;font-size:22px;font-weight:700;line-height:1.1;font-family:'Poppins',sans-serif;">${variant}</span>
              <span style="color:white;font-size:12px;font-weight:600;font-family:'Poppins',sans-serif;">${uniqueId}</span>
            </div>
            <div style="color:white;font-size:8.5px;font-weight:600;margin-top:8px;font-family:'Poppins',sans-serif;">Your Response</div>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.4);margin:4px 0;">
            ${statusBox(response, status)}
          </div>
        </td>
        <td style="background:#DFDFDF;vertical-align:top;padding:12px 14px;min-height:${minHeight};">
          <h1 style="color:${themeColor};font-size:15px;font-weight:700;margin:0 0 6px 0;letter-spacing:0.2px;font-family:'Poppins',sans-serif;">${geneName}</h1>
          <hr style="border:none;border-top:1px solid #bbb;margin:0 0 6px 0;">
          <p style="color:rgb(77,77,77);font-size:10px;line-height:1.5;margin:0;text-align:justify;font-family:'Poppins',sans-serif;">${geneDesc}</p>
        </td>
      </tr>
    </tbody>
  </table>`;
}

// ─── Interpretation + Recommendation box ─────────────────────
function showInterpretation(interpretation: string, recommendation: string, minHeight: string = '120px'): string {
  return `
  <table style="width:100%;border-collapse:collapse;margin-top:2px;">
    <tbody>
      <tr>
        <td style="width:50%;background:#DFDFDF;padding:12px 16px;vertical-align:top;">
          <div style="text-align:center;color:#ea5456;font-size:10.5px;font-weight:700;margin-bottom:7px;letter-spacing:0.5px;">Interpretation</div>
          <p style="color:#444;font-size:10.5px;line-height:1.5;text-align:justify;margin:0;">${interpretation}</p>
        </td>
        <td style="width:50%;background:#E8E8E8;padding:12px 16px;vertical-align:top;">
          <div style="text-align:center;color:#ea5456;font-size:10.5px;font-weight:700;margin-bottom:7px;letter-spacing:0.5px;">Recommedation</div>
          <p style="color:#444;font-size:10.5px;line-height:1.5;text-align:justify;margin:0;">${recommendation}</p>
        </td>
      </tr>
    </tbody>
  </table>`;
}

// ─── Risk Factors / Symptoms / Prevention boxes ───────────────
function showRiskBoxes(riskFactors: string, symptoms: string, prevention: string): string {
  return `
  <div style="display:flex;gap:8px;margin-top:8px;padding:0 8px 8px;">
    <div style="flex:1;background:#ffeaea;border-radius:8px;box-shadow:3px 3px #ea5456;padding:8px 8px 8px 8px;min-height:160px;">
      <div style="color:#ea5456;font-size:11px;font-weight:700;margin-bottom:6px;">Risk Factor</div>
      <div class="rfac-inner" style="color:#000000b8;font-size:10px;line-height:1.45;padding-left:2px;">${riskFactors || '<p style="margin:0;">—</p>'}</div>
    </div>
    <div style="flex:1;background:#ffeaea;border-radius:8px;box-shadow:3px 3px #ea5456;padding:8px;min-height:160px;">
      <div style="color:#ea5456;font-size:11px;font-weight:700;margin-bottom:6px;">Symptoms</div>
      <div class="rfac-inner" style="color:#000000b8;font-size:10px;line-height:1.45;padding-left:2px;">${symptoms || '<p style="margin:0;">—</p>'}</div>
    </div>
    <div style="flex:1;background:#ffeaea;border-radius:8px;box-shadow:3px 3px #ea5456;padding:8px;min-height:160px;">
      <div style="color:#ea5456;font-size:11px;font-weight:700;margin-bottom:6px;">Prevention</div>
      <div class="rfac-inner" style="color:#000000b8;font-size:10px;line-height:1.45;padding-left:2px;">${prevention || '<p style="margin:0;">Maintain a healthy lifestyle.</p>'}</div>
    </div>
  </div>`;
}

// ─── CSS ─────────────────────────────────────────────────────
function buildCSS(themeColor: string, textColor: string): string {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #ccc;
    font-size: 13px;
    color: ${textColor};
  }

  .page {
    box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
    margin: 5mm auto;
    width: 220mm;
    min-height: 297mm;
    background-color: white;
    position: relative;
    page-break-after: always;
    overflow: hidden;
    background-size: cover;
    background-position: center;
  }

  @page { margin: 0; size: 220mm 297mm; }
  @media print {
    body { background: white; }
    .page { margin: 0; box-shadow: none; width: 100%; min-height: 90vh; }
  }

  .content-box {
    margin: 0 auto;
    width: 195mm;
    padding-bottom: 60px;
  }

  p {
    text-align: justify;
    color: ${textColor};
    font-size: 13px;
    font-weight: 400;
    margin: 0 0 8px 0;
    line-height: 20px;
  }

  h1,h2,h3,h4,h5 { margin: 0; }

  .header-heading {
    font-size: 32px;
    font-weight: 300;
    margin: 15px 0 8px 0;
    color: ${themeColor};
  }

  .section-subheading {
    font-size: 18px;
    color: ${textColor};
    margin: 14px 0 6px 0;
    font-weight: 600;
  }

  /* Profile table */
  .profile-table { width: 100%; border-collapse: collapse; margin-top: 14px; }
  .profile-table tr td {
    padding: 7px 12px;
    background-color: #F4F6F5;
    color: #6d7c89;
    font-size: 16px;
    letter-spacing: 0.5px;
  }
  .profile-table tr td:first-child {
    background-color: ${themeColor};
    border-right: 5px solid white;
    color: white;
    width: 260px;
    font-size: 14px;
    letter-spacing: 1px;
  }

  .summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px;
  font-size: 11px;
}

.summary-table th {
  background: #ea5456;
  color: white;
  padding: 5px 6px;
  text-align: center;
  font-weight: 600;
}

.summary-table td {
  padding: 5px 6px;
  text-align: center;
  color: #333;
  border-bottom: 1px solid #eee;
}

.summary-table tr:nth-child(even) td {
  background: #f3f7f6;
}

.summary-section-bar {
  background: #ea5456;
  color: white;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 12px;
  margin: 16px 0 14px 0;
  text-align: center;
}

.summary-condition-name {
  font-size: 14px;
  font-weight: 700;
  color: #444;
  margin: 8px 0 6px 2px;
}

  .interp-box {
    background: #eaeaea;
    padding: 7px 10px;
    font-size: 11px;
    color: #444;
    line-height: 1.4;
    margin-top: 4px;
  }

  /* Cover page */
  .first-cover-heading {
    font-size: 46px;
    color: #00adef;
    font-weight: 300;
    position: absolute;
    left: 39px;
    bottom: 144px;
  }
  .cover-report-sub {
    font-size: 40px;
    color: #7d8d94;
    font-weight: 300;
    position: absolute;
    left: 39px;
    bottom: 95px;
  }
  .cover-patient-name {
    font-size: 20px;
    color: white;
    font-weight: 500;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${themeColor};
    padding: 10px 0 10px 39px;
    line-height: 1.3;
  }
  .section-cover-heading {
    font-size: 64px;
    color: white;
    font-weight: 800;
    position: absolute;
    left: 55px;
    bottom: 260px;
    line-height: 1.1;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
  }

  /* Diagram boxes for sample page */
  .diagram-box {
    background: ${themeColor};
    color: white;
    font-size: 8px;
    font-weight: 600;
    padding: 4px 5px;
    text-align: center;
    border-radius: 3px;
    position: absolute;
    line-height: 1.3;
    min-width: 65px;
  }

  ul, ol { padding-left: 16px; }
  li { margin-bottom: 3px; color: ${textColor}; font-size: 11px; line-height: 1.45; }

  /* Risk box inner content */
  .rfac-inner li { font-size: 10px; margin-bottom: 2px; line-height: 1.4; color: #000000b8; }
  .rfac-inner p { font-size: 10px; margin: 0; line-height: 1.4; color: #000000b8; }

  .references-list li { font-size: 10.5px; margin-bottom: 6px; font-style: italic; line-height: 1.45; color: #444; }
  `;
}

// ─── Cover Page ───────────────────────────────────────────────
function coverPage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const coverImg = vendor?.coverPageImg || `${IMG}/Front-Cover.jpg`;
  const logoUrl = vendor?.coverLogoUrl || vendor?.logoUrl || '';
  const name = reportData.PatientDetails.name;

  return `
  <div class="page" style="background-image:url('${coverImg}');background-size:fit;background-position:top;">
   
    <h1 class="first-cover-heading" style="font-family:'Poppins',sans-serif;">My Cardiomet</h1>
    <h2 class="cover-report-sub" style="font-family:'Poppins',sans-serif;">Report</h2>
    <div class="cover-patient-name">Patient Name : ${name}</div>
  </div>`;
}

// ─── Blank Interior Page (page 2 with logo centre) ───────────
function interiorPage2(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  const s = opts.reportData.SampleDetails;
  const sampleId = s.kitBarcode || s.vendorSampleId || '';
  const reportDate = s.report_date ? formatDate(s.report_date) : today();
  return `
  <div class="page" style="background:white;">
    <div style="position:absolute;width:100%;top:50%;transform:translateY(-50%);text-align:center;">
      ${logoUrl ? `<img style="width:60%;max-width:320px;" src="${logoUrl}" alt="logo"/>` : ''}
    </div>
    <div style="color:${themeColor};position:absolute;width:100%;bottom:20px;text-align:center;font-weight:500;font-size:14px;">
      SAMPLE ID: ${sampleId.toUpperCase()} and date of report : ${reportDate}
    </div>
  </div>`;
}

// ─── Welcome Page ─────────────────────────────────────────────
function welcomePage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = vendor?.logoUrl || '';
  const name = reportData.PatientDetails.name;
  const vendorName = vendor?.vendorName || 'Neotech (Formerly Known as NMC Genetics)';
  const sigUrl = vendor?.signatureUrl || `${ASSETS}/images/govindSignature.png`;
  const sigName = vendor?.sigName || 'NMC Genetics';
  const welcomeMsg = vendor?.welcomeMessage || `
    <p>${vendorName} is pleased to provide your cardio-metabolic targeted biomarkers report based on your unique genome profile. The report offers you a snap-shot of your genetic response pertaining to cardiac and metabolic diseases. The recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
    <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray;utilizing globally validated procedures. The information received from your genetic code determines the onset of disease in your lifetime. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
    <p>With insights from this report, your clinicians or Wellness consultant has a guidance map to device a personalized drug and accordingly lifestyle changes to help you achieve optimal health. By seeking professional advice and following the recommendations you can improve your health holistically.</p>
    <p>Wishing you good health!</p>`;

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'right', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">Welcome</h1>
      <br/>
      <h4 style="color:${getTextColor(vendor)};font-size:13px;font-weight:500;">Dear ${name},</h4>
      <br/>
      ${welcomeMsg}
      <br/>
      <img style="max-height:80px;display:block;" src="${sigUrl}" alt="signature"/>
      <p style="margin-top:8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For ${sigName}<br/>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="font-size:14px;">(${sigName})</b>
      </p>
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── About Us ─────────────────────────────────────────────────
function aboutUsPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';
  const aboutContent = opts.vendor?.aboutContent || `
    <p>NMC Genetics is a clinical genomics company with a vision to innovate healthcare using genomics and data science.</p>
    <p>Our services, delivered from a state-of-the-art genomics laboratory, empower clinicians and health care professionals with precise and actionable results to help improve patient care. NMC Genetics has strong focus and domain expertise in clinical genomics, preventive health, and personalized medicine.</p>
    <p>Led by a unique team of highly skilled molecular biologists, bioinformaticians and data scientists, NMC Genetics is poised for a big leap into the future of healthcare.</p>
    <p>NMC Genetics is a subsidiary of NMC Healthcare LLC. a largest private healthcare company in the UAE and ranks amongst the leading fertility service providers in the world. Over the last forty-three years, NMC has earned the trust of millions, thanks to its personalized care, genuine concern and a sincere commitment to the overall well-being of the patient.</p>
    <p>NMC was the first company from Abu Dhabi to list on the London Stock Exchange and is now part of the premium FTSE 100 Index, an elite club of top 100 blue-chip companies by market cap. NMC's strategic acquisitions coupled with its legacy institutions have allowed us to clear the service gap in our healthcare delivery system and offer a continuum of care to patients.</p>`;

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">About Us</h1>
      <br/>
      ${aboutContent}
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

// ─── Legal Disclaimer ─────────────────────────────────────────
function legalPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';
  const legalContent = opts.vendor?.legalContent || `
    <p>This report is based on your unique DNA results obtained by testing your buccal swabs/blood/saliva samples in response to a selection of key genes that are associated with the individual health. NMC Genetics provides genetic assessment services only for investigational purposes and the information thus given should be interpreted and used exclusively only by qualified medical practitioners, certified physicians, dieticians, nutritionist, sports therapists and others in similar professions. The company does not provide any medical advise and this report does not constitute a medical diagnostic report.</p>
    <p>Genetic results are unique but being associated with a futuristic technology, the same must be used only under proper advice. NMC Genetics does not guarantee or in any way confirm any future disease or ailment associated with the genetic data disclosed in this report. For any contraindications you are advised to get supportive tests conducted from appropriate hospitals/laboratories.</p>
    <p>Interpretation of genetic data is a matter of expert opinion. Before taking any action based on this report, you are advised to meet and seek the advice of a qualified medical / nutritionist / fitness practitioner / dermatologist or as the case may be a qualified expert of that field.</p>
    <p>The company's role is limited to providing results of genetic tests and providing a broad set of general recommendations. More detailed instructions that may be specific to you are to be made by qualified professional practitioners only. General guidelines provided in our reports are for informational purposes only. They do not constitute professional or medical advice. While assessing your report and providing these recommendations we assume that you are in a general state of good health and do not take into account your past or existing health conditions and or any medication taken by you (either in the past or currently), even if you have provided us with such information. You should consult your medical practitioner before acting on it.</p>
    <p>To the fullest extent permitted by law, neither NMC Genetics and nor its officers, employees or representatives will be liable for any claim, proceedings, loss or damage of any kind arising out of or in connection with acting, or not acting, on the assertions or recommendations in the report. This is a comprehensive exclusion of liability that applies to all damage and loss, including, compensatory, direct, indirect or consequential damages, loss of data, income or profit, loss of or damage to property and claims of third parties, howsoever arising, whether in tort (including negligence), contract or otherwise. Nothing in this statement is intended to limit any statutory rights you may have as a consumer or other statutory rights which may not be excluded, nor to exclude or limit our liability to you for death or personal injury resulting from NMC Genetics negligence or that of its officers, employees or other representatives. Nothing in this statement will operate to exclude or limit liability for fraud or fraudulent misrepresentation.</p>`;

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'right', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">Legal Disclaimer</h1>
      <br/>
      ${legalContent}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── Introduction Pages ───────────────────────────────────────
function introPage1(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">Introduction</h1>
      <p style="margin-top:8px;">Human DNA consists of about 3 billion bases, and more than 99 percent of those bases are the same in all people. The order, or sequence, of these bases determines the information available for building and maintaining an organism, similar to the way in which letters of the alphabet appear in a certain order to form words and sentences.</p>
      <br/>
      <h3 class="section-subheading">What is DNA?</h3>
      <p>DNA (Deoxyribo Nucleic Acid), is the hereditary material in humans and almost all other organisms.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr>
          <td style="vertical-align:top;width:55%;padding-right:20px;">
            <p>Most DNA is located in the cell nucleus (where it is called nuclear DNA), but a small amount of DNA can also be found in the mitochondria (where it is called mitochondrial DNA or mtDNA). The information in DNA is stored as a code made up of four chemical bases: adenine (A), guanine (G), cytosine (C), and thymine (T).</p>
          </td>
          <td style="width:45%;vertical-align:top;">
            <img src="${ASSETS}/reportimg/dna1.png" style="width:100%;max-width:260px;" alt="DNA diagram"/>
          </td>
        </tr>
      </table>
      <br/>
      <h3 class="section-subheading">What is Gene?</h3>
      <p>A gene is the basic physical and functional unit of heredity. Genes are made up of DNA.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr>
          <td style="width:45%;vertical-align:top;padding-right:20px;">
            <img src="${ASSETS}/reportimg/genemutation.png" style="width:100%;max-width:260px;" alt="Gene diagram"/>
          </td>
          <td style="vertical-align:top;">
            <p>Some genes act as instructions to make molecules called proteins. However, many genes do not code for proteins. In humans, genes vary in size from a few hundred DNA bases to more than 2 million bases. The Human Genome Project estimated that humans have between 20,000 and 25,000 genes. Every person has two copies of each gene, one inherited from each parent.</p>
          </td>
        </tr>
      </table>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

function introPage2(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h3 class="section-subheading">What is a gene mutation and how do mutations occur?</h3>
      <p>A gene mutation is a permanent alteration in the DNA sequence that makes up a gene, such that the sequence differs from what is found in most people.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr>
          <td style="width:48%;vertical-align:top;padding-right:20px;">
            <img src="${ASSETS}/reportimg/genemutation.jpg" style="width:100%;" alt="Gene mutation diagram"/>
          </td>
          <td style="vertical-align:top;">
            <p>Mutations range in size; they can affect anywhere from a single DNA building block (base pair) to a large segment of a chromosome that includes multiple genes.</p>
          </td>
        </tr>
      </table>
      <br/>
      <p>Gene mutations can be classified in two major ways:</p>
      <ul>
        <li>Hereditary (or germline) mutations or germline are inherited from a parent and are present throughout a person's life in virtually every cell in the body.</li>
        <li>Acquired (or somatic) mutations occur at some time during a person's life and are present only in certain cells, not in every cell in the body</li>
      </ul>
      <h3 class="section-subheading">What is Genetic testing?</h3>
      <p>Genetic testing is a type of medical test that identifies changes in chromosomes, genes, or proteins. The results of a genetic test can confirm or rule out a suspected genetic condition or help determine a person's chance of developing or passing on a genetic disorder. Genetic tests can be performed using either saliva, blood, tissue or other human cells.</p>
      <h3 class="section-subheading">What do the results of Genetic tests mean?</h3>
      <p>A positive test result means that the laboratory found a change in a particular gene, chromosome, or protein of interest. Depending on the purpose of the test, this result may confirm a diagnosis, indicate that a person is a carrier of a particular genetic mutation, identify an increased risk of developing a disease in the future, or suggest a need for further testing.</p>
      <p>A negative test result means that the laboratory did not find a change in the gene, chromosome, or protein under consideration. This result can indicate that a person is not affected by a particular disorder, is not a carrier of a specific genetic mutation, or does not have an increased risk of developing a certain disease. However there is still possibility that any unknown genetic variation can still be a risk factor.</p>
      <p>A variant of unknown significance (VUS) can also be found in a genetic sequence for which the association with disease risk is unclear.</p>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

function introPage3(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 style="font-size:28px;font-weight:300;color:${themeColor};line-height:1.35;margin-bottom:10px;">How Genetic Testing Impacts Our Wellbeing?</h1>
      <p>Genetic defects can affect our health, although in many cases they don't manifest into a disease, but increases the risk of disease. External factors (such as the environment or lifestyle) influences the manifestation of the disease. For example, If a person is intolerant to lactose, due to a genetic defect, this person is perfectly healthy as long as she does not consume milk or milk products. In many cases health issues appear only in conjunction with certain environmental influences - in this case, consuming products that contain lactose.</p>
      <p>Genetic variations called SNPs (pronounced "snips") or "deletions" or "additions" can affect the way our bodies absorb, metabolize, and utilize nutrients, and determine how effectively we eliminate Xenobiotics (drugs, pollutants) and even potential carcinogens. By understanding the mechanisms by which these genes work and analyzing data generated from genome-wide association studies (known as GWAS) and Mendelian randomization, scientists can now understand what impact SNPs may have on disease risk and relationship with certain gene-environmental contexts.</p>
      <p>Another example is, if a regulatory gene for iron intake is defective, this can increase the risk of iron assimilation into the body. Your healthcare practitioner can adjust iron intake through natural foods and supplements to mitigate the risk of iron deficiency.</p>
      <p>Once researchers understand how specific genotypes can affect how our genes function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.</p>
      <p>A healthy lifestyle is, of course, generally preferable, because it can neutralize many genetic predispositions even without knowing underlying risks. However, genetic testing provides you with appropriate information about underlying risk factors and help an individual to implement pro-active health plan with his/her healthcare practitioner to lead a healthy life.</p>
      <h3 class="section-subheading">SOME FACTS:</h3>
      <p>In human beings, 99.9% bases are same, remaining 0.1% makes a person unique in terms of:</p>
      <ul>
        <li>Different attributes / characteristics / traits</li>
        <li>How a person looks and what disease risks he or she may have</li>
        <li>Harmless (no change in our normal health)</li>
        <li>Harmful (can develop into diseases like diabetes, cancer, heart disease, Huntington's disease, and hemophilia)</li>
        <li>Latent (These variations found in genes but are not harmful on their own. The change in each gene function only becomes apparent under certain conditions e.g. increase in stress and susceptibility to heart attack)</li>
      </ul>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

// ─── About Your Cardiomet Report ─────────────────────────────
function aboutReportPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'right', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">About Your Cardiomet Report</h1>
      <br/>
      <h3 class="section-subheading">What are cardio-metabolic disorders?</h3>
      <p>Cardiometabolic complications are multifactorial diseases, and a wide spectrum of different factors including changes in living environments, diets, lifestyles, genetic, and epigenetic factors may be involved.</p>
      <p>Cardiometabolic disorders includes cardiovascular and metabolic diseases. Ex: type 2 diabetes and metabolic syndrome. These conditions are the leading cause of preventable death worldwide. They all share similar risk factors (e.g., overweight/obesity, elevated blood pressure) which can be modified by diet and lifestyle choices.</p>
      <p>Lifestyle plays a significant role in reducing the risk of cardiometabolic diseases. The key lifestyle interventions are the promotion of exercise and energy expenditure and the reduction of overweight by caloric restriction.</p>
      <h3 class="section-subheading">Purpose of test and application :</h3>
      <p>This genetic test will let you know the genetic predisposition of the diseases. Everyone of us are vulnerable to almost all kinds of diseases. But everyone of us do not get all. The reason can be epigenetic, genetic, or environmental.</p>
      <p>If heart disease is running in your family, this test is for you. You can know the probability of getting the disease in your lifetime. The results displayed in the report can be helpful to clinicians in planning your treatment, your nutritionist can plan your diet based on your genetic profile or simply you can take preventive measures thus significantly reducing the risk.</p>
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

function sampleResultPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';
  const coverImg =  `${IMG}/sample.png`;

  return `
  <div class="page" style="background:white;">

    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}

    <div style="height:40px;"></div>

    <div class="content-box" style="text-align:center;">

      <h1 style="
        font-size:34px;
        font-weight:500;
        color:${themeColor};
        margin-bottom:30px;
      ">
        Sample Result Page of A Condition
      </h1>

      <img
        src=${coverImg}
        style="
          width:100%;
          max-width:900px;
          height:auto;
          object-fit:contain;
        "
      />

    </div>

    ${pageFooter('left', false, logoUrl)}

  </div>`;
}

// ─── Your Profile Page ────────────────────────────────────────
function profilePage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const logoUrl = vendor?.logoUrl || '';
  const p = reportData.PatientDetails;
  const s = reportData.SampleDetails;
  const reportDate = s.report_date ? formatDate(s.report_date) : today();
  const sampleDate = s.sample_date ? formatDate(s.sample_date) : '';
  const sigUrl = vendor?.signatureUrl || `${ASSETS}/images/govindSignature.png`;
  const sigTitle = vendor?.sigTitle || 'Scientist - Human Genetics';
  const sigName = vendor?.sigName || 'Dr. Varun Sharma, Ph.D';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">Your Profile</h1>
      <table class="profile-table">
        <tr><td>PATIENT NAME</td><td>${p.name}</td></tr>
        <tr><td>AGE (YEARS)</td><td>${p.age}</td></tr>
        ${p.weight ? `<tr><td>WEIGHT (KG)</td><td>${p.weight}</td></tr>` : ''}
        <tr><td>GENDER</td><td>${p.gender === 'M' ? 'MALE' : p.gender === 'F' ? 'FEMALE' : (p.gender || '').toUpperCase()}</td></tr>
        ${p.height ? `<tr><td>HEIGHT (CM)</td><td>${p.height}</td></tr>` : ''}
        <tr><td>PATIENT ID</td><td>${p.patientId}</td></tr>
        <tr><td>TEST ID</td><td>${s.test || ''}</td></tr>
      </table>

      <table class="profile-table" style="margin-top:20px;">
        <tr><td>SAMPLE ID</td><td>${s.kitBarcode || s.vendorSampleId || ''}</td></tr>
        <tr><td>SAMPLE TYPE</td><td>${s.sampleType || ''}</td></tr>
        <tr><td>SAMPLE COLECTION DATE</td><td>${sampleDate}</td></tr>
        <tr><td>REPORT GENERATION DATE</td><td>${reportDate}</td></tr>
        ${p.referredBy ? `<tr><td>REFERRED BY (DOCTOR)</td><td>${p.referredBy}</td></tr>` : ''}
        ${p.hospital ? `<tr><td>REFERRED BY(HOSPITAL)</td><td>${p.hospital}</td></tr>` : ''}
      </table>

      <br/>
      <img style="max-height:80px;display:block;" src="${sigUrl}" alt="signature"/>
      <p style="margin-top:4px;font-size:11px;">${sigName}<br/>${sigTitle}</p>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}
function renderSummaryBlock(cond: ConditionData): string {
  return `
    <div style="margin-bottom:18px;">
      <div class="summary-condition-name">${cond.display_condition}</div>

      <table class="summary-table">
        <thead>
          <tr>
            <th>Gene</th>
            <th>Unique Id/SNP</th>
            <th>Genotype</th>
          </tr>
        </thead>
        <tbody>
          ${cond.gene.map(g => `
            <tr>
              <td>${g.name}</td>
              <td>${g.uniqueid}</td>
              <td>${g.report_variant || g.test_variant || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="
        background:#efefef;
        padding:10px;
        font-size:11px;
        color:#333;
        min-height:70px;
      ">
        <strong>Interpretation :</strong> ${cond.interpretation}
      </div>
    </div>
  `;
}
function summaryPageCV(opts: PdfGeneratorOptions, conditions: ConditionData[]): string {
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  const blocks: string[] = [];

  for (let i = 0; i < conditions.length; i += 2) {
    const left = conditions[i];
    const right = conditions[i + 1];

    blocks.push(`
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:10px;">
          ${renderSummaryBlock(left)}
        </td>
        <td style="width:50%;vertical-align:top;padding-left:10px;">
          ${right ? renderSummaryBlock(right) : ''}
        </td>
      </tr>
    `);
  }

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'right', false, themeColor, logoUrl)}
    <div style="height:60px;"></div>

    <div class="content-box">
      <h1 style="font-size:30px;font-weight:400;color:${themeColor};margin-bottom:12px;">
        Summary Report
      </h1>

      <div class="summary-section-bar">Cardiovascular Diseases</div>

      <table style="width:100%;border-collapse:collapse;">
        ${blocks.join('')}
      </table>
    </div>

    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

function summaryPageMetabolic(opts: PdfGeneratorOptions, conditions: ConditionData[]): string {
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  const blocks: string[] = [];

  for (let i = 0; i < conditions.length; i += 2) {
    const left = conditions[i];
    const right = conditions[i + 1];

    blocks.push(`
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:10px;">
          ${renderSummaryBlock(left)}
        </td>
        <td style="width:50%;vertical-align:top;padding-left:10px;">
          ${right ? renderSummaryBlock(right) : ''}
        </td>
      </tr>
    `);
  }

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'right', false, themeColor, logoUrl)}

    <div style="height:60px;"></div>

    <div class="content-box">

      <h1 style="
        font-size:30px;
        font-weight:400;
        color:${themeColor};
        margin-bottom:12px;
      ">
        Summary Report
      </h1>

      <div class="summary-section-bar">Metabolic Diseases</div>

      <table style="width:100%;border-collapse:collapse;">
        ${blocks.join('')}
      </table>

    </div>

    ${pageFooter('right', false, logoUrl)}
  </div>`;
}
// ─── Section Cover Page ───────────────────────────────────────
function sectionCoverPage(title: string, imagePath: string, themeColor: string, logoUrl: string): string {
  return `
  <div class="page" style="background-image:linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.1)),url('${imagePath}');background-size:cover;background-position:center;">
    ${pageHeader('MY CARDIOMET', 'left', true, themeColor, logoUrl)}
    <h1 class="section-cover-heading">${title}</h1>
    ${pageFooter('left', true, logoUrl)}
  </div>`;
}

// ─── Condition Page (single condition, page 1: header + genes) ─
function conditionPage1(
  condition: ConditionData,
  sectionTitle: string,
  bgImage: string,
  themeColor: string,
  logoUrl: string
): string {
  const genes = condition.gene;

  // For conditions with many genes that won't fit with right column (like Hypertension 6 genes),
  // we stack each gene as its own row (without shared right column).
  // For conditions with 1-3 genes, use multi-gene layout with shared right column.
  let geneHtml = '';

  if (genes.length === 1) {
    geneHtml = showGeneRow(themeColor, genes[0].report_variant || genes[0].test_variant || '', genes[0].uniqueid, genes[0].response, genes[0].status, genes[0].name, genes[0].gene_description, '185px');
  } else if (genes.length <= 3) {
    // Each gene gets its own row
    geneHtml = genes.map(g =>
      showGeneRow(themeColor, g.report_variant || g.test_variant || '', g.uniqueid, g.response, g.status, g.name, g.gene_description, '168px')
    ).join('');
  } else {
    // Many genes: stack without right description to fit
    geneHtml = genes.map(g =>
      showGeneRow(themeColor, g.report_variant || g.test_variant || '', g.uniqueid, g.response, g.status, g.name, g.gene_description, '168px')
    ).join('');
  }

  return `
  <div class="page" style="background:white;">
    ${pageHeader(sectionTitle, 'right', true, themeColor, logoUrl)}
    <div style="height:22px;"></div>
    ${headerBox({ bgImagePath: bgImage, heading: condition.display_condition, content: condition.condition_desc }, themeColor)}
    <div style="padding:0 12px;">
      ${geneHtml}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── Condition Page 2 (interpretation + risk boxes) ──────────
function conditionPage2(
  condition: ConditionData,
  sectionTitle: string,
  themeColor: string,
  logoUrl: string
): string {
  return `
  <div class="page" style="background:white;">
    ${pageHeader(sectionTitle, 'right', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div style="padding:0 12px;">
      ${showInterpretation(condition.interpretation, condition.recommendation, '175px')}
      ${showRiskBoxes(condition.risk_factors || '', condition.symptoms || '', condition.prevention || '')}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── Hypertension is special: many genes across 2 pages ──────
function hypertensionPages(
  condition: ConditionData,
  sectionTitle: string,
  themeColor: string,
  logoUrl: string
): string {
  const genes = condition.gene;
  // Page 1: header + first 5 genes
  const page1Genes = genes.slice(0, 5).map(g =>
    showGeneRow(themeColor, g.report_variant || g.test_variant || '', g.uniqueid, g.response, g.status, g.name, g.gene_description, '168px')
  ).join('');
  // Page 2: remaining gene + interpretation + risks
  const page2Genes = genes.slice(5).map(g =>
    showGeneRow(themeColor, g.report_variant || g.test_variant || '', g.uniqueid, g.response, g.status, g.name, g.gene_description, '185px')
  ).join('');

  return `
  <div class="page" style="background:white;">
    ${pageHeader(sectionTitle, 'right', true, themeColor, logoUrl)}
    <div style="height:22px;"></div>
    ${headerBox({ bgImagePath: `${IMG}/hyperten.jpg`, heading: condition.display_condition, content: condition.condition_desc }, themeColor)}
    <div style="padding:0 12px;">${page1Genes}</div>
    ${pageFooter('right', false, logoUrl)}
  </div>
  <div class="page" style="background:white;">
    ${pageHeader(sectionTitle, 'right', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div style="padding:0 12px;">
      ${page2Genes}
      ${showInterpretation(condition.interpretation, condition.recommendation, '175px')}
      ${showRiskBoxes(condition.risk_factors || '', condition.symptoms || '', condition.prevention || '')}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── Type 2 Diabetes is special: 5 genes across 2 pages ──────
function diabetesPages(
  condition: ConditionData,
  sectionTitle: string,
  themeColor: string,
  logoUrl: string
): string {
  const genes = condition.gene;
  const page1Genes = genes.slice(0, 4).map(g =>
    showGeneRow(themeColor, g.report_variant || g.test_variant || '', g.uniqueid, g.response, g.status, g.name, g.gene_description, '168px')
  ).join('');
  const page2Genes = genes.slice(4).map(g =>
    showGeneRow(themeColor, g.report_variant || g.test_variant || '', g.uniqueid, g.response, g.status, g.name, g.gene_description, '185px')
  ).join('');

  return `
  <div class="page" style="background:white;">
    ${pageHeader(sectionTitle, 'right', true, themeColor, logoUrl)}
    <div style="height:22px;"></div>
    ${headerBox({ bgImagePath: `${IMG}/diabetes.jpg`, heading: condition.display_condition, content: condition.condition_desc }, themeColor)}
    <div style="padding:0 12px;">${page1Genes}</div>
    ${pageFooter('right', false, logoUrl)}
  </div>
  <div class="page" style="background:white;">
    ${pageHeader(sectionTitle, 'right', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div style="padding:0 12px;">
      ${page2Genes}
      ${showInterpretation(condition.interpretation, condition.recommendation, '175px')}
      ${showRiskBoxes(condition.risk_factors || '', condition.symptoms || '', condition.prevention || '')}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── Science Behind the Test ──────────────────────────────────
function sciencePage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 class="header-heading">Science behind the test</h1>
      <br/>
      <h3 class="section-subheading">Test Methodology</h3>
      <p>Genomic DNA is extracted from individual's Saliva/Tissue/Blood by commercial DNA extraction kits. The genotyping and variant detection is carried out based on illumina Infinium® array protocol. The DNA is then, amplified, fragmented and hybridized to known DNA fragments immobilized in arrays on a BeadChip. Millions of such known DNA fragments (50mer probes) containing the target genetic variants are immobilized on the chip. The hybridized chip is then washed to remove non-hybridized DNA fragments. Single-base extension of the oligos on the BeadChip, using the captured DNA as a template, incorporates detectable labels on the BeadChip and determines the genotype call for the sample. The Illumina iScan® or BeadArray Reader scans the BeadChip, using a laser to excite the fluorophore of the single-base extension product on the beads. The scanner records high-resolution images of the light emitted from the fluorophores.</p>
      <h3 class="section-subheading">Analytical Performance</h3>
      <p>The genotyping was performed using a custom genotyping array platform (Illumina Inc). This test is a laboratory developed test with high reproducibility > 99% and high call rates > 98% to detect the variants and its performance has been validated in-house.</p>
      <h3 class="section-subheading">Analysis</h3>
      <p>Illumina GenomeStudio® Software is used for efficient genotyping data normalization, genotype calling, clustering, data intensity analysis. Genotypes are called for each sample by their signal intensity (norm R) and Allele Frequency (Norm Theta) relative to canonical cluster positions for a given SNP marker. The report is manually reviewed by experts before release</p>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

// ─── References Page ──────────────────────────────────────────
function referencesPage(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" style="background:white;">
    ${pageHeader('MY CARDIOMET', 'left', false, themeColor, logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <h1 style="font-size:42px;font-weight:300;color:${themeColor};margin-bottom:20px;">References</h1>
      <ol class="references-list">
        <li>Al-Otaiby, Mohammed A., and Abdulrahman M. Al-Moghairi. "Clopidogrel in ischemic heart disease: A critical appraisal." Health 5.03 (2013): 465.</li>
        <li>Kim, Ho-Sook, et al. "CYP2C19 poor metabolizer is associated with clinical outcome of clopidogrel therapy in acute myocardial infarction but not stable angina." Circulation: Cardiovascular Genetics 6.5 (2013): 514-521.</li>
        <li>Kim, Ho‐Sook, et al. "The effect of CYP2C19 genotype on the time course of platelet aggregation inhibition after clopidogrel administration." The Journal of Clinical Pharmacology 54.8 (2014): 850-857.</li>
        <li>Arya, Shipra, et al. "Association of statin dose with amputation and survival in patients with peripheral artery disease." Circulation 137.14 (2018): 1435-1446.</li>
        <li>Karr, Samantha. "Epidemiology and management of hyperlipidemia." The American journal of managed care 23.9 Suppl (2017): S139-S148.</li>
        <li>Fuster, Valentin, et al. "The pathogenesis of coronary artery disease and the acute coronary syndromes." New England journal of medicine 326.5 (1992): 310-318.</li>
        <li>Andreotti, Felicita, et al. "Major circadian fluctuations in fibrinolytic factors and possible relevance to time of onset of myocardial infarction, sudden cardiac death and stroke." The American journal of cardiology 62.9 (1988): 635-637.</li>
        <li>Burstein, Brett, and Stanley Nattel. "Atrial fibrosis: mechanisms and clinical relevance in atrial fibrillation." Journal of the American College of Cardiology 51.8 (2008): 802-809.</li>
        <li>National Collaborating Centre for Chronic Conditions (Great Britain). "Hypertension: management in adults in primary care: pharmacological update." Royal College of Physicians, 2006.</li>
        <li>Rosendaal, Fritz R. "Venous thrombosis: a multicausal disease." The Lancet 353.9159 (1999): 1167-1173.</li>
        <li>Weyer, Christian, et al. "The natural history of insulin secretory dysfunction and insulin resistance in the pathogenesis of type 2 diabetes mellitus." The Journal of clinical investigation 104.6 (1999): 787-794.</li>
        <li>BMI, Obesity Class. "Clinical guidelines on the identification, evaluation, and treatment of overweight and obesity in adults." NOE Initiative 6.Suppl 2 (1998): 51S-209S.</li>
      </ol>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

// ─── Blank Page ───────────────────────────────────────────────
function blankPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page" style="background:white;">
    <div style="position:absolute;width:100%;top:50%;transform:translateY(-50%);text-align:center;">
      ${logoUrl ? `<img style="width:80%;max-width:320px;" src="${logoUrl}" alt="logo"/>` : ''}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── Back Cover Page ──────────────────────────────────────────
function backCoverPage(opts: PdfGeneratorOptions): string {
  const { vendor } = opts;
  const logoUrl = vendor?.logoUrl || '';
  const backCoverImg = vendor?.backCoverImg || `${IMG}/Back Cover.jpg`;

  return `
  <div class="page" style="background:url('${backCoverImg}') no-repeat center/cover;">
    ${logoUrl ? `<img src="${logoUrl}" style="width:40%;position:absolute;top:8%;left:50%;transform:translateX(-50%);" alt="logo"/>` : ''}
  </div>`;
}

// ─── Page Number Script ───────────────────────────────────────
function pageNumberScript(): string {
  return `
  <script>
    (function() {
      var pages = document.querySelectorAll('.page');
      var total = pages.length;
      pages.forEach(function(page, i) {
        if (!page.hasAttribute('data-hidepageno')) {
          var pageNo = i + 1;
          var span = document.createElement('span');
          // Centered bottom, above the footer bar — matches PDF "X of 35" style
          span.style.cssText = 'font-size:10px;position:absolute;left:50%;transform:translateX(-50%);bottom:28px;z-index:200;color:#666;white-space:nowrap;';
          span.textContent = pageNo + ' of ' + total;
          page.appendChild(span);
        }
      });
    })();
  </script>`;
}

// ─── MASTER BUILDER ───────────────────────────────────────────
export function buildCardioHealthReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';
  const reportDataObj = opts.reportData.ReportData;

  // Flatten all conditions from all sections
  const allConditions: ConditionData[] = [];
  Object.values(reportDataObj).forEach(conditions => {
    conditions.forEach(cond => allConditions.push(cond));
  });

  // Classify conditions
  const cvConditionNames = new Set([
    'Coronary artery disease', 'Myocardial Infarction', 'Atrial fibrillation', 'Hypertension', 'Deep vein thrombosis'
  ]);
  const metabolicConditionNames = new Set([
    'Type 2 Diabetes Mellitus', 'Obesity', 'Hyperlipoproteinemia Type III', 'HDL cholesterol Level'
  ]);

  const cvConditions = allConditions.filter(c => cvConditionNames.has(c.condition_name));
  const metabolicConditions = allConditions.filter(c => metabolicConditionNames.has(c.condition_name));

  // Map condition names to background images
  const conditionImages: Record<string, string> = {
    'Coronary artery disease': `${IMG}/1.jpg`,
    'Myocardial Infarction': `${IMG}/2.jpg`,
    'Atrial fibrillation': `${IMG}/3.jpg`,
    'Hypertension': `${IMG}/hyperten.jpg`,
    'Deep vein thrombosis': `${IMG}/5.jpg`,
    'Type 2 Diabetes Mellitus': `${IMG}/diabetes.jpg`,
    'Obesity': `${IMG}/obesity.jpg`,
    'Hyperlipoproteinemia Type III': `${IMG}/hyperlip.jpg`,
    'HDL cholesterol Level': `${IMG}/cholesterol.jpg`,
  };

  // Build CV condition detail pages
  const cvDetailPages = cvConditions.map(cond => {
    const bgImg = conditionImages[cond.condition_name] || `${IMG}/1.jpg`;
    const sectionTitle = 'MY CARDIOMET | CARDIOVASCULAR DISEASE';

    if (cond.condition_name === 'Hypertension') {
      return hypertensionPages(cond, sectionTitle, themeColor, logoUrl);
    }
    // Default: page1 (header + genes) + page2 (interpretation + risks)
    return conditionPage1(cond, sectionTitle, bgImg, themeColor, logoUrl)
      + conditionPage2(cond, sectionTitle, themeColor, logoUrl);
  }).join('\n');

  // Build Metabolic condition detail pages
  const metabolicDetailPages = metabolicConditions.map(cond => {
    const bgImg = conditionImages[cond.condition_name] || `${IMG}/diabetes.jpg`;
    const sectionTitle = 'MY CARDIOMET | METABOLIC DISEASES';

    if (cond.condition_name === 'Type 2 Diabetes Mellitus') {
      return diabetesPages(cond, sectionTitle, themeColor, logoUrl);
    }
    return conditionPage1(cond, sectionTitle, bgImg, themeColor, logoUrl)
      + conditionPage2(cond, sectionTitle, themeColor, logoUrl);
  }).join('\n');

  // Sample condition for the sample result page
  const sampleCond = cvConditions.find(c => c.condition_name === 'Coronary artery disease') || cvConditions[0] || allConditions[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>My Cardiomet Report - ${opts.reportData.PatientDetails.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>${buildCSS(themeColor, textColor)}</style>
</head>
<body>

  <!-- PAGE 1: Front Cover -->
  ${coverPage(opts)}

  <!-- PAGE 2: Interior (logo + sample id) -->
  ${interiorPage2(opts)}

  <!-- PAGE 3: Welcome -->
  ${welcomePage(opts)}

  <!-- PAGE 4: About Us -->
  ${aboutUsPage(opts)}

  <!-- PAGE 5: Legal Disclaimer -->
  ${legalPage(opts)}

  <!-- PAGE 6: Introduction (DNA + Gene) -->
  ${introPage1(opts)}

  <!-- PAGE 7: Introduction (mutations + genetic testing) -->
  ${introPage2(opts)}

  <!-- PAGE 8: Introduction (how genetic testing impacts wellbeing) -->
  ${introPage3(opts)}

  <!-- PAGE 9: About Your Cardiomet Report -->
  ${aboutReportPage(opts)}

  <!-- PAGE 10: Sample Result Page of A Condition (annotated diagram) -->
  ${sampleCond ? sampleResultPage(opts) : ''}

  <!-- PAGE 11: Your Profile -->
  ${profilePage(opts)}

  <!-- PAGE 12: Summary Report - Cardiovascular Diseases -->
  ${summaryPageCV(opts, cvConditions)}

  <!-- PAGE 13: Summary Report - Metabolic Diseases -->
  ${summaryPageMetabolic(opts, metabolicConditions)}

  <!-- SECTION COVER: Cardiovascular Disease -->
  ${sectionCoverPage('Cardiovascular<br>Disease', `${IMG}/cover1.jpg`, themeColor, logoUrl)}

  <!-- CARDIOVASCULAR CONDITION DETAIL PAGES -->
  ${cvDetailPages}

  <!-- SECTION COVER: Metabolic Diseases -->
  ${sectionCoverPage('Metabolic<br>Diseases', `${IMG}/metabolic.jpg`, themeColor, logoUrl)}

  <!-- METABOLIC CONDITION DETAIL PAGES -->
  ${metabolicDetailPages}

  <!-- Science Behind the Test -->
  ${sciencePage(opts)}

  <!-- References -->
  ${referencesPage(opts)}

  <!-- Blank Page -->
  ${blankPage(opts)}

  <!-- Back Cover -->
  ${backCoverPage(opts)}

  ${pageNumberScript()}
</body>
</html>`;
}