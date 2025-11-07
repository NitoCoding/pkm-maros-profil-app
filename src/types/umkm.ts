// src/types/umkm.ts

export interface IProdukUMKM {
    id: string;
    namaProduk: string; // Nama spesifik produk
    namaUMKM: string;   // Nama usaha/pemilik
    kategori: string;
    deskripsi: string;
    gambar: string;
    // harga: number; // Kita gunakan satu harga, atau bisa jadi range
    // // atau
    harga: {
        awal: number;
        akhir: number;
    };
    kontak: {
        telepon: string;
        whatsapp: string;
    };
    lokasi: {
        alamat: string;
        latitude: number;
        longitude: number;
        googleMapsLink?: string;
    };
    // --- TAMBAHAN BARU ---
    linkPenjualan: {
        shopee?: string;
        tokopedia?: string;
        website?: string;
        // Bisa tambahkan lainnya
        [key: string]: string | undefined;
    };
    // Metadata
    createdBy: string | null;
    authorName: string | null;
    authorEmail: string | null;
    createdAt: string;
    updatedAt: string;
}

// Tipe untuk data yang bisa di-update
export type IProdukUMKMUpdate = Partial<Omit<IProdukUMKM, 'id' | 'createdAt' | 'createdBy'>>;

// Tipe respons paginasi
export interface IProdukUMKMPaginatedResponse {
  data: IProdukUMKM[];
  hasMore: boolean;
  nextCursor: string | null;
}