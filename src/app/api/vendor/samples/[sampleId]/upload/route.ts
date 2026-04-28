import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { z } from 'zod';
import { validateGeneticData } from '../sample-services';
// Neon (Drizzle) — all sample & test catalog data lives here
import { db } from '@/db';
import { TestCatalogTable, SamplesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
// MongoDB is only used inside validateGeneticData for GeneticVariant lookups

const uploadGeneticDataSchema = z.object({
  testType: z.string({ errorMap: () => ({ message: 'Invalid test type' }) }),
});

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sampleId: string }> }
) {
  try {
    // MongoDB connection needed only for validateGeneticData (GeneticVariant lookups)
    await connectToMongoDB();

    // Get sampleId from params
    const params = await context.params;
    const sampleId = params.sampleId;

    console.log('📥 Upload route hit — sampleId:', sampleId);

    if (!sampleId) {
      return NextResponse.json({ success: false, error: 'Sample ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('csvFile');
    const testType = formData.get('testType') as string;

    console.log('📋 FormData received — testType:', testType, '| file:', file instanceof File ? file.name : 'missing');

    // Validate testType before anything else
    if (!testType) {
      return NextResponse.json({ success: false, error: 'testType is required in form data' }, { status: 400 });
    }

    uploadGeneticDataSchema.parse({ testType });

    if (!file) {
      return NextResponse.json({ success: false, error: 'CSV file is required' }, { status: 400 });
    }

    // ── 1. Fetch sample from Neon ────────────────────────────────────────────
    console.log('🔍 Looking up sampleId in Neon:', sampleId);
    const [neonSample] = await db
      .select({
        id: SamplesTable.id,
        sampleId: SamplesTable.sampleId,
        patientId: SamplesTable.patientId,
        testCatalogId: SamplesTable.testCatalogId,
        status: SamplesTable.status,
      })
      .from(SamplesTable)
      .where(eq(SamplesTable.sampleId, sampleId))
      .limit(1);

    if (!neonSample) {
      return NextResponse.json({ success: false, error: 'Sample not found' }, { status: 404 });
    }

    console.log('✅ Neon sample found:', { sampleId: neonSample.sampleId, testCatalogId: neonSample.testCatalogId });

    // ── 2. Fetch test catalog from Neon ──────────────────────────────────────
    console.log('🔍 Looking up testCode in Neon:', testType);
    const [testCatalogRow] = await db
      .select({
        id: TestCatalogTable.id,
        testCode: TestCatalogTable.testCode,
        testName: TestCatalogTable.testName,
      })
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.testCode, testType))
      .limit(1);

    if (!testCatalogRow) {
      return NextResponse.json(
        { success: false, error: `Test type "${testType}" not found in TestCatalog` },
        { status: 400 }
      );
    }

    console.log('✅ TestCatalog found:', { id: testCatalogRow.id, testCode: testCatalogRow.testCode });
    console.log('🔗 Comparing testCatalogId:', neonSample.testCatalogId, '===', testCatalogRow.id);
    
    if (neonSample.testCatalogId !== testCatalogRow.id) {
      return NextResponse.json(
        {
          success: false,
          error: `Sample test (${neonSample.testCatalogId}) does not match uploaded test type "${testType}" (id: ${testCatalogRow.id})`,
        },
        { status: 400 }
      );
    }

    // ── 4. Parse CSV ─────────────────────────────────────────────────────────
    const csvText = file instanceof File ? await file.text() : String(file);
    const lines = csvText.split('\n').filter((line: string) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must contain header and data rows' },
        { status: 400 }
      );
    }

    const header = parseCSVLine(lines[0] ?? '');
    const expectedHeaders = ['condition name', 'genes', 'uniqueid', 'genotype'];
    const headerValid = expectedHeaders.every((h: string) =>
      header.some((col: string) => col.toLowerCase().includes(h.toLowerCase()))
    );

    if (!headerValid) {
      return NextResponse.json(
        { error: `Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}`, received: header },
        { status: 400 }
      );
    }

    const geneticData: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i] ?? '');
      if (values.length >= 4) {
        geneticData.push({
          conditionName: values[0],
          gene: values[1],
          uniqueId: values[2],
          genotype: values[3],
        });
      }
    }

    if (geneticData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid genetic data found in CSV file' },
        { status: 400 }
      );
    }

    // ── 5. Validate against MongoDB GeneticVariant master (no save yet) ───────
    const validationResults = await validateGeneticData(geneticData, testCatalogRow.testCode);

    // ── 6. Return for frontend review — saving happens in POST /save ──────────
    return NextResponse.json({
      success: true,
      message: 'CSV parsed and validated. Review the data below before saving.',
      data: {
        sampleId: neonSample.sampleId,
        patientId: neonSample.patientId,
        testId: testCatalogRow.id,
        testCode: testCatalogRow.testCode,
        testReportName: testCatalogRow.testName,
        parsedData: geneticData,
        validationResults: {
          totalRecords: validationResults.totalRecords,
          validRecords: validationResults.validRecords,
          invalidRecords: validationResults.invalidRecords,
          errors: validationResults.errors,
          validData: validationResults.validData,
          invalidData: validationResults.invalidData,
        },
      },
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to process CSV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}