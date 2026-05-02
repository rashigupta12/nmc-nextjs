import { db } from "@/db";
import { ShipmentsTable, ShipmentSamplesTable, SamplesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shipmentId = params.id;

    // Get the shipment
    const [shipment] = await db
      .select()
      .from(ShipmentsTable)
      .where(eq(ShipmentsTable.id, shipmentId));

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    // Check if already received
    if (shipment.status === "RECEIVED") {
      return NextResponse.json(
        { error: "Shipment already received" },
        { status: 400 }
      );
    }

    // Get all samples in this shipment
    const shipmentSamples = await db
      .select()
      .from(ShipmentSamplesTable)
      .where(eq(ShipmentSamplesTable.shipmentId, shipmentId));

    const sampleIds = shipmentSamples.map(ss => ss.sampleId);

    if (sampleIds.length === 0) {
      return NextResponse.json(
        { error: "No samples found in this shipment" },
        { status: 400 }
      );
    }

    // Update shipment status to RECEIVED
    const [updatedShipment] = await db
      .update(ShipmentsTable)
      .set({
        status: "RECEIVED",
        receivedAt: new Date(),
        receivedBy: session.user.id,
      })
      .where(eq(ShipmentsTable.id, shipmentId))
      .returning();

    // Update all samples to RECEIVED
    let updatedCount = 0;
    for (const sampleId of sampleIds) {
      const [updated] = await db
        .update(SamplesTable)
        .set({
          status: "RECEIVED",
          receivedAt: new Date(),
        })
        .where(eq(SamplesTable.id, sampleId))
        .returning();
      
      if (updated) {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
      updatedCount,
      totalSamples: sampleIds.length,
    });
  } catch (error) {
    console.error("Error receiving shipment:", error);
    return NextResponse.json(
      { error: "Failed to mark shipment as received" },
      { status: 500 }
    );
  }
}