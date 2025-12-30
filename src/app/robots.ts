import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow specific paths if needed
      // disallow: '/private/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}