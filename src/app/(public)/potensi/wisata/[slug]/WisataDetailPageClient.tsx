"use client";

import { useWisataBySlug } from "@/hooks/useWisata";
import { Loader2, MapPin, Calendar, ExternalLink, Instagram, Facebook, Twitter, Youtube, MessageCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IWisata } from '@/types/wisata-admin';
import { useParams } from "next/navigation";

export default function WisataDetailPageClient({ slug }: { slug: string }) {
  const { wisata, loading, error } = useWisataBySlug(slug);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram size={20} />;
      case 'facebook':
        return <Facebook size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      case 'youtube':
        return <Youtube size={20} />;
      case 'tiktok':
        return <MessageCircle size={20} />;
      default:
        return <ExternalLink size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat data wisata...</span>
      </div>
    );
  }

  if (error || !wisata) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{error || "Wisata tidak ditemukan"}</p>
          <Link href="/potensi/wisata" className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">
            Kembali ke daftar wisata
          </Link>
        </div>
      </div>
    );
  }

  // Pastikan gambar ada, jika tidak gunakan gambar placeholder
  const images = wisata.gambar && wisata.gambar.length > 0
    ? wisata.gambar
    : ['/images/wisata-placeholder.jpg']; // Ganti dengan path gambar placeholder Anda

  // Pastikan social media ada, jika tidak gunakan objek kosong
  const socialMedia = wisata.socialMedia || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Beranda</Link>
            <span>/</span>
            <Link href="/potensi/wisata" className="hover:text-blue-600">Wisata</Link>
            <span>/</span>
            <span className="text-gray-900">{wisata.nama || 'Wisata Tanpa Nama'}</span>
          </div>
        </div>
      </div>

      {/* HERO IMAGE */}
      <div className="relative h-96">
        <Image
          src={images[0]}
          alt={wisata.altText || wisata.nama || 'Gambar Wisata'}
          fill
          className="object-cover"
        />
        {/* Overlay dengan gambar yang sama tapi blur */}
        <div className="absolute inset-0">
          <Image
            src={images[0]}
            alt={wisata.altText || wisata.nama || 'Gambar Wisata'}
            fill
            className="object-cover blur-md opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{wisata.nama || 'Wisata Tanpa Nama'}</h1>
            {wisata.tags && wisata.tags.length > 0 && (
              <div className="flex justify-center gap-2 flex-wrap">
                {wisata.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* DESKRIPSI */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Deskripsi</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  {wisata.deskripsiSingkat || 'Tidak ada deskripsi singkat tersedia.'}
                </p>
                {wisata.deskripsiLengkap ? (
                  <div
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: wisata.deskripsiLengkap.replace(/\n/g, '<br />')
                    }}
                  />
                ) : (
                  <p className="text-gray-500 italic">Tidak ada deskripsi lengkap tersedia.</p>
                )}
              </div>
            </div>

            {/* GALERI */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Galeri</h2>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((url: string, index: number) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`${wisata.nama || 'Wisata'} - Gambar ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Tidak ada gambar galeri tersedia.</p>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* INFORMASI */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi</h3>

              {/* LOKASI */}
              {wisata.lokasiLink ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} />
                    <span>Lokasi</span>
                  </div>
                  <a
                    href={wisata.lokasiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Lihat di Google Maps
                  </a>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} />
                    <span>Lokasi</span>
                  </div>
                  <p className="text-gray-500 text-sm italic">Informasi lokasi tidak tersedia</p>
                </div>
              )}

              {/* TANGGAL */}
              {wisata.createdAt ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Ditambahkan {new Date(wisata.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span className="text-gray-500 italic">Tanggal tidak tersedia</span>
                  </div>
                </div>
              )}
            </div>

            {/* LINKS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Terkait</h3>

              <div className="space-y-3">
                {wisata.linkWebsite ? (
                  <a
                    href={wisata.linkWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm">Website</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <ExternalLink size={16} />
                    <span className="text-sm italic">Website tidak tersedia</span>
                  </div>
                )}

                {wisata.linkPendaftaran ? (
                  <a
                    href={wisata.linkPendaftaran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Daftar Sekarang
                  </a>
                ) : (
                  <div className="block w-full bg-gray-300 text-gray-600 text-center px-4 py-2 rounded-lg text-sm cursor-not-allowed">
                    Pendaftaran Tidak Tersedia
                  </div>
                )}
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Sosial</h3>
              {Object.keys(socialMedia).length > 0 && Object.values(socialMedia).some(val => val) ? (
                <div className="flex gap-3">
                  {Object.entries(socialMedia).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={url} // Langsung gunakan URL tanpa perlu fungsi getSocialUrl
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={platform}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Media sosial tidak tersedia</p>
              )}
            </div>

            {/* BACK BUTTON */}
            <Link
              href="/potensi/wisata"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Kembali ke Daftar Wisata</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}