// ============================================================
// Report Config — Clopidogrel
//
// Pharmacogenetic report for Clopidogrel sensitivity.
// Uses ClopidogrelRecommendation reference data for phenotype interpretation.
//
// What this file owns:
//   - TestMaster testId: "NMC_CLOPI"
//   - Custom patientAdditionalResolver for ClopidogrelRecommendation lookup
//   - Single flat section (no A/B/C sections)
//   - Vendor/branding settings with lab address
//   - Template function
// ============================================================

import { ReportTypeConfig } from '../types';

// Template import
import { buildClopidogrelReportHtml } from '@/lib/clopidogrelPdf/clopidogrelTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const clopidogrelReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: 'clopidogrel',
  label: 'Clopidogrel Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Uses TestMaster lookup: fetches GenePageData + GenePageDesc filtered
  // by the TestMaster record matching testId "NMC_CLOPI"
  pageDataSource: {
    type: 'testMaster',
    testId: 'NMC_CLOPI',
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Uses ClopidogrelRecommendation model - will be resolved by custom resolver
  patientAdditionalModel: 'ClopidogrelRecommendation',

  // ── Sections ──────────────────────────────────────────────────────────────
  // Flat report - no sections
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  // No auto-fill needed - data comes from ClopidogrelRecommendation lookup
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
  templateFn: buildClopidogrelReportHtml as any,
};
