// lib/vendor-ethnicity-operations.ts
import { db } from '@/db';
import { VendorEthnicityMasterTable } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface EthnicityFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getVendorEthnicities(filters: EthnicityFilters = {}) {
  const { search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const baseQuery = db.select().from(VendorEthnicityMasterTable);
  const whereConditions: any[] = [];

  if (search) {
    whereConditions.push(
      sql`${VendorEthnicityMasterTable.ethnicity} ILIKE ${`%${search}%`}`
    );
  }

  const query =
    whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

  const baseCountQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(VendorEthnicityMasterTable);
  const countQuery =
    whereConditions.length > 0
      ? baseCountQuery.where(and(...whereConditions))
      : baseCountQuery;
  const totalResult = await countQuery;
  const total = Number(totalResult[0]?.count) || 0;

  // Get paginated results
  const ethnicities = await query
    .orderBy(desc(VendorEthnicityMasterTable.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    data: ethnicities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getVendorEthnicityById(id: string) {
  const result = await db
    .select()
    .from(VendorEthnicityMasterTable)
    .where(eq(VendorEthnicityMasterTable.id, id))
    .limit(1);
  return result[0];
}

export async function createVendorEthnicity(data: {
  ethnicity: string;
}) {
  const result = await db.insert(VendorEthnicityMasterTable).values({
    ethnicity: data.ethnicity,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  return result[0];
}

export async function updateVendorEthnicity(
  id: string,
  data: Partial<{
    ethnicity: string;
  }>
) {
  const result = await db
    .update(VendorEthnicityMasterTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(VendorEthnicityMasterTable.id, id))
    .returning();
  return result[0];
}

export async function deleteVendorEthnicity(id: string) {
  const result = await db
    .delete(VendorEthnicityMasterTable)
    .where(eq(VendorEthnicityMasterTable.id, id))
    .returning();
  return result[0];
}

export async function getVendorEthnicityOptions() {
  return await db
    .select({
      id: VendorEthnicityMasterTable.id,
      ethnicity: VendorEthnicityMasterTable.ethnicity,
    })
    .from(VendorEthnicityMasterTable)
    .orderBy(VendorEthnicityMasterTable.ethnicity);
}