// Cache utility for managing localStorage cache
export interface CacheItem<T> {
	data: T;
	timestamp: number;
	expiry: number;
}

export class CacheManager {
	private static instance: CacheManager;
	private cache: Map<string, CacheItem<any>> = new Map();

	private constructor() {}

	static getInstance(): CacheManager {
		if (!CacheManager.instance) {
			CacheManager.instance = new CacheManager();
		}
		return CacheManager.instance;
	}

	// Set cache item
	set<T>(key: string, data: T, expiryMinutes: number = 5): void {
		try {
			if (typeof window === 'undefined') return;

			const cacheItem: CacheItem<T> = {
				data,
				timestamp: Date.now(),
				expiry: expiryMinutes * 60 * 1000,
			};

			// Save to memory cache
			this.cache.set(key, cacheItem);

			// Save to localStorage
			localStorage.setItem(key, JSON.stringify(cacheItem));
		} catch (error) {
			console.error('Error setting cache:', error);
		}
	}

	// Get cache item
	get<T>(key: string): T | null {
		try {
			if (typeof window === 'undefined') return null;

			// Try memory cache first
			const memoryItem = this.cache.get(key);
			if (memoryItem && this.isValid(memoryItem)) {
				return memoryItem.data;
			}

			// Try localStorage
			const stored = localStorage.getItem(key);
			if (!stored) return null;

			const cacheItem: CacheItem<T> = JSON.parse(stored);
			
			if (this.isValid(cacheItem)) {
				// Update memory cache
				this.cache.set(key, cacheItem);
				return cacheItem.data;
			}

			// Remove expired cache
			this.remove(key);
			return null;
		} catch (error) {
			console.error('Error getting cache:', error);
			return null;
		}
	}

	// Check if cache is valid
	private isValid<T>(item: CacheItem<T>): boolean {
		const now = Date.now();
		return (now - item.timestamp) < item.expiry;
	}

	// Remove cache item
	remove(key: string): void {
		try {
			if (typeof window === 'undefined') return;

			// Remove from memory cache
			this.cache.delete(key);

			// Remove from localStorage
			localStorage.removeItem(key);
		} catch (error) {
			console.error('Error removing cache:', error);
		}
	}

	// Clear all cache
	clear(): void {
		try {
			if (typeof window === 'undefined') return;

			// Clear memory cache
			this.cache.clear();

			// Clear localStorage (only cache keys)
			const keys = Object.keys(localStorage);
			keys.forEach(key => {
				if (key.startsWith('cache_')) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.error('Error clearing cache:', error);
		}
	}

	// Get cache info
	getInfo(key: string): { exists: boolean; age: number; valid: boolean } | null {
		try {
			if (typeof window === 'undefined') return null;

			const stored = localStorage.getItem(key);
			if (!stored) return null;

			const cacheItem: CacheItem<any> = JSON.parse(stored);
			const now = Date.now();
			const age = now - cacheItem.timestamp;
			const valid = age < cacheItem.expiry;

			return {
				exists: true,
				age,
				valid,
			};
		} catch (error) {
			console.error('Error getting cache info:', error);
			return null;
		}
	}
}

// Convenience functions
export const cacheManager = CacheManager.getInstance();

// Cache keys
export const CACHE_KEYS = {
	HERO: 'cache_hero',
	DASHBOARD: 'cache_dashboard',
	PROFIL: 'cache_profil',
	BERITA: 'cache_berita',
	GALERI: 'cache_galeri',
} as const;

// Predefined cache functions
export const heroCache = {
	set: (data: any) => cacheManager.set(CACHE_KEYS.HERO, data, 5), // 5 minutes
	get: () => cacheManager.get(CACHE_KEYS.HERO),
	remove: () => cacheManager.remove(CACHE_KEYS.HERO),
	info: () => cacheManager.getInfo(CACHE_KEYS.HERO),
};

export const dashboardCache = {
	set: (data: any) => cacheManager.set(CACHE_KEYS.DASHBOARD, data, 10), // 10 minutes
	get: () => cacheManager.get(CACHE_KEYS.DASHBOARD),
	remove: () => cacheManager.remove(CACHE_KEYS.DASHBOARD),
	info: () => cacheManager.getInfo(CACHE_KEYS.DASHBOARD),
}; 