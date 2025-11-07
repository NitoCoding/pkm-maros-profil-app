// src/types/database.ts
export interface DBUser {
  id: number;
  email: string;
  password_hash?: string;
  name?: string;
  role: string;
  avatar_url?: string;
  google_id?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DBBerita {
  id: number;
  judul: string;
  slug: string;
  ringkasan?: string;
  isi: string;
  gambar_url?: string;
  tanggal?: string;
  penulis?: string;
  kategori?: string;
  status: 'draft' | 'published';
  created_by?: number;
  created_at: string;
  updated_at: string;
  views: number;
  komentar_count: number;
}

export interface DBGaleri {
  id: number;
  src: string;
  alt: string;
  caption?: string;
  tanggal?: string;
  tags?: string[];
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface DBPegawai {
  id: number;
  nama: string;
  jabatan?: string;
  foto_url?: string;
  urutan_tampil: number;
  created_at: string;
  updated_at: string;
}

export interface DBUMKM {
  id: number;
  nama: string;
  slug: string;
  kategori?: string;
  deskripsi?: string;
  gambar_url?: string;
  start_price?: number;
  end_price?: number;
  telepon?: string;
  alamat?: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  created_at: string;
  updated_at: string;
}

export interface DBProfil {
  id: number;
  jenis: 'visi' | 'misi' | 'sejarah' | 'struktur' | 'sambutan' | 'video' | 'lainnya';
  judul?: string;
  isi?: string;
  gambar_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}
