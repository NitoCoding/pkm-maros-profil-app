import { Metadata } from 'next';
import InfografiPageClient from './InfografisPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Infografis',
	description: 'Website resmi Kelurahan Bilokka',
	keywords: 'kelurahan, bilokka, pemerintah, desa',
	openGraph: {
		title: 'Kelurahan Bilokka',
		description: 'Website resmi Kelurahan Bilokka',
		type: 'website',
	},
}

export default function InfografiPage() {
	return <InfografiPageClient />
}