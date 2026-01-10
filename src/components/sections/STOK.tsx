'use client'

import {IPegawai} from '@/types/pegawai'

import { usePegawai } from '@/hooks/usePegawai'
import { Loader2 } from 'lucide-react'
import HeaderPage from '../layout/HeaderPage';
import CardStok from '../cards/CardStok';

export default function STOK() {
	const { pegawai, loading, error, refresh } = usePegawai({ pageSize: 4 }); // Get more pegawai for display
	// // console.log('STOK pegawai data:', pegawai);
	return (
		<div className='px-4 sm:px-6 lg:px-8'>
			<div className='container mx-auto max-w-7xl'>
				<HeaderPage
					title='STOK'
					description='Struktur Organisasi dan Tata Kerja Desa Benteng Gajah'
				/>
				
				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="animate-spin h-8 w-8 text-blue-600" />
						<span className="ml-2 text-gray-600">Memuat data pegawai...</span>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="text-center py-12">
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto mb-4">
							<p className="font-medium">Gagal memuat data pegawai</p>
							<p className="text-sm">{error}</p>
						</div>
						<button
							onClick={refresh}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Coba Lagi
						</button>
					</div>
				)}

				{/* Empty State */}
				{!loading && !error && pegawai.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-600 text-lg">
							Belum ada data pegawai yang tersedia
						</p>
					</div>
				)}

				{/* Pegawai Cards */}
				{!loading && !error && pegawai.length > 0 && (
					<div className='flex gap-4 md:justify-center md:flex-wrap justify-center flex-wrap'>
						{pegawai.map((item: IPegawai) => (
							<CardStok
								key={item.id}
								foto={item.fotoUrl}
								nama={item.nama}
								jabatan={item.jabatan}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
