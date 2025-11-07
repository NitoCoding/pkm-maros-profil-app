import { Metadata } from 'next';
import GaleriPageClient from './GaleriPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Galeri',
	description: 'Website resmi Desa Benteng Gajah',
	keywords: 'kelurahan, bilokka, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function GaleriPage() {
	return <GaleriPageClient />
}