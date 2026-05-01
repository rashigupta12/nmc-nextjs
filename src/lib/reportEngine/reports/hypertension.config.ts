// lib/reportEngine/reports/hypertension.config.ts
// ============================================================
// Report Config — Hypertension
//
// Pharmacogenetic report for Hypertension medication guidance.
// Data comes directly from geneReportTemp (hypertension_report data)
//
// Note: This report type does NOT use PatientFinalReport.
// Data comes directly from GeneReportTemp only
// ============================================================

import { buildHypertensionReportHtml } from '@/lib/hypertensionPdf/hypertensionTemplate';
import { ReportTypeConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
// Run: SELECT id FROM test_catalog WHERE test_code = 'NMC-HTN';
const HYPERTENSION_TEST_UUID = '00000000-0000-0000-0000-000000000013';

export const hypertensionReportConfig: ReportTypeConfig = {
  id: 'hypertension',
  label: 'Hypertension Pharmacogenomic Panel',

  pageDataSource: {
    type: 'testMaster',
    testId: HYPERTENSION_TEST_UUID,  // UUID from Neon test_catalog
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // No separate patient additional model - data comes directly from GeneReportTemp
  patientAdditionalModel: undefined,

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

  templateFn: buildHypertensionReportHtml as any,
};