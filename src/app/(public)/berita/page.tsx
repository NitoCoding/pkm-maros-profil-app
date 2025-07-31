import { Metadata } from 'next'
import BeritaPageClient from './BeritaPageClient'

// Generate metadata for this page
export const metadata: Metadata = {
	title: 'Berita',
	description: 'Berita dan informasi terkini seputar Kelurahan Bilokka',
	keywords: 'berita, kelurahan, bilokka, informasi',
	openGraph: {
		title: 'Berita Kelurahan Bilokka',
		description: 'Berita dan informasi terkini seputar Kelurahan Bilokka',
		type: 'website',
	},
}

export default function BeritaPage() {
	return <BeritaPageClient />
}