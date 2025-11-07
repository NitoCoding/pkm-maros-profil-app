// src/libs/profil.ts
import { executeQuery, executeSingleQuery } from '@/libs/database';
import { IProfil } from '@/types/profil';

// Mengambil semua profil
export async function getProfilKelurahan(): Promise<IProfil[]> {
  const results = await executeQuery<any>(`
    SELECT id, jenis, judul, isi, gambar_url as gambarUrl, video_url as videoUrl, created_at as createdAt, updated_at as updatedAt
    FROM profil_kelurahan
    ORDER BY jenis, urutan_tampil ASC, created_at DESC
  `);

  return results.map(row => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

// Mengambil profil berdasarkan jenis
export async function getProfilByJenis(jenis: IProfil['jenis']): Promise<IProfil | null> {
  const result = await executeSingleQuery<any>(`
    SELECT id, jenis, judul, isi, gambar_url as gambarUrl, video_url as videoUrl, created_at as createdAt, updated_at as updatedAt
    FROM profil_kelurahan
    WHERE jenis = ?
  `, [jenis]);

  if (!result) return null;

  return {
    ...result,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}

// Menambah atau memperbarui profil
export async function upsertProfil(data: Omit<IProfil, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    // Cek apakah data dengan jenis ini sudah ada
    const existing = await getProfilByJenis(data.jenis);
    
    if (existing) {
      // Update data yang sudah ada
      const fields: string[] = [];
      const values: any[] = [];

      if (data.judul !== undefined) { fields.push('judul = ?'); values.push(data.judul); }
      if (data.isi !== undefined) { fields.push('isi = ?'); values.push(data.isi); }
      if (data.gambarUrl !== undefined) { fields.push('gambar_url = ?'); values.push(data.gambarUrl); }
      if (data.videoUrl !== undefined) { fields.push('video_url = ?'); values.push(data.videoUrl); }
      
      if (fields.length > 0) {
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(data.jenis);
        
        await executeQuery(`
          UPDATE profil_kelurahan 
          SET ${fields.join(', ')}
          WHERE jenis = ?
        `, values);
      }
    } else {
      // Insert data baru
      const fields: string[] = ['jenis'];
      const placeholders: string[] = ['?'];
      const values: any[] = [data.jenis];

      if (data.judul !== undefined) { fields.push('judul'); placeholders.push('?'); values.push(data.judul); }
      if (data.isi !== undefined) { fields.push('isi'); placeholders.push('?'); values.push(data.isi); }
      if (data.gambarUrl !== undefined) { fields.push('gambar_url'); placeholders.push('?'); values.push(data.gambarUrl); }
      if (data.videoUrl !== undefined) { fields.push('video_url'); placeholders.push('?'); values.push(data.videoUrl); }
      
      await executeQuery(`
        INSERT INTO profil_kelurahan (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
      `, values);
    }
    
    return true;
  } catch (error) {
    console.error('Error in upsertProfil:', error);
    return false;
  }
}

// Menghapus profil berdasarkan jenis
export async function deleteProfilByJenis(jenis: IProfil['jenis']): Promise<boolean> {
  try {
    const [result] = await executeQuery('DELETE FROM profil_kelurahan WHERE jenis = ?', [jenis]);
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Error in deleteProfilByJenis:', error);
    return false;
  }
}