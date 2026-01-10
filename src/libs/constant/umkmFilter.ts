// src/libs/constant/umkmFilter.ts

export interface UmkmAdminFilters {
  search: string;
  kategori: string;
  hargaMin: string;
  hargaMax: string;
}

export const umkmKategori = [
  'Makanan',
  'Minuman',
  'Kerajinan',
  'Pertanian',
  'Peternakan',
  'Jasa',
  'Lainnya'
] as const;

export type UmkmKategori = typeof umkmKategori[number];

export const umkmPageSizeOptions = [
  { value: 12, label: '12' },
  { value: 24, label: '24' },
  { value: 48, label: '48' },
  { value: 96, label: '96' }
] as const;
