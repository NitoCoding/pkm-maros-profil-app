"use client";
import Image from 'next/image'
import { useLurah } from '@/hooks/useDashboard'
import { useSambutan } from '@/hooks/useProfil'
import { prepareHTMLForRender } from '@/libs/utils/htmlUtils'
import { Quote, Mail, Phone } from 'lucide-react'
import PageHead from '@/components/PageHead'
import { error } from 'console';

export default function Sambutan() {
	const { lurah, loading: lurahLoading, error: lurahError, refresh: refreshLurah } = useLurah();
	const { profil: sambutan, loading: sambutanLoading, error: sambutanError, refresh: refreshSambutan } = useSambutan();


	if (lurahLoading || sambutanLoading) {
		return (
			<div className='px-4 sm:px-6 lg:px-8 py-12'>
				<div className='container mx-auto max-w-7xl'>
					<div className='flex justify-center items-center py-16'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-700'></div>
					</div>
				</div>
			</div>
		)
	}

	if (lurahError || sambutanError) {
		return (
			<div className='px-4 sm:px-6 lg:px-8 py-12'>
				<div className='container mx-auto max-w-7xl'>
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<div className="text-red-600 mb-4">Error: {lurahError || sambutanError}</div>
						<button
							onClick={() => { refreshLurah(); refreshSambutan() }}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Coba Lagi
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (!lurah) {
		return null
	}

	return (
		<>
			<PageHead
				title="Sambutan Lurah"
				description="Sambutan dari Desa Benteng Gajah"
			/>
			<div className='px-4 sm:px-6 lg:px-8 py-12'>
				<div className='container mx-auto max-w-7xl'>
					<div className='flex flex-col lg:flex-row gap-8 lg:gap-16 items-center'>
						{/* Foto Lurah dengan dekorasi */}
						<div className='relative lg:w-2/5 flex justify-center lg:justify-end'>
							<div className='relative'>
								{/* Background decoration */}
								<div className='absolute -inset-4 bg-green-200 rounded-full opacity-30 blur-xl'></div>

								{/* Frame untuk foto */}
								<div className='relative bg-white p-2 rounded-full shadow-xl'>
									<Image
										src={lurah.photo || '/default-image.jpg'}
										alt={lurah.name || 'Foto Lurah'}
										width={400}
										height={400}
										className='w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full object-cover'
										priority
									/>
								</div>

								{/* Quote icon decoration */}
								<div className='absolute -bottom-4 -right-4 bg-green-600 text-white p-3 rounded-full shadow-lg'>
									<Quote size={24} />
								</div>
							</div>
						</div>

						{/* Konten Sambutan */}
						<div className='lg:w-3/5 flex flex-col gap-6'>
							{/* Header */}
							<div className='text-center lg:text-left'>
								<h1 className='text-3xl md:text-4xl font-bold text-green-700 mb-2'>
									Sambutan
								</h1>
								<div className='h-1 w-20 bg-green-600 mx-auto lg:mx-0 rounded-full'></div>
							</div>

							{/* Info Lurah */}
							<div className='bg-white rounded-xl shadow-md p-6'>
								<h2 className='text-2xl font-bold text-gray-900 mb-1'>
									{lurah.name}
								</h2>
								<h3 className='text-lg font-medium text-gray-600 mb-4'>
									{lurah.position}
								</h3>

								{/* Isi Sambutan */}
								<div className='prose prose-gray max-w-none leading-relaxed text-gray-700'>
									<div
										dangerouslySetInnerHTML={{
											__html: prepareHTMLForRender(
												sambutan?.isi ||
												"Assalamualaikum warahmatullahi wabarakatuh. ..."
											),
										}}
									/>
								</div>
							</div>

							{/* Kontak */}
							{/* <div className='flex flex-col sm:flex-row gap-4 mt-4'>
                                <a 
                                    href={`tel:${lurah.phone}`}
                                    className='flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors'
                                >
                                    <Phone size={18} />
                                    <span>{lurah.phone}</span>
                                </a>
                                <a 
                                    href={`mailto:${lurah.email}`}
                                    className='flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                                >
                                    <Mail size={18} />
                                    <span>{lurah.email}</span>
                                </a>
                            </div> */}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}