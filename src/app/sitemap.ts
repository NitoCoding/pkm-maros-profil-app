import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.kelurahanbilokka.my.id'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/layanan`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pengumuman`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // Dynamic pages for berita (if you have a database)
  // Uncomment and modify this section when you have a database
  /*
  try {
    // Fetch berita from your database
    const beritaResponse = await fetch(`${baseUrl}/api/berita`)
    const berita = await beritaResponse.json()
    
    const beritaPages = berita.map((item: any) => ({
      url: `${baseUrl}/berita/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Fetch pengumuman from your database
    const pengumumanResponse = await fetch(`${baseUrl}/api/pengumuman`)
    const pengumuman = await pengumumanResponse.json()
    
    const pengumumanPages = pengumuman.map((item: any) => ({
      url: `${baseUrl}/pengumuman/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...beritaPages, ...pengumumanPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
  */

  return staticPages
} 