import { db } from "@/db";
import { OrdersTable, SamplesTable, PatientsTable, TestCatalogTable, VendorsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the vendor ID from session
    let vendorId = session.user.id;
    
    console.log("Session user:", {
      id: session.user.id,
      vendorCode: session.user.vendorCode,
      role: session.user.role
    });

    // Verify this vendor actually exists
    const vendor = await db.query.VendorsTable.findFirst({
      where: eq(VendorsTable.id, vendorId)
    });

    if (!vendor) {
      console.error(`Vendor not found with ID: ${vendorId}`);
      return NextResponse.json({ 
        error: "Vendor not found", 
        orders: [],
        debug: { vendorId, vendorExists: false }
      }, { status: 200 });
    }

    console.log("Vendor found:", {
      id: vendor.id,
      vendorCode: vendor.vendorCode,
      name: vendor.name
    });

    // Query orders with CREATED samples for this vendor
    const orders = await db
      .select({
        id: OrdersTable.id,
        orderNo: OrdersTable.orderNo,
        orderDate: OrdersTable.orderDate,
        patient: {
          id: PatientsTable.id,
          patientId: PatientsTable.patientId,
          patientFName: PatientsTable.patientFName,
          patientLName: PatientsTable.patientLName,
        },
        sample: {
          id: SamplesTable.id,
          sampleId: SamplesTable.sampleId,
          testName: TestCatalogTable.testName,
          testCode: TestCatalogTable.testCode,
          status: SamplesTable.status,
          sampleType: SamplesTable.sampleType,
        },
      })
      .from(OrdersTable)
      .innerJoin(PatientsTable, eq(OrdersTable.patientId, PatientsTable.id))
      .innerJoin(SamplesTable, eq(OrdersTable.sampleId, SamplesTable.id))
      .leftJoin(TestCatalogTable, eq(SamplesTable.testCatalogId, TestCatalogTable.id))
      .where(
        and(
          eq(OrdersTable.vendorId, vendorId),
          eq(SamplesTable.status, "CREATED")
        )
      );

    console.log(`Found ${orders.length} shippable orders for vendor ${vendor.vendorCode}`);

    // If no orders found, provide helpful debug info
    if (orders.length === 0) {
      // Check if there are any orders for this vendor at all
      const anyOrders = await db
        .select({ count: OrdersTable.id })
        .from(OrdersTable)
        .where(eq(OrdersTable.vendorId, vendorId));
      
      console.log(`Total orders for vendor ${vendorId}: ${anyOrders.length}`);
      
      if (anyOrders.length === 0) {
        console.log(`No orders found for this vendor. Orders in system belong to different vendor.`);
      } else {
        // Check what statuses exist
        const statuses = await db
          .select({
            status: SamplesTable.status,
            count: SamplesTable.id,
          })
          .from(OrdersTable)
          .innerJoin(SamplesTable, eq(OrdersTable.sampleId, SamplesTable.id))
          .where(eq(OrdersTable.vendorId, vendorId))
          .groupBy(SamplesTable.status);
        
        console.log("Sample statuses for this vendor:", statuses);
      }
    }

    return NextResponse.json({
      success: true,
      orders: orders,
      debug: {
        vendorId,
        vendorCode: vendor.vendorCode,
        vendorName: vendor.name,
        ordersFound: orders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching shippable orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: String(error) },
      { status: 500 }
    );
  }
}