// app/layout.jsx
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import StructuredData, { organizationData, websiteData } from '@/components/utils/StructuredData';

export const metadata: Metadata = {
    title: {
        default: 'Desa Benteng Gajah - Website Resmi',
        template: '%s | Desa Benteng Gajah',
    },
    description: 'Website resmi Desa Benteng Gajah. Informasi layanan publik, berita, pengumuman, dan data kelurahan untuk masyarakat.',
    keywords: [
        'Desa Benteng Gajah',
        'website resmi kelurahan',
        'layanan publik',
        'informasi kelurahan',
        'pengumuman kelurahan',
        'berita kelurahan',
        'data kelurahan',
        'administrasi kelurahan'
    ],
    authors: [{ name: 'Desa Benteng Gajah' }],
    creator: 'Desa Benteng Gajah',
    publisher: 'Desa Benteng Gajah',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
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
        title: 'Desa Benteng Gajah - Website Resmi',
        description: 'Website resmi Desa Benteng Gajah, menyediakan informasi dan layanan untuk masyarakat.',
        type: 'website',
        locale: 'id_ID',
        url: 'https://www.desabentenggajah.com',
        siteName: 'Desa Benteng Gajah',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                alt: 'Logo Desa Benteng Gajah',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Desa Benteng Gajah - Website Resmi',
        description: 'Website resmi Desa Benteng Gajah, menyediakan informasi dan layanan untuk masyarakat.',
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