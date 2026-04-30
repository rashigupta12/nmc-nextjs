// ============================================================
// Report Config — Immunity
//
// This is the CANONICAL reference config.
// When writing a new report type, copy this file and adapt.
//
// What this file owns:
//   - Which TestMaster record to scope page data to
//   - Which patientAdditional model to query
//   - Section definitions (A / B / C)
//   - Auto-fill mappings (condition name → patientAdditional fields)
//   - Vendor / branding settings
//   - The template function (imported from existing template file — unchanged)
// ============================================================

import { ReportTypeConfig } from '../types';

// Template import — existing file, zero changes needed
// Update this path to match your actual project structure
import { buildImmunityReportHtml } from '@/lib/ImmunePdf/immunityTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const immunityReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:    'immunity',
  label: 'Immunity Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Uses TestMaster lookup: fetches GenePageData + GenePageDesc filtered
  // by the TestMaster record matching testId "NMC-MI01"
  pageDataSource: {
    type:          'testMaster',
    testId:        'NMC-MI01',
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Mongoose model name for the patient additional collection
  patientAdditionalModel: 'PatientAdditionalImmunity',

  // ── Sections ──────────────────────────────────────────────────────────────
  // id must match GeneReportTemp.sectionId values in the DB
  sections: [
    { id: 'A', label: 'Detoxification' },
    { id: 'B', label: 'Micronutrients' },
    { id: 'C', label: 'Immunogenomic Profile' },
  ],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  // Each entry: when patientAdditional[statusKey] has a value,
  // override all conditions whose name/display_condition includes `match`.
  //
  // Section A — manually set in addDetails by admin
  // Section B/C — computed by PHP algorithms and stored in addDetails
  autoFillMappings: [
    // ── Section A: Detoxification ──────────────────────────────────────────
    {
      match:     'Phase-I Detoxification',
      statusKey: 'detoxPhase1Status',
      recKey:    'detoxPhase1Recommendation',
      interKey:  'detoxPhase1Interpritation',  // typo preserved from DB schema
    },
    {
      match:     'Phase-II Detoxification',
      statusKey: 'detoxPhase2Status',
      recKey:    'detoxPhase2Recommendation',
      interKey:  'detoxPhase2Interpritation',
    },
    {
      match:     'Oxidative Stress',
      statusKey: 'detoxOxidativeStressStatus',
      recKey:    'detoxOxidativeStressRecommendation',
      interKey:  'detoxOxidativeStressInterpritation',
    },

    // ── Section B: Micronutrients ──────────────────────────────────────────
    {
      match:     'Vitamin B9',
      statusKey: 'vitB9Status',
      recKey:    'vitB9Recommendation',
      interKey:  'vitB9Interpretation',  // note: no typo on this one
    },
    {
      match:     'Vitamin D',
      statusKey: 'vitDStatus',
      recKey:    'vitDRecommendation',
      interKey:  'vitDInterpritation',   // typo preserved from DB schema
    },

    // ── Section C: Immunogenomic ───────────────────────────────────────────
    {
      match:     'Gram-negative',
      statusKey: 'Gram-negativeStatus',
      recKey:    'Gram-negativeRecommendation',
      interKey:  'Gram-negativeInterpritation',
    },
    {
      match:     'HIV',
      statusKey: 'HIVStatus',
      recKey:    'HIVRecommendation',
      interKey:  'HIVInterpritation',
    },
    {
      match:     'Respiratory',
      statusKey: 'RespiratoryDiseaseStatus',
      recKey:    'RespiratoryDiseaseRecommendation',
      interKey:  'RespiratoryDiseaseInterpritation',
    },
    {
      match:     'SARS-CoV',
      statusKey: 'SARSCoVStatus',
      recKey:    'SARSCoVRecommendation',
      interKey:  'SARSCoVInterpritation',
    },
    {
      match:     'Inflammatory conditions',
      statusKey: 'InflammatoryConditionsStatus',
      recKey:    'InflammatoryConditionsRecommendation',
      interKey:  'InflammatoryConditionsInterpritation',
    },
    {
      match:     'Inflammation (TNF',
      statusKey: 'InflammationStatus',
      recKey:    'InflammationRecommendation',
      interKey:  'InflammationInterpritation',
    },
  ],

  // ── Vendor / branding ─────────────────────────────────────────────────────
  vendor: {
    vendorName:    'NMC Genetics',
    vendorId:      'NMC',
    themeColor:    '#83f3b4',
    logoUrl:       `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl:  `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor:  '',
    textColor:     '',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay:  '',
    coverPageImg:  '',
  },

  // ── Template ──────────────────────────────────────────────────────────────
  // The existing template function — not modified.
  // It receives PdfGeneratorOptions and returns a full HTML string.
  //
  // NOTE: The immunity template currently reads from opts.reportData directly
  // using the old ImmunityApiResponse shape. The adapter in route.ts bridges
  // GenericApiResponse → legacy shape so the template needs zero changes.
  templateFn: buildImmunityReportHtml as any,
};
