// pkm-maros-profil-app\src\libs\constant\wisataFilter.ts
// Constants untuk filter wisata

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================
export const wisataPageSizeOptions = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
] as const;

export type WisataPageSizeOption = typeof wisataPageSizeOptions[number]['value'];

// ============================================================================
// FILTER INTERFACE
// ============================================================================
export interface WisataAdminFilters {
  search: string;
}
