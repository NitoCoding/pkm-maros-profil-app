import Image from 'next/image'
import { MapPin, Phone, DollarSign, Map, MessageCircle } from 'lucide-react'
import { IUMKM } from '@/types/umkm'

interface CardUmkmProps {
	umkm: IUMKM
}

export default function CardUmkm({ umkm }: CardUmkmProps) {
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(price)
	}

	const getPriceRange = () => {
		if (umkm.startPrice === umkm.endPrice) {
			return formatPrice(umkm.startPrice)
		}
		return `${formatPrice(umkm.startPrice)} - ${formatPrice(umkm.endPrice)}`
	}

	const handleWhatsAppClick = () => {
		const message = `Halo, saya tertarik dengan produk ${umkm.nama}. Bisa info lebih lanjut?`
		const whatsappUrl = `https://wa.me/${umkm.telepon.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
		window.open(whatsappUrl, '_blank')
	}

	const handleMapsClick = () => {
		if (umkm.lokasi.googleMapsLink) {
			window.open(umkm.lokasi.googleMapsLink, '_blank')
		} else {
			// Fallback to Google Maps with coordinates
			const mapsUrl = `https://maps.google.com/?q=${umkm.lokasi.latitude},${umkm.lokasi.longitude}`
			window.open(mapsUrl, '_blank')
		}
	}

	return (
		<div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full h-full flex flex-col'>
			{/* Image */}
			<div className='relative h-48 w-full'>
				<Image
					src={umkm.gambar}
					alt={umkm.nama}
					fill
					className='object-cover'
					sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
				/>
			</div>

			{/* Content */}
			<div className='p-4 flex-1 flex flex-col'>
				{/* Category Badge */}
				<div className='mb-2'>
					<span className='inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded'>
						{umkm.kategori}
					</span>
				</div>

				{/* Title */}
				<h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
					{umkm.nama}
				</h3>

				{/* Description */}
				<p className='text-gray-600 text-sm mb-3 line-clamp-3 flex-1'>
					{umkm.deskripsi}
				</p>

				{/* Price */}
				<div className='flex items-center gap-1 mb-3'>
					<DollarSign size={16} className='text-green-600' />
					<span className='text-green-600 font-semibold'>
						{getPriceRange()}
					</span>
				</div>

				{/* Phone */}
				<div className='flex items-center gap-2 mb-3'>
					<Phone size={16} className='text-gray-500' />
					<span className='text-gray-700 text-sm'>{umkm.telepon}</span>
				</div>

				{/* Location */}
				<div className='flex items-start gap-2 mb-4 min-h-[40px]'>
					<MapPin size={16} className='text-gray-500 mt-0.5 flex-shrink-0' />
					<span className='text-gray-700 text-sm line-clamp-2'>
						{umkm.lokasi.alamat}
					</span>
				</div>

				{/* Action Buttons */}
				<div className='flex gap-2 mt-auto'>
					{/* WhatsApp Button */}
					<button
						onClick={handleWhatsAppClick}
						className='flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2'
						title='Hubungi via WhatsApp'
					>
						<MessageCircle size={16} />
						WhatsApp
					</button>

					{/* Maps Button */}
					<button
						onClick={handleMapsClick}
						className='flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2'
						title='Lihat di Google Maps'
					>
						<Map size={16} />
						Maps
					</button>
				</div>
			</div>
		</div>
	)
}
