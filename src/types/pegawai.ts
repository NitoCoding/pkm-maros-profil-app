// src/types/pegawai.ts

export interface IPegawai {
  id: number;
  id_uuid: string;
  nama: string;
  jabatan: string;
  fotoUrl: string;
  tampilkanDiBeranda: boolean;
  urutanBeranda: number | null;
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