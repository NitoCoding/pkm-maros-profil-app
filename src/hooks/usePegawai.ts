// src/hooks/usePegawai.ts
import { useState, useEffect, useCallback } from 'react';
import { IPegawai } from '@/types/pegawai';

interface UsePegawaiOptions {
  pageSize?: number;
  initialLoad?: boolean;
}

interface UsePegawaiReturn {
  pegawai: IPegawai[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export function usePegawai(
  { pageSize = 10, initialLoad = true }: UsePegawaiOptions = {}
): UsePegawaiReturn {
  const [pegawai, setPegawai] = useState<IPegawai[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchPegawai = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      });

      if (!reset && cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/pegawai?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memuat data pegawai');
      }

      if (result.success) {
        const newPegawai = result.data.data || [];

        if (reset) {
          setPegawai(newPegawai);
        } else {
          setPegawai((prev) => [...prev, ...newPegawai]);
        }

        setHasMore(result.data.hasMore || false);
        setCursor(result.data.nextCursor || null);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching pegawai:', err);
    } finally {
      setLoading(false);
    }
  }, [cursor, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPegawai(false);
    }
  }, [loading, hasMore, fetchPegawai]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchPegawai(true);
  }, [fetchPegawai]);

  useEffect(() => {
    if (initialLoad) {
      fetchPegawai(true);
    }
  }, [initialLoad, fetchPegawai]);

  return {
    pegawai,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}

// Hook untuk single pegawai by id
export function usePegawaiById(id: number) {
  const [pegawai, setPegawai] = useState<IPegawai | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPegawai = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/pegawai?id=${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Pegawai tidak ditemukan');
        }

        if (result.success) {
          setPegawai(result.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching pegawai by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPegawai();
  }, [id]);

  return { pegawai, loading, error };
}

export function usePegawaiBeranda() {
  const { pegawai, loading, error, refresh } = usePegawai({ pageSize: 4 });

  const pegawaiUntukBeranda = pegawai
    .filter(p => p.tampilkanDiBeranda && p.urutanBeranda !== null)
    .sort((a, b) => (a.urutanBeranda || 0) - (b.urutanBeranda || 0))
    .slice(0, 4);

  return {
    pegawai: pegawaiUntukBeranda,
    loading,
    error,
    refresh,
  };
}

export function usePegawaiProfil() {
  const base = usePegawai();

  // Urutkan alfabet atau by createdAt
  const pegawaiUrut = [...base.pegawai].sort((a, b) =>
    a.nama.localeCompare(b.nama)
  );

  return {
    ...base,
    pegawai: pegawaiUrut,
  };
}