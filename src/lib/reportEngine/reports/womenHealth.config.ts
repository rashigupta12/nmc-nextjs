// ============================================================
// Report Config — Women's Health
//
// Uses "direct" page data strategy (dedicated collections,
// no TestMaster lookup) and an async resolver for recommendations
// (fetches from AdditionalWomanHealthRecommendation collection).
// ============================================================

import { ReportTypeConfig } from '../types';
import { buildWomenHealthReportHtml } from '@/lib/womenHealthPdf/womenHealthTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ─── Async resolver for Women's Health recommendations ───────────────────────
//
// Women's Health stores recommendations in a separate DB collection
// (AdditionalWomanHealthRecommendation) keyed by condition + status.
// This resolver is called by the engine's applyAutoFill when a
// patientAdditional status exists but rec/inter need a DB lookup.

async function womenHealthRecommendationResolver(
  conditionMatch: string,
  status: string
): Promise<{ recommendation: string; interpretation: string } | null> {
  try {
    // Dynamic import to avoid circular deps and keep config files lightweight
    const { default: AdditionalWomanHealthRecommendation } = await import(
      '@/models/additionalWomanHealthRecommendation'
    );

    const doc = await AdditionalWomanHealthRecommendation.findOne({
      condition:    conditionMatch,
      'data.status': status,
    });

    if (!doc) return null;

    const item = doc.data.find((d: any) => d.status === status);
    if (!item) return null;

    return {
      recommendation: item.recommendation ?? '',
      interpretation: item.interpretation ?? '',
    };
  } catch {
    return null;
  }
}

export const womenHealthReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:    'women-health',
  label: "Women's Health Report",

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Women's Health has its own dedicated page data collections —
  // no TestMaster scoping required.
  pageDataSource: {
    type:          'direct',
    pageDataModel: 'WomenHealthPageData',
    pageDescModel: 'WomenHealthPageDesc',
  },

  patientAdditionalModel: 'PatientAdditionalWomanHealth',

  // ── Sections ──────────────────────────────────────────────────────────────
  // Women's Health is a flat report — no section split.
  // All conditions group under the "flat" key in GenericApiResponse.sections.
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  // Each mapping uses asyncResolver to look up rec/interpretation from DB.
  // statusKey is still read from patientAdditional to determine WHICH status
  // to pass to the resolver.
  autoFillMappings: [
    {
      match:         'Osteoporosis',
      statusKey:     'osteoporosisStatus',
      recKey:        'osteoporosisRecommendation',
      interKey:      'osteoporosisInterpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Osteoporosis', status),
    },
    {
      match:         'Rheumatoid Arthritis',
      statusKey:     'rheumatoidArthritisStatus',
      recKey:        'rheumatoidArthritisRecommendation',
      interKey:      'rheumatoidArthritisInterpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Rheumatoid Arthritis', status),
    },
    {
      match:         'Polycystic Ovary Syndrome',
      statusKey:     'pcosStatus',
      recKey:        'pcosRecommendation',
      interKey:      'pcosInterpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Polycystic Ovary Syndrome', status),
    },
    {
      match:         'Pregnancy Loss',
      statusKey:     'pregnancyLossStatus',
      recKey:        'pregnancyLossRecommendation',
      interKey:      'pregnancyLossInterpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Pregnancy Loss', status),
    },
  ],

  // ── Vendor / branding ─────────────────────────────────────────────────────
  vendor: {
    vendorName:    'NMC Genetics',
    vendorId:      'NMC',
    themeColor:    '#fe84ff',
    logoUrl:       `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl:  `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor:  '',
    textColor:     '',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay:  '',
  },

  // ── Template ──────────────────────────────────────────────────────────────
  // The existing template function — not modified.
  // Adapter in route.ts bridges GenericApiResponse → legacy ApiResponse shape.
  templateFn: buildWomenHealthReportHtml as any,
};
