import { Metadata } from 'next'

import PageWrapper from '@/components/layout/PageWrapper'
import UmkmPageClient from './UmkmPageClient'

// Generate metadata for this page
export const metadata: Metadata = {
    title: 'UMKM',
    description: 'Usaha Mikro, Kecil, dan Menengah di Desa Benteng Gajah',
    keywords: 'umkm, desa, benteng gajah, informasi',
    openGraph: {
        title: 'UMKM Desa Benteng Gajah',
        description: 'Usaha Mikro, Kecil, dan Menengah di Desa Benteng Gajah',
        type: 'website',
    },
}

export default function UMKMPage() {
    return (
        <PageWrapper
            title="UMKM Desa Benteng Gajah"
            description="Dukung produk lokal kami, hasil kreativitas warga Desa Benteng Gajah"
        >
            <UmkmPageClient />
        </PageWrapper>
    )
}