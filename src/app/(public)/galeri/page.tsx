import { Metadata } from 'next';
import GaleriPageClient from './GaleriPageClient';
import PageWrapper from '@/components/layout/PageWrapper';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Galeri',
	description: 'Website resmi Desa Benteng Gajah',
	keywords: ' benteng gajah, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function GaleriPage() {
	return (
		<PageWrapper
			title="Galeri"
			description="Dokumentasi dan momen-momen berharga dari Desa Benteng Gajah"
			keywords="galeri, pengumuman, desa benteng gajah"
		>
			<GaleriPageClient />
		</PageWrapper>
	)
}