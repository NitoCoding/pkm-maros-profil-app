// src/hooks/useCachedData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';

// Cache configuration untuk komponen statis
const CACHE_CONFIG = {
  HERO: {
    key: 'static_hero_cache',
    duration: 10 * 60 * 1000, // 10 menit
  },
  SAMBUTAN: {
    key: 'static_sambutan_cache',
    duration: 15 * 60 * 1000, // 15 menit
  },
  FOOTER: {
    key: 'static_footer_cache',
    duration: 30 * 60 * 1000, // 30 menit
    // Untuk testing, ubah ke 10 detik
    // duration: 10 * 1000, // 10 detik
    
    // duration: 1 * 60 * 1000, // 1 menit
  },
} as const;

interface CachedData {
  data: any;
  timestamp: number;
}

// Generic cached hook untuk komponen statis
export function useCachedData<T>(
  type: keyof typeof CACHE_CONFIG,
  fetchFunction: () => Promise<T>,
  fallbackData?: T
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const config = CACHE_CONFIG[type];

  const loadFromCache = useCallback((): T | null => {
    try {
      if (typeof window === 'undefined') return null;
      const cached = localStorage.getItem(config.key);
      if (!cached) return null;

      const parsed: CachedData = JSON.parse(cached);
      const now = Date.now();

      if (now - parsed.timestamp < config.duration) {
        // // console.log(`[${type}] Loading from cache, age: ${Math.round((now - parsed.timestamp) / 1000)}s`);
        return parsed.data;
      }

      // // console.log(`[${type}] Cache expired, removing...`);
      localStorage.removeItem(config.key);
      return null;
    } catch (error) {
      console.error(`Error loading ${type} from cache:`, error);
      return null;
    }
  }, [config.key, config.duration]); // type dihapus

  const saveToCache = useCallback((data: T) => {
    try {
      if (typeof window === 'undefined') return;
      const cacheData: CachedData = { data, timestamp: Date.now() };
      localStorage.setItem(config.key, JSON.stringify(cacheData));
      // // console.log(`[${type}] Data saved to cache`);
    } catch (error) {
      console.error(`Error saving ${type} to cache:`, error);
    }
  }, [config.key]); // type dihapus

  const fetchFreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      // // console.log(`[${type}] Fetching fresh data...`);
      const freshData = await fetchFunction();
      setData(freshData);
      saveToCache(freshData);
    } catch (err: any) {
      console.error(`[${type}] Error fetching data:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, saveToCache]); // type dihapus

  const clearCache = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(config.key);
      // console.log(`[${type}] Cache cleared`);
    } catch (error) {
      console.error(`Error clearing ${type} cache:`, error);
    }
  }, [config.key]); // type dihapus

  const forceRefresh = useCallback(async () => {
    // console.log(`[${type}] Force refreshing...`);
    clearCache();
    await fetchFreshData();
  }, [clearCache, fetchFreshData]); // type dihapus

  useEffect(() => {
    // Hanya jalankan sekali saat komponen dimount
    if (initialized) return;
    
    const initializeData = async () => {
      const cached = loadFromCache();
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        setLoading(false);
        // Hanya refresh di background jika data sudah ada di cache lebih dari 5 menit
        const cacheAge = Date.now() - JSON.parse(localStorage.getItem(config.key) || '{}').timestamp;
        if (cacheAge > 5 * 60 * 1000) {
          fetchFreshData(); // refresh di background
        }
      } else {
        await fetchFreshData();
      }
      setInitialized(true);
    };
    
    initializeData();
  }, [initialized, loadFromCache, fetchFreshData, config.key]); // type dihapus

  return {
    data: data || fallbackData,
    loading,
    error,
    isFromCache,
    refresh: forceRefresh,
    clearCache,
  };
}

// Specialized hooks for specific components
export function useHeroCached() {
  // Memoize fetchHeroData to prevent unnecessary re-renders
  const fetchHeroData = useMemo(() => async () => {
    try {
      // console.log('[HERO] Fetching from /api/public/dashboard...');
      const response = await fetch('/api/public/dashboard');
      const result = await response.json();

      // console.log('[HERO] API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch hero data');
      }

      // console.log('[HERO] Response OK', response.ok);
      // console.log('[HERO] Result success', result.success);
      // console.log('[HERO] Result data', result.data);
      // console.log('[HERO] Result data hero', result.data?.hero);
      // console.log('[HERO] Result hero', result.hero);

      if (result.success && result.data?.hero) {
        const heroData = {
          image: result.data.hero.image || '',
          title: result.data.hero.title || 'Selamat Datang Di Website Desa Benteng Gajah',
          subtitle: result.data.hero.subtitle || 'Desa Benteng Gajah, Kecamatan Panca Lautang, Kabupaten Sidrap'
        };
        // console.log('[HERO] Processed hero data:', heroData);
        return heroData;
      } else {
        // Fallback data if no hero info found
        // console.log('[HERO] No hero data found, using fallback');
        return {
          image: '',
          title: 'Selamat Datang Di Website Desa Benteng Gajah',
          subtitle: 'Desa Benteng Gajah, Kecamatan Panca Lautang, Kabupaten Sidrap'
        };
      }
    } catch (error) {
      console.error('[HERO] Error fetching hero data:', error);
      // Return fallback data on error
      return {
        image: '',
        title: 'Selamat Datang Di Website Desa Benteng Gajah',
        subtitle: 'Desa Benteng Gajah, Kecamatan Panca Lautang, Kabupaten Sidrap'
      };
    }
  }, []);

  const fallbackData = {
    image: '',
    title: 'Selamat Datang Di Website Desa Benteng Gajah',
    subtitle: 'Desa Benteng Gajah, Kecamatan Panca Lautang, Kabupaten Sidrap'
  };

  return useCachedData(
    'HERO',
    fetchHeroData,
    fallbackData
  );
}

export function useSambutanCached() {
  // Memoize fetchSambutanData to prevent unnecessary re-renders
  const fetchSambutanData = useMemo(() => async () => {
    try {
      // Fetch sambutan from profil API
      const profilResponse = await fetch('/api/profil?jenis=sambutan');
      const profilResult = await profilResponse.json();

      // Fetch lurah info from public dashboard API
      const dashboardResponse = await fetch('/api/public/dashboard');
      const dashboardResult = await dashboardResponse.json();

      // Combine data
      let sambutanData = {
        judul: 'Sambutan Lurah',
        isi: 'Selamat datang di website resmi Desa Benteng Gajah. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
        gambar: ''
      };

      if (profilResult.success && profilResult.data) {
        sambutanData.judul = profilResult.data.judul || sambutanData.judul;
        sambutanData.isi = profilResult.data.isi || sambutanData.isi;
        sambutanData.gambar = profilResult.data.gambar || sambutanData.gambar;
      }

      if (dashboardResult.success && dashboardResult.data?.lurah?.photo) {
        sambutanData.gambar = dashboardResult.data.lurah.photo || sambutanData.gambar;
      }

      return sambutanData;
    } catch (error) {
      console.error('[SAMBUTAN] Error fetching sambutan data:', error);
      // Return fallback data on error
      return {
        judul: 'Sambutan Lurah',
        isi: 'Selamat datang di website resmi Desa Benteng Gajah. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
        gambar: ''
      };
    }
  }, []);

  const fallbackData = {
    judul: 'Sambutan Lurah',
    isi: 'Selamat datang di website resmi Desa Benteng Gajah. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
    gambar: ''
  };

  return useCachedData(
    'SAMBUTAN',
    fetchSambutanData,
    fallbackData
  );
}

export function useFooterCached() {
  // Memoize fetchFooterData to prevent unnecessary re-renders
  const fetchFooterData = useMemo(() => async () => {
    try {
      // console.log('[FOOTER] Fetching from /api/public/dashboard...');
      const response = await fetch('/api/public/dashboard');
      const result = await response.json();

      // console.log('[FOOTER] API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch footer data');
      }

      if (result.success && result.data?.contact) {
        const footerData = {
          alamat: result.data.contact.address || 'Contoh Alamat',
          telepon: result.data.contact.phone || '031 3970961',
          email: result.data.contact.email || '',
          jamKerja: result.data.workingHours?.hours || 'Senin - Jumat: 08.00 - 15.00',
          sosialMedia: {
            facebook: result.data.contact.facebook || '',
            instagram: result.data.contact.instagram || '',
            youtube: result.data.contact.youtube || ''
          }
        };
        // console.log('[FOOTER] Processed footer data:', footerData);
        return footerData;
      } else {
        // Fallback data if no contact info found
        // console.log('[FOOTER] No footer data found, using fallback');
        return {
          alamat: 'Contoh Alamat',
          telepon: '031 3970961',
          email: '',
          jamKerja: 'Senin - Jumat: 08.00 - 15.00',
          sosialMedia: {
            facebook: '',
            instagram: '',
            youtube: ''
          }
        };
      }
    } catch (error) {
      console.error('[FOOTER] Error fetching footer data:', error);
      // Return fallback data on error
      return {
        alamat: 'Contoh Alamat',
        telepon: '031 3970961',
        email: '',
        jamKerja: 'Senin - Jumat: 08.00 - 15.00',
        sosialMedia: {
          facebook: '',
          instagram: '',
          youtube: ''
        }
      };
    }
  }, []);

  const fallbackData = {
    alamat: 'Contoh Alamat',
    telepon: '031 3970961',
    email: '',
    jamKerja: 'Senin - Jumat: 08.00 - 15.00',
    sosialMedia: {
      facebook: '',
      instagram: '',
      youtube: ''
    }
  };
  
  return useCachedData(
    'FOOTER',
    fetchFooterData,
    fallbackData
  );
}