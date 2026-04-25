/*eslint-disable @typescript-eslint/no-explicit-any */
// src/actions/admin/vendor-settings-actions.ts
"use server";

import { db } from "@/db";
import { VendorSettingsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateVendorSettings(vendorId: string, settingsData: any) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    // Check if settings exist
    const existingSettings = await db.query.VendorSettingsTable.findFirst({
      where: eq(VendorSettingsTable.vendorId, vendorId),
    });

    let updatedSettings;

    if (existingSettings) {
      // Update existing settings
      [updatedSettings] = await db
        .update(VendorSettingsTable)
        .set({
          ...settingsData,
          updatedAt: new Date(),
        })
        .where(eq(VendorSettingsTable.vendorId, vendorId))
        .returning();
    } else {
      // Create new settings
      [updatedSettings] = await db
        .insert(VendorSettingsTable)
        .values({
          vendorId,
          ...settingsData,
        })
        .returning();
    }

    revalidatePath(`/dashboard/admin/vendors/${vendorId}`);
    
    return { 
      success: true, 
      settings: updatedSettings,
      message: "Settings updated successfully" 
    };
  } catch (error) {
    console.error("Error updating vendor settings:", error);
    return { error: "Failed to update settings" };
  }
}

export async function getVendorSettings(vendorId: string) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    const settings = await db.query.VendorSettingsTable.findFirst({
      where: eq(VendorSettingsTable.vendorId, vendorId),
    });

    return settings || null;
  } catch (error) {
    console.error("Error fetching vendor settings:", error);
    return { error: "Failed to fetch settings" };
  }
}