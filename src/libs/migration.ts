// src/libs/migration.ts
import { executeQuery } from './database';
import { IProfil } from '@/types/profil';
import { IBerita } from '@/types/berita';
import { IGaleri } from '@/types/galeri';
import { IPegawai } from '@/types/pegawai';
import { IProdukUMKM } from '@/types/umkm';

export async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Migrate profil data
    const profilData = await getFirebaseData('profil_kelurahan');
    if (profilData) {
      for (const item of profilData) {
        await executeQuery(
          `INSERT INTO profil_kelurahan 
          (jenis, judul, isi, gambar_url, video_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          judul = VALUES(judul),
          isi = VALUES(isi),
          gambar_url = VALUES(gambar_url),
          video_url = VALUES(video_url),
          updated_at = VALUES(updated_at)`,
          [item.jenis, item.judul, item.isi, item.gambar, item.videoUrl, item.updatedAt, item.updatedAt]
        );
      }
      console.log('Profil data migrated successfully');
    }
    
    // Migrate berita data
    const beritaData = await getFirebaseData('berita');
    if (beritaData) {
      for (const item of beritaData) {
        await executeQuery(
          `INSERT INTO berita 
          (judul, slug, ringkasan, isi, gambar_url, tanggal, penulis, kategori, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          ringkasan = VALUES(ringkasan),
          isi = VALUES(isi),
          gambar_url = VALUES(gambar_url),
          tanggal = VALUES(tanggal),
          penulis = VALUES(penulis),
          kategori = VALUES(kategori),
          status = VALUES(status),
          updated_at = VALUES(updated_at)`,
          [item.judul, item.slug, item.ringkasan, item.isi, item.gambar, item.tanggal, item.penulis, item.kategori, item.status, item.createdAt, item.updatedAt]
        );
      }
      console.log('Berita data migrated successfully');
    }
    
    // Migrate galeri data
    const galeriData = await getFirebaseData('galeri');
    if (galeriData) {
      for (const item of galeriData) {
        await executeQuery(
          `INSERT INTO galeri 
          (src, alt, caption, tanggal, tags, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          caption = VALUES(caption),
          tanggal = VALUES(tanggal),
          tags = VALUES(tags),
          updated_at = VALUES(updated_at)`,
          [item.src, item.alt, item.caption, item.tanggal, JSON.stringify(item.tags || []), item.createdAt, item.updatedAt]
        );
      }
      console.log('Galeri data migrated successfully');
    }
    
    // Migrate pegawai data
    const pegawaiData = await getFirebaseData('pegawai');
    if (pegawaiData) {
      for (const item of pegawaiData) {
        await executeQuery(
          `INSERT INTO pegawai 
          (nama, jabatan, foto_url, urutan_tampil, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          jabatan = VALUES(jabatan),
          foto_url = VALUES(foto_url),
          urutan_tampil = VALUES(urutan_tampil),
          updated_at = VALUES(updated_at)`,
          [item.nama, item.jabatan, item.foto, item.urutanTampil, item.createdAt, item.updatedAt]
        );
      }
      console.log('Pegawai data migrated successfully');
    }
    
    // Migrate UMKM data
    const umkmData = await getFirebaseData('umkm');
    if (umkmData) {
      for (const item of umkmData) {
        await executeQuery(
          `INSERT INTO umkm 
          (nama, slug, kategori, deskripsi, gambar_url, start_price, end_price, telepon, alamat, latitude, longitude, google_maps_link, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          kategori = VALUES(kategori),
          deskripsi = VALUES(deskripsi),
          gambar_url = VALUES(gambar_url),
          start_price = VALUES(start_price),
          end_price = VALUES(end_price),
          telepon = VALUES(telepon),
          alamat = VALUES(alamat),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          google_maps_link = VALUES(google_maps_link),
          updated_at = VALUES(updated_at)`,
          [item.nama, item.slug, item.kategori, item.deskripsi, item.gambar, item.startPrice, item.endPrice, item.telepon, item.lokasi?.alamat, item.lokasi?.latitude, item.lokasi?.longitude, item.lokasi?.googleMapsLink, item.createdAt, item.updatedAt]
        );
      }
      console.log('UMKM data migrated successfully');
    }
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Helper function to get data from Firebase (for migration)
async function getFirebaseData(collection: string): Promise<any[]> {
  try {
    // This would be implemented to read from Firebase
    // For now, return empty array
    return [];
  } catch (error) {
    console.error(`Error getting Firebase data from ${collection}:`, error);
    return [];
  }
}
