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
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get folder from request body
    const { folder } = await req.json();
    
    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000);
    
    // Create signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: folder || "admin-content",
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    // Return upload parameters
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: folder || "admin-content",
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}