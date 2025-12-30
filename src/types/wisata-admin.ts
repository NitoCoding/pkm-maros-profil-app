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
  createdBy?: number
  updatedBy?: number
  createdAt?: string
  updatedAt?: string
}

export interface IWisataUpdate {
  slug?: string
  nama?: string
  deskripsiSingkat?: string
  deskripsiLengkap?: string
  gambar?: string[]
  altText?: string
  lokasiLink?: string
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
  updatedBy?: number
}

export interface IWisataPaginatedResponse {
  data: IWisata[]
  hasMore: boolean
  nextCursor: string | null
}