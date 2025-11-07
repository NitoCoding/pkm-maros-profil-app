// src/types/galeri.ts

export interface IGaleri {
    id: string; // ID adalah string (UUID)
    src: string;
    alt: string | null;
    caption: string | null;
    tanggal: string; // Akan disimpan sebagai DATE di DB, dikirim sebagai string
    tags: string[] | null;
    // Metadata
    createdBy: string | null;
    authorName: string | null;
    authorEmail: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

// Tipe untuk data yang bisa di-update
export type IGaleriUpdate = Partial<Omit<IGaleri, 'id' | 'createdAt' | 'createdBy'>>;

// Tipe respons paginasi tetap sama
export interface IGaleriPaginatedResponse {
    data: IGaleri[];
    hasMore: boolean;
    nextCursor: string | null;
}