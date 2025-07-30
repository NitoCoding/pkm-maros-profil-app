import { useState, useEffect } from 'react';
import { IUMKM } from '@/types/umkm';

interface UseUmkmOptions {
  pageSize?: number;
}

interface UseUmkmReturn {
  umkm: IUMKM[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

export function useUmkm({ pageSize = 10 }: UseUmkmOptions = {}): UseUmkmReturn {
  const [umkm, setUmkm] = useState<IUMKM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchUmkm = async (isRefresh = false, cursor: any = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      });

      if (cursor && !isRefresh) {
        params.set('cursor', JSON.stringify(cursor));
      }

      const response = await fetch(`/api/umkm?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch UMKM');
      }

      if (result.success) {
        const { data, lastDoc, hasMore } = result.data;
        
        if (isRefresh) {
          setUmkm(data);
        } else if (cursor) {
          setUmkm(prev => [...prev, ...data]);
        } else {
          setUmkm(data);
        }

        setLastDoc(lastDoc);
        setHasMore(hasMore);
      } else {
        throw new Error(result.error || 'Failed to fetch UMKM');
      }
    } catch (err: any) {
      console.error('Error fetching UMKM:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setLastDoc(null);
    fetchUmkm(true);
  };

  const loadMore = () => {
    if (hasMore && !loading && lastDoc) {
      fetchUmkm(false, lastDoc);
    }
  };

  useEffect(() => {
    fetchUmkm();
  }, [pageSize]);

  return {
    umkm,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
