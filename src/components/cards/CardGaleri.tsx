import Image from 'next/image';
import { IGaleri } from '@/types/galeri';
import { Calendar, Tag, Eye } from 'lucide-react';
import { formatDateLong } from '@/libs/utils/date';

export default function GaleriCard({ galeri }: { galeri: IGaleri }) {
	return (
		<div className="flex justify-center mx-auto">
			<div className="group relative w-[360px] h-[240px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
				{/* Background Image */}
				<Image
					src={galeri.src || '/default-galeri.jpg'}
					alt={galeri.alt || galeri.caption || 'Gambar galeri'}
					fill
					className="object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				
				{/* Gradient Overlay - always present but becomes stronger on hover */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-500" />
				
				{/* Year Badge - always visible */}
				<div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
					{galeri.tanggal ? new Date(galeri.tanggal).getFullYear() : 'N/A'}
				</div>

				{/* View Icon - appears on hover */}
				<div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
					<div className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full border border-white/30">
						<Eye size={16} />
					</div>
				</div>
				
				{/* Content Overlay */}
				<div className="absolute inset-0 flex flex-col justify-end p-4">
					{/* Caption - always visible */}
					{/* <div className="mb-2 transform transition-all duration-300 group-hover:translate-y-0">
						<h3 className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-lg">
							{galeri.caption || 'Tidak ada deskripsi'}
						</h3>
					</div> */}

					{/* Additional Info - slides up on hover */}
					<div className="transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-150 space-y-3">
					<div className="mb-2 transform transition-all duration-300 group-hover:translate-y-0">
						<h3 className="text-white text-sm font-semibold leading-tight line-clamp-2 drop-shadow-lg">
							{galeri.caption || 'Tidak ada deskripsi'}
						</h3>
					</div>
						{/* Date */}
						<div className="flex items-center text-white/90 text-xs">
							<Calendar className="mr-2" size={14} />
							<span className="drop-shadow">
								{galeri.tanggal ? formatDateLong(galeri.tanggal) : 'Tanggal tidak tersedia'}
							</span>
						</div>

						{/* Tags */}
						{galeri.tags && galeri.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{galeri.tags.slice(0, 3).map((tag, index) => (
									<span 
										key={index}
										className="inline-flex items-center px-2.5 py-1 text-xs bg-white/25 text-white rounded-full backdrop-blur-sm border border-white/20 font-medium"
									>
										<Tag size={10} className="mr-1" />
										{tag}
									</span>
								))}
								{galeri.tags.length > 3 && (
									<span className="inline-flex items-center px-2.5 py-1 text-xs bg-white/25 text-white rounded-full backdrop-blur-sm border border-white/20 font-medium">
										+{galeri.tags.length - 3}
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Hover Border Effect */}
				<div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/30 transition-all duration-300" />
			</div>
		</div>
	);
}
