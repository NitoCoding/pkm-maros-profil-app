import { Metadata } from 'next';
import TentangPageClient from './TentangPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Tentang',
	description: 'Website resmi Kelurahan Bilokka',
	keywords: 'kelurahan, bilokka, pemerintah, desa',
	openGraph: {
		title: 'Kelurahan Bilokka',
		description: 'Website resmi Kelurahan Bilokka',
		type: 'website',
	},
}

export default function TentangPage() {
	return <TentangPageClient />
}   