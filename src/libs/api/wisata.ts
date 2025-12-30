// src/libs/api/wisata.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IWisata, IWisataUpdate, IWisataPaginatedResponse } from '@/types/wisata-admin';
import { v4 as uuidv4 } from 'uuid'; // Install library UUID: npm install uuid @types/uuid

// Membuat slug yang unik
async function createUniqueSlug(nama: string, currentId: string | null = null): Promise<string> {
  let baseSlug = nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await executeSingleQuery<{ id: string }>(
      'SELECT id FROM wisata WHERE slug = ? AND id != ?',
      [slug, currentId || '']
    );
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Menambah wisata baru
export async function tambahWisata(data: any): Promise<IWisata> {
  // console.log('Adding wisata with data:', data);
  
  const slug = await createUniqueSlug(data.nama);
  const id = uuidv4();

  const params = [
    id,
    slug,
    data.nama,
    data.deskripsiSingkat,
    data.deskripsiLengkap || null,
    JSON.stringify(data.gambar || []),
    data.altText || '',
    data.lokasiLink || null,
    data.linkPendaftaran || null,
    data.linkWebsite || null,
    JSON.stringify(data.socialMedia || {}),
    JSON.stringify(data.tags || []),
    data.createdBy || null,
  ];

  // console.log('Final params for DB insert:', params);

  const result = await executeQuery(
    `INSERT INTO wisata (id_uuid, slug, nama, deskripsi_singkat, deskripsi_lengkap, gambar, alt_text, lokasi_link, link_pendaftaran, link_website, social_media, tags, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  const newId = (result as any).insertId;

  const newWisata = await ambilWisataById(newId);
  if (!newWisata) throw new Error('Failed to retrieve created wisata');
  return newWisata;
}

// Mengambil wisata dengan paginasi (publik)
export async function ambilWisataPaginate(pageSize: number, cursor: string | null = null): Promise<IWisataPaginatedResponse> {
  let query = `
    SELECT id, slug, nama, deskripsi_singkat, gambar, alt_text, lokasi_link, created_at, updated_at
    FROM wisata
  `;
  const params: any[] = [];

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
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop();

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

// Mengambil wisata dengan paginasi (admin)
export async function ambilWisataPaginateAdmin(pageSize: number, cursor: string | null = null): Promise<IWisataPaginatedResponse> {
  let query = `
    SELECT id, slug, nama, deskripsi_singkat, gambar, alt_text, lokasi_link, created_at, updated_at
    FROM wisata
  `;
  const params: any[] = [];

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
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop();

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

// Mengambil satu wisata berdasarkan ID
export async function ambilWisataById(id: string): Promise<IWisata | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM wisata WHERE id = ?
  `, [id]);

  if (!result) return null;

  return {
    ...result,
    gambar: JSON.parse(result.gambar),
    socialMedia: JSON.parse(result.social_media),
    tags: JSON.parse(result.tags),
    deskripsiSingkat: result.deskripsi_singkat,
    deskripsiLengkap: result.deskripsi_lengkap,
    altText: result.alt_text,
    lokasiLink: result.lokasi_link,
    linkPendaftaran: result.link_pendaftaran,
    linkWebsite: result.link_website,
    createdBy: result.created_by,
    updatedBy: result.updated_by,
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Mengambil satu wisata berdasarkan slug (publik)
export async function ambilWisataBySlug(slug: string): Promise<IWisata | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM wisata WHERE slug = ?
  `, [slug]);

  if (!result) return null;

  return {
    ...result,
    gambar: JSON.parse(result.gambar),
    socialMedia: JSON.parse(result.social_media),
    tags: JSON.parse(result.tags),
    deskripsiSingkat: result.deskripsi_singkat,
    deskripsiLengkap: result.deskripsi_lengkap,
    altText: result.alt_text,
    lokasiLink: result.lokasi_link,
    linkPendaftaran: result.link_pendaftaran,
    linkWebsite: result.link_website,
    createdBy: result.created_by,
    updatedBy: result.updated_by,
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Mengambil satu wisata berdasarkan slug (admin)
export async function ambilWisataBySlugAdmin(slug: string): Promise<IWisata | null> {
  const result = await executeSingleQuery<any>(`
    SELECT * FROM wisata WHERE slug = ?
  `, [slug]);

  if (!result) return null;

  return {
    ...result,
    gambar: JSON.parse(result.gambar || '[]'),
    socialMedia: JSON.parse(result.social_media || '{}'),
    tags: JSON.parse(result.tags || '[]'),
    deskripsiSingkat: result.deskripsi_singkat,
    deskripsiLengkap: result.deskripsi_lengkap,
    altText: result.alt_text,
    lokasiLink: result.lokasi_link,
    linkPendaftaran: result.link_pendaftaran,
    linkWebsite: result.link_website,
    createdBy: result.created_by,
    updatedBy: result.updated_by,
    createdAt: result.created_at.toISOString(),
    updatedAt: result.updated_at.toISOString(),
  };
}

// Memperbarui wisata
export async function updateWisata(id: string, data: IWisataUpdate): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.nama !== undefined) {
    fields.push('nama = ?');
    values.push(data.nama);
  }
  if (data.slug !== undefined) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.deskripsiSingkat !== undefined) {
    fields.push('deskripsi_singkat = ?');
    values.push(data.deskripsiSingkat);
  }
  if (data.deskripsiLengkap !== undefined) {
    fields.push('deskripsi_lengkap = ?');
    values.push(data.deskripsiLengkap);
  }
  if (data.gambar !== undefined) {
    fields.push('gambar = ?');
    values.push(JSON.stringify(data.gambar));
  }
  if (data.altText !== undefined) {
    fields.push('alt_text = ?');
    values.push(data.altText);
  }
  if (data.lokasiLink !== undefined) {
    fields.push('lokasi_link = ?');
    values.push(data.lokasiLink);
  }
  if (data.linkPendaftaran !== undefined) {
    fields.push('link_pendaftaran = ?');
    values.push(data.linkPendaftaran);
  }
  if (data.linkWebsite !== undefined) {
    fields.push('link_website = ?');
    values.push(data.linkWebsite);
  }
  if (data.socialMedia !== undefined) {
    fields.push('social_media = ?');
    values.push(JSON.stringify(data.socialMedia));
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(data.tags));
  }
  if (data.updatedBy !== undefined) {
    fields.push('updated_by = ?');
    values.push(data.updatedBy);
  }

  if (fields.length === 0) return true;

  // Jika nama diubah, perbarui slug
  if (data.nama) {
    const newSlug = await createUniqueSlug(data.nama, id);
    fields.push('slug = ?');
    values.push(newSlug);
  }

  values.push(id);
  const query = `UPDATE wisata SET ${fields.join(', ')} WHERE id = ?`;

  const updateResult = await executeQuery(query, values);
  return (updateResult as any).affectedRows > 0;
}

// Menghapus wisata
export async function hapusWisata(id: string): Promise<boolean> {
  const result = await executeQuery('DELETE FROM wisata WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}