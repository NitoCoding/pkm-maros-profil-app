// src/app/admin/user/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser, useUserMutation } from '@/hooks/useUser'
import { IUser, IUserUpdate } from '@/types/user'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = parseInt(params.id as string)

  const { user, loading, error } = useUser(id)
  const { updateUser, loading: mutationLoading } = useUserMutation()
  const [formData, setFormData] = useState<IUserUpdate>({
    name: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const success = await updateUser(id, formData)
      if (success) {
        toast.success('User berhasil diperbarui')
        router.push('/admin/user')
      } else {
        toast.error('Gagal memperbarui user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Gagal memperbarui user')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data user...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Gagal memuat data</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          <p className="font-medium">{error || 'User tidak ditemukan'}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600">Perbarui informasi pengguna</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFORMASI PENGGUNA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Pengguna</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>

          {/* Optional: Avatar URL */}
          {/* 
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Avatar
            </label>
            <input
              type="url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg  "
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          */}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mutationLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {mutationLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}