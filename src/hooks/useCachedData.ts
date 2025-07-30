import { useState, useEffect } from 'react';

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

	const config = CACHE_CONFIG[type];

	// Load from cache
	const loadFromCache = (): T | null => {
		try {
			if (typeof window === 'undefined') return null;
			
			const cached = localStorage.getItem(config.key);
			if (!cached) return null;

			const parsed: CachedData = JSON.parse(cached);
			const now = Date.now();

			// Check if cache is still valid
			if (now - parsed.timestamp < config.duration) {
				console.log(`[${type}] Loading from cache, age: ${Math.round((now - parsed.timestamp) / 1000)}s`);
				return parsed.data;
			}

			// Remove expired cache
			console.log(`[${type}] Cache expired, removing...`);
			localStorage.removeItem(config.key);
			return null;
		} catch (error) {
			console.error(`Error loading ${type} from cache:`, error);
			return null;
		}
	};

	// Save to cache
	const saveToCache = (data: T) => {
		try {
			if (typeof window === 'undefined') return;

			const cacheData: CachedData = {
				data,
				timestamp: Date.now(),
			};

			localStorage.setItem(config.key, JSON.stringify(cacheData));
			console.log(`[${type}] Data saved to cache`);
		} catch (error) {
			console.error(`Error saving ${type} to cache:`, error);
		}
	};

	// Clear cache
	const clearCache = () => {
		try {
			if (typeof window === 'undefined') return;
			localStorage.removeItem(config.key);
			console.log(`[${type}] Cache cleared`);
		} catch (error) {
			console.error(`Error clearing ${type} cache:`, error);
		}
	};

	// Fetch fresh data
	const fetchFreshData = async () => {
		try {
			setLoading(true);
			setError(null);
			setIsFromCache(false);

			console.log(`[${type}] Fetching fresh data...`);
			const freshData = await fetchFunction();
			console.log(`[${type}] Fresh data received:`, freshData);
			
			setData(freshData);
			saveToCache(freshData);
		} catch (err: any) {
			console.error(`[${type}] Error fetching data:`, err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Force refresh
	const forceRefresh = async () => {
		console.log(`[${type}] Force refreshing...`);
		clearCache();
		await fetchFreshData();
	};

	useEffect(() => {
		const initializeData = async () => {
			// Try to load from cache first
			const cached = loadFromCache();
			
			if (cached) {
				console.log(`[${type}] Using cached data`);
				setData(cached);
				setIsFromCache(true);
				setLoading(false);
			} else {
				// No cache available, fetch fresh data
				console.log(`[${type}] No cache available, fetching fresh data`);
				await fetchFreshData();
			}
		};

		initializeData();
	}, []);

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
	// Fetch hero data from dashboard API
	const fetchHeroData = async () => {
		try {
			console.log('[HERO] Fetching from /api/dashboard...');
			const response = await fetch('/api/dashboard');
			const result = await response.json();

			console.log('[HERO] API Response:', result);

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch hero data');
			}

			if (result.success && result.data?.hero) {
				const heroData = {
					image: result.data.hero.image || '',
					title: result.data.hero.title || 'Selamat Datang Di Website Kelurahan Bilokka',
					subtitle: result.data.hero.subtitle || 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'
				};
				console.log('[HERO] Processed hero data:', heroData);
				return heroData;
			} else {
				// Fallback data if no hero info found
				console.log('[HERO] No hero data found, using fallback');
				return {
					image: '',
					title: 'Selamat Datang Di Website Kelurahan Bilokka',
					subtitle: 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'
				};
			}
		} catch (error) {
			console.error('[HERO] Error fetching hero data:', error);
			// Return fallback data on error
			return {
				image: '',
				title: 'Selamat Datang Di Website Kelurahan Bilokka',
				subtitle: 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'
			};
		}
	};

	const fallbackData = {
		image: '',
		title: 'Selamat Datang Di Website Kelurahan Bilokka',
		subtitle: 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'
	};
	
	return useCachedData(
		'HERO',
		fetchHeroData,
		fallbackData
	);
}

export function useSambutanCached() {
	// Fetch sambutan data from dashboard API
	const fetchSambutanData = async () => {
		try {
			console.log('[SAMBUTAN] Fetching from /api/dashboard...');
			const response = await fetch('/api/dashboard');
			const result = await response.json();

			console.log('[SAMBUTAN] API Response:', result);

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch sambutan data');
			}

			if (result.success && result.data?.sambutan) {
				const sambutanData = {
					judul: result.data.sambutan.judul || 'Sambutan Lurah',
					isi: result.data.sambutan.isi || 'Selamat datang di website resmi Kelurahan Bilokka...',
					gambar: result.data.sambutan.gambar || ''
				};
				console.log('[SAMBUTAN] Processed sambutan data:', sambutanData);
				return sambutanData;
			} else {
				// Fallback data if no sambutan found
				console.log('[SAMBUTAN] No sambutan data found, using fallback');
				return {
					judul: 'Sambutan Lurah',
					isi: 'Selamat datang di website resmi Kelurahan Bilokka. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
					gambar: ''
				};
			}
		} catch (error) {
			console.error('[SAMBUTAN] Error fetching sambutan data:', error);
			// Return fallback data on error
			return {
				judul: 'Sambutan Lurah',
				isi: 'Selamat datang di website resmi Kelurahan Bilokka. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
				gambar: ''
			};
		}
	};

	const fallbackData = {
		judul: 'Sambutan Lurah',
		isi: 'Selamat datang di website resmi Kelurahan Bilokka. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
		gambar: ''
	};
	
	return useCachedData(
		'SAMBUTAN',
		fetchSambutanData,
		fallbackData
	);
}

export function useFooterCached() {
	// Fetch footer data from dashboard API
	const fetchFooterData = async () => {
		try {
			console.log('[FOOTER] Fetching from /api/dashboard...');
			const response = await fetch('/api/dashboard');
			const result = await response.json();

			console.log('[FOOTER] API Response:', result);

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch footer data');
			}

			if (result.success && result.data?.contact) {
				const footerData = {
					alamat: result.data.contact.address || 'Bilokka, Kec. Panca Lautang, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91672',
					telepon: result.data.contact.phone || '031 3970961',
					email: result.data.contact.email || '',
					jamKerja: result.data.workingHours?.hours || 'Senin - Jumat: 08.00 - 15.00',
					sosialMedia: {
						facebook: result.data.contact.facebook || '',
						instagram: result.data.contact.instagram || '',
						youtube: result.data.contact.youtube || ''
					}
				};
				console.log('[FOOTER] Processed footer data:', footerData);
				return footerData;
			} else {
				// Fallback data if no contact info found
				console.log('[FOOTER] No footer data found, using fallback');
				return {
					alamat: 'Bilokka, Kec. Panca Lautang, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91672',
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
				alamat: 'Bilokka, Kec. Panca Lautang, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91672',
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
	};

	const fallbackData = {
		alamat: 'Bilokka, Kec. Panca Lautang, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91672',
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