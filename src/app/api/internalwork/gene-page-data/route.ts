/*eslint-disable   @typescript-eslint/no-explicit-any*/
import { db as neonDb } from '@/db';
import { TestCatalogTable } from '@/db/schema';
import { connectToMongoDB } from '@/lib/mongodb';
import { GenePageData } from '@/models/genePageData';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

async function validateTestInNeon(testId: string) {
  const test = await neonDb
    .select()
    .from(TestCatalogTable)
    .where(eq(TestCatalogTable.id, testId))
    .limit(1);
  if (!test.length) {
    throw new Error(`Test with ID ${testId} not found in test_catalog`);
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const testId = searchParams.get('testId');
    const testCode = searchParams.get('testCode');
    const condition = searchParams.get('condition');
    const gene = searchParams.get('gene');

    const query: any = {};
    if (testId) query.testId = testId;
    if (testCode) query.testCode = testCode;
    if (condition) query.condition_name = { $regex: condition, $options: 'i' };
    if (gene) query.gene = { $regex: gene, $options: 'i' };
    if (search) {
      query.$or = [
        { testReportName: { $regex: search, $options: 'i' } },
        { condition_name: { $regex: search, $options: 'i' } },
        { gene: { $regex: search, $options: 'i' } },
        { unique_id: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await GenePageData.countDocuments(query);
    const records = await GenePageData.find(query)
      .sort({ testReportName: 1, condition_name: 1, gene: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [distinctTests, distinctConditions, distinctGenes] = await Promise.all([
      GenePageData.distinct('testId', query),
      GenePageData.distinct('condition_name', query),
      GenePageData.distinct('gene', query),
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
        totalRecords: total,
        totalTests: distinctTests.length,
        totalConditions: distinctConditions.length,
        totalGenes: distinctGenes.length,
      },
    });
  } catch (error) {
    console.error('GET /gene-page-data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gene page data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const testId = formData.get('testId') as string;
    const testCode = formData.get('testCode') as string;
    const testReportName = formData.get('testReportName') as string;

    if (!file || !testId || !testCode || !testReportName) {
      return NextResponse.json(
        { success: false, error: 'Missing file, testId, testCode, or testReportName' },
        { status: 400 }
      );
    }

    await validateTestInNeon(testId);

    const fileContent = await file.text();
    let jsonArray: any[];
    try {
      const parsed = JSON.parse(fileContent);
      jsonArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON format' }, { status: 400 });
    }

    // Map fields
    const enriched = jsonArray.map((record) => ({
      testId,
      testCode,
      testReportName,
      unique_id: record.ID || record.unique_id || '',
      gene: record.gene || '',
      condition_name: record.condition_name,
      display_condition: record.display_condition,
      condition_desc: record.condition_desc,
      heading1: record.heading1,
      heading_desc1: record.heading_desc1,
      heading_desc2: record.heading_desc2,
      risk_factors: record.risk_factors,
      symptoms: record.symptoms,
      prevention: record.prevention,
    }));

    // Log first record for debugging
    console.log('Sample enriched record:', JSON.stringify(enriched[0], null, 2));

    // Attempt bulk insert with ordered: false
    let result;
    try {
      result = await GenePageData.insertMany(enriched, { ordered: false });
    } catch (bulkError: any) {
      // If bulk insert throws (e.g., duplicate key error), we still might have some inserted
      console.error('Bulk insert error:', bulkError);
      return NextResponse.json(
        { success: false, error: 'Bulk insert failed', details: bulkError.message },
        { status: 400 }
      );
    }

    if (result.length === 0) {
      // Try to find why each record failed by attempting individual inserts
      const errors: string[] = [];
      let successCount = 0;
      for (let i = 0; i < enriched.length; i++) {
        try {
          await GenePageData.create(enriched[i]);
          successCount++;
        } catch (err: any) {
          errors.push(`Record ${i + 1}: ${err.message}`);
        }
      }
      if (successCount === 0) {
        return NextResponse.json(
          { success: false, error: 'All records failed validation', details: errors },
          { status: 400 }
        );
      } else {
        // Partial success (should not happen with ordered:false but handle)
        return NextResponse.json({
          success: true,
          message: `Uploaded ${successCount} records (partial)`,
          data: { insertedCount: successCount, failures: errors },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${result.length} records`,
      data: { insertedCount: result.length },
    });
  } catch (error: any) {
    console.error('POST /gene-page-data error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const testId = searchParams.get('testId');

    let deletedCount = 0;
    if (id) {
      const res = await GenePageData.findByIdAndDelete(id);
      if (!res) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
      deletedCount = 1;
    } else if (testId) {
      const res = await GenePageData.deleteMany({ testId });
      deletedCount = res.deletedCount;
    } else {
      return NextResponse.json({ success: false, error: 'Provide either id or testId' }, { status: 400 });
    }
    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error('DELETE /gene-page-data error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}