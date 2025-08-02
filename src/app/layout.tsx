// app/layout.jsx
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import StructuredData, { organizationData, websiteData } from '@/components/StructuredData';

export const metadata: Metadata = {
    title: {
        default: 'Kelurahan Bilokka - Website Resmi',
        template: '%s | Kelurahan Bilokka',
    },
    description: 'Website resmi Kelurahan Bilokka. Informasi layanan publik, berita, pengumuman, dan data kelurahan untuk masyarakat.',
    keywords: [
        'kelurahan bilokka',
        'website resmi kelurahan',
        'layanan publik',
        'informasi kelurahan',
        'pengumuman kelurahan',
        'berita kelurahan',
        'data kelurahan',
        'administrasi kelurahan'
    ],
    authors: [{ name: 'Kelurahan Bilokka' }],
    creator: 'Kelurahan Bilokka',
    publisher: 'Kelurahan Bilokka',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://www.kelurahanbilokka.my.id'),
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Kelurahan Bilokka - Website Resmi',
        description: 'Website resmi Kelurahan Bilokka, menyediakan informasi dan layanan untuk masyarakat.',
        type: 'website',
        locale: 'id_ID',
        url: 'https://www.kelurahanbilokka.my.id',
        siteName: 'Kelurahan Bilokka',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                alt: 'Logo Kelurahan Bilokka',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Kelurahan Bilokka - Website Resmi',
        description: 'Website resmi Kelurahan Bilokka, menyediakan informasi dan layanan untuk masyarakat.',
        images: ['/logo.png'],
    },
    manifest: '/site.webmanifest',
    icons: {
        icon: '/favicon.svg',
        apple: '/web-app-manifest-192x192.png',
        shortcut: '/web-app-manifest-192x192.png',
    },
    verification: {
        google: 'google123456789', // Ganti dengan kode verifikasi Google Search Console yang sebenarnya
    },
    icons: {
        icon: '/favicon.svg',
    },
};

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <head>
                <StructuredData type="Organization" data={organizationData} />
                <StructuredData type="WebSite" data={websiteData} />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}