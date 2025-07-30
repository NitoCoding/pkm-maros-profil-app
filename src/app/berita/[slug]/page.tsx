'use client'

import Main from '@/components/Main'
import {IBerita} from '@/types/berita'
import {CalendarDays, User, Loader2} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { prepareHTMLForRender, estimateReadingTime, getHTMLPreview } from '@/libs/utils/htmlUtils'
import { useBeritaBySlug, useLatestBerita } from '@/hooks/useBerita'
import { useParams } from 'next/navigation'
import { formatDateLong } from '@/libs/utils/date'

export default function BeritaDetail() {
	const params = useParams()
	const slug = params.slug as string

	const { berita, loading: loadingBerita, error: errorBerita } = useBeritaBySlug(slug)
	const { berita: beritaLain, loading: loadingBeritaLain } = useLatestBerita(3)

	// Filter out current article from related articles
	const relatedBerita = beritaLain.filter(item => item.slug !== slug)

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
		<div className='pt-12'>
			<Main>
				<div className='flex flex-col md:flex-row w-full md:px-24'>
					<div className='w-full md:w-4/6 pr-2 space-y-3'>
						{/* Title */}
						<div className='text-2xl font-semibold border-gray-200 text-center bg-white rounded-md p-4 shadow'>
							{berita.judul}
						</div>

						{/* Meta Information */}
						<div className='text-gray-400 border-gray-200 bg-white rounded-md p-3 shadow space-y-0.5'>
							<p>
								<span className='text-gray-500 flex flex-row items-center text-sm'>
									<CalendarDays className='mr-1' size={20} /> 
									{formatDateLong(berita.tanggal)}
								</span>
							</p>
							<p>
								<span className='text-gray-500 flex flex-row items-center text-sm'>
									<User className='mr-1' size={20} /> 
									Editor {berita.penulis || 'Admin'}
								</span>
							</p>
							{berita.kategori && (
								<p>
									<span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
										{berita.kategori}
									</span>
								</p>
							)}
							{berita.tags && berita.tags.length > 0 && (
								<div className='flex flex-wrap gap-1 mt-2'>
									{berita.tags.map((tag, index) => (
										<span 
											key={index}
											className='inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded'
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>

						{/* Featured Image */}
						<div className='text-gray-400 border-gray-200 bg-white rounded-md p-3 shadow space-y-0.5'>
							<div className='overflow-hidden rounded-lg'>
								<Image
									src={berita.gambar || '/default-berita.jpg'}
									alt={berita.judul}
									width={600}
									height={300}
									className='w-full h-auto object-fill'
									priority
								/>
							</div>
						</div>

						{/* Summary */}
						<div className='text-gray-600 border-gray-200 bg-white rounded-md p-4 shadow'>
							<h3 className='text-lg font-semibold text-gray-800 mb-2'>Ringkasan</h3>
							<p className='leading-relaxed'>
								{getHTMLPreview(berita.ringkasan, 200)}
							</p>
							<div className='text-sm text-gray-500 mt-2'>
								{estimateReadingTime(berita.isi)}
							</div>
						</div>

						{/* Full Content */}
						<div className='border-gray-200 bg-white rounded-md p-4 shadow'>
							<h3 className='text-lg font-semibold text-gray-800 mb-4'>Konten Lengkap</h3>
							<div 
								className='prose prose-gray max-w-none leading-relaxed'
								dangerouslySetInnerHTML={{ 
									__html: prepareHTMLForRender(berita.isi) 
								}}
							/>
						</div>
					</div>

					{/* Sidebar - Related Articles */}
					<div className='w-full md:w-2/6 pl-2 mt-4 md:mt-0 space-y-2'>
						<div className='bg-gradient-to-br text-white from-green-300 to-green-700 text-3xl font-semibold border-gray-200 text-center bg-white rounded-md p-4 shadow'>
							Berita Lainnya
						</div>
						
						<div className='flex flex-col font-semibold border-gray-200 text-center bg-white rounded-md shadow'>
							{loadingBeritaLain ? (
								<div className='p-8 text-center'>
									<Loader2 className='animate-spin mx-auto mb-2' size={24} />
									<p className='text-sm text-gray-500'>Memuat berita lainnya...</p>
								</div>
							) : relatedBerita.length > 0 ? (
								relatedBerita.map(beritaItem => (
									<div key={beritaItem.id} className='rounded-md'>
										<Link href={`/berita/${beritaItem.slug}`}>
											<BeritaCardSmall berita={beritaItem} />
										</Link>
									</div>
								))
							) : (
								<div className='p-8 text-center text-gray-500'>
									<p>Tidak ada berita lainnya</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</Main>
		</div>
	)
}

function BeritaCardSmall({ berita }: { berita: IBerita }) {
	return (
		<div className='text-gray-400 bg-white hover:bg-gray-50 p-4 shadow space-y-2 flex transition-colors'>
			{/* Gambar dengan rasio 1:1 (70x70) */}
			<div className='relative w-[70px] h-[70px] overflow-hidden rounded-md flex-shrink-0'>
				<Image
					src={berita.gambar || '/default-berita.jpg'}
					alt={berita.judul}
					fill
					className='object-cover'
				/>
			</div>
			
			{/* Konten teks */}
			<div className='flex-1 text-start ps-3'>
				<h3 className='text-sm font-medium text-gray-900 text-wrap line-clamp-2 mb-1'>
					{berita.judul}
				</h3>
				<p className='text-xs text-gray-500'>
					<span className='flex flex-row items-center text-xs text-gray-500'>
						<CalendarDays className='mr-1' size={15} />
						{formatDateLong(berita.tanggal)}
					</span>
				</p>
				<p className='text-xs text-gray-600 line-clamp-2 mt-1'>
					{getHTMLPreview(berita.isi, 80)}
				</p>
			</div>
		</div>
	)
}
