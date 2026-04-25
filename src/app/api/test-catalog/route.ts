// app/api/test-catalog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { TestCatalogTable } from '@/db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    
    // Build the query
    let conditions = [];
    
    if (isActive === 'true') {
      conditions.push(eq(TestCatalogTable.isActive, true));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(TestCatalogTable.testCode, `%${search}%`),
          ilike(TestCatalogTable.testName, `%${search}%`),
          ilike(TestCatalogTable.alias, `%${search}%`)
        )
      );
    }
    
    // Execute query with conditions
    let query = db.select().from(TestCatalogTable);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions) as any);
    }
    
    // Order by test name
    query = query.orderBy(TestCatalogTable.testName);
    
    // Apply limit
    query = query.limit(limit);
    
    const tests = await query;
    
    return NextResponse.json({
      success: true,
      tests: tests,
      pagination: { totalPages: 1, total: tests.length }
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      testCode,
      testName,
      alias,
      description,
      parentTestId,
      subParentOf,
      tatDays,
      price,
      isActive,
      createdBy
    } = body;

    // Validate required fields
    if (!testCode || !testName || !tatDays || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if test code already exists
    const existingTest = await db.query.TestCatalogTable.findFirst({
      where: eq(TestCatalogTable.testCode, testCode.toUpperCase())
    });

    if (existingTest) {
      return NextResponse.json(
        { success: false, error: 'Test code already exists' },
        { status: 400 }
      );
    }

    const [newTest] = await db.insert(TestCatalogTable).values({
      testCode: testCode.toUpperCase(),
      testName,
      alias: alias || null,
      description: description || null,
      parentTestId: parentTestId || null,
      subParentOf: subParentOf || null,
      tatDays: tatDays,
      price: price ? price.toString() : null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      test: newTest
    });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test' },
      { status: 500 }
    );
  }
}