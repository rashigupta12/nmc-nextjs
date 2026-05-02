import { db } from "@/db";
import { ShipmentsTable, VendorsTable, ShipmentSamplesTable } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
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
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build conditions - only show shipments that are COURIERED, IN_TRANSIT, or RECEIVED
    const conditions = [inArray(ShipmentsTable.status, ["COURIERED", "IN_TRANSIT", "RECEIVED"])];
    
    if (status && status !== "ALL") {
      conditions.push(eq(ShipmentsTable.status, status as any));
    }
    
    if (dateFrom) {
      conditions.push(sql`DATE(${ShipmentsTable.courierDate}) >= ${dateFrom}`);
    }
    
    if (dateTo) {
      conditions.push(sql`DATE(${ShipmentsTable.courierDate}) <= ${dateTo}`);
    }

    const shipments = await db
      .select({
        id: ShipmentsTable.id,
        shipmentNo: ShipmentsTable.shipmentNo,
        courierNumber: ShipmentsTable.courierNumber,
        courierService: ShipmentsTable.courierService,
        courierDate: ShipmentsTable.courierDate,
        status: ShipmentsTable.status,
        createdAt: ShipmentsTable.createdAt,
        receivedAt: ShipmentsTable.receivedAt,
        receivedBy: ShipmentsTable.receivedBy,
        vendor: {
          id: VendorsTable.id,
          name: VendorsTable.name,
          vendorCode: VendorsTable.vendorCode,
        },
      })
      .from(ShipmentsTable)
      .innerJoin(VendorsTable, eq(ShipmentsTable.vendorId, VendorsTable.id))
      .where(and(...conditions))
      .orderBy(sql`${ShipmentsTable.createdAt} DESC`)
      .limit(limit);

    // Get sample count for each shipment
    const shipmentsWithCount = await Promise.all(
      shipments.map(async (shipment) => {
        const samples = await db
          .select()
          .from(ShipmentSamplesTable)
          .where(eq(ShipmentSamplesTable.shipmentId, shipment.id));
        
        return {
          ...shipment,
          sampleCount: samples.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shipments: shipmentsWithCount,
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}