/*eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/db';
import { TestCatalogTable } from '@/db/schema';
import { and, eq, ilike, isNotNull, isNull, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';

    const conditions = [];

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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // ✅ Fetch all tests
    const tests = await db
      .select()
      .from(TestCatalogTable)
      .where(whereClause)
      .orderBy(TestCatalogTable.testName)
      .limit(limit);

    // ✅ Step 1: Create map
    const testMap: Record<string, any> = {};

    tests.forEach((test: any) => {
      testMap[test.id] = {
        id: test.testCode,
        name: test.testName,
        parentId: test.parentTestId,
        subTests: []
      };
    });

    // ✅ Step 2: Build hierarchy
    const result: any[] = [];

    tests.forEach((test: any) => {
      if (test.parentTestId && testMap[test.parentTestId]) {
        // Sub-test
        testMap[test.parentTestId].subTests.push({
          id: test.testCode,
          name: test.testName
        });
      } else {
        // Parent
        result.push(testMap[test.id]);
      }
    });

    // ✅ Step 3: Clean response
    const finalData = result.map(test => ({
      id: test.id,
      name: test.name,
      subTests: test.subTests
    }));

    return NextResponse.json({
      success: true,
      data: finalData
    });

  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}