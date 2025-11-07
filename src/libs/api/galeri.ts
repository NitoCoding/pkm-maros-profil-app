// src/libs/galeri.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IGaleri, IGaleriUpdate, IGaleriPaginatedResponse } from '@/types/galeri';
import { v4 as uuidv4 } from 'uuid'; // Install library UUID: npm install uuid @types/uuid

// Menambah galeri baru
export async function tambahGaleri(data: Omit<IGaleri, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGaleri> {
  const newId = uuidv4(); // Generate UUID untuk ID

  console.log([
      newId,
      data.src,
      data.alt,
      data.caption,
      data.tanggal, // Asumsikan data.tanggal adalah 'YYYY-MM-DD'
      JSON.stringify(data.tags || []),
    ]);
  const result = await executeQuery(
    `INSERT INTO galeri (id, src, alt, caption, tanggal, tags)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newId,
      data.src,
      data.alt,
      data.caption,
      data.tanggal, // Asumsikan data.tanggal adalah 'YYYY-MM-DD'
      JSON.stringify(data.tags || []),
    ]
  );

  // Karena id sudah kita buat, kita tidak perlu mengambil dari DB
  const newGaleri: IGaleri = {
    ...data,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newGaleri;
}

// Mengambil galeri dengan paginasi
export async function ambilGaleriPaginate(pageSize: number, cursor: string | null = null): Promise<IGaleriPaginatedResponse> {
  let query = `
    SELECT id, src, alt, caption, tanggal, tags, created_at, updated_at
    FROM galeri
  `;
  const params: any[] = [];

  if (cursor) {
    query += ` WHERE created_at < ?`;
    params.push(new Date(cursor));
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;
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

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].createdAt : null;

  return { data, hasMore, nextCursor };
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
  if (data.updatedBy !== undefined) { fields.push('updated_by = ?'); values.push(data.updatedBy); }

  if (fields.length === 0) return true;

  values.push(id);
  const query = `UPDATE galeri SET ${fields.join(', ')} WHERE id = ?`;

  const [updateResult] = await executeQuery(query, values);
  return (updateResult as any).affectedRows > 0;
}

// Menghapus galeri
export async function hapusGaleri(id: string): Promise<boolean> {
  const [result] = await executeQuery('DELETE FROM galeri WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}