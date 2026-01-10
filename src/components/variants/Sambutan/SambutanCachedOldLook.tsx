"use client";
import Image from 'next/image';
import { useSambutanCached } from '@/hooks/useCachedData';
import { prepareHTMLForRender } from '@/libs/utils/htmlUtils';

export default function SambutanCachedOldLook() {
	const { data: sambutan, loading, error, isFromCache, refresh } = useSambutanCached();

	if (loading) {
		return (
			<div className='px-4 sm:px-6 lg:px-8'>
				<div className='container mx-auto max-w-7xl'>
					<div className='flex justify-center items-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-700'></div>
						<span className='ml-2 text-gray-600'>
							{isFromCache ? 'Memuat dari cache...' : 'Memuat sambutan...'}
						</span>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='px-4 sm:px-6 lg:px-8'>
				<div className='container mx-auto max-w-7xl'>
					<div className='text-center py-8'>
						<p className='text-red-600 mb-4'>Gagal memuat sambutan: {error}</p>
						<button 
							onClick={refresh}
							className='bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition'
						>
							Coba Lagi
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!sambutan) {
		return null;
	}

	return (
		<div className='px-4 sm:px-6 lg:px-8'>
			<div className='container mx-auto max-w-7xl'>
				<div className='flex flex-col sm:flex-row gap-4 md:gap-12 md:justify-center'>
					<div className='flex justify-center sm:justify-start'>
						{sambutan.gambar ? (
							<Image
								src={sambutan.gambar}
								alt='Lurah'
								width={500}
								height={500}
								className='w-48 h-48 md:w-96 md:h-96 rounded-full object-cover'
								priority
								placeholder="blur"
								blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
							/>
						) : (
							<Image
								src='/lurah.png'
								alt='Lurah'
								width={500}
								height={500}
								className='w-48 h-48 md:w-96 md:h-96 rounded-full object-cover'
								priority
							/>
						)}
						
						{/* Cache indicator */}
						{isFromCache && (
							<div className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
								⚡ Cache (15m)
							</div>
						)}
					</div>
					<div className='flex-1 flex flex-col gap-4'>
						<h1 className='text-2xl font-bold text-center mb-4 text-green-700 md:text-4xl md:text-start'>
							{sambutan.judul || 'Sambutan Lurah'}
						</h1>
						<div className='flex flex-col items-center md:items-start'>
							<h2 className='text-2xl font-bold mt-4 md:mt-0'>
								H. ALIMUDDIN, S.Sos.
							</h2>
							<h3 className='text-xl font-semibold mt-4 md:mt-0'>Lurah</h3>
						</div>
						<div className='scroll overflow-y-auto max-h-64'>
							<div
								className="prose prose-gray max-w-none leading-relaxed"
								dangerouslySetInnerHTML={{
									__html: prepareHTMLForRender(sambutan.isi || ""),
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 