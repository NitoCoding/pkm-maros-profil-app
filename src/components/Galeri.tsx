'use client'

import Link from 'next/link'
import GaleriCard from './CardGaleri'
import HeaderPage from './HeaderPage'
import { useLatestGaleri } from '@/hooks/useGaleri'
import { Loader2 } from 'lucide-react'

export default function Galeri() {
	const { galeri, loading, error } = useLatestGaleri(6)

	if (loading) {
		return (
			<section className='py-16 bg-gray-50'>
				<div className='container mx-auto px-4'>
					<HeaderPage title='Galeri Terbaru' description='Dokumentasi kegiatan terkini di Kelurahan Bilokka' />
					<div className='flex justify-center items-center py-12'>
						<Loader2 className='animate-spin h-8 w-8 text-blue-600' />
						<span className='ml-2 text-gray-600'>Memuat galeri...</span>
					</div>
				</div>
			</section>
		)
	}

	if (error) {
		return (
			<section className='px-4 sm:px-6 lg:px-8 mb-4'>
				<div className='container mx-auto px-4'>
					<HeaderPage title='Galeri Terbaru' description='Dokumentasi kegiatan terkini di Kelurahan Bilokka' />
					<div className='text-center py-12'>
						<p className='text-red-600 mb-4'>Gagal memuat galeri: {error}</p>
						<button 
							onClick={() => window.location.reload()}
							className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
						>
							Coba Lagi
						</button>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section className='px-4 sm:px-6 lg:px-8 mb-4'>
			<div className='container mx-auto px-4'>
				<HeaderPage title='Galeri Terbaru' description='Dokumentasi kegiatan terkini di Kelurahan Bilokka' />
				
				{galeri.length === 0 ? (
					<div className='text-center py-12'>
						<div className='text-6xl mb-4'>🖼️</div>
						<h3 className='text-xl font-semibold text-gray-800 mb-2'>
							Belum Ada Galeri
						</h3>
						<p className='text-gray-600 mb-6'>
							Belum ada dokumentasi yang dipublikasikan.
						</p>
						<Link 
							href='/galeri'
							className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition'
						>
							Lihat Galeri
						</Link>
					</div>
				) : (
					<>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
							{galeri.map(item => (
								<div key={item.id} className='max-w-[360px] mx-auto'>
									<GaleriCard galeri={item} />
								</div>
							))}
						</div>
						
						<div className='text-center'>
							<Link
								href='/galeri'
								className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors'
							>
								Lihat Semua Galeri
							</Link>
						</div>
					</>
				)}
			</div>
		</section>
	)
}