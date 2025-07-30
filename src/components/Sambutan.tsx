"use client";
import Image from 'next/image'
import { useSambutan } from '@/hooks/useSambutan'
import { prepareHTMLForRender } from '@/libs/utils/htmlUtils'

export default function Sambutan() {
	const { sambutan, loading } = useSambutan()

	if (loading) {
		return (
			<div className='px-4 sm:px-6 lg:px-8'>
				<div className='container mx-auto max-w-7xl'>
					<div className='flex justify-center items-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-700'></div>
					</div>
				</div>
			</div>
		)
	}

	if (!sambutan) {
		return null
	}

	return (
		<div className='px-4 sm:px-6 lg:px-8'>
			<div className='container mx-auto max-w-7xl'>
				<div className='flex flex-col sm:flex-row gap-4 md:gap-12 md:justify-center'>
					<div className='flex justify-center sm:justify-start'>
						<Image
							src={sambutan.gambar}
							alt='Lurah'
							width={500}
							height={500}
							className='w-48 h-48 md:w-96 md:h-96 rounded-full object-cover'
							priority
						/>
					</div>
					<div className='flex-1 flex flex-col gap-4'>
						<h1 className='text-2xl font-bold text-center mb-4 text-green-700 md:text-4xl md:text-start'>
							{sambutan.judul || 'Sambutan Lurah'}
						</h1>
						<div className='flex flex-col items-center md:items-start'>
							<h2 className='text-2xl font-bold mt-4 md:mt-0'>
								{sambutan.namaLurah}
							</h2>
							<h3 className='text-xl font-semibold mt-4 md:mt-0'>{sambutan.jabatanLurah}</h3>
						</div>
						<div className='scroll overflow-y-auto max-h-64'>
							<div
								className="prose prose-gray max-w-none leading-relaxed"
								dangerouslySetInnerHTML={{
									__html: prepareHTMLForRender(sambutan.isi || ""),
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
