// lib/reportEngine/adapters.ts
// ============================================================
// Report Engine — Response Adapters
//
// The existing templates were built against their own specific
// response shapes. These adapters convert GenericApiResponse
// to legacy shapes.
// ============================================================

import { GenericApiResponse, PdfGeneratorOptions, VendorSettings } from './types';

export function adaptToImmunityOptions(
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  const legacy = {
    PatientDetails: generic.PatientDetails,
    SampleDetails: generic.SampleDetails,
    DetoxData: generic.sections['A'] ?? {},
    MicronutrientData: generic.sections['B'] ?? {},
    ImmunogenomicData: generic.sections['C'] ?? {},
    addDetails: generic.addDetails,
  };

  return { reportData: legacy as any, vendor };
}

export function adaptToWomenHealthOptions(
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  const legacy = {
    PatientDetails: generic.PatientDetails,
    SampleDetails: generic.SampleDetails,
    ReportData: generic.sections['flat'] ?? {},
  };

  return { reportData: legacy as any, vendor };
}

export function adaptGeneric(
  generic: GenericApiResponse,
  vendor: VendorSettings
): PdfGeneratorOptions {
  return { reportData: generic as any, vendor };
}

const NATIVE_GENERIC_TYPES = new Set<string>([
  'sleep',
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
      return adaptGeneric(generic, vendor);
  }
}