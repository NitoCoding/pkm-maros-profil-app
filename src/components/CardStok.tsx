import Image from 'next/image'
import { User, Award, MapPin } from 'lucide-react'
import { getBlurredImageUrl, getCardStokImageUrl } from '@/libs/utils/cloudinary'

export default function CardStok({
	nama,
	jabatan,
	foto,
}: {
	nama: string
	jabatan: string
	foto: string
}) {

	const optimizedImageUrl = getCardStokImageUrl(foto);
	const blurredImageUrl = getBlurredImageUrl(foto);
	return (
		<div className='bg-white rounded-xl w-[300px] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group'>
			{/* Image Container */}
			<div className='relative h-[300px] w-[300px] overflow-hidden'>
				<Image
					src={optimizedImageUrl}
					alt={nama}
					fill
					className='object-cover group-hover:scale-110 transition-transform duration-300'
					unoptimized
					priority
					// blurDataURL={blurredImageUrl}
					// placeholder='blur'
				/>
				{/* Gradient Overlay */}
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
			</div>

			{/* Content */}
			<div className='p-6'>
				{/* Icon and Badge */}
				<div className='flex items-center justify-between mb-4'>
					<div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
						<User className='w-6 h-6 text-green-600' />
					</div>
					<div className='bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium'>
						<Award className='w-3 h-3 inline mr-1' />
						Pegawai
					</div>
				</div>

				{/* Name and Position */}
				<div className='text-center'>
					<h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300'>
						{nama}
					</h3>
					<div className='flex items-center justify-center gap-2 text-gray-600'>
						<MapPin className='w-4 h-4' />
						<p className='text-sm font-medium'>{jabatan}</p>
					</div>
				</div>

				{/* Decorative Line */}
				<div className='mt-4 pt-4 border-t border-gray-100'>
					<div className='flex justify-center'>
						<div className='w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full'></div>
					</div>
				</div>
			</div>
		</div>
	)
}
