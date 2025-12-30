import { Metadata } from 'next';
import TentangPageClient from './TentangPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Tentang',
	description: 'Website resmi Desa Benteng Gajah',
	keywords: ' benteng gajah, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function TentangPage() {
	return <TentangPageClient />
}   