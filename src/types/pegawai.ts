// src/types/pegawai.ts

export interface IPegawai {
  id: string; // ID adalah number (AUTO_INCREMENT)
  nama: string;
  jabatan: string;
  fotoUrl: string;
  urutanTampil: number;
  createdAt: string;
  updatedAt: string;
}

// Tipe untuk data yang bisa di-update
export type IPegawaiUpdate = Partial<Omit<IPegawai, 'id' | 'createdAt'>>;

// Tipe respons paginasi
export interface IPegawaiPaginatedResponse {
  data: IPegawai[];
  hasMore: boolean;
  nextCursor: string | null;
}