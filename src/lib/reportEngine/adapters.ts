// ============================================================
// Report Engine — Response Adapters
//
// The existing templates (immunityTemplate.ts, womenHealthTemplate.ts)
// were built against their own specific response shapes BEFORE the
// generic engine existed. Rather than modifying those templates,
// we adapt GenericApiResponse → legacy shape here.
//
// This file is TEMPORARY scaffolding. Once templates are rewritten
// to consume GenericApiResponse directly, this file can be deleted.
// ============================================================

import { GenericApiResponse, PdfGeneratorOptions, VendorSettings } from './types';

// ─── Immunity adapter ─────────────────────────────────────────────────────────
//
// Legacy ImmunityApiResponse shape (what buildImmunityReportHtml expects):
// {
//   PatientDetails, SampleDetails,
//   DetoxData, MicronutrientData, ImmunogenomicData,
//   addDetails
// }

export function adaptToImmunityOptions(
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  const legacy = {
    PatientDetails:    generic.PatientDetails,
    SampleDetails:     generic.SampleDetails,
    DetoxData:         generic.sections['A'] ?? {},
    MicronutrientData: generic.sections['B'] ?? {},
    ImmunogenomicData: generic.sections['C'] ?? {},
    addDetails:        generic.addDetails,
  };

  return { reportData: legacy as any, vendor };
}

// ─── Women's Health adapter ───────────────────────────────────────────────────
//
// Legacy ApiResponse shape (what buildWomenHealthReportHtml expects):
// {
//   PatientDetails, SampleDetails,
//   ReportData  ← flat Record<string, ConditionData[]>
// }

export function adaptToWomenHealthOptions(
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  const legacy = {
    PatientDetails: generic.PatientDetails,
    SampleDetails:  generic.SampleDetails,
    ReportData:     generic.sections['flat'] ?? {},
  };

  return { reportData: legacy as any, vendor };
}

// ─── Generic adapter (for new templates that consume GenericApiResponse) ──────
//
// New report types that write their templateFn against GenericApiResponse
// directly need no adaptation — just pass through.

export function adaptGeneric(
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  return { reportData: generic as any, vendor };
}

// ─── Adapter router ───────────────────────────────────────────────────────────
//
// Returns the right adapter function for a given report type ID.
// When a new report type uses GenericApiResponse natively, add its
// id to the `native` set below — no adapter file change needed beyond that.

const NATIVE_GENERIC_TYPES = new Set<string>([
  // Add new report type ids here once their templates target GenericApiResponse:
  'sleep', // Sleep report uses GenericApiResponse directly
  // 'cardio',
  // 'nutrition',
]);

export function buildPdfOptions(
  reportTypeId: string,
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  if (NATIVE_GENERIC_TYPES.has(reportTypeId)) {
    return adaptGeneric(generic, vendor);
  }

  switch (reportTypeId) {
    case 'immunity':
      return adaptToImmunityOptions(generic, vendor);
    case 'women-health':
      return adaptToWomenHealthOptions(generic, vendor);
    default:
      // Unknown legacy type — attempt generic passthrough
      return adaptGeneric(generic, vendor);
  }
}
