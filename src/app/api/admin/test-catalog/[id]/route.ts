/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { db } from "@/db";
import { TestCatalogTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch single test
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const [test] = await db
      .select()
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.id, params.id))
      .limit(1);

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

// PUT - Update test
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await req.json();

    // Check if test exists
    const [existingTest] = await db
      .select()
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.id, params.id))
      .limit(1);

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // If test code is being changed, check uniqueness
    if (body.testCode && body.testCode !== existingTest.testCode) {
      const [codeExists] = await db
        .select()
        .from(TestCatalogTable)
        .where(eq(TestCatalogTable.testCode, body.testCode))
        .limit(1);

      if (codeExists) {
        return NextResponse.json(
          { error: "Test code already exists" },
          { status: 409 }
        );
      }
    }

    // Update test
    const [updatedTest] = await db
      .update(TestCatalogTable)
      .set({
        testCode: body.testCode,
        testName: body.testName,
        alias: body.alias || null,
        description: body.description || null,
        parentTestId: body.parentTestId || null,
        subParentOf: body.subParentOf || null,
        tatDays: body.tatDays,
        price: body.price || null,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(TestCatalogTable.id, params.id))
      .returning();

    return NextResponse.json({
      message: "Test updated successfully",
      test: updatedTest,
    });
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json(
      { error: "Failed to update test" },
      { status: 500 }
    );
  }
}

// DELETE - Delete test
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Check if test exists
    const [existingTest] = await db
      .select()
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.id, params.id))
      .limit(1);

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Delete test
    await db
      .delete(TestCatalogTable)
      .where(eq(TestCatalogTable.id, params.id));

    return NextResponse.json({
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    );
  }
}