// lib/reportEngine/reports/immunity.config.ts
// ============================================================
// Report Config — Immunity
//
// Updated for dual database architecture
// ============================================================

import { ReportTypeConfig } from '../types';
import { buildImmunityReportHtml } from '@/lib/ImmunePdf/immunityTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
const TEST_UUID = '00000000-0000-0000-0000-000000000002'; // Replace with actual UUID

export const immunityReportConfig: ReportTypeConfig = {
  id: 'immunity',
  label: 'Immunity Report',

  pageDataSource: {
    type: 'testMaster',
    testId: TEST_UUID,  // UUID from Neon test_catalog
    pageDataModel: 'GenePageData',
    pageDescModel: 'GenePageDesc',
  },

  patientAdditionalModel: 'PatientFinalReport',

  sections: [
    { id: 'A', label: 'Detoxification' },
    { id: 'B', label: 'Micronutrients' },
    { id: 'C', label: 'Immunogenomic Profile' },
  ],

  autoFillMappings: [
    // Section A: Detoxification
    {
      match: 'Phase-I Detoxification',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Phase-II Detoxification',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Oxidative Stress',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },

    // Section B: Micronutrients
    {
      match: 'Vitamin B9',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Vitamin D',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },

    // Section C: Immunogenomic
    {
      match: 'Gram-negative',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'HIV',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Respiratory',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'SARS-CoV',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Inflammatory conditions',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
    {
      match: 'Inflammation (TNF',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
    },
  ],

  vendor: {
    vendorName: 'NMC Genetics',
    vendorId: 'NMC',
    themeColor: '#83f3b4',
    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor: '',
    textColor: '',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay: '',
    coverPageImg: '',
  },

  templateFn: buildImmunityReportHtml as any,
};