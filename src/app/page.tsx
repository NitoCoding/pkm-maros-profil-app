"use client";

import Main from '@/components/Main'
import Hero from '@/components/Hero'
// import Image from 'next/image'
import Sambutan from '@/components/Sambutan'
import STOK from '@/components/STOK'
import AdmPenduduk from '@/components/AdmPenduduk'
import Berita from '@/components/Berita'
import MapSimple from '@/components/MapSimple'
import PageHead from '@/components/PageHead'
import Galeri from '@/components/Galeri'
import HeroDashboard from '@/components/HeroDashboard';
import HeroCached from '@/components/HeroCached';
import SambutanCached from '@/components/SambutanCached';

export default function HomePage() {
	return (
		<>
			<PageHead 
				title="Kelurahan Bilokka"
				description="Website resmi Kelurahan Bilokka"
				keywords="kelurahan, bilokka, pemerintah, desa"
			/>
			<div className='min-h-screen font-[family-name:var(--font-geist-sans)]'>
				<Main>
					<HeroCached />
					<Sambutan />
					<STOK />
					<AdmPenduduk />
					<Berita />
					<div className='px-4 sm:px-6 lg:px-8'>
						<div className='container mx-auto max-w-7xl'>
							<MapSimple />
						</div>
					</div>
					<Galeri />
				</Main>
			</div>
		</>
	)
}
