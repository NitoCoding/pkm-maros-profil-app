import Image from 'next/image';
import { IBerita } from '@/types/berita';
import { Calendar } from 'lucide-react';
import { getHTMLPreview, estimateReadingTime } from '@/libs/utils/htmlUtils';
import { formatDateLong } from '@/libs/utils/date';

export default function BeritaCard({ berita }: { berita: IBerita }) {
	return (
		<div className="w-full max-w-sm mx-auto">
			<div className="flex flex-col w-full bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl overflow-hidden">
				<div className="overflow-hidden h-48 sm:h-52">
					<Image
						src={berita.gambar || '/default-image.jpg'}
						alt={berita.judul}
						width={400}
						height={240}
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="flex flex-col flex-1 p-4 sm:p-6">
					<div className="flex-1">
						<h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2 text-gray-800">{berita.judul}</h3>
						<p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
							{getHTMLPreview(berita.isi, 120)}
						</p>
						<div className="text-xs text-gray-400 mb-3">
							{estimateReadingTime(berita.isi)}
						</div>
					</div>
					
					<div className="flex items-center justify-between pt-3 border-t border-gray-100">
						<span className="text-gray-500 flex items-center text-xs sm:text-sm">
							<Calendar className="mr-1" size={16}/> 
							{formatDateLong(berita.createdAt)}
						</span>
						<a
							href={`/berita/${berita.slug}`}
							className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
						>
							Baca Selengkapnya
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}