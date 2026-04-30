// ============================================================
// Report Config — Hypertension
//
// Pharmacogenetic report for Hypertension medication guidance.
// Data comes directly from geneReportTemp (hypertension_report data)
// ============================================================

import { buildHypertensionReportHtml } from '@/lib/hypertensionPdf/hypertensionTemplate';
import { ReportTypeConfig } from '../types';


const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const hypertensionReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: 'hypertension',
  label: 'Hypertension Pharmacogenomic Panel',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Uses testMaster approach (like statin) - this matches your existing pattern
  pageDataSource: {
    type: 'testMaster',
    testId: 'NMC-HTN',  // Your test ID from MongoDB
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // No separate patient additional model needed - leave undefined
  patientAdditionalModel: undefined,

  // ── Sections ──────────────────────────────────────────────────────────────
  // Sections should match the structure from your existing configs
  // Looking at your working reports, sections might be defined differently
  // Let me check the actual SectionConfig type
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  autoFillMappings: [],

  // ── Vendor / branding ─────────────────────────────────────────────────────
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

  // ── Template ──────────────────────────────────────────────────────────────
  templateFn: buildHypertensionReportHtml as any,
};