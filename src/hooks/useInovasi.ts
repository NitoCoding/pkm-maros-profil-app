// src/hooks/useInovasi.ts
import { useState, useEffect, useCallback } from 'react';
import { IInovasi } from '@/types/inovasi';

interface UseInovasiResult {
  inovasi: IInovasi[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface UseInovasiOptions {
  pageSize?: number;
  initialLoad?: boolean;
  kategori?: string;
  tahun?: number;
}

export function useInovasi(options: UseInovasiOptions = {}): UseInovasiResult {
  const { pageSize = 10, initialLoad = true, kategori, tahun } = options;
  const [inovasi, setInovasi] = useState<IInovasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchInovasi = useCallback(
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

        if (kategori) {
          params.append('kategori', kategori);
        }

        if (tahun) {
          params.append('tahun', tahun.toString());
        }

        const response = await fetch(`/api/inovasi?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch inovasi');
        }

        if (result.success) {
          const newInovasi = result.data.data || [];
          if (reset) {
            setInovasi(newInovasi);
          } else {
            setInovasi((prev) => [...prev, ...newInovasi]);
          }
          setHasMore(result.data.hasMore || false);
          setCursor(result.data.nextCursor || null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching inovasi:', err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, cursor, kategori, tahun]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchInovasi(false);
    }
  }, [loading, hasMore, fetchInovasi]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchInovasi(true);
  }, [fetchInovasi]);

  useEffect(() => {
    if (initialLoad) {
      fetchInovasi(true);
    }
  }, [initialLoad, fetchInovasi]);

  return {
    inovasi,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

export function useInovasiAdmin(options: UseInovasiOptions = {}): UseInovasiResult {
  const { pageSize = 10, initialLoad = true, kategori, tahun } = options;
  const [inovasi, setInovasi] = useState<IInovasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchInovasi = useCallback(
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

        if (kategori) {
          params.append('kategori', kategori);
        }

        if (tahun) {
          params.append('tahun', tahun.toString());
        }

        const response = await fetch(`/api/inovasi?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch inovasi');
        }

        if (result.success) {
          const newInovasi = result.data.data || [];
          if (reset) {
            setInovasi(newInovasi);
          } else {
            setInovasi((prev) => [...prev, ...newInovasi]);
          }
          setHasMore(result.data.hasMore || false);
          setCursor(result.data.nextCursor || null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching inovasi (admin):', err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, cursor, kategori, tahun]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchInovasi(false);
    }
  }, [loading, hasMore, fetchInovasi]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchInovasi(true);
  }, [fetchInovasi]);

  useEffect(() => {
    if (initialLoad) {
      fetchInovasi(true);
    }
  }, [initialLoad, fetchInovasi]);

  return {
    inovasi,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

export function useInovasiById(id: string) {
  const [inovasi, setInovasi] = useState<IInovasi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchInovasi = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/inovasi?id=${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Inovasi tidak ditemukan');
        }

        if (result.success) {
          setInovasi(result.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching inovasi by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInovasi();
  }, [id]);

  return {
    inovasi,
    loading,
    error,
  };
}

export function useInovasiBySlug(slug: string) {
  const [inovasi, setInovasi] = useState<IInovasi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchInovasi = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/inovasi?slug=${encodeURIComponent(slug)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Inovasi tidak ditemukan');
        }

        if (result.success) {
          setInovasi(result.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching inovasi by slug:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInovasi();
  }, [slug]);

  return { inovasi, loading, error };
}

export function useLatestInovasi(count: number = 3) {
  const [inovasi, setInovasi] = useState<IInovasi[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const fetchLatestInovasi = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/inovasi?pageSize=${count}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch latest inovasi');
        }

        const data = result.data?.data.slice(0, count) || [];
        setInovasi(data);
      } catch (err: any) {
        setError(err.message);
        setInovasi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestInovasi();
  }, [count]);

  return { inovasi, loading, error };
}

export function useInovasiKategori() {
  const [kategori, setKategori] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/inovasi/kategori');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch kategori');
        }

        if (result.success) {
          setKategori(result.data || []);
        }
      } catch (err: any) {
        setError(err.message);
        setKategori([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKategori();
  }, []);

  return { kategori, loading, error };
}