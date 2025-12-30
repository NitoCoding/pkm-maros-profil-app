'use client'

import HeaderPage from '@/components/HeaderPage'
import Main from '@/components/Main'
import GaleriCard from '@/components/CardGaleri'
import PageHead from '@/components/PageHead'
import { useGaleri } from '@/hooks/useGaleri'
import { Loader2 } from 'lucide-react'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function GaleriPageClient() {
    const { galeri, loading, error, hasMore, loadMore } = useGaleri({ pageSize: 12 })

    return (
        <>
            <div className='pt-12 min-h-screen pb-3'>
                <Main>
                    <div className='mt-5 px-4 sm:px-6 lg:px-8'>
                        <div className='container mx-auto max-w-7xl'>

                            {/* ERROR */}
                            {error && <ErrorState error={error} onRetry={() => window.location.reload()} />}

                            {/* EMPTY */}
                            {!loading && !error && galeri.length === 0 && (
                                <EmptyState
                                    title="Belum Ada Galeri"
                                    message="Belum ada foto atau dokumentasi yang dipublikasikan. Kunjungi kembali nanti untuk melihat momen-momen berharga desa kami."
                                    emoji="🖼️"
                                />
                            )}

                            {/* GRID GALERI */}
                            {galeri.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {galeri.map((item, index) => (
                                        <GaleriCard
                                            key={item.id ? item.id : `galeri-${index}`} // fallback key aman!
                                            galeri={item}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* LOADING AWAL */}
                            {loading && galeri.length === 0 && <LoadingState message="Memuat galeri..." />}

                            {/* LOADING TAMBAHAN */}
                            {loading && galeri.length > 0 && <LoadingState message="Memuat galeri lainnya..." />}

                            {/* LOAD MORE */}
                            {!loading && hasMore && (
                            <LoadMoreButton
                                loading={loading}
                                hasMore={hasMore}
                                onClick={loadMore}
                                label="Muat Galeri Lainnya"
                            />
                            )}
                        </div>
                    </div>
                </Main>
            </div>
        </>
    )
}
