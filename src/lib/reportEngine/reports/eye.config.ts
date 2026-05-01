// lib/reportEngine/reports/eye.config.ts
// ============================================================
// Report Config — Eye Health
//
// Updated for dual database architecture
// ============================================================

import { buildEyeHealthReportHtml } from '@/lib/eyeHealthPdf/eyeHealthTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
const TEST_UUID = '00000000-0000-0000-0000-000000000001'; // Replace with actual UUID

export const eyeHealthReportConfig: ReportTypeConfig = {
  id: 'eye-health',
  label: 'Eye Health Report',

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
      match: 'Diabetic Retinopathy',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Glaucoma',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Age-related macular degeneration',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Retinal occlusion',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
  ],

  vendor: {
    vendorName: 'NMC Genetics',
    vendorId: 'NMC',
    themeColor: '#3FA8A8',
    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor: '',
    textColor: '#4d4d4d',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay: '',
    coverPageImg: `${BASE_URL}/assets/reportimg/eye_images/cover.jpg`,
  },

  templateFn: buildEyeHealthReportHtml as any,
};