//  pkm-maros-profil-app\src\app\api\berita\route.ts
import { NextRequest, NextResponse } from "next/server";
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
import { IBeritaUpdate } from "@/types/berita";

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

// POST /api/berita - Create new berita
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const beritaData = {
      ...data,
      createdBy: user.userId,
      authorName: user.userName,
      authorEmail: user.userEmail,
    };

    const result = await tambahBerita(beritaData);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Berita berhasil dibuat"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating berita:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create berita" },
      { status: 500 }
    );
  }
}

// GET /api/berita - Get berita list or single berita
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
      if (!berita) {
        return NextResponse.json({ error: "Berita not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: berita });
    }

    // If id is provided, get single berita by id
    const id = searchParams.get("id");
    if (id) {
      const berita = await ambilBeritaById(parseInt(id));
      if (!berita) {
        return NextResponse.json({ error: "Berita not found" }, { status: 404 });
      }
      // // console.log('Fetched berita by ID:', berita);
      return NextResponse.json({ success: true, data: berita });
    }

    // Otherwise return paginated list
    const result = isAdmin
      ? await ambilBeritaPaginateAdmin(pageSize, cursor)
      : await ambilBeritaPaginate(pageSize, cursor);
      
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching berita:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch berita" },
      { status: 500 }
    );
  }
}

// PUT /api/berita - Update berita
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    // // console.log(id)
    // // console.log(data)
    const { id, ...updateData } = data;

    if (!id) {
      // // console.log(id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const dataWithTimestamp: IBeritaUpdate = {
      ...updateData,
      updatedBy: user.userId,
    };

    const success = await updateBerita(parseInt(id), dataWithTimestamp);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to update berita or no changes made" }, { status: 400 });
    }

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
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const success = await hapusBerita(parseInt(id));
    
    if (!success) {
      return NextResponse.json({ error: "Berita not found" }, { status: 404 });
    }

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