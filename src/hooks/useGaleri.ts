import { useState, useEffect, useCallback, useRef } from 'react'
import { IGaleri } from '@/types/galeri'
import { set } from 'zod'

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

  useEffect(() => {
    const fetchLatestGaleri = async () => {
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
    };

    fetchLatestGaleri();
  }, [limit]);

  return { galeri, loading, error };
}
