// src/types/profil.ts

export interface IProfil {
  id: number;
  jenis: 'visi' | 'misi' | 'sejarah' | 'struktur' | 'sambutan' | 'video' | 'lainnya';
  judul?: string;
  isi: string;
  gambarUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}