/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { db } from "@/db";
import { TestCatalogTable } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// GET - Fetch all tests with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const offset = (page - 1) * limit;

    // Build the query conditions
    const conditions: any[] = [];
    
    if (search) {
      conditions.push(
        sql`${TestCatalogTable.testName} ILIKE ${`%${search}%`} OR 
            ${TestCatalogTable.testCode} ILIKE ${`%${search}%`} OR 
            ${TestCatalogTable.alias} ILIKE ${`%${search}%`}`
      );
    }
    
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(TestCatalogTable.isActive, isActive === "true"));
    }

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(TestCatalogTable);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const countResult = await countQuery;
    const total = Number(countResult[0]?.count) || 0;

    // Get paginated results
    let query = db.select().from(TestCatalogTable);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const tests = await query
      .orderBy(desc(TestCatalogTable.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

// POST - Create a single test or handle bulk upload
export async function POST(req: NextRequest) {
  try {
    // Check if this is a bulk upload (has FormData)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return handleBulkUpload(req);
    }
    
    const body = await req.json();
    
    // Single test creation
    if (!body.testCode || !body.testName || !body.tatDays) {
      return NextResponse.json(
        { error: "Missing required fields: testCode, testName, tatDays" },
        { status: 400 }
      );
    }

    const existingTest = await db
      .select()
      .from(TestCatalogTable)
      .where(eq(TestCatalogTable.testCode, body.testCode))
      .limit(1);

    if (existingTest.length > 0) {
      return NextResponse.json(
        { error: "Test code already exists" },
        { status: 409 }
      );
    }

    const [newTest] = await db
      .insert(TestCatalogTable)
      .values({
        testCode: body.testCode,
        testName: body.testName,
        alias: body.alias || null,
        description: body.description || null,
        parentTestId: body.parentTestId || null,
        subParentOf: body.subParentOf || null,
        tatDays: body.tatDays,
        price: body.price ? String(body.price) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdBy: body.createdBy,
      })
      .returning();

    return NextResponse.json(
      { message: "Test created successfully", test: newTest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    );
  }
}

// PUT - Bulk upload (alternative method)
export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }
    
    return handleBulkUpload(req);
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}

async function handleBulkUpload(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const createdBy = formData.get("createdBy") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Excel file is empty" },
        { status: 400 }
      );
    }

    // First pass: Insert all tests without parent relationships
    const insertedTests = new Map(); // Map testCode -> test UUID
    const results = {
      success: [] as any[],
      errors: [] as any[],
      duplicates: [] as any[],
    };

    // Pass 1: Insert all tests
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      const rowNumber = i + 2;

      try {
        const testCode = row.testCode || row.TestCode || row["testCode"];
        const testName = row.testName || row.TestName || row["testName"];
        const alias = row.alias || row.Alias || row["alias"];
        const tatDays = row.tatDays || row.TatDays || row["tatDays"] || row["TAT Days"];
        let price = row.price || row.Price || row["price"];
        let isActive = row.isActive || row.IsActive || row["isActive"];
        
        // Validation
        if (!testCode || !testName || !tatDays) {
          results.errors.push({
            row: rowNumber,
            error: "Missing required fields: testCode, testName, tatDays",
            data: row,
          });
          continue;
        }

        // Check for duplicates in database
        const existingTest = await db
          .select()
          .from(TestCatalogTable)
          .where(eq(TestCatalogTable.testCode, String(testCode)))
          .limit(1);

        if (existingTest.length > 0) {
          results.duplicates.push({
            row: rowNumber,
            testCode,
            message: "Test code already exists",
            data: row,
          });
          continue;
        }

        // Handle price conversion
        let priceValue = null;
        if (price !== undefined && price !== null && price !== "") {
          priceValue = String(price);
        }

        // Handle isActive conversion
        let isActiveValue = true;
        if (isActive !== undefined && isActive !== null) {
          if (typeof isActive === 'boolean') {
            isActiveValue = isActive;
          } else if (typeof isActive === 'string') {
            isActiveValue = isActive.toUpperCase() === 'TRUE' || isActive === '1';
          } else if (typeof isActive === 'number') {
            isActiveValue = isActive === 1;
          }
        }

        // Insert test without parent relationships
        const [newTest] = await db
          .insert(TestCatalogTable)
          .values({
            testCode: String(testCode).trim(),
            testName: String(testName).trim(),
            alias: alias ? String(alias).trim() : null,
            description: row.description || row.Description || null,
            parentTestId: null, // Insert null first, will update later
            subParentOf: null,  // Insert null first, will update later
            tatDays: parseInt(String(tatDays)),
            price: priceValue,
            isActive: isActiveValue,
            createdBy: createdBy,
          })
          .returning();

        // Store mapping from testCode to UUID
        insertedTests.set(String(testCode).trim(), newTest.id);
        
        results.success.push({
          row: rowNumber,
          testCode,
          testName,
          id: newTest.id,
          tempData: {
            parentTestId: row.parentTestId || row.ParentTestId || row["parentTestId"],
            subParentOf: row.subParentOf || row.SubParentOf || row["subParentOf"],
          }
        });
        
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : "Unknown error",
          data: row,
        });
      }
    }

    // Pass 2: Update parent relationships
    const updateErrors = [];
    for (const success of results.success) {
      if (success.tempData.parentTestId || success.tempData.subParentOf) {
        try {
          const parentTestCode = success.tempData.parentTestId;
          const subParentCode = success.tempData.subParentOf;
          
          let parentUUID = null;
          let subParentUUID = null;
          
          // Handle "ROOT" as null
          if (parentTestCode && parentTestCode !== "ROOT") {
            parentUUID = insertedTests.get(String(parentTestCode).trim());
            if (!parentUUID) {
              updateErrors.push({
                testCode: success.testCode,
                error: `Parent test with code "${parentTestCode}" not found in uploaded data`
              });
              continue;
            }
          }
          
          if (subParentCode && subParentCode !== "ROOT") {
            subParentUUID = insertedTests.get(String(subParentCode).trim());
            if (!subParentUUID) {
              updateErrors.push({
                testCode: success.testCode,
                error: `Sub-parent test with code "${subParentCode}" not found in uploaded data`
              });
              continue;
            }
          }
          
          // Update the test with parent UUIDs
          await db
            .update(TestCatalogTable)
            .set({
              parentTestId: parentUUID,
              subParentOf: subParentUUID,
              updatedAt: new Date(),
            })
            .where(eq(TestCatalogTable.id, success.id));
            
        } catch (error) {
          updateErrors.push({
            testCode: success.testCode,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    }

    // Clean up temp data from results
    results.success = results.success.map(({ tempData, ...rest }) => rest);

    return NextResponse.json({
      message: "Bulk upload completed",
      summary: {
        total: data.length,
        success: results.success.length,
        errors: results.errors.length,
        duplicates: results.duplicates.length,
        parentUpdateErrors: updateErrors.length,
      },
      details: {
        ...results,
        parentUpdateErrors: updateErrors,
      },
    });
  } catch (error) {
    console.error("Error bulk uploading tests:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}