// app/api/admin/vendor-hospitals/route.ts
export const runtime = "nodejs";

import { db } from "@/db";
import { VendorHospitalMasterTable } from "@/db/schema";
import { eq, ilike, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const search = searchParams.get("search") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "8"), 20);

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const conditions = [
      eq(VendorHospitalMasterTable.vendorId, vendorId),
      eq(VendorHospitalMasterTable.isActive, true),
    ];

    if (search.trim()) {
      conditions.push(ilike(VendorHospitalMasterTable.hospital, `%${search}%`));
    }

    const hospitals = await db
      .select({
        id: VendorHospitalMasterTable.id,
        hospital: VendorHospitalMasterTable.hospital,
        address: VendorHospitalMasterTable.address,
        contactNo: VendorHospitalMasterTable.contactNo,
      })
      .from(VendorHospitalMasterTable)
      .where(and(...conditions))
      .orderBy(asc(VendorHospitalMasterTable.hospital))
      .limit(limit);

    return NextResponse.json({ hospitals }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor hospitals:", error);
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
  }
}