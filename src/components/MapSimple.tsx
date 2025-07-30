'use client'

import {IGeografi} from '@/types/geografi'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {useEffect, useState} from 'react'

// Import CSS untuk leaflet
import 'leaflet/dist/leaflet.css'

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const MapFix = dynamic(() => import('./MapFix'), { ssr: false })

// Data geografi lokal
const Geografi: IGeografi = {
	nama: 'Desa Bilokka',
	luasWilayah: 150.5,
	jumlahDesa: 10,
	jumlahDusun: 25,
	jumlahRW: 50,
	jumlahRT: 200,
	batasUtara: 'Sungai Besar',
	batasSelatan: 'Gunung Tinggi',
	batasTimur: 'Laut Selatan',
	batasBarat: 'Hutan Lindung',
	ketinggian: 300,
	koordinat: {
        
		latitude: -4.06115,
		longitude: 119.83009,
	},
	kondisiGeografis:
		'Daerah pegunungan dengan sungai yang mengalir di tengahnya.',
	potensiAlam: 'Pertanian, perikanan, dan pariwisata',
	penggunaanLahan: {
		pertanian: 60,
		perumahan: 20,
		hutan: 15,
		lainnya: 5,
	},
}

export default function MapSimple() {
	const [isClient, setIsClient] = useState(false)
	const [icon, setIcon] = useState<any>(null)
	const position: [number, number] = [
		Geografi.koordinat.latitude,
		Geografi.koordinat.longitude,
	]

	useEffect(() => {
		setIsClient(true)
		
		// Import leaflet hanya di client-side
		if (typeof window !== 'undefined') {
			import('leaflet').then((L) => {
				const newIcon = new L.Icon({
					iconUrl: '/logo.png',
					iconSize: [50, 50], // Ukuran ikon
				});
				setIcon(newIcon);
			});
		}
	}, [])

	if (!isClient || !icon) {
		return (
			<div className='w-full h-[500px] rounded-lg overflow-hidden shadow-md relative z-0 bg-gray-200 flex items-center justify-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-700'></div>
			</div>
		)
	}

	return (
		<div className='w-full h-[500px] rounded-lg overflow-hidden shadow-md relative z-0'>
			<MapContainer
				center={position}
				zoom={20}
				scrollWheelZoom={false}
				style={{width: '100%', height: '100%'}}
			>
                <MapFix />
                <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
				<Marker position={position} icon={icon} >
					<Popup>
						<div className='text-sm'>
							<p className='font-bold'>{Geografi.nama}</p>
							<p>Ketinggian: {Geografi.ketinggian} m</p>
							<p>
								Koordinat: {Geografi.koordinat.latitude},{' '}
								{Geografi.koordinat.longitude}
							</p>
							<Link 
								href="https://maps.app.goo.gl/fNawpkXyfaf82GYv8" 
								target='_blank'
								className='text-blue-600 hover:text-blue-800 underline'
							>
								Lihat di Google Maps
							</Link>
						</div>
					</Popup>
				</Marker>
			</MapContainer>
		</div>
	)
}
