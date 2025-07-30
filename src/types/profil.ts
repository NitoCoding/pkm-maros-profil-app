export interface IProfil {
    id: string; // "visi", "misi", "sejarah", "struktur", "video"
    jenis: 'visi' | 'misi' | 'sejarah' | 'struktur' | 'sambutan' | 'video' | 'lainnya';
    judul?: string;
    isi?: string;
    gambar?: string; // opsional untuk struktur
    videoUrl?: string; // khusus untuk video
    updatedAt: string;
}

