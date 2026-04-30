// ============================================================
// Report Config — Warfarin
//
// Pharmacogenetic report for Warfarin and Acenocoumarol dosage.
// Uses CYP2C9 and VKORC1 genotypes for dose calculation.
//
// What this file owns:
//   - TestMaster testId: "NMC_WAC"
//   - Custom patientAdditionalResolver for warfarin lookup
//   - Single flat section (no A/B/C sections)
//   - Vendor/branding settings with lab address
//   - Template function
// ============================================================

import { buildWarfarinReportHtml } from '@/lib/warfarinPdf/warfarinTemplate';
import { ReportTypeConfig } from '../types';



const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const warfarinReportConfig: ReportTypeConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: 'warfarin',
  label: 'Warfarin Report',

  // ── Data sourcing ─────────────────────────────────────────────────────────
  // Uses TestMaster lookup: fetches GenePageData + GenePageDesc filtered
  // by the TestMaster record matching testId "NMC_WAC"
  pageDataSource: {
    type: 'testMaster',
    testId: 'NMC_WAC',
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  // Uses warfarin recommendation data - will be resolved by custom resolver
  patientAdditionalModel: 'WarfarinRecommendation',

  // ── Sections ──────────────────────────────────────────────────────────────
  // Flat report - no sections
  sections: [],

  // ── Auto-fill mappings ────────────────────────────────────────────────────
  // No auto-fill needed - data comes from warfarin lookup
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
  templateFn: buildWarfarinReportHtml as any,
};