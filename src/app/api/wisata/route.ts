// src/app/api/wisata/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  tambahWisata,
  ambilWisataPaginate,
  ambilWisataPaginateAdmin,
  ambilWisataById,
  updateWisata,
  hapusWisata,
  ambilWisataBySlug,
  ambilWisataBySlugAdmin,
} from "@/libs/api/wisata";
import { IWisataUpdate } from "@/types/wisata-admin";

// Middleware akan menangani autentikasi dan menambahkan info user ke header
// Kita bisa mengaksesnya dari request.headers
function getUserFromRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userName = request.headers.get('x-user-name');

  if (!userId || !userEmail) {
    return null;
  }

  return { userId, userEmail, userName };
}

// POST /api/wisata - Create new wisata
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const wisataData = {
      ...data,
      createdBy: parseInt(user.userId),
    };

    // // console.log("📬 Data diterima dari client:", JSON.stringify(data, null, 2));
    const result = await tambahWisata(wisataData);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Wisata berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating wisata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create wisata" },
      { status: 500 }
    );
  }
}

// GET /api/wisata - Get wisata list or single wisata
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");
    const isAdmin = searchParams.get("admin") === "true";

    // If slug is provided, get single wisata by slug
    const slug = searchParams.get("slug");
    if (slug) {
      const wisata = isAdmin 
        ? await ambilWisataBySlugAdmin(slug)
        : await ambilWisataBySlug(slug);
      if (!wisata) {
        return NextResponse.json({ error: "Wisata not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: wisata });
    }

    // If id is provided, get single wisata by id
    const id = searchParams.get("id");
    if (id) {
      const wisata = await ambilWisataById(id);
      if (!wisata) {
        return NextResponse.json({ error: "Wisata not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: wisata });
    }

    // Otherwise return paginated list
    const result = isAdmin
      ? await ambilWisataPaginateAdmin(pageSize, cursor)
      : await ambilWisataPaginate(pageSize, cursor);
      
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching wisata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wisata" },
      { status: 500 }
    );
  }
}

// PUT /api/wisata - Update wisata
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

    const dataWithTimestamp: IWisataUpdate = {
      ...updateData,
      updatedBy: parseInt(user.userId),
    };

    const success = await updateWisata(id, dataWithTimestamp);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update wisata or no changes made" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      data: success,
      message: "Wisata updated successfully" 
    });
  } catch (error: any) {
    console.error("Error updating wisata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update wisata" },
      { status: 500 }
    );
  }
}

// DELETE /api/wisata - Delete wisata
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

    const success = await hapusWisata(id);
    
    if (!success) {
      return NextResponse.json({ error: "Wisata not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Wisata deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting wisata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete wisata" },
      { status: 500 }
    );
  }
}