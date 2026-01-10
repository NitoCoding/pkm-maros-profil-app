'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Plus, Edit, Loader2, Search, ChevronLeft, ChevronRight, EyeIcon } from 'lucide-react'
import PreviewImageButton from '@/components/utils/PreviewImageModal'
import { useInovasiAdminPaginated } from '@/hooks/useInovasi'
import { toast } from 'react-hot-toast'
import { IInovasi } from '@/types/inovasi'
import { InovasiAdminFilters, inovasiPageSizeOptions, inovasiKategori, getInovasiTahunOptions } from '@/libs/constant/inovasiFilter'
import Image from 'next/image'
import { KategoriBadge } from '@/libs/utils/kategoriBadge'

export default function AdminInovasiPage() {
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<InovasiAdminFilters>({
    search: '',
    kategori: '',
    tahun: ''
  })
  const [deleting, setDeleting] = useState<string | null>(null)

  const { inovasi, loading, error, total, page, totalPages, setPage, refresh } =
    useInovasiAdminPaginated({
      pageSize: pageSize,
      filters: filters
    })

  const handleDelete = async (id: string, judul: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus inovasi "${judul}"?`)) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/inovasi?id=${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Gagal menghapus inovasi')

      toast.success('Inovasi berhasil dihapus')
      refresh()
    } catch (error: any) {
      if (!['NO_TOKEN', 'TOKEN_REFRESH_FAILED', 'TOKEN_STILL_INVALID'].includes(error.message)) {
        toast.error(error.message || 'Terjadi kesalahan saat menghapus inovasi')
      }
      console.error('Error deleting inovasi:', error)
    } finally {
      setDeleting(null)
    }
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      kategori: '',
      tahun: ''
    })
  }

  const hasActiveFilters = filters.search || filters.kategori || filters.tahun

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Inovasi</h1>
          <p className="text-gray-600">Kelola program inovasi Desa</p>
        </div>
        <Link
          href="/admin/inovasi/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Inovasi
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Filter Inovasi
          </h3>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Search size={14} />
              Reset
            </button>
          )}
        </div>

        {/* MAIN FILTER */}
        <div className="p-4 space-y-4">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Cari judul atau deskripsi inovasi…"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* KATEGORI */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Kategori
              </label>
              <select
                value={filters.kategori}
                onChange={(e) => setFilters({ ...filters, kategori: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {inovasiKategori.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </div>

            {/* TAHUN */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tahun
              </label>
              <select
                value={filters.tahun}
                onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Tahun</option>
                {getInovasiTahunOptions().map((tahun) => (
                  <option key={tahun} value={tahun.toString()}>
                    {tahun}
                  </option>
                ))}
              </select>
            </div>

            {/* PAGE SIZE */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Data per halaman
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {inovasiPageSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {
        error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Gagal memuat data inovasi</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )
      }

      {/* LOADING PERTAMA KALI */}
      {
        loading && inovasi.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat data inovasi...</span>
          </div>
        )
      }

      {/* DATA KOSONG */}
      {
        !loading && !error && inovasi.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg mb-4">
              {hasActiveFilters ? 'Tidak ada inovasi yang cocok dengan filter' : 'Belum ada inovasi yang ditambahkan'}
            </p>
            <Link
              href="/admin/inovasi/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Tambah Inovasi Pertama
            </Link>
          </div>
        )
      }

      {/* DAFTAR INOVASI */}
      {
        inovasi.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-2xl border-separate border-spacing-0">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 font-semibold text-center uppercase tracking-wider w-12">#</th>
                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Inovasi</th>
                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Kategori</th>
                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Tahun</th>
                    <th className="p-3 font-semibold text-center uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {inovasi.map((item: IInovasi, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50 transition border-b border-gray-200"
                    >
                      {/* Urutan */}
                      <td className="p-3 text-center font-medium text-gray-900 text-sm">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* Judul & Gambar */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.gambar && item.gambar.length > 0 ? (
                            <Image
                              src={item.gambar[0]}
                              alt={item.altText || item.judul}
                              width={60}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-[60px] h-[40px] bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No img</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.judul}</div>
                            <div className="text-xs text-gray-500">{item.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="p-3">
                        <KategoriBadge
                          kategori={item.kategori}
                          type="inovasi"
                          style="solid"
                        />
                      </td>

                      {/* Tahun */}
                      <td className="p-3 text-sm text-gray-900">{item.tahun}</td>

                      {/* Aksi */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/inovasi/${item.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Lihat di publik"
                          >
                            <EyeIcon size={16} />
                          </Link>
                          <Link
                            href={`/admin/inovasi/edit/${item.id}`}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                            title="Edit Inovasi"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id.toString(), item.judul)}
                            disabled={deleting === item.id.toString()}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Hapus Inovasi"
                          >
                            {deleting === item.id.toString() ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION & TOTAL ROWS */}
            <div className="p-4 border-t border-gray-200">
              {/* Total Rows Info */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold">{(page - 1) * pageSize + 1}</span> sampai{' '}
                  <span className="font-semibold">{Math.min(page * pageSize, total)}</span> dari{' '}
                  <span className="font-semibold">{total}</span> inovasi
                </p>
                <p className="text-sm text-gray-500">
                  Halaman <span className="font-semibold">{page}</span> dari {totalPages}
                </p>
              </div>

              {/* Loading */}
              {loading && inovasi.length > 0 && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-600 text-sm">Memuat...</span>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-2">
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
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === pageNum
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
              )}
            </div>
          </div>
        )
      }
    </div >
  )
}
