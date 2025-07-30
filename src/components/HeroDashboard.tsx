"use client";
import Image from 'next/image';
import { useHero } from '@/hooks/useDashboard';

export default function HeroDashboard() {
	const { hero, loading, error } = useHero();

	if (loading) {
		return (
			<div className='min-h-screen w-full mb-4 flex items-center justify-center bg-gray-100'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
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
						className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
					>
						Coba Lagi
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen w-full mb-4' id='hero'>
			{hero.image ? (
				<Image
					src={hero.image}
					alt='Hero Image'
					className='absolute inset-0 object-cover w-full h-full'
					width={1920}
					height={1080}
					priority
				/>
			) : (
				<div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600'></div>
			)}
			<div className='absolute inset-0 bg-gradient-to-b from-transparent to-white from-85% z-10'></div>
			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center text-white'>
				<div className='w-full'>
					<h1 className='font-bold mb-4 drop-shadow-xl tracking-wide'>
						<p className='text-3xl md:text-4xl'>
							{hero.title || 'Selamat Datang Di Website Kelurahan Bilokka'}
						</p>
						<p className='mt-2'>
							{hero.subtitle || 'Kelurahan Bilokka, Kecamatan Panca Lautang, Kabupaten Sidrap'}
						</p>
					</h1>
				</div>
			</div>
		</div>
	);
} 