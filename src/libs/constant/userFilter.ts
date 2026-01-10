// src/libs/constant/userFilter.ts
// Constants untuk filter user admin

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================
export const userPageSizeOptions = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
] as const;

export type UserPageSizeOption = typeof userPageSizeOptions[number]['value'];

// ============================================================================
// FILTER INTERFACE
// ============================================================================
export interface UserAdminFilters {
  search: string;
  emailVerified: 'all' | 'verified' | 'unverified';
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================
export const emailVerifiedOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'verified', label: 'Terverifikasi' },
  { value: 'unverified', label: 'Belum Verifikasi' },
] as const;
