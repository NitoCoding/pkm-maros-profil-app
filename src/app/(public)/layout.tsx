import { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import FooterCached from '@/components/FooterCached'
import CacheDebugger from '@/components/CacheDebugger'

// Metadata untuk layout publik
// export const metadata: Metadata = {
//     title: 'Halaman Publik',
//     description: 'Website resmi Desa Benteng Gajah'
// }

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function PublicLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            {/* NAVBAR PUBLIK */}
            <Navbar />

            {/* Konten Publik */}
            <main>{children}</main>

            {/* FOOTER PUBLIK */}
            <FooterCached />

            {/* Cache Debugger (Development Only) */}
            {/* <CacheDebugger /> */}
        </>
    )
}
