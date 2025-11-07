// src/app/api/produk-umkm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { tambahProdukUMKM, ambilProdukUMKMPaginate, ambilProdukUMKMById } from "@/libs/api/produkUMKM";
import { IProdukUMKMUpdate } from "@/types/umkm";
import { hapusProdukUMKM, updateProdukUMKM } from "@/libs/api/produkUMKM";

// ... fungsi getUserFromRequest tetap sama

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

// POST /api/produk-umkm - Create new produk
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const produkData = {
      ...data,
      createdBy: user.userId,
      authorName: user.userName,
      authorEmail: user.userEmail,
    };

    const result = await tambahProdukUMKM(produkData);
    return NextResponse.json({ success: true, data: result, message: "Produk berhasil ditambahkan" }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating produk:", error);
    return NextResponse.json({ error: error.message || "Failed to create produk" }, { status: 500 });
  }
}

// GET /api/produk-umkm - Get produk list or single produk
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");
    const id = searchParams.get("id");

    if (id) {
      const produk = await ambilProdukUMKMById(id);
      if (!produk) return NextResponse.json({ error: "Produk not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: produk });
    }

    const result = await ambilProdukUMKMPaginate(pageSize, cursor);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    // ... error handling
  }
}

// ... export PUT dan DELETE

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const { id, ...updateData } = data;
    const produkData: IProdukUMKMUpdate = {
      ...updateData,
      updatedBy: user.userId,
    };
    const result = await updateProdukUMKM(id, produkData);
    return NextResponse.json({ success: true, data: result, message: "Produk berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updating produk:", error);
    return NextResponse.json({ error: error.message || "Failed to update produk" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    const success = await hapusProdukUMKM(id);
    if (!success) return NextResponse.json({ error: "Produk not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting produk:", error);
    return NextResponse.json({ error: error.message || "Failed to delete produk" }, { status: 500 });
  }
}