'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Plus, Edit, Loader2 } from 'lucide-react'
import PreviewImageButton from '@/components/PreviewImageModal'
import { usePegawai } from '@/hooks/usePegawai'
import { toast } from 'react-hot-toast'
import { IPegawai } from '@/types/pegawai'

export default function AdminPegawaiPage() {
  const { pegawai, loading, error, refresh } = usePegawai({ pageSize: 20 })
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pegawai "${nama}"?`)) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/pegawai?id=${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Gagal menghapus pegawai')

      toast.success('Pegawai berhasil dihapus')
      refresh()
    } catch (error: any) {
      if (
        !['NO_TOKEN', 'TOKEN_REFRESH_FAILED', 'TOKEN_STILL_INVALID'].includes(error.message)
      ) {
        toast.error(error.message || 'Terjadi kesalahan saat menghapus pegawai')
      }
      console.error('Error deleting pegawai:', error)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pegawai</h1>
          <p className="text-gray-600">Kelola data pegawai Desa Bilokka</p>
        </div>
        <Link
          href="/admin/pegawai/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Pegawai
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data pegawai</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading & Empty State */}
      {loading && pegawai.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data pegawai...</span>
        </div>
      ) : pegawai.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            Belum ada pegawai yang ditambahkan
          </p>
          <Link
            href="/admin/pegawai/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tambah Pegawai Pertama
          </Link>
        </div>
      ) : (
        // Table
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Urutan</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Nama</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Jabatan</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Foto</th>
                  <th className="p-3 font-semibold text-center uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pegawai.map((item: IPegawai, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50 transition ${
                      idx === pegawai.length - 1 ? '' : 'border-b border-gray-200'
                    }`}
                  >
                    {/* Urutan */}
                    <td className="p-3 text-center font-medium text-gray-900">
                      {item.urutanTampil ?? '-'}
                    </td>

                    {/* Nama */}
                    <td className="p-3 text-gray-900">
                      <div className="text-sm font-medium">{item.nama}</div>
                    </td>

                    {/* Jabatan */}
                    <td className="p-3 text-gray-700 text-sm">
                      {item.jabatan || '-'}
                    </td>

                    {/* Foto */}
                    <td className="p-3 text-left">
                      {item.fotoUrl ? (
                        <PreviewImageButton gambarUrl={item.fotoUrl} />
                      ) : (
                        <span className="text-gray-400 text-sm italic">Tidak ada</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-center w-[10%]">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/pegawai/edit/${item.id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit Pegawai"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id.toString(), item.nama)}
                          disabled={deleting === item.id.toString()}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Hapus Pegawai"
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
        </div>
      )}

      {/* Loading saat refresh */}
      {loading && pegawai.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}
    </div>
  )
}
