// src/lib/vendor-utils.ts
import { db } from "@/db";
import { VendorsTable } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function generateVendorCode(): Promise<string> {
  const vendorCount = await db.select({ count: count() }).from(VendorsTable);
  const nextNumber = (vendorCount[0].count + 1).toString().padStart(6, '0');
  return `VEN${nextNumber}`;
}

export async function generateLoginUrl(companyName: string): Promise<string> {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/vendor/login/${slug}`;
}