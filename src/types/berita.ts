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

// Tipe untuk respons paginasi cursor-based (untuk public & infinite scroll)
export interface IBeritaCursorPaginatedResponse {
  data: IBerita[];
  hasMore: boolean;
  nextCursor: string | null;
}

// Tipe untuk respons paginasi page-based (untuk admin)
export interface IBeritaPaginatedResponse {
  data: IBerita[];
  total: number; // Total rows matching filters
  page: number; // Current page (1-based)
  pageSize: number; // Items per page
  totalPages: number; // Total pages
}