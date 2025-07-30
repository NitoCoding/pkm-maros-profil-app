import { useState, useEffect } from 'react';
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

	// Load from localStorage cache
	const loadFromCache = (): CachedData | null => {
		try {
			if (typeof window === 'undefined') return null;
			
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;

			const parsed: CachedData = JSON.parse(cached);
			const now = Date.now();

			// Check if cache is still valid
			if (now - parsed.timestamp < CACHE_DURATION) {
				return parsed;
			}

			// Remove expired cache
			localStorage.removeItem(CACHE_KEY);
			return null;
		} catch (error) {
			console.error('Error loading from cache:', error);
			return null;
		}
	};

	// Save to localStorage cache
	const saveToCache = (data: any) => {
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
	};

	// Clear cache
	const clearCache = () => {
		try {
			if (typeof window === 'undefined') return;
			localStorage.removeItem(CACHE_KEY);
		} catch (error) {
			console.error('Error clearing cache:', error);
		}
	};

	useEffect(() => {
		// Try to load from cache first
		const cached = loadFromCache();
		
		if (cached) {
			setCachedHero(cached.data);
			setIsFromCache(true);
			setIsLoading(false);
		} else if (hero && !loading) {
			// No cache available, use fresh data
			setCachedHero(hero);
			setIsFromCache(false);
			setIsLoading(false);
			// Save to cache for next time
			saveToCache(hero);
		}
	}, [hero, loading]);

	// Force refresh (clears cache and fetches fresh data)
	const forceRefresh = async () => {
		clearCache();
		setIsLoading(true);
		setIsFromCache(false);
		await refresh();
	};

	return {
		hero: cachedHero || hero,
		loading: isLoading || loading,
		error,
		isFromCache,
		refresh: forceRefresh,
		clearCache,
	};
} 