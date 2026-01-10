"use client";
import Image from 'next/image';
import { useHero } from '@/hooks/useDashboard';

interface HeroDynamicProps {
	height?: string;
	showOverlay?: boolean;
	overlayOpacity?: number;
	textColor?: string;
	className?: string;
}

export default function HeroDynamic({
	height = 'min-h-screen',
	showOverlay = true,
	overlayOpacity = 0.4,
	textColor = 'text-white',
	className = ''
}: HeroDynamicProps) {
	const { hero, loading, error } = useHero();

	if (loading) {
		return (
			<div className={`${height} w-full mb-4 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 ${className}`}>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={`${height} w-full mb-4 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 ${className}`}>
				<div className='text-center text-white'>
					<p className='mb-4'>Gagal memuat data hero</p>
					<button 
						onClick={() => window.location.reload()}
						className='px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition'
					>
						Coba Lagi
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={`${height} w-full mb-4 relative overflow-hidden ${className}`} id='hero'>
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

			{/* Overlay */}
			{showOverlay && (
				<div 
					className='absolute inset-0 bg-black z-10'
					style={{ opacity: overlayOpacity }}
				></div>
			)}

			{/* Gradient Overlay */}
			<div className='absolute inset-0 bg-gradient-to-b from-transparent to-white from-85% z-10'></div>

			{/* Content */}
			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center'>
				<div className='w-full max-w-4xl px-4'>
					<h1 className={`font-bold mb-4 drop-shadow-xl tracking-wide ${textColor}`}>
						<p className='text-3xl md:text-4xl lg:text-5xl mb-2'>
							{hero.title || 'Selamat Datang Di Website Desa Benteng Gajah'}
						</p>
						<p className='text-lg md:text-xl lg:text-2xl opacity-90'>
							{hero.subtitle || 'Desa Benteng Gajah, Kecamatan Panca Lautang, Kabupaten Sidrap'}
						</p>
					</h1>
				</div>
			</div>
		</div>
	);
} 