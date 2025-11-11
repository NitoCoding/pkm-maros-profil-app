import { useState, useEffect, useCallback } from 'react';
import { useHero } from './useDashboard';

// Cache configuration
const CACHE_KEY = 'hero_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: any;
  timestamp: number;
}

export function useHeroCached() {
  const { hero, loading, error, refresh } = useHero();
  const [cachedHero, setCachedHero] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  // ✅ UseCallback agar fungsi tidak berubah setiap render
  const loadFromCache = useCallback((): CachedData | null => {
    try {
      if (typeof window === 'undefined') return null;

      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedData = JSON.parse(cached);
      const now = Date.now();

      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }

      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }, []);

  const saveToCache = useCallback((data: any) => {
    try {
      if (typeof window === 'undefined') return;

      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  // ✅ Efek utama: muat cache dulu, baru fallback ke data fresh
  useEffect(() => {
    const cached = loadFromCache();

    if (cached) {
      setCachedHero(cached.data);
      setIsFromCache(true);
      setIsLoading(false);
    } else if (hero && !loading) {
      setCachedHero(hero);
      setIsFromCache(false);
      setIsLoading(false);
      saveToCache(hero);
    }
  }, [hero, loading, loadFromCache, saveToCache]);

  // ✅ Force refresh: hapus cache & ambil ulang
  const forceRefresh = useCallback(async () => {
    clearCache();
    setIsLoading(true);
    setIsFromCache(false);
    await refresh();
  }, [clearCache, refresh]);

  return {
    hero: cachedHero || hero,
    loading: isLoading || loading,
    error,
    isFromCache,
    refresh: forceRefresh,
    clearCache,
  };
}
