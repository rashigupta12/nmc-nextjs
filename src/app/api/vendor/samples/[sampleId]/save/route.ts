import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { saveWellnessDataToTemp } from '../sample-services';
// Neon (Drizzle) — sample status update lives here
import { db } from '@/db';
import { SamplesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
// MongoDB is only used inside saveWellnessDataToTemp for GeneReportTemp inserts

/**
 * POST /api/vendor/samples/:sampleId/save
 *
 * Called after the user reviews and corrects the validated table on the frontend.
 *
 * Body (JSON):
 * {
 *   patientId: string,        -- UUID from Neon patients table (sent back from /upload response)
 *   testId: string,           -- TestCatalog UUID from Neon (sent back from /upload response)
 *   testCode: string,         -- e.g. "NMC-WL01"
 *   testReportName: string,   -- e.g. "Wellness"
 *   records: Array<{
 *     conditionName: string,
 *     gene: string,
 *     uniqueId: string,
 *     genotype: string,
 *     masterData?: { gene, condition_name, response, status, matchedVariant, matchType }
 *   }>
 * }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sampleId: string }> }
) {
  try {
    // MongoDB needed for GeneReportTemp inserts inside saveWellnessDataToTemp
    await connectToMongoDB();

    // Get sampleId from params
    const params = await context.params;
    const sampleId = params.sampleId;
    
    console.log('📥 Save route hit - sampleId:', sampleId);

    if (!sampleId) {
      return NextResponse.json({ success: false, error: 'Sample ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('📋 Request body keys:', Object.keys(body));
    console.log('📋 Records count:', body.records?.length);

    const { patientId, testId, testCode, testReportName, records } = body;

    // Validate required fields
    if (!patientId || !testId || !testCode || !testReportName) {
      console.log('❌ Missing required fields:', { 
        hasPatientId: !!patientId, 
        hasTestId: !!testId, 
        hasTestCode: !!testCode, 
        hasTestReportName: !!testReportName 
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'patientId, testId, testCode, and testReportName are required',
          received: { patientId, testId, testCode, testReportName }
        },
        { status: 400 }
      );
    }

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No records provided to save' },
        { status: 400 }
      );
    }

    // ── 1. Verify sample exists in Neon before writing anything ──────────────
    console.log('🔍 Looking for sample in Neon:', sampleId);
    const [neonSample] = await db
      .select({ id: SamplesTable.id, sampleId: SamplesTable.sampleId })
      .from(SamplesTable)
      .where(eq(SamplesTable.sampleId, sampleId))
      .limit(1);

    if (!neonSample) {
      console.log('❌ Sample not found in Neon:', sampleId);
      return NextResponse.json({ success: false, error: 'Sample not found' }, { status: 404 });
    }

    console.log('✅ Sample found in Neon:', { id: neonSample.id, sampleId: neonSample.sampleId });

    // ── 2. Write to MongoDB (GeneReportTemp) and Neon (SamplesTable) in parallel
    console.log('💾 Saving to MongoDB via saveWellnessDataToTemp...');
    const savedRecords = await saveWellnessDataToTemp(
      records,
      patientId,
      sampleId,
      testId
    );

    console.log('✅ Saved to MongoDB. Records saved:', savedRecords.length);

    // Update sample status in Neon
    console.log('🔄 Updating sample status in Neon...');
    await db
      .update(SamplesTable)
      .set({
        csvUploaded: true,
        csvValidated: true,
        status: 'PROCESSING',
        validationSummary: {
          isValid: true,
          errors: [],
          warnings: [],
          rowCount: records.length,
          columnCount: 4,
        },
        updatedAt: new Date(),
      })
      .where(eq(SamplesTable.sampleId, sampleId));

    console.log('✅ Sample status updated to PROCESSING');

    return NextResponse.json({
      success: true,
      message: 'Genetic data saved successfully. Sample status updated to PROCESSING.',
      data: {
        sampleId,
        status: 'PROCESSING',
        recordsSaved: savedRecords.length,
      },
    });
  } catch (error) {
    console.error('❌ Error saving genetic data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save genetic data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}