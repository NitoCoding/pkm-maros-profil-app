"use client";
import Image from 'next/image';
import { useHero } from '@/hooks/useDashboard';

export default function HeroSimple() {
	const { hero, loading, error } = useHero();

	if (loading) {
		return (
			<div className='min-h-screen w-full mb-4 flex items-center justify-center bg-gray-100'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Memuat data hero...</p>
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
						onClick={() => window.location.reload()}
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
			{/* Background Image */}
			{hero.image ? (
				<Image
					src={hero.image}
					alt={hero.title || 'Hero Image'}
					className='absolute inset-0 object-cover w-full h-full'
					width={1920}
					height={1080}
					priority
				/>
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
							{hero.title || 'Selamat Datang Di Website Kelurahan Bilokka'}
						</div>
						<div className='text-lg md:text-xl lg:text-2xl opacity-90'>
							{hero.subtitle || 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'}
						</div>
					</h1>
				</div>
			</div>
		</div>
	);
} 