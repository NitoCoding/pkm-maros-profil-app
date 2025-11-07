'use client'

import Script from 'next/script'

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Article' | 'NewsArticle'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// Predefined structured data for common types
export const organizationData = {
  name: 'Desa Benteng Gajah',
  url: 'https://www.kelurahanbilokka.my.id',
  logo: 'https://www.kelurahanbilokka.my.id/logo.png',
  description: 'Website resmi Desa Benteng Gajah, menyediakan informasi dan layanan untuk masyarakat.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bilokka',
    addressRegion: 'Nusa Tenggara Timur',
    addressCountry: 'ID',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Indonesian',
  },
  sameAs: [
    'https://www.facebook.com/kelurahanbilokka',
    'https://www.instagram.com/kelurahanbilokka',
  ],
}

export const websiteData = {
  name: 'Desa Benteng Gajah',
  url: 'https://www.kelurahanbilokka.my.id',
  description: 'Website resmi Desa Benteng Gajah',
  inLanguage: 'id-ID',
  isAccessibleForFree: true,
  publisher: {
    '@type': 'Organization',
    name: 'Desa Benteng Gajah',
  },
} 