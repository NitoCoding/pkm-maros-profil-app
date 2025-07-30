"use client";
import Image from 'next/image';
import { useHeroCached } from '@/hooks/useCachedData';
import { useState } from 'react';

export default function HeroCached() {
	const { data: hero, loading, error, isFromCache, refresh } = useHeroCached();
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
		<div className='min-h-screen w-full mb-4' id='hero'>
			{/* Background Image */}
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
						quality={85}
						sizes="100vw"
					/>
				</>
			) : (
				<div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600'></div>
			)}

			{/* Dark Overlay */}
			{/* <div className='absolute inset-0 bg-black bg-opacity-40'></div> */}

			{/* Gradient Overlay */}
			<div className='absolute inset-0 bg-gradient-to-b from-transparent to-white from-85% z-10'></div>

			{/* Content */}
			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center text-white'>
				<div className='w-full'>
					<h1 className='font-bold mb-4 drop-shadow-xl tracking-wide'>
						<p className='text-3xl md:text-4xl'>
							{hero?.title || 'Selamat Datang Di Website Kelurahan Bilokka'}
						</p>
						<p className='mt-2'>
							{hero?.subtitle || 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'}
						</p>
					</h1>
					
					{/* Cache indicator untuk debugging */}
					{isFromCache && (
						<div className='mt-4 text-xs opacity-75'>
							⚡ Hero dari cache (10 menit)
						</div>
					)}
				</div>
			</div>
		</div>
	);
} 