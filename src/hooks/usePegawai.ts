import { useState, useEffect } from 'react';
import { IPegawai } from '@/types/pegawai';

interface UsePegawaiOptions {
  pageSize?: number;
}

interface UsePegawaiReturn {
  pegawai: IPegawai[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export function usePegawai({ pageSize = 10 }: UsePegawaiOptions = {}): UsePegawaiReturn {
  const [pegawai, setPegawai] = useState<IPegawai[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchPegawai = async (isRefresh = false, cursor: any = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      });

      if (cursor && !isRefresh) {
        params.set('cursor', JSON.stringify(cursor));
      }

      const response = await fetch(`/api/pegawai?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch pegawai');
      }

      if (result.success) {
        const { data, lastDoc, hasMore } = result.data;
        
        if (isRefresh) {
          setPegawai(data);
        } else if (cursor) {
          setPegawai(prev => [...prev, ...data]);
        } else {
          setPegawai(data);
        }

        setLastDoc(lastDoc);
        setHasMore(hasMore);
      } else {
        throw new Error(result.error || 'Failed to fetch pegawai');
      }
    } catch (err: any) {
      console.error('Error fetching pegawai:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setLastDoc(null);
    fetchPegawai(true);
  };

  const loadMore = () => {
    if (hasMore && !loading && lastDoc) {
      fetchPegawai(false, lastDoc);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, [pageSize]);

  return {
    pegawai,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
} 