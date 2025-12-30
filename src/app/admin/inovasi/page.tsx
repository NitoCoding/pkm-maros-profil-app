'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Edit, Trash, Plus, EyeIcon, Loader2 } from 'lucide-react'
import { useInovasiAdmin } from '@/hooks/useInovasi'
import { toast } from 'react-hot-toast'
import { formatDateLong } from '@/libs/utils/date'
import Image from 'next/image'

export default function AdminInovasiPage() {
  const pageSize = 10
  const { inovasi, loading, error, hasMore, loadMore, refresh } = useInovasiAdmin({ pageSize })
  const [deleting, setDeleting] = useState<string | null>(null)

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
      toast.error(error.message || 'Terjadi kesalahan saat menghapus inovasi')
      console.error('Error deleting inovasi:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getKategoriBadge = (kategori: string) => {
    const colors: { [key: string]: string } = {
      teknologi: 'bg-blue-100 text-blue-800',
      pertanian: 'bg-green-100 text-green-800',
      kesehatan: 'bg-red-100 text-red-800',
      pendidikan: 'bg-purple-100 text-purple-800',
      ekonomi: 'bg-yellow-100 text-yellow-800',
      lingkungan: 'bg-emerald-100 text-emerald-800',
      infrastruktur: 'bg-gray-100 text-gray-800',
      sosial: 'bg-pink-100 text-pink-800',
      lainnya: 'bg-gray-100 text-gray-800',
    }

    const base = 'px-2 py-1 rounded-full text-xs font-medium'
    return colors[kategori.toLowerCase()] || `${base} bg-gray-100 text-gray-800`
  }

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

      {/* ERROR STATE */}
      {error && (
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
      )}

      {/* LOADING PERTAMA KALI */}
      {loading && inovasi.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data inovasi...</span>
        </div>
      )}

      {/* DATA KOSONG */}
      {!loading && !error && inovasi.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Belum ada inovasi yang dibuat</p>
          <Link
            href="/admin/inovasi/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Inovasi Pertama
          </Link>
        </div>
      )}

      {/* TABEL INOVASI */}
      {inovasi.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Inovasi</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Kategori</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Tahun</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Dibuat</th>
                  <th className="p-3 text-center font-semibold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inovasi.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    {/* Judul & Gambar */}
                    <td className="p-3 flex items-center gap-3">
                      {item.gambar && item.gambar.length > 0 && (
                        <Image
                          src={item.gambar[0]}
                          alt={item.altText || item.judul}
                          width={60}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.judul}</div>
                        <div className="text-xs text-gray-500">{item.slug}</div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={getKategoriBadge(item.kategori)}>
                        {item.kategori}
                      </span>
                    </td>

                    <td className="p-3 text-sm text-gray-900">{item.tahun}</td>

                    <td className="p-3 text-sm text-gray-500">
                      {formatDateLong(item.createdAt)}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/inovasi/${item.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Lihat di publik"
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <Link
                          href={`/admin/inovasi/edit/${item.id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Hapus"
                        >
                          {deleting === item.id ? (
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

          {/* FOOTER: LOADING + LOAD MORE */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {/* Loading tambahan */}
            {loading && inovasi.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                <span className="ml-2 text-gray-600">Memuat inovasi lainnya...</span>
              </div>
            )}

            {/* Tombol Load More */}
            {hasMore && !loading && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} />
                  Muat Inovasi Lainnya
                </button>
              </div>
            )}

            {/* Semua data dimuat */}
            {!hasMore && inovasi.length > pageSize && (
              <p className="text-center text-gray-500 text-sm py-4">
                Semua inovasi telah dimuat
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}