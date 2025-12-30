// src/hooks/useWisata.ts
import { useState, useEffect, useCallback } from 'react';
import { IWisata } from '@/types/wisata-admin';

interface UseWisataResult {
  wisata: IWisata[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface UseWisataOptions {
  pageSize?: number;
  initialLoad?: boolean;
}

export function useWisata(options: UseWisataOptions = {}): UseWisataResult {
  const { pageSize = 10, initialLoad = true } = options;
  const [wisata, setWisata] = useState<IWisata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // ✅ Gunakan useCallback agar stabil dan bisa jadi dependency useEffect
  const fetchWisata = useCallback(
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

        const response = await fetch(`/api/wisata?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch wisata');
        }

        if (result.success) {
          const newWisata = result.data.data || [];
          if (reset) {
            setWisata(newWisata);
          } else {
            setWisata((prev) => [...prev, ...newWisata]);
          }
          setHasMore(result.data.hasMore || false);
          setCursor(result.data.nextCursor || null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching wisata:', err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, cursor] // dependency yang mempengaruhi fetch
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchWisata(false);
    }
  }, [loading, hasMore, fetchWisata]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchWisata(true);
  }, [fetchWisata]);

  // ✅ Masukkan fetchWisata dan initialLoad ke dependency array
  useEffect(() => {
    if (initialLoad) {
      fetchWisata(true);
    }
  }, [initialLoad, fetchWisata]);

  return {
    wisata,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// Hook untuk admin - dapat mengakses semua wisata
export function useWisataAdmin(options: UseWisataOptions = {}): UseWisataResult {
  const { pageSize = 10, initialLoad = true } = options;
  const [wisata, setWisata] = useState<IWisata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchWisata = useCallback(
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

        const response = await fetch(`/api/wisata?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch wisata');
        }

        if (result.success) {
          const newWisata = result.data.data || [];
          if (reset) {
            setWisata(newWisata);
          } else {
            setWisata((prev) => [...prev, ...newWisata]);
          }
          setHasMore(result.data.hasMore || false);
          setCursor(result.data.nextCursor || null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching wisata (admin):', err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, cursor]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchWisata(false);
    }
  }, [loading, hasMore, fetchWisata]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchWisata(true);
  }, [fetchWisata]);

  useEffect(() => {
    if (initialLoad) {
      fetchWisata(true);
    }
  }, [initialLoad, fetchWisata]);

  return {
    wisata,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

export function useWisataById(id: string) {
  const [wisata, setWisata] = useState<IWisata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchWisata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/wisata?id=${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Wisata tidak ditemukan');
        }

        if (result.success) {
          setWisata(result.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching wisata by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWisata();
  }, [id]);

  return {
    wisata,
    loading,
    error,
  };
}

export function useWisataBySlug(slug: string) {
  const [wisata, setWisata] = useState<IWisata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchWisata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/wisata?slug=${encodeURIComponent(slug)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Wisata tidak ditemukan');
        }

        if (result.success) {
          setWisata(result.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching wisata by slug:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWisata();
  }, [slug]);

  return { wisata, loading, error };
}

// Hook untuk mendapatkan wisata terbaru
export function useLatestWisata(count: number = 3) {
  const [wisata, setWisata] = useState<IWisata[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const fetchLatestWisata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/wisata?pageSize=${count}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch latest wisata');
        }

        const data = result.data?.data.slice(0, count) || [];
        setWisata(data);
      } catch (err: any) {
        setError(err.message);
        setWisata([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestWisata();
  }, [count]);

  return { wisata, loading, error };
}

// CRUD Operations untuk Admin
export async function createWisata(data: Partial<IWisata>): Promise<IWisata | null> {
  try {
    const response = await fetch('/api/wisata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // console.log(response);

    if (!response.ok) {
      throw new Error('Gagal menambah wisata');
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error creating wisata:', error);
    return null;
  }
}

export async function updateWisata(id: string, data: Partial<IWisata>): Promise<IWisata | null> {
  try {
    const response = await fetch('/api/wisata', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      throw new Error('Gagal memperbarui wisata');
    }

    // console.log(response);

    const result = await response.json();
    // console.log(result);
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error updating wisata:', error);
    return null;
  }
}

export async function deleteWisata(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/wisata?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Gagal menghapus wisata');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting wisata:', error);
    return false;
  }
}

export async function getWisataById(id: string): Promise<IWisata | null> {
  try {
    const response = await fetch(`/api/wisata?id=${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Gagal mengambil data wisata');
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching wisata by ID:', error);
    return null;
  }
}

export async function getWisataBySlug(slug: string): Promise<IWisata | null> {
  try {
    const response = await fetch(`/api/wisata?slug=${slug}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Gagal mengambil data wisata');
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching wisata by slug:', error);
    return null;
  }
}