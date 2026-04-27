"use server";

import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { VendorsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Vendor specific logout action
 * ✅ Redirects vendor back to their own unique login page
 * ✅ Preserves multi-tenant slug URL structure
 * ✅ Vendors never see the main admin login page
 */
export async function vendorLogout() {
  try {
    const session = await auth();

    // Default fallback if something goes wrong
    let redirectUrl = "/";

    if (session?.user?.role === "VENDOR" && session.user.id) {
      // Get vendor record to fetch their unique login slug
      const vendor = await db.query.VendorsTable.findFirst({
        where: eq(VendorsTable.id, session.user.id),
        columns: { loginSlug: true }
      });

      if (vendor?.loginSlug) {
        // Redirect to vendor's specific login page
        redirectUrl = `/vendor/login/${vendor.loginSlug}`;
      }
    }

    // Sign out and redirect to vendor login page
    await signOut({
      redirectTo: redirectUrl
    });

  } catch (error) {
    // Handle Next.js redirect throw
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error("Vendor logout error:", error);
    
    // Fallback redirect
    await signOut({
      redirectTo: "/"
    });
  }
}