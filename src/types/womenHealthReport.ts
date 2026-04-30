// ============================================================
// Types for Women's Health Report
// ============================================================

export interface PatientDetails {
  patientId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  activityLevel?: string;
  dailyCalorieIntake?: number;
  weight?: number;
  height?: number;
  referredBy?: string;
  hospital?: string;
}

export interface SampleDetails {
  kitBarcode: string;
  orderNo: string;
  test: string;
  subtests: string;
  sample_date: string;
  sample_time: string;
  resample_date: string;
  lab_date: string;
  report_date: string;
  sampleType: string;
  addedBy: string;
  vendorSampleId: string;
  tatDate: string;
  pdfpath: string;
}

export type ConditionStatus = 'Good' | 'Average' | 'Poor';

export interface GeneEntry {
  uniqueid: string;
  name: string;
  test_variant: string;
  report_variant: string;
  response: string;
  interpretation: string;
  status: string;
  gene_description: string;
}

export interface ConditionData {
  condition_name: string;
  display_condition: string;
  recommendation: string;
  interpretation: string;
  condition_status: string;
  condition_desc: string;
  heading1: string;
  heading_desc1: string;
  heading_desc2: string;
  gene: GeneEntry[];
}

export interface ReportData {
  [conditionName: string]: ConditionData[];
}

export interface WomenHealthReportResult {
  PatientDetails: PatientDetails;
  SampleDetails: SampleDetails;
  ReportData: ReportData;
}

export interface VendorSettings {
  vendorName?: string;
  vendorId?: string;
  logoUrl?: string;
  coverLogoUrl?: string;
  themeColor?: string;
  textColor?: string;
  signatureUrl?: string;    // vendor signature image
  sigName?: string;         // name below signature
  coverPageImg?: string;    // custom cover background
  backCoverImg?: string;    // custom back cover background
}

export interface PdfGeneratorOptions {
  reportData: WomenHealthReportResult;
  vendor?: VendorSettings;
  printMode?: boolean;
}
