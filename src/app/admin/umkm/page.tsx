// src/app/admin/umkm/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Plus, Edit, Loader2, MapPin, Phone, DollarSign } from 'lucide-react'
import { IProdukUMKM } from '@/types/umkm'
import { toast } from 'react-hot-toast'
import PreviewImageButton from '@/components/PreviewImageModal'
import { useProdukUMKM } from '@/hooks/useProdukUMKM'

export default function AdminUmkmPage() {
    const pageSize = 10
  const { umkm = [], loading, error, refresh, hasMore, loadMore } = useProdukUMKM({ pageSize: 20 })
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
          <p className="text-gray-600 text-lg mb-4">Belum ada produk yang ditambahkan</p>
          <Link
            href="/admin/umkm/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Tambah Produk Pertama
          </Link>
        </div>
      )}

      {/* DAFTAR PRODUK UMKM */}
      {umkm.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Produk UMKM</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Kategori</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Gambar</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Harga</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Kontak</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Lokasi</th>
                  <th className="p-3 font-semibold text-center uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {umkm.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50 transition ${
                      idx === umkm.length - 1 ? '' : 'border-b border-gray-200'
                    }`}
                  >
                    {/* Produk & UMKM */}
                    <td className="p-3 align-middle">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.namaProduk}</div>
                        <div className="text-xs text-gray-500 line-clamp-2 mt-1">oleh {item.namaUMKM}</div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="p-3 align-middle">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {item.kategori}
                      </span>
                    </td>

                    {/* Gambar */}
                    <td className="p-3 align-middle">
                      <PreviewImageButton gambarUrl={item.gambar} />
                    </td>

                    {/* Harga */}
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-600" />
                        <span className="text-green-600 text-sm">{getPriceRange(item.harga)}</span>
                      </div>
                    </td>

                    {/* Kontak */}
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-700">{item.kontak.telepon}</span>
                      </div>
                    </td>

                    {/* Lokasi */}
                    <td className="p-3 align-middle">
                      <div className="flex items-start gap-1">
                        <MapPin size={14} className="text-gray-500 mt-0.5" />
                        <span className="text-sm text-gray-700 line-clamp-2 max-w-[200px]">{item.lokasi.alamat}</span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/umkm/edit/${item.id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit Produk"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.namaProduk)}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Hapus Produk"
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

          {/* FOOTER: LOADING TAMBAHAN */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {loading && umkm.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                <span className="ml-2 text-gray-600">Memuat umkm lainnya...</span>
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
                  Muat Umkm Lainnya
                </button>
              </div>
            )}

            {/* Semua data dimuat */}
            {!hasMore && umkm.length > pageSize && (
              <p className="text-center text-gray-500 text-sm py-4">
                Semua umkm telah dimuat
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}