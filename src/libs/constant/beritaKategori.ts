// pkm-maros-profil-app\src\libs\constant\beritaKategori.ts
// Constants untuk filter berita

// ============================================================================
// KATEGORI BERITA
// ============================================================================
export const beritaKategori = [
  "Pemerintahan",
  "Pembangunan",
  "Pendidikan",
  "Kesehatan",
  "Lingkungan",
  "Ekonomi dan UMKM",
  "Kebudayaan",
  "Keamanan dan Ketertiban",
  "Sosial Masyarakat",
  "Pariwisata",
  "Olahraga",
  "Agama",
  "Infrastruktur",
  "Teknologi dan Inovasi",
  "Umum",
] as const;

// Type untuk kategori berita
export type BeritaKategori = typeof beritaKategori[number];

// ============================================================================
// STATUS OPTIONS
// ============================================================================
export const beritaStatusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
] as const;

export type BeritaStatusOption = typeof beritaStatusOptions[number]['value'];

// ============================================================================
// SORT OPTIONS
// ============================================================================
export const beritaSortOptions = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'mostViewed', label: 'Terpopuler' },
  { value: 'titleAsc', label: 'Judul A-Z' },
  { value: 'titleDesc', label: 'Judul Z-A' },
] as const;

export type BeritaSortOption = typeof beritaSortOptions[number]['value'];

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================
export const beritaPageSizeOptions = [
  { value: 10, label: '10 per halaman' },
  { value: 25, label: '25 per halaman' },
  { value: 50, label: '50 per halaman' },
  { value: 100, label: '100 per halaman' },
] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================
export const defaultBeritaFilters = {
  search: '',
  status: 'all' as BeritaStatusOption,
  kategori: '',
  tanggalMulai: '',
  tanggalAkhir: ''
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Cek apakah kategori valid
 */
export function isValidBeritaKategori(kategori: string): kategori is BeritaKategori {
  return beritaKategori.includes(kategori as BeritaKategori);
}

/**
 * Cek apakah status valid
 */
export function isValidBeritaStatus(status: string): status is BeritaStatusOption {
  return beritaStatusOptions.some(opt => opt.value === status);
}

/**
 * Get label untuk status
 */
export function getStatusLabel(status: BeritaStatusOption): string {
  const option = beritaStatusOptions.find(opt => opt.value === status);
  return option?.label || status;
}
