"use client";
import { useState, useEffect } from 'react';
import { getCacheInfo, clearAllStaticCaches, forceRefreshAllCaches } from '@/libs/utils/staticCache';

export default function CacheDebugger() {
	const [cacheInfo, setCacheInfo] = useState<any>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Only show in development
		if (process.env.NODE_ENV === 'development') {
			setIsVisible(true);
		}
	}, []);

	const refreshCacheInfo = () => {
		const info = getCacheInfo();
		setCacheInfo(info);
	};

	const handleClearAll = () => {
		clearAllStaticCaches();
		refreshCacheInfo();
	};

	const handleForceRefresh = () => {
		forceRefreshAllCaches();
		refreshCacheInfo();
	};

	useEffect(() => {
		refreshCacheInfo();
	}, []);

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-sm font-bold text-gray-800">Cache Debugger</h3>
				<button
					onClick={() => setIsVisible(false)}
					className="text-gray-500 hover:text-gray-700"
				>
					×
				</button>
			</div>

			<div className="space-y-2 mb-3">
				{cacheInfo && Object.entries(cacheInfo).map(([type, info]: [string, any]) => (
					<div key={type} className="text-xs">
						<div className="flex justify-between">
							<span className="font-medium">{type}:</span>
							<span className={info.exists ? 'text-green-600' : 'text-red-600'}>
								{info.exists ? '✓' : '✗'}
							</span>
						</div>
						{info.exists && !info.corrupted && (
							<div className="text-gray-600 ml-2">
								Age: {info.age}s | {info.timestamp}
							</div>
						)}
						{info.corrupted && (
							<div className="text-red-600 ml-2">Corrupted</div>
						)}
					</div>
				))}
			</div>

			<div className="flex space-x-2">
				<button
					onClick={refreshCacheInfo}
					className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
				>
					Refresh
				</button>
				<button
					onClick={handleClearAll}
					className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
				>
					Clear All
				</button>
				<button
					onClick={handleForceRefresh}
					className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
				>
					Force Refresh
				</button>
			</div>
		</div>
	);
} 