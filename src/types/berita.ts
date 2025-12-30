// pkm-maros-profil-app\src\types\berita.ts

export interface IBerita {
  id: number;
  judul: string;
  slug: string;
  ringkasan: string;
  isi: string;
  gambar: string | null;
  status: 'draft' | 'published';
  views: number;
  komentarCount: number;
  tags: string[];
  kategori: string;
  penulis: string;
  tanggal: string;
  // Metadata
  createdBy: string | null;
  authorName: string | null;
  authorEmail: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tipe untuk data yang bisa di-update (semua field opsional)
export type IBeritaUpdate = Partial<Omit<IBerita, 'id' | 'createdAt' | 'createdBy'>>;

// Tipe untuk respons paginasi
export interface IBeritaPaginatedResponse {
  data: IBerita[];
  hasMore: boolean;
  nextCursor: string | null; // Kita akan menggunakan stringified timestamp sebagai cursor
}