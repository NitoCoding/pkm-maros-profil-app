// src/hooks/usePegawai.ts
import { useState, useEffect } from 'react';
import { IPegawai, IPegawaiPaginatedResponse } from '@/types/pegawai';

interface UsePegawaiOptions {
  pageSize?: number;
  initialLoad?: boolean;
}

interface UsePegawaiReturn {
  pegawai: IPegawai[];
  loading:  boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export function usePegawai({ pageSize = 10, initialLoad = true }: UsePegawaiOptions = {}): UsePegawaiReturn {
  const [pegawai, setPegawai] = useState<IPegawai[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchPegawai = async (reset = false) => {
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
        throw new Error(result.error || 'Failed to fetch pegawai');
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
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPegawai(false);
    }
  };

  const refresh = () => {
    setCursor(null);
    fetchPegawai(true);
  };

  useEffect(() => {
    if (initialLoad) {
      fetchPegawai(true);
    }
  }, []);

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