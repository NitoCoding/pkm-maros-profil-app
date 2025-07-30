import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/libs/firebase-admin";
import {
  tambahGaleri,
  ambilGaleriPaginate,
  ambilGaleriById,
  updateGaleri,
  hapusGaleri,
} from "@/libs/api/galeri";

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

// POST /api/galeri - Create new galeri
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
    const galeriData = {
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: decodedToken.uid,
      authorEmail: decodedToken.email || 'unknown@email.com',
    };

    console.log("Creating galeri with verified user:", {
      uid: decodedToken.uid,
      email: decodedToken.email,
      caption: galeriData.caption
    });

    const result = await tambahGaleri(galeriData);
    
    console.log("Galeri created successfully with ID:", result.id);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Galeri berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating galeri:", error);
    
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
        error: error.message || "Failed to create galeri",
        details: error.toString(),
        code: error.code || "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
}

// GET /api/galeri - Get paginated galeri list (Public access)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");

    // If id is provided, get single galeri by id
    const id = searchParams.get("id");
    if (id) {
      const galeri = await ambilGaleriById(id);
      return NextResponse.json({ success: true, data: galeri });
    }

    // Otherwise return paginated list
    const result = await ambilGaleriPaginate(
      pageSize,
      cursor ? JSON.parse(cursor) : null
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching galeri:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch galeri" 
      },
      { status: 500 }
    );
  }
}

// PUT /api/galeri - Update galeri
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

    await updateGaleri(id, dataWithTimestamp);
    return NextResponse.json({ 
      success: true,
      message: "Galeri updated successfully" 
    });
  } catch (error: any) {
    console.error("Error updating galeri:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update galeri" },
      { status: 500 }
    );
  }
}

// DELETE /api/galeri - Delete galeri
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

    await hapusGaleri(id);
    return NextResponse.json({ 
      success: true,
      message: "Galeri deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting galeri:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete galeri" },
      { status: 500 }
    );
  }
} 