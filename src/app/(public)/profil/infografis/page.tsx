import { Metadata } from 'next';
import InfografiPageClient from './InfografisPageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Infografis',
	description: 'Website resmi Desa Benteng Gajah',
	keywords: ' benteng gajah, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function InfografiPage() {
	return <InfografiPageClient />
}