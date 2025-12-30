'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, ExternalLink, Instagram, Facebook, Twitter, Youtube, MessageCircle } from 'lucide-react'
import { IWisata } from '@/types/wisata-admin'

export default function WisataCard({ wisata }: { wisata: IWisata }) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram size={16} />
      case 'facebook':
        return <Facebook size={16} />
      case 'twitter':
        return <Twitter size={16} />
      case 'youtube':
        return <Youtube size={16} />
      case 'tiktok':
        return <MessageCircle size={16} />
      default:
        return <ExternalLink size={16} />
    }
  }

  const getSocialUrl = (platform: string, value: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${value.replace('@', '')}`
      case 'facebook':
        return `https://facebook.com/${value}`
      case 'twitter':
        return `https://twitter.com/${value}`
      case 'youtube':
        return `https://youtube.com/${value}`
      case 'tiktok':
        return `https://tiktok.com/@${value}`
      case 'whatsapp':
        return `https://wa.me/${value}`
      default:
        return value
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* GAMBAR UTAMA */}
      {wisata.gambar && wisata.gambar.length > 0 && (
        <div className="relative h-48">
          <Image
            src={wisata.gambar[0]}
            alt={wisata.altText || wisata.nama}
            fill
            className="object-cover"
          />
          {wisata.tags && wisata.tags.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {wisata.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* NAMA DAN DESKRIPSI */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{wisata.nama}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {wisata.deskripsiSingkat}
        </p>

        {/* LOKASI */}
        {wisata.lokasiLink && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <MapPin size={16} />
            <a
              href={wisata.lokasiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Lihat di Maps
            </a>
          </div>
        )}

        {/* TANGGAL */}
        {wisata.createdAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Calendar size={16} />
            <span>Ditambahkan {new Date(wisata.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
        )}

        {/* SOCIAL MEDIA */}
        {wisata.socialMedia && (
          <div className="flex items-center gap-3 mb-4">
            {Object.entries(wisata.socialMedia).map(([platform, value]) => (
              value && (
                <a
                  key={platform}
                  href={getSocialUrl(platform, value)}
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
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          <Link
            href={`/potensi/wisata/${wisata.slug}`}
            className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Lihat Detail
          </Link>
          {wisata.linkPendaftaran && (
            <a
              href={wisata.linkPendaftaran}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
            >
              Daftar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
