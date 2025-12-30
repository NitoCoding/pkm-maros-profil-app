'use client'

import HeaderPage from '@/components/HeaderPage'
import Main from '@/components/Main'
import WisataCard from '@/components/WisataCard'
import { useWisata } from '@/hooks/useWisata'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function WisataPageClient() {
    const { wisata, loading, error, hasMore, loadMore } = useWisata({ pageSize: 6 })

    return (
        <>
            <div className='pt-12 min-h-screen pb-3'>
                <Main>
                    <div className='mt-5 px-4 sm:px-6 lg:px-8'>
                        <div className='container mx-auto max-w-7xl'>

                            {/* ERROR STATE */}
                            {error && (
                                <ErrorState
                                    error={error}
                                    onRetry={() => window.location.reload()} // Bisa diganti dengan refresh state jika `useWisata` mendukung
                                />
                            )}

                            {/* EMPTY STATE */}
                            {!loading && !error && wisata.length === 0 && (
                                <EmptyState
                                    title="Belum Ada Destinasi Wisata"
                                    message="Destinasi wisata akan segera tersedia. Kunjungi kembali lain waktu!"
                                    emoji="🏞️"
                                />
                            )}

                            {/* GRID WISATA */}
                            {wisata.length > 0 && (
                                <div className="w-full px-4 grid grid-cols-1 gap-8">
                                    {wisata.map((item) => (
                                        <WisataCard
                                            key={item.id}
                                            wisata={item}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* LOADING AWAL (sebelum data pertama muncul) */}
                            {loading && wisata.length === 0 && <LoadingState message="Memuat destinasi wisata..." />}

                            {/* LOADING TAMBAHAN (saat klik "Muat Lainnya") */}
                            {loading && wisata.length > 0 && <LoadingState message="Memuat destinasi lainnya..." />}

                            {/* LOAD MORE BUTTON */}
                            {!loading && hasMore && (
                            <LoadMoreButton
                                loading={loading}
                                hasMore={hasMore}
                                onClick={loadMore}
                                label="Muat Destinasi Lainnya"
                            />
                            )}
                        </div>
                    </div>
                </Main>
            </div>
        </>
    )
}