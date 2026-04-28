/*eslint-disable @typescript-eslint/no-explicit-any*/
import { db as neonDb } from '@/db';
import { TestCatalogTable } from '@/db/schema';
import { connectToMongoDB } from '@/lib/mongodb';
import GenericReportRecommendation, { RecommendationStatus } from '@/models/genericReportRecommendation';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// ── Constants ──────────────────────────────────────────────────────────────────

const DRUG_TEST_CODES = new Set(['NMC_CLOPI', 'NMC_WAC', 'NMC_STN']);

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateTestInNeon(testId: string) {
  const test = await neonDb
    .select()
    .from(TestCatalogTable)
    .where(eq(TestCatalogTable.id, testId))
    .limit(1);
  if (!test.length) {
    throw new Error(`Test with ID ${testId} not found in test_catalog`);
  }
  return test[0];
}

function normalizeConditionName(name: string): string {
  if (!name) return 'General';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function mapStatus(status: string): string {
  const s = status.toLowerCase().trim();
  switch (s) {
    case 'good':                    return RecommendationStatus.Good;
    case 'average':                 return RecommendationStatus.Average;
    case 'bad':
    case 'poor':                    return RecommendationStatus.Poor;
    case 'ultra metabolizer':       return RecommendationStatus.UltraMetabolizer;
    case 'extensive metabolizer':   return RecommendationStatus.ExtensiveMetabolizer;
    case 'intermediate metabolizer':return RecommendationStatus.IntermediateMetabolizer;
    case 'poor metabolizer':        return RecommendationStatus.PoorMetabolizer;
    case 'normal metabolizer':      return RecommendationStatus.NormalMetabolizer;
    case 'normal myopathy risk':    return RecommendationStatus.NormalMyopathyRisk;
    case 'intermediate myopathy risk': return RecommendationStatus.IntermediateMyopathyRisk;
    case 'high myopathy risk':      return RecommendationStatus.HighMyopathyRisk;
    default:                        return status; // keep as-is for unknown values
  }
}

// ── Drug-specific parsers ──────────────────────────────────────────────────────

function parseClopidogrelRows(jsonArray: any[], testId: string, testCode: string, testReportName: string) {
  return jsonArray.map((row: any) => ({
    testId,
    testCode,
    testReportName,
    conditionName: row.combined_genotype ?? row.combinedGenotype ?? `Row-${row.id}`,
    data: [
      {
        status: mapStatus(row.status ?? ''),
        recommendation: row.recommendation ?? '',
        additionalInfo: {
          drugType: 'clopidogrel',
          rowId: row.id,
          cyp2c19_2: row['CYP2C19*2'] ?? row.cyp2c19_2 ?? '',
          cyp2c19_3: row['CYP2C19*3'] ?? row.cyp2c19_3 ?? '',
          cyp2c19_17: row['CYP2C19*17'] ?? row.cyp2c19_17 ?? '',
          combinedGenotype: row.combined_genotype ?? row.combinedGenotype ?? '',
          implications: row.implications ?? '',
        },
      },
    ],
  }));
}

function parseWarfarinRows(jsonArray: any[], testId: string, testCode: string, testReportName: string) {
  return jsonArray.map((row: any) => ({
    testId,
    testCode,
    testReportName,
    conditionName: row.combined_genotype ?? row.combinedGenotype ?? `Row-${row.id}`,
    data: [
      {
        status: mapStatus(row.status ?? 'Normal Metabolizer'),
        recommendation: row.recommendation ?? '',
        additionalInfo: {
          drugType: 'warfarin',
          rowId: row.id,
          cyp2c9_2: row['CYP2C19*2'] ?? row.cyp2c9_2 ?? '',
          cyp2c9_3: row['CYP2C19*3'] ?? row.cyp2c9_3 ?? '',
          combinedGenotype: row.combined_genotype ?? row.combinedGenotype ?? '',
          implications: row.implications ?? '',
        },
      },
    ],
  }));
}

function parseStatinRows(jsonArray: any[], testId: string, testCode: string, testReportName: string) {
  return jsonArray.map((row: any) => ({
    testId,
    testCode,
    testReportName,
    conditionName: row.drug ?? `Row-${row.id}`,
    data: [
      {
        status: mapStatus(row.status ?? 'Normal myopathy risk'),
        recommendation: row.recommendation ?? '',
        additionalInfo: {
          drugType: 'statin',
          rowId: row.id,
          drug: row.drug ?? '',
          TT: row.TT ?? '',
          TC: row.TC ?? '',
          CC: row.CC ?? '',
          implications: row.implications ?? '',
        },
      },
    ],
  }));
}

// ── Standard (non-drug) parser ─────────────────────────────────────────────────

function parseStandardRows(
  jsonArray: any[],
  testId: string,
  testCode: string,
  testReportName: string
) {
  // Group by normalized condition name
  const conditionMap = new Map<string, Map<string, any>>();

  for (const record of jsonArray) {
    const rawConditionName =
      record.condition_name ?? record.conditionName ?? 'General';
    const conditionName = normalizeConditionName(rawConditionName);
    const status = mapStatus(record.status ?? '');

    if (!conditionMap.has(conditionName)) {
      conditionMap.set(conditionName, new Map());
    }

    const statusMap = conditionMap.get(conditionName)!;

    if (statusMap.has(status)) {
      // Merge — prefer first non-empty value
      const existing = statusMap.get(status);
      if (record.recommendation && !existing.recommendation)
        existing.recommendation = record.recommendation;
      if (record.interpretation && !existing.interpretation)
        existing.interpretation = record.interpretation;
      if ((record.recomNutrition ?? record.nutrition) && !existing.nutrition)
        existing.nutrition = record.recomNutrition ?? record.nutrition;
      if ((record.lifeStyle ?? record.lifestyle) && !existing.lifestyle)
        existing.lifestyle = record.lifeStyle ?? record.lifestyle;
      if (record.miscellaneous && !existing.miscellaneous)
        existing.miscellaneous = record.miscellaneous;
    } else {
      const entry: any = { status };
      if (record.recommendation) entry.recommendation = record.recommendation;
      if (record.interpretation) entry.interpretation = record.interpretation;
      if (record.recomNutrition ?? record.nutrition)
        entry.nutrition = record.recomNutrition ?? record.nutrition;
      if (record.lifeStyle ?? record.lifestyle)
        entry.lifestyle = record.lifeStyle ?? record.lifestyle;
      if (record.miscellaneous) entry.miscellaneous = record.miscellaneous;

      // Handle nested data field
      if (record.data) {
        if (record.data.recommendation && !entry.recommendation)
          entry.recommendation = record.data.recommendation;
        if (record.data.interpretation && !entry.interpretation)
          entry.interpretation = record.data.interpretation;
        if (record.data.nutrition && !entry.nutrition)
          entry.nutrition = record.data.nutrition;
        if (record.data.lifestyle && !entry.lifestyle)
          entry.lifestyle = record.data.lifestyle;
        if (record.data.miscellaneous && !entry.miscellaneous)
          entry.miscellaneous = record.data.miscellaneous;
      }

      statusMap.set(status, entry);
    }
  }

  return Array.from(conditionMap.entries()).map(([conditionName, statusMap]) => ({
    testId,
    testCode,
    testReportName,
    conditionName: conditionName === 'General' ? undefined : conditionName,
    data: Array.from(statusMap.values()),
  }));
}

// ── Bulk insert with fallback ──────────────────────────────────────────────────

async function bulkInsert(docs: any[]) {
  try {
    const result = await GenericReportRecommendation.insertMany(docs, {
      ordered: false,
    });
    return { insertedCount: result.length, errors: [] };
  } catch (bulkError: any) {
    // Fallback: individual inserts
    let insertedCount = 0;
    const errors: string[] = [];
    for (const doc of docs) {
      try {
        await GenericReportRecommendation.create(doc);
        insertedCount++;
      } catch (err: any) {
        errors.push(err.message);
      }
    }
    return { insertedCount, errors };
  }
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(request.url);
    const page      = parseInt(searchParams.get('page')  ?? '1');
    const limit     = parseInt(searchParams.get('limit') ?? '50');
    const search    = searchParams.get('search')    ?? '';
    const testId    = searchParams.get('testId');
    const testCode  = searchParams.get('testCode');
    const condition = searchParams.get('condition');
    const status    = searchParams.get('status');

    const query: any = {};
    if (testId)    query.testId = testId;
    if (testCode)  query.testCode = testCode;
    if (condition) query.conditionName = { $regex: condition, $options: 'i' };
    if (status)    query['data.status'] = status;
    if (search) {
      query.$or = [
        { testReportName: { $regex: search, $options: 'i' } },
        { conditionName:  { $regex: search, $options: 'i' } },
        { testCode:       { $regex: search, $options: 'i' } },
      ];
    }

    const [total, records, distinctTests, distinctConditions, distinctStatuses] =
      await Promise.all([
        GenericReportRecommendation.countDocuments(query),
        GenericReportRecommendation.find(query)
          .sort({ testReportName: 1, conditionName: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        GenericReportRecommendation.distinct('testId', query),
        GenericReportRecommendation.distinct('conditionName', query),
        GenericReportRecommendation.distinct('data.status', query),
      ]);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      summary: {
        totalRecords:    total,
        totalTests:      distinctTests.length,
        totalConditions: distinctConditions.length,
        totalStatuses:   distinctStatuses.length,
      },
    });
  } catch (error) {
    console.error('GET /generic-report-recommendation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generic report recommendations' },
      { status: 500 }
    );
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const formData      = await request.formData();
    const file          = formData.get('file') as File;
    const testId        = formData.get('testId') as string;
    const testCode      = formData.get('testCode') as string;
    const testReportName = formData.get('testReportName') as string;

    if (!file || !testId || !testCode || !testReportName) {
      return NextResponse.json(
        { success: false, error: 'Missing file, testId, testCode, or testReportName' },
        { status: 400 }
      );
    }

    // Validate test exists in Neon
    await validateTestInNeon(testId);

    // Parse JSON file
    const fileContent = await file.text();
    let jsonArray: any[];
    try {
      const parsed = JSON.parse(fileContent);
      jsonArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    if (!jsonArray.length) {
      return NextResponse.json(
        { success: false, error: 'JSON file is empty' },
        { status: 400 }
      );
    }

    // Build documents based on test type
    let docs: any[];
    const isDrugTest = DRUG_TEST_CODES.has(testCode);

    if (isDrugTest) {
      switch (testCode) {
        case 'NMC_CLOPI':
          docs = parseClopidogrelRows(jsonArray, testId, testCode, testReportName);
          break;
        case 'NMC_WAC':
          docs = parseWarfarinRows(jsonArray, testId, testCode, testReportName);
          break;
        case 'NMC_STN':
          docs = parseStatinRows(jsonArray, testId, testCode, testReportName);
          break;
        default:
          docs = [];
      }
    } else {
      docs = parseStandardRows(jsonArray, testId, testCode, testReportName);
    }

    if (!docs.length) {
      return NextResponse.json(
        { success: false, error: 'No valid records could be parsed from the file' },
        { status: 400 }
      );
    }

    // Delete existing records for this test
    const deleted = await GenericReportRecommendation.deleteMany({ testId });
    console.log(`Deleted ${deleted.deletedCount} existing records for testId ${testId}`);

    // Insert new records
    const { insertedCount, errors } = await bulkInsert(docs);

    if (insertedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All records failed to insert',
          details: errors.slice(0, 5),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${insertedCount} record(s) for "${testReportName}"${
        errors.length ? ` (${errors.length} skipped)` : ''
      }`,
      data: {
        insertedCount,
        totalRows: jsonArray.length,
        isDrugTest,
        ...(errors.length && { skippedErrors: errors.slice(0, 5) }),
      },
    });
  } catch (error: any) {
    console.error('POST /generic-report-recommendation error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Upload failed' },
      { status: 500 }
    );
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(request.url);
    const id     = searchParams.get('id');
    const testId = searchParams.get('testId');

    let deletedCount = 0;

    if (id) {
      const res = await GenericReportRecommendation.findByIdAndDelete(id);
      if (!res) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        );
      }
      deletedCount = 1;
    } else if (testId) {
      const res = await GenericReportRecommendation.deleteMany({ testId });
      deletedCount = res.deletedCount;
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide either id or testId' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message:
        deletedCount > 0
          ? 'Records deleted successfully'
          : 'No records found to delete',
    });
  } catch (error) {
    console.error('DELETE /generic-report-recommendation error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}