'use client'
// pkm-maros-profil-app\src\app\(public)\berita\BeritaPageClient.tsx
import { useBerita } from '@/hooks/useBerita'
import BeritaCard from '@/components/CardBerita'
import HeaderPage from '@/components/HeaderPage'
import Main from '@/components/Main'
import { Loader2 } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'

export default function BeritaPageClient() {
	const { berita, loading, error, hasMore, loadMore } = useBerita({ pageSize: 12 })

	return (
		<div className='pt-12 min-h-screen pb-3'>
			<Main>
				<div className='mt-5 px-4 sm:px-6 lg:px-8'>
					<div className='container mx-auto max-w-7xl'>


						{/* Error */}
						{error && <ErrorState error={error} onRetry={() => window.location.reload()} />}

						{/* Empty */}
						{!loading && !error && berita.length === 0 && (
							<EmptyState
								title="Belum Ada Berita"
								message="Belum ada berita yang dipublikasikan. Kunjungi kembali nanti untuk informasi terbaru."
								emoji="📰"
							/>
						)}

						{/* Grid Berita */}
						{berita.length > 0 && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
								{berita.map((item, index) => (
									<BeritaCard
										key={item.id ? item.id : `berita-${index}`}
										berita={item}
									/>
								))}
							</div>
						)}

						{/* Loading Awal */}
						{loading && berita.length === 0 && <LoadingState message="Memuat berita..." />}

						{/* Loading Tambahan */}
						{loading && berita.length > 0 && <LoadingState message="Memuat berita lainnya..." />}

						{/* Load More */}
						{!loading && hasMore && (

							<LoadMoreButton loading={loading} hasMore={hasMore} onClick={loadMore} label="Muat Berita Lainnya" />
						)}
					</div>
				</div>
			</Main>
		</div>
	)
}