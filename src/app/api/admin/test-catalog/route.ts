import { connectToMongoDB } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

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
    const rsId = searchParams.get('rsId');

    const skip = (page - 1) * limit;

    // Import the GeneticVariant model
    let GeneticVariant;
    try {
      const module = await import('@/models/geneticVariant');
      GeneticVariant = module.GeneticVariant;
    } catch (error) {
      console.error('Failed to import GeneticVariant model:', error);
      return NextResponse.json({
        success: false,
        error: 'Database model not available',
      }, { status: 500 });
    }

    // Build query
    let query: any = {};

    if (testId) query.testId = testId;
    if (testCode) query.testCode = testCode;
    if (condition) query['condition.name'] = { $regex: condition, $options: 'i' };
    if (gene) query['gene.name'] = { $regex: gene, $options: 'i' };
    if (rsId) query['gene.rsIds.uniqueId'] = rsId;

    // Global search
    if (search) {
      query.$or = [
        { testCode: { $regex: search, $options: 'i' } },
        { testReportName: { $regex: search, $options: 'i' } },
        { 'condition.name': { $regex: search, $options: 'i' } },
        { 'gene.name': { $regex: search, $options: 'i' } },
        { 'gene.rsIds.uniqueId': { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch variants
    const variants = await GeneticVariant.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await GeneticVariant.countDocuments(query);

    // Flatten the data structure for frontend display
    const flattenedVariants = [];
    
    for (const variant of variants) {
      // Flatten each rsId and its variants
      for (const rsIdObj of variant.gene.rsIds || []) {
        for (const variantObj of rsIdObj.variants || []) {
          flattenedVariants.push({
            id: variant._id.toString(),
            conditionName: variant.condition.name,
            gene: variant.gene.name,
            uniqueId: rsIdObj.uniqueId,
            testVariant: variantObj.testVariant,
            reportVariant: variantObj.reportVariant,
            response: variantObj.response,
            status: variantObj.status,
            recommendation: variantObj.recommendation || '',
            interpretation: variantObj.interpretation || '',
            testId: variant.testId,
            testCode: variant.testCode,
            testName: variant.testReportName,
            createdAt: variant.createdAt,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: flattenedVariants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching gene variants:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch gene variants',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const variantId = searchParams.get('id');

    let GeneticVariant;
    try {
      const module = await import('@/models/geneticVariant');
      GeneticVariant = module.GeneticVariant;
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Database model not available',
      }, { status: 500 });
    }

    let result;
    let deletedCount = 0;
    if (variantId) {
      result = await GeneticVariant.findByIdAndDelete(variantId);
      if (!result) {
        return NextResponse.json({
          success: false,
          error: 'Variant not found',
        }, { status: 404 });
      }
      deletedCount = 1;
    } else if (testId) {
      result = await GeneticVariant.deleteMany({ testId });
      deletedCount = result.deletedCount;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either testId or id parameter is required',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: variantId ? 'Variant deleted successfully' : `Deleted ${deletedCount} variants for test`,
      data: {
        deletedCount
      }
    });

  } catch (error) {
    console.error('Error deleting gene variants:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete gene variants',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}