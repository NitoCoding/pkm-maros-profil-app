import { Metadata } from 'next'
import WisataPageClient from './WisataPageClient'
import PageWrapper from '@/components/layout/PageWrapper'

// Generate metadata for this page
export const metadata: Metadata = {
    title: 'Wisata',
    description: 'Jelajahi destinasi menarik di Desa Benteng Gajah',
    keywords: 'wisata, desa, benteng gajah, informasi',
    openGraph: {
        title: 'Wisata Desa Benteng Gajah',
        description: 'Jelajahi destinasi menarik di Desa Benteng Gajah',
        type: 'website',
    },
}

export default function WisatePage() {
    return (
        <PageWrapper
            title="Wisata Desa Benteng Gajah"
            description="Jelajahi destinasi menarik di Desa Benteng Gajah"
        >
            <WisataPageClient />
        </PageWrapper>
    )
}