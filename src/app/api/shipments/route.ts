import { db } from "@/db";
import { ShipmentsTable, ShipmentSamplesTable, SamplesTable, TestCatalogTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courierNumber, courierService, courierDate, sampleIds } = body;

    if (!sampleIds || sampleIds.length === 0) {
      return NextResponse.json(
        { error: "At least one sample must be selected" },
        { status: 400 }
      );
    }

    if (!courierNumber || !courierService || !courierDate) {
      return NextResponse.json(
        { error: "Missing required courier fields" },
        { status: 400 }
      );
    }

    const vendorId = session.user.id;
    const userId = session.user.id;
    const vendorCode = session.user.vendorCode || "UNKNOWN";

    // Check if all samples are in CREATED status and belong to this vendor
    const samples = await db
      .select()
      .from(SamplesTable)
      .where(
        and(
          eq(SamplesTable.vendorId, vendorId),
          ...sampleIds.map((id: string) => eq(SamplesTable.id, id))
        )
      );

    if (samples.length !== sampleIds.length) {
      return NextResponse.json(
        { error: "Some samples not found or don't belong to this vendor" },
        { status: 400 }
      );
    }

    // Check if any sample is already shipped
    const alreadyShipped = samples.some(s => s.status !== "CREATED");
    if (alreadyShipped) {
      return NextResponse.json(
        { error: "Some samples are already shipped or not in CREATED status" },
        { status: 400 }
      );
    }

    // Generate shipment number with date-based sequence
    const dateStr = format(new Date(), "yyyyMMdd");
    
    // Get today's shipment count using SQL date comparison
    const todayShipments = await db
      .select()
      .from(ShipmentsTable)
      .where(
        and(
          eq(ShipmentsTable.vendorId, vendorId),
          sql`DATE(${ShipmentsTable.createdAt}) = CURRENT_DATE`
        )
      );
    
    const sequence = String(todayShipments.length + 1).padStart(3, "0");
    const shipmentNo = `SH${vendorCode}${dateStr}${sequence}`;

    // Create shipment
    const [shipment] = await db
      .insert(ShipmentsTable)
      .values({
        shipmentNo,
        vendorId,
        createdBy: userId,
        status: "COURIERED",
        courierNumber,
        courierService,
        courierDate: new Date(courierDate),
      })
      .returning();

    // Link samples to shipment
    for (const sampleId of sampleIds) {
      await db.insert(ShipmentSamplesTable).values({
        shipmentId: shipment.id,
        sampleId: sampleId,
      });
    }

    // Update sample status to SHIPPED
    for (const sampleId of sampleIds) {
      await db
        .update(SamplesTable)
        .set({
          status: "SHIPPED",
          shippedAt: new Date(),
        })
        .where(eq(SamplesTable.id, sampleId));
    }

    return NextResponse.json({
      success: true,
      shipment: {
        ...shipment,
        sampleCount: sampleIds.length,
      },
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorId = session.user.id;
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(ShipmentsTable.vendorId, vendorId)];
    
    if (status && status !== "ALL") {
      conditions.push(eq(ShipmentsTable.status, status as any));
    }
    
    if (dateFrom) {
      conditions.push(sql`DATE(${ShipmentsTable.courierDate}) >= ${dateFrom}`);
    }
    
    if (dateTo) {
      conditions.push(sql`DATE(${ShipmentsTable.courierDate}) <= ${dateTo}`);
    }

    // Fetch shipments with pagination
    const shipments = await db
      .select()
      .from(ShipmentsTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${ShipmentsTable.createdAt} DESC`);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ShipmentsTable)
      .where(and(...conditions));
    
    const totalCount = Number(totalCountResult[0]?.count) || 0;
    
    // Get sample count for each shipment
    const shipmentsWithCount = await Promise.all(
      shipments.map(async (shipment) => {
        const samples = await db
          .select()
          .from(ShipmentSamplesTable)
          .where(eq(ShipmentSamplesTable.shipmentId, shipment.id));
        
        // Get sample details with test names
        const sampleDetails = await Promise.all(
          samples.map(async (ss) => {
            const sample = await db
              .select({
                id: SamplesTable.id,
                sampleId: SamplesTable.sampleId,
                status: SamplesTable.status,
                testName: TestCatalogTable.testName,
                testCode: TestCatalogTable.testCode,
              })
              .from(SamplesTable)
              .leftJoin(TestCatalogTable, eq(SamplesTable.testCatalogId, TestCatalogTable.id))
              .where(eq(SamplesTable.id, ss.sampleId))
              .then(res => res[0]);
            return sample;
          })
        );
        
        return {
          ...shipment,
          sampleCount: samples.length,
          samples: sampleDetails,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shipments: shipmentsWithCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}