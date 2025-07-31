// app/layout.jsx
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: 'Kelurahan Bilokka',
        template: '%s ⋅ Kelurahan Bilokka',
    },
    description: 'Website resmi Kelurahan Bilokka',
    keywords: ['kelurahan', 'bilokka', 'website resmi', 'informasi publik'],
    openGraph: {
        title: 'Kelurahan Bilokka - Website Resmi',
        description: 'Website resmi Kelurahan Bilokka, menyediakan informasi dan layanan untuk masyarakat.',
        type: 'website',
        locale: 'id_ID',
        url: 'https://www.kelurahanbilokka.my.id',
        siteName: 'Kelurahan Bilokka',
        images: [
            {
                url: '/favicon.svg',
                width: 1200,
                height: 630,
                alt: 'Kelurahan Bilokka',
            },
        ],
    },
    manifest: '/site.webmanifest',
    icons: {
        icon: '/favicon.svg',
        apple: '/apple-touch-icon.png',
        shortcut: '/web-app-manifest-192x192.png',
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
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}