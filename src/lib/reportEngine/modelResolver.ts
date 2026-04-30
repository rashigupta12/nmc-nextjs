// ============================================================
// Report Engine — Model Resolver
//
// The ONLY file in the engine that imports Mongoose.
// Resolves model names → Mongoose model instances at runtime.
// Also handles the "testMaster" page data fetching strategy.
// ============================================================

import mongoose from 'mongoose';
import { PageDataSource } from './types';

// ─── Generic model resolver ───────────────────────────────────────────────────

/**
 * Looks up a registered Mongoose model by name.
 * All models must be imported (registered) somewhere before this is called.
 * The generic route's barrel import at the top of route.ts handles that.
 */
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

/**
 * Fetches pageData and pageDesc arrays according to the config's strategy.
 *
 * Strategy "direct":
 *   Fetches all documents from the named collections with no filter.
 *   Used by Women's Health which has its own dedicated collections.
 *
 * Strategy "testMaster":
 *   Resolves the TestMaster record by testId first, then fetches
 *   pageData and pageDesc filtered by that TestMaster's _id.
 *   Used by Immunity and all future report types.
 */
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

  // type === 'testMaster'
  const TestMaster = resolveModel('TestMaster');
  const testMaster = await (TestMaster as any).getByTestId(source.testId);

  if (!testMaster) {
    throw new Error(
      `[ReportEngine] TestMaster record not found for testId "${source.testId}"`
    );
  }

  const testMasterId = testMaster._id.toString();
  const PageDataModel = resolveModel(source.pageDataModel);
  const PageDescModel = resolveModel(source.pageDescModel);

  const [pageData, pageDesc] = await Promise.all([
    (PageDataModel as any).findByTestId(testMasterId),
    (PageDescModel as any).findByTestId(testMasterId),
  ]);

  return { pageData, pageDesc };
}

// ─── Patient additional resolver ─────────────────────────────────────────────

/**
 * Fetches the patientAdditional document for a given patient ObjectId.
 * Returns null if no document exists (valid — not all patients have additional data).
 */
export async function resolvePatientAdditional(
  modelName: string,
  patientObjectId: mongoose.Types.ObjectId | string
): Promise<Record<string, any> | null> {
  try {
    const Model = resolveModel(modelName);
    const doc = await Model.findOne({ patientId: patientObjectId });
    return doc ? doc.toObject() : null;
  } catch {
    // Model may not be registered for this report type — not a hard failure
    return null;
  }
}

// ─── GeneReportTemp fetcher ───────────────────────────────────────────────────

/**
 * Fetches all GeneReportTemp rows for a given patientId string.
 * Returns plain objects (Mongoose _doc unwrapped).
 */
export async function resolveGeneReportData(patientId: string): Promise<any[]> {
  const GeneReportTemp = resolveModel('GeneReportTemp');
  const docs = await GeneReportTemp.find({
    patientId: patientId.toString().toUpperCase(),
  });
  return docs;
}
