import { Metadata } from 'next'
import BeritaPageClient from './BeritaPageClient'

// Generate metadata for this page
export const metadata: Metadata = {
	title: 'Berita',
	description: 'Berita dan informasi terkini seputar Desa Benteng Gajah',
	keywords: 'berita, kelurahan, bilokka, informasi',
	openGraph: {
		title: 'Berita Desa Benteng Gajah',
		description: 'Berita dan informasi terkini seputar Desa Benteng Gajah',
		type: 'website',
	},
}

export default function BeritaPage() {
	return <BeritaPageClient />
}