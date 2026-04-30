// src/app/api/additional-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { GeneReportTemp } from "@/models/geneReportTemp";
import GenericReportRecommendation from "@/models/genericReportRecommendation";
import PatientFinalReport from "@/models/patientFinalReport";
import { db } from "@/db";
import { SamplesTable, PatientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_RANK: Record<string, number> = {
  Bad:     4,
  Poor:    4,
  Average: 3,
  Good:    2,
  Normal:  2,
};

function deriveWorstStatus(genes: any[]): string {
  let worst = "";
  let worstRank = 0;
  for (const g of genes) {
    const rank = STATUS_RANK[g.status] ?? 1;
    if (rank > worstRank) {
      worstRank = rank;
      worst = g.status;
    }
  }
  return worst || genes[0]?.status || "";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const sampleId  = searchParams.get("sampleId");
    const testId    = searchParams.get("testId");

    if (!patientId || !sampleId || !testId) {
      return NextResponse.json(
        { success: false, error: "patientId, sampleId and testId are required" },
        { status: 400 }
      );
    }

    // ── Resolve sampleId → UUID if needed ────────────────────────────────────
    // sampleId in URL may be human-readable ("SMP-26042800001") or a UUID.
    // GeneReportTemp always stores the UUID (samples.id from Neon).

    let sampleUUID: string = sampleId;
    let patientUUID: string = patientId;

    if (!UUID_RE.test(sampleId)) {
      const [sampleRow] = await db
        .select({ id: SamplesTable.id, patientId: SamplesTable.patientId })
        .from(SamplesTable)
        .where(eq(SamplesTable.sampleId, sampleId))
        .limit(1);

      if (!sampleRow) {
        return NextResponse.json(
          { success: false, error: `Sample not found: ${sampleId}` },
          { status: 404 }
        );
      }
      sampleUUID = sampleRow.id;
      // Use the patientId from the sample row if not already a UUID
      if (!UUID_RE.test(patientId)) {
        patientUUID = sampleRow.patientId;
      }
    }

    // ── Resolve patientId → UUID if needed ───────────────────────────────────
    // patientId in URL may be human-readable ("PAT-001") or a UUID.
    if (!UUID_RE.test(patientUUID)) {
      const [patientRow] = await db
        .select({ id: PatientsTable.id, patientFName: PatientsTable.patientFName, patientLName: PatientsTable.patientLName })
        .from(PatientsTable)
        .where(eq(PatientsTable.patientId, patientUUID))
        .limit(1);

      if (!patientRow) {
        return NextResponse.json(
          { success: false, error: `Patient not found: ${patientId}` },
          { status: 404 }
        );
      }
      patientUUID = patientRow.id;
    }

    // ── Fetch patient name for display ───────────────────────────────────────
    let patientName = "";
    try {
      const [nameRow] = await db
        .select({
          patientFName: PatientsTable.patientFName,
          patientMName: PatientsTable.patientMName,
          patientLName: PatientsTable.patientLName,
        })
        .from(PatientsTable)
        .where(eq(PatientsTable.id, patientUUID))
        .limit(1);

      if (nameRow) {
        patientName = [nameRow.patientFName, nameRow.patientMName, nameRow.patientLName]
          .filter(Boolean)
          .join(" ")
          .trim();
      }
    } catch {
      // Non-fatal — name is display-only
    }

    await connectToMongoDB();

    // ── 1. Fetch raw gene data ────────────────────────────────────────────────
    // FIX: query uses patientId, sampleId, testId — all three required.
    // Old engine only queried by patientId which fetched ALL tests.
    const geneData = await GeneReportTemp.find({
      patientId: patientUUID,
      sampleId:  sampleUUID,
      testId,
    }).lean();

    if (!geneData.length) {
      return NextResponse.json(
        {
          success: false,
          error: `No gene data found for patient=${patientUUID} sample=${sampleUUID} test=${testId}`,
        },
        { status: 404 }
      );
    }

    const testCode: string       = geneData[0]?.testCode       ?? "";
    const testReportName: string = geneData[0]?.testReportName ?? "";

    // ── 2. Fetch recommendation templates ────────────────────────────────────
    const templates = await GenericReportRecommendation.find({ testId }).lean();

    // ── 3. Check for existing saved final report ──────────────────────────────
    // If the doctor has already reviewed and saved this report, pre-fill with
    // their saved values instead of the auto-derived template values.
    const existingReport = await PatientFinalReport.findOne({
      patientId: patientUUID,
      sampleId:  sampleUUID,
      testId,
    }).lean();

    const savedConditionMap: Record<string, any> = {};
    if (existingReport && Array.isArray((existingReport as any).conditions)) {
      for (const c of (existingReport as any).conditions) {
        savedConditionMap[c.conditionName] = c;
      }
    }

    // ── 4. Group gene data by condition_name ─────────────────────────────────
    const grouped: Record<string, typeof geneData> = {};
    for (const gene of geneData) {
      const key = gene.condition_name;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(gene);
    }

    // ── 5. Build response conditions ──────────────────────────────────────────
    const conditions = Object.keys(grouped).map((conditionName) => {
      const genes = grouped[conditionName];

      // Find recommendation template for this condition
      const template = templates.find(
        (t) =>
          t.conditionName?.toLowerCase().trim() ===
          conditionName.toLowerCase().trim()
      );

      // Status options from template
      const statusOptions =
        template?.data.map((d: { status: string }) => d.status) ?? [];

      // Prefer saved doctor choice, fallback to worst-wins derived status
      const saved = savedConditionMap[conditionName];
      const selectedStatus = saved?.status ?? deriveWorstStatus(genes);

      // Get template entry for the selected status
      const templateEntry = template?.data.find(
        (d: { status: string }) =>
          d.status?.toLowerCase() === selectedStatus?.toLowerCase()
      );

      // Prefer saved doctor values, fallback to template, fallback to gene row
      return {
        conditionName,
        genes: genes.map((g) => ({
          gene:           g.gene,
          uniqueId:       g.uniqueId,
          test_variant:   g.test_variant,
          report_variant: g.report_variant,
          response:       g.response,
          sectionId:      g.sectionId,
          status:         g.status,
        })),
        selectedStatus,
        statusOptions,
        // Text fields: saved → template → gene row → ""
        recommendation: saved?.recommendation ?? templateEntry?.recommendation ?? genes[0]?.recommendation ?? "",
        interpretation:  saved?.interpretation ?? templateEntry?.interpretation ?? genes[0]?.interpretation ?? "",
        nutrition:       saved?.nutrition      ?? templateEntry?.nutrition      ?? "",
        lifestyle:       saved?.lifestyle      ?? templateEntry?.lifestyle      ?? "",
        miscellaneous:   saved?.miscellaneous  ?? templateEntry?.miscellaneous  ?? "",
        // Flag so the UI knows this was previously saved
        isSaved: !!saved,
      };
    });

    return NextResponse.json({
      success: true,
      patientId:    patientUUID,
      sampleId:     sampleUUID,
      testId,
      testCode,
      testReportName,
      patientName,
      templates,
      conditions,
      isExistingReport: !!existingReport,
    });
  } catch (error) {
    console.error("[GET /api/additional-info]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}