import { Metadata } from "next";
import WisataDetailPageClient from "./WisataDetailPageClient";
import PageWrapper from "@/components/layout/PageWrapper";

// 1. Definisikan tipe untuk props halaman (params dan searchParams)
interface PageProps {
  params: Promise<{ slug: string }>;
  // searchParams juga Promise di Next.js 15:
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>; 
}

// 2. Gunakan tipe PageProps yang benar untuk generateMetadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params karena sekarang Promise
  const { slug } = await params;
  
  // TODO: Fetch wisata data di sini untuk metadata dinamis
  // const wisataData = await fetchWisataBySlug(slug); 
  
  return {
    title: `Wisata - ${slug}`, // Contoh title dinamis
    description: "Detail destinasi wisata di Desa Benteng Gajah",
  };
}

// 3. Gunakan tipe PageProps yang sama untuk fungsi default export
export default async function WisataDetailPage({ params }: PageProps) {
  // Await params karena sekarang Promise
  const { slug } = await params;
  
  return (
    <PageWrapper
      title={`Wisata - ${slug}`}
      description="Detail destinasi wisata di Desa Benteng Gajah"
    >
      <WisataDetailPageClient slug={slug} />
    </PageWrapper>
  )
}