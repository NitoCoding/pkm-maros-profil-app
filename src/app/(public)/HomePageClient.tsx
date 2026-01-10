"use client";
import AdmPenduduk from '@/components/utils/AdmPenduduk';
import Berita from '@/components/sections/Berita';
import Galeri from '@/components/sections/Galeri';
import HeroCached from '@/components/variants/Hero/HeroCached';
import Main from '@/components/layout/Main';
import MapSimple from '@/components/maps/MapSimple';
import Sambutan from '@/components/variants/Sambutan/Sambutan';
import STOK from '@/components/sections/STOK';


export default function HomePageClient() {
	return (
		<>
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
	);
}
