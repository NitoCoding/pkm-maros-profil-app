// pkm-maros-profil-app\src\libs\api\berita.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IBerita, IBeritaUpdate, IBeritaPaginatedResponse, IBeritaCursorPaginatedResponse } from '@/types/berita';
import { buildFilterWhereClause, BeritaAdminFilters } from '@/libs/utils/filterBuilder';

// Membuat slug yang unik
async function createUniqueSlug(judul: string, currentId: number | null = null): Promise<string> {
	let baseSlug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existing = await executeSingleQuery<{ id: number }>(
			'SELECT id FROM berita WHERE slug = ? AND id != ?',
			[slug, currentId || -1]
		);
		if (!existing) {
			return slug;
		}
		slug = `${baseSlug}-${counter}`;
		counter++;
	}
}

// Menambah berita baru

export async function tambahBerita(data: any): Promise<IBerita> { // Sementara gunakan `any` untuk mempermudah
  // console.log('Adding berita with data:', data);
  
  const slug = await createUniqueSlug(data.judul);

  // --- PERBAIKAN: Sesuaikan jumlah dan urutan parameter dengan query ---
  const params = [
    data.judul,
    slug,
    data.ringkasan,
    data.isi,
    data.gambar || null, // Untuk kolom gambar_url
    data.status,
    data.kategori,
    data.authorName || data.authorEmail || 'Unknown', // Untuk kolom penulis
    JSON.stringify(data.tags || []), // Untuk kolom kategori (asumsi ini untuk tags)
    data.tanggal
  ];

  // console.log('Final params for DB insert:', params);

  // --- PERBAIKAN: Query harus memiliki 8 placeholder ---
  const result = await executeQuery(
    `INSERT INTO berita (judul, slug, ringkasan, isi, gambar_url, status, kategori, penulis, tags, tanggal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // 8 placeholder
    params // 8 parameter
  );

  const newId = (result as any).insertId;
  const newBerita = await ambilBeritaById(newId);
  if (!newBerita) throw new Error('Failed to retrieve created berita');
  return newBerita;
}
// Mengambil berita dengan paginasi (publik)
// src/libs/berita.ts atau di mana pun kamu simpan
export async function ambilBeritaPaginate(
  pageSize: number,
  cursor: string | null = null
): Promise<IBeritaCursorPaginatedResponse> {
  let query = `
    SELECT 
      id, judul, slug, ringkasan, gambar_url, status, views, tags, tanggal,
      komentar_count, kategori, penulis, created_at, updated_at
    FROM berita
    WHERE status = 'published'
  `;

  const params: any[] = [];

  // PERBAIKAN: Selalu gunakan WHERE, lalu AND untuk cursor
  if (cursor) {
    query += ` AND id < ?`;
    params.push(parseInt(cursor));
  }

  query += ` ORDER BY id DESC LIMIT ?`;

  // console.log('Query:', query);
  params.push(pageSize + 1); // ambil 1 ekstra

  const results = await executeQuery<any>(query, params);

  const data = results.map(row => ({
    ...row,
    gambar: row.gambar_url,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop(); // buang item ekstra

  const nextCursor = data.length > 0 ? data[data.length - 1].id.toString() : null;

  return { data, hasMore, nextCursor };
}

export async function ambilBeritaPaginateAdmin(
  pageSize: number,
  cursor: string | null = null
): Promise<IBeritaCursorPaginatedResponse> {
  let query = `
    SELECT 
      id, judul, slug, ringkasan, gambar_url, status, views, tags, tanggal,
      komentar_count, kategori, penulis, created_at, updated_at
    FROM berita
  `;

  const params: any[] = [];

  // Kalau ada cursor, mulai dengan WHERE
  if (cursor) {
    query += ` WHERE created_at < ?`;
    params.push(new Date(cursor));
  }

  // Kalau tidak ada cursor, tetap pakai WHERE dummy supaya sintaks aman
  // Atau bisa pakai trik ini (lebih bersih):
  query += cursor ? ` AND` : ` WHERE`;
  query += ` TRUE`; // selalu true, biar sintaks tetap valid

  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(pageSize + 1);

  const results = await executeQuery<any>(query, params);

  const data = results.map(row => ({
    ...row,
    gambar: row.gambar_url,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const hasMore = data.length > pageSize;
  if (hasMore) data.pop();

  const nextCursor = data.length > 0 ? data[data.length - 1].createdAt : null;

  return { data, hasMore, nextCursor };
}

// Mengambil berita dengan paginasi (admin) dengan filter
export async function ambilBeritaPaginateAdminWithFilters(
  page: number = 1,
  pageSize: number = 10,
  filters: BeritaAdminFilters = {}
): Promise<IBeritaPaginatedResponse> {
  // Use centralized utility
  const { whereClause, params } = buildFilterWhereClause(filters);

  // Count total query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM berita
    ${whereClause}
  `;
  const countResult = await executeSingleQuery<{ total: number }>(countQuery, params);
  const total = countResult?.total || 0;

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // Data query
  const dataQuery = `
    SELECT
      id, judul, slug, ringkasan, gambar_url, status, views, tags, tanggal,
      komentar_count, kategori, penulis, created_at, updated_at
    FROM berita
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const results = await executeQuery<any>(dataQuery, [...params, pageSize, offset]);

  const data = results.map(row => ({
    ...row,
    gambar: row.gambar_url,
    tags: JSON.parse(row.tags || '[]'),
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

// Mengambil satu berita berdasarkan ID
export async function ambilBeritaById(id: number): Promise<IBerita | null> {
	const result = await executeSingleQuery<any>(`
    SELECT * FROM berita WHERE id = ?
  `, [id]);

	if (!result) return null;

		// // console.log('Fetched berita by ID:', result);
	return {
		...result,
		gambar: result.gambar_url,
		tags: JSON.parse(result.tags),
		kategori: result.kategori,
		// gambar: result.gambar_url,
		createdAt: result.created_at.toISOString(),
		updatedAt: result.updated_at.toISOString(),
	};
}

// Mengambil satu berita berdasarkan slug (publik)
export async function ambilBeritaBySlug(slug: string): Promise<IBerita | null> {
	const result = await executeSingleQuery<any>(`
    SELECT * FROM berita WHERE slug = ? AND status = 'published'
  `, [slug]);

  // console.log('Fetched berita by slug:', result);

	if (!result) return null;

	return {
		...result,
		kategori: result.kategori,
		gambar: result.gambar_url,
    tags: result.tags ? JSON.parse(result.tags) : [],
		createdAt: result.created_at.toISOString(),
		updatedAt: result.updated_at.toISOString(),
	};
}

// Mengambil satu berita berdasarkan slug (admin)
export async function ambilBeritaBySlugAdmin(slug: string): Promise<IBerita | null> {
	const result = await executeSingleQuery<any>(`
    SELECT * FROM berita WHERE slug = ?
  `, [slug]);

	if (!result) return null;

	return {
		...result,
		kategori: JSON.parse(result.kategori),
		gambar: result.gambar_url,
		createdAt: result.created_at.toISOString(),
		updatedAt: result.updated_at.toISOString(),
	};
}

// Memperbarui berita
export async function updateBerita(id: number, data: IBeritaUpdate): Promise<boolean> {
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
	if (data.ringkasan !== undefined) {
		fields.push('ringkasan = ?');
		values.push(data.ringkasan);
	}
	if (data.isi !== undefined) {
		fields.push('isi = ?');
		values.push(data.isi);
	}
	if (data.gambar !== undefined) {
		fields.push('gambar_url = ?');
		values.push(data.gambar);
	}
	if (data.status !== undefined) {
		fields.push('status = ?');
		values.push(data.status);
	}
	if (data.tags !== undefined) {
		fields.push('tags = ?');
		values.push(JSON.stringify(data.tags));
	}
  if (data.kategori !== undefined) {
    fields.push('kategori = ?');
    values.push(data.kategori);
  }
	// if (data.updatedBy !== undefined) {
	// 	fields.push('updated_by = ?');
	// 	values.push(data.updatedBy);
	// }

	if (fields.length === 0) return true;

	// Jika judul diubah, perbarui slug
	if (data.judul) {
		const newSlug = await createUniqueSlug(data.judul, id);
		fields.push('slug = ?');
		values.push(newSlug);
	}

	values.push(id);
	const query = `UPDATE berita SET ${fields.join(', ')} WHERE id = ?`;

	const updateResult = await executeQuery(query, values);
	return (updateResult as any).affectedRows > 0;
}

// Menghapus berita
export async function hapusBerita(id: number): Promise<boolean> {
	const result = await executeQuery('DELETE FROM berita WHERE id = ?', [id]);
	return (result as any).affectedRows > 0;
}