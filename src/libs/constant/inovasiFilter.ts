// pkm-maros-profil-app\src\libs\constant\inovasiFilter.ts
// Constants untuk filter inovasi

// ============================================================================
// KATEGORI INOVASI
// ============================================================================
export const inovasiKategori = [
  'Teknologi',
  'Pertanian',
  'Kesehatan',
  'Pendidikan',
  'Ekonomi',
  'Lingkungan',
  'Infrastruktur',
  'Sosial',
  'Lainnya',
] as const;

export type InovasiKategori = typeof inovasiKategori[number];

// ============================================================================
// TAHUN OPTIONS
// ============================================================================
export function getInovasiTahunOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const startYear = 2000
  const years = []
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year)
  }
  return years
}

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================
export const inovasiPageSizeOptions = [
  { value: 10, label: '10 per halaman' },
  { value: 25, label: '25 per halaman' },
  { value: 50, label: '50 per halaman' },
  { value: 100, label: '100 per halaman' },
] as const;

export type InovasiPageSizeOption = typeof inovasiPageSizeOptions[number]['value'];

// ============================================================================
// FILTER INTERFACE
// ============================================================================
export interface InovasiAdminFilters {
  search?: string;
  kategori?: string;
  tahun?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function isValidInovasiKategori(kategori: string): kategori is InovasiKategori {
  return inovasiKategori.includes(kategori as InovasiKategori);
}
