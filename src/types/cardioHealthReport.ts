// ============================================================
// Types for Cardio Health Report
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
  risk_factors?: string;
  symptoms?: string;
  prevention?: string;
  gene: GeneEntry[];
}

export interface ReportData {
  [conditionName: string]: ConditionData[];
}

export interface CardioHealthReportResult {
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
  primaryColor?: string;
  footerLogoUrl?: string;
  vendorAddress?: string;
  vendorContact?: string;
  imageOverlay?: string;
  signatureUrl?: string;
  sigName?: string;
  coverPageImg?: string;
  backCoverImg?: string;
}

export interface PdfGeneratorOptions {
  reportData: CardioHealthReportResult;
  vendor?: VendorSettings;
  printMode?: boolean;
}

export interface Patient {
  name: string;
  age: string;
  gender: string;
  reportId: string;
  collectionDate: string;
  reportDate: string;
  patientId: string;
}

export interface Variant {
  gene: string;
  variant: string;
  genotype: string;
  effect: string;
  recommendation: string;
}

export interface ReportSection {
  type: 'diet' | 'weight' | 'fitness' | 'detox';
  title: string;
  description: string;
  variants: Variant[];
  recommendations: string[];
  metadata?: {
    variantCount: number;
    recommendationCount: number;
    descriptionLength: number;
    dataQuality: number;
    lastUpdated: string;
  };
  enhancedDescription?: string;
  riskAssessment?: 'Low' | 'Medium' | 'High';
  actionItems?: string[];
}

export interface CardioHealthReportSection {
  type: 'mi' | 'af' | 'hyperlipidemia' | 'dvt' | 't2dm' | 'obesity';
  title: string;
  description: string;
  variants: Variant[];
  recommendations: string[];
  metadata?: {
    variantCount: number;
    recommendationCount: number;
    descriptionLength: number;
    dataQuality: number;
    lastUpdated: string;
  };
  enhancedDescription?: string;
  riskAssessment?: 'Low' | 'Medium' | 'High';
  actionItems?: string[];
}

export interface CardioHealthGeneticReportData {
  patient: Patient;
  vendorConfig: VendorConfig;
  reportSections: CardioHealthReportSection[];
  testType: string;
  reportType?: string;
}

export interface VendorConfig {
  vendorId: string;
  vendorName: string;
  logoUrl: string;
  primaryColor: string;
  textColor: string;
  headerBg: string;
  borderColor: string;
}

export interface GeneticReportData {
  patient: Patient;
  vendorConfig: VendorConfig;
  reportSections: ReportSection[];
  testType: string;
  reportType?: string;
}

export interface PDFGenerationOptions {
  sampleId: string;
  vendorId: string;
  testType: string;
  reportType?: string;
  format?: 'full' | 'summary';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  matchPercentage: number;
}