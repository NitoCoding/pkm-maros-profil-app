export interface IInovasi {
    id: string
    slug: string
    judul: string
    kategori: string
    deskripsi: string
    tahun: number
    gambar: string[] // Array URL gambar
    altText: string
    linkProyek?: string       // Link dokumentasi, website, atau laporan
    linkDanaDesa?: string     // Link ke laporan penggunaan dana
    socialMedia?: {
        instagram?: string | null;
        youtube?: string | null;
        tiktok?: string | null;
    }; // Akun yang mengelola/mengembangkan
    /**
     * Field opsional untuk pengembangan lebih lanjut
     * timPengembang?: string[]
     * status?: 'aktif' | 'uji-coba' | 'terhenti'
     * lokasi?: string
     * videoUrl?: string
     */
    createdAt: string
    updatedAt: string
}

// Tipe respons paginasi cursor-based (untuk infinite scroll)
export interface IInovasiCursorPaginatedResponse {
  data: IInovasi[];
  hasMore: boolean;
  nextCursor: string | null;
}

// Tipe respons paginasi page-based (untuk admin dengan filter)
export interface IInovasiPaginatedResponse {
  data: IInovasi[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}