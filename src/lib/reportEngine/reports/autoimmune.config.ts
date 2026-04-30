// ============================================================
// Report Config — Autoimmune Health
//
// Pattern: Same as Eye Health (TestMaster-based + patientAdditional)
// ============================================================

import { buildAutoimmuneReportHtml } from '@/lib/autoimmunePdf/autoimmuneTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const autoimmuneReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:    'autoimmune-health',
  label: 'Autoimmune Health Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  pageDataSource: {
    type:          'testMaster',
    testId:        'NMC-AI01',           // Autoimmune Health test ID from TestMaster
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Mongoose model name for the patient additional collection
  patientAdditionalModel: 'PatientAdditionalAutoimmuneHealth',

  // ── Sections ──────────────────────────────────────────────────────────────
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  autoFillMappings: [
    // Ankylosing Spondylitis
    {
      match:     'Ankylosing Spondylitis',
      statusKey: 'ankylosingSpondylitisStatus',
      recKey:    'ankylosingSpondylitisRecommendation',
      interKey:  'ankylosingSpondylitisInterpritation',
    },
    // Crohn's Disease
    {
      match:     'Crohns Disease',
      statusKey: 'crohnsDiseaseStatus',
      recKey:    'crohnsDiseaseRecommendation',
      interKey:  'crohnsDiseaseInterpritation',
    },
    // Celiac Disease
    {
      match:     'Celiac Disease',
      statusKey: 'celiacDiseaseStatus',
      recKey:    'celiacDiseaseRecommendation',
      interKey:  'celiacDiseaseInterpritation',
    },
    // Systemic Lupus Erythematosus
    {
      match:     'Systemic lupus erythematosus',
      statusKey: 'systemicLupusStatus',
      recKey:    'systemicLupusRecommendation',
      interKey:  'systemicLupusInterpretation',
    },
    // Rheumatoid Arthritis
    {
      match:     'Rheumatoid Arthritis',
      statusKey: 'rheumatoidArthritisStatus',
      recKey:    'rheumatoidArthritisRecommendation',
      interKey:  'rheumatoidArthritisInterpritation',
    },
    // Sjögren's Syndrome
    {
      match:     'Sj grens Syndrome',
      statusKey: 'sjGrensStatus',
      recKey:    'sjGrensRecommendation',
      interKey:  'sjGrensInterpritation',
    },
    // Primary Biliary Cirrhosis
    {
      match:     'Primary Biliary Cirrhosis',
      statusKey: 'primaryBiliaryStatus',
      recKey:    'primaryBiliaryRecommendation',
      interKey:  'primaryBiliaryInterpritation',
    },
    // Psoriasis
    {
      match:     'Psoriasis',
      statusKey: 'psoriasisStatus',
      recKey:    'psoriasisRecommendation',
      interKey:  'psoriasisInterpritation',
    },
  ],

  // ── Vendor / branding ─────────────────────────────────────────────────────
  vendor: {
    vendorName:    'NMC Genetics',
    vendorId:      'NMC',
    themeColor:    '#5b244e',            // Autoimmune Health theme color (deep purple)
    logoUrl:       `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl:  `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor:  '',
    textColor:     '#4d4d4d',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay:  '',
    coverPageImg:  `${BASE_URL}/assets/reportimg/autoimmune_img/coverPage.jpg`,
  },

  // ── Template ────────────────────────────────────────────────────────────────
  templateFn: buildAutoimmuneReportHtml as any,
};