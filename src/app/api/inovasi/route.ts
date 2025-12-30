// pkm-maros-profil-app\src\app\api\inovasi\route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  tambahInovasi,
  ambilInovasiPaginate,
  ambilInovasiPaginateAdmin,
  ambilInovasiById,
  updateInovasi,
  hapusInovasi,
  ambilInovasiBySlug,
  ambilInovasiBySlugAdmin,
} from "@/libs/api/inovasi";
import { IInovasi } from "@/types/inovasi";

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

// POST /api/inovasi - Create new inovasi
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const inovasiData = {
      ...data,
      createdBy: user.userId,
      authorName: user.userName,
      authorEmail: user.userEmail,
    };

    const result = await tambahInovasi(inovasiData);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Inovasi berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating inovasi:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create inovasi" },
      { status: 500 }
    );
  }
}

// GET /api/inovasi - Get inovasi list or single inovasi
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const cursor = searchParams.get("cursor");
    const isAdmin = searchParams.get("admin") === "true";
    const kategori = searchParams.get("kategori");
    const tahun = searchParams.get("tahun");

    // tahun to number
    const tahunNumber = tahun ? parseInt(tahun) : null;

    // If slug is provided, get single inovasi by slug
    const slug = searchParams.get("slug");
    if (slug) {
      const inovasi = isAdmin 
        ? await ambilInovasiBySlugAdmin(slug)
        : await ambilInovasiBySlug(slug);
      if (!inovasi) {
        return NextResponse.json({ error: "Inovasi not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: inovasi });
    }

    // If id is provided, get single inovasi by id
    const id = searchParams.get("id");
    if (id) {
      const inovasi = await ambilInovasiById(id);
      if (!inovasi) {
        return NextResponse.json({ error: "Inovasi not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: inovasi });
    }

    // Otherwise return paginated list
    const result = isAdmin
      ? await ambilInovasiPaginateAdmin(pageSize, cursor, kategori, tahunNumber)
      : await ambilInovasiPaginate(pageSize, cursor, kategori, tahunNumber);
      
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching inovasi:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inovasi" },
      { status: 500 }
    );
  }
}

// PUT /api/inovasi - Update inovasi
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

    const dataWithTimestamp = {
      ...updateData,
      updatedBy: user.userId,
    };

    const success = await updateInovasi(id, dataWithTimestamp);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update inovasi or no changes made" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Inovasi updated successfully" 
    });
  } catch (error: any) {
    console.error("Error updating inovasi:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update inovasi" },
      { status: 500 }
    );
  }
}

// DELETE /api/inovasi - Delete inovasi
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

    const success = await hapusInovasi(id);
    
    if (!success) {
      return NextResponse.json({ error: "Inovasi not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Inovasi deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting inovasi:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete inovasi" },
      { status: 500 }
    );
  }
}
