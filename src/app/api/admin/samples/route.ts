import { db } from "@/db";
import { 
  SamplesTable, 
  OrdersTable, 
  PatientsTable, 
  TestCatalogTable,
  VendorsTable 
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendorId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build conditions
    const conditions = [];

    if (status && status !== "ALL") {
      conditions.push(eq(SamplesTable.status, status as any));
    }

    if (vendorId && vendorId !== "ALL") {
      conditions.push(eq(SamplesTable.vendorId, vendorId));
    }

    if (dateFrom) {
      conditions.push(sql`DATE(${OrdersTable.orderDate}) >= ${dateFrom}`);
    }

    if (dateTo) {
      conditions.push(sql`DATE(${OrdersTable.orderDate}) <= ${dateTo}`);
    }

    const rows = await db
      .select({
        // Sample fields
        id:               SamplesTable.id,
        sampleId:         SamplesTable.sampleId,
        status:           SamplesTable.status,
        sampleType:       SamplesTable.sampleType,
        tatDueAt:         SamplesTable.tatDueAt,
        qcRejectionReason: SamplesTable.qcRejectionReason,
        // Order fields
        orderId:          OrdersTable.id,
        orderNo:          OrdersTable.orderNo,
        orderDate:        OrdersTable.orderDate,
        // Patient fields
        patientRowId:     PatientsTable.id,
        patientId:        PatientsTable.patientId,
        patientFName:     PatientsTable.patientFName,
        patientLName:     PatientsTable.patientLName,
        email:            PatientsTable.email,
        mobileNo:         PatientsTable.mobileNo,
        // Test fields
        testRowId:        TestCatalogTable.id,
        testName:         TestCatalogTable.testName,
        testCode:         TestCatalogTable.testCode,
        // Vendor fields
        vendorRowId:      VendorsTable.id,
        vendorName:       VendorsTable.name,
        vendorCode:       VendorsTable.vendorCode,
      })
      .from(SamplesTable)
      .innerJoin(OrdersTable, eq(SamplesTable.orderId, OrdersTable.id))
      .innerJoin(PatientsTable, eq(OrdersTable.patientId, PatientsTable.id))
      .innerJoin(TestCatalogTable, eq(SamplesTable.testCatalogId, TestCatalogTable.id))
      .innerJoin(VendorsTable, eq(SamplesTable.vendorId, VendorsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${OrdersTable.orderDate} DESC`)
      .limit(limit);

    // Re-shape into the nested structure the frontend expects
    const samples = rows.map((row) => ({
      id:               row.id,
      sampleId:         row.sampleId,
      status:           row.status,
      sampleType:       row.sampleType,
      tatDueAt:         row.tatDueAt,
      qcRejectionReason: row.qcRejectionReason,
      order: {
        id:        row.orderId,
        orderNo:   row.orderNo,
        orderDate: row.orderDate,
        patient: {
          id:           row.patientRowId,
          patientId:    row.patientId,
          patientFName: row.patientFName,
          patientLName: row.patientLName,
          email:        row.email,
          mobileNo:     row.mobileNo,
        },
        test: {
          id:       row.testRowId,
          testName: row.testName,
          testCode: row.testCode,
        },
      },
      vendor: {
        id:         row.vendorRowId,
        name:       row.vendorName,
        vendorCode: row.vendorCode,
      },
    }));

    return NextResponse.json({ success: true, samples });
  } catch (error) {
    console.error("Error fetching samples:", error);
    return NextResponse.json(
      { error: "Failed to fetch samples" },
      { status: 500 }
    );
  }
}