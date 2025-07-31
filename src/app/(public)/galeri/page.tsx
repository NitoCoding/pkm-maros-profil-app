import { Metadata } from 'next';
import GaleriPageClient from './GaleriPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Galeri',
	description: 'Website resmi Kelurahan Bilokka',
	keywords: 'kelurahan, bilokka, pemerintah, desa',
	openGraph: {
		title: 'Kelurahan Bilokka',
		description: 'Website resmi Kelurahan Bilokka',
		type: 'website',
	},
}

export default function GaleriPage() {
	return <GaleriPageClient />
}