// ============================================================
// Immunity Report — TypeScript Types
// Mirrors types/womenHealthReport.ts
// ============================================================

import { ImmunityApiResponse } from '@/services/immunityReportService';

// Vendor settings (shared with other report types)
export interface VendorSettings {
  coverPageImg: string;
  vendorName:    string;
  vendorId:      string;
  logoUrl:       string;
  coverLogoUrl:  string;
  themeColor:    string;
  primaryColor:  string;
  textColor:     string;
  footerLogoUrl: string;
  vendorAddress: string;
  vendorContact: string;
  imageOverlay:  string;
  backCoverImg?: string;
}

// Options passed to the PDF generator and template builder
export interface PdfGeneratorOptions {
  reportData: ImmunityApiResponse;
  vendor:     VendorSettings;
}
