import Image from 'next/image'
import { User, MapPin } from 'lucide-react'
import { getCardStokImageUrl } from '@/libs/utils/cloudinary'

interface CardStokLiteProps {
	nama: string
	jabatan: string
	foto: string
	size?: 'sm' | 'md' | 'lg'
	showIcon?: boolean
}

export default function CardStokLite({
	nama,
	jabatan,
	foto,
	size = 'md',
	showIcon = false,
}: CardStokLiteProps) {
	// Size configurations
	const sizeConfig = {
		sm: {
			imageSize: { width: 200, height: 200 },
			cardClass: 'w-48',
			textClass: 'text-xs',
			titleClass: 'text-sm',
			padding: 'p-2'
		},
		md: {
			imageSize: { width: 300, height: 300 },
			cardClass: 'w-64',
			textClass: 'text-xs',
			titleClass: 'text-sm',
			padding: 'p-3'
		},
		lg: {
			imageSize: { width: 400, height: 400 },
			cardClass: 'w-80',
			textClass: 'text-sm',
			titleClass: 'text-base',
			padding: 'p-4'
		}
	}

	const config = sizeConfig[size]
	const optimizedImageUrl = getCardStokImageUrl(foto, config.imageSize.width, config.imageSize.height)

	return (
		<div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group ${config.cardClass}`}>
			{/* Image Container - Square format */}
			<div className='relative w-full aspect-square overflow-hidden bg-gray-50'>
				<Image
					src={optimizedImageUrl}
					alt={nama}
					fill
					className='object-cover group-hover:scale-105 transition-transform duration-200'
					unoptimized
					priority
				/>
				
				{/* Optional Icon Overlay */}
				{showIcon && (
					<div className='absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center'>
						<User className='w-4 h-4 text-gray-600' />
					</div>
				)}
			</div>

			{/* Content - Minimal */}
			<div className={config.padding}>
				{/* Name */}
				<h3 className={`${config.titleClass} font-semibold text-gray-900 text-center mb-1 truncate`}>
					{nama}
				</h3>
				
				{/* Position */}
				<div className='flex items-center justify-center gap-1 text-gray-600'>
					<MapPin className='w-3 h-3' />
					<p className={`${config.textClass} text-center truncate`}>{jabatan}</p>
				</div>
			</div>
		</div>
	)
}

// Predefined variants for common use cases
export function CardStokLiteSmall({ nama, jabatan, foto }: Omit<CardStokLiteProps, 'size'>) {
	return <CardStokLite nama={nama} jabatan={jabatan} foto={foto} size="sm" />
}

export function CardStokLiteMedium({ nama, jabatan, foto }: Omit<CardStokLiteProps, 'size'>) {
	return <CardStokLite nama={nama} jabatan={jabatan} foto={foto} size="md" />
}

export function CardStokLiteLarge({ nama, jabatan, foto }: Omit<CardStokLiteProps, 'size'>) {
	return <CardStokLite nama={nama} jabatan={jabatan} foto={foto} size="lg" />
} 