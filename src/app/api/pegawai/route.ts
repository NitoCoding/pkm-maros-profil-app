// src/app/api/pegawai/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  tambahPegawai,
  ambilPegawaiPaginate,
  ambilPegawaiById,
  updatePegawai,
  hapusPegawai,
} from "@/libs/api/pegawai";
import { IPegawaiUpdate } from "@/types/pegawai";

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

// POST /api/pegawai - Create new pegawai
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const pegawaiData = {
      ...data,
      createdBy: user.userId,
      authorName: user.userName,
      authorEmail: user.userEmail,
    };

    const result = await tambahPegawai(pegawaiData);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Pegawai berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating pegawai:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create pegawai" },
      { status: 500 }
    );
  }
}

// GET /api/pegawai - Get paginated pegawai list or single pegawai
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");
    const id = searchParams.get("id");

    if (id) {
      const pegawai = await ambilPegawaiById(parseInt(id));
      if (!pegawai) {
        return NextResponse.json({ error: "Pegawai not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: pegawai });
    }

    const result = await ambilPegawaiPaginate(pageSize, cursor);
      
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching pegawai:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pegawai" },
      { status: 500 }
    );
  }
}

// PUT /api/pegawai - Update pegawai
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

    const dataWithTimestamp: IPegawaiUpdate = {
      ...updateData,
      updatedBy: user.userId,
    };

    const success = await updatePegawai(id, dataWithTimestamp);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update pegawai or no changes made" }, { status: 400 });
    }

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
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const success = await hapusPegawai(parseInt(id));
    
    if (!success) {
      return NextResponse.json({ error: "Pegawai not found" }, { status: 404 });
    }

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