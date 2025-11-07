
'use client'

import HeaderPage from '@/components/HeaderPage'
import Main from '@/components/Main'
import CardUmkm from '@/components/CardUmkm'
import { useUmkm } from '@/hooks/useUmkm'
import { Loader2 } from 'lucide-react'

export default function UmkmPage() {
    const { umkm = [], loading, error, hasMore, loadMore } = useUmkm({ pageSize: 12 })

    return (
        <div className='pt-12 min-h-screen pb-3'>
            <Main>
                <div className='mt-5 px-4 sm:px-6 lg:px-8'>
                <HeaderPage
                    title='UMKM'
                    description='Usaha Mikro, Kecil, dan Menengah di Desa Benteng Gajah'
                    customClass='mx-auto text-center'
                />

                {/* Loading State */}
                {loading && umkm.length === 0 && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-gray-600">Memuat data UMKM...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
                            <p className="font-medium">Gagal memuat data UMKM</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && umkm.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            Belum ada data UMKM yang tersedia
                        </p>
                    </div>
                )}

                {/* UMKM Grid */}
                {!loading && !error && umkm.length > 0 && (
                    <>
                        <div className='w-full px-4'>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                                {umkm.map(item => (
                                    <div key={item.id} className="w-full">
                                        <CardUmkm umkm={item} />
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin h-4 w-4" />}
                                    {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            </Main>
        </div>
    )
}
