'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Plus, Edit, Loader2, Search, X, ChevronLeft, ChevronRight, EyeIcon } from 'lucide-react'
import { useWisataAdminPaginated } from '@/hooks/useWisata'
import { toast } from 'react-hot-toast'
import { IWisata } from '@/types/wisata-admin'
import { WisataAdminFilters, wisataPageSizeOptions } from '@/libs/constant/wisataFilter'
import Image from 'next/image'

export default function AdminWisataPage() {
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<WisataAdminFilters>({
    search: ''
  })
  const [deleting, setDeleting] = useState<string | null>(null)

  const { wisata, loading, error, total, page, totalPages, setPage, refresh } =
    useWisataAdminPaginated({
      pageSize: pageSize,
      filters: filters
    })

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus wisata "${nama}"?`)) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/wisata?id=${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'Gagal menghapus wisata')

      toast.success('Wisata berhasil dihapus')
      refresh()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menghapus wisata')
      console.error('Error deleting wisata:', error)
    } finally {
      setDeleting(null)
    }
  }

  const resetFilters = () => {
    setFilters({
      search: ''
    })
    setPage(1)
  }

  const hasActiveFilters = filters.search

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Wisata</h1>
          <p className="text-gray-600">Kelola destinasi wisata Desa</p>
        </div>
        <Link
          href="/admin/wisata/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Wisata
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Filter Wisata
          </h3>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>

        {/* MAIN FILTER */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* SEARCH */}
            <div className="relative md:col-span-2">
              <label className="block text-xs text-transparent mb-1">
                Search
              </label>
              <Search
                size={16}
                className="absolute left-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari nama atau deskripsi wisata…"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PAGE SIZE */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Data per halaman
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {wisataPageSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data wisata</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* LOADING PERTAMA KALI */}
      {loading && wisata.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data wisata...</span>
        </div>
      )}

      {/* DATA KOSONG */}
      {!loading && !error && wisata.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            {hasActiveFilters ? 'Tidak ada wisata yang cocok dengan filter' : 'Belum ada wisata yang ditambahkan'}
          </p>
          <Link
            href="/admin/wisata/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah Wisata Pertama
          </Link>
        </div>
      )}

      {/* CARDS WISATA - VERTICAL LAYOUT */}
      {wisata.length > 0 && (
        <>
          {/* Total Info */}
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{(page - 1) * pageSize + 1}</span> sampai{' '}
            <span className="font-semibold">{Math.min(page * pageSize, total)}</span> dari{' '}
            <span className="font-semibold">{total}</span> wisata
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {wisata.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image Header */}
                <div className="relative h-48 bg-gray-100">
                  {item.gambar && item.gambar.length > 0 ? (
                    <Image
                      src={item.gambar[0]}
                      alt={item.nama}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Tidak ada gambar
                    </div>
                  )}

                  {/* Index Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block bg-blue-600/90 text-white text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      #{(page - 1) * pageSize + index + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Nama & Slug */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
                      {item.nama}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      /{item.slug}
                    </p>
                  </div>

                  {/* Deskripsi Singkat */}
                  {item.deskripsiSingkat && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.deskripsiSingkat}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Links & Info */}
                  <div className="space-y-2 text-sm">
                    {item.lokasiLink && (
                      <a
                        href={item.lokasiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="truncate">Lihat di Google Maps</span>
                      </a>
                    )}

                    {item.linkWebsite && (
                      <a
                        href={item.linkWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="truncate">{item.linkWebsite}</span>
                      </a>
                    )}

                    {item.linkPendaftaran && (
                      <a
                        href={item.linkPendaftaran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="truncate">Link Pendaftaran</span>
                      </a>
                    )}
                  </div>

                  {/* Social Media */}
                  {item.socialMedia && (
                    <div className="flex flex-wrap gap-2">
                      {item.socialMedia.facebook && (
                        <a
                          href={item.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          Facebook
                        </a>
                      )}
                      {item.socialMedia.instagram && (
                        <a
                          href={item.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded hover:bg-pink-200 transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                      {item.socialMedia.youtube && (
                        <a
                          href={item.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          YouTube
                        </a>
                      )}
                      {item.socialMedia.whatsapp && (
                        <a
                          href={`https://wa.me/${item.socialMedia.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      href={`/potensi/wisata/${item.slug}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <EyeIcon size={14} />
                      Lihat
                    </Link>
                    <Link
                      href={`/admin/wisata/edit/${item.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Edit size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.nama)}
                      disabled={deleting === item.id}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {deleting === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Loading */}
            {loading && wisata.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-600 text-sm">Memuat...</span>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && !loading && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  Halaman <span className="font-semibold">{page}</span> dari {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
