//  pkm-maros-profil-app\src\app\api\berita\route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  tambahBerita,
  ambilBeritaPaginate,
  ambilBeritaPaginateAdmin,
  ambilBeritaPaginateAdminWithFilters,
  ambilBeritaById,
  updateBerita,
  hapusBerita,
  ambilBeritaBySlug,
  ambilBeritaBySlugAdmin,
} from "@/libs/api/berita";
import { IBeritaUpdate } from "@/types/berita";
import { parseFilterParams, hasActiveFilters, BeritaAdminFilters } from "@/libs/utils/filterBuilder";
import { transformId, transformIds, transformPaginatedResponse } from "@/libs/utils/responseTransform";
import { decodeId } from "@/libs/utils/hashids";
import {
  handleApiError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  unauthorized,
  notFound,
  validationError,
} from "@/libs/security/errorHandler";

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
      return unauthorized("Authentication required");
    }

    const data = await request.json();

    // Basic validation
    if (!data.judul || !data.isi) {
      return validationError("Judul and isi are required", "judul");
    }

    const beritaData = {
      ...data,
      createdBy: user.userId,
      authorName: user.userName,
      authorEmail: user.userEmail,
    };

    const result = await tambahBerita(beritaData);

    return NextResponse.json({
      success: true,
      data: transformId(result),
      message: "Berita berhasil dibuat"
    }, { status: 201 });

  } catch (error: any) {
    return handleApiError(error, request);
  }
}

// GET /api/berita - Get berita list or single berita
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const isAdmin = searchParams.get("admin") === "true";

    // If slug is provided, get single berita by slug
    const slug = searchParams.get("slug");
    if (slug) {
      const berita = isAdmin
        ? await ambilBeritaBySlugAdmin(slug)
        : await ambilBeritaBySlug(slug);
      if (!berita) {
        return notFound("Berita");
      }
      return NextResponse.json({ success: true, data: transformId(berita) });
    }

    // If id is provided, get single berita by id
    const id = searchParams.get("id");
    if (id) {
      const berita = await ambilBeritaById(decodeId(id));
      if (!berita) {
        return notFound("Berita");
      }
      return NextResponse.json({ success: true, data: transformId(berita) });
    }

    // Use centralized utility to parse filters
    const filters = parseFilterParams(searchParams);
    const hasFilters = hasActiveFilters(filters);

    // Return paginated list
    let result;
    if (isAdmin && hasFilters) {
      // Use filtered query for admin with filters
      result = await ambilBeritaPaginateAdminWithFilters(page, pageSize, filters);
    } else if (isAdmin) {
      // Use regular admin query with page-based pagination
      result = await ambilBeritaPaginateAdminWithFilters(page, pageSize, {});
    } else {
      // Use public query (TODO: update to page-based too if needed)
      result = await ambilBeritaPaginateAdminWithFilters(page, pageSize, { status: 'published' });
    }

    return NextResponse.json({ success: true, data: transformPaginatedResponse(result) });
  } catch (error: any) {
    return handleApiError(error, request);
  }
}

// PUT /api/berita - Update berita
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return unauthorized("Authentication required");
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return validationError("ID is required", "id");
    }

    const dataWithTimestamp: IBeritaUpdate = {
      ...updateData,
      updatedBy: user.userId,
    };

    const success = await updateBerita(decodeId(id), dataWithTimestamp);

    if (!success) {
      return notFound("Berita");
    }

    return NextResponse.json({
      success: true,
      message: "Berita updated successfully"
    });
  } catch (error: any) {
    return handleApiError(error, request);
  }
}

// DELETE /api/berita - Delete berita
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return unauthorized("Authentication required");
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return validationError("ID is required", "id");
    }

    const success = await hapusBerita(decodeId(id));

    if (!success) {
      return notFound("Berita");
    }

    return NextResponse.json({
      success: true,
      message: "Berita deleted successfully"
    });
  } catch (error: any) {
    return handleApiError(error, request);
  }
}