/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/db";
import { VendorsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { auth } from "@/auth";
import { VendorResetPasswordSchema } from "@/validaton-schema";
import { z } from "zod";

export async function updateVendorPassword(
  values: z.infer<typeof VendorResetPasswordSchema>
) {
  try {
    const session = await auth();

    // Ensure vendor is authenticated
    if (!session?.user || session.user.role !== "VENDOR") {
      return { error: "Unauthorized — vendor access required" };
    }

    const vendorId = session.user.id;
    if (!vendorId) {
      return { error: "Unauthorized — no vendor ID found" };
    }

    // Validate input
    const validation = VendorResetPasswordSchema.safeParse(values);
    if (!validation.success) {
      return { error: "Invalid input data" };
    }

    const { currentPassword, newPassword } = validation.data;

    // Fetch vendor from DB
    const vendor = await db.query.VendorsTable.findFirst({
      where: eq(VendorsTable.id, vendorId),
    });

    if (!vendor) {
      return { error: "Vendor not found" };
    }

    // Verify current password
    const passwordMatch = await compare(currentPassword, vendor.password);
    if (!passwordMatch) {
      return { error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update vendor record
    await db
      .update(VendorsTable)
      .set({
        password: hashedPassword,
        isPasswordReset: false,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(VendorsTable.id, vendorId));

    return {
      success: "Password updated successfully. Redirecting to dashboard...",
    };
  } catch (error) {
    console.error("Error updating vendor password:", error);
    return { error: "Failed to update password. Please try again." };
  }
}
