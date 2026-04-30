// /types/skinHealthReport.ts

// ============================================================
// Types for Skin Health Report
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
  // No gene_description for skin (no pageDesc collection)
}

export interface ConditionData {
  condition_name: string;
  display_condition: string;
  condition_desc?: string;  // Added - optional for compatibility
  recommendation: string;    // maps to nutrition / recommendation from GenericReportRecommendation
  lifestyle: string;         // maps to lifestyle
  miscellaneous: string;     // maps to miscellaneous
  interpretation: string;
  condition_status: string;  // Good | Average | Poor
  risk_factors?: string;     // Added for PDF generator compatibility
  symptoms?: string;         // Added for PDF generator compatibility
  prevention?: string;       // Added for PDF generator compatibility
  gene: GeneEntry[];
}

export interface ReportData {
  [conditionName: string]: ConditionData[];
}

export interface SkinHealthReportResult {
  PatientDetails: PatientDetails;
  SampleDetails: SampleDetails;
  ReportData: ReportData;
  AdditionalData?: any;
}

// ============================================================
// PDF Generator Types for Skin Health Report
// ============================================================

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
  aboutContent?: string;
  legalContent?: string;
}

export interface PdfGeneratorOptions {
  reportData: SkinHealthReportResult;
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
  type: 'skin_aging' | 'sun_protection' | 'collagen' | 'antioxidant' | 'inflammation' | 'hydration';
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

export interface SkinHealthReportSection {
  type: 'skin_aging' | 'sun_protection' | 'collagen' | 'antioxidant' | 'inflammation' | 'hydration';
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

export interface SkinHealthGeneticReportData {
  patient: Patient;
  vendorConfig: VendorConfig;
  reportSections: SkinHealthReportSection[];
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

// ============================================================
// Skin Health Specific Types
// ============================================================

export interface SkinCondition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: 'Good' | 'Average' | 'Poor';
  recommendations: string[];
  lifestyleTips: string[];
  miscellaneous: string[];
  genes: SkinGene[];
}

export interface SkinGene {
  name: string;
  variant: string;
  genotype: string;
  effect: string;
  interpretation: string;
  status: string;
}

export interface SkinHealthData {
  conditions: SkinCondition[];
  summary: {
    totalGenes: number;
    totalConditions: number;
    goodConditions: number;
    averageConditions: number;
    poorConditions: number;
  };
}

export interface SkinHealthRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  actionItems: string[];
}

export interface SkinHealthLifestyle {
  category: string;
  tips: string[];
  benefits: string[];
  precautions: string[];
}

export interface SkinHealthMiscellaneous {
  title: string;
  content: string;
  references?: string[];
}

// ============================================================
// PDF Styling Types for Skin Health
// ============================================================

export interface PDFStyles {
  page: {
    margin: number;
    padding: number;
    backgroundColor: string;
    fontFamily: string;
  };
  header: {
    backgroundColor: string;
    color: string;
    fontSize: number;
    padding: number;
    marginBottom: number;
  };
  section: {
    marginBottom: number;
    padding: number;
    borderBottomColor: string;
    borderBottomWidth: number;
  };
  conditionCard: {
    backgroundColor: string;
    borderRadius: number;
    padding: number;
    marginBottom: number;
    boxShadow: string;
  };
  geneTable: {
    headerBackground: string;
    headerColor: string;
    rowEvenBackground: string;
    rowOddBackground: string;
    borderColor: string;
  };
  statusBadge: {
    good: {
      backgroundColor: string;
      color: string;
    };
    average: {
      backgroundColor: string;
      color: string;
    };
    poor: {
      backgroundColor: string;
      color: string;
    };
  };
  recommendation: {
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    marginBottom: number;
  };
}

// ============================================================
// PDF Generation Response Types
// ============================================================

export interface PDFGenerationResponse {
  success: boolean;
  buffer?: Buffer;
  html?: string;
  error?: string;
  filename?: string;
  pages?: number;
  metadata?: {
    generatedAt: string;
    sampleId: string;
    patientId: string;
    reportType: string;
  };
}

export interface HTMLGenerationOptions {
  reportData: SkinHealthReportResult;
  vendor: VendorSettings;
  includeStyles?: boolean;
  includeScripts?: boolean;
  embedImages?: boolean;
  baseUrl?: string;
}