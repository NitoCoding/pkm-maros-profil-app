// pkm-maros-profil-app\src\libs\utils\filterBuilder.ts
// Centralized filter utilities for Berita - Single source of truth for filter logic

// Main filter interface - exported for use across the app
export interface BeritaAdminFilters {
  search?: string;
  status?: 'all' | 'published' | 'draft';
  kategori?: string;
  tanggalMulai?: string;
  tanggalAkhir?: string;
}

// ============================================================================
// Build URLSearchParams from filter object
// ============================================================================
export function buildFilterParams(
  filters: BeritaAdminFilters,
  pageSize: number,
  page: number,
  admin: boolean = true
): URLSearchParams {
  const params = new URLSearchParams({
    pageSize: pageSize.toString(),
    page: page.toString(),
  });

  if (admin) {
    params.append('admin', 'true');
  }

  // Only add params that have values
  if (filters.search?.trim()) {
    params.append('search', filters.search.trim());
  }
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.kategori?.trim()) {
    params.append('kategori', filters.kategori.trim());
  }
  if (filters.tanggalMulai?.trim()) {
    params.append('tanggalMulai', filters.tanggalMulai.trim());
  }
  if (filters.tanggalAkhir?.trim()) {
    params.append('tanggalAkhir', filters.tanggalAkhir.trim());
  }

  return params;
}

// ============================================================================
// Parse URLSearchParams to filter object
// ============================================================================
export function parseFilterParams(searchParams: URLSearchParams | string): BeritaAdminFilters {
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams;

  const filters: BeritaAdminFilters = {};

  if (params.has('search')) {
    filters.search = params.get('search') || undefined;
  }
  if (params.has('status')) {
    filters.status = params.get('status') as 'all' | 'published' | 'draft';
  }
  if (params.has('kategori')) {
    filters.kategori = params.get('kategori') || undefined;
  }
  if (params.has('tanggalMulai')) {
    filters.tanggalMulai = params.get('tanggalMulai') || undefined;
  }
  if (params.has('tanggalAkhir')) {
    filters.tanggalAkhir = params.get('tanggalAkhir') || undefined;
  }

  return filters;
}

// ============================================================================
// Build SQL WHERE clause from filter object
// ============================================================================
export interface WhereClauseResult {
  whereClause: string;
  params: any[];
}

export function buildFilterWhereClause(filters: BeritaAdminFilters): WhereClauseResult {
  const conditions: string[] = [];
  const params: any[] = [];

  // Search filter (judul, ringkasan, isi)
  if (filters.search?.trim()) {
    conditions.push('(judul LIKE ? OR ringkasan LIKE ? OR isi LIKE ?)');
    const searchPattern = `%${filters.search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  // Kategori filter
  if (filters.kategori?.trim()) {
    conditions.push('kategori = ?');
    params.push(filters.kategori.trim());
  }

  // Tanggal mulai filter
  if (filters.tanggalMulai?.trim()) {
    conditions.push('tanggal >= ?');
    params.push(filters.tanggalMulai.trim());
  }

  // Tanggal akhir filter
  if (filters.tanggalAkhir?.trim()) {
    conditions.push('tanggal <= ?');
    params.push(filters.tanggalAkhir.trim());
  }

  const whereClause = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : '';

  return { whereClause, params };
}

// ============================================================================
// Efficient shallow equality check
// ============================================================================
export function shallowEqual<T extends Record<string, any>>(
  obj1: T | undefined,
  obj2: T | undefined
): boolean {
  // Handle undefined/null cases
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1) as (keyof T)[];
  const keys2 = Object.keys(obj2) as (keyof T)[];

  // Different number of keys
  if (keys1.length !== keys2.length) return false;

  // Check each key
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Utility: Check if filters have active values
// ============================================================================
export function hasActiveFilters(filters: BeritaAdminFilters): boolean {
  return !!(
    filters.search?.trim() ||
    (filters.status && filters.status !== 'all') ||
    filters.kategori?.trim() ||
    filters.tanggalMulai?.trim() ||
    filters.tanggalAkhir?.trim()
  );
}

// ============================================================================
// Utility: Get default/reset filters
// ============================================================================
export function getDefaultFilters(): BeritaAdminFilters {
  return {
    search: '',
    status: 'all',
    kategori: '',
    tanggalMulai: '',
    tanggalAkhir: ''
  };
}
