// src/app/api/final-report/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import PatientFinalReport from "@/models/patientFinalReport";
import { db } from "@/db";
import { SamplesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SaveConditionPayload {
  conditionName:  string;
  status:         string;
  recommendation: string;
  interpretation: string;
  nutrition:      string;
  lifestyle:      string;
  miscellaneous:  string;
  genes: Array<{
    gene:     string;
    uniqueId: string;
    response: string;
  }>;
}

interface SavePayload {
  patientId:      string;
  sampleId:       string;
  testId:         string;
  testCode:       string;
  testReportName: string;
  data:           SaveConditionPayload[];
}

export async function POST(req: NextRequest) {
  try {
    const body: SavePayload = await req.json();
    const { patientId, sampleId, testId, testCode, testReportName, data } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!patientId || !sampleId || !testId) {
      return NextResponse.json(
        { success: false, error: "patientId, sampleId and testId are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "data array is required and must not be empty" },
        { status: 400 }
      );
    }

    // ── Validate each condition has a status ──────────────────────────────────
    const missingStatus = data.find((c) => !c.status || c.status.trim() === "");
    if (missingStatus) {
      return NextResponse.json(
        {
          success: false,
          error: `Condition "${missingStatus.conditionName}" is missing a status. Please select a status for all conditions before saving.`,
        },
        { status: 422 }
      );
    }

    // ── Resolve sampleId → UUID if it's human-readable ───────────────────────
    // The save payload should always contain UUIDs (the GET already resolves them),
    // but we guard here in case the UI passes the human-readable ID directly.
    let sampleUUID  = sampleId;
    let patientUUID = patientId;

    if (!UUID_RE.test(sampleId)) {
      const [row] = await db
        .select({ id: SamplesTable.id, patientId: SamplesTable.patientId })
        .from(SamplesTable)
        .where(eq(SamplesTable.sampleId, sampleId))
        .limit(1);

      if (!row) {
        return NextResponse.json(
          { success: false, error: `Sample not found: ${sampleId}` },
          { status: 404 }
        );
      }
      sampleUUID  = row.id;
      patientUUID = row.patientId;
    }

    await connectToMongoDB();

    // ── Build conditions array ────────────────────────────────────────────────
    const conditions = data.map((c) => ({
      conditionName:  c.conditionName,
      status:         c.status.trim(),
      recommendation: c.recommendation?.trim() ?? "",
      interpretation: c.interpretation?.trim() ?? "",
      nutrition:      c.nutrition?.trim()      ?? "",
      lifestyle:      c.lifestyle?.trim()      ?? "",
      miscellaneous:  c.miscellaneous?.trim()  ?? "",
      genes: (c.genes ?? []).map((g) => ({
        gene:     g.gene,
        uniqueId: g.uniqueId,
        response: g.response,
      })),
      updatedAt: new Date(),
    }));

    // ── Upsert — one document per patient/sample/test ─────────────────────────
    // The unique index { patientId, sampleId, testId } on PatientFinalReport
    // guarantees this is idempotent — re-submitting overwrites the previous save.
    const result = await PatientFinalReport.findOneAndUpdate(
      { patientId: patientUUID, sampleId: sampleUUID, testId },
      {
        $set: {
          testCode:       testCode?.trim()       ?? "",
          testReportName: testReportName?.trim() ?? "",
          conditions,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json({
      success: true,
      message: "Report saved successfully",
      id:      (result as any)?._id?.toString(),
      savedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[POST /api/final-report/save]", error);

    // Duplicate key on the unique index — shouldn't happen with findOneAndUpdate
    // but guard it anyway
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A report for this patient/sample/test already exists. It has been updated." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}