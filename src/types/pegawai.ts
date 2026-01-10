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

// Tipe respons paginasi cursor-based (untuk infinite scroll)
export interface IPegawaiCursorPaginatedResponse {
  data: IPegawai[];
  hasMore: boolean;
  nextCursor: string | null;
}

// Tipe respons paginasi page-based (untuk admin dengan filter)
export interface IPegawaiPaginatedResponse {
  data: IPegawai[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}