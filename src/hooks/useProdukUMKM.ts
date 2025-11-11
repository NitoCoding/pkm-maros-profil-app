import { useState, useEffect, useCallback } from 'react';
import { IProdukUMKM } from '@/types/umkm';

interface UseProdukUMKMOptions {
  pageSize?: number;
  initialLoad?: boolean;
}

interface UseProdukUMKMReturn {
  umkm: IProdukUMKM[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export function useProdukUMKM(
  { pageSize = 10, initialLoad = true }: UseProdukUMKMOptions = {}
): UseProdukUMKMReturn {
  const [umkm, setUmkm] = useState<IProdukUMKM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // ✅ Bungkus fetch dengan useCallback agar stabil
  const fetchUmkm = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      });

      if (!reset && cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/produk-umkm?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch produk UMKM');
      }

      if (result.success) {
        const newUmkm = result.data.data || [];
        if (reset) {
          setUmkm(newUmkm);
        } else {
          setUmkm((prev) => [...prev, ...newUmkm]);
        }

        setHasMore(result.data.hasMore || false);
        setCursor(result.data.nextCursor || null);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching produk UMKM:', err);
    } finally {
      setLoading(false);
    }
  }, [cursor, pageSize]); // ✅ dependensi relevan saja

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchUmkm(false);
    }
  }, [loading, hasMore, fetchUmkm]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchUmkm(true);
  }, [fetchUmkm]);

  // ✅ Tambahkan fetchUmkm & initialLoad ke dependensi agar konsisten
  useEffect(() => {
    if (initialLoad) {
      fetchUmkm(true);
    }
  }, [initialLoad, fetchUmkm]);

  return {
    umkm,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}

// Hook untuk single produk by id
export function useProdukUMKMById(id: string) {
  const [umkm, setUmkm] = useState<IProdukUMKM | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUmkm = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/produk-umkm?id=${encodeURIComponent(id)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Produk tidak ditemukan');
        }

        if (result.success) {
          setUmkm(result.data); // PERBAIKAN: akses result.data langsung
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching produk by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUmkm();
  }, [id]);

  return { umkm, loading, error };
}

// Hook untuk produk terbaru (untuk homepage)
export function useLatestProdukUMKM(limit = 6) {
  const [umkm, setUmkm] = useState<IProdukUMKM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestUmkm = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/produk-umkm?pageSize=${limit}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch latest produk');
        }

        if (result.success) {
          setUmkm(result.data.data || []); // PERBAIKAN: akses result.data.data
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching latest produk:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUmkm();
  }, [limit]);

  return { umkm, loading, error };
}