// src/actions/admin/vendor-actions.ts
"use server";

import { db } from "@/db";
import { VendorsTable, VendorSettingsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Helper functions
async function generateVendorCode(): Promise<string> {
  const vendors = await db.select().from(VendorsTable);
  const nextNumber = (vendors.length + 1).toString().padStart(6, "0");
  return `VEN${nextNumber}`;
}

async function generateLoginUrl(companyName: string): Promise<string> {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/vendor/login/${slug}`;
}

export async function createVendor(formData: FormData) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session?.user) {
      return { error: "Unauthorized - No session found" };
    }

    // Guard: ensure user ID is present
    if (!session.user.id) {
      return { error: "Unauthorized - No user ID found" };
    }
    const userId = session.user.id;

    // Check user role from session
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return { error: "Unauthorized - Insufficient permissions" };
    }

    // Extract form data
    const vendorData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      contactNo: formData.get("contactNo") as string,
      gender: formData.get("gender") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string | null,
      state: formData.get("state") as string | null,
      country: formData.get("country") as string | null,
      zipCode: formData.get("zipCode") as string | null,
      website: formData.get("website") as string | null,
      gstNumber: formData.get("gstNumber") as string | null,
      cinNumber: formData.get("cinNumber") as string | null,
      vatNumber: formData.get("vatNumber") as string | null,
      costCentreNo: formData.get("costCentreNo") as string | null,
      mrNo: formData.get("mrNo") as string | null,
      remark: formData.get("remark") as string | null,
    };

    // Validation - check required fields according to your schema
    if (
      !vendorData.name ||
      !vendorData.email ||
      !vendorData.contactNo ||
      !vendorData.gender ||
      !vendorData.address
    ) {
      return {
        error:
          "Missing required fields. Name, email, contact number, gender, and address are required.",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendorData.email)) {
      return { error: "Invalid email format" };
    }

    // Check if vendor already exists
    const existingVendor = await db.query.VendorsTable.findFirst({
      where: eq(VendorsTable.email, vendorData.email),
    });

    if (existingVendor) {
      return { error: "Vendor with this email already exists" };
    }

    // Generate unique vendor code and login URL
    const vendorCode = await generateVendorCode();
    const loginUrl = await generateLoginUrl(vendorData.name);
    
    // Extract login slug from URL
    const loginSlug = loginUrl.split('/vendor/login/')[1];
    
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 10);

    // Create vendor - Match all required fields from schema
    const [newVendor] = await db
      .insert(VendorsTable)
      .values({
        vendorCode,
        status: "ACTIVE",
        name: vendorData.name,
        contactNo: vendorData.contactNo,
        gender: vendorData.gender,
        costCentreNo: vendorData.costCentreNo || null,
        mrNo: vendorData.mrNo || null,
        email: vendorData.email,
        password: hashedPassword,
        logo: null,
        remark: vendorData.remark || null,
        loginurl: loginUrl,
        loginSlug: loginSlug,
        addedBy: userId,           // ✅ Fixed: guaranteed string
        isPasswordReset: true,
        lastLoginAt: null,
        address: vendorData.address,
        cinNumber: vendorData.cinNumber || null,
        vatNumber: vendorData.vatNumber || null,
        gstNumber: vendorData.gstNumber || null,
        city: vendorData.city || null,
        state: vendorData.state || null,
        country: vendorData.country || null,
        zipCode: vendorData.zipCode || null,
        website: vendorData.website || null,
        deletedAt: null,
      })
      .returning();

    // Create default vendor settings
    // Only pass fields that differ from DB defaults, or fields without defaults.
    // Do NOT pass null for notNull()+default() columns — omit them instead.
    await db.insert(VendorSettingsTable).values({
      vendorId: newVendor.id,    // ✅ Fixed: comes from returning(), typed as string
      deliverable: "REPORT",
      hidePersonalInfo: false,
      passwordProtectedReport: false,
      // passwordRule omitted — DB default "NAME4_DOB" will be used ✅
      coverPage: false,
      skinCoverBackPage: false,
      blankPage: false,
      sectionImages: false,
      summaryPages: false,
      splitWellnessReport: false,
      cardiometPagesLogo: false,
      cardiometCoverPageLogo: false,
      immunityBackCoverPageLogo: false,
      immunityCoverPageLogo: false,
      autoimmuneBackCoverPageLogo: false,
      autoimmuneCoverPageLogo: false,
      womanBackCoverPageLogo: false,
      womanCoverPageLogo: false,
      menBackCoverPageLogo: false,
      menCoverPageLogo: false,
      eyeBackCoverPageLogo: false,
      eyeCoverPageLogo: false,
      kidneyBackCoverPageLogo: false,
      kidneyCoverPageLogo: false,
      sleepBackCoverPageLogo: false,
      sleepCoverPageLogo: false,
      notifyTarget: "BOTH",
      // Optional nullable fields — safe to pass null
      s3BucketName: null,
      rawDataEmail: null,
      logoImg: null,
      coverLogoImgName: null,
      coverPageImgName: null,
      backCoverPageImgName: null,
      welcomeMessage: null,
      about: null,
      aboutImgName: null,
      legalDisContent: null,
      sigTitle: null,
      sigName: null,
      sigImgName: null,
      aboutThemeColor: null,
      aboutTextColor: null,
      testThemeColor: null,
      testTextColor: null,
      fitnessThemeColor: null,
      fitnessTextColor: null,
      weightThemeColor: null,
      weightTextColor: null,
      detoxThemeColor: null,
      detoxTextColor: null,
      cardiometThemeColor: null,
      cardiometTextColor: null,
      dietPage1Img: null,
      dietPage2Img: null,
      fitnessPage1Img: null,
      fitnessPage2Img: null,
      weightPage1Img: null,
      weightPage2Img: null,
      detoxPage1Img: null,
      detoxPage2Img: null,
      imageOverview: null,
      skinCoverPageImg: null,
      skinBackCoverPageImg: null,
      cardiometBackCoverPage: null,
      immunityCoverPage: null,
      immunityBackCoverPage: null,
      autoimmuneCoverPage: null,
      autoimmuneBackCoverPage: null,
      womanCoverPage: null,
      womanBackCoverPage: null,
      menCoverPage: null,
      menBackCoverPage: null,
      eyeCoverPage: null,
      eyeBackCoverPage: null,
      kidneyCoverPage: null,
      kidneyBackCoverPage: null,
      sleepCoverPage: null,
      sleepBackCoverPage: null,
      vendorAddress: null,
      notificationEvents: null,
    });

    revalidatePath("/dashboard/admin/vendors");

    return {
      success: true,
      vendor: newVendor,
      tempPassword, // In production, send via email only
      message: "Vendor created successfully",
    };
  } catch (error) {
    console.error("Error creating vendor:", error);
    return { error: "Failed to create vendor" };
  }
}

// Get all vendors
export async function getVendors() {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { error: "Unauthorized" };
    }

    const vendors = await db.query.VendorsTable.findMany({
      with: {
        settings: true,
        addedByUser: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: (vendors, { desc }) => [desc(vendors.createdAt)],
    });

    return vendors;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
}

// Get single vendor by ID
export async function getVendorById(vendorId: string) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { error: "Unauthorized" };
    }

    const vendor = await db.query.VendorsTable.findFirst({
      where: eq(VendorsTable.id, vendorId),
      with: {
        settings: true,
        ethnicities: true,
        hospitals: true,
        addedByUser: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vendor) {
      return { error: "Vendor not found" };
    }

    return vendor;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return { error: "Failed to fetch vendor" };
  }
}

// Update vendor status
export async function updateVendorStatus(
  vendorId: string,
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE"
) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { error: "Unauthorized" };
    }

    const [updatedVendor] = await db
      .update(VendorsTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(VendorsTable.id, vendorId))
      .returning();

    revalidatePath("/dashboard/admin/vendors");

    return {
      success: true,
      vendor: updatedVendor,
      message: "Vendor status updated successfully",
    };
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return { error: "Failed to update vendor status" };
  }
}

// Soft delete vendor
export async function deleteVendor(vendorId: string) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized - Only SUPER_ADMIN can delete vendors" };
    }

    const [deletedVendor] = await db
      .update(VendorsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(VendorsTable.id, vendorId))
      .returning();

    revalidatePath("/dashboard/admin/vendors");

    return {
      success: true,
      vendor: deletedVendor,
      message: "Vendor deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return { error: "Failed to delete vendor" };
  }
}

// Update vendor information
export async function updateVendor(vendorId: string, formData: FormData) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { error: "Unauthorized" };
    }

    const updateData: Record<string, unknown> = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      contactNo: formData.get("contactNo") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      country: formData.get("country") as string,
      zipCode: formData.get("zipCode") as string,
      website: formData.get("website") as string,
      gstNumber: formData.get("gstNumber") as string,
      cinNumber: formData.get("cinNumber") as string,
      vatNumber: formData.get("vatNumber") as string,
      costCentreNo: formData.get("costCentreNo") as string,
      mrNo: formData.get("mrNo") as string,
      remark: formData.get("remark") as string,
      updatedAt: new Date(),
    };

    // Remove undefined/empty values so they don't overwrite existing data
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === "") {
        delete updateData[key];
      }
    });

    const [updatedVendor] = await db
      .update(VendorsTable)
      .set(updateData)
      .where(eq(VendorsTable.id, vendorId))
      .returning();

    revalidatePath("/dashboard/admin/vendors");
    revalidatePath(`/dashboard/admin/vendors/${vendorId}`);

    return {
      success: true,
      vendor: updatedVendor,
      message: "Vendor updated successfully",
    };
  } catch (error) {
    console.error("Error updating vendor:", error);
    return { error: "Failed to update vendor" };
  }
}