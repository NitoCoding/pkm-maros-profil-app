// "use client";

import Hero from '@/components/Hero'
// import Image from 'next/image'
// import PageHead from '@/components/PageHead'
// import HeroDashboard from '@/components/HeroDashboard';
import { Metadata } from 'next';
import HomePageClient from './HomePageClient';
// import SambutanCached from '@/components/SambutanCached';

export const metadata: Metadata = {
	title: 'Beranda',
	description: 'Website resmi Desa Benteng Gajah',
	keywords: 'kelurahan, bilokka, Desa Benteng Gajah, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function HomePage() {
	return <HomePageClient />
}
