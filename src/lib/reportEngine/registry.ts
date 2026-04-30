// ============================================================
// Report Engine — Registry
//
// All report type configs are registered here.
// Adding a new report type = import config + one line below.
// The route and engine import ONLY this file — they know
// nothing about specific report types.
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
  'eye-health': eyeHealthReportConfig,  // ← ADD THIS
  'clopidogrel': clopidogrelReportConfig,
  'kidney-health': kidneyReportConfig,  // ← ADD THIS
  'autoimmune-health': autoimmuneReportConfig,  // ← ADD THIS
  'statin': statinReportConfig,  // ←
  'warfarin': warfarinReportConfig,  // ← ADD THIS
  'hypertension': hypertensionReportConfig,  // ← ADD THIS

  // ─── Add new report types here ──────────────────────────────
  // 'cardio':    cardiovascularReportConfig,
  // 'nutrition': nutritionReportConfig,
  // 'skin':      skinReportConfig,
};

// ─── Accessors ───────────────────────────────────────────────────────────────

/**
 * Returns the config for a given report type ID.
 * Throws a descriptive error if the type is not registered —
 * the route catches this and returns a 400.
 */
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

/**
 * Returns a lightweight list of all registered report types.
 * Used by the frontend page to populate the report type selector.
 */
export function listReportTypes(): Array<{ id: string; label: string }> {
  return Object.values(REPORT_REGISTRY).map(c => ({
    id: c.id,
    label: c.label,
  }));
}

/**
 * Returns true if a given report type ID is registered.
 * Useful for validation without throwing.
 */
export function isValidReportType(id: string): boolean {
  return id in REPORT_REGISTRY;
}
