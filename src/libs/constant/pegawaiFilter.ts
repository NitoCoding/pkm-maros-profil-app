// pkm-maros-profil-app\src\libs\constant\pegawaiFilter.ts
// Constants untuk filter pegawai

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================
export const pegawaiPageSizeOptions = [
  { value: 10, label: '10 per halaman' },
  { value: 25, label: '25 per halaman' },
  { value: 50, label: '50 per halaman' },
  { value: 100, label: '100 per halaman' },
] as const;

export type PegawaiPageSizeOption = typeof pegawaiPageSizeOptions[number]['value'];

// ============================================================================
// FILTER INTERFACE
// ============================================================================
export interface PegawaiAdminFilters {
  search?: string;
}
