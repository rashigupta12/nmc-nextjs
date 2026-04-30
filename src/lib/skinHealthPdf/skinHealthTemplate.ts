// /lib/skinHealthPdf/skinHealthTemplate.ts
// ============================================================
// Skin Health Report — Complete HTML Template Generator
// Faithfully replicates the NMC Skin PHP PDF Report layout
// Image paths:
//   /public/skinImages/         → background & cover images
//   /public/reportimg/skin_report/ → icons & report images
// ============================================================

export interface PdfGeneratorOptions {
  reportData: SkinHealthReportResult;
  vendor?: VendorConfig;
  printMode?: boolean;
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
  skinCoverPageImg?: string;
  skinCoverBackPageImg?: string;
}

export interface SkinHealthReportResult {
  PatientDetails: PatientDetails;
  SampleDetails: SampleDetails;
  ReportData: Record<string, ConditionData[]>;
  AdditionalData?: AdditionalData;
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
  sampleType?: string;
  sample_date?: string;
  test_date?: string;
  report_date?: string;
  vendorSampleId?: string;
}

export interface SampleDetails {
  vendorSampleId?: string;
  kitBarcode?: string;
  sampleType: string;
  sample_date?: string;
  report_date?: string;
  test?: string;
}

export interface AdditionalData {
  osStatus?: string;
  osRecom?: string;
  osLifeStyle?: string;
  osMiscell?: string;
  irStatus?: string;
  irRecom?: string;
  irLifeStyle?: string;
  irMiscell?: string;
  seStatus?: string;
  seRecom?: string;
  seLifeStyle?: string;
  seMiscell?: string;
  bioageStatus?: string;
  bioageRecom?: string;
  bioageLifeStyle?: string;
  bioageMiscell?: string;
  stStatus?: string;
  stRecom?: string;
  stLifeStyle?: string;
  stMiscell?: string;
  cpdStatus?: string;
  cpdRecom?: string;
  cpdLifeStyle?: string;
  cpdMiscell?: string;
  spAcneStatus?: string;
  spAcneRecom?: string;
  spAcneLifeStyle?: string;
  spAcneMiscell?: string;
  sspStatus?: string;
  sspRecom?: string;
  sspLifeStyle?: string;
  sspMiscell?: string;
  gliStatus?: string;
  gliRecom?: string;
  gliLifeStyle?: string;
  gliMiscell?: string;
  sasStatus?: string;
  sasRecom?: string;
  sasLifeStyle?: string;
  sasMiscell?: string;
}

export interface ConditionData {
  condition_name: string;
  display_condition: string;
  condition_desc?: string;
  interpretation: string;
  recommendation: string;
  condition_status: string;
  risk_factors?: string;
  symptoms?: string;
  prevention?: string;
  lifestyle?: string;
  miscellaneous?: string;
  gene: GeneData[];
}

export interface GeneData {
  name: string;
  uniqueid: string;
  report_variant?: string;
  test_variant?: string;
  response: string;
  status: string;
  gene_description?: string;
  recommendation?: string;
  lifestyle?: string;
  miscellaneous?: string;
}

// ─── Constants ───────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SKIN_IMAGES = `${BASE_URL}/skinImages`;
const SKIN_REPORT = `${BASE_URL}/reportimg/skin_report`;
const CARDIOMET = `${BASE_URL}/reportimg/cardiomet_images/icons`;

// ─── Helpers ─────────────────────────────────────────────────
function getCircleColor(status: string): string {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "good" || s === "normal") return "#36b34c";
  if (s === "average" || s === "moderate") return "#f2ac26";
  if (s === "bad" || s === "poor") return "#ea5456";
  return "#957ab1";
}

function validateReportStatus(status: string): string {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "good" || s === "normal") return "Good";
  if (s === "average" || s === "moderate") return "Average";
  if (s === "bad" || s === "poor") return "Bad";
  if (s === "n/a" || s === "") return "N/A";
  return status || "N/A";
}

function formatDate(raw?: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB");
}

// ─── PHP: response() helper ──────────────────────────────────
// Renders the coloured "Your Response" badge as PHP does
function response(status: string): string {
  const color = getCircleColor(status);
  const label = validateReportStatus(status);
  return `
    <div style="float:right;margin-right:20px;margin-top:-10px;z-index:10;position:relative;">
      <span style="font-size:11pt;color:#c59b70;margin-right:8px;">Your Response</span>
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color};vertical-align:middle;margin-right:4px;"></span>
      <span style="font-size:11pt;font-weight:600;color:#526d7d;">${label}</span>
    </div>`;
}

// ─── PHP: aboutpageheader() ───────────────────────────────────
// Renders the image + condition header section
function aboutpageheader(
  icon: string,
  num: string,
  category: string,
  title: string,
): string {
  return `
    <div style="border:1px solid #f4eade;height:130px;background:url('${SKIN_IMAGES}/1coverInside.jpg');background-size:cover;position:relative;margin-bottom:0;">
      <div style="position:absolute;top:50%;left:65px;transform:translateY(-50%);display:flex;align-items:center;gap:20px;">
        <img src="${SKIN_REPORT}/${icon}" style="width:60px;height:60px;" alt="icon"/>
        <div>
          <div style="font-size:12pt;color:#9b8a77;font-weight:400;font-family:'Poppins',sans-serif;">${category}</div>
          <div style="font-size:36pt;color:#73644f;font-family:'Cabourg OT Regular','Poppins',sans-serif;line-height:1.1;">${title}</div>
        </div>
      </div>
    </div>`;
}

// ─── PHP: hedingdetailed() ────────────────────────────────────
function hedingdetailed(left: string, right?: string): string {
  return `
    <div style="width:100%;text-align:left;margin-top:10px;font-size:14pt;color:#c59b70;border-bottom:1px solid #cfcfcf;padding-bottom:4px;margin-bottom:6px;">
      ${left}${right ? `<span style="float:right;font-size:11pt;">${right}</span>` : ""}
    </div>`;
}

// ─── PHP: aboutdetailpage() ───────────────────────────────────
function aboutdetailpage(content: string): string {
  return `
    <div style="text-align:justify;line-height:25px;font-size:11pt;font-family:'DINOT','Poppins',sans-serif;margin-top:6px;margin-bottom:8px;color:#575350;">
      ${content}
    </div>`;
}

// ─── PHP: imagefooter() ───────────────────────────────────────
function imagefooter(
  src: string,
  height?: number,
  marginLeft?: number,
): string {
  const h = height ? `${height}px` : "auto";
  const ml = marginLeft ? `${marginLeft}px` : "0";
  return `
    <div style="margin-left:${ml};">
      <img src="${src}" style="width:100%;height:${h};object-fit:cover;" alt="img"/>
    </div>`;
}

// ─── PHP: gene_page_header() ─────────────────────────────────
function gene_page_header(heading: string): string {
  return `
    <div style="font-size:20px;margin-left:0;color:#bf9b70;font-weight:598;border-bottom:1px solid #d5d5d5;padding-top:10px;text-align:left;margin-bottom:12px;">
      ${heading}
    </div>`;
}

// ─── PHP: skin_gene() ─────────────────────────────────────────
function skin_gene(
  status: string,
  gene: string,
  variant: string,
  desc: string,
): string {
  const color = getCircleColor(status);
  const label = validateReportStatus(status);
  return `
    <div style="min-height:140px;margin-bottom:20px;display:flex;gap:16px;align-items:flex-start;">
      <div style="border:1px solid #8c8c8c;width:88px;height:88px;border-radius:100px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;">
        <span style="color:#bf9b70;font-size:11px;">Gene</span>
        <span style="color:#967349;font-size:17px;font-weight:600;line-height:17px;">${gene}</span>
        <div style="position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff5e5;"></div>
      </div>
      <div style="flex:1;">
        <h2 style="font-size:16px;margin:0 0 8px 0;color:#333;">
          Genotype | <strong>${variant}</strong>
          &nbsp;|&nbsp;
          <span style="color:${color};font-weight:600;">${label}</span>
        </h2>
        <p style="text-align:justify;font-size:10pt;line-height:1.5;color:#575350;margin:0;">${desc}</p>
      </div>
    </div>`;
}

// ─── PHP: recommendation() ───────────────────────────────────
function recommendation(
  nutrition: string,
  lifestyle: string,
  miscellaneous: string,
  cssClass?: string,
): string {
  return `
    <div style="margin-top:5px;background:#fef6e3;padding-left:20px;padding-right:20px;padding-top:10px;padding-bottom:10px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;border-radius:20px;box-shadow:3px 3px rgba(0,0,0,0.12);color:#8e7437;overflow:hidden;background:white;min-height:200px;">
          <div style="background:#bf9b70;color:white;font-size:12px;font-weight:600;padding:8px 12px;">Nutrition Recommendation</div>
          <div style="padding:10px 14px;font-size:11px;color:#575350;text-align:justify;line-height:1.5;">${nutrition || "Follow a balanced diet rich in antioxidants."}</div>
        </div>
        <div style="flex:1;min-width:200px;border-radius:20px;box-shadow:3px 3px rgba(0,0,0,0.12);color:#8e7437;overflow:hidden;background:white;min-height:200px;">
          <div style="background:#bf9b70;color:white;font-size:12px;font-weight:600;padding:8px 12px;">Lifestyle</div>
          <div style="padding:10px 14px;font-size:11px;color:#575350;text-align:justify;line-height:1.5;">${lifestyle || "Maintain a healthy lifestyle with regular exercise."}</div>
        </div>
        <div style="flex:1;min-width:200px;border-radius:20px;box-shadow:3px 3px rgba(0,0,0,0.12);color:#8e7437;overflow:hidden;background:white;min-height:200px;">
          <div style="background:#bf9b70;color:white;font-size:12px;font-weight:600;padding:8px 12px;">Miscellaneous</div>
          <div style="padding:10px 14px;font-size:11px;color:#575350;text-align:justify;line-height:1.5;">${miscellaneous || "Consult with a healthcare professional for personalized advice."}</div>
        </div>
      </div>
    </div>`;
}

// ─── PHP: right_column() — A section index strip ─────────────
function right_column(num: string): string {
  return `
    <div style="position:absolute;top:0;right:0;background-color:#fef6e3;width:calc(80px + 15px);text-align:left;padding:0;font-size:11px;color:#887e72;min-height:100%;">
      <div style="padding:12px 8px;font-weight:600;">A.</div>
      <div style="padding:4px 8px;font-weight:700;font-size:14px;color:#73644f;">${num}</div>
    </div>`;
}

function right_columnB(num: string): string {
  return `
    <div style="position:absolute;top:0;right:0;background-color:#fef6e3;width:calc(80px + 15px);text-align:left;padding:0;font-size:11px;color:#887e72;min-height:100%;">
      <div style="padding:12px 8px;font-weight:600;">B.</div>
      <div style="padding:4px 8px;font-weight:700;font-size:14px;color:#73644f;">${num}</div>
    </div>`;
}

function right_columnC(num: string): string {
  return `
    <div style="position:absolute;top:0;right:0;background-color:#fef6e3;width:calc(80px + 15px);text-align:left;padding:0;font-size:11px;color:#887e72;min-height:100%;">
      <div style="padding:12px 8px;font-weight:600;">C.</div>
      <div style="padding:4px 8px;font-weight:700;font-size:14px;color:#73644f;">${num}</div>
    </div>`;
}

// ─── Summary status row ───────────────────────────────────────
function summaryRow(
  num: string,
  icon: string,
  name: string,
  status: string,
): string {
  const color = getCircleColor(status);
  const label = validateReportStatus(status);
  return `
    <tr>
      <td><div style="background:#fef6e3;font-size:13pt;font-weight:300;color:#4c4541;padding:6px 4px;">${num}</div></td>
      <td><div style="padding:2px;"><img src="${SKIN_REPORT}/${icon}" style="width:50px;height:50px;border-radius:100px;" alt="icon"/></div></td>
      <td><div style="background:#fef6e3;padding-left:40px;font-size:13pt;font-weight:300;color:#4c4541;">${name}</div></td>
      <td><div style="background:#fef6e3;width:100%;font-size:13pt;font-weight:300;color:#4c4541;">${label}</div></td>
      <td><div style="background:#fef6e3;"><div style="float:left;width:20px;height:20px;border-radius:20px;background:${color};"></div></div></td>
    </tr>`;
}

// ─── Nutrient food source table ───────────────────────────────
function nutrientTable(rows: string[][]): string {
  const trs = rows
    .map(
      ([food, amount, value]) => `
    <tr style="background:white;">
      <td style="padding:6px 0 0 20px;font-size:14px;">${food}</td>
      <td style="padding:6px 0 0 20px;font-size:14px;">${amount}</td>
      <td style="padding:6px 0 0 20px;font-size:14px;">${value}</td>
    </tr>`,
    )
    .join("");
  return `
    <table style="width:100%;border-spacing:0px;margin-top:10px;">
      <thead>
        <tr style="background-color:#fef6e3;">
          <th style="padding-bottom:0;padding-left:20px;color:#D4A470;font-weight:400;text-align:left;font-size:15px;">Food Sources</th>
          <th style="padding-bottom:0;padding-left:20px;color:#D4A470;font-weight:400;text-align:left;font-size:15px;">Amount</th>
          <th style="padding-bottom:0;padding-left:20px;color:#D4A470;font-weight:400;text-align:left;font-size:15px;">Nutrition Value</th>
        </tr>
      </thead>
      <tbody>${trs}</tbody>
    </table>`;
}

// ─── PHP: asheader equivalent ────────────────────────────────
function asheader(title: string): string {
  return `
    <div style="border:1px solid #f4eade;height:130px;background:url('${SKIN_IMAGES}/1coverInside.jpg');background-size:cover;position:relative;">
      <div style="position:absolute;bottom:20px;left:65px;">
        <div style="text-align:left;font-size:36pt;color:#73644f;font-family:'Cabourg OT Regular','Poppins',sans-serif;font-weight:300;line-height:1.1;">${title}</div>
        <div style="font-family:'Poppins',sans-serif;font-size:22px;color:#73644f;">---------</div>
      </div>
    </div>`;
}

// ─── gene-container wrapper ───────────────────────────────────
function geneContainer(content: string): string {
  return `
    <div style="position:relative;margin-right:calc(80px + 16px);margin-left:20px;">
      ${content}
    </div>`;
}

// ─── aboutcontainer wrapper ───────────────────────────────────
function aboutcontainer(content: string): string {
  return `
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${content}
    </div>`;
}

// ─── CSS ─────────────────────────────────────────────────────
function buildCSS(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { margin:0; font-family:'Poppins','DINOT',sans-serif; background:#ccc; font-size:13px; color:#3b3a36; }

    .sheet {
      box-shadow:0 .5mm 2mm rgba(0,0,0,.3);
      margin:5mm auto;
      width:230mm;
      min-height:297mm;
      background-color:white;
      position:relative;
      page-break-after:always;
      overflow:hidden;
      background-size:100% 100%;
      background-position:center;
      background-repeat:no-repeat;
    }

    @page { margin:0mm; size:230mm 297mm; }
    @media print {
      body { background:white; }
      .sheet { margin:0; box-shadow:none; width:100%; min-height:297mm; }
    }

    /* Match PHP table styles */
    .customertable { width:100%; }
    .customertable tbody tr td:nth-child(1) {
      width:240px; background-color:#fef6e3;
      padding:0 0 0 20px; font-size:20px; color:#5f513d;
    }
    .customertable tbody tr td:nth-child(2) {
      padding:13px 0 0 20px; background-color:white;
      font-size:20px; color:rgba(4,4,4,0.52);
    }

    /* Summary table */
    .summarytab { width:100%; }
    .summarytab tr td { padding:0; }
    .summarytab tbody tr td:nth-child(2) img { width:50px; height:50px; }
    .summarytab tbody tr td:nth-child(2) { width:20px; height:20px; text-align:center; }
    .summarytab tbody tr td:nth-child(3) { text-align:left; width:470px; }
    .sumstatus { float:left; width:20px; height:20px; border-radius:20px; }
    .sumstatusname { float:left; background:#fef6e3; width:100%; font-size:13pt; font-weight:300; color:#4c4541; }
    .traitno { background:#fef6e3; font-size:13pt; font-weight:300; color:#4c4541; }
    .traitimage { font-size:13pt; font-weight:300; color:#4c4541; }
    .traitimage img { border-radius:100px; }
    .traitname { background:#fef6e3; padding-left:40px; font-size:13pt; font-weight:300; color:#4c4541; }
    .traitst { background:#fef6e3; width:100%; }

    /* Gene table */
    .skinTable { width:100%; }
    .skinTable tr { background:white; }
    .leftcol { vertical-align:top; }
    .rightcol { width:100px; background-color:#FEF6E3; vertical-align:top; }

    .geneticHealth { border-spacing:0px; margin-top:50px; width:88%; border:1px solid #eaeaea; }
    .geneticHealth thead tr th { background-color:#eaeaea; border-right:1px solid #eaeaea; padding:5px; font-size:14px; }
    .geneticHealth tbody tr td { background-color:white; text-align:center; border-right:1px solid #eaeaea; padding:5px; font-size:14px; }

    .tableNutrients { width:100%; border-spacing:0px; margin-top:10px; }
    .tableNutrients thead tr { background-color:#fef6e3; }
    .tableNutrients thead tr th { padding:4px 0 0 20px; color:#D4A470; font-weight:400; text-align:left; font-size:15px; }
    .tableNutrients tbody tr td { padding:4px 0 0 20px; text-align:left; font-size:14px; }
    .tableNutrients tbody tr { background:white; }

    .asheader { border:1px solid #f4eade; height:130px; background:url('${SKIN_IMAGES}/1coverInside.jpg'); background-size:cover; }
    .headercontent { text-align:left; font-size:36pt; margin-top:40px; margin-left:0; color:#73644f; font-family:'Cabourg OT Regular','Poppins',sans-serif; font-weight:300; }
    .headercontent::after { content:"---------"; display:block; width:120px; font-size:22px; font-family:'Poppins',sans-serif; }

    p { color:#575350; font-weight:550; }
    h3 { font-size:18px; }
    ul.listgm { text-align:justify; font-family:'DINOT','Poppins',sans-serif; }
    ul.listgm li { margin-bottom:20px; color:#372f29; }
    ul.nutritionsec li { margin-bottom:20px; }
    .contentList li { margin-bottom:12px; }
    .ref_para li { margin-bottom:4px; }

    .gdeschead { font-family:'Cabourg OT Regular','Poppins',sans-serif; text-align:left; margin:35px 0 20px 0; font-size:20pt; color:#716250; }

    .therole { font-size:40pt; color:#C2B09A; width:400px; padding-top:160px; line-height:60px; font-family:'Cabourg OT Regular','Poppins',sans-serif; }
    .therole::after { content:"---------"; display:block; width:120px; font-size:20px; }
    .roleContent { font-size:20px; color:#C2B09A; width:570px; line-height:30px; text-align:justify; margin-bottom:50px; text-align-last:center; }
    .roleContent::after { content:"---------"; display:block; text-align:center; margin-top:20px; font-size:20px; }

    .column { z-index:5; border-radius:20px; box-shadow:3px 3px rgba(0,0,0,0.12); color:#8e7437d1; width:206px; margin-left:0; overflow:hidden; background-color:white; min-height:200px; max-height:400px; }
    .column p { padding:0 20px; text-align:justify; font-size:11px; margin:0; }
    .column span:first-child { margin-bottom:10px; }

    .tabh { font-size:36pt; line-height:50px; padding-top:137px; text-align:left; color:#73634a; font-family:'Cabourg OT Regular','Poppins',sans-serif; }
    .rtabcontainer div { text-align:left; font-size:16pt; color:#f9f0e5; margin-left:20px; line-height:30px; font-weight:lighter; font-family:'Cabourg OT Regular','Poppins',sans-serif; }
    .pd-40 { padding-left:40px; font-size:14pt !important; }

    .right-index-strip { position:absolute; top:0; right:0; background-color:#fef6e3; width:calc(80px + 15px); min-height:100%; }
    .right-index-strip > div { text-align:left; float:left; }

    .gene-container { position:relative; margin-right:calc(80px + 16px); margin-left:20px; }
    .footerM { margin-top:5px; background:#fef6e3; padding-left:20px; margin-right:calc(80px + 16px); }
    .footerM1 { margin-top:5px; background:#fef6e3; padding-left:20px; padding-right:20px; }

    .lftonimg { position:absolute; top:740px; width:250px; left:0; height:200px; text-align:justify; font-size:9pt; line-height:30px; color:#4f4c44; }
    .rgtonimg { position:absolute; top:740px; right:0; width:264px; height:200px; text-align:right; font-size:9pt; line-height:25px; color:#4f4c44; }
    .line { border:0.5px solid #cfcfcf; margin:0; margin-top:-7px; }

    .conditionName { height:100px; text-align:left; line-height:49px; margin-left:40px; clear:both; width:400px; float:left; font-family:'Cabourg OT Regular','Poppins',sans-serif; font-size:36pt; color:#71624f; font-weight:300; }
    .number { float:left; font-size:48pt; text-align:left; margin-left:40px; color:#efe4d9; font-weight:300; }
    .response-box { height:30px; margin-bottom:5px; margin-left:40px; clear:both; font-size:20px; color:#c59b70; }

    .aboutContent { margin-top:10px; text-align:justify; line-height:25px; font-size:11pt; }
    .fheading { font-size:17px; margin-left:3px; }
    .fooheading { font-size:20px; margin-left:0; color:#bf9b70; font-weight:598; border-bottom:1px solid #d5d5d5; padding-top:10px; text-align:left; }
    .hedingdetailed { width:100%; text-align:left; margin-top:10px; font-size:14pt; color:#c59b70; border-bottom:1px solid #cfcfcf; margin-right:70px; }

    .skiniconContainer { text-align:left; width:100%; height:100%; }
    .iconcontainer { float:left; width:160px; height:170px; margin:0 2px 2px 0; background-color:#f4ecd9; padding:5px; }
    .iconcontainer img { width:80px; height:80px; display:inline-block; margin-left:40px; margin-top:10px; margin-bottom:2px; }

    .geno { border:1px solid #8c8c8c; width:80px; height:80px; border-radius:100px; margin-top:10px; padding-left:34px; padding-top:35px; line-height:34px; float:left; }
    .geno:nth-child(1) { color:#bf9b70; }
    .geno:nth-child(2) { color:#967349; font-size:17px; line-height:17px; }

    .status { border-radius:50%; border:3px solid #fff5e5; width:10px; height:10px; position:absolute; }
    .dnamePatientName { position:absolute; font-family:'Poppins',sans-serif; font-size:30px; color:#7b5621; left:73px; bottom:50px; }
  `;
}

// ═══════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════

// ─── 1. Cover Page ───────────────────────────────────────────
function coverPage(opts: PdfGeneratorOptions): string {
  const coverImg = opts.vendor?.coverPageImg || `${SKIN_IMAGES}/frontCover.jpg`;
  const logoUrl = opts.vendor?.coverLogoUrl || opts.vendor?.logoUrl || "";
  const name = opts.reportData.PatientDetails.name;
  return `
  <div class="sheet" hidepageno style="background-image:url('${coverImg}');">
    <div style="position:relative;">
      <div class="skinCoverPage" style="position:absolute;left:${opts.printMode ? "13px" : "0px"};top:${opts.printMode ? "1011px" : "1000px"};">
        <p style="font-size:32px;color:#7b5621;">${name}</p>
      </div>
    </div>
  </div>`;
}

// ─── 2. Cover Inside ─────────────────────────────────────────
function coverInsidePage(): string {
  return `
  <div class="sheet" hidepageno style="background-image:url('${SKIN_IMAGES}/1coverInside.jpg');"></div>`;
}

// ─── 3. About Us ─────────────────────────────────────────────
function aboutUsPage(opts: PdfGeneratorOptions): string {
  const aboutContent =
    opts.vendor?.aboutContent ||
    `
    NMC Genetics is a genomics company with a focus to improve healthcare using genomics and data analytics. Services offered empowers doctors, patients and health enthusiasts with accurate, high quality and reliable tests results. Tests offered by NMC Genetics are in clinical genomics, wellness, and pharmacogenomics domain and are created and delivered by team of highly skilled molecular biologists, computational biologists, bioinformaticians, and data scientists in state-of-the-art genomics laboratory.<br><br>
    Led by unique and diverse mix of experienced life science entrepreneurs, doctors, academicians, and leaders from healthcare world, the NMC Genetics is poised for healthcare revolution.<br><br>
    NMC Genetics is a subsidiary of NMC Healthcare LLC, a largest private healthcare company in the UAE and ranks amongst the leading fertility service providers in the world. Over the last forty-three years, NMC has earned the trust of millions, thanks to its personalized care, genuine concern and a sincere commitment to the overall well-being of the patient.`;

  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;">
      <div style="position:absolute;top:99px;left:51px;font-size:48px;color:#524743;font-family:'Cabourg OT Regular','Poppins',sans-serif;">About Us</div>
      <img src="${SKIN_REPORT}/1.jpg" alt="img" style="width:100%;"/>
    </div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <div class="aboutContent" style="font-family:'Poppins',sans-serif;margin-left:65px;margin-right:65px;padding-top:13px;line-height:30px;font-size:12pt;color:#3b3a36;">
        ${aboutContent}
      </div>
    </div>
  </div>`;
}

// ─── 4. About Report ─────────────────────────────────────────
function aboutReportPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="padding-top:180px;padding-left:100px;">
      <div class="behindd" style="height:530px;float:left;width:340px;background-color:#524743;">
        <div style="font-size:40px;margin-top:30px;color:#fcf4e7;font-family:'Cabourg OT Regular','Poppins',sans-serif;">About Report</div>
      </div>
      <div class="upd" style="height:630px;float:left;width:460px;margin-left:-210px;margin-top:100px;background:url('${SKIN_REPORT}/2.jpg');background-size:cover;"></div>
    </div>
  </div>`;
}

// ─── 5. About Report 2 ───────────────────────────────────────
function aboutReport2Page(): string {
  const icons = [
    {
      file: `${CARDIOMET}/Icon-1.svg`,
      title: "Your Matching Diet",
      desc: "Learn your perfect precision genetic based diet",
    },
    {
      file: `${CARDIOMET}/Icon-2.svg`,
      title: "Exercise",
      desc: "Skin Ageing, Pigmentations, Wrinkling, etc.",
    },
    {
      file: `${CARDIOMET}/Icon-3.svg`,
      title: "Your Eating Behavior Traits",
      desc: "Uncover the genetics behind your eating habits",
    },
    {
      file: `${CARDIOMET}/Icon-4.svg`,
      title: "Your Body and Weight type",
      desc: "Learn your ideal plan for fat loss and your metabolism.",
    },
    {
      file: `${CARDIOMET}/Icon-5.svg`,
      title: "Food Reactions",
      desc: "Learn how your body reacts to common food",
    },
    {
      file: `${CARDIOMET}/Icon-6.svg`,
      title: "Nutritional Needs",
      desc: "Learn which Vitamins you need to consume more and optimize",
    },
    {
      file: `${CARDIOMET}/Icon-7.svg`,
      title: "Your Metabolic Health Factor",
      desc: "Learn how your body reacts to common food",
    },
    {
      file: `${CARDIOMET}/Icon-8.svg`,
      title: "Your Matching Diet Guidelines",
      desc: "Learn which Vitamins you need to consume more and optimize",
    },
  ];
  const iconHtml = icons
    .map(
      (ic) => `
    <div class="iconcontainer">
      <img src="${ic.file}" alt="icon"/>
      <div style="text-align:center;font-size:9pt;width:115px;line-height:15px;margin-bottom:6px;margin-left:20px;color:#485256;"><b>${ic.title}</b></div>
      <div style="text-align:center;font-size:10px;font-weight:600;color:#526d7d;line-height:12px;">${ic.desc}</div>
    </div>`,
    )
    .join("");

  return `
  <div class="sheet" style="background:white;padding-top:40px;">
    <div style="position:relative;width:calc(100% - 50px);">
      <div class="aboutContent" style="font-family:'Poppins',sans-serif;margin-left:65px;margin-right:65px;padding-top:13px;line-height:30px;font-size:13pt;color:#3b3a36;">
        Gene variants called SNPs (pronounced snips) can affect the way our bodies absorb, metabolize, and utilize nutrients, and determine how effectively we eliminate xenobiotics and even potential carcinogens. By understanding the mechanisms by which these genes work and analyzing data generated from genome-wide association studies (known as GWAS) and Mendelian randomization, scientists can now understand what impact SNPs may have on disease risk and relationship with certain gene-environmental contexts.
      </div>

      <div id="aboutReport2div1" style="border:1px solid #524743;height:auto;margin-top:30px;background-color:#524743;font-family:'Poppins',sans-serif;width:100%;padding:10px;">
        <div style="float:left;text-align:left;width:270px;clear:both;margin:40px 10px 10px 50px;line-height:25px;font-size:14pt;color:#e1dacb;">
          Once researchers understand how specific genotypes can affect how our gene function, this enables development of the most favorable nutritional and lifestyle strategies specific to a person's genotype.<br><br>
          This comprehensive genetic report consolidates up-to-date research on most of the common SNPs that research suggests may have actionable nutritional and lifestyle interventions based on scientific evidence.
        </div>
      </div>

      <div id="aboutReport2div2" style="height:720px;width:345px;background-color:#fef6e3;position:absolute;top:204px;right:0;padding:25px;">
        <div class="skiniconContainer">${iconHtml}</div>
      </div>
    </div>
  </div>`;
}

// ─── 6. Genetics For Health ──────────────────────────────────
function geneticsForHealthPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">Genetic testing for health Care</div>
      </div>
    </div>
    <div>
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;color:#3b3a36;">
        <div class="aboutContent" style="font-family:'Poppins',sans-serif;margin-left:50px;margin-right:50px;padding-top:25px;line-height:30px;font-size:12pt;">
          Genetic defects can affect our health, although in many cases they are not causing a disease, but merely an increased risk of disease. Other external factors (such as environment or our own lifestyle) influence the breaking out of the disease. If a person is, for example, lactose intolerant, due to a genetic defect, this person is perfectly healthy as long as she does not drink milk. Problems appear only in conjunction with certain environmental influences - in this case, eating or drinking products that contain lactose.<br><br>
          It is the same for other diseases as well. For example, if a regulatory gene for iron intake is defective, this can increase the risk of an iron assimilation disease, and pre-emptive measures are necessary in order to delay the apparition of the disease or even to stop its developments.<br><br>
          A healthy lifestyle is, of course, generally preferable, because it can neutralize many genetic predispositions even without additional information about your personal risks. However, genetic testing provides you with additional information, and as such, you will know what you should be particularly careful about, even if these preventative measures do not fall under the general guidelines of a healthy life.
        </div>
        <table class="geneticHealth">
          <thead>
            <tr><th>Response</th><th>Risk Level</th><th>Zone</th><th>Interpretation</th></tr>
          </thead>
          <tbody>
            <tr><td>Good</td><td>Low Risk</td><td style="background:linear-gradient(90deg,green,white);"></td><td style="text-align:left;">Response is good or Normal to the concerned category</td></tr>
            <tr><td>Average</td><td>Medium Risk</td><td style="background:linear-gradient(90deg,#f2ac26,white);"></td><td style="text-align:left;">Response is the Average to the concerned category, you need to take precaution it may affect you</td></tr>
            <tr><td>Bad</td><td>High Risk</td><td style="background:linear-gradient(90deg,red,white);"></td><td style="text-align:left;">Response is the Bad, You need to take it seriously, You have to work on this to avoid any risk</td></tr>
            <tr><td>*</td><td>-</td><td style="background:linear-gradient(90deg,#957ab1,white);"></td><td style="text-align:left;">Please check concerned recommendation.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ─── 7. Legal Disclaimer ─────────────────────────────────────
function legalPage(opts: PdfGeneratorOptions): string {
  const legalContent =
    opts.vendor?.legalContent ||
    `
    This report is based on your unique DNA results obtained by testing your buccal swabs or blood or saliva samples in response to a selection of key genes that are associated with the individual health. NMC Genetics provides genetic assessment services only for investigational purposes and the information thus given should be interpreted and used exclusively only by qualified medical practitioners, certified physicians, dieticians, nutritionist, sports therapists and others in similar professions. The company does not provide any medical advise and this report does not constitute a medical diagnostic report.<br><br>
    Genetic results are unique but being associated with a futuristic technology, the same must be used only under proper advice. NMC Genetics does not guarantee or in any way confirm any future disease or ailment associated with the genetic data disclosed in this report. For any contraindications you are advised to get supportive tests conducted from appropriate hospitals/laboratories.<br><br>
    Interpretation of genetic data is a matter of expert opinion. Before taking any action based on this report, you are advised to meet and seek the advice of a qualified medical / nutritionist / fitness practitioner /dermatologist or as the case may be a qualified expert of that field.`;
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">Legal Disclaimer</div>
      </div>
    </div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;color:#3b3a36;">
      <div class="aboutContent" style="font-family:'Poppins',sans-serif;font-size:12pt;margin-left:50px;margin-right:50px;padding-top:30px;line-height:22px;">
        ${legalContent}
      </div>
    </div>
  </div>`;
}

// ─── 8. Skin Cover ───────────────────────────────────────────
function skinCoverPage(opts: PdfGeneratorOptions): string {
  const img = opts.vendor?.skinCoverPageImg || `${SKIN_IMAGES}/7skinCover.jpg`;
  return `<div class="sheet" hidepageno style="background-image:url('${img}');"></div>`;
}

// ─── 9. Customer Profile ─────────────────────────────────────
function profilePage(opts: PdfGeneratorOptions): string {
  const p = opts.reportData.PatientDetails;
  const sd = opts.reportData.SampleDetails;
  const logoUrl = opts.vendor?.logoUrl || "";
  const signUrl = opts.vendor?.signatureUrl || "";

  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">Customer Profile & Test Profile</div>
      </div>
    </div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <table class="customertable" style="padding:70px 0 0 0;">
        <tbody>
          <tr><td>Patient Name</td><td>${p.name}</td></tr>
          <tr><td>Age (Years)</td><td>${p.age}</td></tr>
          ${p.weight ? `<tr><td>Weight(KG)</td><td>${p.weight}</td></tr>` : ""}
          <tr><td>Gender</td><td>${p.gender}</td></tr>
          ${p.height ? `<tr><td>Height(CM)</td><td>${p.height}</td></tr>` : ""}
          <tr><td>Patient ID</td><td>${p.patientId}</td></tr>
          <tr><td>Test ID</td><td>${sd.test || "SKIN-001"}</td></tr>
        </tbody>
      </table>
      <table class="customertable" style="padding:40px 0 0 0;">
        <tbody>
          <tr><td>Sample ID</td><td>${p.vendorSampleId || sd.vendorSampleId || ""}</td></tr>
          <tr><td>Sample Type</td><td>${p.sampleType || sd.sampleType || ""}</td></tr>
          <tr><td>Sample Collection Date</td><td>${p.sample_date ? formatDate(p.sample_date) : ""}</td></tr>
          <tr><td>Sample In Lab Date</td><td>${p.test_date ? formatDate(p.test_date) : ""}</td></tr>
          <tr><td>Report Generate Date</td><td>${p.report_date ? formatDate(p.report_date) : ""}</td></tr>
          ${p.referredBy ? `<tr><td>Referred By (Doctor)</td><td>${p.referredBy}</td></tr>` : ""}
          ${p.hospital ? `<tr><td>Referred By (Hospital)</td><td>${p.hospital}</td></tr>` : ""}
        </tbody>
      </table>
      ${signUrl ? `<img src="${signUrl}" style="max-height:80px;display:block;margin-top:20px;" alt="signature"/><p>${opts.vendor?.sigName || ""}</p><p>${opts.vendor?.sigTitle || ""}</p>` : ""}
    </div>
  </div>`;
}

// ─── 10. About Genetics ──────────────────────────────────────
function aboutGeneticsPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">About Genetics</div>
      </div>
    </div>
    <img src="${SKIN_REPORT}/9aboutGenetics.jpg" style="display:block;width:100%;height:200px;object-fit:cover;margin-top:15px;" alt="genetics"/>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <div class="gdeschead">What is a Gene?</div>
      <ul class="listgm">
        <li>A gene is the basic physical and functional unit of heredity. Genes are made up of DNA. Some genes act as instructions to make molecules called proteins. However, many genes do not code for proteins.</li>
        <li>In humans, genes vary in size from a few hundred DNA bases to more than 2 million bases. The Human Genome Project estimated that humans have between 20,000 and 25,000 genes.</li>
        <li>Every person has two copies of each gene, one inherited from each parent.</li>
      </ul>
      <div class="gdeschead">What is a DNA?</div>
      <ul class="listgm">
        <li>DNA (Deoxyribonucleic Acid), is the hereditary material in humans and almost all other organisms. Most DNA is located in the cell nucleus (where it is called nuclear DNA), but a small amount of DNA can also be found in the mitochondria (where it is called mitochondrial DNA or mtDNA).</li>
        <li>The information in DNA is stored as a code made up of four chemical bases: adenine (A) guanine(G), cytosine(C), and thymine (T).</li>
        <li>Human DNA consists of about 3 billion bases, and more than 99 percent of those bases are the same in all people. The order, or sequence, of these bases determines the information available for building and maintaining an organism, similar to the way in which letters of the alphabet appear in a certain order to form words and sentences.</li>
      </ul>
    </div>
  </div>`;
}

// ─── 11. Gene Mutation ───────────────────────────────────────
function geneMutationPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader"></div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <div class="gdeschead">What is a gene mutation and how do mutations occur?</div>
      <ul class="listgm">
        <li>A gene mutation is a permanent alteration in the DNA sequence that makes up a gene, such that the sequence differs from what is found in most people.</li>
        <li>Mutations range in size; they can affect anywhere from a single DNA building block (base pair to a large segment of a chromosome that includes multiple genes).</li>
        <li>Gene mutations can be classified in two major ways:
          <ul class="listgm">
            <li>Hereditary mutations (germline) are inherited from a parent and are present throughout a person's life in virtually every cell in the body.</li>
            <li>Acquired (somatic) mutations occur at some time during a person's life and are present only in certain cells, not in every cell in the body.</li>
          </ul>
        </li>
      </ul>
      <div class="gdeschead">What is Genetic testing?</div>
      <ul class="listgm">
        <li>Genetic testing is a type of medical test that identifies changes in chromosomes, genes, or proteins. The results of a genetic test can confirm or rule out a suspected genetic condition or help determine a person's chance of developing or passing on a genetic disorder.</li>
      </ul>
      <div class="gdeschead">What do the results of Genetic tests mean?</div>
      <ul class="listgm">
        <li>A positive test result means that the laboratory found a change in a particular gene, chromosome, or protein of interest. Depending on the purpose of the test, this result may confirm a diagnosis, indicate that a person is a carrier of a particular genetic mutation, identify an increased risk of developing a disease in the future, or suggest a need for further testing.</li>
        <li>A negative test result means that the laboratory did not find a change in the gene, chromosome, or protein under consideration. This result can indicate that a person is not affected by a particular disorder, is not a carrier of a specific genetic mutation, or does not have an increased risk of developing certain disease.</li>
      </ul>
    </div>
  </div>`;
}

// ─── 12. Table of Contents ───────────────────────────────────
function tableOfContentsPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="float:left;height:100%;background:url('${SKIN_IMAGES}/1coverInside.jpg');background-size:cover;width:calc(270px + 15px);min-height:297mm;">
      <div class="tabh" style="padding-left:15px;">Table of Contents</div>
    </div>
    <div class="rtabcontainer" style="width:430px;height:785px;float:left;margin-top:144px;margin-left:0;background-color:#524743;padding:13px 20px 10px 20px;">
      <div style="margin-top:5px;">A. Skin Altering Conditions</div>
      <div class="pd-40" style="margin-top:5px;">1. Oxidative Stress</div>
      <div class="pd-40">2. Inflamation Response</div>
      <div class="pd-40">3. Sugar Effect/Glycation</div>
      <div class="pd-40">4. Biological Age</div>
      <div class="pd-40">5. Skin Texture</div>
      <div class="pd-40">6. Cellulite Pre-disposition</div>
      <div class="pd-40">7. Stretch MarKs</div>
      <div class="pd-40">8. SKin Problems : Acne</div>
      <div class="pd-40">9. Sun Sensitivity & Photoageing</div>
      <div class="pd-40" style="margin-bottom:5px;">10. Pollution Effect</div>
      <div>B. Food Sensitivity and Intolerance</div>
      <div class="pd-40" style="margin-top:5px;">1. Caffeine Sensitivity</div>
      <div class="pd-40">2. Dairy Sensitivity</div>
      <div class="pd-40">3. Nicotine Sensitivity</div>
      <div class="pd-40">4. Alcohol Sensitivity</div>
      <div class="pd-40">5. Gluten Intolerance</div>
      <div class="pd-40" style="margin-bottom:5px;">6. Salt Sensitivity</div>
      <div>C. Skin Nutrients</div>
      <div class="pd-40" style="margin-top:5px;">1. Vitamin A</div>
      <div class="pd-40">2. Vitamin C</div>
      <div class="pd-40">3. Vitamin E</div>
      <div class="pd-40">4. Omega-3 Fatty Acid</div>
    </div>
  </div>`;
}

// ─── 13. Summary Page A ──────────────────────────────────────
function skinSummaryAPage(d: AdditionalData, rd: any): string {
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">Summary</div>
      </div>
    </div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <h3 style="text-align:left;color:#73644f;font-size:18pt;font-family:'Cabourg OT Regular','Poppins',sans-serif;">A. Skin Altering Conditions</h3>
      <table class="summarytab">
        <tbody>
          ${summaryRow("01", "5.png", "Oxidative Stress", d.osStatus || "")}
          ${summaryRow("02", "4.png", "Inflammation Response", d.irStatus || "")}
          ${summaryRow("03", "3.png", "Sugar Effect/Glycation", d.seStatus || "")}
          ${summaryRow("04", "7.png", "Biological Age", d.bioageStatus || "")}
          ${summaryRow("05", "4.png", "Skin Texture", d.stStatus || "")}
          ${summaryRow("06", "9.png", "Cellulite Pre-disposition", d.cpdStatus || "")}
          ${summaryRow("07", "8.png", "Stretch MarKs", rd?.stretchMarks?.[0]?.condition_status || "N/A")}
          ${summaryRow("08", "6.png", "Skin Problems : Acne", d.spAcneStatus || "")}
          ${summaryRow("09", "16.png", "Sun Sensitivity & Photoageing", d.sspStatus || "")}
          ${summaryRow("10", "17.png", "Pollution Effect", rd?.pollutionEffect?.[0]?.condition_status || "N/A")}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ─── 14. Summary Page B+C ────────────────────────────────────
function skinSummaryBCPage(d: AdditionalData, rd: any): string {
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">Summary</div>
      </div>
    </div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <h3 style="text-align:left;color:#73644f;font-size:18pt;font-family:'Cabourg OT Regular','Poppins',sans-serif;">B. Food Sensitivity and Intolerance</h3>
      <table class="summarytab">
        <tbody>
          ${summaryRow("01", "coffee.png", "Caffeine Sensitivity", rd?.caffeineSensitivity?.[0]?.condition_status || "N/A")}
          ${summaryRow("02", "dairy.jpg", "Dairy Sensitivity", rd?.dairy?.[0]?.condition_status || "N/A")}
          ${summaryRow("03", "nicotine.jpeg", "Nicotine Sensitivity", rd?.nicotine?.[0]?.condition_status || "N/A")}
          ${summaryRow("04", "alcohol.jpeg", "Alcohol Sensitivity", rd?.alcohol?.[0]?.condition_status || "N/A")}
          ${summaryRow("05", "gluten.jpeg", "Gluten Intolerance", d.gliStatus || "")}
          ${summaryRow("06", "salt.jpeg", "Salt Sensitivity", d.sasStatus || "")}
        </tbody>
      </table>
      <h3 style="text-align:left;color:#73644f;font-size:18pt;font-family:'Cabourg OT Regular','Poppins',sans-serif;">C. Skin Nutrients</h3>
      <table class="summarytab">
        <tbody>
          ${summaryRow("01", "11.png", "Vitamin A", rd?.vitaminA?.[0]?.condition_status || "N/A")}
          ${summaryRow("02", "12.png", "Vitamin C", rd?.vitaminC?.[0]?.condition_status || "N/A")}
          ${summaryRow("03", "13.png", "Vitamin E", rd?.vitaminE?.[0]?.condition_status || "N/A")}
          ${summaryRow("04", "15.png", "Omega-3", rd?.omega3?.[0]?.condition_status || "N/A")}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ─── 15. Role of Skin ────────────────────────────────────────
function roleOfSkinPage(): string {
  return `
  <div class="sheet" hidepageno style="background-color:#524743;font-family:'Poppins',sans-serif;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <div class="therole">The Role of Genetics &amp; Skin</div>
      <div class="roleContent">Scientists have found that genetics play an important role in determining the outcome of many features of our body such as eye color, hair color, height, and personality.</div>
      <div style="float:left;width:47%;font-family:'Poppins',sans-serif;font-size:10pt;line-height:25px;text-align:justify;color:#C2B09A;margin-top:15px;">Our genes, which are made up of DNA, determine the characteristics of our living bodies. Scientists have estimated the human body houses 20000-25000 different genes. They determine everything from the shape of our bodies to our ability to digest and process certain nutrients. With DNA affecting almost every aspect of our body, one may wonder what role it plays with our skin type.</div>
      <div style="float:right;width:47%;font-family:'Poppins',sans-serif;font-size:10pt;line-height:25px;text-align:justify;color:#C2B09A;margin-top:15px;">If we are genetically programmed to have more acne or drier skin than others, is it still something worth fighting? The answer is yes. Although our genes can affect our bodies drastically, the advancement of topical products and skin supplements along with lasers and cosmetic procedures can keep your skin become as healthy as someone with perfect genes.</div>
      <div style="text-align:justify;line-height:25px;padding:50px 0 0 0;clear:both;color:#C2B09A;">Your DNA can cause skin problems affecting tone and appearance along with more harmful disorders such as skin cancer by genetic mutations. When genes are working properly, they work to control your body's ability to produce new skin cells. When older skin cells die, your body needs to replace them. However, when a mutated gene does not function correctly, the message sent to your body to produce new skin cells could be lost. This can cause cells to grow at a rapid rate causing problems such as build-up of acne or early-age wrinkling.</div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// CONDITION PAGES  (A Section — Skin Altering Conditions)
// ═══════════════════════════════════════════════════════════════

function oxidativeStressPage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("5.png", "", "Skin Altering Conditions", "Oxidative Stress")}
      ${response(d.osStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Free radicals are highly reactive short-specimens that can impair any structure in our body, including the body's largest organ-'The Skin'. Free Radicals are caused by over exposing yourself to the sun, smoking, pollution, eating junk food excessively, too much exercise, alcohol, and even some medications. Oxidative stress occurs when you combine free radicals with oxygen and the free radicals are greater than the body's ability to detoxify them.`)}
      ${hedingdetailed("When oxidative stress occurs the free radicals can cause:")}
      ${aboutdetailpage(`<ul><li>Premature signs of ageing,</li><li>Uneven skin tone and texture,</li><li>Break down the essential proteins that support the skin causing sagging.</li></ul>`)}
      <div style="height:30px;"></div>
      ${hedingdetailed("Visible signs", "Internal signs")}
      ${imagefooter(`${SKIN_REPORT}/19.jpg`)}
      <hr class="line"/>
      <div class="lftonimg">
        <div>Dull &amp; Lifeless Skin</div><div>Irregular Pigmentation</div><div>Accelerated Ageing</div>
        <div>Rough Texture</div><div>Uneven Skintone</div><div>Excessive Dryness / Oiliness</div>
      </div>
      <div class="rgtonimg">
        <div>Premature Cell Death</div><div>Decresed Antioxidant Functioning</div>
        <div>Increased Free Radical Destruction</div><div>Increased Mitochondrial Damage</div>
      </div>
    </div>
  </div>`;
}

function oxidativeGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const os = conds["Oxidative Stress"] || conds["oxidativeStress"] || [];
  const genes = os[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "Superoxide dismutase2, mitochondria (SOD2) is a potent antioxidant enzyme, plays a key role by processing superoxide into less harmful products which can then be processed or cleared outside of the mitochondria, allowing continued mitochondria function and preventing damage.") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "The CAT gene produces an enzyme called catalase, which helps break down hydrogen peroxide, a substance that is very catoxic to our cells, into water and oxygen.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.osRecom || os[0]?.recommendation || "", d.osLifeStyle || os[0]?.lifestyle || "", d.osMiscell || os[0]?.miscellaneous || "")}
    ${right_column("01")}
  </div>`;
}

function inflammationPage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("4.png", "", "Skin Altering Conditions", "Inflammation Response")}
      ${response(d.irStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Inflammation is a biological response of the immune system that can be triggered by a variety of factors, including pathogens, damaged cells and toxic compounds. Both infectious and non-infectious agents and cell damage activate inflammatory cells and trigger inflammatory signaling pathways.<br><br>In Skin, inflammation come in many forms, from occasional rashes accompanied by skin itching and redness, to chronic conditions such as dermatitis (eczema), rosacea, seborrheic dermatitis, and psoriasis. Skin inflammation can be characterized as acute or chronic`)}
      <div style="height:70px;"></div>
      ${hedingdetailed("Visible signs", "Internal signs")}
      ${imagefooter(`${SKIN_REPORT}/18.png`)}
      <hr class="line"/>
      <div class="lftonimg" style="top:700px;line-height:40px;">
        <div>Dryness</div><div>Chemical Sensitivity</div><div>Itching &amp; Redness</div>
        <div>Rashes &amp; Swelling</div><div>Environment Sensitivity</div>
      </div>
      <div class="rgtonimg" style="top:700px;line-height:40px;">
        <div>Irregular Tissue Healing</div><div>Overactive Inflammatory Signaling</div>
        <div>Reduced Detoxification Processors</div>
      </div>
    </div>
  </div>`;
}

function inflammationGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const ir =
    conds["Inflammation Response"] || conds["inflammationResponse"] || [];
  const genes = ir[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "Interleukin-6 (IL-6) is an inflammatory cytokine, released by cells of the immune system during infection in order to attract other immune cells, to help combat infection.") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "This gene encodes adenosine deaminase domain containing. ADAD1 has several biochemical functions.") : ""}
          ${genes[2] ? skin_gene(genes[2].status, genes[2].name, genes[2].report_variant || "", "Tumor necrosis factor (TNF) is a cell signaling protein involved in systemic inflammation and is one of the cytokines that make up the acute phase reaction. TNF is a major player when it comes to inflammation.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.irRecom || ir[0]?.recommendation || "", d.irLifeStyle || ir[0]?.lifestyle || "", d.irMiscell || ir[0]?.miscellaneous || "")}
    ${right_column("02")}
  </div>`;
}

function glycationPage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("3.png", "", "Skin Altering Conditions", "Sugar Effect/ Glycation")}
      ${response(d.seStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Our body uses glucose as the main source of energy, but if it is not properly metabolized, it can bind to the collagen and elastin fibers and modify them both structurally and functionally. The resulting products are known as advanced glycation products (AGEs). This process called glycation is involved in the ageing of the skin and damages its ability to regenerate and self-repair.`)}
      <div style="height:60px;"></div>
      ${hedingdetailed("Visible signs", "Internal signs")}
      ${imagefooter(`${SKIN_REPORT}/23.jpg`, 400)}
      <hr class="line"/>
      <div class="lftonimg" style="top:640px;line-height:50px;">
        <div>Heavy Wrinkles &amp; Folds</div><div>Accelerated Ageing</div><div>Uneven Skin Texture</div>
        <div>Pillowing of the Skin</div><div>Cracking &amp; Thinning Skin</div>
      </div>
      <div class="rgtonimg" style="top:640px;line-height:50px;">
        <div>Decreased Elasticity</div><div>Weak Dermal Epidermal Junction</div>
        <div>Collagen Cross Linking</div><div>Hardened Collagen Fibers</div>
      </div>
    </div>
  </div>`;
}

function glycationGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const se = conds["Sugar Effect"] || conds["sugarEffect"] || [];
  const genes = se[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The AGER gene advanced glycosylation end product receptor protein, a member of the immunoglobulin superfamily of cell surface receptors. This gene involved in homeostasis, development, and inflammation, and certain diseases") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "Glyoxalase 1 enzyme (GL01) that protects cells from AGEs can lower their activity which leads to the build-up of AGEs. This process, called glycation, is responsible in accelerated ageing of the skin as it impairs skin's ability to regenerate and self-repair.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.seRecom || se[0]?.recommendation || "", d.seLifeStyle || se[0]?.lifestyle || "", d.seMiscell || se[0]?.miscellaneous || "")}
    ${right_column("03")}
  </div>`;
}

function biologicalAgePage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("7.png", "", "Skin Altering Conditions", "Biological Age")}
      ${response(d.bioageStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Biological age, also referred to as physiological age, takes many lifestyle factors into consideration, including diet, exercise and sleeping habits, to name a few. Research suggests that telomeres and DNA methylation play big parts in the ageing process. Telomeres are the nucleotides on the ends of chromosomes. They keep the ends of chromosomes from deteriorating and fusing with a nearby chromosome. Essentially, telomeres dictate how quickly cells age and die.<br><br>As we age our telomeres gradually get shorter and shorter. This is like the sand in the hourglass ticking away the years of our lives. When our telomeres get too short our DNA is no longer protected.`)}
      ${hedingdetailed("How to Reverse Your Biological Age?")}
      <div style="text-align:right;">${imagefooter(`${SKIN_REPORT}/26.jpg`, 280, 10)}</div>
      <div class="lftonimg" style="top:604px;width:260px;line-height:25px;left:-19px;font-size:14px;">
        <ol>
          <li>Manage stress to save ten years of your telomeres.</li>
          <li>Exercise to take ten years of your telomeres.</li>
          <li>Eat a healthy diet to reverse telomere ageing by five years.</li>
          <li>Maintain an ideal weight to lengthen telomeres by nine years.</li>
          <li>Sleep at least 7-8 hours to reverse telomere old age.</li>
          <li>Avoid loneliness for optimal telomere health.</li>
        </ol>
      </div>
    </div>
  </div>`;
}

function biologicalAgeGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const ba = conds["Biological Age"] || conds["biologicalAge"] || [];
  const genes = ba[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Genetic Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "This gene encodes telomerase reverse transcriptase, that plays a role in cellular senescence and chromosomal repair.") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "This gene encodes peroxisome proliferator-activated receptor gamma protein, regulates adipocyte differentiation PPARG and energy metabolism.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.bioageRecom || ba[0]?.recommendation || "", d.bioageLifeStyle || ba[0]?.lifestyle || "", d.bioageMiscell || ba[0]?.miscellaneous || "")}
    ${right_column("04")}
  </div>`;
}

function skinTexturePage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("10.png", "", "Skin Altering Conditions", "Skin Texture")}
      ${response(d.stStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Skin is 'dynamic', it is constantly being broken down and rebuilt in response to external and internal stimuli (e.g. sunlight and metabolic oxidation). Skin surface appearance is determined by the elasticity and resilience of the underlying protein fibre structure, mainly cross-linked collagen and elastin fibres. The genes we test include collagen, elastin and enzymes involved in the delicate remodelling process.`)}
      ${hedingdetailed("a. Collagen Breakdown")}
      ${aboutdetailpage(`Skin elasticity is the skin's ability to stretch and revert to its original form without developing wrinkles and imperfections. It is determined by collagen that makes upto 75 percent of our skin. Your skin's smoothness, firmness and elasticity depend on the balance between collagen synthesis and its breakdown.`)}
      ${hedingdetailed("b. Collagen Production")}
      ${aboutdetailpage(`Collagen is the most common protein found in the body. When collagen levels are healthy, cells that contain collagen take on strong and youthful appearance. The interesting thing about collagen is that stimulating its growth causes a domino effect. The more collagen you have, the more your body is able to produce &amp; maintain.`)}
      ${hedingdetailed("c. Elasticity &amp; distensibility")}
      ${aboutdetailpage(`Elastin is another kind of protein in the body. Elastin is found in places in the body that contract, such as arteries and lungs. This is because of elastin's outstanding characteristic: the ability to snap back into place and maintain its original shape. Elastin and collagen are both proteins found in skin. They work together to give skin its texture and shape.`)}
    </div>
  </div>`;
}

function skinTextureGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const st = conds["Skin Texture"] || conds["skinTexture"] || [];
  const genes = st[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "Matrix metalloproteinase-increased expression of the enzyme which may cause increased collagen breakdown. Various antioxidants such as astaxanthin have been shown to reduce MMP1 expression and can be useful for maintaining skin health") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "COL1A1, variation leads to increased production of collagen all relative to collagen a 2, altering the ratios of fibre types which can affect skin integrity.") : ""}
          ${genes[2] ? skin_gene(genes[2].status, genes[2].name, genes[2].report_variant || "", "ELN gene encodes a protein that is one of the two components of elastic fibers & is associated with reduced elasticity and distensibility, especially after middle-age, from around 50 yrs old.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.stRecom || st[0]?.recommendation || "", d.stLifeStyle || st[0]?.lifestyle || "", d.stMiscell || st[0]?.miscellaneous || "")}
    ${right_column("05")}
  </div>`;
}

function cellulitePage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("9.png", "", "Skin Altering Conditions", "Cellulite Pre-disposition")}
      ${response(d.cpdStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Cellulite, also known as orange peel skin, refers to the bumpy appearance of skin due to uneven fibrous tissue and fat build-up (subcutaneous fat) underneath the upper skin layers. Cellulite mainly appears on the thighs, hips, and buttocks. Genetic predisposition, hormonal changes, gender, ethnicity, age and weight changes contribute to risks of developing cellulite.`)}
      <div style="height:100px;"></div>
      ${imagefooter(`${SKIN_REPORT}/24.jpg`)}
    </div>
  </div>`;
}

function celluliteGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const cpd = conds["Cellulite Pre-Disposition"] || conds["cellulite"] || [];
  const genes = cpd[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "HIF1A, Hypoxia Inducible Factor1 Subunit Alpha gene have been associated with the risks of developing cellulite") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "Angiotensin Converting Enzyme (ACE) genes have been associated with the risks of developing cellulite. Cellulite is a condition that is characterized by a dimpling, puckering or 'orange' peel appearance of the skin") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.cpdRecom || cpd[0]?.recommendation || "", d.cpdLifeStyle || cpd[0]?.lifestyle || "", d.cpdMiscell || cpd[0]?.miscellaneous || "")}
    ${right_column("06")}
  </div>`;
}

function stretchMarksPage(conds: Record<string, ConditionData[]>): string {
  const sm = conds["Stretch Marks"] || conds["stretchMarks"] || [];
  const status = sm[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("8.png", "", "Skin Altering Conditions", "Stretch Marks")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Stretch marks, also known as striae distensae, appear initially as red or purple lines on the skin and later as white or silver lines. Mechanical stretching of the skin due to weight loss-regain, obesity, hormonal changes and pregnancy can cause stretch marks.`)}
      <div style="height:100px;"></div>
      ${imagefooter(`${SKIN_REPORT}/25.jpg`)}
    </div>
  </div>`;
}

function stretchMarksGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const sm = conds["Stretch Marks"] || conds["stretchMarks"] || [];
  const genes = sm[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "Transmembrane protein 18 also known as TMEM18, is also associated with risk of developing stretch marks. Previously linked to obesity, is the potential effect of genes associated with obesity on the development of stretch marks, both independent of and via changes in BMI") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(sm[0]?.recommendation || "N/A", sm[0]?.lifestyle || "N/A", sm[0]?.miscellaneous || "N/A")}
    ${right_column("07")}
  </div>`;
}

function acnePage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("6.png", "", "Skin Altering Conditions", "Skin Problems : Acne")}
      ${response(d.spAcneStatus || "")}
      ${hedingdetailed("ACNE : About the condition")}
      ${aboutdetailpage(`Acne is a common skin condition, affecting sebaceous glands near the surface of the skin which produce sebum- an oily substance used to lubricate the hair and keep skin from drying out. When too much sebum is produced, the skin follicles can become clogged, resulting in inflammation and the formation of red spots. While symptoms are physical, the occurrence of acne can cause emotional distress and lead to social anxiety and isolation. It is estimated that up to 80% of the population are affected at some stage of life.`)}
      ${hedingdetailed("Visible signs", "Symptoms")}
      ${imagefooter(`${SKIN_REPORT}/21.jpg`, 410)}
      <hr class="line"/>
      <div class="lftonimg" style="top:640px;line-height:50px;">
        <div>Redness</div><div>Dull Skin</div><div>Dehydrated Skin</div>
      </div>
      <div class="rgtonimg" style="top:640px;line-height:50px;">
        <div>Irregular Skin Texture</div><div>Enlarged Pores</div><div>Oily Skin</div>
      </div>
    </div>
  </div>`;
}

function acneGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const acne = conds["Acne"] || conds["acne"] || [];
  const genes = acne[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "This gene encodes transforming growth factor beta protein has important role in the formation of blood vessels, the regulation of muscle tissue and body fat development, wound healing, and immune system function.") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "This gene encodes selectin L protein, a cell surface adhesion molecule that belongs to a family of adhesion/homing receptors. Involved in binding and subsequent rolling of leucocytes on endothelial cells, facilitating their migration into secondary lymphoid organs and inflammation sites.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.spAcneRecom || acne[0]?.recommendation || "", d.spAcneLifeStyle || acne[0]?.lifestyle || "", d.spAcneMiscell || acne[0]?.miscellaneous || "")}
    ${right_column("08")}
  </div>`;
}

function sunSensitivityPage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("16.png", "", "Skin Altering Conditions", "Sun Sensitivity &amp; Photoageing")}
      ${response(d.sspStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Humans vary over 1000-fold in their sensitivity to the harmful effects of ultraviolet radiation. Skin pigmentation, tanning ability, and sensitivity to sun have high heritability. Several large-scale studies identified genetic variations that affect our skin sensitivity and tendency to get sun burns.<br><br>Photoageing refers to ageing of the skin as a result of exposure to ultraviolet (UV) radiation over a person's lifetime. Although photoageing is affected by extrinsic (environmental) factors like gravity or smoking, all skin is susceptible to photoageing with UV exposure.<br><br>With age, the repeated UV exposure causes melanin, a compound responsible for pigmentation as well as protecting the skin, to cluster or clump together, forming an area of hyper-pigmentation.`)}
      ${hedingdetailed("Visible signs", "Internal signs")}
      ${imagefooter(`${SKIN_REPORT}/20.jpg`)}
      <hr class="line"/>
      <div class="lftonimg">
        <div>Blemishes &amp; Freckles</div><div>Uneven Skin Texture</div><div>Redness</div>
        <div>Broken Capillaries</div><div>Thinning Skin &amp; Fine Lines</div><div>Rough Surface Area</div>
      </div>
      <div class="rgtonimg">
        <div>UV Radical Damage</div><div>DNA Damage</div><div>Irregular Cellular Function</div>
        <div>Irregular Melanin Production</div><div>Increased Mitochondria Damage</div>
      </div>
    </div>
  </div>`;
}

function sunSensitivityGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const ssp =
    conds["Sun Sensitivity & Photoaging"] || conds["sunSensitivity"] || [];
  const genes = ssp[0]?.gene || [];
  const descs = [
    "This gene is highly similar to the mouse gene and encodes a secreted protein that may (1) affect the quality of hair pigmentation, (2) act as a pharmacological antagonist of alpha-melanocyte-stimulating hormone.",
    "DBNDD1, Belongs to the dysbindin family. Dysbindin constituent of the dystrophin-associated protein complex (DPC) of skeletal muscle cells. It is also a part of BLOC-1, or biogenesis of lysosome-related organelles complex 1.",
    "LOC105374875 (Uncharacterized LOC105374875) is an RNA Gene, and is affiliated with the ncRNA class.",
    "Members of the F-box protein family, such as FBXO40, are characterized by an approximately 40-amino acid F-box motif. SCF complexes act as protein-ubiquitin ligases.",
    "The MC1R gene provides instructions for making a protein called the melanocortin 1 receptor. This receptor plays an important role in normal pigmentation.",
    "Plays a role in vesicle trafficking and exocytosis inhibition. In pancreatic beta-cells, inhibits insulin secretion probably by interacting with and regulating STX1A and STX4.",
  ];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile | Sun Sensitivity and Photoageing")}
          ${genes.map((g, i) => skin_gene(g.status, g.name, g.report_variant || "", descs[i] || "")).join("")}
        </td></tr>
      </table>
    </div>
    ${right_column("09")}
  </div>`;
}

function sunSensitivityRecommPage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const ssp =
    conds["Sun Sensitivity & Photoaging"] || conds["sunSensitivity"] || [];
  return `
  <div class="sheet" style="background:white;">
    <div style="height:50px;"></div>
    ${recommendation(d.sspRecom || ssp[0]?.recommendation || "", d.sspLifeStyle || ssp[0]?.lifestyle || "", d.sspMiscell || ssp[0]?.miscellaneous || "", "footerM1")}
  </div>`;
}

function blankPage(): string {
  return `<div class="sheet" style="background-color:#fef6e3;"></div>`;
}

function pollutionEffectPage(conds: Record<string, ConditionData[]>): string {
  const pe = conds["Pollution Effect"] || conds["pollutionEffect"] || [];
  const status = pe[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("17.png", "", "Skin Altering Conditions", "Pollution Effect")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Pollution is the cause of increased signs of ageing, dark spots, and inflammation. Dermatologist Association has found that those living in highly polluted areas (i.e. big cities) age 10 times faster than those who live in the country side. Some genes protect our bodies from systemic absorption of highly reactive foreign chemicals (epoxides and quinones) from within the epidermis (most superficial layer of our skin) called Pollution Defense Impairment.`)}
      <div style="height:40px;"></div>
      ${hedingdetailed("Visible signs", "Symptoms")}
      <div style="margin-left:-35px;">
        <img src="${SKIN_REPORT}/22.jpg" style="height:500px;object-fit:cover;" alt="img"/>
      </div>
      <hr class="line"/>
      <div class="lftonimg" style="top:640px;line-height:50px;">
        <div>Pale Skin</div><div>Patchy Skin</div><div>Acne</div>
        <div>Dehydrated Skin</div><div>Brown Spots</div>
      </div>
      <div class="rgtonimg" style="top:640px;line-height:50px;">
        <div>Enlarged Pores</div><div>Sensitive, Redness Prone Skin</div>
        <div>Uncomfortably Dry, Itchy Skin</div><div>Wrinkles</div>
      </div>
    </div>
  </div>`;
}

function pollutionGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const pe = conds["Pollution Effect"] || conds["pollutionEffect"] || [];
  const genes = pe[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "NQO1 converts coenzyme Q10 (ubiquinone) to its reduced form, ubiquinol, which scavenges free radicals in the mitochondria and skin lipid membrane. The coenzyme Q10 reductase is involved in detoxifying quinones, allowing them to be safely reduced and excreted.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(pe[0]?.recommendation || "N/A", pe[0]?.lifestyle || "N/A", pe[0]?.miscellaneous || "N/A")}
    ${right_column("10")}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// B SECTION — Food Sensitivity
// ═══════════════════════════════════════════════════════════════
function caffeinePage(conds: Record<string, ConditionData[]>): string {
  const c = conds["Caffeine Sensitivity"] || conds["caffeineSensitivity"] || [];
  const status = c[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("coffee.png", "", "Food Sensitivity and Intolerance", "Caffeine Sensitivity")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`It refers to how much affect caffeine has on our bodies. It depends on various factors namely age, sex and genetics. People with caffeine sensitivity may experience symptoms like headache, anxiety, palpitations, insomnia etc. In females it is majorly it may be strongly modulated by pregnancy and contraceptive usage.`)}
      ${hedingdetailed("HOW DOES CAFFEINE AFFECT YOUR SKIN")}
      ${aboutdetailpage(`<ul class="contentList">
        <li>Research has shown that caffeine can impair mineral absorption from our foods, which in turn can show harmful effects on skin. Our skin stays happy and it glows when we are properly absorbing vitamins and nutrients. So anyone with skin problems like acne or patches should stay away from caffeine as it may hamper the absorption of minerals like selenium, zinc and iron.</li>
        <li>Excess caffeine dehydrates your system. And dehydration may lead to faster ageing, collagen breakdown, uneven skin texture and diminishing glow of the face. So do not prefer more than 2-3 cups of tea or coffee per day. Limit your caffeine intake to not more than 200mg/day.</li>
        <li>Caffeine makes you feel alert and awake but also leads to a heightened stress response in the body. Stress hormones, such as cortisol, may increase the amount of oil produced by your sebaceous glands, meaning you can be more prone to breakouts.</li>
      </ul>`)}
      ${hedingdetailed("VISIBLE AND INTERNAL SIGNS")}
      ${aboutdetailpage(`<ul class="contentList"><li>Dehydrated or Dull Skin</li><li>Patchy Skin</li><li>Dark Spots</li></ul>`)}
    </div>
  </div>`;
}

function caffeineGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const c = conds["Caffeine Sensitivity"] || conds["caffeineSensitivity"] || [];
  const genes = c[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "This gene encodes a member of the cytochrome P450 superfamily of enzymes. The cytochrome P450 proteins are monooxygenases which catalyze many reactions involved in drug metabolism and synthesis of cholesterol, steroids and other lipids.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(c[0]?.recommendation || "N/A", c[0]?.lifestyle || "N/A", c[0]?.miscellaneous || "N/A")}
    ${right_columnB("01")}
  </div>`;
}

function dairyPage(conds: Record<string, ConditionData[]>): string {
  const d = conds["Dairy"] || conds["dairy"] || [];
  const status = d[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("dairy.jpg", "", "Food Sensitivity and Intolerance", "Dairy Sensitivity")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`A common lactose intolerance can also affect the immune system leading to more inflammatory responses in the body. Your eyes can become puffy and bags more pronounced.`)}
      ${hedingdetailed("HOW LACTOSE AFFECT THE SKIN HEALTH")}
      ${aboutdetailpage(`<p>The estrogen and progesterone hormones in milk cause your skin cells to over-produce which block pores, bind with sebum and cause spots.</p><p>Milk contains androgen hormones, which have long been associated with the formation of acne breakouts. Testosterone is an androgen hormone, and it is strongly linked to acne development.</p>`)}
      ${hedingdetailed("VISIBLE AND INTERNAL SIGNS")}
      ${aboutdetailpage(`<ul class="contentList"><li>Swollen Eye Lids</li><li>Widespread Acne and Spots</li><li>Bags and Dark Circles Under Eye</li><li>Pale Cheeks</li><li>Concentrated Spots on Chins</li></ul>`)}
    </div>
  </div>`;
}

function dairyGeneProfilePage(conds: Record<string, ConditionData[]>): string {
  const d = conds["Dairy"] || conds["dairy"] || [];
  const genes = d[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The protein encoded by this gene belongs to the glycosyl hydrolase 1 family of proteins. Mutations in this gene are associated with congenital lactase deficiency. Polymorphisms in this gene are associated with lactase persistence.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d[0]?.recommendation || "N/A", d[0]?.lifestyle || "N/A", d[0]?.miscellaneous || "N/A")}
    ${right_columnB("02")}
  </div>`;
}

function nicotinePage(conds: Record<string, ConditionData[]>): string {
  const n = conds["Nicotine"] || conds["nicotine"] || [];
  const status = n[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("nicotine.jpeg", "", "Food Sensitivity and Intolerance", "Nicotine Sensitivity")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`<p>Its excessive usage leads to oxidative stress due to which insufficient oxygen is supplied to the skin resulting in tissue ischemia and blood vessel occlusion. It reduces innate and host immune responses, and induces metallo-proteinase MMP-1, an enzyme that specifically degrades collagen.</p><ul class="contentList"><li>It delays wound healing and accelerates skin ageing.</li><li>Some of the toxins in cigarette smoke damage the collagen and elastin of the skin which helps to keep the skin supple and firm.</li><li>Excess nicotine leads to crow's feet, a type of wrinkling at the outer edges of eye.</li><li>It causes sagging of skin due to breakdown of collagen and elastin.</li><li>It causes inflammation of skin, thus causing a type of skin disorders called as Acne inversa.</li></ul>`)}
      ${hedingdetailed("VISIBLE AND INTERNAL SIGNS")}
      ${aboutdetailpage(`<ul class="contentList"><li>Grey or Dull Complexion</li><li>Dark Circles</li><li>Dry Skin</li><li>Acne</li><li>Skin Cancer</li><li>Loss of Collagen</li><li>Lines and Wrinkles</li></ul>`)}
    </div>
  </div>`;
}

function nicotineGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const n = conds["Nicotine"] || conds["nicotine"] || [];
  const genes = n[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("PREVENTIVE MEASURES")}
          ${aboutdetailpage(`<ul class="contentList"><li>Try quitting it as soon as possible.</li><li>Eat plenty of fruit, vegetables, and healthy fats. Avoid sugary food, sodas, fried, and junk food.</li><li>Drink at least 2-2.5 liters of water as it will help flush toxins from your body.</li><li>Exercise and maintain your ideal body weight.</li></ul>`)}
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The COMT gene provides instructions for making an enzyme called catechol-O-methyltransferase. In the brain, catechol-O-methyltransferase helps break down certain chemical messengers called neurotransmitters. These chemicals conduct signals from one nerve cell to another.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(n[0]?.recommendation || "N/A", n[0]?.lifestyle || "N/A", n[0]?.miscellaneous || "N/A")}
    ${right_columnB("03")}
  </div>`;
}

function alcoholPage(conds: Record<string, ConditionData[]>): string {
  const a = conds["Alcohol"] || conds["alcohol"] || [];
  const status = a[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("alcohol.jpeg", "", "Food Sensitivity and Intolerance", "Alcohol Sensitivity")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Alcohol or alcoholic beverages are non-essential to our body that primarily consists of water, alcohol (ethanol), and different amounts of sugar. The calories come from the alcohol and sugar and are considered 'empty calories' because of the lack of the other essential nutrients.<ul class="contentList"><li>Alcohol is dehydrating which worsens lines and wrinkles and causes inflammation as well.</li><li>It can cause capillaries to dilate resulting in flushed cheeks. Excess alcohol also alters blood flow to the skin and leaves an unhealthy appearance for days.</li><li>It causes inflammation that can increase the risk of rosacea and acne flare ups.</li><li>Filling your body with the empty calories and sugars that many of your happy hour drinks are filled with can actually lead to malnutrition, which can have an obvious impact on your complexion.</li></ul>`)}
      ${hedingdetailed("VISIBLE AND INTERNAL SIGNS")}
      ${aboutdetailpage(`<ul class="contentList"><li>Pronounced Lines or Redness between the Eyes</li><li>Droopy Eyelids</li><li>Enlarged Pores</li><li>Dehydrated Skin with Feathery Lines Across Cheeks</li><li>Reddish Cheeks and Nose</li><li>Deep Nasolabial Folds</li><li>Puffiness</li></ul>`)}
    </div>
  </div>`;
}

function alcoholGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const a = conds["Alcohol"] || conds["alcohol"] || [];
  const genes = a[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("PREVENTIVE MEASURES")}
          ${aboutdetailpage(`<ul class="contentList"><li>Avoid alcohol consumption on a regular basis.</li><li>Moderation is key.</li></ul>`)}
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The protein encoded by this gene is a member of the alcohol dehydrogenase family. Members of this enzyme family metabolize a wide variety of substrates, including ethanol, retinol, other aliphatic alcohols, hydroxysteroids, and lipid peroxidation products.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(a[0]?.recommendation || "N/A", a[0]?.lifestyle || "N/A", a[0]?.miscellaneous || "N/A")}
    ${right_columnB("04")}
  </div>`;
}

function glutenPage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const g = conds["Gluten Intolerance"] || conds["glutenIntolerance"] || [];
  const status = d.gliStatus || g[0]?.condition_status || "N/A";
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("gluten.jpeg", "", "Food Sensitivity and Intolerance", "Gluten Intolerance")}
      ${response(status)}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Gluten (from Latin gluten, 'glue') is a group of proteins, called prolamins and glutelins, which occur with starch in the endosperm of various cereal grains. Its majorly present in wheat, barley, rye, spelt and oats.`)}
      ${hedingdetailed("How does gluten affect the skin?")}
      ${aboutdetailpage(`<ul class="contentList"><li>It is an inflammatory food that has high glycemic load and increases the insulin level in the body.</li><li>It has direct impact on collagen levels and may cause premature ageing.</li><li>It converts into sugars rapidly in blood stream and elevated insulin is linked to increased sebum production that can cause clogged pores and acne breakouts.</li><li>It hampers the body's ability to digest Vitamin A and E, both of which helps to keep our skin hydrated and firm.</li><li>The gluten present specifically in wheat can exert age-advancing skin effects such as wrinkles and lost elasticity through formation of AGEs.</li></ul>`)}
      ${hedingdetailed("VISIBLE AND INTERNAL SIGNS")}
      ${aboutdetailpage(`<ul class="contentList"><li>Spots on the Forehead</li><li>Puffy Red Cheeks and Jowls</li><li>Redness on Cheeks</li><li>Dark Pigmentation Patches or Spots Around Chin</li></ul>`)}
    </div>
  </div>`;
}

function glutenGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const g = conds["Gluten Intolerance"] || conds["glutenIntolerance"] || [];
  const genes = g[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          <div style="min-height:140px;margin-bottom:20px;">
            <div style="float:left;width:119px;">
              ${genes[0] ? `<div class="geno" style="position:relative;padding-left:27px;padding-top:27px;width:88px;height:88px;"><div>Gene</div><div>${genes[0].name}</div><div class="status" style="top:2px;left:96px;background:${getCircleColor(genes[0].status)};"></div></div>` : ""}
              ${genes[1] ? `<div class="geno" style="position:relative;padding-left:27px;padding-top:27px;width:88px;height:88px;"><div>Gene</div><div>${genes[1].name}</div><div class="status" style="top:2px;left:96px;background:${getCircleColor(genes[1].status)};"></div></div>` : ""}
            </div>
            <div style="position:relative;top:0;width:75%;float:left;font-size:10pt;">
              <h2 class="fheading">Genotype | ${genes[0]?.report_variant || ""} (${genes[0]?.name || ""}) | ${genes[1]?.report_variant || ""} (${genes[1]?.name || ""})</h2>
              <p>HLA-DQ2 (DQ2) is a serotype group within HLA-DQ (DQ) serotyping system. The serotype is determined by the antibody recognition of β2 subset of DQ β-chains. HLA-DQ2 develops celiac disease — the gene is present in more than 30% of the U.S. population (mainly those with northern European genetic heritage), but only about 1% of Americans actually have celiac disease.</p>
            </div>
            <div style="clear:both;"></div>
          </div>
        </td></tr>
      </table>
    </div>
    ${recommendation(d.gliRecom || g[0]?.recommendation || "N/A", d.gliLifeStyle || g[0]?.lifestyle || "N/A", d.gliMiscell || g[0]?.miscellaneous || "N/A")}
    ${right_columnB("05")}
  </div>`;
}

function saltPage(d: AdditionalData): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("salt.jpeg", "", "Food Sensitivity and Intolerance", "Salt Sensitivity")}
      ${response(d.sasStatus || "")}
      ${hedingdetailed("About the condition")}
      ${aboutdetailpage(`Salt also known as "table salt" or "rock salt" is made up of sodium chloride (40:60). It is naturally found in sea water and accounts for about 3.5 percent of the world's oceans. It is more than just being a condiment when we talk about the beauty regime.`)}
      ${hedingdetailed("How does salt affect your skin")}
      ${aboutdetailpage(`Many beauty products have salt as their constituent as it has proven to be beneficial for replenishing the minerals in your skin. Besides feeding minerals to your skin, it helps to lock in hydration and creates a layer of protection so it won't be easily prone to damage.<ul class="contentList"><li>Salt has cleansing and antiseptic properties as well, so incorporating it as part of your skin care can aid in eliminating bacteria and harmful toxins.</li><li>One should be careful in using salt in moderate amounts as excess of it may lead to dehydration of skin. Too much salt otherwise can make you feel fluffy and bloated and may result in appearance of eye bags.</li><li>Excessive sodium can make your skin dehydrated, which can lead to your skin producing too much oil to compensate for the dryness. This in turn may cause acne breakouts.</li></ul>`)}
      ${hedingdetailed("VISIBLE AND INTERNAL SIGNS")}
      ${aboutdetailpage(`<ul class="contentList"><li>Puffy Eyes</li><li>Dehydrated Skin</li><li>Pale Skin</li><li>Eye Bags</li><li>Flaky Skin</li></ul>`)}
    </div>
  </div>`;
}

function saltGeneProfilePage(
  d: AdditionalData,
  conds: Record<string, ConditionData[]>,
): string {
  const s = conds["Salt Sensitivity"] || conds["saltSensitivity"] || [];
  const genes = s[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The ACE gene provides instructions for making the angiotensin-converting enzyme. This enzyme is able to cut (cleave) proteins. It is part of the renin-angiotensin system, which regulates blood pressure and the balance of fluids and salts in the body.") : ""}
          ${genes[1] ? skin_gene(genes[1].status, genes[1].name, genes[1].report_variant || "", "The AGT gene provides instructions for making a protein called angiotensinogen. This protein is part of the renin-angiotensin system, which regulates blood pressure and the balance of fluids and salts in the body.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(d.sasRecom || s[0]?.recommendation || "N/A", d.sasLifeStyle || s[0]?.lifestyle || "N/A", d.sasMiscell || s[0]?.miscellaneous || "N/A")}
    ${right_columnB("06")}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// C SECTION — Skin Nutrients
// ═══════════════════════════════════════════════════════════════
function vitaminAPage(conds: Record<string, ConditionData[]>): string {
  const v = conds["Vitamin A"] || conds["vitaminA"] || [];
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("11.png", "", "Skin Nutrients", "Vitamin A")}
      ${response(v[0]?.condition_status || "N/A")}
      ${hedingdetailed("Vitamin A")}
      ${aboutdetailpage(`<ul class="nutritionsec"><li>Vitamin A is critical for skin repair and maintenance.</li><li>If you suffer from flaky or dry skin, it could be a sign you're deficient in vitamin A.</li><li>Beta-carotene, the precursor to vitamin A, is an antioxidant found in brightly colored foods.</li><li>This antioxidant helps to reduce free radical damage that occurs due to skin damage caused by sun over exposure.</li></ul>`)}
      <div style="height:40px;"></div>
      ${hedingdetailed("Food Sources")}
      <table class="tableNutrients">
        <thead><tr><th>Food Sources</th><th>Amount</th><th>Nutrition Value</th></tr></thead>
        <tbody>
          <tr><td>Carrots</td><td>1 cup raw sliced</td><td>21,384lU</td></tr>
          <tr><td>Sweet Potato</td><td>1 whole</td><td>18,443lU</td></tr>
          <tr><td>Spinach</td><td>1 cup raw</td><td>2,813lU</td></tr>
          <tr><td>Apricots</td><td>1 Fruit</td><td>674lU</td></tr>
          <tr><td>Butter</td><td>1 tbsp</td><td>355lU</td></tr>
          <tr><td>Eggs</td><td>1 extra-large</td><td>302lU</td></tr>
          <tr><td>Tuna Fish</td><td>3 ounce filet</td><td>2,142lU</td></tr>
          <tr><td>Mango</td><td>1 cup in pieces</td><td>1,785lU</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function vitaminAGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const v = conds["Vitamin A"] || conds["vitaminA"] || [];
  const genes = v[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The protein encoded by this gene is a key enzyme in beta-carotene metabolism to vitamin A. It catalyzes the oxidative cleavage of beta,beta-carotene into two retinal molecules.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(v[0]?.recommendation || "N/A", v[0]?.lifestyle || "N/A", v[0]?.miscellaneous || "N/A")}
    ${right_columnC("01")}
  </div>`;
}

function vitaminCPage(conds: Record<string, ConditionData[]>): string {
  const v = conds["Vitamin C"] || conds["vitaminC"] || [];
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("12.png", "", "Skin Nutrients", "Vitamin C")}
      ${response(v[0]?.condition_status || "N/A")}
      ${hedingdetailed("Vitamin C")}
      ${aboutdetailpage(`<ul class="nutritionsec"><li>Vitamin C is also a powerful antioxidant.</li><li>Vitamin C helps to reduce oxidative stress to the body and may lower cancer risk. Vitamin C is also involved in the synthesis of collagen, an important protein for making your skin supple.</li><li>Many fruits and vegetables are great sources of vitamin C, so be sure to include them in your diet</li></ul>`)}
      <div style="height:40px;"></div>
      ${hedingdetailed("Food Sources")}
      <table class="tableNutrients">
        <thead><tr><th>Food Sources</th><th>Amount</th><th>Nutrition Value</th></tr></thead>
        <tbody>
          <tr><td>Guava</td><td>1 Fruit</td><td>377 mg</td></tr>
          <tr><td>Red pepper</td><td>1 cup raw</td><td>190 mg</td></tr>
          <tr><td>Kiwi</td><td>1 Piece</td><td>164 mg</td></tr>
          <tr><td>Orange</td><td>1 large</td><td>82 mg</td></tr>
          <tr><td>Strawberries</td><td>1 cup</td><td>89.4 mg</td></tr>
          <tr><td>Papaya</td><td>1 cup,in piece</td><td>86.5 mg</td></tr>
          <tr><td>Pineapple</td><td>1 cup, fresh</td><td>78.9 mg</td></tr>
          <tr><td>Peas</td><td>1 cup raw</td><td>58 mg</td></tr>
          <tr><td>Mango</td><td>1 cup</td><td>45.7 mg</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function vitaminCGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const v = conds["Vitamin C"] || conds["vitaminC"] || [];
  const genes = v[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "SLC23A1 (Solute Carrier Family 23 Member 1) is a Protein Coding gene. The absorption of vitamin C into the body and its distribution to organs requires two sodium-dependent vitamin C transporters. This gene encodes one of the two transporters. The encoded protein is active in bulk vitamin C transport involving epithelial surfaces.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(v[0]?.recommendation || "N/A", v[0]?.lifestyle || "N/A", v[0]?.miscellaneous || "N/A")}
    ${right_columnC("02")}
  </div>`;
}

function vitaminEPage(conds: Record<string, ConditionData[]>): string {
  const v = conds["Vitamin E"] || conds["vitaminE"] || [];
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("13.png", "", "Skin Nutrients", "Vitamin E")}
      ${response(v[0]?.condition_status || "N/A")}
      ${hedingdetailed("Vitamin E")}
      ${aboutdetailpage(`<ul class="nutritionsec"><li>Vitamin E is one of the key vitamins for skin health.</li><li>When combined with vitamin A, vitamin E is especially effective at preventing certain skin cancers.</li><li>Because of vitamin E antioxidant properties, it helps fight free radicals caused by pollution, smoking, processed foods, and sun exposure.</li><li>Free radicals are the catalyst for premature skin ageing such as wrinkles.</li></ul>`)}
      <div style="height:40px;"></div>
      ${hedingdetailed("Food Sources")}
      <table class="tableNutrients">
        <thead><tr><th>Food Sources</th><th>Amount</th><th>Nutrition Value</th></tr></thead>
        <tbody>
          <tr><td>Wheat germ oil</td><td>1 tablespoon</td><td>20.3 mg</td></tr>
          <tr><td>Almonds</td><td>dry roasted,1 ounce</td><td>5.6 mg</td></tr>
          <tr><td>Sunflower oil</td><td>1 tablespoon</td><td>5.6 mg</td></tr>
          <tr><td>Hazelnuts</td><td>dry roasted,1 ounce</td><td>4.3 mg</td></tr>
          <tr><td>Peanut butter</td><td>2 tablespoons</td><td>2.9 mg</td></tr>
          <tr><td>Peanuts</td><td>dry roasted,1 ounce</td><td>2.2 mg</td></tr>
          <tr><td>Kiwifruit</td><td>1 medium</td><td>1.1 mg</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function vitaminEGeneProfilePage(
  conds: Record<string, ConditionData[]>,
): string {
  const v = conds["Vitamin E"] || conds["vitaminE"] || [];
  const genes = v[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", 'In 3,891 individuals study, found that people with the good or average response at an intergenic marker had increased plasma levels of alpha-tocopherol should "Stay Balanced" and maintain a healthy diet. People with the bad response were not associated with increased levels of alpha-tocopherol and hence they would need to "Optimize Intake" of vitamin E through the increased intake of foods rich in vitamin E.') : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(v[0]?.recommendation || "N/A", v[0]?.lifestyle || "N/A", v[0]?.miscellaneous || "N/A")}
    ${right_columnC("03")}
  </div>`;
}

function omega3Page(conds: Record<string, ConditionData[]>): string {
  const o = conds["Omega-3"] || conds["omega3"] || [];
  return `
  <div class="sheet" style="background:white;">
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      ${aboutpageheader("15.png", "", "Skin Nutrients", "Omega-3")}
      ${response(o[0]?.condition_status || "N/A")}
      ${hedingdetailed("Omega-3")}
      ${aboutdetailpage(`<ul class="nutritionsec"><li>These essential fatty acids (EFAs) offer healing benefits in various inflammatory conditions such as eczema.</li><li>Omega-3s also manage overexposure of cortisol levels, which in turn helps keep skin supple and guard against wrinkle formation.</li><li>EFAs are also responsible for skin repair, moisture content and overall flexibility.</li><li>Since the body doesn't produce these fatty acids, they must be obtained through your diet</li></ul>`)}
      <div style="height:40px;"></div>
      ${hedingdetailed("Food Sources")}
      <table class="tableNutrients">
        <thead><tr><th>Food Sources</th><th>Amount</th><th>Nutrition Value</th></tr></thead>
        <tbody>
          <tr><td>Salmon</td><td>Half a fillet of cooked</td><td>4,023 mg</td></tr>
          <tr><td>Cod Liver Oil</td><td>1 tablespoon</td><td>2,664 mg</td></tr>
          <tr><td>Flaxseeds</td><td>1 tablespoon (14.3grams)</td><td>2,338 mg</td></tr>
          <tr><td>Chia Seeds</td><td>per ounce (28 grams)</td><td>4,915 mg</td></tr>
          <tr><td>Walnuts</td><td>per ounce (28 grams)</td><td>2,542 mg</td></tr>
          <tr><td>Soybeans</td><td>1/2 cup (86 grams)</td><td>1,241 mg</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function omega3GeneProfilePage(conds: Record<string, ConditionData[]>): string {
  const o = conds["Omega-3"] || conds["omega3"] || [];
  const genes = o[0]?.gene || [];
  return `
  <div class="sheet" style="background:white;">
    <div class="gene-container">
      <table class="skinTable">
        <tr><td class="leftcol">
          ${gene_page_header("Your Gene Profile")}
          ${genes[0] ? skin_gene(genes[0].status, genes[0].name, genes[0].report_variant || "", "The protein encoded by this gene is a member of the fatty acid desaturase (FADS) gene family. Desaturase enzymes regulate unsaturation of fatty acids through the introduction of double bonds between defined carbons of the fatty acyl chain. FADS family members are characterized by conserved histidine motifs.") : ""}
        </td></tr>
      </table>
    </div>
    ${recommendation(o[0]?.recommendation || "N/A", o[0]?.lifestyle || "N/A", o[0]?.miscellaneous || "N/A")}
    ${right_columnC("05")}
  </div>`;
}

// ─── Key Notes ───────────────────────────────────────────────
function keyNotesPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div class="asheader">
      <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
        <div class="headercontent">Key Notes</div>
      </div>
    </div>
  </div>`;
}

// ─── Science Behind the Test ─────────────────────────────────
function sciencePage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="height:40px;"></div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <h1 style="font-size:40px;color:#967349;font-family:'Cabourg OT Regular','Poppins',sans-serif;text-align:left;margin:0 50px 0 0;font-weight:500;">Science behind the test</h1>
      <h3 style="text-align:left;">Test Methodology</h3>
      <p style="text-align:justify;font-size:11pt;">Genomic DNA is extracted from individual's Saliva/Tissue/Blood by commercial DNA extraction kits. The genotyping and variant detection is carried out based on illumina Infinium® array protocol. The DNA is then, amplified, fragmented and hybridized to known DNA fragments immobilized in arrays on a BeadChip. Millions of such known DNA fragments (50mer probes) containing the target genetic variants are immobilized on the chip. The hybridized chip is then washed to remove non-hybridized DNA fragments. Single-base extension of the oligos on the BeadChip, using the captured DNA as a template, incorporates detectable labels on the BeadChip and determines the genotype call for the sample.</p>
      <h3 style="text-align:left;">Analytical Performance</h3>
      <p style="text-align:justify;font-size:11pt;">The genotyping was performed using a custom genotyping array platform (Illumina Inc). This test is a laboratory developed test with high reproducibility > 99% and high call rates > 98% to detect the variants and its performance has been validated in-house.</p>
      <h3 style="text-align:left;">Analysis</h3>
      <p style="text-align:justify;font-size:11pt;">Illumina GenomeStudio® Software is used for efficient genotyping data normalization, genotype calling, clustering, data intensity analysis. Genotypes are called for each sample by their signal intensity (norm R) and Allele Frequency (Norm Theta) relative to canonical cluster positions for a given SNP marker. The report is manually reviewed by experts before release.</p>
    </div>
  </div>`;
}

// ─── References ──────────────────────────────────────────────
function referencesPage(): string {
  return `
  <div class="sheet" style="background:white;">
    <div style="height:40px;"></div>
    <div style="position:relative;width:calc(100% - 50px);margin:0 25px;">
      <h1 style="font-size:40px;color:#967349;font-family:'Cabourg OT Regular','Poppins',sans-serif;text-align:left;margin:0 50px 0 0;font-weight:500;">References</h1>
      <ol class="ref_para">
        <li>Kim, Jin Hee, Mee-Ri Lee, and Yun-Chul Hong. "Modification of the association of bisphenol A with abnormal liver function by polymorphisms of oxidative stress-related genes." Environmental research 147 (2016): 324-330.</li>
        <li>Góth, László, et al. "Effects of rs769217 and rs1001179 polymorphisms of catalase gene on blood catalase, carbohydrate and lipid biomarkers in diabetes mellitus." Free radical research 46.10 (2012): 1249-1257.</li>
        <li>Boeta-Lopez, K., et al. "Association of interleukin-6 polymorphisms with obesity or metabolic traits in young Mexican-Americans." Obesity science & practice 4.1 (2018): 85-96.</li>
        <li>Navarini, Alexander A., et al. "Genome-wide association study identifies three novel susceptibility loci for severe Acne vulgaris." Nature communications 5 (2014): 4020.</li>
        <li>Nan, Hongmei, et al. "Genome-wide association study of tanning phenotype in a population of European ancestry." Journal of Investigative Dermatology 129.9 (2009): 2250-2257.</li>
        <li>Predictive testing of the melanocortin 1 receptor for skin cancer and photoageing.</li>
        <li>Elfakir, Anissa, et al. "Functional MC1R-gene variants are associated with increased risk for severe photoageing of facial skin." Journal of Investigative Dermatology 130.4 (2010): 1107-1115.</li>
        <li>Peluso, Marco, et al. "Aromatic DNA adducts and number of lung cancer risk alleles in Map-Ta-Phut Industrial Estate workers and nearby residents." Mutagenesis 28.1 (2012): 57-63.</li>
        <li>Hartwig, Fernando Pires, et al. "Association of lactase persistence genotype with milk consumption, obesity and blood pressure: a Mendelian randomization study in the 1982 Pelotas (Brazil) Birth Cohort, with a systematic review and meta-analysis." International journal of epidemiology 45.5 (2016): 1573-1587.</li>
        <li>Sobolev, Vladimir, et al. "Association of GA genotype of SNP rs4680 in COMT gene with psoriasis." Archives of dermatological research 311.4 (2019): 309-315.</li>
        <li>Macgregor, Stuart, et al. "Associations of ADH and ALDH2 gene variation with self report alcohol reactions, consumption and dependence: an integrated analysis." Human molecular genetics 18.3 (2008): 580-593.</li>
        <li>Wong, Ka H., et al. "Kudzu root: traditional uses and potential medicinal benefits in diabetes and cardiovascular diseases." Journal of Ethnopharmacology 134.3 (2011): 584-607.</li>
      </ol>
    </div>
  </div>`;
}

// ─── Back Cover ──────────────────────────────────────────────
function backCoverPage(opts: PdfGeneratorOptions): string {
  const img =
    opts.vendor?.backCoverImg ||
    opts.vendor?.skinCoverBackPageImg ||
    `${SKIN_IMAGES}/47backCover.jpg`;
  const logoUrl = opts.vendor?.logoUrl || "";
  return `
  <div class="sheet" hidepageno style="background-image:url('${img}');">
    ${logoUrl ? `<img src="${logoUrl}" style="width:27%;position:absolute;top:2%;left:2%;" alt="logo"/>` : ""}
  </div>`;
}

// ─── Page number script ───────────────────────────────────────
function pageNumberScript(): string {
  return `
  <script>
    (function() {
      var pages = document.querySelectorAll('.sheet');
      var total = pages.length;
      pages.forEach(function(page, i) {
        page.setAttribute('data-page-no', i + 1);
        if (!page.hasAttribute('hidepageno')) {
          var span = document.createElement('span');
          span.style.cssText = 'color:#7d7d7d;font-size:12px;position:absolute;left:104mm;bottom:20px;z-index:1000;';
          span.textContent = (i + 1) + ' of ' + total;
          page.appendChild(span);
        }
      });
    })();
  </script>`;
}

// ═══════════════════════════════════════════════════════════════
// MASTER BUILDER
// ═══════════════════════════════════════════════════════════════
export function buildSkinHealthReportHtml(opts: PdfGeneratorOptions): string {
  const { reportData } = opts;
  const rd = reportData.ReportData;
  const add: AdditionalData = reportData.AdditionalData || {};

  // Normalise condition keys — try both raw and common key variants
  function getCondition(keys: string[]): ConditionData[] {
    for (const k of keys) {
      if (rd[k] && rd[k].length > 0) return rd[k];
    }
    return [];
  }

  // Build summary data from ReportData
  const summaryRd = {
    stretchMarks: getCondition(["Stretch Marks", "stretchMarks"]),
    pollutionEffect: getCondition(["Pollution Effect", "pollutionEffect"]),
    caffeineSensitivity: getCondition([
      "Caffeine Sensitivity",
      "caffeineSensitivity",
    ]),
    dairy: getCondition(["Dairy", "dairy"]),
    nicotine: getCondition(["Nicotine", "nicotine"]),
    alcohol: getCondition(["Alcohol", "alcohol"]),
    vitaminA: getCondition(["Vitamin A", "vitaminA"]),
    vitaminC: getCondition(["Vitamin C", "vitaminC"]),
    vitaminE: getCondition(["Vitamin E", "vitaminE"]),
    omega3: getCondition(["Omega-3", "omega3"]),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Skin Health Report — ${reportData.PatientDetails.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>${buildCSS()}</style>
</head>
<body>

  <!-- 1. Cover Page -->
  ${coverPage(opts)}

  <!-- 2. Cover Inside -->
  ${coverInsidePage()}

  <!-- 3. About Us -->
  ${aboutUsPage(opts)}

  <!-- 4. About Report -->
  ${aboutReportPage()}

  <!-- 5. About Report 2 -->
  ${aboutReport2Page()}

  <!-- 6. Genetics For Health -->
  ${geneticsForHealthPage()}

  <!-- 7. Legal Disclaimer -->
  ${legalPage(opts)}

  <!-- 8. Skin Cover -->
  ${skinCoverPage(opts)}

  <!-- 9. Customer Profile -->
  ${profilePage(opts)}

  <!-- 10. About Genetics -->
  ${aboutGeneticsPage()}

  <!-- 11. Gene Mutation -->
  ${geneMutationPage()}

  <!-- 12. Table of Contents -->
  ${tableOfContentsPage()}

  <!-- 13. Summary A -->
  ${skinSummaryAPage(add, summaryRd)}

  <!-- 14. Summary B+C -->
  ${skinSummaryBCPage(add, summaryRd)}

  <!-- 15. Role of Skin (dark page) -->
  ${roleOfSkinPage()}

  <!-- ───── A. SKIN ALTERING CONDITIONS ───── -->

  <!-- Oxidative Stress -->
  ${oxidativeStressPage(add)}
  ${oxidativeGeneProfilePage(add, rd)}

  <!-- Inflammation Response -->
  ${inflammationPage(add)}
  ${inflammationGeneProfilePage(add, rd)}

  <!-- Sugar Effect / Glycation -->
  ${glycationPage(add)}
  ${glycationGeneProfilePage(add, rd)}

  <!-- Biological Age -->
  ${biologicalAgePage(add)}
  ${biologicalAgeGeneProfilePage(add, rd)}

  <!-- Skin Texture -->
  ${skinTexturePage(add)}
  ${skinTextureGeneProfilePage(add, rd)}

  <!-- Cellulite -->
  ${cellulitePage(add)}
  ${celluliteGeneProfilePage(add, rd)}

  <!-- Stretch Marks -->
  ${stretchMarksPage(rd)}
  ${stretchMarksGeneProfilePage(rd)}

  <!-- Acne -->
  ${acnePage(add)}
  ${acneGeneProfilePage(add, rd)}

  <!-- Sun Sensitivity -->
  ${sunSensitivityPage(add)}
  ${sunSensitivityGeneProfilePage(rd)}
  ${sunSensitivityRecommPage(add, rd)}
  ${blankPage()}

  <!-- Pollution Effect -->
  ${pollutionEffectPage(rd)}
  ${pollutionGeneProfilePage(rd)}

  <!-- ───── B. FOOD SENSITIVITY AND INTOLERANCE ───── -->

  <!-- Caffeine -->
  ${caffeinePage(rd)}
  ${caffeineGeneProfilePage(rd)}

  <!-- Dairy -->
  ${dairyPage(rd)}
  ${dairyGeneProfilePage(rd)}

  <!-- Nicotine -->
  ${nicotinePage(rd)}
  ${nicotineGeneProfilePage(rd)}

  <!-- Alcohol -->
  ${alcoholPage(rd)}
  ${alcoholGeneProfilePage(rd)}

  <!-- Gluten -->
  ${glutenPage(add, rd)}
  ${glutenGeneProfilePage(add, rd)}

  <!-- Salt -->
  ${saltPage(add)}
  ${saltGeneProfilePage(add, rd)}

  <!-- ───── C. SKIN NUTRIENTS ───── -->

  <!-- Vitamin A -->
  ${vitaminAPage(rd)}
  ${vitaminAGeneProfilePage(rd)}

  <!-- Vitamin C -->
  ${vitaminCPage(rd)}
  ${vitaminCGeneProfilePage(rd)}

  <!-- Vitamin E -->
  ${vitaminEPage(rd)}
  ${vitaminEGeneProfilePage(rd)}

  <!-- Omega-3 -->
  ${omega3Page(rd)}
  ${omega3GeneProfilePage(rd)}

  <!-- Key Notes -->
  ${keyNotesPage()}

  <!-- Science Behind the Test -->
  ${sciencePage()}

  <!-- References -->
  ${referencesPage()}

  <!-- Back Cover -->
  ${backCoverPage(opts)}

  ${pageNumberScript()}
</body>
</html>`;
}
