"use client";
import Image from 'next/image';
import { useHeroCached } from '@/hooks/useHeroCached';
import { useState } from 'react';

export default function HeroOptimized() {
	const { hero, loading, error, isFromCache, refresh } = useHeroCached();
	const [imageLoaded, setImageLoaded] = useState(false);

	if (loading) {
		return (
			<div className='min-h-screen w-full mb-4 flex items-center justify-center bg-gray-100'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>
						{isFromCache ? 'Memuat dari cache...' : 'Memuat data hero...'}
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen w-full mb-4 flex items-center justify-center bg-gray-100'>
				<div className='text-center'>
					<p className='text-red-600 mb-4'>Gagal memuat data hero</p>
					<button 
						onClick={refresh}
						className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
					>
						Coba Lagi
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen w-full mb-4 relative' id='hero'>
			{/* Background Image with advanced optimization */}
			{hero?.image ? (
				<>
					{/* Blur placeholder */}
					{!imageLoaded && (
						<div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse'></div>
					)}
					
					<Image
						src={hero.image}
						alt={hero.title || 'Hero Image'}
						className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-500 ${
							imageLoaded ? 'opacity-100' : 'opacity-0'
						}`}
						width={1920}
						height={1080}
						priority
						placeholder="blur"
						blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageLoaded(true)}
						// Cache optimizations
						unoptimized={false}
						quality={85}
						sizes="100vw"
					/>
				</>
			) : (
				<div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600'></div>
			)}

			{/* Dark Overlay */}
			<div className='absolute inset-0 bg-black bg-opacity-40'></div>

			{/* Gradient Overlay */}
			<div className='absolute inset-0 bg-gradient-to-b from-transparent to-white from-85%'></div>

			{/* Content */}
			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10'>
				<div className='w-full max-w-4xl px-4'>
					<h1 className='font-bold mb-4 drop-shadow-xl tracking-wide'>
						<div className='text-3xl md:text-4xl lg:text-5xl mb-2'>
							{hero?.title || 'Selamat Datang Di Website Kelurahan Bilokka'}
						</div>
						<div className='text-lg md:text-xl lg:text-2xl opacity-90'>
							{hero?.subtitle || 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'}
						</div>
					</h1>
					
					{/* Cache indicator (optional, bisa dihapus) */}
					{isFromCache && (
						<div className='mt-4 text-xs opacity-75'>
							⚡ Data dari cache
						</div>
					)}
				</div>
			</div>
		</div>
	);
} 