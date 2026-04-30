// lib/reportEngine/reports/kidney.config.ts
// ============================================================
// Report Config — Kidney Health
//
// Updated for dual database architecture
// ============================================================

import { buildKidneyReportHtml } from '@/lib/kidneyHeadlthPdf/kidneyTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
const TEST_UUID = '00000000-0000-0000-0000-000000000003'; // Replace with actual UUID

export const kidneyReportConfig: ReportTypeConfig = {
  id: 'kidney-health',
  label: 'Kidney Health Report',

  pageDataSource: {
    type: 'testMaster',
    testId: TEST_UUID,  // UUID from Neon test_catalog
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  patientAdditionalModel: 'PatientFinalReport',

  sections: [],

  autoFillMappings: [
    {
      match: 'Autosomal Dominant Polycystic Kidney Disease',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Hypomagnesemia (Low Magnesium)',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Chronic Kidney Disease (CKD)',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Childhood Steroid-Sensitive Nephrotic Syndrome',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Idiopathic Membranous Nephropathy',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Renal calculi (Kidney Stone Disease)',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
  ],

  vendor: {
    vendorName: 'NMC Genetics',
    vendorId: 'NMC',
    themeColor: '#6b7f8c',
    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor: '',
    textColor: '#4d4d4d',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay: '',
    coverPageImg: `${BASE_URL}/assets/reportimg/kidney_images/cover_page.jpg`,
  },

  templateFn: buildKidneyReportHtml as any,
};