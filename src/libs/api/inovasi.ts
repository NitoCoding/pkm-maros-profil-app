// pkm-maros-profil-app\src\libs\api\inovasi.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IInovasi } from '@/types/inovasi';
import { v4 as uuidv4 } from 'uuid'; // Install library UUID: npm install uuid @types/uuid

// Interface untuk paginasi response
export interface IInovasiPaginatedResponse {
  data: IInovasi[];
  hasMore: boolean;
  nextCursor: string | null;
}

// Membuat slug yang unik
async function createUniqueSlug(judul: string, currentId: string | null = null): Promise<string> {
  let baseSlug = judul.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await executeSingleQuery<{ id: string }>(
      'SELECT id FROM inovasi WHERE slug = ? AND id != ?',
      [slug, currentId || '']
    );
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Menambah inovasi baru
export async function tambahInovasi(data: any): Promise<IInovasi> {
  // console.log('Adding inovasi with data:', data);

  const id = uuidv4();
  const slug = await createUniqueSlug(data.judul);

  // Prepare data for database
  const params = [
    id,
    slug,
    data.judul,
    data.kategori,
    data.deskripsi,
    data.tahun,
    JSON.stringify(data.gambar || []), // Array gambar sebagai JSON
    data.altText || '',
    data.linkProyek || null,
    data.linkDanaDesa || null,
    JSON.stringify(data.socialMedia || {}), // Social media sebagai JSON
    data.createdBy || null,
    data.authorName || null,
    data.authorEmail || null,
  ];

  // console.log('Final params for DB insert:', params);

  const result = await executeQuery(
    `INSERT INTO inovasi (id_uuid, slug, judul, kategori, deskripsi, tahun, gambar, alt_text, link_proyek, link_dana_desa, social_media, created_by, author_name, author_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  const newId = (result as any).insertId;

  const newInovasi = await ambilInovasiById(newId);
  if (!newInovasi) throw new Error('Failed to retrieve created inovasi');
  return newInovasi;
}

// Mengambil inovasi dengan paginasi (publik)
export async function ambilInovasiPaginate(
  pageSize: number,
  cursor: string | null = null,
  kategori?: string | null,
  tahun?: number | null
): Promise<IInovasiPaginatedResponse> {
  let query = `
    SELECT id, slug, judul, kategori, deskripsi, tahun, gambar, alt_text, link_proyek, link_dana_desa, social_media, created_at, updated_at
    FROM inovasi
    WHERE 1=1
  `;
  const params: any[] = [];

  if (kategori) {
    query += ` AND kategori = ?`;
    params.push(kategori);
  }

  if (tahun) {
    query += ` AND tahun = ?`;
    params.push(tahun);
  }

  if (cursor) {
    query += ` AND id < ?`;
    params.push(parseInt(cursor));
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(pageSize + 1); // Ambil 1 ekstra untuk cek hasMore

  const results = await executeQuery<any>(query, params);
  const data = results.map(row => ({
    ...row,
    gambar: JSON.parse(row.gambar || '[]'),
    socialMedia: JSON.parse(row.social_media || '{}'),
    linkProyek: row.link_proyek,
    linkDanaDesa: row.link_dana_desa,
    altText: row.alt_text,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop(); // Hapus item ekstra

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

// Mengambil inovasi dengan paginasi (admin, semua data)
export async function ambilInovasiPaginateAdmin(
  pageSize: number,
  cursor: string | null = null,
  kategori?: string | null,
  tahun?: number | null
): Promise<IInovasiPaginatedResponse> {
  let query = `
    SELECT id, slug, judul, kategori, deskripsi, tahun, gambar, alt_text, link_proyek, link_dana_desa, social_media, created_at, updated_at
    FROM inovasi
    WHERE 1=1
  `;
  const params: any[] = [];

  if (kategori) {
    query += ` AND kategori = ?`;
    params.push(kategori);
  }

  if (tahun) {
    query += ` AND tahun = ?`;
    params.push(tahun);
  }

  if (cursor) {
    query += ` AND id < ?`;
    params.push(parseInt(cursor));
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(pageSize + 1);

  const results = await executeQuery<any>(query, params);
  const data = results.map(row => ({
    ...row,
    gambar: JSON.parse(row.gambar || '[]'),
    socialMedia: JSON.parse(row.social_media || '{}'),
    linkProyek: row.link_proyek,
    linkDanaDesa: row.link_dana_desa,
    altText: row.alt_text,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop();

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

// Mengambil satu inovasi berdasarkan ID
export async function ambilInovasiById(id: string): Promise<IInovasi | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM inovasi WHERE id = ?
  `, [id]);

  if (!result) return null;

  return {
    ...result,
    gambar: JSON.parse(result.gambar || '[]'),
    socialMedia: JSON.parse(result.social_media || '{}'),
    linkProyek: result.link_proyek,
    linkDanaDesa: result.link_dana_desa,
    altText: result.alt_text,
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Mengambil satu inovasi berdasarkan slug (publik)
export async function ambilInovasiBySlug(slug: string): Promise<IInovasi | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM inovasi WHERE slug = ?
  `, [slug]);

  if (!result) return null;

  return {
    ...result,
    gambar: JSON.parse(result.gambar || '[]'),
    socialMedia: JSON.parse(result.social_media || '{}'),
    linkProyek: result.link_proyek,
    linkDanaDesa: result.link_dana_desa,
    altText: result.alt_text,
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Mengambil satu inovasi berdasarkan slug (admin)
export async function ambilInovasiBySlugAdmin(slug: string): Promise<IInovasi | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM inovasi WHERE slug = ?
  `, [slug]);

  if (!result) return null;

  return {
    ...result,
    gambar: JSON.parse(result.gambar || '[]'),
    socialMedia: JSON.parse(result.social_media || '{}'),
    linkProyek: result.link_proyek,
    linkDanaDesa: result.link_dana_desa,
    altText: result.alt_text,
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Memperbarui inovasi
export async function updateInovasi(id: string, data: any): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.judul !== undefined) {
    fields.push('judul = ?');
    values.push(data.judul);
  }
  if (data.slug !== undefined) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.kategori !== undefined) {
    fields.push('kategori = ?');
    values.push(data.kategori);
  }
  if (data.deskripsi !== undefined) {
    fields.push('deskripsi = ?');
    values.push(data.deskripsi);
  }
  if (data.tahun !== undefined) {
    fields.push('tahun = ?');
    values.push(data.tahun);
  }
  if (data.gambar !== undefined) {
    fields.push('gambar = ?');
    values.push(JSON.stringify(data.gambar));
  }
  if (data.altText !== undefined) {
    fields.push('alt_text = ?');
    values.push(data.altText);
  }
  if (data.linkProyek !== undefined) {
    fields.push('link_proyek = ?');
    values.push(data.linkProyek);
  }
  if (data.linkDanaDesa !== undefined) {
    fields.push('link_dana_desa = ?');
    values.push(data.linkDanaDesa);
  }
  if (data.socialMedia !== undefined) {
    fields.push('social_media = ?');
    values.push(JSON.stringify(data.socialMedia));
  }
  if (data.updatedBy !== undefined) {
    fields.push('updated_by = ?');
    values.push(data.updatedBy);
  }
  if (fields.length === 0) return true;
  // Jika judul diubah, perbarui slug
  if (data.judul) {
    const newSlug = await createUniqueSlug(data.judul, id);
    fields.push('slug = ?');
    values.push(newSlug);
  }
  values.push(id);
  const query = `UPDATE inovasi SET ${fields.join(', ')} WHERE id = ?`;
  const updateResult = await executeQuery(query, values);
  return (updateResult as any).affectedRows > 0;
}
// Menghapus inovasi
export async function hapusInovasi(id: string): Promise<boolean> {
  const result = await executeQuery('DELETE FROM inovasi WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}
// Mendapatkan semua kategori unik
export async function ambilKategoriInovasi(): Promise<string[]> {
  const results = await executeQuery<{ kategori: string }>(
    'SELECT DISTINCT kategori FROM inovasi WHERE kategori IS NOT NULL ORDER BY kategori'
  );
  return results.map(row => row.kategori);
}