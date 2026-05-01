// lib/reportEngine/reports/autoimmune.config.ts
// ============================================================
// Report Config — Autoimmune Health
//
// Updated for dual database architecture
// ============================================================

import { buildAutoimmuneReportHtml } from '@/lib/autoimmunePdf/autoimmuneTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
const TEST_UUID = '464ed484-6de9-421c-a5c7-0d318dc48bd6'; // Replace with actual UUID

export const autoimmuneReportConfig: ReportTypeConfig = {
  id: 'autoimmune-health',
  label: 'Autoimmune Health Report',

  pageDataSource: {
    type: 'testMaster',
    testId: TEST_UUID,  // Now using UUID instead of human-readable string
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Unified PatientFinalReport model
  patientAdditionalModel: 'PatientFinalReport',

  sections: [],

  autoFillMappings: [
    {
      match: 'Ankylosing Spondylitis',
      statusKey: 'status',     // Now accessed via condition object
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Crohns Disease',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Celiac Disease',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Systemic lupus erythematosus',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Rheumatoid Arthritis',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Sj grens Syndrome',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Primary Biliary Cirrhosis',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Psoriasis',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
  ],

  vendor: {
    vendorName: 'NMC Genetics',
    vendorId: 'NMC',
    themeColor: '#5b244e',
    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor: '',
    textColor: '#4d4d4d',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay: '',
    coverPageImg: `${BASE_URL}/assets/reportimg/autoimmune_img/coverPage.jpg`,
  },

  templateFn: buildAutoimmuneReportHtml as any,
};