// src/libs/umum.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IUmum } from '@/types/umum';

// Mengambil semua data umum
export async function getUmumKelurahan(): Promise<IUmum[]> {
  const results = await executeQuery<any>(`
    SELECT 
      id, jenis, judul, deskripsi, gambar, data_json, updated_at
    FROM umum_kelurahan
    ORDER BY jenis
  `);

  return (results as any[]).map(row => ({
    id: row.id,
    jenis: row.jenis,
    judul: row.judul,
    deskripsi: row.deskripsi,
    gambar: row.gambar,
    data: row.data_json, // MySQL driver akan otomatis parse JSON
    updatedAt: row.updated_at.toISOString(),
  }));
}

// Mengambil data umum berdasarkan jenis (misal: 'penduduk')
export async function getUmumByJenis(jenis: IUmum['jenis']): Promise<IUmum | null> {
  const result = await executeSingleQuery<any>(`
    SELECT 
      id, jenis, judul, deskripsi, gambar, data_json, updated_at
    FROM umum_kelurahan
    WHERE jenis = ?
  `, [jenis]);

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    jenis: result.jenis,
    judul: result.judul,
    deskripsi: result.deskripsi,
    gambar: result.gambar,
    data: result.data_json,
    updatedAt: result.updated_at.toISOString(),
  };
}


// Memperbarui data umum berdasarkan jenis (hanya UPDATE)
export async function updateUmumByJenis(jenis: IUmum['jenis'], updateData: Partial<IUmum>): Promise<boolean> {
  // Pisahkan field utama dan field data
  const { data, ...mainFields } = updateData;
  
  const setClause: string[] = []; // Akan menampung 'judul = ?', 'deskripsi = ?', dll.
  const values: any[] = [];

  // Tambahkan field utama ke klausa SET jika ada
  if (mainFields.judul !== undefined) { 
    setClause.push('judul = ?'); 
    values.push(mainFields.judul); 
  }
  if (mainFields.deskripsi !== undefined) { 
    setClause.push('deskripsi = ?'); 
    values.push(mainFields.deskripsi); 
  }
  if (mainFields.gambar !== undefined) { 
    setClause.push('gambar = ?'); 
    values.push(mainFields.gambar); 
  }
  
  // Tambahkan field data_json ke klausa SET jika ada
  if (data !== undefined) {
    setClause.push('data_json = ?');
    values.push(JSON.stringify(data));
  }

  // Jika tidak ada field yang akan diupdate, kembalikan true
  if (setClause.length === 0) {
    return true; 
  }

  // Buat query UPDATE langsung
  const query = `
    UPDATE umum_kelurahan 
    SET ${setClause.join(', ')}
    WHERE jenis = ?
  `;

  // Tambahkan nilai 'jenis' untuk klausa WHERE di akhir
  values.push(jenis);

  const result = await executeQuery(query, values);

  // Periksa apakah ada baris yang benar-benar diperbarui
  return (result as any).affectedRows > 0;
}
// Fungsi untuk menginisialisasi data default (dijalankan sekali saja)
export async function initializeUmumData(): Promise<void> {
  const existingData = await getUmumKelurahan();
  if (existingData.length > 0) {
    console.log('Umum data already exists.');
    return;
  }

  const defaultData: Omit<IUmum, 'updatedAt'>[] = [
    {
      id: 'infografi',
      jenis: 'infografi',
      judul: 'Infografi',
      deskripsi: 'Data Demografi Desa Benteng Gajah',
      data: {
        infografi: {
          judul: 'Data Demografi Desa Benteng Gajah',
          deskripsi: 'Infografi yang menampilkan data demografi dan statistik Desa Benteng Gajah',
          gambar: ''
        }
      }
    },
    {
      id: 'penduduk',
      jenis: 'penduduk',
      judul: 'Administrasi Penduduk',
      deskripsi: 'Data kependudukan Desa Benteng Gajah',
      data: {
        penduduk: {
          total: 3075,
          lakiLaki: 1109,
          perempuan: 1218,
          kk: 683,
          wajibPilih: 2222
        }
      }
    },
    {
      id: 'saranaPendidikan',
      jenis: 'saranaPendidikan',
      judul: 'Sarana Pendidikan',
      deskripsi: 'Data sarana pendidikan Desa Benteng Gajah',
      data: {
        saranaPendidikan: {
          tk: 2,
          sd: 2,
          smp: 1,
          sma: 0
        }
      }
    },
    {
      id: 'saranaKesehatan',
      jenis: 'saranaKesehatan',
      judul: 'Sarana Kesehatan',
      deskripsi: 'Data sarana kesehatan Desa Benteng Gajah',
      data: {
        saranaKesehatan: {
          puskesmas: 1,
          pustu: 1,
          posyandu: 2,
          puskesdes: 1
        }
      }
    },
    {
      id: 'geografi',
      jenis: 'geografi',
      judul: 'Geografi',
      deskripsi: 'Data geografis Desa Benteng Gajah',
      data: {
        geografi: {
          luasWilayah: 1243,
          jumlahDusun: 2,
          batasUtara: 'Desa Lise',
          batasSelatan: 'Kabupaten Soppeng',
          batasTimur: 'Desa Wanio',
          batasBarat: 'Desa Corowali',
          koordinat: {
            latitude: -7.123456,
            longitude: 110.123456
          },
          kondisiGeografis: 'Daerah pegunungan dengan sungai yang mengalir di tengahnya.',
          potensiAlam: 'Pertanian',
          penggunaanLahan: {
            pertanian: 60,
            perumahan: 20,
            hutan: 15,
            lainnya: 5
          }
        }
      }
    }
  ];

  for (const item of defaultData) {
    await updateUmumByJenis(item.jenis, item);
    // await executeQuery(`
    //   INSERT INTO umum_kelurahan (id, jenis, judul, deskripsi, gambar, data_json)
    //   VALUES (?, ?, ?, ?, ?, ?)
    // `, [
    //   item.id,
    //   item.jenis,
    //   item.judul,
    //   item.deskripsi,
    //   item.gambar || null,
    //   JSON.stringify(item.data)
    // ]);
  }
  
  console.log('Default umum data has been initialized.');
}