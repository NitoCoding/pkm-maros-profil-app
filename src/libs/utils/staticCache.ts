// Cache utility khusus untuk komponen statis (hero, sambutan, footer)
export interface StaticCacheItem<T> {
	data: T;
	timestamp: number;
	expiry: number;
}

// Cache configuration untuk komponen statis
export const STATIC_CACHE_CONFIG = {
	HERO: {
		key: 'static_hero_cache',
		duration: 10 * 60 * 1000, // 10 menit
		description: 'Hero component data'
	},
	SAMBUTAN: {
		key: 'static_sambutan_cache',
		duration: 15 * 60 * 1000, // 15 menit
		description: 'Sambutan component data'
	},
	FOOTER: {
		key: 'static_footer_cache',
		duration: 30 * 60 * 1000, // 30 menit
		description: 'Footer component data'
	},
} as const;

export class StaticCacheManager {
	private static instance: StaticCacheManager;
	private cache: Map<string, StaticCacheItem<any>> = new Map();

	private constructor() {}

	static getInstance(): StaticCacheManager {
		if (!StaticCacheManager.instance) {
			StaticCacheManager.instance = new StaticCacheManager();
		}
		return StaticCacheManager.instance;
	}

	// Set cache untuk komponen statis
	setStaticCache<T>(
		type: keyof typeof STATIC_CACHE_CONFIG,
		data: T
	): void {
		try {
			if (typeof window === 'undefined') return;

			const config = STATIC_CACHE_CONFIG[type];
			const cacheItem: StaticCacheItem<T> = {
				data,
				timestamp: Date.now(),
				expiry: config.duration,
			};

			// Save to memory cache
			this.cache.set(config.key, cacheItem);

			// Save to localStorage
			localStorage.setItem(config.key, JSON.stringify(cacheItem));
			
			// console.log(`✅ ${config.description} cached for ${config.duration / 60000} minutes`);
		} catch (error) {
			console.error(`Error setting ${type} cache:`, error);
		}
	}

	// Get cache untuk komponen statis
	getStaticCache<T>(type: keyof typeof STATIC_CACHE_CONFIG): T | null {
		try {
			if (typeof window === 'undefined') return null;

			const config = STATIC_CACHE_CONFIG[type];

			// Try memory cache first
			const memoryItem = this.cache.get(config.key);
			if (memoryItem && this.isValid(memoryItem)) {
				// console.log(`⚡ ${config.description} loaded from memory cache`);
				return memoryItem.data;
			}

			// Try localStorage
			const stored = localStorage.getItem(config.key);
			if (!stored) return null;

			const cacheItem: StaticCacheItem<T> = JSON.parse(stored);
			
			if (this.isValid(cacheItem)) {
				// Update memory cache
				this.cache.set(config.key, cacheItem);
				// console.log(`⚡ ${config.description} loaded from localStorage cache`);
				return cacheItem.data;
			}

			// Remove expired cache
			this.removeStaticCache(type);
			return null;
		} catch (error) {
			console.error(`Error getting ${type} cache:`, error);
			return null;
		}
	}

	// Check if cache is valid
	private isValid<T>(item: StaticCacheItem<T>): boolean {
		const now = Date.now();
		return (now - item.timestamp) < item.expiry;
	}

	// Remove cache untuk komponen statis
	removeStaticCache(type: keyof typeof STATIC_CACHE_CONFIG): void {
		try {
			if (typeof window === 'undefined') return;

			const config = STATIC_CACHE_CONFIG[type];

			// Remove from memory cache
			this.cache.delete(config.key);

			// Remove from localStorage
			localStorage.removeItem(config.key);
			
			// console.log(`🗑️ ${config.description} cache cleared`);
		} catch (error) {
			console.error(`Error removing ${type} cache:`, error);
		}
	}

	// Clear all static cache
	clearAllStaticCache(): void {
		try {
			if (typeof window === 'undefined') return;

			// Clear memory cache
			this.cache.clear();

			// Clear localStorage (only static cache keys)
			Object.values(STATIC_CACHE_CONFIG).forEach(config => {
				localStorage.removeItem(config.key);
			});
			
			// console.log('🗑️ All static component cache cleared');
		} catch (error) {
			console.error('Error clearing static cache:', error);
		}
	}

	// Get cache info untuk komponen statis
	getStaticCacheInfo(type: keyof typeof STATIC_CACHE_CONFIG): {
		exists: boolean;
		age: number;
		valid: boolean;
		description: string;
	} | null {
		try {
			if (typeof window === 'undefined') return null;

			const config = STATIC_CACHE_CONFIG[type];
			const stored = localStorage.getItem(config.key);
			
			if (!stored) return null;

			const cacheItem: StaticCacheItem<any> = JSON.parse(stored);
			const now = Date.now();
			const age = now - cacheItem.timestamp;
			const valid = age < cacheItem.expiry;

			return {
				exists: true,
				age,
				valid,
				description: config.description,
			};
		} catch (error) {
			console.error(`Error getting ${type} cache info:`, error);
			return null;
		}
	}

	// Get all static cache info
	getAllStaticCacheInfo(): Record<string, any> {
		const info: Record<string, any> = {};
		
		Object.keys(STATIC_CACHE_CONFIG).forEach(type => {
			info[type] = this.getStaticCacheInfo(type as keyof typeof STATIC_CACHE_CONFIG);
		});
		
		return info;
	}

	// Preload cache untuk komponen statis
	async preloadStaticCache<T>(
		type: keyof typeof STATIC_CACHE_CONFIG,
		fetchFunction: () => Promise<T>
	): Promise<T | null> {
		try {
			// Check if cache exists and is valid
			const cached = this.getStaticCache<T>(type);
			if (cached) {
				return cached;
			}

			// Fetch fresh data
			const freshData = await fetchFunction();
			this.setStaticCache(type, freshData);
			return freshData;
		} catch (error) {
			console.error(`Error preloading ${type} cache:`, error);
			return null;
		}
	}
}

// Convenience functions
export const staticCacheManager = StaticCacheManager.getInstance();

// Predefined cache functions untuk komponen statis
export const heroStaticCache = {
	set: (data: any) => staticCacheManager.setStaticCache('HERO', data),
	get: () => staticCacheManager.getStaticCache('HERO'),
	remove: () => staticCacheManager.removeStaticCache('HERO'),
	info: () => staticCacheManager.getStaticCacheInfo('HERO'),
};

export const sambutanStaticCache = {
	set: (data: any) => staticCacheManager.setStaticCache('SAMBUTAN', data),
	get: () => staticCacheManager.getStaticCache('SAMBUTAN'),
	remove: () => staticCacheManager.removeStaticCache('SAMBUTAN'),
	info: () => staticCacheManager.getStaticCacheInfo('SAMBUTAN'),
};

export const footerStaticCache = {
	set: (data: any) => staticCacheManager.setStaticCache('FOOTER', data),
	get: () => staticCacheManager.getStaticCache('FOOTER'),
	remove: () => staticCacheManager.removeStaticCache('FOOTER'),
	info: () => staticCacheManager.getStaticCacheInfo('FOOTER'),
};

// Utility untuk debugging cache
export const debugStaticCache = () => {
	const info = staticCacheManager.getAllStaticCacheInfo();
	// console.log('📊 Static Cache Status:', info);
	return info;
};

// Utility untuk clear cache saat update data
export const clearStaticCacheOnUpdate = () => {
	staticCacheManager.clearAllStaticCache();
	// console.log('🔄 Static cache cleared due to data update');
}; 

// Utility functions for managing static cache

const CACHE_KEYS = {
	HERO: 'static_hero_cache',
	SAMBUTAN: 'static_sambutan_cache',
	FOOTER: 'static_footer_cache',
} as const;

/**
 * Clear specific cache by type
 */
export function clearSpecificCache(type: keyof typeof CACHE_KEYS) {
	try {
		if (typeof window === 'undefined') return;
		
		const key = CACHE_KEYS[type];
		localStorage.removeItem(key);
		// console.log(`[CACHE] Cleared ${type} cache`);
		
		return true;
	} catch (error) {
		console.error(`[CACHE] Error clearing ${type} cache:`, error);
		return false;
	}
}

/**
 * Clear all static caches
 */
export function clearAllStaticCaches() {
	try {
		if (typeof window === 'undefined') return;
		
		Object.values(CACHE_KEYS).forEach(key => {
			localStorage.removeItem(key);
		});
		
		// console.log('[CACHE] All static caches cleared');
		return true;
	} catch (error) {
		console.error('[CACHE] Error clearing all caches:', error);
		return false;
	}
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo() {
	try {
		if (typeof window === 'undefined') return null;
		
		const info: Record<string, any> = {};
		
		Object.entries(CACHE_KEYS).forEach(([type, key]) => {
			const cached = localStorage.getItem(key);
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					const age = Date.now() - parsed.timestamp;
					info[type] = {
						exists: true,
						age: Math.round(age / 1000), // seconds
						data: parsed.data,
						timestamp: new Date(parsed.timestamp).toLocaleString()
					};
				} catch (e) {
					info[type] = { exists: true, corrupted: true };
				}
			} else {
				info[type] = { exists: false };
			}
		});
		
		return info;
	} catch (error) {
		console.error('[CACHE] Error getting cache info:', error);
		return null;
	}
}

/**
 * Force refresh all caches by clearing them
 * This will cause components to fetch fresh data on next render
 */
export function forceRefreshAllCaches() {
	const success = clearAllStaticCaches();
	if (success) {
		// Optionally trigger a page reload to force fresh data fetch
		// window.location.reload();
		// console.log('[CACHE] All caches cleared. Components will fetch fresh data on next render.');
	}
	return success;
}

/**
 * Clear cache and reload page (for admin use)
 */
export function clearCacheAndReload() {
	clearAllStaticCaches();
	window.location.reload();
}

/**
 * Check if cache is valid for a specific type
 */
export function isCacheValid(type: keyof typeof CACHE_KEYS, maxAge: number = 10 * 60 * 1000) {
	try {
		if (typeof window === 'undefined') return false;
		
		const key = CACHE_KEYS[type];
		const cached = localStorage.getItem(key);
		
		if (!cached) return false;
		
		const parsed = JSON.parse(cached);
		const age = Date.now() - parsed.timestamp;
		
		return age < maxAge;
	} catch (error) {
		console.error(`[CACHE] Error checking cache validity for ${type}:`, error);
		return false;
	}
}

// Export cache keys for external use
export { CACHE_KEYS }; 