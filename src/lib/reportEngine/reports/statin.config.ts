// lib/reportEngine/reports/statin.config.ts
// ============================================================
// Report Config — Statin
//
// Pharmacogenetic report for Statin dosage.
// Uses statin reference data for phenotype interpretation.
//
// Note: This report type does NOT use PatientFinalReport.
// Data comes directly from GeneReportTemp + StatinRecommendation
// ============================================================

import { ReportTypeConfig } from '../types';
import { buildStatinReportHtml } from '@/lib/statinPdf/statinTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
// Run: SELECT id FROM test_catalog WHERE test_code = 'NMC_STN';
const STATIN_TEST_UUID = '00000000-0000-0000-0000-000000000011';

export const statinReportConfig: ReportTypeConfig = {
  id: 'statin',
  label: 'Statin Report',

  pageDataSource: {
    type: 'testMaster',
    testId: STATIN_TEST_UUID,  // UUID from Neon test_catalog
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Uses StatinRecommendation model - this is correct
  // The route.ts has special handling for 'statin' report_type
  patientAdditionalModel: 'StatinRecommendation',

  sections: [],

  autoFillMappings: [],

  vendor: {
    vendorName: 'NEOTECH WORLD LAB PRIVATE LIMITED',
    vendorId: 'NEOTECH',
    themeColor: '#1F487C',
    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor: '',
    textColor: '',
    footerLogoUrl: '',
    vendorAddress: `<b>NEOTECH WORLD LAB PRIVATE LIMITED</b><br>Neotech World lab Pvt. Ltd.,Plot no. 1,Second floor, Udyog Vihar Phase IV, Sec 18, Near Passport Seva Kendra,Gurugram, Haryana 122015<br>info@neotechworldlab.com<br>www.neotechworldlab.com`,
    vendorContact: 'info@neotechworldlab.com',
    imageOverlay: '',
    coverPageImg: '',
  },

  templateFn: buildStatinReportHtml as any,
};