export interface IWisata {
  id: string
  slug: string
  nama: string
  deskripsiSingkat: string
  deskripsiLengkap?: string
  gambar: string[] // Array URL gambar
  altText: string
  lokasiLink?: string // URL Google Maps
  linkPendaftaran?: string | null
  linkWebsite?: string | null
  socialMedia?: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    whatsapp?: string | null;
  };
  tags?: string[]
  /**
   * Opsional: tambahkan field lain saat ada backend
   * hargaTiket?: number
   * jamBuka?: string
   * fasilitas?: string[]
   */
}