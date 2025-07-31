"use client";
import AdmPenduduk from '@/components/AdmPenduduk';
import Berita from '@/components/Berita';
import Galeri from '@/components/Galeri';
import HeroCached from '@/components/HeroCached';
import Main from '@/components/Main';
import MapSimple from '@/components/MapSimple';
import Sambutan from '@/components/Sambutan';
import STOK from '@/components/STOK';


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
