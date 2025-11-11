// src/hooks/useBerita.ts
import { useState, useEffect, useCallback } from 'react';
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
  const { pageSize = 10, initialLoad = true } = options;
  const [berita, setBerita] = useState<IBerita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // ✅ Gunakan useCallback agar stabil dan bisa jadi dependency useEffect
  const fetchBerita = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
        });

        if (!reset && cursor) {
          params.append('cursor', cursor);
        }

        const response = await fetch(`/api/berita?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch berita');
        }

        if (result.success) {
          const newBerita = result.data.data || [];
          if (reset) {
            setBerita(newBerita);
          } else {
            setBerita((prev) => [...prev, ...newBerita]);
          }
          setHasMore(result.data.hasMore || false);
          setCursor(result.data.nextCursor || null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching berita:', err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, cursor] // dependency yang mempengaruhi fetch
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchBerita(false);
    }
  }, [loading, hasMore, fetchBerita]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchBerita(true);
  }, [fetchBerita]);

  // ✅ Masukkan fetchBerita dan initialLoad ke dependency array
  useEffect(() => {
    if (initialLoad) {
      fetchBerita(true);
    }
  }, [initialLoad, fetchBerita]);

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}


// Hook untuk admin - dapat mengakses semua berita (termasuk draft)
export function useBeritaAdmin(options: UseBeritaOptions = {}): UseBeritaResult {
  const { pageSize = 10, initialLoad = true } = options;
  const [berita, setBerita] = useState<IBerita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchBerita = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
          admin: 'true',
        });

        if (!reset && cursor) {
          params.append('cursor', cursor);
        }

        const response = await fetch(`/api/berita?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch berita');
        }

        if (result.success) {
          const newBerita = result.data.data || [];
          if (reset) {
            setBerita(newBerita);
          } else {
            setBerita((prev) => [...prev, ...newBerita]);
          }
          setHasMore(result.data.hasMore || false);
          setCursor(result.data.nextCursor || null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching berita (admin):', err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, cursor]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchBerita(false);
    }
  }, [loading, hasMore, fetchBerita]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchBerita(true);
  }, [fetchBerita]);

  useEffect(() => {
    if (initialLoad) {
      fetchBerita(true);
    }
  }, [initialLoad, fetchBerita]); // ✅ tambahkan dependencies di sini

  return {
    berita,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
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
export function useLatestBerita() {
  const [berita, setBerita] = useState<IBerita | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestBerita = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/berita?pageSize=1');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch latest berita');
        }

        if (result.success) {
          const latest = result.data.data && result.data.data.length > 0 ? result.data.data[0] : null;
          setBerita(latest);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching latest berita:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBerita();
  }, []);

  return { berita, loading, error };
}