// src/app/(public)/berita/page.tsx
import { Metadata } from 'next'
import BeritaPageClient from './BeritaPageClient'
import PageWrapper from '@/components/layout/PageWrapper'

export const metadata: Metadata = {
	title: 'Berita Desa Benteng Gajah',
	description: 'Berita dan informasi terkini seputar Desa Benteng Gajah',
	keywords: 'berita desa, benteng gajah, maros, informasi terkini',
	openGraph: {
		title: 'Berita Desa Benteng Gajah',
		description: 'Informasi terkini seputar kegiatan dan pengumuman resmi',
		type: 'website',
		url: 'https://desa-bentenggajah.com/berita',
	},
}

export default function BeritaPage() {
	return (
		<PageWrapper
			title="Berita"
			description="Informasi terkini seputar Desa Benteng Gajah"
			keywords="berita, pengumuman, desa benteng gajah"
		>
			<BeritaPageClient />
		</PageWrapper>
	)
}