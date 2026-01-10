// src/app/admin/umkm/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Plus, Edit, Loader2, MapPin, Phone, DollarSign, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { IProdukUMKM } from '@/types/umkm'
import { toast } from 'react-hot-toast'
import { useProdukUMKMAdminPaginated } from '@/hooks/useProdukUMKM'
import { UmkmAdminFilters, umkmKategori } from '@/libs/constant/umkmFilter'
import Image from 'next/image'

export default function AdminUmkmPage() {
  const [pageSize, setPageSize] = useState(12)

  // Filter state
  const [filters, setFilters] = useState<UmkmAdminFilters>({
    search: '',
    kategori: '',
    hargaMin: '',
    hargaMax: ''
  })

  // Pass filters to hook
  const { umkm, loading, error, total, page, totalPages, setPage, refresh } = useProdukUMKMAdminPaginated({
    pageSize: pageSize,
    filters: filters
  })

  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/produk-umkm?id=${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
          return
        }
        throw new Error(result.error || 'Gagal menghapus produk')
      }

      toast.success('Produk berhasil dihapus')
      refresh()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menghapus produk')
      console.error('Error deleting produk:', error)
    } finally {
      setDeleting(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPriceRange = (harga: { awal: number; akhir: number }) => {
    if (!harga) return 'Harga tidak tersedia'
    if (harga.awal === harga.akhir || !harga.akhir) {
      return formatPrice(harga.awal)
    }
    return `${formatPrice(harga.awal)} - ${formatPrice(harga.akhir)}`
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      kategori: '',
      hargaMin: '',
      hargaMax: ''
    })
    setPage(1)
  }

  const hasActiveFilters = filters.search || filters.kategori || filters.hargaMin || filters.hargaMax

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk UMKM</h1>
          <p className="text-gray-600">Kelola data produk UMKM Desa Benteng Gajah</p>
        </div>
        <Link
          href="/admin/umkm/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Produk
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Filter Produk
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
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari nama produk atau UMKM…"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* KATEGORI */}
            <select
              value={filters.kategori}
              onChange={(e) => {
                setFilters({ ...filters, kategori: e.target.value })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {umkmKategori.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t">
            {/* HARGA MIN */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Harga Minimum
              </label>
              <input
                type="number"
                placeholder="Min harga"
                value={filters.hargaMin}
                onChange={(e) => {
                  setFilters({ ...filters, hargaMin: e.target.value })
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* HARGA MAX */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Harga Maximum
              </label>
              <input
                type="number"
                placeholder="Max harga"
                value={filters.hargaMax}
                onChange={(e) => {
                  setFilters({ ...filters, hargaMax: e.target.value })
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
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
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
              </select>
            </div>

            {/* EMPTY */}
            <div></div>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data produk</p>
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
      {loading && umkm.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data produk...</span>
        </div>
      )}

      {/* DATA KOSONG */}
      {!loading && !error && umkm.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            {hasActiveFilters ? 'Tidak ada produk yang cocok dengan filter' : 'Belum ada produk yang ditambahkan'}
          </p>
          <Link
            href="/admin/umkm/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah Produk Pertama
          </Link>
        </div>
      )}

      {/* GRID PRODUK UMKM - CARD LAYOUT */}
      {umkm.length > 0 && (
        <>
          {/* Total Info */}
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{(page - 1) * pageSize + 1}</span> sampai{' '}
            <span className="font-semibold">{Math.min(page * pageSize, total)}</span> dari{' '}
            <span className="font-semibold">{total}</span> produk
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {umkm.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {item.gambar ? (
                    <Image
                      src={item.gambar}
                      alt={item.namaProduk}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Tidak ada gambar
                    </div>
                  )}

                  {/* Kategori Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-block bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                      {item.kategori}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Nama Produk & UMKM */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {item.namaProduk}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      oleh {item.namaUMKM}
                    </p>
                  </div>

                  {/* Harga */}
                  <div className="flex items-center gap-1">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {getPriceRange(item.harga)}
                    </span>
                  </div>

                  {/* Deskripsi */}
                  {item.deskripsi && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  )}

                  {/* Kontak & Lokasi */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" />
                      <span className="truncate">{item.kontak?.telepon || '-'}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{item.lokasi?.alamat || '-'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Link
                      href={`/admin/umkm/edit/${item.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Edit size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.namaProduk)}
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
            {loading && umkm.length > 0 && (
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
