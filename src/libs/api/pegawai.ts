// src/libs/pegawai.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IPegawai, IPegawaiPaginatedResponse, IPegawaiUpdate } from '@/types/pegawai';
import { v4 as uuidv4 } from 'uuid';

// Menambah pegawai baru
export async function tambahPegawai(data: Omit<IPegawai, 'id' | 'id_uuid' | 'createdAt' | 'updatedAt'>): Promise<IPegawai> {
	const newIdUuid = uuidv4();

	// console.log(data)

	const result = await executeQuery(
		`INSERT INTO pegawai 
      (id_uuid, nama, jabatan, foto_url, tampilkan_di_beranda, urutan_beranda)
     VALUES (?, ?, ?, ?, ?, ?)`,
		[
			newIdUuid,
			data.nama,
			data.jabatan,
			data.fotoUrl,
			data.tampilkanDiBeranda || false,
			data.urutanBeranda || null,
		]
	);

	const insertedId = (result as any).insertId;
	const newPegawai = await ambilPegawaiById(insertedId);
	if (!newPegawai) throw new Error('Failed to retrieve created pegawai');
	return newPegawai;
}

// Mengambil pegawai dengan paginasi
export async function ambilPegawaiPaginate(pageSize: number, cursor: string | null = null): Promise<IPegawaiPaginatedResponse> {
	let query = `
    SELECT 
      id, id_uuid, nama, jabatan, foto_url, tampilkan_di_beranda, urutan_beranda, 
      created_at, updated_at
    FROM pegawai
  `;
	const params: any[] = [];

	if (cursor) {
    query += ` AND id < ?`;
    params.push(parseInt(cursor));
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(pageSize + 1);

	const results = await executeQuery<any>(query, params);
	const data = results.map((row) => ({
		id: row.id,
		id_uuid: row.id_uuid,
		nama: row.nama,
		jabatan: row.jabatan,
		fotoUrl: row.foto_url,
		tampilkanDiBeranda: Boolean(row.tampilkan_di_beranda),
		urutanBeranda: row.urutan_beranda,
		createdAt: row.created_at.toISOString(),
		updatedAt: row.updated_at.toISOString(),
	}));

	const hasMore = data.length > pageSize;
	if (hasMore) data.pop();

	const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

	return { data, hasMore, nextCursor };
}

// Mengambil satu pegawai berdasarkan ID
export async function ambilPegawaiById(id: number): Promise<IPegawai | null> {
	const result = await executeSingleQuery<any>(
		`SELECT * FROM pegawai WHERE id = ?`,
		[id]
	);

	if (!result) return null;

	return {
		id: result.id,
		id_uuid: result.id_uuid,
		nama: result.nama,
		jabatan: result.jabatan,
		fotoUrl: result.foto_url,
		tampilkanDiBeranda: Boolean(result.tampilkan_di_beranda),
		urutanBeranda: result.urutan_beranda,
		createdAt: result.created_at.toISOString(),
		updatedAt: result.updated_at.toISOString(),
	};
}

// Memperbarui pegawai
export async function updatePegawai(id: number, data: IPegawaiUpdate): Promise<boolean> {
	const fields: string[] = [];
	const values: any[] = [];

	if (data.nama !== undefined) {
		fields.push('nama = ?');
		values.push(data.nama);
	}
	if (data.jabatan !== undefined) {
		fields.push('jabatan = ?');
		values.push(data.jabatan);
	}
	if (data.fotoUrl !== undefined) {
		fields.push('foto_url = ?');
		values.push(data.fotoUrl);
	}
	if (data.tampilkanDiBeranda !== undefined) {
		fields.push('tampilkan_di_beranda = ?');
		values.push(data.tampilkanDiBeranda ? 1 : 0);
	}
	if (data.urutanBeranda !== undefined) {
		fields.push('urutan_beranda = ?');
		values.push(data.urutanBeranda);
	}

	if (fields.length === 0) return true;

	values.push(id);
	const query = `UPDATE pegawai SET ${fields.join(', ')} WHERE id = ?`;

	const result = await executeQuery(query, values);
	return (result as any).affectedRows > 0;
}

// Menghapus pegawai
export async function hapusPegawai(id: number): Promise<boolean> {
	const result = await executeQuery('DELETE FROM pegawai WHERE id = ?', [id]);
	return (result as any).affectedRows > 0;
}