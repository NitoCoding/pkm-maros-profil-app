// src/libs/pegawai.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IPegawai, IPegawaiPaginatedResponse, IPegawaiUpdate } from '@/types/pegawai';
import { v4 as uuidv4 } from 'uuid';

// Menambah pegawai baru
export async function tambahPegawai(data: Omit<IPegawai, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPegawai> {
	const newId = uuidv4(); // Generate UUID untuk ID
	const result = await executeQuery(
		`INSERT INTO pegawai (id,nama, jabatan, foto_url, urutan_tampil)
     VALUES (?,?, ?, ?, ?)`,
		[
			newId,
			data.nama,
			data.jabatan,
			data.fotoUrl,
			data.urutanTampil || 0,
		]
	);

	const newItemId = (result as any).insertId;
	const newPegawai = await ambilPegawaiById(newItemId);
	if (!newPegawai) throw new Error('Failed to retrieve created pegawai');
	return newPegawai;
}

// Mengambil pegawai dengan paginasi
export async function ambilPegawaiPaginate(pageSize: number, cursor: string | null = null): Promise<IPegawaiPaginatedResponse> {
	let query = `
    SELECT id, nama, jabatan, foto_url, urutan_tampil, created_at, updated_at
    FROM pegawai
  `;
	const params: any[] = [];

	if (cursor) {
		query += ` WHERE created_at < ?`;
		params.push(new Date(cursor));
	}

	query += ` ORDER BY urutan_tampil ASC, created_at DESC LIMIT ?`;
	params.push(pageSize + 1);

	const results = await executeQuery<any>(query, params);
	const data = results.map(row => ({
		...row,
		urutanTampil: row.urutan_tampil,
		fotoUrl: row.foto_url,
		createdAt: row.created_at.toISOString(),
		updatedAt: row.updated_at.toISOString(),
	}));
	console.log(data);

	const hasMore = data.length > pageSize;
	if (hasMore) data.pop();

	const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].createdAt : null;

	return { data, hasMore, nextCursor };
}

// Mengambil satu pegawai berdasarkan ID
export async function ambilPegawaiById(id: string): Promise<IPegawai | null> {
	const result = await executeSingleQuery<any>(`
    SELECT * FROM pegawai WHERE id = ?
  `, [id]);

	if (!result) return null;

	return {
		...result,
		fotoUrl: result.foto_url,
		createdAt: result.created_at.toISOString(),
		updatedAt: result.updated_at.toISOString(),
	};
}

// Memperbarui pegawai
export async function updatePegawai(id: number, data: IPegawaiUpdate): Promise<boolean> {
	const fields: string[] = [];
	const values: any[] = [];

	if (data.nama !== undefined) { fields.push('nama = ?'); values.push(data.nama); }
	if (data.jabatan !== undefined) { fields.push('jabatan = ?'); values.push(data.jabatan); }
	if (data.fotoUrl !== undefined) { fields.push('foto_url = ?'); values.push(data.fotoUrl); }
	if (data.urutanTampil !== undefined) { fields.push('urutan_tampil = ?'); values.push(data.urutanTampil); }

	if (fields.length === 0) return true;

	values.push(id);
	const query = `UPDATE pegawai SET ${fields.join(', ')} WHERE id = ?`;

	const updateResult = await executeQuery(query, values);
	return (updateResult as any).affectedRows > 0;
}

// Menghapus pegawai
export async function hapusPegawai(id: number): Promise<boolean> {
	const result = await executeQuery('DELETE FROM pegawai WHERE id = ?', [id]);
	return (result as any).affectedRows > 0;
}