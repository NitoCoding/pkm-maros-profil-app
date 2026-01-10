// pkm-maros-profil-app\src\hooks\useBerita.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { IBerita } from '@/types/berita';
import { buildFilterParams, shallowEqual, BeritaAdminFilters } from '@/libs/utils/filterBuilder';

interface UseBeritaResult {
  berita: IBerita[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

// New result type for paginated admin
interface UseBeritaAdminResult {
  berita: IBerita[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

interface UseBeritaOptions {
  pageSize?: number;
  initialLoad?: boolean;
  filters?: BeritaAdminFilters;
  resetPageOnFilterChange?: boolean; // NEW: Configurable behavior
}

export function useBerita(options: UseBeritaOptions = {}): UseBeritaResult {
  const { pageSize = 12, initialLoad = true } = options;
  const [berita, setBerita] = useState<IBerita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  // PAKAI REF supaya cursor up-to-date tanpa trigger re-render & dependency hell
  const cursorRef = useRef<string | null>(null)

  // Update ref setiap cursor berubah (tapi tidak trigger useEffect)
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const fetchBerita = useCallback(
    async (reset = false) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
        })

        // Gunakan cursor dari ref (selalu up-to-date)
        const currentCursor = reset ? null : cursorRef.current
        if (currentCursor) {
          params.append('cursor', currentCursor)
        }

        const response = await fetch(`/api/berita?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch berita')
        }

        if (result.success) {
          const newBerita = result.data.data || []

          if (reset) {
            setBerita(newBerita)
          } else {
            setBerita(prev => [...prev, ...newBerita])
          }

          setHasMore(result.data.hasMore ?? false)
          setCursor(result.data.nextCursor || null) // ← update state + ref otomatis update
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching berita:', err)
      } finally {
        setLoading(false)
      }
    },
    [pageSize] // ← HANYA pageSize! cursor pakai ref → aman!
  )

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    fetchBerita(false)
  }, [loading, hasMore, fetchBerita])

  const refresh = useCallback(() => {
    setCursor(null)
    cursorRef.current = null
    setBerita([])
    setHasMore(true)
    fetchBerita(true)
  }, [fetchBerita])

  useEffect(() => {
    if (initialLoad) {
      refresh()
    }
  }, [initialLoad, refresh]) // ← refresh stabil, tidak tergantung cursor

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}


// Hook untuk admin - dapat mengakses semua berita (termasuk draft)
// Hook untuk admin - dapat mengakses semua berita (termasuk draft)
export function useBeritaAdmin({ pageSize = 10, initialLoad = true, filters = {} }: UseBeritaOptions = {}): UseBeritaResult {
  const [berita, setBerita] = useState<IBerita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  // Gunakan ref untuk cursor agar tidak trigger re-render
  const cursorRef = useRef<string | null>(null)
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  // Gunakan ref untuk filters agar tidak trigger re-fetch setiap render
  const filtersRef = useRef<BeritaAdminFilters>(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const fetchBerita = useCallback(
    async (reset = false) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
          admin: 'true',
        })

        // Add filter parameters dari ref (bukan langsung dari dependency)
        const currentFilters = filtersRef.current
        if (currentFilters.search) {
          params.append('search', currentFilters.search);
        }
        if (currentFilters.status) {
          params.append('status', currentFilters.status);
        }
        if (currentFilters.kategori) {
          params.append('kategori', currentFilters.kategori);
        }
        if (currentFilters.tanggalMulai) {
          params.append('tanggalMulai', currentFilters.tanggalMulai);
        }
        if (currentFilters.tanggalAkhir) {
          params.append('tanggalAkhir', currentFilters.tanggalAkhir);
        }

        const currentCursor = reset ? null : cursorRef.current
        if (currentCursor) {
          params.append('cursor', currentCursor)
        }

        const response = await fetch(`/api/berita?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch berita')
        }

        if (result.success) {
          const newBerita = result.data.data || []
          if (reset) {
            setBerita(newBerita)
          } else {
            setBerita(prev => [...prev, ...newBerita])
          }
          setHasMore(result.data.hasMore ?? false)
          setCursor(result.data.nextCursor || null)
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching berita (admin):', err)
      } finally {
        setLoading(false)
      }
    },
    [pageSize] // ← HANYA pageSize
  )

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchBerita(false)
    }
  }, [loading, hasMore, fetchBerita])

  const refresh = useCallback(() => {
    setCursor(null)
    cursorRef.current = null
    setBerita([])
    setHasMore(true)
    fetchBerita(true)
  }, [fetchBerita])

  // Hanya fetch saat initial load (mount sekali saja)
  useEffect(() => {
    if (initialLoad) {
      refresh()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}

// Hook untuk admin - dapat mengakses semua berita (termasuk draft) - Page-based pagination
export function useBeritaAdminPaginated({
  pageSize = 10,
  initialLoad = true,
  filters: externalFilters = {},
  resetPageOnFilterChange = true // Default: maintain current behavior
}: UseBeritaOptions = {}): UseBeritaAdminResult {
  const [berita, setBerita] = useState<IBerita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchBerita = useCallback(
    async (currentPage: number, currentFilters: BeritaAdminFilters) => {
      try {
        setLoading(true)
        setError(null)

        // Use centralized utility
        const params = buildFilterParams(currentFilters, pageSize, currentPage, true)
        const response = await fetch(`/api/berita?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch berita')
        }

        if (result.success) {
          const newBerita = result.data.data || []
          setBerita(newBerita)
          setTotal(result.data.total || 0)
          setTotalPages(result.data.totalPages || 0)
          setPage(result.data.page || currentPage)
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching berita (admin):', err)
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  // Independent filter change handling
  const prevFiltersRef = useRef<BeritaAdminFilters>(externalFilters)

  useEffect(() => {
    if (!shallowEqual(prevFiltersRef.current, externalFilters)) {
      const targetPage = resetPageOnFilterChange ? 1 : page
      setPage(targetPage)
      fetchBerita(targetPage, externalFilters)
      prevFiltersRef.current = externalFilters
    }
  }, [externalFilters, fetchBerita, page, resetPageOnFilterChange])

  // Independent pageSize change handling
  const prevPageSizeRef = useRef(pageSize)
  useEffect(() => {
    if (prevPageSizeRef.current !== pageSize) {
      // Recalculate page to maintain approximate position
      const newPage = Math.min(page, Math.ceil((prevPageSizeRef.current * (page - 1) + 1) / pageSize))
      setPage(newPage)
      fetchBerita(newPage, externalFilters)
      prevPageSizeRef.current = pageSize
    }
  }, [pageSize, page, externalFilters, fetchBerita])

  // Handle page changes independently
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    fetchBerita(newPage, externalFilters)
  }, [externalFilters, fetchBerita])

  const refresh = useCallback(() => {
    fetchBerita(page, externalFilters)
  }, [page, externalFilters, fetchBerita])

  // Initial load
  const hasInitializedRef = useRef(false)
  useEffect(() => {
    if (!hasInitializedRef.current && initialLoad) {
      fetchBerita(1, externalFilters)
      hasInitializedRef.current = true
      prevFiltersRef.current = externalFilters
      prevPageSizeRef.current = pageSize
    }
  }, [])

  return {
    berita,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    setPage: handlePageChange,
    refresh,
  }
}


export function useBeritaById(id: string | number) {
  const [berita, setBerita] = useState<IBerita | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBerita = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/berita?id=${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Berita tidak ditemukan');
        }

        if (result.success) {
          setBerita(result.data); // PERBAIKAN: akses result.data langsung
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching berita by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, [id]);

  return {
    berita,
    loading,
    error,
  }
}

// Hook lainnya (useBeritaBySlug, useLatestBerita) juga perlu disesuaikan, tetapi prinsipnya sama.
// Contoh untuk useBeritaBySlug:
export function useBeritaBySlug(slug: string) {
  const [berita, setBerita] = useState<IBerita | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBerita = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/berita?slug=${encodeURIComponent(slug)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Berita tidak ditemukan');
        }

        if (result.success) {
          setBerita(result.data); // PERBAIKAN: akses result.data langsung
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching berita by slug:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, [slug]);

  return { berita, loading, error };
}

// Hook untuk mendapatkan berita terbaru
export function useLatestBerita(count: number = 3) {
  const [berita, setBerita] = useState<IBerita[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBerita = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/berita?pageSize=${count}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch latest berita');
      }

      const data = result.data?.data.slice(0, count) || [];
      setBerita(data);
    } catch (err: any) {
      setError(err.message);
      setBerita([]);
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchLatestBerita();
  }, [fetchLatestBerita]);

  const refresh = useCallback(() => {
    fetchLatestBerita();
  }, [fetchLatestBerita]);

  return { berita, loading, error, refresh };
}