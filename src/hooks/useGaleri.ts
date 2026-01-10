import { useState, useEffect, useCallback, useRef } from 'react'
import { IGaleri } from '@/types/galeri'
import { set } from 'zod'
import { GaleriAdminFilters } from '@/libs/constant/galeriFilter'

interface UseGaleriResult {
  galeri: IGaleri[]
  setGaleri?: React.Dispatch<React.SetStateAction<IGaleri[]>>
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

interface UseGaleriOptions {
  pageSize?: number
  initialLoad?: boolean
}

export function useGaleri(options: UseGaleriOptions = {}): UseGaleriResult {
  const { pageSize = 12, initialLoad = true } = options
  const [galeri, setGaleri] = useState<IGaleri[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  // ✅ Gunakan useCallback agar tidak berubah setiap render
  const cursorRef = useRef<string | null>(null)
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])
  const fetchGaleri = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      })

      const currentCursor = reset ? null : cursorRef.current
        if (currentCursor) {
          params.append('cursor', currentCursor)
        }

      const response = await fetch(`/api/galeri?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch galeri')
      }
      
      // console.log(result.data.nextCursor)
      if (result.success) {
        const newGaleri = result.data.data || []

        if (reset) {
          setGaleri(newGaleri)
        } else {
          setGaleri((prev) => [...prev, ...newGaleri])
        }
        setHasMore(result.data.hasMore || false)
        setCursor(result.data.nextCursor || null)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching galeri:', err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchGaleri(false)
    }
  }, [loading, hasMore, fetchGaleri])

  const refresh = useCallback(() => {
    setCursor(null)
    setGaleri([])
    setHasMore(true)
    fetchGaleri(true)
  }, [fetchGaleri])

  // ✅ Efek awal dengan dependensi lengkap dan aman
  useEffect(() => {
    if (initialLoad) {
      fetchGaleri(true)
    }
  }, [initialLoad, fetchGaleri])

  return {
    galeri,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}

export function useAdminGaleri(options: UseGaleriOptions = {}): UseGaleriResult {
  const { pageSize = 12, initialLoad = true } = options
  const [galeri, setGaleri] = useState<IGaleri[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const cursorRef = useRef<string | null>(null)
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])
  const fetchGaleri = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        admin: 'true',
      })

      const currentCursor = reset ? null : cursorRef.current
        if (currentCursor) {
          params.append('cursor', currentCursor)
        }

      const response = await fetch(`/api/galeri?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch galeri')
      }

      if (result.success) {
        const newGaleri = result.data.data || []

        if (reset) {
          setGaleri(newGaleri)
        } else {
          setGaleri((prev) => [...prev, ...newGaleri])
        }

        setHasMore(result.data.hasMore || false)
        setCursor(result.data.nextCursor || null)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching galeri (admin):', err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchGaleri(false)
    }
  }, [loading, hasMore, fetchGaleri])

  const refresh = useCallback(() => {
    setCursor(null)
    setGaleri([])
    setHasMore(true)
    fetchGaleri(true)
  }, [fetchGaleri])

  useEffect(() => {
    if (initialLoad) {
      refresh()
    }
  }, [initialLoad, refresh])

  return {
    galeri,
    setGaleri,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}

// ============================================================================
// ADMIN GALERI WITH FILTERS & PAGE-BASED PAGINATION
// ============================================================================
interface UseGaleriAdminResult {
  galeri: IGaleri[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  totalPages: number
  setPage: (page: number) => void
  refresh: () => void
}

interface UseGaleriAdminOptions {
  pageSize?: number
  initialLoad?: boolean
  filters?: GaleriAdminFilters
  resetPageOnFilterChange?: boolean
}

export function useGaleriAdminPaginated({
  pageSize = 10,
  initialLoad = true,
  filters: externalFilters = {},
  resetPageOnFilterChange = true
}: UseGaleriAdminOptions = {}): UseGaleriAdminResult {
  const [galeri, setGaleri] = useState<IGaleri[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchGaleri = useCallback(
    async (currentPage: number, currentFilters: GaleriAdminFilters) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
          page: currentPage.toString(),
          admin: 'true',
        })

        if (currentFilters.search?.trim()) params.append('search', currentFilters.search.trim())
        if (currentFilters.tanggalMulai?.trim()) params.append('tanggalMulai', currentFilters.tanggalMulai.trim())
        if (currentFilters.tanggalAkhir?.trim()) params.append('tanggalAkhir', currentFilters.tanggalAkhir.trim())

        const response = await fetch(`/api/galeri?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch galeri')
        }

        if (result.success) {
          const newGaleri = result.data.data || []
          setGaleri(newGaleri)
          setTotal(result.data.total || 0)
          setTotalPages(result.data.totalPages || 0)
          setPage(result.data.page || currentPage)
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching galeri (admin):', err)
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  // Independent filter change handling
  const prevFiltersRef = useRef<GaleriAdminFilters>(externalFilters)

  useEffect(() => {
    const hasChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(externalFilters)
    if (hasChanged) {
      const targetPage = resetPageOnFilterChange ? 1 : page
      setPage(targetPage)
      fetchGaleri(targetPage, externalFilters)
      prevFiltersRef.current = externalFilters
    }
  }, [externalFilters, fetchGaleri, page, resetPageOnFilterChange])

  // Handle page changes independently
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    fetchGaleri(newPage, externalFilters)
  }, [externalFilters, fetchGaleri])

  const refresh = useCallback(() => {
    fetchGaleri(page, externalFilters)
  }, [page, externalFilters, fetchGaleri])

  // Initial load
  const hasInitializedRef = useRef(false)
  useEffect(() => {
    if (!hasInitializedRef.current && initialLoad) {
      fetchGaleri(1, externalFilters)
      hasInitializedRef.current = true
      prevFiltersRef.current = externalFilters
    }
  }, [])

  return {
    galeri,
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


// Hook untuk single galeri by id
export function useGaleriById(id: string) {
  const [galeri, setGaleri] = useState<IGaleri | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchGaleri = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/galeri?id=${encodeURIComponent(id)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Galeri tidak ditemukan');
        }

        if (result.success) {
          setGaleri(result.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching galeri by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGaleri();
  }, [id]); // Dependency tetap `id` (string)

  return { galeri, loading, error };
}

// Hook untuk galeri terbaru (untuk homepage)
export function useLatestGaleri(limit = 6) {
  const [galeri, setGaleri] = useState<IGaleri[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestGaleri = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/galeri?pageSize=${limit}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch latest galeri');
      }

      if (result.success) {
        setGaleri(result.data.data || []); // PERBAIKAN: akses result.data.data
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching latest galeri:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLatestGaleri();
  }, [fetchLatestGaleri]);

  const refresh = useCallback(() => {
    fetchLatestGaleri();
  }, [fetchLatestGaleri]);

  return { galeri, loading, error, refresh };
}
