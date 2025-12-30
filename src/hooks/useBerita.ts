// pkm-maros-profil-app\src\hooks\useBerita.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { IBerita } from '@/types/berita';

interface UseBeritaResult {
  berita: IBerita[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface UseBeritaOptions {
  pageSize?: number;
  initialLoad?: boolean;
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
export function useBeritaAdmin({ pageSize = 10, initialLoad = true }: UseBeritaOptions = {}): UseBeritaResult {
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

  const fetchBerita = useCallback(
    async (reset = false) => {
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
    [pageSize] // ← HANYA pageSize! cursor pakai ref
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

  useEffect(() => {
    if (initialLoad) {
      refresh()
    }
  }, [initialLoad, refresh])

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}


export function useBeritaById(id: number) {
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

  useEffect(() => {
    const fetchLatestBerita = async () => {
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
    };

    fetchLatestBerita();
  }, [count]);

  return { berita, loading, error };
}