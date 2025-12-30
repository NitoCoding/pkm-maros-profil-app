'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Facebook } from 'lucide-react'
import { IInovasi } from '@/types/inovasi'
import SocialMediaIcons from './SocialMediaIcons'

export default function InovasiCard({ inovasi }: { inovasi: IInovasi }) {
    const [activeImage, setActiveImage] = useState(0)
    const thumbnailRef = useRef<HTMLDivElement>(null)

    // Fungsi scroll thumbnail
    const scrollThumbnail = (direction: 'left' | 'right') => {
        if (!thumbnailRef.current) return
        const scrollAmount = direction === 'left' ? -100 : 100
        thumbnailRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }

    // Pastikan gambar ada, jika tidak gunakan gambar placeholder
    const images = inovasi.gambar && inovasi.gambar.length > 0 
        ? inovasi.gambar 
        : ['/images/placeholder.jpg']; // Ganti dengan path gambar placeholder Anda

    // Pastikan social media ada, jika tidak gunakan objek kosong
    const socialMedia = inovasi.socialMedia || {};

    return (
        <div className='bg-gray-50 rounded-xl shadow-lg overflow-hidden'>
            <div className='md:flex'>
                {/* Kolom Kiri: Carousel Gambar */}
                <div className='md:w-1/2 p-4'>
                    {/* Gambar Utama */}
                    <div className='relative w-full aspect-video rounded-lg overflow-hidden mb-3 shadow-md'>
                        <Image
                            src={images[activeImage]}
                            alt={`${inovasi.altText || 'Gambar Inovasi'} (${activeImage + 1})`}
                            fill
                            className='object-cover hover:scale-105 transition-transform duration-500'
                        />
                        <div className='absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded'>
                            {activeImage + 1} / {images.length}
                        </div>
                    </div>

                    {/* Thumbnail Slider */}
                    <div className='relative'>
                        {/* Tombol Panah (Hanya muncul jika ada lebih dari 1 gambar) */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type='button'
                                    onClick={() => scrollThumbnail('left')}
                                    className='absolute left-0 top-1/2 -translate-y-1/2 z-10 
                                        bg-white/80 hover:bg-white p-0 rounded-full shadow-md w-8 h-8 flex items-center justify-center text-gray-800 box-content transition-colors duration-200'
                                    aria-label='Geser kiri'
                                >
                                    <ArrowLeft size={16} strokeWidth={2} className="mx-[3px]" />
                                </button>
                                <button
                                    type='button'
                                    onClick={() => scrollThumbnail('right')}
                                    className='absolute right-0 top-1/2 -translate-y-1/2 z-10 
                                        bg-white/80 hover:bg-white p-0 rounded-full shadow-md w-8 h-8 
                                        flex items-center justify-center text-gray-800 
                                        box-content transition-colors duration-200'
                                    aria-label='Geser kanan'
                                >
                                    <ArrowRight size={16} strokeWidth={2} className="mx-[3px]" />
                                </button>
                            </>
                        )}

                        {/* Kontainer Thumbnail yang Bisa Digulir */}
                        {images.length > 1 && (
                            <div
                                ref={thumbnailRef}
                                className='flex space-x-2 overflow-x-auto scroll-smooth pb-2 hide-scrollbar'
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {images.map((img, idx) => (
                                    <button
                                        type='button'
                                        key={idx}
                                        onClick={() => {
                                            setActiveImage(idx)
                                            // Opsional: fokus ke thumbnail agar terlihat saat digulir
                                            setTimeout(() => {
                                                const el = thumbnailRef.current?.children[idx] as HTMLElement
                                                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                                            }, 100)
                                        }}
                                        className={`relative min-w-[80px] h-16 rounded-md overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
                                            } focus:outline-none`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className='object-cover'
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Info */}
                <div className='md:w-2/5 p-6 flex flex-col justify-between'>
                    <div>
                        <h3 className='text-2xl font-bold text-gray-800'>
                            {inovasi.judul || 'Judul Tidak Tersedia'}
                        </h3>
                        <p className='text-gray-500 text-sm mt-1'>
                            Tahun: {inovasi.tahun || 'Tidak Diketahui'}
                        </p>

                        <div className='text-gray-700 leading-relaxed mt-4 whitespace-pre-line'>
                            {inovasi.deskripsi ? (
                                <div dangerouslySetInnerHTML={{ __html: inovasi.deskripsi }} />
                            ) : (
                                <p className='text-gray-500 italic'>Deskripsi tidak tersedia untuk inovasi ini.</p>
                            )}
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className='mt-6 space-y-2'>
                        {inovasi.linkProyek ? (
                            <Link
                                href={inovasi.linkProyek}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='block bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                            >
                                📄 Lihat Dokumentasi Proyek
                            </Link>
                        ) : (
                            <div className='block bg-gray-300 text-gray-600 text-center py-2 rounded-lg text-sm font-medium cursor-not-allowed'>
                                📄 Dokumentasi Tidak Tersedia
                            </div>
                        )}

                        {inovasi.linkDanaDesa ? (
                            <Link
                                href={inovasi.linkDanaDesa}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='block bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium'
                            >
                                💰 Sumber Pendanaan (Dana Desa)
                            </Link>
                        ) : (
                            <div className='block bg-gray-300 text-gray-600 text-center py-2 rounded-lg text-sm font-medium cursor-not-allowed'>
                                💰 Informasi Pendanaan Tidak Tersedia
                            </div>
                        )}
                    </div>

                    {/* Sosial Media */}
                    <div className='mt-6'>
                        <h4 className='text-sm font-semibold text-gray-800 mb-2'>Dikelola Oleh:</h4>
                        <div className='flex flex-wrap gap-3'>
                            {socialMedia.instagram ? (
                                <SocialMediaIcons socialMedia={{ instagram: socialMedia.instagram }} showText />
                            ) : (
                                <div className='text-gray-500 text-sm'>Instagram tidak tersedia</div>
                            )}
                            
                            {socialMedia.youtube ? (
                                <SocialMediaIcons socialMedia={{ youtube: socialMedia.youtube }} showText />
                            ) : (
                                <div className='text-gray-500 text-sm'>YouTube tidak tersedia</div>
                            )}
                            
                            {/* Jika tidak ada media sosial sama sekali */}
                            {!socialMedia.instagram && !socialMedia.youtube && (
                                <div className='text-gray-500 text-sm'>Informasi media sosial tidak tersedia</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}