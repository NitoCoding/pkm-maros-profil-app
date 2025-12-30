import { Metadata } from 'next'
import InovasiPageClient from './InovasiPageClient'
import PageWrapper from '@/components/layout/PageWrapper'

// Generate metadata for this page
export const metadata: Metadata = {
    title: 'Inovasi',
    description: 'Temukan terobosan kreatif dari warga Desa Benteng Gajah',
    keywords: 'inovasi, desa, benteng gajah, informasi',
    openGraph: {
        title: 'Inovasi Desa Benteng Gajah',
        description: 'Temukan terobosan kreatif dari warga Desa Benteng Gajah',
        type: 'website',
    },
}

export default function InovasiPage() {
    return (
        PageWrapper({
            title: 'Inovasi Desa',
            description: 'Temukan terobosan kreatif dari warga Desa Benteng Gajah',
            children: <InovasiPageClient />,
        })
    )
}