// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    // Check required environment variables
    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error("Missing CLOUDINARY_API_SECRET environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get folder from request body
    const { folder } = await req.json();
    
    // Determine the base folder based on user role
    let baseFolder = "";
    
    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
      // Admin files go to admin-content folder
      baseFolder = "admin-content";
    } else if (session.user.role === "VENDOR") {
      // Vendor files go to vendor-specific folder
      const vendorCode = session.user.vendorCode || session.user.id;
      baseFolder = `vendors/${vendorCode}`;
    } else {
      return NextResponse.json({ error: "Forbidden - Invalid role" }, { status: 403 });
    }
    
    // Combine base folder with requested subfolder
    const finalFolder = folder 
      ? `${baseFolder}/${folder.replace(/^\/+/, '')}` 
      : baseFolder;
    
    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000);
    
    // Create signature with non-null assertion since we checked above
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: finalFolder,
      },
      process.env.CLOUDINARY_API_SECRET // Already checked, but TypeScript doesn't know that
    );

    // Return upload parameters with proper null checks
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      folder: finalFolder,
      role: session.user.role, // Optional: send role back for debugging
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}