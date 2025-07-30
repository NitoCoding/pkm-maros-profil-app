'use client'

import {Geist, Geist_Mono} from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { usePathname } from 'next/navigation'
import FooterCached from '@/components/FooterCached'
import CacheDebugger from '@/components/CacheDebugger'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

// export const metadata: Metadata = {
// 	title: 'Kelurahan Bilokka',
// 	description: 'Website resmi Kelurahan Bilokka',
// }

export default function PublicLayout({children}: {children: React.ReactNode}) {
	const pathname = usePathname()

	// Check if the current path is the admin path
	const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/login')
	// If it's an admin path, return the admin layout
	if (isAdminPath) {
		return (
			<html lang='en'>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					{children}
				</body>
			</html>
		)
	}

	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{/* NAVBAR PUBLIK */}
				<Navbar />

				{/* Konten Publik */}

				{/* Konten Umum */}
				<main>{children}</main>

				{/* FOOTER PUBLIK */}
				<FooterCached />

				{/* Cache Debugger (Development Only) */}
				{/* <CacheDebugger /> */}
			</body>
		</html>
	)
}
