// src/hooks/useProdukUMKM.ts
import { useState, useEffect } from 'react';
import { IProdukUMKM, IProdukUMKMPaginatedResponse } from '@/types/umkm';

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

export function useProdukUMKM({ pageSize = 10, initialLoad = true }: UseProdukUMKMOptions = {}): UseProdukUMKMReturn {
  const [umkm, setUmkm] = useState<IProdukUMKM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchUmkm = async (reset = false) => {
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
        const newUmkm = result.data.data || []; // PERBAIKAN: akses result.data.data
        
        if (reset) {
          setUmkm(newUmkm);
        } else {
          setUmkm((prev) => [...prev, ...newUmkm]);
        }

        setHasMore(result.data.hasMore || false);
        setCursor(result.data.nextCursor || null); // PERBAIKAN: gunakan nextCursor
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching produk UMKM:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUmkm(false);
    }
  };

  const refresh = () => {
    setCursor(null);
    fetchUmkm(true);
  };

  useEffect(() => {
    if (initialLoad) {
      fetchUmkm(true);
    }
  }, []);

  return {
    umkm,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
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