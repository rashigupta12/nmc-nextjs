import { db } from "@/db";
import { SamplesTable } from "@/db/schema";
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

    const sampleId = params.id;

    // Get the sample
    const [sample] = await db
      .select()
      .from(SamplesTable)
      .where(eq(SamplesTable.id, sampleId));

    if (!sample) {
      return NextResponse.json(
        { error: "Sample not found" },
        { status: 404 }
      );
    }

    // Validate that sample is in RECEIVED status
    if (sample.status !== "RECEIVED") {
      return NextResponse.json(
        { error: "QC can only be performed on samples with RECEIVED status" },
        { status: 400 }
      );
    }

    // Update sample status to QC_PASSED
    const [updatedSample] = await db
      .update(SamplesTable)
      .set({
        status: "QC_PASSED",
        qcPassedAt: new Date(),
      })
      .where(eq(SamplesTable.id, sampleId))
      .returning();

    return NextResponse.json({
      success: true,
      sample: updatedSample,
    });
  } catch (error) {
    console.error("Error updating QC status:", error);
    return NextResponse.json(
      { error: "Failed to update QC status" },
      { status: 500 }
    );
  }
}