export interface IBerita {
    id: string;
    judul: string;
    slug: string;
    ringkasan: string;
    isi: string;
    gambar: string;
    tanggal: string;
    penulis: string;
    kategori: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    views: number;
    komentarCount: number;
    tags: string[];
}

