import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/berita`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/galeri`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/umkm`, changeFrequency: "weekly", priority: 0.8 },
    // PROFI
    { url: `${baseUrl}/profil/tentang`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/profil/infografis`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/profil/geografis`, changeFrequency: "monthly", priority: 0.7 },
    // POTENSI
    { url: `${baseUrl}/potensi/wisata`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/potensi/inovasi`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
