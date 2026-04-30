// ============================================================
// Report Engine — Public Barrel Export
//
// The route and page import from here only.
// Nothing outside reportEngine/ should import internal files directly.
// ============================================================

// Types
export type {
  ReportTypeConfig,
  SectionConfig,
  AutoFillMapping,
  PageDataSource,
  PageDataSourceDirect,
  PageDataSourceByTestMaster,
  VendorSettings,
  GeneData,
  ConditionData,
  ReportData,
  PatientDetails,
  SampleDetails,
  GenericApiResponse,
  PdfGeneratorOptions,
} from './types';

// Engine
export { GenericReportService } from './engine';
export type { RawPatientInput, RawSampleInput } from './engine';

// Registry
export { getReportConfig, listReportTypes, isValidReportType } from './registry';

// Model resolver
export {
  resolveModel,
  resolvePageData,
  resolvePatientAdditional,
  resolveGeneReportData,
} from './modelResolver';

// Renderer
export { renderHtmlToPdf, renderHtml } from './renderer';

// Adapters
export { buildPdfOptions } from './adapters';
