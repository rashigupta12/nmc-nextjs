// lib/reportEngine/types.ts
// ============================================================
// Report Engine — Shared Types
// Single source of truth for every interface used across
// engine.ts, renderer.ts, modelResolver.ts, registry.ts,
// and all report configs.
// ============================================================

// ─── Vendor / branding ───────────────────────────────────────────────────────

export interface VendorSettings {
  vendorName: string;
  vendorId: string;
  logoUrl: string;
  coverLogoUrl: string;
  themeColor: string;
  primaryColor?: string;
  textColor?: string;
  footerLogoUrl?: string;
  vendorAddress?: string;
  vendorContact?: string;
  imageOverlay?: string;
  backCoverImg?: string;
  coverPageImg?: string;
}

// ─── Page data source strategy (discriminated union) ─────────────────────────

export interface PageDataSourceDirect {
  type: 'direct';
  pageDataModel: string;
  pageDescModel: string;
}

export interface PageDataSourceByTestMaster {
  type: 'testMaster';
  testId: string;
  pageDataModel: string;
  pageDescModel: string;
}

export type PageDataSource = PageDataSourceDirect | PageDataSourceByTestMaster;

// ─── Section config ───────────────────────────────────────────────────────────

export interface SectionConfig {
  id: string;
  label: string;
}

// ─── Auto-fill mapping ────────────────────────────────────────────────────────

export interface AutoFillMapping {
  match: string;
  statusKey: string;
  recKey: string;
  interKey: string;
  asyncResolver?: (
    conditionMatch: string,
    status: string
  ) => Promise<{ recommendation: string; interpretation: string } | null>;
}

// ─── Core data shapes ─────────────────────────────────────────────────────────

export interface GeneData {
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
  sectionId: string;
  gene: GeneData[];
}

export type ReportData = Record<string, ConditionData[]>;

export interface PatientDetails {
  hospital: string;
  referredBy: string;
  patientId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  weight?: string;
  height?: string;
  activityLevel?: string;
  dailyCalorieIntake?: number;
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

// ─── Generic API response ─────────────────────────────────────────────────────

export interface GenericApiResponse {
  PatientDetails: PatientDetails;
  SampleDetails: SampleDetails;
  sections: Record<string, ReportData>;
  addDetails: Record<string, any> | null;
  meta: {
    reportTypeId: string;
    reportLabel: string;
    generatedAt: string;
  };
}

// ─── PDF generator options ────────────────────────────────────────────────────

export interface PdfGeneratorOptions {
  reportData: GenericApiResponse;
  vendor: VendorSettings;
}

// ─── Master report type config ────────────────────────────────────────────────

export interface ReportTypeConfig {
  id: string;
  label: string;
  pageDataSource: PageDataSource;
  patientAdditionalModel?: string;
  sections: SectionConfig[];
  autoFillMappings: AutoFillMapping[];
  vendor: VendorSettings;
  templateFn: (opts: PdfGeneratorOptions) => string;
  statusPriorityMap?: Record<string, number>;
}


// lib/reportEngine/types.ts
// Add to existing types:

export interface PatientFinalReportCondition {
  conditionName: string;
  status: string;
  recommendation: string;
  interpretation: string;
  nutrition: string;
  lifestyle: string;
  miscellaneous: string;
  genes: Array<{
    gene: string;
    uniqueId: string;
    response: string;
  }>;
  updatedAt: Date;
}

export interface PatientFinalReport {
  patientId: string;
  sampleId: string;
  testId: string;
  testCode: string;
  testReportName: string;
  conditions: PatientFinalReportCondition[];
  createdAt: Date;
  updatedAt: Date;
}