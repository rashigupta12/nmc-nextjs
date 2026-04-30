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
  // Optional overrides
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

/**
 * Strategy A — Women's Health style:
 * Page data lives in a dedicated collection, fetched without TestMaster lookup.
 */
export interface PageDataSourceDirect {
  type: 'direct';
  pageDataModel: string;   // mongoose model name, e.g. "WomenHealthPageData"
  pageDescModel: string;   // mongoose model name, e.g. "WomenHealthPageDesc"
}

/**
 * Strategy B — Immunity / future style:
 * Page data is scoped to a TestMaster record, fetched via testId.
 */
export interface PageDataSourceByTestMaster {
  type: 'testMaster';
  testId: string;          // e.g. "NMC-MI01", "NMC-WH01"
  pageDataModel: string;   // mongoose model name, e.g. "GenePageData"
  pageDescModel: string;   // mongoose model name, e.g. "GenePageDesc"
}

export type PageDataSource = PageDataSourceDirect | PageDataSourceByTestMaster;

// ─── Section config ───────────────────────────────────────────────────────────

export interface SectionConfig {
  /** Must match the `sectionId` field on GeneReportTemp rows */
  id: string;
  /** Human-readable label used in templates and TOC */
  label: string;
}

// ─── Auto-fill mapping ────────────────────────────────────────────────────────

export interface AutoFillMapping {
  /**
   * Substring matched against condition_name OR display_condition (case-insensitive).
   * All matching conditions are overridden.
   */
  match: string;
  /** Key on the patientAdditional document to read the status value from */
  statusKey: string;
  /** Key on the patientAdditional document to read the recommendation from */
  recKey: string;
  /** Key on the patientAdditional document to read the interpretation from */
  interKey: string;
  /**
   * Optional async resolver for cases where the recommendation must be
   * looked up from a secondary DB collection (e.g. AdditionalWomanHealthRecommendation).
   * When provided, statusKey/recKey/interKey are still used to READ the status,
   * but rec/interpretation come from this function's return value.
   */
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
  response: string;        // normalised: "Good" | "Average" | "Poor"
  interpretation: string;
  status: string;          // raw DB value
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
  /** Empty string for flat (no-section) reports */
  sectionId: string;
  gene: GeneData[];
}

/** Keyed by display_condition */
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

/**
 * Normalised response shape produced by GenericReportService.
 * Consumed by every templateFn regardless of report type.
 *
 * `sections` is keyed by sectionId (e.g. "A", "B", "C").
 * For flat reports (no sections) the entire data lives under key "flat".
 */
export interface GenericApiResponse {
  PatientDetails: PatientDetails;
  SampleDetails: SampleDetails;
  /**
   * Sectioned report data.
   * Flat reports: { flat: ReportData }
   * Sectioned reports: { A: ReportData, B: ReportData, C: ReportData, ... }
   */
  sections: Record<string, ReportData>;
  /** Raw patientAdditional document — passed through for templates that need it */
  addDetails: Record<string, any> | null;
  meta: {
    reportTypeId: string;
    reportLabel: string;
    generatedAt: string;
  };
}

// ─── PDF generator options (consumed by templateFn) ──────────────────────────

export interface PdfGeneratorOptions {
  reportData: GenericApiResponse;
  vendor: VendorSettings;
}

// ─── Master report type config ────────────────────────────────────────────────

export interface ReportTypeConfig {
  /** Unique identifier — used as URL param and registry key */
  id: string;
  /** Human-readable name shown in UI */
  label: string;

  // ── Data sourcing ──────────────────────────────────────────────────────────
  pageDataSource: PageDataSource;
  /** Mongoose model name for the patientAdditional collection. Optional for reference-data-only reports like Clopidogrel. */
  patientAdditionalModel?: string;

  // ── Structure ──────────────────────────────────────────────────────────────
  /**
   * Declare sections that map to GeneReportTemp.sectionId.
   * Empty array = flat report (all data grouped under "flat").
   */
  sections: SectionConfig[];

  // ── Auto-fill ──────────────────────────────────────────────────────────────
  autoFillMappings: AutoFillMapping[];

  // ── Visual / branding ─────────────────────────────────────────────────────
  vendor: VendorSettings;

  // ── Template ───────────────────────────────────────────────────────────────
  /** Pure function: receives PdfGeneratorOptions, returns full HTML string */
  templateFn: (opts: PdfGeneratorOptions) => string;

  // ── Optional overrides ─────────────────────────────────────────────────────
  /**
   * Override the default status priority map used by worst-wins logic.
   * Default: { Poor: 3, Average: 2, Good: 1, '': 0 }
   */
  statusPriorityMap?: Record<string, number>;
}
