import { Metadata } from 'next';
import GeografisPageClient from './GeografisPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Geografis',
	description: 'Website resmi Kelurahan Bilokka',
	keywords: 'kelurahan, bilokka, pemerintah, desa',
	openGraph: {
		title: 'Kelurahan Bilokka',
		description: 'Website resmi Kelurahan Bilokka',
		type: 'website',
	},
}

export default function GeografisPage() {
	return <GeografisPageClient />
}