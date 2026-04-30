// lib/reportEngine/reports/warfarin.config.ts
// ============================================================
// Report Config — Warfarin
//
// Pharmacogenetic report for Warfarin and Acenocoumarol dosage.
// Uses CYP2C9 and VKORC1 genotypes for dose calculation.
//
// Note: This report type does NOT use PatientFinalReport.
// Data comes directly from GeneReportTemp + WarfarinRecommendation
// ============================================================

import { buildWarfarinReportHtml } from '@/lib/warfarinPdf/warfarinTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
// Run: SELECT id FROM test_catalog WHERE test_code = 'NMC_WAC';
const WARFARIN_TEST_UUID = '00000000-0000-0000-0000-000000000012';

export const warfarinReportConfig: ReportTypeConfig = {
  id: 'warfarin',
  label: 'Warfarin Report',

  pageDataSource: {
    type: 'testMaster',
    testId: WARFARIN_TEST_UUID,  // UUID from Neon test_catalog
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Uses WarfarinRecommendation model - this is correct
  // The route.ts has special handling for 'warfarin' report_type
  patientAdditionalModel: 'WarfarinRecommendation',

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

  templateFn: buildWarfarinReportHtml as any,
};