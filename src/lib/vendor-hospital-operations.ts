// lib/vendor-hospital-operations.ts
import { db } from '@/db';
import { VendorHospitalMasterTable } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface HospitalFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export async function getVendorHospitals(filters: HospitalFilters = {}) {
  const { search, isActive, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const baseQuery = db.select().from(VendorHospitalMasterTable);
  const whereConditions: any[] = [];

  if (isActive !== undefined) {
    whereConditions.push(eq(VendorHospitalMasterTable.isActive, isActive));
  }
  if (search) {
    whereConditions.push(
      sql`${VendorHospitalMasterTable.hospital} ILIKE ${`%${search}%`} OR ${VendorHospitalMasterTable.address} ILIKE ${`%${search}%`}`
    );
  }

  const query =
    whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

  // Get total count
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(VendorHospitalMasterTable);
  if (whereConditions.length > 0) {
    countQuery.where(and(...whereConditions));
  }
  const totalResult = await countQuery;
  const total = Number(totalResult[0]?.count) || 0;

  // Get paginated results
  const hospitals = await query
    .orderBy(desc(VendorHospitalMasterTable.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    data: hospitals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getVendorHospitalById(id: string) {
  const result = await db
    .select()
    .from(VendorHospitalMasterTable)
    .where(eq(VendorHospitalMasterTable.id, id))
    .limit(1);
  return result[0];
}

export async function createVendorHospital(data: {
  hospital: string;
  address: string;
  contactNo: string;
  isActive?: boolean;
}) {
  const result = await db.insert(VendorHospitalMasterTable).values({
    hospital: data.hospital,
    address: data.address,
    contactNo: data.contactNo,
    isActive: data.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  return result[0];
}

export async function updateVendorHospital(
  id: string,
  data: Partial<{
    hospital: string;
    address: string;
    contactNo: string;
    isActive: boolean;
  }>
) {
  const result = await db
    .update(VendorHospitalMasterTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(VendorHospitalMasterTable.id, id))
    .returning();
  return result[0];
}

export async function deleteVendorHospital(id: string) {
  const result = await db
    .delete(VendorHospitalMasterTable)
    .where(eq(VendorHospitalMasterTable.id, id))
    .returning();
  return result[0];
}