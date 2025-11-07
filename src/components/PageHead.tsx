'use client'

import Head from 'next/head'

interface PageHeadProps {
	title?: string
	description?: string
	keywords?: string
	ogTitle?: string
	ogDescription?: string
	ogType?: string
}

export default function PageHead({
	title = 'Desa Benteng Gajah',
	description = 'Website resmi Desa Benteng Gajah',
	keywords = 'kelurahan, bilokka, pemerintah, desa',
	ogTitle,
	ogDescription,
	ogType = 'website'
}: PageHeadProps) {
	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords} />
			
			{/* Open Graph */}
			<meta property="og:title" content={ogTitle || title} />
			<meta property="og:description" content={ogDescription || description} />
			<meta property="og:type" content={ogType} />
			
			{/* Twitter Card */}
			<meta name="twitter:title" content={ogTitle || title} />
			<meta name="twitter:description" content={ogDescription || description} />
			<meta name="twitter:card" content="summary_large_image" />
		</Head>
	)
} 