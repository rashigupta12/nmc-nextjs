// ============================================================
// Women's Health Report — HTML Template Generator
// Built from exact PHP source: reportAbout.php, report_page.php,
// reportstyle.css, reportstyle_Poppins.css, reportPages.css
// ============================================================

import { ConditionData } from "@/services/womenHealthReportService";
import { PdfGeneratorOptions } from "@/types/womenHealthReport";


// ─── Constants ───────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';


const IMG = `${BASE_URL}/reportimg/women_images`; // note: PHP uses "women_images" (typo preserved)
const ASSETS = `${BASE_URL}/`;

// ─── Helpers ─────────────────────────────────────────────────
function getThemeColor(vendor?: PdfGeneratorOptions['vendor']): string {
  return vendor?.themeColor ?? '#fe84ff';
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
  const s = status?.toLowerCase();
  if (s === 'good') return '#22c55e';
  if (s === 'average') return '#f59e0b';
  return '#ef4444';
}

// ─── Replace gaugeSvg function with this ────────────────────
function gaugeImg(status: string): string {
  const s = status?.toLowerCase() || 'good';
  return `<img src="${ASSETS}reportimg/imunity/${s}.png" width="90" alt="${s}" style="display:block;margin:auto;"/>`;
}


// ─── immune_page_header — replicates the PHP function ────────
function pageHeader(title: string, logoUrl: string): string {
  const logo = logoUrl
    ? `<img src="${logoUrl}" style="max-height:40px;max-width:120px;object-fit:contain;" alt="Logo"/>`
    : `<span style="font-weight:700;color:#426c7f;font-size:10pt;">NMC Genetics</span>`;
  return `
  <div class="header left" style="position:absolute;top:18px;left:0;width:calc(100% - 12mm);display:grid;grid-template-columns:12mm max-content auto;height:22px;z-index:1000;">
    <div style="background:#E7E7E7;height:22px;"></div>
    <div style="background:white;text-align:center;line-height:1;padding:3px 10px;font-weight:500;letter-spacing:2px;color:#426c7f;font-size:8pt;white-space:nowrap;">${title.toUpperCase()}</div>
    <div style="background:#E7E7E7;height:22px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;">${logo}</div>
  </div>`;
}

// ─── immune_page_footer ───────────────────────────────────────
function pageFooter(logoUrl: string): string {
  const logo = logoUrl
    ? `<div style="background-image:url('${logoUrl}');background-size:contain;background-repeat:no-repeat;width:140px;height:49px;"></div>`
    : `<div style="width:140px;height:49px;"></div>`;
  return `
  <div class="footer left" style="position:absolute;bottom:6px;left:7mm;width:calc(100% - 19mm);display:grid;grid-template-columns:max-content auto;z-index:1000;">
    ${logo}
    <div style="background:#E7E7E7;height:22px;margin:12px 0 0 0;"></div>
  </div>`;
}

// ─── immune_profile_header_box — condition banner with image ──
function conditionHeaderBox(imgPath: string, heading: string, themeColor: string): string {
  return `
  <div style="background-image:url('${imgPath}');background-size:cover;background-position:center;width:100%;min-height:130px;position:relative;margin-bottom:0;">
    <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.45));padding:12px 20px;">
      <div style="background:white;display:inline-block;padding:4px 12px;">
        <h2 style="color:${themeColor};font-size:17px;font-weight:bold;margin:0;">${heading}</h2>
      </div>
    </div>
  </div>`;
}

// ─── CSS — exact translation of reportstyle + reportPages ────
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

  /* PAGE */
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

  /* CONTENT BOX — matches .content-box { margin:auto; width:195mm } */
  .content-box {
    margin: auto;
    width: 195mm;
  }

  /* TYPOGRAPHY */
  p {
    text-align: justify;
    color: rgb(77,77,77);
    font-size: 14px;
    font-weight: 400;
    margin: 0 0 8px 0;
    line-height: 20px;
  }
  h1, h2, h3, h4, h5 { margin: 0; }
  h2 { color: #3BB9FC; font-size: 30px; font-weight: 300; margin: 20px 0 5px 0; }
  ul { padding: 0; list-style: none; }
  ul li {
    text-align: justify; color: rgb(77,77,77); font-size: 14px;
    font-weight: 400; position: relative; margin-left: 20px;
  }
  ul li::before { content: "•"; font-size: 13pt; position: absolute; top: 0; left: -20px; }
  ol { padding-left: 15px; }
  ol li { font-size: 14px; color: rgb(77,77,77); margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  img { width: 100%; }

  .list-color { color: rgb(77,77,77); }

  /* TITLE HEADINGS — used in about pages */
  .title-heading {
    font-size: 21px;
    color: ${themeColor};
    font-weight: 300;
    margin: 10px 0;
  }
  .title-heading2 {
    font-size: 17px;
    color: ${themeColor};
    font-weight: bold;
    margin: 10px 0 4px;
  }

  /* PROFILE TABLE — exact from reportstyle.css */
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

  /* PATIENT DIV badge */
  .patientDiv {
    background: ${themeColor}; color: white;
    display: inline-block; padding: 8px 28px;
    border-radius: 4px; margin-bottom: 10px;
    font-weight: 600; font-size: 12pt; text-align: center;
  }

  /* SUMMARY TABLE */
  .summaryTable { width: 100%; border-collapse: collapse; }
  .summaryTable .border { border-bottom: 1px solid #eee; }
  .summaryTable td { padding: 10px 8px; font-size: 13px; vertical-align: middle; }
  .summaryTable .text-bl { color: rgb(77,77,77); }
  .summaryTable td.good { color: #22c55e; font-weight: 700; width: 80px; text-align: center; }
  .summaryTable td.average { color: #f59e0b; font-weight: 700; width: 80px; text-align: center; }
  .summaryTable td.poor { color: #ef4444; font-weight: 700; width: 80px; text-align: center; }

  .summary-heading {
    font-size: 20px; font-weight: 600;
    background: ${themeColor}; color: white;
    padding: 10px 20px; border-radius: 30px;
    margin-bottom: 10px;
  }

  /* GENE VARIANTS TABLE — exact from reportPages.css */
  .gene-varients { width: 100%; border-collapse: collapse; }
  .gene-varients tr:not(:first-child) { border-top: 10px solid white; }
  .gene-varients tr td:nth-child(1) {
    background: ${themeColor}; padding: 15px;
    width: 25%; vertical-align: top;
    min-height: 100px;
  }
  .gene-varients tr td:nth-child(2) {
    background: #DFDFDF; padding: 15px;
    width: 75%; vertical-align: top;
  }
  .gene-Id-style { border-bottom: 0.5px solid white; padding-bottom: 5px; }
  .gene-Id-style span { color: white; text-align: center; display: inline-block; width: 100%; font-size: 11px; }
  .gene-Id-style2 { border-bottom: 0.5px solid black; padding-bottom: 5px; }
  .gene-Id-style2 span { font-size: 14px; font-weight: 600; color: #222; }

  /* RESPONSE TABLE — exact from reportPages.css */
  .response { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .response tbody td:nth-child(1) {
    width: 25%; vertical-align: top;
    background-color: #DFDFDF; text-align: center; padding: 12px;
  }
  .response tbody td:nth-child(1) h4 {
    font-weight: 400; text-align: center;
    color: ${themeColor}; font-size: 12px; margin-bottom: 6px;
  }
  .response tbody tr:nth-child(1) td:nth-child(2) {
    width: 75%; vertical-align: top;
    background: ${themeColor}; color: white;
    padding: 0 20px; min-height: 100px;
  }
  .response tbody tr:nth-child(1) td:nth-child(2) h4 {
    padding: 10px 0; border-bottom: 1px solid white;
    font-weight: 400; color: white; font-size: 13px;
  }
  .response tbody tr:nth-child(1) td:nth-child(2) p {
    color: white !important; margin-top: 5px; line-height: 20px; font-size: 13px;
  }
  .response tbody tr:nth-child(2) { border-top: 10px solid white; }
  .response tbody tr:nth-child(2) td:nth-child(1) {
    background: ${themeColor};
    background-image: url('${ASSETS}/reportimg/imunity/recommend.png');
    background-repeat: no-repeat; background-size: contain;
    background-position: 20% 20%;
    min-height: 150px;
  }
  .response tbody tr:nth-child(2) td:nth-child(2) {
    width: 75%; vertical-align: top;
    background: #DFDFDF; padding: 0 20px;
  }
  .response tbody tr:nth-child(2) td:nth-child(2) h4 {
    padding: 10px 0; font-weight: 400;
    border-bottom: 1px solid black; margin: 0;
    color: ${themeColor}; font-size: 13px;
  }
  .response tbody tr:nth-child(2) td:nth-child(2) p {
    margin-top: 5px; line-height: 20px; font-size: 13px; color: rgb(77,77,77);
  }

  /* TABLE-IM — About report grading table */
  .table-im { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  .table-im th { border: 1px solid #ddd; padding: 8px; background: #f8f8f8; font-weight: 600; }
  .table-im td { border: 1px solid #ddd; padding: 8px; vertical-align: middle; }
  .strip { display: inline-block; width: 60px; height: 18px; border-radius: 3px; }
  .strip.good { background: #22c55e; }
  .strip.average { background: #f59e0b; }
  .strip.poor { background: #ef4444; }

  /* TOC */
  .mask-left::after, .mask-right::after {
    content: ''; background: rgba(0,0,0,0.25) !important;
    height: 200px !important; position: absolute;
    width: 97%; top: 0px;
  }
  .table-con-heading {
    color: white; font-size: 12px; font-weight: 600;
    position: absolute; bottom: 8px; left: 10px; right: 10px;
    z-index: 1; line-height: 1.3;
  }
  .table-con-heading-one {
    color: white; font-size: 11px; font-weight: 600;
    position: absolute; bottom: 8px; left: 10px; right: 10px;
    z-index: 1; line-height: 1.3;
  }
  .table-list { list-style: none; padding: 0; margin: 6px 0 0; }
  .table-list li { font-size: 12px; color: rgb(77,77,77); margin: 3px 0; }
  .table-list li::before { display: none; }

  /* COVER PAGE */
  .cover-title {
    position: absolute; bottom: 40px; left: 0; right: 0;
    text-align: center; font-size: 16pt; font-weight: 400;
    color: #555; letter-spacing: 1px;
  }
  .patient-box {
    position: absolute; bottom: 18px; left: 0; right: 0;
    text-align: center; font-size: 12pt; color: #555;
    font-weight: 300;
  }

  /* HEADER-BOX for condition section headers */
  .header-box {
    background-size: cover; background-position: center;
    width: 100%; min-height: 130px; position: relative;
  }

  /* BACK IMG pages — light pattern bg, same as PHP backImg */
  .backImg { background-color: white; }

  /* LAST PAGE */
  .last-page-box {
    height: 240px; width: 187mm;
    border-radius: 25px; border: 2px solid white;
    position: absolute; left: 50%; top: 100px;
    transform: translateX(-50%);
    z-index: 9; padding: 20px 40px;
  }
  `;
}

// ─── COVER PAGE ──────────────────────────────────────────────
function coverPage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const coverImg = vendor?.coverPageImg || `${IMG}/cover_page.jpg`;
  const patientName = reportData.PatientDetails.name;
  const logoUrl = vendor?.coverLogoUrl || vendor?.logoUrl || '';

  return `
  <div class="page" hidepageno sample style="background-image:url('${coverImg}');background-size:cover;background-position:center 10%;margin:0 auto;">
    ${logoUrl ? `<img src="${logoUrl}" style="width:27%;position:relative;top:2%;left:2%;" alt="logo"/>` : ''}
    <div style="position:absolute;bottom:80px;left:0;right:0;text-align:center;">
      <div style="color:${themeColor};font-size:22px;font-family:'Poppins',sans-serif;font-weight:300;letter-spacing:1px;">DNA WOMAN'S HEALTH TEST</div>
      <div style="font-size:14pt;font-weight:400;color:#444;margin-top:6px;letter-spacing:1px;">WOMAN'S HEALTH REPORT</div>
      <p style="font-size:12pt;color:#555;margin:4px auto 0;font-weight:300;text-align:center;width:100%;">Patient Name : ${patientName}</p>
    </div>
  </div>`;
}

// ─── PROFILE PAGE ────────────────────────────────────────────
function profilePage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const themeColor = getThemeColor(vendor);
  const logoUrl = vendor?.logoUrl || '';
  const p = reportData.PatientDetails;
  const s = reportData.SampleDetails;
  const reportDate = s.report_date ? formatDate(s.report_date) : today();
  const sampleDate = s.sample_date ? formatDate(s.sample_date) : '';
  const sigUrl = vendor?.signatureUrl || `${ASSETS}/images/govindSignature.png`;

  return `
  <div class="page backImg" sample>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">

      <div style="width:100%;text-align:center;">
        ${logoUrl ? `<div style="width:100%;top:0;text-align:center;margin-bottom:10px;"><img style="width:20%;max-width:120px;" src="${logoUrl}" alt="logo"/></div>` : ''}
        <div class="patientDiv">
          <h3 style="font-weight:500;font-size:14px;margin:0;">SAMPLE ID: ${s.kitBarcode || s.vendorSampleId}</h3>
          <span style="display:block;font-size:12px;font-weight:200;">Date of report : ${reportDate}</span>
        </div>
      </div>

      <h3 class="title-heading">Your Profile</h3>
      <table class="profile-table">
        <tr><td>PATIENT NAME</td><td style="text-transform:capitalize;">${p.name}</td></tr>
        <tr><td>AGE (YEARS)</td><td>${p.age}</td></tr>
        ${p.weight ? `<tr><td>WEIGHT (KG)</td><td>${p.weight}</td></tr>` : ''}
        <tr><td>GENDER</td><td>${p.gender === 'M' || p.gender === 'Male' ? 'MALE' : p.gender === 'F' || p.gender === 'Female' ? 'FEMALE' : p.gender?.toUpperCase() || 'FEMALE'}</td></tr>
        ${p.height ? `<tr><td>HEIGHT (CM)</td><td>${p.height}</td></tr>` : ''}
        <tr><td>PATIENT ID</td><td>${p.patientId}</td></tr>
        <tr><td>TEST ID</td><td>${s.test}</td></tr>
      </table>

      <table class="profile-table" style="margin-top:20px;">
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
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── WELCOME PAGE ────────────────────────────────────────────
function welcomePage(opts: PdfGeneratorOptions): string {
  const { reportData, vendor } = opts;
  const logoUrl = vendor?.logoUrl || '';
  const themeColor = getThemeColor(vendor);
  const patientName = reportData.PatientDetails.name;
  const vendorName = vendor?.vendorName || 'NMC Genetics';
  const sigUrl = vendor?.signatureUrl || `${ASSETS}/images/govindSignature.png`;
  const sigName = vendor?.sigName || vendorName;

  return `
  <div class="page backImg" sample>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 class="title-heading">Welcome</h3>
      <br/>
      <h4 style="text-transform:capitalize;font-size:14px;">Dear ${patientName},</h4>
      <br/>
      <p>${vendorName} is pleased to provide your <strong>Women's Health</strong> report based on your unique genomic profile. The report offers you a snap-shot of your genetic response pertaining to your health. The interpretations and recommendations made in your report are based on data curated by our scientific experts from hundreds of clinical studies, clinical trials and Genome Wide Association Studies (GWAS) spanning decades of global research.</p>
      <p>Your DNA was extracted from your saliva/blood sample and processed in our labs equipped with next generation sequencing and microarray; utilizing globally validated procedures. The information received from your genetic code determines your health. We continuously strive to update our proprietary genomic and clinical databases to improve our tests and recommendations.</p>
      <p>With insights from this report, your clinicians or wellness consultant has a guidance map to device a personalized drug and accordingly lifestyle changes to help you achieve optimal health. By seeking professional advice and following the recommendations you can improve your health holistically.</p>
      <p>Wishing you good health!</p>
      <br/>
      <img style="width:initial;max-height:80px;" src="${sigUrl}" alt="signature"/>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For ${sigName}<br/>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="font-size:14px;">(${sigName})</b>
      </p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── ABOUT US PAGE ───────────────────────────────────────────
function aboutUsPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  return `
  <div class="page backImg" sample>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 class="title-heading">About Us</h3>
      <br/>
      <p>NMC Genetics is a clinical genomics company with a vision to innovate healthcare using genomics and data science.</p>
      <p>Our services, delivered from a state-of-the-art genomics laboratory, empower clinicians and health care professionals with precise and actionable results to help improve patient care. NMC Genetics has strong focus and domain expertise in clinical genomics, preventive health, and personalized medicine.</p>
      <p>Led by a unique team of highly skilled molecular biologists, bioinformaticians and data scientists, NMC Genetics is poised for a big leap into the future of healthcare.</p>
      <p>NMC Genetics is a subsidiary of NMC Healthcare LLC. a largest private healthcare company in the UAE and ranks amongst the leading fertility service providers in the world. Over the last forty-three years, NMC has earned the trust of millions, thanks to its personalized care, genuine concern and a sincere commitment to the overall well-being of the patient.</p>
      <p>NMC was the first company from Abu Dhabi to list on the London Stock Exchange and is now part of the premium FTSE 100 Index, an elite club of top 100 blue-chip companies by market cap. NMC's strategic acquisitions coupled with its legacy institutions have allowed us to clear the service gap in our healthcare delivery system and offer a continuum of care to patients.</p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── LEGAL DISCLAIMER ────────────────────────────────────────
function legalPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  return `
  <div class="page backImg" sample>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 class="title-heading">Legal Disclaimer</h3>
      <p>This report is based on your unique DNA results obtained by testing your buccal swabs or blood samples or saliva samples in response to a selection of key genes that are associated with the individual health. NMC Genetics provides genetic assessment services only for investigational purposes and the information thus given should be interpreted and used exclusively only by qualified medical practitioners, certified physicians, dieticians, nutritionist, sports therapists and others in similar professions. The company does not provide any medical advise and this report does not constitute a medical diagnostic report.</p>
      <p>Genetic results are unique but being associated with a futuristic technology, the same must be used only under proper advice. NMC Genetics does not guarantee or in any way confirm any future disease or ailment associated with the genetic data disclosed in this report. For any contraindications you are advised to get supportive tests conducted from appropriate hospitals/laboratories.</p>
      <p>Interpretation of genetic data is a matter of expert opinion. Before taking any action based on this report, you are advised to meet and seek the advice of a qualified medical / nutritionist / fitness practitioner / dermatologist or as the case may be a qualified expert of that field.</p>
      <p>The company's role is limited to providing results of genetic tests and providing a broad set of general recommendations. More detailed instructions that may be specific to you are to be made by qualified professional practitioners only. General guidelines provided in our reports are for informational purposes only. They do not constitute professional or medical advice. While assessing your report and providing these recommendations we assume that you are in a general state of good health and do not take into account your past or existing health conditions and or any medication taken by you (either in the past or currently), even if you have provided us with such information. You should consult your medical practitioner before acting on it.</p>
      <p>To the fullest extent permitted by law, neither NMC Genetics and nor its officers, employees or representatives will be liable for any claim, proceedings, loss or damage of any kind arising out of or in connection with acting, or not acting, on the assertions or recommendations in the report. This is a comprehensive exclusion of liability that applies to all damage and loss, including, compensatory, direct, indirect or consequential damages, loss of data, income or profit, loss of or damage to property and claims of third parties, howsoever arising, whether in tort (including negligence), contract or otherwise. Nothing in this statement is intended to limit any statutory rights you may have as a consumer or other statutory rights which may not be excluded, nor to exclude or limit our liability to you for death or personal injury resulting from NMC Genetics negligence or that of its officers, employees or other representatives. Nothing in this statement will operate to exclude or limit liability for fraud or fraudulent misrepresentation.</p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── INTRODUCTION PAGE 1 ────────────────────────────────────
function introPage1(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page backImg" sample>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 class="title-heading">Introduction</h3>
      <p style="margin-top:8px;">Human DNA consists of about 3 billion bases, and more than 99 percent of those bases are the same in all people. The order, or sequence, of these bases determines the information available for building and maintaining an organism, similar to the way in which letters of the alphabet appear in a certain order to form words and sentences.</p>

      <table style="margin-top:16px;">
        <tr>
          <td style="padding:10px 20px;vertical-align:top;background:${themeColor};width:50%;">
            <h3 style="color:white;font-size:14px;margin-bottom:6px;">What is DNA?</h3>
            <p style="color:white;">DNA (Deoxyribonucleic), is the hereditary material in humans and almost all other organisms.</p>
            <p style="margin-top:0;color:white;">Most DNA is located in the cell nucleus (where it is called nuclear DNA), but a small amount of DNA can also be found in the mitochondria (where it is called mitochondrial DNA or mtDNA). The information in DNA is stored as a code made up of four chemical bases: adenine (A), guanine (G), cytosine (C), and thymine (T).</p>
          </td>
          <td style="padding-left:30px;width:50%;vertical-align:middle;">
            <img src="${ASSETS}/reportimg/dna1.png" alt="DNA" style="width:100%;"/>
          </td>
        </tr>
      </table>

      <table style="margin-top:30px;">
        <tr>
          <td style="padding-right:30px;width:50%;vertical-align:middle;">
            <img src="${ASSETS}/reportimg/genemutation.png" alt="Gene Mutation" style="width:100%;"/>
          </td>
          <td style="padding:10px 20px;vertical-align:top;background:${themeColor};width:50%;">
            <h3 style="color:white;font-size:14px;margin-bottom:6px;">What is Gene??</h3>
            <p style="color:white;">A gene is the basic physical and functional unit of heredity. Genes are made up of DNA.</p>
            <p style="margin-top:0;color:white;">Some genes act as instructions to make molecules called proteins. However, many genes do not code for proteins. In humans, genes vary in size from a few hundred DNA bases to more than 2 million bases. The Human Genome Project estimated that humans have between 20,000 and 25,000 genes. Every person has two copies of each gene, one inherited from each parent.</p>
          </td>
        </tr>
      </table>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── INTRODUCTION PAGE 2 ────────────────────────────────────
function introPage2(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page backImg">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <table>
        <tr>
          <td style="padding:10px 20px;vertical-align:top;background:${themeColor};width:50%;">
            <h3 style="color:white;font-size:14px;margin-bottom:6px;">What is a gene mutation and how do mutations occur?</h3>
            <p style="color:white;">A gene mutation is a permanent alteration in the DNA sequence that makes up a gene, such that the sequence differs from what is found in most people.</p>
            <p style="margin-top:0;color:white;">Mutations range in size; they can affect anywhere from a single DNA building block (base pair) to a large segment of a chromosome that includes multiple genes.</p>
          </td>
          <td style="padding-left:30px;width:50%;vertical-align:middle;">
            <img src="${ASSETS}/reportimg/genemutation.jpg" alt="Gene Mutation" style="width:100%;"/>
          </td>
        </tr>
      </table>

      <p style="margin-top:14px;">Gene mutations can be classified in two major ways:</p>
      <ul style="padding-left:15px;">
        <li><span class="list-color">Hereditary (or germline) mutations or germline are inherited from a parent and are present throughout a person's life in virtually every cell in the body.</span></li>
        <li><span class="list-color">Acquired (or somatic) mutations occur at some time during a person's life and are present only in certain cells, not in every cell in the body</span></li>
      </ul>

      <h3 class="title-heading2">What is Genetic testing?</h3>
      <p>Genetic testing is a type of medical test that identifies changes in chromosomes, genes, or proteins. The results of a genetic test can confirm or rule out a suspected genetic condition or help determine a person's chance of developing or passing on a genetic disorder. Genetic tests can be performed using either saliva, blood, tissue or other human cells.</p>

      <h3 class="title-heading2">What do the results of Genetic tests mean?</h3>
      <p>A positive test result means that the laboratory found a change in a particular gene, chromosome, or protein of interest. Depending on the purpose of the test, this result may confirm a diagnosis, indicate that a person is a carrier of a particular genetic mutation, identify an increased risk of developing a disease in the future or suggest a need for further testing.</p>
      <p>A negative test result means that the laboratory did not find a change in the gene, chromosome, or protein under consideration. This result can indicate that a person is not affected by a particular disorder, is not a carrier of a specific genetic mutation, or does not have an increased risk of developing a certain disease. However, there is still the possibility that any unknown genetic variation can still be a risk factor.</p>
      <p>A variant of unknown significance (VUS) can also be found in a genetic sequence for which the association with disease risk is unclear.</p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── WOMEN'S HEALTH PAGE ────────────────────────────────────
function womensHealthPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <h3 style="color:${themeColor};font-size:21px;">Women's Health</h3>
      <p style="margin-top:8px;">Women have unique health issues. And some of the health issues that affect both men and women can affect women differently. Unique issues include pregnancy, menopause, and conditions of the female organs. Women can have a healthy pregnancy by getting early and regular prenatal care. They should also get recommended breast cancer, cervical cancer, and bone density screenings.</p>
      <p style="margin-top:8px;">Women and men also have many of the same health problems. But these problems can affect women differently. For example,</p>
      <ul style="padding-left:15px;">
        <li><span class="list-color">Women are more likely to die following a heart attack than men</span></li>
        <li><span class="list-color">Women are more likely to show signs of depression and anxiety than men</span></li>
        <li><span class="list-color">The effects of sexually transmitted diseases can be more serious in women</span></li>
        <li><span class="list-color">Osteoarthritis affects more women than men</span></li>
        <li><span class="list-color">Women are more likely to have urinary tract problems</span></li>
      </ul>
      <h3 style="color:${themeColor};font-size:21px;margin-top:12px;">Genetics &amp; Women's Health</h3>
      <p style="margin-top:8px;">An individual's health is affected by several factors, including nutrition, exercise, and body weight as well as predispositions to a number of health conditions. Women on the other hand face additional health issues such as, pregnancy, menopause and other gynecological conditions. In order for a woman to achieve optimal health and wellness, it is important for her to understand how her unique genetic profile may be affecting how her body utilizes energy and nutrients, as well as how it responds to certain foods, diets, and exercise regiments. Thus, woman's genetic makeup can also provide with insights into common health conditions that she may predisposed to, as well as other information that may be helpful during a woman's lifetime. Since, "Your genes don't change – they are what they are, and knowing what is in your genes can often help you learn how to take better care of your health.</p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── HOW GENETIC TESTING IMPACTS WELLBEING ──────────────────
function wellbeingPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page backImg">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br/>
      <h3 class="title-heading">How genetic testing impacts our wellbeing?</h3>
      <p style="margin-top:8px;">Genetic defects can affect our health, although in many cases they don't manifest into a disease, but increases the risk of disease. External factors (such as the environment or lifestyle) influences the manifes-tation of the disease. For example, If a person is intolerant to lactose, due to a genetic defect, this person is perfectly healthy as long as he or she does not consume milk or milk products. In many cases health issues appear only in conjunction with certain environmental influences - in this case, consuming products that contain lactose.</p>
      <p>Genetic variations called SNPs (pronounced "snips") or "deletions" or "additions" can affect the way our bodies absorb, metabolize, and utilize nutrients, and determine how effectively we eliminate Xenobiotics (drugs, pollutants) and even potential carcinogens. By understanding the mechanisms by which these genes work and analyzing data generated from genome-wide association studies (known as GWAS) and Mendelian randomization, scientists can now understand what impact SNPs may have on disease risk and relationship with certain gene-environmental contexts.</p>
      <p>Another example is, if a regulatory gene for iron intake is defective, this can increase the risk of iron assimi-lation into the body. Your healthcare practitioner can adjust iron intake through natural foods and supple ments to mitigate the risk of iron deficiency.</p>
      <p>Once researchers understand how specific genotypes can affect how our genes function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.</p>
      <p>A healthy lifestyle is, of course, generally preferable, because it can neutralize many genetic predispositions even without knowing underlying risks. However, genetic testing provides you with appropriate information about underlying risk factors and help an individual to implement pro-active health plan with his/her healthcare practitioner to lead a healthy life.</p>
      <h3 class="title-heading2">SOME FACTS:</h3>
      <p>In human beings, 99.9% bases are same, remaining 0.1% makes a person unique in terms of:</p>
      <ul style="padding-left:15px;">
        <li><span style="color:rgb(77,77,77)">Different attributes / characteristics / traits</span></li>
        <li><span style="color:rgb(77,77,77)">How a person looks and what disease risks he or she may have</span></li>
        <li><span style="color:rgb(77,77,77)">Harmless (no change in our normal health)</span></li>
        <li><span style="color:rgb(77,77,77)">Harmful (can develop into diseases like diabetes, cancer, heart disease, Huntington's disease, and hemophilia)</span></li>
        <li><span style="color:rgb(77,77,77)">Latent (These variations found in genes but are not harmful on their Own. The change in each gene function Only becomes apparent under certain conditions e.g. increase in stress and susceptibility to heart attack)</span></li>
      </ul>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── ABOUT REPORT PAGE ──────────────────────────────────────
function aboutReportPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page backImg">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br/>
      <h3 style="color:${themeColor};font-size:17px;font-weight:bold;">About Your Women's Health Report</h3>
      <p style="margin-top:8px;">This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence. We use hundreds of studies to bring you the genetic information in the Genetic report.</p>
      <p>The reporting format is very consistent and very lucid to understand. The report comprises of following sections in that order.</p>
      <ol style="padding-left:15px;">
        <li><span class="list-color"><b>Summarized results section : </b>This section is divided into master summary.</span></li>
        <li><span class="list-color"><b>Detailed report section : </b>This section gives the detailed overview of every condition. There is summarized results table, a group of relevant traits, corresponding genetic response and interpretations are listed. Each trait or phenotype has its response is marked as good, bad or average.</span></li>
      </ol>
      <p>Another example is, if a regulatory gene for iron intake is defective, this can increase the risk of iron assimi-lation into the body. Your healthcare practitioner can adjust iron intake through natural foods and supple ments to mitigate the risk of iron deficiency.</p>
      <p>Once researchers understand how specific genotypes can affect how our genes function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.</p>
      <p>This information provides you insight into specific risks such as effect of the marker on your Vitamins &amp; Minerals deficiency. A group of associated genetic markers are further included in a larger section say Micronutrients where analysis of overall effect of all markers influencing your Vitamins &amp; Minerals deficiency is provided. Summary of recommendations in terms do's and don'ts of lifestyle, nutrition, supplementation or exercise are included. This is how the result for a genetic marker associated to an individual trait is graded:</p>
      <table class="table-im">
        <thead><tr><th>Response</th><th>Risk Level</th><th>Zone</th><th>Interpretation</th></tr></thead>
        <tbody>
          <tr><td>Good</td><td>Low/Normal risk</td><td><span class="strip good"></span></td><td>Your genetic predisposition to the disease is normal or low</td></tr>
          <tr><td>Average</td><td>Medium risk</td><td><span class="strip average"></span></td><td>Your genetic predisposition to the disease is average. Hence, act as per the recommendations.</td></tr>
          <tr><td>Poor</td><td>High Risk</td><td><span class="strip poor"></span></td><td>Your genetic predisposition to the disease is high. Hence, act as per the recommendations or consult your healthcare practitioner.</td></tr>
        </tbody>
      </table>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── TABLE OF CONTENTS PAGE ──────────────────────────────────
function tableOfContentsPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  const tocImages = [
    `${IMG}/thumbnail-1.jpg`,
    `${IMG}/thumbnail-2.jpg`,
    `${IMG}/thumbnail-3.jpg`,
    `${IMG}/thumbnail-4.jpg`,
    `${IMG}/thumbnail-5.jpg`,
  ];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const conditionNames = Object.keys(opts.reportData.ReportData);

  const cells = conditionNames.map((name, i) => {
    const display = opts.reportData.ReportData[name][0]?.display_condition || name;
    const img = tocImages[i] || tocImages[0];
    return `
    <td style="width:50%;padding:0 6px 10px 6px;vertical-align:top;position:relative;">
      <div class="${i % 2 === 0 ? 'mask-left' : 'mask-right'}" style="position:relative;">
        <div style="background:url('${img}');background-repeat:no-repeat;height:200px;background-size:cover;position:relative;">
          <span class="${i % 2 === 0 ? 'table-con-heading' : 'table-con-heading-one'}">${letters[i]}. ${display}</span>
        </div>
      </div>
      <div>
        <ol class="table-list" style="list-style:none;padding:0;margin:6px 0 0;">
          <li style="font-size:12px;color:rgb(77,77,77);">${letters[i]}. ${display}</li>
        </ol>
      </div>
    </td>`;
  });

  // pair into rows of 2
  const rows = [];
  for (let i = 0; i < cells.length; i += 2) {
    rows.push(`<tr>${cells[i]}${cells[i + 1] || '<td></td>'}</tr>`);
  }

  return `
  <div class="page backImg" sample>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:100px;"></div>
    <div class="content-box">
      <br/>
      <h3 class="title-heading">Table of contents</h3>
      <br/>
      <table><tbody>${rows.join('')}</tbody></table>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── SUMMARY PAGE ────────────────────────────────────────────
function summaryPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const reportData = opts.reportData.ReportData;

  const rows = Object.entries(reportData).map(([condName, conditions]) => {
    const cond = conditions[0];
    const status = cond.condition_status?.toLowerCase() || 'good';
    const genes = [...new Set(cond.gene.map((g: any) => g.name))].join(', ');
    return `
    <tr class="border">
      <td class="text-bl">${cond.display_condition || condName}</td>
      <td class="${status}">${cond.condition_status}</td>
      <td class="text-bl"><div>${genes}</div></td>
    </tr>`;
  }).join('');

  return `
  <div class="page backImg">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:90px;"></div>
    <div class="content-box">
      <br/>
      <h3 class="summary-heading">Your summarized test report</h3>
      <div class="detox">
        <table class="summaryTable" style="margin-top:15px;">
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── CONDITION COVER PAGE ───────────────────────────────────
function conditionCoverPage(conditionName: string, imgPath: string): string {
  return `
  <div class="page" hidepageno sample style="background-image:url('${imgPath}');">
    <div class="cover-page-heading-mask" style="background:linear-gradient(0deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 100%);width:100%;height:19%;position:absolute;bottom:0;">
      <h2 class="cover-page-heading" style="font-size:40px;color:white;font-weight:bolder;position:absolute;left:0;bottom:90px;width:100%;text-align:center;">
        <br/>${conditionName}
      </h2>
    </div>
  </div>`;
}

// ─── CONDITION DETAIL PAGES — matches report_page.php exactly ─
function conditionDetailPages(
  conditionIndex: number,
  conditionName: string,
  conditions: ConditionData[],
  opts: PdfGeneratorOptions
): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  const cond = conditions[0];

  // Map condition index to PHP's reportData array images
  const detailImages: Record<number, string> = {
    0: `${IMG}/Polycystic-Ovary-SyndromeRisk_p14.jpg`,
    1: `${IMG}/Pregnancy-Loss-And-Abnormal-Reproductive-Function-Risk_p17.jpg`,
    2: `${IMG}/Peripartum-Depression-Risk.jpg`,
    3: `${IMG}/Osteoporosis_cover.jpg`,
    4: `${IMG}/Rheumatoid-Arthritis_page26.jpg`,
  };
  const detailImg = detailImages[conditionIndex] || detailImages[0];

  // Gene rows
  const geneRows = cond.gene.map((gene: any) => `
  <tr>
    <td>
      <div class="gene-Id-style"><div><span>Your Genotype</span></div></div>
      <div style="padding-top:8px;color:white;font-size:16px;font-weight:600;">${gene.report_variant || gene.test_variant}</div>
    </td>
    <td>
      <div>
        <div class="gene-Id-style2"><span>${gene.name}</span></div>
        <p>${gene.gene_description}</p>
      </div>
    </td>
  </tr>`).join('');

  // Interpretation + Recommendation — split across pages like PHP
  // PHP: condition desc + gene cards on first page, response on second (or same if single gene)
  const page1 = `
  <div class="page" data-pn-target="cond${conditionIndex}">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:80px;"></div>
    ${conditionHeaderBox(detailImg, cond.display_condition || conditionName, themeColor)}
    <div class="content-box detox-content" style="margin-top:8px;">
      <p style="margin-top:8px;">${cond.condition_desc}</p>
      ${cond.heading1 ? `<h4 style="color:${themeColor};margin:8px 0 4px;">${cond.heading1}</h4>` : ''}
      ${cond.heading_desc1 ? `<div style="font-size:13px;">${cond.heading_desc1}</div>` : ''}
      ${cond.heading_desc2 ? `<div style="font-size:13px;margin-top:6px;">${cond.heading_desc2}</div>` : ''}
    </div>
    ${pageFooter(logoUrl)}
  </div>`;

  const page2 = `
  <div class="page backImg">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <br/>
      <table class="gene-varients" style="width:100%;">
        <tbody>${geneRows}</tbody>
      </table>
      <table class="response">
        <tbody>
          <tr>
            <td>
              <h4 style="color:${themeColor};">Your Response</h4>
              ${gaugeImg(cond.condition_status)}
            </td>
            <td>
              <h4 style="color:white;">Interpretation</h4>
              <p style="color:white;">${cond.interpretation}</p>
            </td>
          </tr>
          <tr>
            <td class="rImage" style="background-image:url('${ASSETS}/reportimg/imunity/recommend.png');background-repeat:no-repeat;background-size:contain;background-position:20% 20%;background-color:${themeColor};"></td>
            <td>
              <h4>Recommendation</h4>
              <p>${cond.recommendation}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;

  // ── Special handling for Osteoporosis (has heading_desc2) ──
  if (cond.heading_desc2 && cond.heading_desc2.trim()) {
    const page1 = `
    <div class="page" data-pn-target="cond${conditionIndex}">
      ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
      <div style="height:80px;"></div>
      ${conditionHeaderBox(detailImg, cond.display_condition || conditionName, themeColor)}
      <div class="content-box detox-content" style="margin-top:8px;">
        <p style="margin-top:8px;">${cond.condition_desc}</p>
        ${cond.heading1 ? `<h4 style="color:${themeColor};margin:8px 0 4px;">${cond.heading1}</h4>` : ''}
        ${cond.heading_desc1 ? `<div style="font-size:13px;">${cond.heading_desc1}</div>` : ''}
      </div>
      ${pageFooter(logoUrl)}
    </div>`;

    const page2 = `
    <div class="page backImg">
      ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
      <div style="height:80px;"></div>
      <div class="content-box detox-content">
        <div style="font-size:13px;">${cond.heading_desc2}</div>
        <br/>
        <table class="gene-varients" style="width:100%;">
          <tbody>${geneRows}</tbody>
        </table>
        <table class="response">
          <tbody>
            <tr>
              <td>
                <h4 style="color:${themeColor};">Your Response</h4>
                ${gaugeImg(cond.condition_status)}
              </td>
              <td>
                <h4 style="color:white;">Interpretation</h4>
                <p style="color:white;">${cond.interpretation}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      ${pageFooter(logoUrl)}
    </div>`;

    const page3 = `
    <div class="page backImg">
      ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
      <div style="height:80px;"></div>
      <div class="content-box">
        <br/>
        <table class="response">
          <tbody>
            <tr>
              <td class="rImage" style="background-image:url('${ASSETS}reportimg/imunity/recommend.png');background-repeat:no-repeat;background-size:contain;background-position:20% 20%;background-color:${themeColor};"></td>
              <td>
                <h4>Recommendation</h4>
                <p>${cond.recommendation}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      ${pageFooter(logoUrl)}
    </div>`;

    return page1 + page2 + page3;
  }

  // ── Default: existing page1 + page2 for all other conditions ──
  return page1 + page2;
}

// ─── SCIENCE BEHIND THE TEST ─────────────────────────────────
function sciencePage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page" data-pn-target="COVID1">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:80px;"></div>
    <div class="content-box">
      <br/>
      <h3 style="color:${themeColor};font-size:21px;">Science behind the test</h3>
      <h4 style="margin:10px 0;">Test Methodology</h4>
      <p>Genomic DNA is extracted from individual's Saliva/Tissue/Blood by commercial DNA extraction kits. The genotyping and variant detection is carried out based on illumina Infinium® array protocol. The DNA is then, amplified, fragmented and hybridized to known DNA fragments immobilized in arrays on a BeadChip. Millions of such known DNA fragments (50mer probes) containing the target genetic variants are immobilized on the chip. The hybridized chip is then washed to remove non-hybridized DNA fragments. Single-base extension of the oligos on the BeadChip, using the captured DNA as a template, incorporates detectable labels on the BeadChip and determines the genotype call for the sample. The Illumina iScan® or BeadArray Reader scans the BeadChip, using a laser to excite the fluorophore of the single-base extension product on the beads. The scanner records high-resolution images of the light emitted from the fluorophores.</p>
      <h4 style="margin:10px 0;">Analytical Performance</h4>
      <p>The genotyping was performed using a custom genotyping array platform (Illumina Inc). This test is a laboratory developed test with high reproducibility &gt; 99% and high call rates &gt; 98% to detect the variants and its performance has been validated in-house. Note that some of the genotypes may be imputed.</p>
      <h4 style="margin:10px 0;">Analysis</h4>
      <p>Illumina GenomeStudio® Software is used for efficient genotyping data normalization, genotype calling, clustering, data intensity analysis. Genotypes are called for each sample by their signal intensity (norm R) and Allele Frequency (Norm Theta) relative to canonical cluster positions for a given SNP marker. The report is manually reviewed by experts before release.</p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── REFERENCES PAGE ────────────────────────────────────────
function referencesPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';
  const themeColor = getThemeColor(opts.vendor);
  return `
  <div class="page">
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="height:60px;"></div>
    <div class="content-box">
      <br/>
      <h3 style="font-size:31px;color:${themeColor};font-weight:300;font-family:'Poppins',sans-serif;">References</h3>
      <br/>
      <ol style="padding-left:0;list-style:none;">
        <li style="font-size:10px;margin-bottom:7px;font-weight:600;">Dasgupta S, Sirisha PV, Neelaveni K, Anuradha K, Reddy BM. Association of CAPN10 SNPs and haplotypes with polycystic ovary syndrome among South Indian Women. PLoS One. 2012;7(2):e32192. doi: 10.1371/journal.pone.0032192. Epub 2012 Feb 23. PMID: 22384174; PMCID: PMC3285666.</li>
        <li style="font-size:10px;margin-bottom:7px;font-weight:600;">Sata, F., Yamada, H., Kishi, R., &amp; Minakami, H. (2012). Maternal folate, alcohol and energy metabolism-related gene polymorphisms and the risk of recurrent pregnancy loss. Journal of Developmental Origins of Health and Disease, 3(5), 327-332. doi:10.1017/S2040174412000359</li>
        <li style="font-size:10px;margin-bottom:7px;font-weight:600;">Wu, Zaigui et al. "Association between functional polymorphisms of Foxp3 gene and the occurrence of unexplained recurrent spontaneous abortion in a Chinese Han population." Clinical &amp; developmental immunology vol. 2012 (2012): 896458. doi:10.1155/2012/896458</li>
        <li style="font-size:10px;margin-bottom:7px;font-weight:600;">Prasad P, Kumar A, Gupta R, Juyal RC, Thelma BK. Caucasian and Asian specific rheumatoid arthritis risk loci reveal limited replication and apparent allelic heterogeneity in north Indians. PLoS One. 2012;7(2):e31584. doi: 10.1371/journal.pone.0031584. Epub 2012 Feb 15. PMID: 22355377; PMCID: PMC3280307.</li>
        <li style="font-size:10px;margin-bottom:7px;font-weight:600;">Das S, Baruah C, Saikia AK, Bose S. Associative role of HLA-DRB1 SNP genotypes as risk factors for susceptibility and severity of rheumatoid arthritis: A North-east Indian population-based study. Int J Immunogenet. 2018 Feb;45(1):1-7. doi: 10.1111/iji.12347. Epub 2017 Nov 23. PMID: 29168332.</li>
      </ol>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}

// ─── BLANK PAGE ────────────────────────────────────────
function blankPage(opts: PdfGeneratorOptions): string {
  const logoUrl = opts.vendor?.logoUrl || '';

  return `
  <div class="page" hidepageno>
    ${pageHeader("WOMAN'S HEALTH REPORT", logoUrl)}
    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
      <p style="font-size:14px;color:#666;font-style:italic;text-align:center;">This page has been left blank intentionally.</p>
    </div>
    ${pageFooter(logoUrl)}
  </div>`;
}


// ─── LAST PAGE ───────────────────────────────────────────────
function lastPage(opts: PdfGeneratorOptions): string {
  const vendor = opts.vendor;
  const backCoverImg = vendor?.backCoverImg || `${ASSETS}/reportimg/imunity/Last Page.jpg`;
  const quoteImg = `${ASSETS}/reportimg/imunity/quote.png`;
  return `
  <div class="page" id="quotesPage" sample hidepageno
       style="background-image:url('${backCoverImg}');background-size:cover;background-position:center;">
    <div class="last-page-box">
      <img src="${quoteImg}" style="width:8%;position:relative;top:-36px;left:-31px;" alt="quote"/>
      <img src="${quoteImg}" style="width:8%;position:relative;top:-36px;left:-31px;" alt="quote"/>
      <p style="color:white;font-size:22px;font-weight:300;padding:0 63px;margin-top:-20px;">"Communities and countries and ultimately the world is only as strong as the health of their women."</p>
      <h3 style="font-size:31px;color:white;padding:0 63px;font-weight:300;font-family:'Poppins',sans-serif;">– Michelle Obama</h3>
    </div>
  </div>`;
}

// ─── MASTER HTML BUILDER ─────────────────────────────────────
export function buildWomenHealthReportHtml(opts: PdfGeneratorOptions): string {
  const themeColor = getThemeColor(opts.vendor);
  const logoUrl = opts.vendor?.logoUrl || '';
  const conditions = Object.entries(opts.reportData.ReportData);

  // Condition cover images — PHP filenames preserved exactly
  const conditionCoverImages: Record<number, string> = {
    0: `${IMG}/Polycystic-Ovary-SyndromeRisk.jpg`,
    1: `${IMG}/Pregnancy-Loss-And-Abnormal-Reproductive-Function-Risk.jpg`,
    2: `${IMG}/Peripartum-Depression-Risk_cover.jpg`,
    3: `${IMG}/Osteoporosis_cover1.jpg`,
    4: `${IMG}/Rheumatoid-Arthritis_cover.jpg`,
  };

  const conditionPages = conditions.map(([name, data], i) => `
    ${conditionCoverPage(name, conditionCoverImages[i] || conditionCoverImages[0])}
    ${conditionDetailPages(i, name, data, opts)}
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Women's Health Report</title>
  <style>${buildCSS(themeColor)}</style>
</head>
<body>
  ${coverPage(opts)}
  ${profilePage(opts)}
  ${welcomePage(opts)}
  ${aboutUsPage(opts)}
  ${legalPage(opts)}
  ${introPage1(opts)}
  ${introPage2(opts)}
  ${womensHealthPage(opts)}
  ${wellbeingPage(opts)}
  ${aboutReportPage(opts)}
  ${tableOfContentsPage(opts)}
  ${summaryPage(opts)}
  ${conditionPages}
  ${sciencePage(opts)}
  ${referencesPage(opts)}
  ${blankPage(opts)}
  ${lastPage(opts)}
  <script>
    function generatePageNo() {
      const pages = document.querySelectorAll('.page');
      const total = pages.length;
      pages.forEach((page, i) => {
        page.setAttribute('data-page-no', String(i + 1));
        if (!page.hasAttribute('hidepageno')) {
          const span = document.createElement('span');
          span.style.cssText = 'font-size:14px;position:absolute;left:104mm;bottom:0;z-index:1000;background:#cacaca;color:black;padding:10px 15px;';
          span.textContent = (i + 1) + '/' + total;
          page.appendChild(span);
        }
      });
    }
    document.addEventListener('DOMContentLoaded', generatePageNo);
  </script>
</body>
</html>`;
}
