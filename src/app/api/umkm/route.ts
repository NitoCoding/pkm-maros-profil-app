import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/libs/firebase-admin";
import {
  tambahUmkm,
  ambilUmkmPaginate,
  ambilUmkmById,
  updateUmkm,
  hapusUmkm,
  ambilUmkmBySlug,
} from "@/libs/api/umkm";

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove special chars
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/--+/g, '-') // Remove double dash
		.trim()
}

// Verify Firebase ID Token using Firebase Admin SDK
async function verifyFirebaseToken(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.substring(7);

  try {
    // Verify the Firebase ID token using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// POST /api/umkm - Create new UMKM
export async function POST(request: NextRequest) {
  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        {
          error: "Unauthorized - Invalid or expired token",
          details: "Please login again to get a valid token",
        },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Add metadata with user information from verified token
    const umkmData = {
      ...data,
      slug: slugify(data.nama),
      startPrice: parseFloat(data.startPrice) || 0,
      endPrice: parseFloat(data.endPrice) || 0,
      lokasi: {
        alamat: data.lokasi?.alamat || "",
        latitude: parseFloat(data.lokasi?.latitude) || 0,
        longitude: parseFloat(data.lokasi?.longitude) || 0,
      },
      createdAt: new Date().toISOString(),
      createdBy: decodedToken.uid,
      authorEmail: decodedToken.email || "unknown@email.com",
    };

    console.log("Creating UMKM with verified user:", {
      uid: decodedToken.uid,
      email: decodedToken.email,
      nama: umkmData.nama,
    });

    const result = await tambahUmkm(umkmData);

    // console.log("UMKM created successfully with ID:", result.id);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "UMKM berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating UMKM:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        {
          error: "Token expired - Please login again",
          code: "TOKEN_EXPIRED",
        },
        { status: 401 }
      );
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json(
        {
          error: "Invalid token format",
          code: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to create UMKM",
        details: error.toString(),
        code: error.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}

// GET /api/umkm - Get paginated UMKM list (Public access)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");

    // If id is provided, get single UMKM by id
    const id = searchParams.get("id");
    if (id) {
      const umkm = await ambilUmkmById(id);
      return NextResponse.json({ success: true, data: umkm });
    }

    // If slug is provided, get single UMKM by slug
    const slug = searchParams.get("slug");
    if (slug) {
      const umkm = await ambilUmkmBySlug(slug);
      return NextResponse.json({ success: true, data: umkm });
    }

    // Otherwise return paginated list
    const result = await ambilUmkmPaginate(
      pageSize,
      cursor ? JSON.parse(cursor) : null
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching UMKM:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch UMKM",
      },
      { status: 500 }
    );
  }
}

// PUT /api/umkm - Update UMKM
export async function PUT(request: NextRequest) {
  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or expired token" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Process numeric fields and location
    const processedData = {
      ...updateData,
      startPrice: parseFloat(updateData.startPrice) || 0,
      endPrice: parseFloat(updateData.endPrice) || 0,
      lokasi: {
        alamat: updateData.lokasi?.alamat || "",
        latitude: parseFloat(updateData.lokasi?.latitude) || 0,
        longitude: parseFloat(updateData.lokasi?.longitude) || 0,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid,
    };

    await updateUmkm(id, processedData);
    return NextResponse.json({
      success: true,
      message: "UMKM updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating UMKM:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update UMKM" },
      { status: 500 }
    );
  }
}

// DELETE /api/umkm - Delete UMKM
export async function DELETE(request: NextRequest) {
  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or expired token" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await hapusUmkm(id);
    return NextResponse.json({
      success: true,
      message: "UMKM deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting UMKM:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete UMKM" },
      { status: 500 }
    );
  }
}
