// src/app/api/produk-umkm/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/libs/database";

/**
 * GET /api/produk-umkm/admin
 * Get paginated and filtered produk UMKM for admin
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const search = searchParams.get("search") || "";
    const kategori = searchParams.get("kategori") || "";
    const hargaMin = searchParams.get("hargaMin") || "";
    const hargaMax = searchParams.get("hargaMax") || "";

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push(`(
        nama_produk LIKE ? OR
        nama_umkm LIKE ? OR
        deskripsi LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (kategori) {
      conditions.push("kategori = ?");
      params.push(kategori);
    }

    if (hargaMin) {
      conditions.push("harga_awal >= ?");
      params.push(parseInt(hargaMin));
    }

    if (hargaMax) {
      conditions.push("harga_awal <= ?");
      params.push(parseInt(hargaMax));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM produk_umkm
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Get paginated data
    const offset = (page - 1) * pageSize;
    const dataQuery = `
      SELECT
        id_uuid as id,
        nama_produk as namaProduk,
        nama_umkm as namaUMKM,
        kategori,
        gambar,
        json_object(
          'awal', harga_awal,
          'akhir', harga_akhir
        ) as harga,
        json_object(
          'telepon', kontak_telepon,
          'whatsapp', kontak_whatsapp
        ) as kontak,
        json_object(
          'alamat', lokasi_alamat,
          'latitude', lokasi_latitude,
          'longitude', lokasi_longitude,
          'googleMapsLink', lokasi_google_maps_link
        ) as lokasi,
        deskripsi,
        created_at as createdAt,
        updated_at as updatedAt
      FROM produk_umkm
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Combine all params including LIMIT and OFFSET
    const allParams = [...params, pageSize, offset];
    const products = await executeQuery(dataQuery, allParams);

    // Parse JSON fields and sanitize
    const sanitizedProducts = products.map((product: any) => ({
      ...product,
      harga: product.harga ? JSON.parse(product.harga) : { awal: 0, akhir: null },
      kontak: product.kontak ? JSON.parse(product.kontak) : { telepon: '', whatsapp: '' },
      lokasi: product.lokasi ? JSON.parse(product.lokasi) : { alamat: '', latitude: null, longitude: null, googleMapsLink: null }
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedProducts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error: any) {
    console.error("Error fetching produk UMKM admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch produk UMKM" },
      { status: 500 }
    );
  }
}
