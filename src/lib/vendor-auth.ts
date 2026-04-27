import { auth } from "@/auth";
import { db } from "@/db";
import { VendorsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Get the currently authenticated vendor
 * @throws Redirects to login if not authenticated as vendor
 * @returns Vendor object from database
 */
export async function getCurrentVendor() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'VENDOR') {
    redirect('/vendor/login');
  }

  const vendor = await db.query.VendorsTable.findFirst({
    where: eq(VendorsTable.id, session.user.id!),
  });

  if (!vendor || vendor.status !== 'ACTIVE') {
    redirect('/vendor/login');
  }

  return vendor;
}

/**
 * Check if current user is authenticated as a vendor
 * @returns boolean
 */
export async function isVendorAuthenticated() {
  const session = await auth();
  return session?.user?.role === 'VENDOR';
}

/**
 * Create a vendor scoped database context
 * Automatically applies vendorId filter to all queries
 * 
 * @param vendorId - Vendor ID to scope queries to
 * @returns Scoped query helpers
 */
export function createVendorScopedDb(vendorId: string) {
  return {
    /**
     * Get raw vendor ID for manual queries
     */
    vendorId,

    /**
     * Validate that an entity belongs to the current vendor
     * @param entityVendorId - Vendor ID from the entity
     * @throws Error if entity does not belong to current vendor
     */
    validateOwnership: (entityVendorId: string) => {
      if (entityVendorId !== vendorId) {
        throw new Error('Access denied: This resource does not belong to your vendor account');
      }
    },

    /**
     * Query helpers that automatically add vendorId filter
     */
    query: {
      patients: {
        findMany: (options?: any) => db.query.PatientsTable.findMany({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
        findFirst: (options?: any) => db.query.PatientsTable.findFirst({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
      },

      orders: {
        findMany: (options?: any) => db.query.OrdersTable.findMany({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
        findFirst: (options?: any) => db.query.OrdersTable.findFirst({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
      },

      samples: {
        findMany: (options?: any) => db.query.SamplesTable.findMany({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
        findFirst: (options?: any) => db.query.SamplesTable.findFirst({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
      },

      shipments: {
        findMany: (options?: any) => db.query.ShipmentsTable.findMany({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
        findFirst: (options?: any) => db.query.ShipmentsTable.findFirst({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
      },

      invoices: {
        findMany: (options?: any) => db.query.InvoicesTable.findMany({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
        findFirst: (options?: any) => db.query.InvoicesTable.findFirst({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
      },

      settings: () => db.query.VendorSettingsTable.findFirst({
        where: (table: any, { eq }: any) => eq(table.vendorId, vendorId)
      }),

      pricelist: {
        findMany: (options?: any) => db.query.PricelistTable.findMany({
          ...options,
          where: (table: any, { eq, and }: any) => and(
            eq(table.vendorId, vendorId),
            options?.where ? options.where(table, { eq, and }) : undefined
          )
        }),
      },
    },
  };
}

/**
 * Get scoped database instance for current authenticated vendor
 * @throws Redirects if not authenticated
 * @returns Scoped database wrapper
 */
export async function getVendorScopedDb() {
  const vendor = await getCurrentVendor();
  return createVendorScopedDb(vendor.id);
}