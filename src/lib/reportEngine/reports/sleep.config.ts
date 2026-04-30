// ============================================================
// Report Config — Sleep Health
//
// This is the CANONICAL reference config for Sleep Report.
// Pattern: Same as Immunity (TestMaster-based + patientAdditional)
//
// What this file owns:
//   - Which TestMaster record to scope page data to
//   - Which patientAdditional model to query
//   - Auto-fill mappings (condition name → patientAdditional fields)
//   - Vendor / branding settings
//   - The template function (imported from sleep template file)
// ============================================================

import { ReportTypeConfig } from '../types';

// Template import — uses lowercase directory name (sleepPdf)
import { buildSleepReportHtml } from '@/lib/sleepPdf/sleepTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const sleepReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:    'sleep',
  label: 'Sleep Health Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Uses TestMaster lookup: fetches GenePageData + GenePageDesc filtered
  // by the TestMaster record matching testId for Sleep
  pageDataSource: {
    type:          'testMaster',
    testId:        'NMC-SL01',           // TODO: Confirm actual test ID
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Mongoose model name for the patient additional collection
  patientAdditionalModel: 'PatientAdditionalSleep',

  // ── Sections ──────────────────────────────────────────────────────────────
  // Sleep report is flat (no sections like A/B/C) — all conditions in one sequence
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  // Each entry: when patientAdditional[statusKey] has a value,
  // override all conditions whose name/display_condition includes `match`.
  //
  // Note: Some values are manually set (obstructiveSleep, durationOfSleep, etc.)
  // Some are computed by algorithms (vitB9, vitD, glutenIntolerance)
  autoFillMappings: [
    // ── Manual overrides (from sleep_additional table) ──────────────────────
    {
      match:     'Obstructive Sleep Apnea',
      statusKey: 'obstructiveSleepStatus',
      recKey:    'obstructiveSleepRecommendation',
      interKey:  'obstructiveSleepInterpritation',  // typo preserved from DB
    },
    {
      match:     'Duration of Sleep',
      statusKey: 'durationOfSleepStatus',
      recKey:    'durationOfSleepRecommendation',
      interKey:  'durationOfSleepInterpritation',
    },
    {
      match:     'Caffine Related Insomnia',
      statusKey: 'caffineInsomniaStatus',
      recKey:    'caffineInsomniaRecommendation',
      interKey:  'caffineInsomniaInterpritation',
    },
    {
      match:     'Restless Legs Syndrome',
      statusKey: 'restlessLegsStatus',
      recKey:    'restlessLegsRecommendation',
      interKey:  'restlessLegsInterpretation',  // note: correct spelling here
    },
    {
      match:     'Narcolepsy',
      statusKey: 'narcolepsyStatus',
      recKey:    'narcolepsyRecommendation',
      interKey:  'narcolepsyInterpritation',
    },
    {
      match:     'Chronic Obstructive',
      statusKey: 'chronicObstructiveStatus',
      recKey:    'chronicObstructiveRecommendation',
      interKey:  'chronicObstructiveInterpritation',
    },
    {
      match:     'Lactose Intolerance',
      statusKey: 'lactoseIntoleranceStatus',
      recKey:    'lactoseIntoleranceRecommendation',
      interKey:  'lactoseIntoleranceInterpritation',
    },
    {
      match:     'Gluten Intolerance',
      statusKey: 'glutenIntoleranceStatus',
      recKey:    'glutenIntoleranceRecommendation',
      interKey:  'glutenIntoleranceInterpritation',
    },
    {
      match:     'Higher HDL',
      statusKey: 'higherHDLStatus',
      recKey:    'higherHDLRecommendation',
      interKey:  'higherHDLInterpritation',
    },

    // ── Computed values (from algorithms) ────────────────────────────────────
    {
      match:     'Vitamin B9',
      statusKey: 'vitB9Status',
      recKey:    'vitB9Recommendation',
      interKey:  'vitB9Interpretation',
    },
    {
      match:     'Vitamin D',
      statusKey: 'vitDStatus',
      recKey:    'vitDRecommendation',
      interKey:  'vitDInterpritation',
    },
  ],

  // ── Vendor / branding ─────────────────────────────────────────────────────
  vendor: {
    vendorName:    'NMC Genetics',
    vendorId:      'NMC',
    themeColor:    '#ffa700',            // Sleep theme color (amber/orange)
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
  // The sleep template function — to be created from PHP template
  templateFn: buildSleepReportHtml as any,
};