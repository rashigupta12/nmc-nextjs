// ============================================================
// Cardio Health Report — Complete HTML Template Generator
// Exact Match to PHP Layout and CSS
// ============================================================

import { PdfGeneratorOptions, ConditionData } from "@/types/cardioHealthReport";

// ─── Constants ───────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const IMG = `${BASE_URL}/reportimg/cardiomet_images`;
const ASSETS = `${BASE_URL}/`;

// ─── Helpers ─────────────────────────────────────────────────
function getThemeColor(vendor?: PdfGeneratorOptions['vendor']): string {
  return vendor?.themeColor ?? '#ea5456';
}

function getTextColor(vendor?: PdfGeneratorOptions['vendor']): string {
  return vendor?.textColor ?? 'rgb(77, 77, 77)';
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

function statusBox(status: string, response?: string): string {
  const s = status?.toLowerCase() || 'good';
  const text = response || status;
  return `<div class="status-box ${s}">${text}</div>`;
}

// ─── Page Header Function ────────────────────────────────────
function pageHeader(title: string, align: string, isCover: boolean, themeColor: string, logoUrl?: string): string {
  const logo = logoUrl
    ? `<img src="${logoUrl}" style="max-height:40px;max-width:120px;object-fit:contain;" alt="Logo"/>`
    : `<span style="font-weight:700;color:${themeColor};font-size:10pt;">NMC Genetics</span>`;
  
  return `
  <div class="header ${align}" style="position:absolute;top:18px;left:0;width:calc(100% - 12mm);display:grid;grid-template-columns:12mm max-content auto;height:22px;z-index:1000;">
    <div style="background:#E7E7E7;height:22px;"></div>
    <div style="background:white;text-align:center;line-height:1;padding:3px 10px;font-weight:500;letter-spacing:2px;color:${themeColor};font-size:8pt;white-space:nowrap;">${title.toUpperCase()}</div>
    <div style="background:#E7E7E7;height:22px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;">${logo}</div>
  </div>`;
}

// ─── Page Footer Function ────────────────────────────────────
function pageFooter(align: string, isCover: boolean, logoPath?: string): string {
  const logo = logoPath
    ? `<div style="background-image:url('${logoPath}');background-size:contain;background-repeat:no-repeat;width:140px;height:49px;"></div>`
    : `<div style="width:140px;height:49px;"></div>`;
  
  return `
  <div class="footer ${align}" style="position:absolute;bottom:6px;left:7mm;width:calc(100% - 19mm);display:grid;grid-template-columns:max-content auto;z-index:1000;">
    ${logo}
    <div style="background:#E7E7E7;height:22px;margin:12px 0 0 0;"></div>
  </div>`;
}

// ─── Header Box with Background Image ────────────────────────
function headerBox(config: {
  bgImagePath: string;
  heading: string;
  align: string;
  content?: string;
}, themeColor: string, headerImageOpacity: string, headerImageColor: string): string {
  return `
  <div class="header-box ${config.align}" style="background-image:linear-gradient(rgba(${headerImageColor}, ${headerImageOpacity}), rgba(${headerImageColor}, ${headerImageOpacity})), url('${config.bgImagePath}');background-size:cover;background-position:center;width:100%;position:relative;padding-bottom:10px;">
    <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.45));padding:12px 20px;">
      <div style="background:white;display:inline-block;padding:4px 12px;">
        <h2 style="color:${themeColor};font-size:17px;font-weight:bold;margin:0;">${config.heading}</h2>
      </div>
      ${config.content ? `<p style="color:white;margin:8px 0 0 0;font-size:12px;">${config.content}</p>` : ''}
    </div>
  </div>`;
}

// ─── Show Gene Function ──────────────────────────────────────
function showGene(
  themeColor: string,
  variant: string,
  uniqueId: string,
  response: string,
  status: string,
  gene: string,
  description: string,
  minHeight: string = "auto"
): string {
  const statusClass = status?.toLowerCase() || 'good';
  const statusText = response || status;
  
  return `
  <table class="gene-table left" style="width:100%;margin-bottom:15px;margin-top:2px;">
    <tbody>
      <tr>
        <td class="gene-col" style="background-color:${themeColor};width:30%;vertical-align:top;padding:15px;">
          <div class="gene-div small">
            <h4 style="color:white;margin:0 0 8px 0;">Your Genotype</h4>
            <hr style="border-color:rgba(255,255,255,0.3);margin:5px 0;">
            <h1 class="snp" style="color:white;font-size:20px;margin:10px 0;">${variant}</h1>
            <div style="font-size:11px;color:white;margin-top:5px;">SNP: ${uniqueId}</div>
            <h4 style="color:white;margin:15px 0 8px 0;">Your Response</h4>
            <hr style="border-color:rgba(255,255,255,0.3);margin:5px 0;">
            ${statusBox(status, statusText)}
          </div>
          </td>
        <td style="background:#DFDFDF;width:70%;vertical-align:top;padding:15px;">
          <div class="interpretation-div small" style="min-height:${minHeight};">
            <h1 style="color:${themeColor};font-size:18px;margin:0 0 10px 0;">${gene}</h1>
            <hr style="border-color:#ccc;margin:5px 0 10px 0;">
            <p style="color:rgb(77,77,77);line-height:20px;">${description}</p>
          </div>
          </td>
        </tr>
    </tbody>
   </table>`;
}

// ─── Gene Interpretation Function ────────────────────────────
function showInterpretation(interpretation: string, recommendation: string): string {
  return `
  <table class="response" style="width:100%;margin-top:10px;">
    <tbody>
      <tr>
        <td style="width:25%;background:#DFDFDF;text-align:center;padding:12px;vertical-align:top;">
          <h4 style="color:#ea5456;margin:0 0 10px 0;">Your Response</h4>
          <div style="background:white;color:#22c55e;padding:8px;border-radius:4px;text-align:center;">Interpretation</div>
          </td>
        <td style="width:75%;background:#ea5456;color:white;padding:0 20px;vertical-align:top;">
          <h4 style="color:white;margin:0;padding:10px 0;border-bottom:1px solid white;font-weight:400;font-size:13px;">Interpretation</h4>
          <p style="color:white;margin-top:5px;line-height:20px;font-size:13px;">${interpretation}</p>
          </td>
      </tr>
      <tr style="border-top:10px solid white;">
        <td class="rImage" style="background:#ea5456;background-image:url('${ASSETS}reportimg/imunity/recommend.png');background-repeat:no-repeat;background-size:contain;background-position:20% 20%;min-height:150px;vertical-align:top;"></td>
        <td style="background:#DFDFDF;padding:0 20px;vertical-align:top;">
          <h4 style="color:#ea5456;margin:0;padding:10px 0;border-bottom:1px solid black;font-weight:400;font-size:13px;">Recommendation</h4>
          <p style="margin-top:5px;line-height:20px;font-size:13px;color:rgb(77,77,77);">${recommendation}</p>
          </td>
      </tr>
    </tbody>
  </table>`;
}

// ─── Risk Factors Function ───────────────────────────────────
function showRiskFactors(riskFactors: string, symptoms: string, prevention: string, themeColor: string): string {
  return `
  <div style="display:flex;gap:15px;margin-top:20px;">
    <div class="rfac" style="color:${themeColor};padding:10px;display:inline-block;vertical-align:top;background:#ffeaea;width:239px;border-radius:10px;box-shadow:4px 3px ${themeColor};height:240px;">
      <h4 class="rfac_head" style="color:${themeColor};margin:0 0 10px 0;padding:0px 0 10px 0;">Risk Factors</h4>
      <div class="rfac_con" style="color:#000000b8;padding-left:20px;">
        ${riskFactors || '<p>No specific risk factors identified.</p>'}
      </div>
    </div>
    <div class="rfac" style="color:${themeColor};padding:10px;display:inline-block;vertical-align:top;background:#ffeaea;width:239px;border-radius:10px;box-shadow:4px 3px ${themeColor};height:240px;">
      <h4 class="rfac_head" style="color:${themeColor};margin:0 0 10px 0;padding:0px 0 10px 0;">Symptoms</h4>
      <div class="rfac_con" style="color:#000000b8;padding-left:20px;">
        ${symptoms || '<p>No specific symptoms identified.</p>'}
      </div>
    </div>
    <div class="rfac" style="color:${themeColor};padding:10px;display:inline-block;vertical-align:top;background:#ffeaea;width:239px;border-radius:10px;box-shadow:4px 3px ${themeColor};height:240px;">
      <h4 class="rfac_head" style="color:${themeColor};margin:0 0 10px 0;padding:0px 0 10px 0;">Prevention</h4>
      <div class="rfac_con" style="color:#000000b8;padding-left:20px;">
        ${prevention || '<p>Maintain a healthy lifestyle.</p>'}
      </div>
    </div>
  </div>`;
}

// ─── Complete CSS Styles from PHP ────────────────────────────
function buildCSS(themeColor: string, textColor: string): string {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #e0e0e0;
    font-size: 14px;
    color: ${textColor};
  }

  .page {
    box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
    margin: 5mm auto;
    width: 220mm;
    height: 297mm;
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
    .page { margin: 0; box-shadow: none; width: 100%; height: 100vh; }
  }

  .content-box {
    margin: auto;
    width: 195mm;
  }

  .content-box p {
    font-size: 15px;
  }

  p {
    text-align: justify;
    color: ${textColor};
    font-size: 14px;
    font-weight: 400;
    margin: 0 0 8px 0;
    line-height: 20px;
  }

  h1, h2, h3, h4, h5 { margin: 0; }

  .header-heading {
    font-size: 35px !important;
    font-weight: 300;
    margin: 20px 0 5px 0;
  }

  .first-cover-page-heading {
    font-size: 46px;
    color: #00adef;
    font-weight: 392;
    position: absolute;
    left: 39px;
    bottom: 144px;
  }

  .cover-page-heading {
    font-size: 73px;
    color: white;
    font-weight: bolder;
    position: absolute;
    left: 65px;
    bottom: 294px;
  }

  .headingrepo {
    font-size: 40px;
    color: #7d8d94;
    font-weight: 392;
    position: absolute;
    left: 39px;
    bottom: 95px;
  }

  .patientName {
    font-size: 24px;
    color: #FFFF;
    font-weight: 500;
    position: absolute;
    padding-left: 39px;
    bottom: 40px;
    background-color: ${themeColor};
    width: 100%;
    line-height: 50px;
  }

  .snp {
    font-size: 20px !important;
  }

  /* PROFILE TABLE */
  .profile-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .profile-table tr td {
    padding: 8px; background-color: #F4F6F5;
    color: #6d7c89; font-size: 13px; letter-spacing: 1px;
  }
  .profile-table tr:first-child td { padding-top: 25px; }
  .profile-table tr:last-child td { padding-bottom: 20px; }
  .profile-table tr td:first-child {
    background-color: ${themeColor};
    border-right: 6px solid white;
    padding-left: 20px; width: 280px; color: white;
  }
  .profile-table tr td:last-child {
    color: ${textColor};
  }

  /* SUMMARY TABLE */
  .summary-table {
    margin-top: 5px;
    width: 350px !important;
    margin: 9px;
    border-collapse: collapse;
  }
  
  .summary-table tr th {
    padding: 2px 0px;
    background: ${themeColor};
    font-size: 12px;
    color: white;
    text-align: center;
  }
  
  .summary-table tr td {
    color: black !important;
    padding: 2px 5px;
    text-align: center;
    font-size: 12px;
  }
  
  .summary-heading {
    font-size: 35px;
    font-weight: 300;
    font-family: 'HERO', sans-serif;
    padding-bottom: 12px;
    padding-top: 5px;
  }
  
  .summary-section-heading {
    font-size: 20px;
    font-weight: 300;
    font-family: 'HERO', sans-serif;
    color: white;
    background: ${themeColor};
    padding: 3px;
    text-align: center;
    margin-bottom: 10px;
    text-transform: capitalize;
  }
  
  .secname {
    font-size: 14px;
    font-weight: bold;
    color: ${textColor};
    display: inline-block;
    margin-left: 9px;
    text-transform: capitalize;
  }
  
  .interpretation {
    padding: 15px !important;
    background-color: #dedede;
    text-align: justify !important;
    color: black;
    vertical-align: top;
  }

  /* GENE TABLE */
  .gene-table {
    margin-top: 2px !important;
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }
  
  .gene-table .gene-col {
    background-color: ${themeColor};
    width: 30%;
    vertical-align: top;
    padding: 15px;
  }

  /* RESPONSE TABLE */
  .response {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  .response tbody td:first-child {
    width: 25%;
    vertical-align: top;
    background-color: #DFDFDF;
    text-align: center;
    padding: 12px;
  }
  
  .response tbody td:first-child h4 {
    font-weight: 400;
    text-align: center;
    color: ${themeColor};
    font-size: 12px;
    margin-bottom: 6px;
  }
  
  .response tbody tr:first-child td:last-child {
    width: 75%;
    vertical-align: top;
    background: ${themeColor};
    color: white;
    padding: 0 20px;
    min-height: 100px;
  }
  
  .response tbody tr:first-child td:last-child h4 {
    padding: 10px 0;
    border-bottom: 1px solid white;
    font-weight: 400;
    color: white;
    font-size: 13px;
  }
  
  .response tbody tr:first-child td:last-child p {
    color: white !important;
    margin-top: 5px;
    line-height: 20px;
    font-size: 13px;
  }
  
  .response tbody tr:last-child {
    border-top: 10px solid white;
  }
  
  .response tbody tr:last-child td:first-child {
    background: ${themeColor};
    background-image: url('${ASSETS}reportimg/imunity/recommend.png');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: 20% 20%;
    min-height: 150px;
  }
  
  .response tbody tr:last-child td:last-child {
    width: 75%;
    vertical-align: top;
    background: #DFDFDF;
    padding: 0 20px;
  }
  
  .response tbody tr:last-child td:last-child h4 {
    padding: 10px 0;
    font-weight: 400;
    border-bottom: 1px solid black;
    margin: 0;
    color: ${themeColor};
    font-size: 13px;
  }
  
  .response tbody tr:last-child td:last-child p {
    margin-top: 5px;
    line-height: 20px;
    font-size: 13px;
    color: rgb(77,77,77);
  }

  /* STATUS BOX */
  .status-box.deletion,
  .status-box.bad {
    background: white;
    color: red;
  }
  
  .status-box.normal,
  .status-box.elevated,
  .status-box.good {
    background: white;
    color: green;
  }
  
  .status-box.average {
    background: white;
    color: #ffa500;
  }

  /* HEADER BOX */
  .header-box {
    background-size: cover;
    width: 100%;
    padding-bottom: 10px;
    position: relative;
  }
  
  .header-box h1 {
    text-transform: capitalize;
  }

  /* RISK FACTORS */
  .rfac {
    color: ${themeColor};
    padding: 10px;
    display: inline-block;
    vertical-align: top;
    background: #ffeaea;
    width: 239px;
    border-radius: 10px;
    box-shadow: 4px 3px ${themeColor};
    height: 240px;
  }
  
  .rfac_con {
    color: #000000b8;
    padding-left: 20px;
  }
  
  .rfac_con ul {
    margin: 0px;
  }
  
  .rfac_con ul li {
    padding: 0;
    font-size: 13px;
    margin: 0px;
  }
  
  .rfac_con p {
    padding: 0;
    font-size: 13px;
    margin-top: 10px;
  }
  
  .rfac_head {
    padding: 0px 0 10px 0;
  }

  .backImg { background-color: white; }
  `;
}

// ─── COVER PAGE ──────────────────────────────────────────────
function coverPage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const coverImg = vendor?.coverPageImg || `${IMG}/Front-Cover.jpg`;
  const patientName = reportData.PatientDetails.name;
  const logoUrl = vendor?.coverLogoUrl || vendor?.logoUrl || '';

  return `
  <div class="page" hidepageno sample style="background-image:url('${coverImg}');background-size:cover;background-position:center;">
    ${logoUrl ? `<img src="${logoUrl}" style="width:27%;position:relative;top:2%;left:2%;" alt="logo"/>` : ''}
    <h1 class="first-cover-page-heading fontfamily">My Cardiomet</h1>
    <h2 class="headingrepo fontfamily">Report</h2>
    <h3 class="patientName">Patient Name : ${patientName}</h3>
  </div>`;
}

// ─── PROFILE PAGE ────────────────────────────────────────────
function profilePage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const textColor = getTextColor(vendor);
  const logoUrl = vendor?.logoUrl || '';
  const p = reportData.PatientDetails;
  const s = reportData.SampleDetails;
  const reportDate = s.report_date ? formatDate(s.report_date) : today();
  const sampleDate = s.sample_date ? formatDate(s.sample_date) : '';
  const sigUrl = vendor?.signatureUrl || `${ASSETS}/images/govindSignature.png`;

  return `
  <div class="page backImg" sample>
    ${pageHeader("MY CARDIOMET", 'left', false, themeColor, logoUrl)}
    <div style="height:62px;"></div>
    <div class="content-box">
      <h1 class="header-heading fontfamily" style="color:${themeColor}">Your Profile</h1>
      <table class="profile-table">
        <tr><td>PATIENT NAME</td><td style="text-transform:capitalize;">${p.name}</td></tr>
        <tr><td>AGE (YEARS)</td><td>${p.age}</td></tr>
        ${p.weight ? `<tr><td>WEIGHT (KG)</td><td>${p.weight}</td></tr>` : ''}
        <tr><td>GENDER</td><td>${p.gender === 'M' || p.gender === 'Male' ? 'MALE' : p.gender === 'F' || p.gender === 'Female' ? 'FEMALE' : p.gender?.toUpperCase() || 'FEMALE'}</td></tr>
        ${p.height ? `<tr><td>HEIGHT (CM)</td><td>${p.height}</td></tr>` : ''}
        <tr><td>PATIENT ID</td><td>${p.patientId}</td></tr>
        <tr><td>TEST ID</td><td>${s.test}</td></tr>
      </table>

      <table class="profile-table" style="margin-top:30px;">
        <tr><td>SAMPLE ID</td><td>${s.kitBarcode || s.vendorSampleId}</td></tr>
        <tr><td>SAMPLE TYPE</td><td>${s.sampleType}</td></tr>
        <tr><td>SAMPLE COLLECTION DATE</td><td>${sampleDate}</td></tr>
        <tr><td>REPORT GENERATION DATE</td><td>${reportDate}</td></tr>
        ${p.referredBy ? `<tr><td>REFERRED BY (DOCTOR)</td><td>${p.referredBy}</td></tr>` : ''}
        ${p.hospital ? `<tr><td>REFERRED BY (HOSPITAL)</td><td>${p.hospital}</td></tr>` : ''}
      </table>

      <br/>
      <img style="width:initial;max-height:80px;" src="${sigUrl}" alt="signature"/>
      <p>&nbsp;&nbsp;&nbsp;For ${vendor?.vendorName || 'NMC Genetics'}<br/>
         &nbsp;&nbsp;&nbsp;<b style="font-size:14px;">(${vendor?.vendorName || 'NMC Genetics'})</b>
      </p>
    </div>
    ${pageFooter('left', false, logoUrl)}
  </div>`;
}

// ─── WELCOME PAGE ────────────────────────────────────────────
function welcomePage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const textColor = getTextColor(vendor);
  const logoUrl = vendor?.logoUrl || '';
  const patientName = reportData.PatientDetails.name;
  const vendorName = vendor?.vendorName || 'NMC Genetics';
  const sigUrl = vendor?.signatureUrl || `${ASSETS}/images/govindSignature.png`;

  return `
  <div class="page backImg" sample>
    ${pageHeader("MY CARDIOMET", 'right', false, themeColor, logoUrl)}
    <div style="height:62px;"></div>
    <div class="content-box">
      <h1 class="header-heading fontfamily" style="color:${themeColor}">Welcome</h1>
      <br>
      <h4 style="color:${textColor}">Dear ${patientName},</h4>
      <p>Neotech (Formerly Known as NMC Genetics) is pleased to provide your cardio-metabolic targeted biomarkers report based on your unique genome profile. The report offers you a snap-shot of your genetic response pertaining to cardiac and metabolic diseases. The recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
      <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray;utilizing globally validated procedures. The information received from your genetic code determines the onset of disease in your lifetime. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
      <p>With insights from this report, your clinicians or Wellness consultant has a guidance map to device a personalized drug and accordingly lifestyle changes to help you achieve optimal health. By seeking professional advice and following the recommendations you can improve your health holistically.</p>
      <p>Wishing you good health!</p>
      <br>
      <img style="width:initial;max-height:80px;" src="${sigUrl}">
      <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For ${vendorName}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="font-size:16px;">(${vendorName})</b></p>
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── SUMMARY PAGE ────────────────────────────────────────────
function summaryPage(opts: PdfGeneratorOptions, conditions: ConditionData[], addDetails: any): string {
  const { vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const textColor = getTextColor(vendor);
  const logoUrl = vendor?.logoUrl || '';
  
  // Group conditions by type
  const cardioConditions = conditions.filter(c => 
    c.condition_name === 'Coronary artery disease' ||
    c.condition_name === 'Myocardial Infarction' ||
    c.condition_name === 'Atrial fibrillation' ||
    c.condition_name === 'Hypertension' ||
    c.condition_name === 'Deep vein thrombosis'
  );
  
  const metabolicConditions = conditions.filter(c =>
    c.condition_name === 'Type 2 Diabetes Mellitus' ||
    c.condition_name === 'Obesity' ||
    c.condition_name === 'Hyperlipoproteinemia Type III' ||
    c.condition_name === 'HDL cholesterol Level'
  );
  
  const renderConditionTable = (condition: ConditionData, interpretation?: string) => {
    const interp = interpretation || condition.interpretation;
    return `
    <div style="float:left;">
      <span class="secname">${condition.display_condition}</span>
      <table class="summary-table" style="width:220px;">
        <thead><tr><th>Gene</th><th>SNP</th><th>Genotype</th><th>Response</th></tr></thead>
        <tbody>
          ${condition.gene.map(gene => `
            <tr>
              <td>${gene.name}</td>
              <td>${gene.uniqueid}</td>
              <td>${gene.report_variant || gene.test_variant}</td>
              <td class="${condition.condition_status?.toLowerCase()}">${condition.condition_status}</td>
            </tr>
          `).join('')}
          ${condition.gene.length < 3 ? '<tr><td colspan="4">&nbsp;</td></tr>'.repeat(3 - condition.gene.length) : ''}
          <tr><td colspan="4" class="interpretation">${interp}</td></tr>
        </tbody>
      </table>
    </div>`;
  };
  
  return `
  <div class="page" sample>
    ${pageHeader("MY CARDIOMET", 'right', false, themeColor, logoUrl)}
    <div style="height:45px;"></div>
    <div class="content-box">
      <h1 class="summary-heading" style="color:${themeColor}">Summary Report</h1>
      <h1 class="summary-section-heading">Cardiovascular Diseases</h1>
      <div>
        ${cardioConditions.map(c => renderConditionTable(c)).join('')}
        <div style="clear:both"></div>
      </div>
      <h1 class="summary-section-heading" style="margin-top:25px;">Metabolic Diseases</h1>
      <div>
        ${metabolicConditions.map(c => renderConditionTable(c)).join('')}
        <div style="clear:both"></div>
      </div>
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
}

// ─── SECTION COVER PAGE ──────────────────────────────────────
function sectionCoverPage(title: string, imagePath: string, themeColor: string, logoUrl: string): string {
  const coverImageOpacity = "0.1";
  const coverImageColor = "0,0,0";
  
  return `
  <div class="page" hidepageno sample style="background-image:linear-gradient(rgba(${coverImageColor}, ${coverImageOpacity}), rgba(${coverImageColor}, ${coverImageOpacity})), url('${imagePath}');background-size:cover;background-position:center;">
    ${pageHeader("MY CARDIOMET", 'left', true, themeColor, logoUrl)}
    <h1 class="cover-page-heading">${title}</h1>
    ${pageFooter('left', true, logoUrl)}
  </div>`;
}

// ─── CONDITION DETAIL PAGE ───────────────────────────────────
function conditionDetailPage(
  condition: ConditionData,
  sectionTitle: string,
  bgImage: string,
  themeColor: string,
  textColor: string,
  logoUrl: string,
  addDetails?: any
): string {
  const headerImageOpacity = "0.3";
  const headerImageColor = "0,0,0";
  const interpretationHeight = "175px";
  const riskboxHeight = "290px";
  
  const page1 = `
  <div class="page" sample>
    ${pageHeader(sectionTitle, 'right', true, themeColor, logoUrl)}
    ${headerBox({
      bgImagePath: bgImage,
      heading: condition.display_condition,
      align: 'right',
      content: condition.condition_desc
    }, themeColor, headerImageOpacity, headerImageColor)}
    <div class="content-box" style="margin-top:15px;">
      ${condition.gene.map((gene, idx) => `
        ${showGene(themeColor, gene.report_variant || gene.test_variant, gene.uniqueid, gene.response, gene.status, gene.name, gene.gene_description, interpretationHeight)}
      `).join('')}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
  
  const page2 = `
  <div class="page">
    ${pageHeader(sectionTitle, 'right', false, themeColor, logoUrl)}
    <div style="height:60px;"></div>
    <div class="content-box">
      ${showInterpretation(condition.interpretation, condition.recommendation)}
      ${showRiskFactors(condition.risk_factors || '', condition.symptoms || '', condition.prevention || '', themeColor)}
    </div>
    ${pageFooter('right', false, logoUrl)}
  </div>`;
  
  return page1 + page2;
}

// ─── MASTER HTML BUILDER ─────────────────────────────────────
export function buildCardioHealthReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const textColor = getTextColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';
  const reportData = opts.reportData;
  const reportDataObj = reportData.ReportData;
  
  // Flatten all conditions
  const allConditions: ConditionData[] = [];
  Object.values(reportDataObj).forEach(conditions => {
    conditions.forEach(cond => allConditions.push(cond));
  });
  
  // Condition images mapping
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
  
  // Generate condition pages
  const conditionPages = allConditions.map(cond => {
    const bgImage = conditionImages[cond.condition_name] || `${IMG}/1.jpg`;
    const sectionTitle = ['Coronary artery disease', 'Myocardial Infarction', 'Atrial fibrillation', 'Hypertension', 'Deep vein thrombosis'].includes(cond.condition_name)
      ? "MY CARDIOMET | Cardiovascular disease"
      : "MY CARDIOMET | Metabolic Diseases";
    return conditionDetailPage(cond, sectionTitle, bgImage, themeColor, textColor, logoUrl);
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${opts.vendor?.vendorName || 'NMC Genetics'} Cardiomet Report</title>
  <link href="https://fonts.googleapis.com/css?family=Poppins:100,300,400" rel="stylesheet">
  <style>
    @page { margin: 0mm; size: 220mm 297mm; }
  </style>
  <style>${buildCSS(themeColor, textColor)}</style>
  <style>
    .gene-div.small p { line-height: 20px; }
    .gene-div { margin-top: 0px; }
    .references-list li {
      font-size: 12px;
      margin-bottom: 7px;
      font-style: italic;
      line-height: 15px;
    }
    .gene-div.small h1 { font-size: 22px; }
    .interpretation-div.small p { font-size: 10pt !important; }
    @media print {
      .page { width: 100%; height: 100vh; margin: 0; box-shadow: initial; }
    }
  </style>
</head>
<body>
  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${summaryPage(opts, allConditions, {})}
  ${sectionCoverPage("Cardiovascular<br>Disease", `${IMG}/cover1.jpg`, themeColor, logoUrl)}
  ${conditionPages}
  ${sectionCoverPage("Metabolic<br>Diseases", `${IMG}/metabolic.jpg`, themeColor, logoUrl)}
  <script>
    function generatePageNo() {
      let pages = document.querySelectorAll('.page');
      let totalPage = pages.length;
      for (let i = 0; i < totalPage; i++) {
        let page = pages[i];
        let pageNo = i + 1;
        page.setAttribute('data-page-no', pageNo);
        if (page.getAttribute('hidepageno') === null) {
          let xPos = "left:104mm";
          let template = '<span style="font-size:12px;position:absolute;' + xPos + ';bottom:25px;z-index:1000;">' + pageNo + ' of ' + totalPage + '</span>';
          page.insertAdjacentHTML('beforeend', template);
        }
      }
    }
    document.addEventListener('DOMContentLoaded', generatePageNo);
  </script>
</body>
</html>`;
}