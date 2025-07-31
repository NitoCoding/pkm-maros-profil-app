import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/libs/firebase-admin";
import {
  tambahBerita,
  ambilBeritaPaginate,
  ambilBeritaPaginateAdmin,
  ambilBeritaById,
  updateBerita,
  hapusBerita,
  ambilBeritaBySlug,
  ambilBeritaBySlugAdmin,
} from "@/libs/api/berita";

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

// POST /api/berita - Create new berita
export async function POST(request: NextRequest) {
  try {
    // Verify Firebase ID Token
    const decodedToken = await verifyFirebaseToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { 
          error: "Unauthorized - Invalid or expired token",
          details: "Please login again to get a valid token"
        },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Add metadata with user information from verified token
    const beritaData = {
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: decodedToken.uid,
      authorEmail: decodedToken.email || 'unknown@email.com',
      authorName: decodedToken.name || decodedToken.email || 'Unknown User',
    };

    console.log("Creating berita with verified user:", {
      uid: decodedToken.uid,
      email: decodedToken.email,
      title: beritaData.judul
    });

    const result = await tambahBerita(beritaData);
    
    console.log("Berita created successfully with ID:", result.id);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Berita berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating berita:", error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { 
          error: "Token expired - Please login again",
          code: "TOKEN_EXPIRED"
        },
        { status: 401 }
      );
    }
    
    if (error.code === 'auth/argument-error') {
      return NextResponse.json(
        { 
          error: "Invalid token format",
          code: "INVALID_TOKEN"
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to create berita",
        details: error.toString(),
        code: error.code || "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
}

// GET /api/berita - Get paginated berita list (Public access)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");
    const isAdmin = searchParams.get("admin") === "true";

    // If slug is provided, get single berita by slug
    const slug = searchParams.get("slug");
    if (slug) {
      const berita = isAdmin 
        ? await ambilBeritaBySlugAdmin(slug)
        : await ambilBeritaBySlug(slug);
      return NextResponse.json({ success: true, data: berita });
    }

    // If id is provided, get single berita by id
    const id = searchParams.get("id");
    if (id) {
      const berita = await ambilBeritaById(id);
      return NextResponse.json({ success: true, data: berita });
    }

    // Otherwise return paginated list
    const result = isAdmin
      ? await ambilBeritaPaginateAdmin(
          pageSize,
          cursor ? JSON.parse(cursor) : null
        )
      : await ambilBeritaPaginate(
          pageSize,
          cursor ? JSON.parse(cursor) : null
        );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching berita:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch berita" 
      },
      { status: 500 }
    );
  }
}

// PUT /api/berita - Update berita
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

    // Add metadata
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid,
    };

    await updateBerita(id, dataWithTimestamp);
    return NextResponse.json({ 
      success: true,
      message: "Berita updated successfully" 
    });
  } catch (error: any) {
    console.error("Error updating berita:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update berita" },
      { status: 500 }
    );
  }
}

// DELETE /api/berita - Delete berita
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

    await hapusBerita(id);
    return NextResponse.json({ 
      success: true,
      message: "Berita deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting berita:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete berita" },
      { status: 500 }
    );
  }
}
