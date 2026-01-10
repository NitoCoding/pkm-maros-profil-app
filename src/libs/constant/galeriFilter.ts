// pkm-maros-profil-app\src\libs\constant\galeriFilter.ts
// Constants untuk filter galeri

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================
export const galeriPageSizeOptions = [
  { value: 10, label: '10 per halaman' },
  { value: 25, label: '25 per halaman' },
  { value: 50, label: '50 per halaman' },
  { value: 100, label: '100 per halaman' },
] as const;

export type GaleriPageSizeOption = typeof galeriPageSizeOptions[number]['value'];

// ============================================================================
// DEFAULT VALUES
// ============================================================================
export const defaultGaleriFilters = {
  search: '',
  tanggalMulai: '',
  tanggalAkhir: ''
} as const;

// ============================================================================
// FILTER INTERFACE
// ============================================================================
export interface GaleriAdminFilters {
  search?: string;
  tanggalMulai?: string;
  tanggalAkhir?: string;
}
