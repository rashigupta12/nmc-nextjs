// ============================================================
// Report Config — Kidney Health
//
// Pattern: Same as Eye Health (TestMaster-based + patientAdditional)
// ============================================================


import { buildKidneyReportHtml } from '@/lib/kidneyHeadlthPdf/kidneyTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const kidneyReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:    'kidney-health',
  label: 'Kidney Health Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  pageDataSource: {
    type:          'testMaster',
    testId:        'NMC-KH01',           // Kidney Health test ID from TestMaster
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Mongoose model name for the patient additional collection
  patientAdditionalModel: 'PatientAdditionalKidneyHealth',

  // ── Sections ──────────────────────────────────────────────────────────────
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  autoFillMappings: [
    // Autosomal Dominant Polycystic Kidney Disease
    {
      match:     'Autosomal Dominant Polycystic Kidney Disease',
      statusKey: 'autosomalDominantStatus',
      recKey:    'autosomalDominantRecommendation',
      interKey:  'autosomalDominantInterpritation',
    },
    // Hypomagnesemia (Low Magnesium)
    {
      match:     'Hypomagnesemia (Low Magnesium)',
      statusKey: 'hypomagnesemiaStatus',
      recKey:    'hypomagnesemiaRecommendation',
      interKey:  'hypomagnesemiaInterpritation',
    },
    // Chronic Kidney Disease (CKD)
    {
      match:     'Chronic Kidney Disease (CKD)',
      statusKey: 'chronicKidneyStatus',
      recKey:    'chronicKidneyRecommendation',
      interKey:  'chronicKidneyInterpritation',
    },
    // Childhood Steroid-Sensitive Nephrotic Syndrome
    {
      match:     'Childhood Steroid-Sensitive Nephrotic Syndrome',
      statusKey: 'steroidSensitiveStatus',
      recKey:    'steroidSensitiveRecommendation',
      interKey:  'steroidSensitiveInterpretation',
    },
    // Idiopathic Membranous Nephropathy
    {
      match:     'Idiopathic Membranous Nephropathy',
      statusKey: 'idiopathicStatus',
      recKey:    'idiopathicRecommendation',
      interKey:  'idiopathicInterpretation',
    },
    // Renal Calculi (Kidney Stone Disease)
    {
      match:     'Renal calculi (Kidney Stone Disease)',
      statusKey: 'renalCalculiStatus',
      recKey:    'renalCalculiRecommendation',
      interKey:  'renalCalculiInterpretation',
    },
  ],

  // ── Vendor / branding ─────────────────────────────────────────────────────
  vendor: {
    vendorName:    'NMC Genetics',
    vendorId:      'NMC',
    themeColor:    '#6b7f8c',            // Kidney Health theme color (slate gray)
    logoUrl:       `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl:  `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor:  '',
    textColor:     '#4d4d4d',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay:  '',
    coverPageImg:  `${BASE_URL}/assets/reportimg/kidney_images/cover_page.jpg`,
  },

  // ── Template ────────────────────────────────────────────────────────────────
  templateFn: buildKidneyReportHtml as any,
};