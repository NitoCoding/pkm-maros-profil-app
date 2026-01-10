// src/libs/galeri.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IGaleri, IGaleriUpdate, IGaleriPaginatedResponse, IGaleriCursorPaginatedResponse } from '@/types/galeri';
import { GaleriAdminFilters } from '@/libs/constant/galeriFilter';
import { v4 as uuidv4 } from 'uuid'; // Install library UUID: npm install uuid @types/uuid

// ============================================================================
// FILTER UTILITIES
// ============================================================================
export function buildGaleriFilterWhereClause(filters: GaleriAdminFilters): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.search?.trim()) {
    conditions.push('(caption LIKE ?)');
    const pattern = `%${filters.search.trim()}%`;
    params.push(pattern);
  }
  if (filters.tanggalMulai?.trim()) {
    conditions.push('tanggal >= ?');
    params.push(filters.tanggalMulai.trim());
  }
  if (filters.tanggalAkhir?.trim()) {
    conditions.push('tanggal <= ?');
    params.push(filters.tanggalAkhir.trim());
  }

  return {
    whereClause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
}

export function hasActiveGaleriFilters(filters: GaleriAdminFilters): boolean {
  return !!(
    filters.search?.trim() ||
    filters.tanggalMulai?.trim() ||
    filters.tanggalAkhir?.trim()
  );
}

// Menambah galeri baru
export async function tambahGaleri(data: Omit<IGaleri, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGaleri> {
  const newId = uuidv4(); // Generate UUID untuk ID


  const result = await executeQuery(
    `INSERT INTO galeri ( src, alt, caption, tanggal, tags, id_uuid)
     VALUES ( ?, ?, ?, ?, ?, ?)`,
    [

      data.src,
      data.alt,
      data.caption,
      data.tanggal, // Asumsikan data.tanggal adalah 'YYYY-MM-DD'
      JSON.stringify(data.tags || []),
      newId,
    ]
  );

  const insertId = (result as any).insertId;

  // Karena id sudah kita buat, kita tidak perlu mengambil dari DB
  const newGaleri: IGaleri = {
    ...data,
    id: insertId.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newGaleri;
}

// Mengambil galeri dengan paginasi (cursor-based untuk infinite scroll)
export async function ambilGaleriPaginate(pageSize: number, cursor: string | null = null): Promise<IGaleriCursorPaginatedResponse> {
  let query = `
    SELECT id, src, alt, caption, tanggal, tags, created_at, updated_at
    FROM galeri
  `;
  const params: any[] = [];

  if (cursor) {
    query += ` WHERE id < ?`;
    params.push(parseInt(cursor));
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(pageSize + 1);

  const results = await executeQuery<any>(query, params);
  const data = results.map(row => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : null,
    tanggal: row.tanggal.toISOString().split('T')[0], // Format kembali ke YYYY-MM-DD
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop();

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

// Mengambil galeri dengan paginasi (page-based untuk admin dengan filter)
export async function ambilGaleriPaginateAdminWithFilters(
  page: number = 1,
  pageSize: number = 10,
  filters: GaleriAdminFilters = {}
): Promise<IGaleriPaginatedResponse> {
  // Build WHERE clause dari filters
  const { whereClause, params } = buildGaleriFilterWhereClause(filters);

  // Count total query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM galeri
    ${whereClause}
  `;
  const countResult = await executeSingleQuery<{ total: number }>(countQuery, params);
  const total = countResult?.total || 0;

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // Data query
  const dataQuery = `
    SELECT
      id, src, alt, caption, tanggal, tags, created_at, updated_at
    FROM galeri
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const results = await executeQuery<any>(dataQuery, [...params, pageSize, offset]);

  const data = results.map(row => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : null,
    tanggal: row.tanggal.toISOString().split('T')[0],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages
  };
}

// Mengambil satu galeri berdasarkan ID
export async function ambilGaleriById(id: string): Promise<IGaleri | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM galeri WHERE id = ?
  `, [id]);

  if (!result) return null;

  return {
    ...result,
    tags: result.tags ? JSON.parse(result.tags) : null,
    tanggal: result.tanggal.toISOString().split('T')[0],
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Memperbarui galeri
export async function updateGaleri(id: string, data: IGaleriUpdate): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.src !== undefined) { fields.push('src = ?'); values.push(data.src); }
  if (data.alt !== undefined) { fields.push('alt = ?'); values.push(data.alt); }
  if (data.caption !== undefined) { fields.push('caption = ?'); values.push(data.caption); }
  if (data.tanggal !== undefined) { fields.push('tanggal = ?'); values.push(data.tanggal); }
  if (data.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(data.tags)); }

  if (fields.length === 0) return true;

  values.push(id);
  const query = `UPDATE galeri SET ${fields.join(', ')} WHERE id = ?`;

  // console.log(query, values);

  const updateResult = await executeQuery(query, values);
  return (updateResult as any).affectedRows > 0;
}

// Menghapus galeri
export async function hapusGaleri(id: string): Promise<boolean> {
  const result = await executeQuery('DELETE FROM galeri WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}