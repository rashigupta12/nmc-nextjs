// app/api/admin/vendor-ethnicities/route.ts
export const runtime = "nodejs";

import { db } from "@/db";
import { VendorEthnicityMasterTable } from "@/db/schema";
import { eq, ilike, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const search = searchParams.get("search") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const conditions = [eq(VendorEthnicityMasterTable.vendorId, vendorId)];

    if (search.trim()) {
      conditions.push(ilike(VendorEthnicityMasterTable.ethnicity, `%${search}%`));
    }

    const ethnicities = await db
      .select({
        id: VendorEthnicityMasterTable.id,
        ethnicity: VendorEthnicityMasterTable.ethnicity,
      })
      .from(VendorEthnicityMasterTable)
      .where(and(...conditions))
      .orderBy(asc(VendorEthnicityMasterTable.ethnicity))
      .limit(limit);

    return NextResponse.json({ ethnicities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor ethnicities:", error);
    return NextResponse.json({ error: "Failed to fetch ethnicities" }, { status: 500 });
  }
}