/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
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
    const statusFilter = searchParams.get('status');
    const responseFilter = searchParams.get('response');

    let GeneticVariant;
    try {
      const modelname = await import('@/models/geneticVariant');
      GeneticVariant = modelname.GeneticVariant;
    } catch (error) {
      console.error('Failed to import GeneticVariant model:', error);
      return NextResponse.json(
        { success: false, error: 'Database model not available' },
        { status: 500 }
      );
    }

    // Build document-level query
    const query: any = {};
    if (testId) query.testId = testId;
    if (testCode) query.testCode = testCode;
    if (condition) query['condition.name'] = { $regex: condition, $options: 'i' };
    if (gene) query['gene.name'] = { $regex: gene, $options: 'i' };
    if (rsId) query['gene.rsIds.uniqueId'] = rsId;
    if (search) {
      query.$or = [
        { testCode: { $regex: search, $options: 'i' } },
        { testReportName: { $regex: search, $options: 'i' } },
        { 'condition.name': { $regex: search, $options: 'i' } },
        { 'gene.name': { $regex: search, $options: 'i' } },
        { 'gene.rsIds.uniqueId': { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch all matching documents (no pagination yet — we paginate after flattening)
    const documents = await GeneticVariant.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Flatten: one row per variant entry
    const flattened: any[] = [];
    for (const doc of documents) {
      const conditionName = doc.condition?.name || '';
      const conditionCategory = doc.condition?.category || '';
      const geneName = doc.gene?.name || '';
      const sectionId = doc.section?.id || '';
      const sectionName = doc.section?.name || '';

      for (const rsIdObj of doc.gene?.rsIds || []) {
        const uniqueId = rsIdObj.uniqueId || '';

        for (const variant of rsIdObj.variants || []) {
          // Apply status/response filters at variant level
          if (statusFilter && variant.status !== statusFilter) continue;
          if (responseFilter && variant.response !== responseFilter) continue;

          flattened.push({
            id: String(doc._id),
            conditionName,
            conditionCategory,
            gene: geneName,
            uniqueId,
            testVariant: variant.testVariant || '',
            reportVariant: variant.reportVariant || '',
            response: variant.response || '',
            status: variant.status || '',
            recommendation: variant.recommendation || '',
            interpretation: variant.interpretation || '',
            lifestyle: variant.lifestyle || '',
            miscellaneous: variant.miscellaneous || '',
            testId: doc.testId || '',
            testCode: doc.testCode || '',
            testName: doc.testReportName || '',
            sectionId,
            sectionName,
            createdAt: doc.createdAt ? doc.createdAt.toISOString() : '',
          });
        }
      }
    }

    // Paginate flattened results
    const total = flattened.length;
    const skip = (page - 1) * limit;
    const paginated = flattened.slice(skip, skip + limit);

    // Summary stats (from all documents, not just filtered variants)
    const stats = await GeneticVariant.aggregate([
      {
        $facet: {
          totalRecords: [{ $count: 'count' }],
          uniqueTests: [{ $group: { _id: '$testId' } }, { $count: 'count' }],
          uniqueConditions: [{ $group: { _id: '$condition.name' } }, { $count: 'count' }],
          uniqueGenes: [{ $group: { _id: '$gene.name' } }, { $count: 'count' }],
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      summary: {
        totalRecords: stats[0]?.totalRecords[0]?.count || 0,
        totalTests: stats[0]?.uniqueTests[0]?.count || 0,
        totalConditions: stats[0]?.uniqueConditions[0]?.count || 0,
        totalGenes: stats[0]?.uniqueGenes[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching gene variants:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gene variants',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: 'Database model not available' },
        { status: 500 }
      );
    }

    let deletedCount = 0;
    if (variantId) {
      const result = await GeneticVariant.findByIdAndDelete(variantId);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Variant not found' },
          { status: 404 }
        );
      }
      deletedCount = 1;
    } else if (testId) {
      const result = await GeneticVariant.deleteMany({ testId });
      deletedCount = result.deletedCount;
    } else {
      return NextResponse.json(
        { success: false, error: 'Either testId or id parameter is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: variantId
        ? 'Variant deleted successfully'
        : `Deleted ${deletedCount} variants for test`,
      data: { deletedCount },
    });
  } catch (error) {
    console.error('Error deleting gene variants:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete gene variants',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}