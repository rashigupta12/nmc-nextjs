// ============================================================
// Report Config — Eye Health
//
// Pattern: Same as Men's Health (TestMaster-based + patientAdditional)
// ============================================================

import { buildEyeHealthReportHtml } from '@/lib/eyeHealthPdf/eyeHealthTemplate';
import { ReportTypeConfig } from '../types';


const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const eyeHealthReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:    'eye-health',
  label: 'Eye Health Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  pageDataSource: {
    type:          'testMaster',
    testId:        'NMC-EH01',           // Eye Health test ID from TestMaster
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Mongoose model name for the patient additional collection
  patientAdditionalModel: 'PatientAdditionalEyeHealth',

  // ── Sections ──────────────────────────────────────────────────────────────
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  autoFillMappings: [
    // Diabetic Retinopathy
    {
      match:     'Diabetic Retinopathy',
      statusKey: 'diabeticRetinopathyStatus',
      recKey:    'diabeticRetinopathyRecommendation',
      interKey:  'diabeticRetinopathyInterpritation',
    },
    // Glaucoma
    {
      match:     'Glaucoma',
      statusKey: 'glaucomaStatus',
      recKey:    'glaucomaRecommendation',
      interKey:  'glaucomaInterpritation',
    },
    // Age Related Macular Degeneration
    {
      match:     'Age-related macular degeneration',
      statusKey: 'ageRelatedStatus',
      recKey:    'ageRelatedRecommendation',
      interKey:  'ageRelatedInterpritation',
    },
    // Retinal Occlusion
    {
      match:     'Retinal occlusion',
      statusKey: 'retinalOcclusionStatus',
      recKey:    'retinalOcclusionRecommendation',
      interKey:  'retinalOcclusionInterpretation',  // Note: correct spelling
    },
  ],

  // ── Vendor / branding ─────────────────────────────────────────────────────
  vendor: {
    vendorName:    'NMC Genetics',
    vendorId:      'NMC',
    themeColor:    '#3FA8A8',             // Eye Health theme color (teal)
    logoUrl:       `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl:  `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor:  '',
    textColor:     '#4d4d4d',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay:  '',
    coverPageImg:  `${BASE_URL}/assets/reportimg/eye_images/cover.jpg`,
  },

  // ── Template (to be created later) ────────────────────────────────────────
  templateFn: buildEyeHealthReportHtml as any,
};