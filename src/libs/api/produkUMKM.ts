// src/libs/produkUMKM.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IProdukUMKM, IProdukUMKMUpdate, IProdukUMKMPaginatedResponse } from '@/types/umkm';
import { v4 as uuidv4 } from 'uuid';

// Menambah produk baru
export async function tambahProdukUMKM(data: Omit<IProdukUMKM, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProdukUMKM> {
    const newId = uuidv4();

    // console.log('Adding new produk UMKM with data:', [
        //     newId,
        //     data.namaProduk,
        //     data.namaUMKM,
        //     data.kategori,
        //     data.deskripsi,
        //     data.gambar,
        //     data.harga?.awal || null,
        //     data.harga?.akhir || null,
        //     data.kontak.telepon,
        //     data.kontak.whatsapp,
        //     data.lokasi.alamat,
        //     data.lokasi.latitude,
        //     data.lokasi.longitude,
        //     data.lokasi.googleMapsLink || null,
        //     JSON.stringify(data.linkPenjualan || {}),
        //     data.createdBy,
        //     data.authorName,
        //     data.authorEmail,
        // ]);

    const result = await executeQuery(
        `INSERT INTO produk_umkm (id_uuid, nama_produk, nama_umkm, kategori, deskripsi, gambar, harga_awal, harga_akhir, kontak_telepon, kontak_whatsapp, lokasi_alamat, lokasi_latitude, lokasi_longitude, lokasi_google_maps_link, link_penjualan, created_by, author_name, author_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newId,
            data.namaProduk,
            data.namaUMKM,
            data.kategori,
            data.deskripsi,
            data.gambar,
            data.harga?.awal || null,
            data.harga?.akhir || null,
            data.kontak.telepon,
            data.kontak.whatsapp,
            data.lokasi.alamat,
            data.lokasi.latitude,
            data.lokasi.longitude,
            data.lokasi.googleMapsLink || null,
            JSON.stringify(data.linkPenjualan || {}),
            data.createdBy,
            data.authorName,
            data.authorEmail,
        ]
    );

    const newProduk: IProdukUMKM = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return newProduk;
}

// Mengambil produk dengan paginasi
export async function ambilProdukUMKMPaginate(pageSize: number, cursor: string | null = null): Promise<IProdukUMKMPaginatedResponse> {
    let query = `
    SELECT id, nama_produk, nama_umkm, kategori, deskripsi, gambar, harga_awal, harga_akhir, kontak_telepon, kontak_whatsapp, lokasi_alamat, lokasi_latitude, lokasi_longitude, link_penjualan, created_at, updated_at
    FROM produk_umkm
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
        namaUMKM: row.nama_umkm,
        namaProduk: row.nama_produk,
        harga: { awal: row.harga_awal, akhir: row.harga_akhir },
        kontak: { telepon: row.kontak_telepon, whatsapp: row.kontak_whatsapp },
        lokasi: {
            alamat: row.lokasi_alamat,
            latitude: row.lokasi_latitude,
            longitude: row.lokasi_longitude,
            googleMapsLink: row.lokasi_google_maps_link,
        },
        linkPenjualan: row.link_penjualan ? JSON.parse(row.link_penjualan) : {},
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    }));

    const hasMore = data.length > pageSize;
    if (hasMore) data.pop();

    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id.toString() : null;

    return { data, hasMore, nextCursor };
}

// Mengambil satu produk berdasarkan ID
export async function ambilProdukUMKMById(id: string): Promise<IProdukUMKM | null> {
    const result = await executeSingleQuery<any>(`SELECT * FROM produk_umkm WHERE id = ?`, [id]);
    if (!result) return null;

    return {
        ...result,
        namaProduk: result.nama_produk,
        namaUMKM: result.nama_umkm,
        harga: { awal: result.harga_awal, akhir: result.harga_akhir },
        kontak: { telepon: result.kontak_telepon, whatsapp: result.kontak_whatsapp },
        lokasi: {
            alamat: result.lokasi_alamat,
            latitude: result.lokasi_latitude,
            longitude: result.lokasi_longitude,
            googleMapsLink: result.lokasi_google_maps_link,
        },
        linkPenjualan: result.link_penjualan ? JSON.parse(result.link_penjualan) : {},
        createdAt: result.created_at.toISOString(),
        updatedAt: result.updated_at.toISOString(),
    };
}


export async function updateProdukUMKM(id: string, updateData: IProdukUMKMUpdate): Promise<boolean> {
    // console.log('Updating produk UMKM with data:', updateData);
    const fields: string[] = [];
    const values: any[] = [];
    if (updateData.namaProduk !== undefined) { fields.push('nama_produk = ?'); values.push(updateData.namaProduk); }
    if (updateData.namaUMKM !== undefined) { fields.push('nama_umkm = ?'); values.push(updateData.namaUMKM); }
    if (updateData.kategori !== undefined) { fields.push('kategori = ?'); values.push(updateData.kategori); }
    if (updateData.deskripsi !== undefined) { fields.push('deskripsi = ?'); values.push(updateData.deskripsi); }
    if (updateData.gambar !== undefined) { fields.push('gambar = ?'); values.push(updateData.gambar); }
    if (updateData.harga?.awal !== undefined) { fields.push('harga_awal = ?'); values.push(updateData.harga.awal); }
    if (updateData.harga?.akhir !== undefined) { fields.push('harga_akhir = ?'); values.push(updateData.harga.akhir); }
    if (updateData.kontak?.telepon !== undefined) { fields.push('kontak_telepon = ?'); values.push(updateData.kontak.telepon); }
    if (updateData.kontak?.whatsapp !== undefined) { fields.push('kontak_whatsapp = ?'); values.push(updateData.kontak.whatsapp); }
    if (updateData.lokasi?.alamat !== undefined) { fields.push('lokasi_alamat = ?'); values.push(updateData.lokasi.alamat); }
    if (updateData.lokasi?.latitude !== undefined) { fields.push('lokasi_latitude = ?'); values.push(updateData.lokasi.latitude); }
    if (updateData.lokasi?.longitude !== undefined) { fields.push('lokasi_longitude = ?'); values.push(updateData.lokasi.longitude); }
    if (updateData.lokasi?.googleMapsLink !== undefined) { fields.push('lokasi_google_maps_link = ?'); values.push(updateData.lokasi.googleMapsLink); }
    if (updateData.linkPenjualan !== undefined) { fields.push('link_penjualan = ?'); values.push(JSON.stringify(updateData.linkPenjualan)); }
    fields.push('updated_at = ?'); values.push(new Date());

    if (fields.length === 0) return true;
    values.push(id);
    // console.log('Executing update with fields:', fields, 'and values:', values);
    const query = `UPDATE produk_umkm SET ${fields.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, values);
    // console.log('Update result:', result);
    return (result as any).affectedRows > 0;
}

export async function hapusProdukUMKM(id: string): Promise<boolean> {
    const [result] = await executeQuery(`DELETE FROM produk_umkm WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}
// ... fungsi updateProdukUMKM dan hapusProdukUMKM bisa Anda buat dengan pola yang sama seperti galeri/berita