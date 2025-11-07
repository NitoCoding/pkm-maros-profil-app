import Image from 'next/image'
import { MapPin, Phone, DollarSign, Map, MessageCircle, ShoppingCart, ExternalLink, ChevronDown } from 'lucide-react'
import { IProdukUMKM } from '@/types/umkm'
import { useState } from 'react'

interface CardUmkmProps {
	umkm: IProdukUMKM
}

export default function CardUmkm({ umkm }: CardUmkmProps) {
	const [showMessageOptions, setShowMessageOptions] = useState(false)

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(price)
	}

	const getPriceRange = () => {
		// Sesuaikan dengan struktur data yang baru
		if (umkm.harga.awal === umkm.harga.akhir || umkm.harga.akhir === null) {
			return formatPrice(umkm.harga.awal)
		}
		return `${formatPrice(umkm.harga.awal)} - ${formatPrice(umkm.harga.akhir)}`
	}

	const handleWhatsAppClick = () => {
		const message = `Halo, saya tertarik dengan produk ${umkm.namaProduk} dari ${umkm.namaUMKM}. Bisa info lebih lanjut?`
		const whatsappUrl = `https://wa.me/${umkm.kontak.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
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

	const handleLinkClick = (url: string) => {
		window.open(url, '_blank')
	}
	// console.log(umkm.linkPenjualan.shopee);

	const hasLinkPenjualan = (): boolean => {
		const links = umkm.linkPenjualan;
		console.log("umkm.linkPenjualan:", links);

		if (!links) return false;

		// console.log("Link penjualan keys:", links.shopee);

		// Cek apakah ada minimal satu link yang valid (tidak kosong)
		return Object.values(links).some(value => Boolean(value && value.trim() !== ""));
	};


	// console.log(hasLinkPenjualan());

	return (
		<div className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col transform hover:-translate-y-1'>
			{/* Image with gradient overlay */}
			<div className='relative h-48 w-full overflow-hidden'>
				<Image
					src={umkm.gambar}
					alt={umkm.namaProduk}
					fill
					className='object-cover transition-transform duration-300 hover:scale-105'
					sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent'></div>

				{/* Category Badge */}
				<div className='absolute top-3 left-3'>
					<span className='inline-block bg-blue-600/90 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm'>
						{umkm.kategori}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className='p-4 flex-1 flex flex-col'>
				{/* UMKM Name */}
				<div className='flex items-center gap-2 mb-1'>
					<div className='w-2 h-2 bg-green-500 rounded-full'></div>
					<span className='text-sm text-gray-600 font-medium'>{umkm.namaUMKM}</span>
				</div>

				{/* Title */}
				<h3 className='text-lg font-bold text-gray-900 mb-2 line-clamp-2'>
					{umkm.namaProduk}
				</h3>

				{/* Description */}
				<p className='text-gray-600 text-sm mb-3 line-clamp-2 flex-1'>
					{umkm.deskripsi}
				</p>

				{/* Price */}
				<div className='flex items-center gap-2 mb-3 bg-green-50 px-3 py-2 rounded-lg'>
					{/* <DollarSign size={18} className='text-green-600' /> */}
					<span className='text-green-700 font-bold text-lg'>
						{getPriceRange()}
					</span>
				</div>

				{/* Phone */}
				<div className='flex items-center gap-2 mb-3 bg-gray-50 px-3 py-2 rounded-lg'>
					<Phone size={16} className='text-gray-500' />
					<span className='text-gray-700 text-sm font-medium'>{umkm.kontak.telepon}</span>
				</div>

				{/* Location */}
				<div className='flex items-start gap-2 mb-4 bg-gray-50 px-3 py-2 rounded-lg min-h-[40px]'>
					<MapPin size={16} className='text-gray-500 mt-0.5 flex-shrink-0' />
					<span className='text-gray-700 text-sm line-clamp-2'>
						{umkm.lokasi.alamat}
					</span>
				</div>

				{/* Action Buttons */}
				<div className='flex gap-2 mt-auto'>
					{/* Message Button with Dropdown */}
					<div className='relative flex-1'>
						<button
							onClick={() => setShowMessageOptions(!showMessageOptions)}
							className='w-full bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2'
							title='Pesan Produk'
						>
							<MessageCircle size={16} />
							Pesan
							<ChevronDown size={14} className={`transition-transform ${showMessageOptions ? 'rotate-180' : ''}`} />
						</button>

						{showMessageOptions && (
							<div className='absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden'>
								<button
									onClick={() => {
										handleWhatsAppClick()
										setShowMessageOptions(false)
									}}
									className='w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3'
								>
									<div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
										<MessageCircle size={16} className='text-white' />
									</div>
									<div>
										<div className='font-medium text-sm'>WhatsApp</div>
										<div className='text-xs text-gray-500'>Chat langsung dengan penjual</div>
									</div>
								</button>

								{hasLinkPenjualan() && (
									<div className='border-t border-gray-100'>
										<div className='px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600'>
											Beli Online
										</div>

										{umkm.linkPenjualan.shopee && (
											<button
												onClick={() => {
													handleLinkClick(umkm.linkPenjualan.shopee!)
													setShowMessageOptions(false)
												}}
												className='w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3'
											>
												<div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center'>
													<ShoppingCart size={16} className='text-white' />
												</div>
												<div>
													<div className='font-medium text-sm'>Shopee</div>
													<div className='text-xs text-gray-500'>Beli di Shopee</div>
												</div>
											</button>
										)}

										{umkm.linkPenjualan.tokopedia && (
											<button
												onClick={() => {
													handleLinkClick(umkm.linkPenjualan.tokopedia!)
													setShowMessageOptions(false)
												}}
												className='w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3'
											>
												<div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center'>
													<ShoppingCart size={16} className='text-white' />
												</div>
												<div>
													<div className='font-medium text-sm'>Tokopedia</div>
													<div className='text-xs text-gray-500'>Beli di Tokopedia</div>
												</div>
											</button>
										)}

										{umkm.linkPenjualan.website && (
											<button
												onClick={() => {
													handleLinkClick(umkm.linkPenjualan.website!)
													setShowMessageOptions(false)
												}}
												className='w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3'
											>
												<div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
													<ExternalLink size={16} className='text-white' />
												</div>
												<div>
													<div className='font-medium text-sm'>Website</div>
													<div className='text-xs text-gray-500'>Beli di website resmi</div>
												</div>
											</button>
										)}

										{/* Render additional links */}
										{Object.keys(umkm.linkPenjualan)
											.filter(key => key !== 'shopee' && key !== 'tokopedia' && key !== 'website' && umkm.linkPenjualan[key])
											.map(key => (
												<button
													key={key}
													onClick={() => {
														handleLinkClick(umkm.linkPenjualan[key]!)
														setShowMessageOptions(false)
													}}
													className='w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3'
												>
													<div className='w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center'>
														<ExternalLink size={16} className='text-white' />
													</div>
													<div>
														<div className='font-medium text-sm capitalize'>{key}</div>
														<div className='text-xs text-gray-500'>Beli di {key}</div>
													</div>
												</button>
											))
										}
									</div>
								)}
							</div>
						)}
					</div>

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