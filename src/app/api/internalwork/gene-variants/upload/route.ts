import { connectToMongoDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { mapGeneVariantsToMongoDB, insertGeneVariantsToMongoDB } from '@/lib/gene/geneVariantMapper';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: 'Expected multipart/form-data',
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const testId = formData.get('testId');
    const testCode = formData.get('testCode');
    const testReportName = formData.get('testReportName');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    if (!testId || !testCode || !testReportName) {
      return NextResponse.json({
        success: false,
        error: 'Test information (testId, testCode, testReportName) is required',
      }, { status: 400 });
    }

    const fileContent = await file.text();
    // Remove any shell preexec lines
    const cleanContent = fileContent.replace(/^;vte\.shell\.preexec![^\n]*\n/, '');

    let geneVariantsData: any[];
    try {
      const parsedData = JSON.parse(cleanContent);
      geneVariantsData = Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format',
        details: error instanceof Error ? error.message : 'Unknown parsing error',
      }, { status: 400 });
    }

    // Add test metadata to each record
    geneVariantsData = geneVariantsData.map(record => ({
      ...record,
      testId: testId.toString(),
      testCode: testCode.toString(),
      testReportName: testReportName.toString(),
    }));

    // Insert into MongoDB
    const result = await insertGeneVariantsToMongoDB(geneVariantsData);

    // Summary statistics
    const conditions = [...new Set(geneVariantsData.map(v => v.condition_name || 'Unknown'))];
    const genes = [...new Set(geneVariantsData.map(v => v.gene || 'Unknown'))];
    const rsIds = [...new Set(geneVariantsData.map(v => v.uniqueId || 'Unknown'))];

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${geneVariantsData.length} records for test: ${testReportName}`,
      data: {
        testId: testId.toString(),
        testCode: testCode.toString(),
        testReportName: testReportName.toString(),
        recordsProcessed: geneVariantsData.length,
        recordsInserted: result.length,
        conditions,
        genes,
        rsIds,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading gene variants:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload gene variants',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}