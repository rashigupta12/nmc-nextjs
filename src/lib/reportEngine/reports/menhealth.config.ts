// ============================================================
// Report Config — Men Health
//
// This is the CANONICAL reference config for Men Health Report.
// Pattern: Same as Immunity (TestMaster-based + patientAdditional)
//
// What this file owns:
//   - Which TestMaster record to scope page data to
//   - Which patientAdditional model to query
//   - Auto-fill mappings (condition name → patientAdditional fields)
//   - Vendor / branding settings
//   - The template function (imported from menHealth template file)
// ============================================================

import { buildMenHealthReportHtml } from '@/lib/menHealthPdf/menHealthTemplate';
import { ReportTypeConfig } from '../types';

// Template import

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const menHealthReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: 'men-health',
  label: 'Men Health Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Uses TestMaster lookup: fetches GenePageData + GenePageDesc filtered
  // by the TestMaster record matching testId for Men's Health
  pageDataSource: {
    type: 'testMaster',
    testId: 'NMC-MH01',           // Men's Health test ID from TestMaster
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Mongoose model name for the patient additional collection
  patientAdditionalModel: 'PatientAdditionalMenHealth',

  // ── Sections ──────────────────────────────────────────────────────────────
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  // Each entry: when patientAdditional[statusKey] has a value,
  // override all conditions whose name/display_condition includes `match`.
  autoFillMappings: [
    // Prostate Cancer
    {
      match: 'Prostate Cancer',
      statusKey: 'prostateCancerStatus',
      recKey: 'prostateCancerRecommendation',
      interKey: 'prostateCancerInterpritation',
    },
    // Alopecia Areata (Spot Baldness)
    {
      match: 'Alopecia Areata',
      statusKey: 'alopeciaAreataStatus',
      recKey: 'alopeciaAreataRecommendation',
      interKey: 'alopeciaAreataInterpritation',
    },
    // Low Testosterone
    {
      match: 'Low Testosterone',
      statusKey: 'lowTestosteroneStatus',
      recKey: 'lowTestosteroneRecommendation',
      interKey: 'lowTestosteroneInterpritation',
    },
  ],
  vendor: {
    vendorName: 'NMC Genetics',
    vendorId: 'NMC',

    themeColor: '#0F5A6A',
    primaryColor: '#1F7A8C',
    textColor: '#4d4d4d',

    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    footerLogoUrl: '',

    vendorAddress: '',
    vendorContact: '',

    imageOverlay: '',
    coverPageImg: `${BASE_URL}/assets/reportimg/mens_images/mens_cover.jpg`,
  },

  // ── Template ──────────────────────────────────────────────────────────────
  templateFn: buildMenHealthReportHtml as any,
};