// lib/reportEngine/reports/womenHealth.config.ts
// ============================================================
// Report Config — Women's Health
//
// Uses direct page data strategy and PatientFinalReport
// Updated for dual database architecture
// ============================================================

import { ReportTypeConfig } from '../types';
import { buildWomenHealthReportHtml } from '@/lib/womenHealthPdf/womenHealthTemplate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// TODO: Replace with actual UUID from Neon test_catalog table
const TEST_UUID = '00000000-0000-0000-0000-000000000006'; // Replace with actual UUID

// Async resolver for Women's Health recommendations
async function womenHealthRecommendationResolver(
  conditionMatch: string,
  status: string
): Promise<{ recommendation: string; interpretation: string } | null> {
  try {
    const { default: GenericReportRecommendation } = await import(
      '@/models/genericReportRecommendation'
    );

    const doc = await GenericReportRecommendation.findOne({
      testId: TEST_UUID,
      conditionName: conditionMatch,
    });

    if (!doc) return null;

    const item = doc.data.find((d: any) => d.status === status);
    if (!item) return null;

    return {
      recommendation: item.recommendation ?? '',
      interpretation: item.interpretation ?? '',
    };
  } catch (error) {
    console.error('[womenHealthRecommendationResolver] Error:', error);
    return null;
  }
}

export const womenHealthReportConfig: ReportTypeConfig = {
  id: 'women-health',
  label: "Women's Health Report",

  pageDataSource: {
    type: 'direct',
    pageDataModel: 'WomenHealthPageData',
    pageDescModel: 'WomenHealthPageDesc',
  },

  patientAdditionalModel: 'PatientFinalReport',

  sections: [],

  autoFillMappings: [
    {
      match: 'Osteoporosis',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Osteoporosis', status),
    },
    {
      match: 'Rheumatoid Arthritis',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Rheumatoid Arthritis', status),
    },
    {
      match: 'Polycystic Ovary Syndrome',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Polycystic Ovary Syndrome', status),
    },
    {
      match: 'Pregnancy Loss',
      statusKey: 'status',
      recKey: 'recommendation',
      interKey: 'interpretation',
      asyncResolver: (match, status) =>
        womenHealthRecommendationResolver('Pregnancy Loss', status),
    },
  ],

  vendor: {
    vendorName: 'NMC Genetics',
    vendorId: 'NMC',
    themeColor: '#fe84ff',
    logoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    coverLogoUrl: `${BASE_URL}/nmc_report_img/nmcgeneticslogo.png`,
    primaryColor: '',
    textColor: '',
    footerLogoUrl: '',
    vendorAddress: '',
    vendorContact: '',
    imageOverlay: '',
  },

  templateFn: buildWomenHealthReportHtml as any,
};