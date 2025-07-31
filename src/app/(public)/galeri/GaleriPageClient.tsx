'use client'

import HeaderPage from '@/components/HeaderPage'
import Main from '@/components/Main'
import GaleriCard from '@/components/CardGaleri'
import PageHead from '@/components/PageHead'
import { useGaleri } from '@/hooks/useGaleri'
import { Loader2 } from 'lucide-react'

export default function GaleriPageClient() {
    const { galeri, loading, error, hasMore, loadMore } = useGaleri({ pageSize: 12 })

    return (
        <>
            <PageHead 
                title="Galeri Kelurahan Bilokka"
                description="Dokumentasi dan galeri foto kegiatan Kelurahan Bilokka"
                keywords="galeri, foto, dokumentasi, kelurahan, bilokka"
            />
            <div className='pt-12 min-h-screen pb-3'>
                <Main>
                    <div className='px-4 sm:px-6 lg:px-8'>
                        <div className='container mx-auto max-w-7xl'>
                            <div className=' decoration-2 text-green-700'>
                                <HeaderPage
                                    title='Galeri'
                                    description='Dokumentasi dan galeri foto kegiatan Kelurahan Bilokka'
                                    customClass='mx-auto text-center'
                                />
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className='text-center py-8'>
                                    <div className='text-6xl mb-4'>📷</div>
                                    <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                                        Gagal Memuat Galeri
                                    </h3>
                                    <p className='text-red-600 mb-4'>{error}</p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            )}

                            {/* Empty State */}
                            {galeri.length === 0 && !loading && !error && (
                                <div className='text-center py-12'>
                                    <div className='text-6xl mb-4'>🖼️</div>
                                    <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                                        Belum Ada Galeri
                                    </h3>
                                    <p className='text-gray-600'>
                                        Belum ada foto atau dokumentasi yang dipublikasikan.
                                    </p>
                                </div>
                            )}

                            {/* Gallery Grid */}
                            {galeri.length > 0 && (
                                <div className='flex flex-col items-center space-y-6 md:grid md:grid-cols-2 md:space-y-0 md:gap-6 lg:grid-cols-3'>
                                    {galeri.map(item => (
                                        <div key={item.id} className='w-full max-w-sm'>
                                            <GaleriCard galeri={item} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Load More Button */}
                            {hasMore && galeri.length > 0 && (
                                <div className='flex justify-center mt-12 mb-8'>
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className='animate-spin h-5 w-5' />
                                                Memuat...
                                            </>
                                        ) : (
                                            'Muat Lebih Banyak'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Initial Loading State */}
                            {loading && galeri.length === 0 && (
                                <div className='flex justify-center items-center py-12'>
                                    <div className='text-center'>
                                        <Loader2 className='animate-spin h-8 w-8 text-blue-600 mx-auto mb-4' />
                                        <p className='text-gray-600'>Memuat galeri...</p>
                                    </div>
                                </div>
                            )}

                            {/* Loading More Indicator */}
                            {loading && galeri.length > 0 && (
                                <div className='flex justify-center items-center py-6'>
                                    <Loader2 className='animate-spin h-6 w-6 text-blue-600' />
                                    <span className='ml-2 text-gray-600'>Memuat galeri...</span>
                                </div>
                            )}

                            {/* End of results */}
                            {!hasMore && galeri.length > 0 && (
                                <div className='text-center mt-8'>
                                    <p className='text-gray-500'>Semua galeri telah dimuat</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Main>
            </div>
        </>
    )
}
