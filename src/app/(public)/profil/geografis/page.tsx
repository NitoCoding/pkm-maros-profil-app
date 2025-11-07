import { Metadata } from 'next';
import GeografisPageClient from './GeografisPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Geografis',
	description: 'Website resmi Desa Benteng Gajah',
	keywords: 'kelurahan, bilokka, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function GeografisPage() {
	return <GeografisPageClient />
}