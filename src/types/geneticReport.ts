// Exact data structure matching legacy PHP system
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

// Women's Health Report Section (extended for women's health)
export interface WomenHealthReportSection {
  type: 'pcos' | 'pregnancy_loss' | 'peripartum_depression' | 'osteoporosis' | 'rheumatoid_arthritis';
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

// Extended Genetic Report Data for Women's Health
export interface WomenHealthGeneticReportData {
  patient: Patient;
  vendorConfig: VendorConfig;
  reportSections: WomenHealthReportSection[];
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

// Vendor settings for exact theming
export interface VendorSettings {
  vendorId: string;
  primaryColor: string;
  textColor: string;
  logoUrl: string;
  coverLogoUrl: string;
  footerLogoUrl: string;
  vendorName: string;
  vendorAddress: string;
  vendorContact: string;
  imageOverlay: string;
  borderColor?: string;
  headerBg?: string;
  themeColor? : string;
}

// PDF generation options
export interface PDFGenerationOptions {
  sampleId: string;
  vendorId: string;
  testType: string;
  reportType?: string;
  format?: 'full' | 'summary';
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  matchPercentage: number;
}

// Women's Health Report Section (extended for women's health)
export interface WomenHealthReportSection {
  type: 'pcos' | 'pregnancy_loss' | 'peripartum_depression' | 'osteoporosis' | 'rheumatoid_arthritis';
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

// Extended Genetic Report Data for Women's Health
export interface WomenHealthGeneticReportData {
  patient: Patient;
  vendorConfig: VendorConfig;
  reportSections: WomenHealthReportSection[];
  testType: string;
  reportType?: string;
}

// Legacy PHP data structure (exact match)
export interface LegacyPHPData {
  patient: {
    name: string;
    age: string;
    gender: string;
    reportId: string;
    collectionDate: string;
    reportDate: string;
  };
  reportSections: {
    type: 'diet' | 'weight' | 'fitness' | 'detox';
    title: string;
    description: string;
    variants: Array<{
      gene: string;
      variant: string;
      genotype: string;
      effect: string;
      recommendation: string;
    }>;
    recommendations: string[];
  }[];
  vendorConfig: {
    vendorId: string;
    vendorName: string;
    logoUrl: string;
    primaryColor: string;
    textColor: string;
  };
}
