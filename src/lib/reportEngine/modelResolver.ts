// lib/reportEngine/modelResolver.ts
// ============================================================
// Report Engine — Model Resolver
//
// The ONLY file in the engine that imports Mongoose.
// Resolves model names → Mongoose model instances at runtime.
// Updated to handle both UUID and display ID formats for patientId.
// ============================================================

import mongoose from 'mongoose';
import { PageDataSource } from './types';

// ─── Generic model resolver ───────────────────────────────────────────────────

export function resolveModel(modelName: string): mongoose.Model<any> {
  const model = mongoose.models[modelName];
  if (!model) {
    throw new Error(
      `[ReportEngine] Model "${modelName}" is not registered. ` +
      `Ensure its file is imported before the resolver runs.`
    );
  }
  return model;
}

// ─── Page data resolver ───────────────────────────────────────────────────────

export interface ResolvedPageData {
  pageData: any[];
  pageDesc: any[];
}

export async function resolvePageData(
  source: PageDataSource
): Promise<ResolvedPageData> {
  if (source.type === 'direct') {
    const PageDataModel = resolveModel(source.pageDataModel);
    const PageDescModel = resolveModel(source.pageDescModel);

    const [pageData, pageDesc] = await Promise.all([
      PageDataModel.find({}),
      PageDescModel.find({}),
    ]);

    return { pageData, pageDesc };
  }

  // type === 'testMaster' — direct query using testId (UUID from Neon)
  const PageDataModel = resolveModel(source.pageDataModel);
  const PageDescModel = resolveModel(source.pageDescModel);

  const [pageData, pageDesc] = await Promise.all([
    PageDataModel.find({ testId: source.testId }),
    PageDescModel.find({ testId: source.testId }),
  ]);

  return { pageData, pageDesc };
}

// ─── Patient additional resolver — uses PatientFinalReport ────────────────────

/**
 * Fetches the patientAdditional document from PatientFinalReport.
 * Parameters can be either UUIDs or display IDs from Neon.
 * Returns null if no report exists for this patient/sample/test.
 */
export async function resolvePatientAdditional(
  _modelName: string,
  patientId: string,   // Could be UUID or display ID (e.g., "P12345")
  sampleId: string,    // UUID from Neon samples table
  testId: string       // UUID from Neon test_catalog
): Promise<Record<string, any> | null> {
  try {
    const PatientFinalReport = resolveModel('PatientFinalReport');
    
    // Query by sampleId and testId (both are UUIDs)
    // For patientId, we need to match either UUID or display ID
    const doc = await PatientFinalReport.findOne({
      $or: [
        { patientId: patientId },           // Try exact match (could be UUID or display ID)
        { patientDisplayId: patientId }     // Alternative field if you store both
      ],
      sampleId,
      testId,
    });
    
    if (!doc) return null;
    
    // Transform conditions array to the expected format
    const result: Record<string, any> = {};
    for (const condition of doc.conditions) {
      result[condition.conditionName] = {
        status: condition.status,
        recommendation: condition.recommendation,
        interpretation: condition.interpretation,
        nutrition: condition.nutrition,
        lifestyle: condition.lifestyle,
        miscellaneous: condition.miscellaneous,
      };
    }
    
    return result;
  } catch (error) {
    console.error('[resolvePatientAdditional] Error:', error);
    return null;
  }
}

// ─── GeneReportTemp fetcher — uses sample UUID and test UUID ──────────────────

/**
 * Fetches all GeneReportTemp rows for a given patient, sample, and test.
 * - patientId: Could be UUID or display ID (stored as-is in MongoDB)
 * - sampleId: UUID from Neon samples table
 * - testId: UUID from Neon test_catalog
 */
export async function resolveGeneReportData(
  patientId: string,   // Could be UUID or display ID
  sampleId: string,    // UUID from Neon samples table
  testId: string       // UUID from Neon test_catalog
): Promise<any[]> {
  const GeneReportTemp = resolveModel('GeneReportTemp');
  
  // Query using all three identifiers for precise matching
  const docs = await GeneReportTemp.find({ 
    patientId, 
    sampleId, 
    testId 
  });
  
  return docs;
}