//app/api/internalwork/tests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { TestCatalogTable } from '@/db/schema';
import { eq, and, isNull, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true
    const search = searchParams.get('search');
    
    let query = db
      .select({
        id: TestCatalogTable.id,
        testCode: TestCatalogTable.testCode,
        testName: TestCatalogTable.testName,
        alias: TestCatalogTable.alias,
        description: TestCatalogTable.description,
        tatDays: TestCatalogTable.tatDays,
        price: TestCatalogTable.price,
        isActive: TestCatalogTable.isActive,
        parentTestId: TestCatalogTable.parentTestId,
      })
      .from(TestCatalogTable);
    
    // Apply filters
    const conditions = [];
    
    if (isActive) {
      conditions.push(eq(TestCatalogTable.isActive, true));
    }
    
    if (search) {
      // Search by test code, name, or alias
      conditions.push(
        // @ts-ignore - Drizzle ORM search syntax
        or(
          ilike(TestCatalogTable.testCode, `%${search}%`),
          ilike(TestCatalogTable.testName, `%${search}%`),
          ilike(TestCatalogTable.alias, `%${search}%`)
        )
      );
    }

    
    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }
    
    const tests = await query.orderBy(TestCatalogTable.testName);
    
    return NextResponse.json({
      success: true,
      data: tests,
      count: tests.length,
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tests',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testCode, testName, alias, description, tatDays, price, parentTestId } = body;
    
    // Validate required fields
    if (!testCode || !testName || !tatDays) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: testCode, testName, tatDays',
        },
        { status: 400 }
      );
    }
    
    // Check if test code already exists
    const existingTest = await db
      .select()
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.testCode, testCode))
      .limit(1);
    
    if (existingTest.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test code already exists',
        },
        { status: 409 }
      );
    }
    
    // Insert new test
    const newTest = await db.insert(TestCatalogTable).values({
      testCode,
      testName,
      alias: alias || null,
      description: description || null,
      tatDays,
      price: price || null,
      parentTestId: parentTestId || null,
      isActive: true,
      createdBy: 'system', // You should get this from session
    }).returning();
    
    return NextResponse.json({
      success: true,
      data: newTest[0],
      message: 'Test created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');
    const body = await request.json();
    
    if (!testId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test ID is required',
        },
        { status: 400 }
      );
    }
    
    const updatedTest = await db
      .update(TestCatalogTable)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(TestCatalogTable.id, testId))
      .returning();
    
    if (updatedTest.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTest[0],
      message: 'Test updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update test',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');
    
    if (!testId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test ID is required',
        },
        { status: 400 }
      );
    }
    
    // Soft delete - just mark as inactive
    const deletedTest = await db
      .update(TestCatalogTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(TestCatalogTable.id, testId))
      .returning();
    
    if (deletedTest.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test deactivated successfully',
    });
    
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete test',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}