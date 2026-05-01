// lib/reportEngine/reports/clopidogrel.config.ts
// ============================================================
// Report Config — Clopidogrel
//
// Pharmacogenetic report for Clopidogrel sensitivity.
// Uses ClopidogrelRecommendation reference data for phenotype interpretation.
// 
// Note: This report type does NOT use PatientFinalReport.
// Data comes directly from GeneReportTemp + ClopidogrelRecommendation
// ============================================================

import { ReportTypeConfig } from '../types';
import { buildClopidogrelReportHtml } from '@/lib/clopidogrelPdf/clopidogrelTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
// Run: SELECT id FROM test_catalog WHERE test_code = 'NMC_CLOPI';
const CLOPIDOGREL_TEST_UUID = '00000000-0000-0000-0000-000000000010';

export const clopidogrelReportConfig: ReportTypeConfig = {
  id: 'clopidogrel',
  label: 'Clopidogrel Report',

  pageDataSource: {
    type: 'testMaster',
    testId: CLOPIDOGREL_TEST_UUID,  // UUID from Neon test_catalog
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Uses ClopidogrelRecommendation model - this is correct
  // The route.ts has special handling for 'clopidogrel' report_type
  patientAdditionalModel: 'ClopidogrelRecommendation',

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

  templateFn: buildClopidogrelReportHtml as any,
};