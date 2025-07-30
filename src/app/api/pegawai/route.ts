import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/libs/firebase-admin";
import {
  tambahPegawai,
  ambilPegawaiPaginate,
  ambilPegawaiById,
  updatePegawai,
  hapusPegawai,
} from "@/libs/api/pegawai";

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

// POST /api/pegawai - Create new pegawai
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

    // Convert urutanTampil to number
    const pegawaiData = {
      ...data,
      urutanTampil: parseInt(data.urutanTampil) || 0,
      createdAt: new Date().toISOString(),
      createdBy: decodedToken.uid,
      authorEmail: decodedToken.email || 'unknown@email.com',
    };

    console.log("Creating pegawai with verified user:", {
      uid: decodedToken.uid,
      email: decodedToken.email,
      nama: pegawaiData.nama
    });

    const result = await tambahPegawai(pegawaiData);
    
    console.log("Pegawai created successfully with ID:", result.id);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Pegawai berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating pegawai:", error);
    
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
        error: error.message || "Failed to create pegawai",
        details: error.toString(),
        code: error.code || "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
}

// GET /api/pegawai - Get paginated pegawai list (Public access)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");

    // If id is provided, get single pegawai by id
    const id = searchParams.get("id");
    if (id) {
      const pegawai = await ambilPegawaiById(id);
      return NextResponse.json({ success: true, data: pegawai });
    }

    // Otherwise return paginated list
    const result = await ambilPegawaiPaginate(
      pageSize,
      cursor ? JSON.parse(cursor) : null
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching pegawai:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch pegawai" 
      },
      { status: 500 }
    );
  }
}

// PUT /api/pegawai - Update pegawai
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

    // Convert urutanTampil to number if provided
    if (updateData.urutanTampil) {
      updateData.urutanTampil = parseInt(updateData.urutanTampil) || 0;
    }

    // Add metadata
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid,
    };

    await updatePegawai(id, dataWithTimestamp);
    return NextResponse.json({ 
      success: true,
      message: "Pegawai updated successfully" 
    });
  } catch (error: any) {
    console.error("Error updating pegawai:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update pegawai" },
      { status: 500 }
    );
  }
}

// DELETE /api/pegawai - Delete pegawai
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

    await hapusPegawai(id);
    return NextResponse.json({ 
      success: true,
      message: "Pegawai deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting pegawai:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete pegawai" },
      { status: 500 }
    );
  }
} 