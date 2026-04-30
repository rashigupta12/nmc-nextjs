/*eslint-disable @typescript-eslint/no-unused-vars */
// src/actions/admin/vendor-actions.ts
"use server";

import { db } from "@/db";
import { VendorsTable, VendorSettingsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/mailer";

// Helper functions
async function generateVendorCode(): Promise<string> {
  const vendors = await db.select().from(VendorsTable);
  const nextNumber = (vendors.length + 1).toString().padStart(6, "0");
  return `BUS-P${nextNumber}`;
}

async function generateLoginUrl(companyName: string): Promise<string> {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/business/login/${slug}`;
}

// Send welcome email to new vendor
async function sendVendorWelcomeEmail(
  email: string,
  name: string,
  loginUrl: string,
  tempPassword: string,
  vendorCode: string
) {
  const loginPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL}/business/login`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome ${name}!</h2>
      <p>Your vendor account has been created successfully in the system.</p>
      
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Account Details:</h3>
        <p><strong>Vendor Code:</strong> ${vendorCode}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> <code style="background-color: #ddd; padding: 2px 5px; border-radius: 3px;">${tempPassword}</code></p>
      </div>
      
      <p>You can log in using either of these methods:</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Option 1 - Direct Login URL (Unique to your vendor):</strong></p>
        <p><a href="${loginUrl}" style="color: #0066cc; word-break: break-all;">${loginUrl}</a></p>
        
        <p><strong>Option 2 - General Login Page:</strong></p>
        <p><a href="${loginPageUrl}" style="color: #0066cc;">${loginPageUrl}</a></p>
        <p>Use your email and the temporary password above.</p>
      </div>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>⚠️ Important:</strong> For security reasons, you will be required to reset your password on first login.
        </p>
      </div>
      
      <p>If you have any questions or need assistance, please contact the administrator.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      
      <p style="color: #666; font-size: 12px;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `;

  await sendEmail(
    "Vendor Management System",
    email,
    "Welcome to Vendor Portal - Your Account Credentials",
    emailHtml
  );
}

// Send password reset email to vendor
async function sendVendorPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string,
  vendorCode: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const resetPasswordUrl = `${baseUrl}/business/reset-password`;
  const url = `${resetPasswordUrl}?token=${resetToken}&email=${email}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset the password for your vendor account.</p>
      
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Vendor Code:</strong> ${vendorCode}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      
      <p>Click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all; font-size: 12px;">${url}</p>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>⚠️ Note:</strong> This password reset link will expire in 1 hour.
        </p>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email or contact support immediately.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      
      <p style="color: #666; font-size: 12px;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `;

  await sendEmail(
    "Vendor Management System",
    email,
    "Reset Your Vendor Account Password",
    emailHtml
  );
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
      email: (formData.get("email") as string) || "",
      contactNo: (formData.get("contactNo") as string) || "",
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
      !vendorData.address
    ) {
      return {
        error:
          "Missing required fields. Name and address are required.",
      };
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (vendorData.email && !emailRegex.test(vendorData.email)) {
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
    const loginSlug = loginUrl.split('/business/login/')[1];
    
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 10);

    // Create vendor
    const [newVendor] = await db
      .insert(VendorsTable)
      .values({
        vendorCode,
        status: "ACTIVE",
        name: vendorData.name,
        contactNo: vendorData.contactNo,
        gender: vendorData.gender || 'O',
        costCentreNo: vendorData.costCentreNo || null,
        mrNo: vendorData.mrNo || null,
        email: vendorData.email,
        password: hashedPassword,
        logo: null,
        remark: vendorData.remark || null,
        loginurl: loginUrl,
        loginSlug: loginSlug,
        addedBy: userId,
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
    await db.insert(VendorSettingsTable).values({
      vendorId: newVendor.id,
      deliverable: "REPORT",
      hidePersonalInfo: false,
      passwordProtectedReport: false,
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

    // Send welcome email with credentials only if email is provided
    if (vendorData.email) {
      try {
        await sendVendorWelcomeEmail(
          vendorData.email,
          vendorData.name,
          loginUrl,
          tempPassword,
          vendorCode
        );
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the vendor creation if email fails
      }
    }

    revalidatePath("/dashboard/admin/business");

    return {
      success: true,
      vendor: newVendor,
      tempPassword,
      message: "Vendor created successfully. Welcome email sent with credentials.",
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

    revalidatePath("/dashboard/admin/business");

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

    revalidatePath("/dashboard/admin/business");

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

    revalidatePath("/dashboard/admin/business");
    revalidatePath(`/dashboard/admin/business/${vendorId}`);

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

// Reset vendor password with email notification
export async function resetVendorPassword(vendorId: string) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { error: "Unauthorized" };
    }

    // Get vendor details first
    const vendor = await db.query.VendorsTable.findFirst({
      where: eq(VendorsTable.id, vendorId),
    });

    if (!vendor) {
      return { error: "Vendor not found" };
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 10);

    await db
      .update(VendorsTable)
      .set({
        password: hashedPassword,
        isPasswordReset: true,
        updatedAt: new Date(),
      })
      .where(eq(VendorsTable.id, vendorId));

    // Send password reset email with temporary password
    const loginPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL}/business/login`;
    const loginUrl = vendor.loginurl || loginPageUrl;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset - ${vendor.name}</h2>
        <p>Your vendor account password has been reset by an administrator.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #555;">New Account Details:</h3>
          <p><strong>Vendor Code:</strong> ${vendor.vendorCode}</p>
          <p><strong>Email:</strong> ${vendor.email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #ddd; padding: 2px 5px; border-radius: 3px;">${tempPassword}</code></p>
        </div>
        
        <p>You can log in using either of these methods:</p>
        
        <div style="margin: 20px 0;">
          <p><strong>Option 1 - Direct Login URL:</strong></p>
          <p><a href="${loginUrl}" style="color: #0066cc; word-break: break-all;">${loginUrl}</a></p>
          
          <p><strong>Option 2 - General Login Page:</strong></p>
          <p><a href="${loginPageUrl}" style="color: #0066cc;">${loginPageUrl}</a></p>
        </div>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Important:</strong> For security reasons, you will be required to reset your password on next login.
          </p>
        </div>
        
        <p>If you didn't request this password reset, please contact the administrator immediately.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    await sendEmail(
      "Vendor Management System",
      vendor.email,
      "Your Vendor Password Has Been Reset",
      emailHtml
    );

    revalidatePath(`/dashboard/admin/business/${vendorId}`);

    return {
      success: true,
      tempPassword,
      message: "Password reset successfully. Email sent with new credentials.",
    };
  } catch (error) {
    console.error("Error resetting vendor password:", error);
    return { error: "Failed to reset password" };
  }
}

// Initiate password reset from vendor login page (forgot password)
export async function initiateVendorPasswordReset(email: string) {
  try {
    // Find vendor by email
    const vendor = await db.query.VendorsTable.findFirst({
      where: eq(VendorsTable.email, email),
    });

    if (!vendor) {
      return { error: "No vendor found with this email address" };
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

   

    // Send password reset email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
    const resetUrl = `${baseUrl}/business/reset-password?token=${resetToken}&email=${email}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${vendor.name},</p>
        <p>We received a request to reset the password for your vendor account.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Vendor Code:</strong> ${vendor.vendorCode}</p>
          <p><strong>Email:</strong> ${vendor.email}</p>
        </div>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Note:</strong> This password reset link will expire in 1 hour.
          </p>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email or contact support immediately.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    await sendEmail(
      "Vendor Management System",
      vendor.email,
      "Reset Your Vendor Account Password",
      emailHtml
    );

    return { success: "Password reset email sent successfully" };
  } catch (error) {
    console.error("Error initiating password reset:", error);
    return { error: "Failed to send reset email" };
  }
}