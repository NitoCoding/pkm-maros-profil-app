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
	keywords: 'Desa Benteng Gajah, pemerintah, desa',
	openGraph: {
		title: 'Desa Benteng Gajah',
		description: 'Website resmi Desa Benteng Gajah',
		type: 'website',
	},
}

export default function HomePage() {
	return <HomePageClient />
	// return (
	// <main className="min-h-screen flex items-center justify-center bg-gray-50">
    //   <div className="force-tailwind">TEST</div>
    // </main>
	// )
}
