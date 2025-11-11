// src/app/api/galeri/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  tambahGaleri,
  ambilGaleriPaginate,
  ambilGaleriById,
  updateGaleri,
  hapusGaleri,
} from "@/libs/api/galeri";
import { IGaleriUpdate } from "@/types/galeri";
import { ta } from "zod/v4/locales";

// Middleware akan menangani autentikasi dan menambahkan info user ke header
function getUserFromRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userName = request.headers.get('x-user-name');

  if (!userId || !userEmail) {
    return null;
  }

  return { userId, userEmail, userName };
}

// POST /api/galeri - Create new galeri
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const galeriData = {
      caption: data.caption,
      alt: data.alt,
      src: data.src,
      tanggal: data.tanggal,
      tags: data.tags,
      createdBy: user.userId,
      authorName: user.userName,
      authorEmail: user.userEmail,
      updatedBy: user.userId,
    };

    const result = await tambahGaleri(galeriData);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Galeri berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating galeri:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create galeri" },
      { status: 500 }
    );
  }
}

// GET /api/galeri - Get galeri list or single galeri
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");

    // If id is provided, get single galeri by id
    const id = searchParams.get("id");
    if (id) {
      const galeri = await ambilGaleriById(id);
      if (!galeri) {
        return NextResponse.json({ error: "Galeri not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: galeri });
    }

    // Otherwise return paginated list
    const result = await ambilGaleriPaginate(pageSize, cursor);
      
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching galeri:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch galeri" },
      { status: 500 }
    );
  }
}

// PUT /api/galeri - Update galeri
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const dataWithTimestamp: IGaleriUpdate = {
      ...updateData,
      updatedBy: user.userId,
    };
    // console.log(dataWithTimestamp)

    const success = await updateGaleri(id, dataWithTimestamp);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update galeri or no changes made" }, { status: 400 });
    }

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
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const success = await hapusGaleri(id);
    
    if (!success) {
      return NextResponse.json({ error: "Galeri not found" }, { status: 404 });
    }

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