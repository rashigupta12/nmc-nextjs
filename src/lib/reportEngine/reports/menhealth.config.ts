// lib/reportEngine/reports/menhealth.config.ts
// ============================================================
// Report Config — Men Health
//
// Updated for dual database architecture
// ============================================================

import { buildMenHealthReportHtml } from '@/lib/menHealthPdf/menHealthTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
const TEST_UUID = '00000000-0000-0000-0000-000000000004'; // Replace with actual UUID

export const menHealthReportConfig: ReportTypeConfig = {
  id: 'men-health',
  label: 'Men Health Report',

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
      match: 'Prostate Cancer',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Alopecia Areata',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Low Testosterone',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
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

  templateFn: buildMenHealthReportHtml as any,
};