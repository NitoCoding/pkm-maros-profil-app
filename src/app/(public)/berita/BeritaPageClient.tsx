'use client'

import { useBerita } from '@/hooks/useBerita'
import BeritaCard from '@/components/CardBerita'
import HeaderPage from '@/components/HeaderPage'
import Main from '@/components/Main'
import { Loader2 } from 'lucide-react'

export default function BeritaPageClient() {
	const { berita, loading, error, hasMore, loadMore } = useBerita({ pageSize: 12 })

	return (
		<div className='pt-12 min-h-screen pb-3'>
			<Main>
				<div className='mt-5 px-4 sm:px-6 lg:px-8'>
					<div className='container mx-auto max-w-7xl'>
						<HeaderPage
							title='Berita'
							description='Informasi terkini seputar Desa Benteng Gajah'
							customClass='mx-auto text-center'
						/>

						{error && (
							<div className='text-center py-8'>
								<p className='text-red-600 mb-4'>Gagal memuat berita: {error}</p>
								<button 
									onClick={() => window.location.reload()}
									className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
								>
									Coba Lagi
								</button>
							</div>
						)}

						{berita.length === 0 && !loading && !error && (
							<div className='text-center py-12'>
								<p className='text-gray-600 text-lg'>Belum ada berita yang dipublikasikan.</p>
							</div>
						)}

						{berita.length > 0 && (
							<div className='flex flex-col items-center space-y-6 md:grid md:grid-cols-2 md:space-y-0 md:gap-6 lg:grid-cols-3'>
								{berita.map(item => (
									<BeritaCard key={item.id} berita={item} />
								))}
							</div>
						)}

						{/* Loading indicator */}
						{loading && (
							<div className='flex justify-center items-center py-8'>
								<Loader2 className='animate-spin h-6 w-6 text-blue-600' />
								<span className='ml-2 text-gray-600'>
									{berita.length === 0 ? 'Memuat berita...' : 'Memuat berita lainnya...'}
								</span>
							</div>
						)}

						{/* Load more button */}
						{hasMore && !loading && berita.length > 0 && (
							<div className='text-center mt-8'>
								<button
									onClick={loadMore}
									className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
								>
									Muat Berita Lainnya
								</button>
							</div>
						)}

						{/* End of results */}
						{!hasMore && berita.length > 0 && (
							<div className='text-center mt-8'>
								<p className='text-gray-500'>Semua berita telah dimuat</p>
							</div>
						)}
					</div>
				</div>
			</Main>
		</div>
	)
}