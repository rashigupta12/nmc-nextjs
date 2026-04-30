// lib/reportEngine/registry.ts
// ============================================================
// Report Engine — Registry
//
// All report type configs are registered here.
// Adding a new report type = import config + one line below.
// ============================================================

import { ReportTypeConfig } from './types';
import { immunityReportConfig } from './reports/immunity.config';
import { womenHealthReportConfig } from './reports/womenHealth.config';
import { sleepReportConfig } from './reports/sleep.config';
import { menHealthReportConfig } from './reports/menhealth.config';
import { eyeHealthReportConfig } from './reports/eye.config';
import { clopidogrelReportConfig } from './reports/clopidogrel.config';
import { kidneyReportConfig } from './reports/kidney.config';
import { autoimmuneReportConfig } from './reports/autoimmune.config';
import { statinReportConfig } from './reports/statin.config';
import { warfarinReportConfig } from './reports/warfarin.config';
import { hypertensionReportConfig } from './reports/hypertension.config';

// ─── Registry map ────────────────────────────────────────────────────────────

const REPORT_REGISTRY: Record<string, ReportTypeConfig> = {
  'immunity': immunityReportConfig,
  'women-health': womenHealthReportConfig,
  'sleep': sleepReportConfig,
  'men-health': menHealthReportConfig,
  'eye-health': eyeHealthReportConfig,
  'clopidogrel': clopidogrelReportConfig,
  'kidney-health': kidneyReportConfig,
  'autoimmune-health': autoimmuneReportConfig,
  'statin': statinReportConfig,
  'warfarin': warfarinReportConfig,
  'hypertension': hypertensionReportConfig,
};

// ─── Accessors ───────────────────────────────────────────────────────────────

export function getReportConfig(id: string): ReportTypeConfig {
  const config = REPORT_REGISTRY[id];
  if (!config) {
    throw new Error(
      `Unknown report type: "${id}". ` +
      `Registered types: ${Object.keys(REPORT_REGISTRY).join(', ')}`
    );
  }
  return config;
}

export function listReportTypes(): Array<{ id: string; label: string }> {
  return Object.values(REPORT_REGISTRY).map(c => ({
    id: c.id,
    label: c.label,
  }));
}

export function isValidReportType(id: string): boolean {
  return id in REPORT_REGISTRY;
}