"use client";
import Image from 'next/image';
import { useSambutanCached } from '@/hooks/useCachedData';

export default function SambutanCached() {
	const { data: sambutan, loading, error, isFromCache, refresh } = useSambutanCached();

	if (loading) {
		return (
			<section className='py-16 bg-white'>
				<div className='container mx-auto px-4'>
					<div className='flex justify-center items-center py-12'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
						<span className='ml-2 text-gray-600'>
							{isFromCache ? 'Memuat dari cache...' : 'Memuat sambutan...'}
						</span>
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className='py-16 bg-white'>
				<div className='container mx-auto px-4'>
					<div className='text-center py-12'>
						<p className='text-red-600 mb-4'>Gagal memuat sambutan: {error}</p>
						<button 
							onClick={refresh}
							className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
						>
							Coba Lagi
						</button>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className='py-16 bg-white'>
			<div className='container mx-auto px-4'>
				<div className='max-w-4xl mx-auto'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
						{/* Gambar */}
						<div className='relative'>
							{sambutan?.gambar ? (
								<Image
									src={sambutan.gambar}
									alt={sambutan.judul || 'Sambutan Lurah'}
									width={500}
									height={400}
									className='w-full h-auto rounded-lg shadow-lg'
									priority
									placeholder="blur"
									blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
								/>
							) : (
								<div className='w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center'>
									<span className='text-white text-lg font-semibold'>Foto Lurah</span>
								</div>
							)}
							
							{/* Cache indicator */}
							{isFromCache && (
								<div className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
									⚡ Cache (15m)
								</div>
							)}
						</div>

						{/* Konten */}
						<div className='space-y-6'>
							<h2 className='text-3xl font-bold text-gray-800'>
								{sambutan?.judul || 'Sambutan Lurah'}
							</h2>
							
							<div 
								className='text-gray-600 leading-relaxed'
								dangerouslySetInnerHTML={{
									__html: sambutan?.isi || 
									`<p>Selamat datang di website resmi Kelurahan Bilokka. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.</p>
									
									<p>Melalui website ini, kami berharap dapat memudahkan akses informasi dan pelayanan publik, serta memperkuat komunikasi antara pemerintah kelurahan dengan masyarakat yang kami layani.</p>`
								}}
							/>
							
							<div className='pt-4'>
								<p className='text-sm text-gray-500'>
									<strong>Lurah Kelurahan Bilokka</strong><br />
									Kecamatan Panca Lautang, Kabupaten Sidrap
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
} 