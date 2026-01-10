'use client'

import HeaderPage from '@/components/layout/HeaderPage'
import Main from '@/components/layout/Main'
import CardUmkm from '@/components/cards/CardUmkm'
import { useProdukUMKM } from '@/hooks/useProdukUMKM'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function UmkmPageClient() {
    const { umkm = [], loading, error, hasMore, loadMore } = useProdukUMKM({ pageSize: 12 })

    return (
        <>
            <div className='min-h-screen'>
                <Main>
                    <div className='mt-5 px-4 sm:px-6 lg:px-8'>
                        <div className='container mx-auto max-w-7xl'>

                            {/* ERROR STATE */}
                            {error && (
                                <ErrorState
                                    error={error}
                                    onRetry={() => window.location.reload()}
                                />
                            )}

                            {/* EMPTY STATE */}
                            {!loading && !error && umkm.length === 0 && (
                                <EmptyState
                                    title="Belum Ada UMKM"
                                    message="Belum ada pelaku UMKM yang terdaftar saat ini. Nantikan kehadiran produk lokal menarik dari desa kami!"
                                    emoji="🏪"
                                />
                            )}

                            {/* GRID UMKM */}
                            {umkm.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                    {umkm.map((item) => (
                                        <CardUmkm key={item.id} umkm={item} />
                                    ))}
                                </div>
                            )}

                            {/* LOADING AWAL */}
                            {loading && umkm.length === 0 && (
                                <LoadingState message="Memuat data UMKM..." />
                            )}

                            {/* LOADING TAMBAHAN */}
                            {loading && umkm.length > 0 && (
                                <LoadingState message="Memuat UMKM lainnya..." />
                            )}

                            {/* LOAD MORE BUTTON */}
                            {!loading && hasMore && (
                            <LoadMoreButton
                                loading={loading}
                                hasMore={hasMore}
                                onClick={loadMore}
                                label="Muat UMKM Lainnya"
                            />
                            )}
                        </div>
                    </div>
                </Main>
            </div>
        </>
    )
}