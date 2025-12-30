'use client'
// pkm-maros-profil-app\src\app\(public)\berita\[slug]\page.tsx
import Main from '@/components/Main'
import { IBerita } from '@/types/berita'
import { CalendarDays, User, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { prepareHTMLForRender, estimateReadingTime, getHTMLPreview } from '@/libs/utils/htmlUtils'
import { useBeritaBySlug, useBerita } from '@/hooks/useBerita'
import { useParams } from 'next/navigation'
import { formatDateLong } from '@/libs/utils/date'
import PageHead from '@/components/PageHead'

export default function BeritaDetail() {
    const params = useParams()
    const slug = params.slug as string

    const { berita, loading: loadingBerita, error: errorBerita } = useBeritaBySlug(slug)
    const { berita: beritaLain, loading: loadingBeritaLain } = useBerita({ pageSize: 3 })

    // Filter out current article from related articles
    const relatedBerita = beritaLain.filter(item => item.slug !== slug)

    // // console.log('Berita detail page rendered with slug:', berita)

    if (loadingBerita) {
        return (
            <div className='pt-12'>
                <Main>
                    <div className='flex items-center justify-center min-h-96'>
                        <div className='text-center'>
                            <Loader2 className='animate-spin mx-auto mb-4' size={32} />
                            <p className='text-gray-600'>Memuat berita...</p>
                        </div>
                    </div>
                </Main>
            </div>
        )
    }

    if (errorBerita || !berita) {
        return (
            <div className='pt-12'>
                <Main>
                    <div className='flex items-center justify-center min-h-96'>
                        <div className='text-center'>
                            <div className='text-6xl mb-4'>📰</div>
                            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                                Berita Tidak Ditemukan
                            </h2>
                            <p className='text-gray-600 mb-4'>
                                {errorBerita || 'Berita yang Anda cari tidak dapat ditemukan.'}
                            </p>
                            <Link
                                href='/berita'
                                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
                            >
                                Kembali ke Daftar Berita
                            </Link>
                        </div>
                    </div>
                </Main>
            </div>
        )
    }

    return (
        <>
            <PageHead
                title={berita.judul}
                description={getHTMLPreview(berita.ringkasan, 150)}
            />
            <div className='pt-12 min-h-screen pb-3'>
                <Main>
                    <div className='mt-12 flex flex-col lg:flex-row w-full px-4 sm:px-6 lg:px-8 gap-6'>
                        <div className='w-full lg:w-2/3 space-y-6'>
                            {/* Title */}
                            <div className='bg-white rounded-xl shadow-sm p-6'>
                                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 leading-tight'>
                                    {berita.judul}
                                </h1>

                                {/* Meta Information */}
                                <div className='flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100'>
                                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                                        <CalendarDays size={16} />
                                        {formatDateLong(berita.createdAt)}
                                    </div>
                                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                                        <User size={16} />
                                        {berita.penulis || 'Admin'}
                                    </div>
                                    {/* {Array.isArray(berita.kategori) && berita.kategori.length > 0 && ( */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {/* {berita.kategori.map((kat) => ( */}
                                                <span
                                                    
                                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                                                >
                                                    {berita.kategori}
                                                </span>
                                            {/* ))} */}
                                        </div>
                                    {/* )} */}
                                </div>

                                {berita.tags && berita.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {berita.tags.map((tag, index) => (
                                            <span key={`${tag}-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                            </div>

                            {/* Featured Image */}
                            {berita.gambar && (
                                <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                                    <div className='relative aspect-video md:aspect-[16/9]'>
                                        <Image
                                            src={berita.gambar}
                                            alt={berita.judul}
                                            fill
                                            className='object-cover'
                                            priority
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className='bg-white rounded-xl shadow-sm p-6'>
                                <h2 className='text-xl font-semibold text-gray-900 mb-3'>Ringkasan</h2>
                                <div className='text-gray-700 leading-relaxed'>
                                    {getHTMLPreview(berita.ringkasan, 300)}
                                </div>
                                <div className='text-sm text-gray-500 mt-3 flex items-center gap-1'>
                                    <span>Estimasi waktu baca:</span>
                                    <span className='font-medium'>{estimateReadingTime(berita.isi)}</span>
                                </div>
                            </div>

                            {/* Full Content */}
                            <div className='bg-white rounded-xl shadow-sm p-6'>
                                <h2 className='text-xl font-semibold text-gray-900 mb-4'>Konten Lengkap</h2>
                                <div
                                    className='prose prose-gray max-w-none leading-relaxed'
                                    dangerouslySetInnerHTML={{
                                        __html: prepareHTMLForRender(berita.isi)
                                    }}
                                />
                            </div>

                            {/* Navigation */}
                            <div className='bg-white rounded-xl shadow-sm p-6'>
                                <div className='flex justify-between items-center'>
                                    <Link
                                        href='/berita'
                                        className='flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'
                                    >
                                        ← Kembali ke Daftar Berita
                                    </Link>
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className='text-gray-500 hover:text-gray-700'
                                    >
                                        ↑ Kembali ke Atas
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Related Articles */}
                        <div className='w-full lg:w-1/3 space-y-6'>
                            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-sm p-6'>
                                <h2 className='text-xl font-bold'>Berita Lainnya</h2>
                            </div>

                            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                                {loadingBeritaLain ? (
                                    <div className='p-8 text-center'>
                                        <Loader2 className='animate-spin mx-auto mb-2' size={24} />
                                        <p className='text-sm text-gray-500'>Memuat berita lainnya...</p>
                                    </div>
                                ) : relatedBerita.length > 0 ? (
                                    <div className='divide-y divide-gray-100'>
                                        {relatedBerita.map(beritaItem => (
                                            <div key={beritaItem.id}>
                                                <Link href={`/berita/${beritaItem.slug}`}>
                                                    <BeritaCardSmall berita={beritaItem} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='p-8 text-center text-gray-500'>
                                        <p>Tidak ada berita lainnya</p>
                                    </div>
                                )}

                                {relatedBerita.length > 0 && (
                                    <div className='p-4 border-t border-gray-100'>
                                        <Link
                                            href='/berita'
                                            className='block w-full text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium'
                                        >
                                            Lihat Semua Berita
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Main>
            </div>
        </>
    )
}

function BeritaCardSmall({ berita }: { berita: IBerita }) {
    return (
        <div className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'>
            <div className='flex gap-3'>
                {/* Gambar dengan rasio 16:9 */}
                <div className='relative w-24 h-16 overflow-hidden rounded-md flex-shrink-0'>
                    <Image
                        src={berita.gambar || '/default-image.jpg'}
                        alt={berita.judul}
                        fill
                        className='object-cover'
                    />
                </div>

                {/* Konten teks */}
                <div className='flex-1 min-w-0'>
                    <h3 className='text-sm font-medium text-gray-900 line-clamp-2 mb-1'>
                        {berita.judul}
                    </h3>
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <CalendarDays size={12} />
                        {formatDateLong(berita.createdAt)}
                    </div>
                    {berita.kategori && (
                        <span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mt-1'>
                            {berita.kategori}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}