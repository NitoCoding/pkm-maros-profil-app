// src/app/admin/user/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUsersAdminPaginated, useUserMutation } from '@/hooks/useUser'
import { IUser } from '@/types/user'
import { Edit, Trash2, Loader2, Lock, Mail, Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { UserAdminFilters } from '@/libs/constant/userFilter'
import { emailVerifiedOptions } from '@/libs/constant/userFilter'

export default function AdminUserPage() {
  const [pageSize, setPageSize] = useState(10)

  // Filter state
  const [filters, setFilters] = useState<UserAdminFilters>({
    search: '',
    emailVerified: 'all'
  })

  // Pass filters directly - hook handles optimization
  const { users, loading, error, total, page, totalPages, setPage, refresh } = useUsersAdminPaginated({
    pageSize: pageSize,
    filters: filters
  })

  const { deleteUser, resetPassword, loading: mutationLoading } = useUserMutation()
  const [deleting, setDeleting] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) return

    try {
      setDeleting(id)
      const success = await deleteUser(id)
      if (success) {
        toast.success('User berhasil dihapus')
        refresh()
      } else {
        toast.error('Gagal menghapus user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Gagal menghapus user')
    } finally {
      setDeleting(null)
    }
  }

  const handleResetPassword = async (id: number, email: string) => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk user dengan email "${email}"?`)) return

    try {
      const newPassword = await resetPassword(email)
      toast.success(`Password berhasil direset. Password baru: ${newPassword}`)
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Gagal mereset password')
    }
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      emailVerified: 'all'
    })
    setPage(1)
  }

  const hasActiveFilters = filters.search || filters.emailVerified !== 'all'

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600">Kelola akun pengguna sistem</p>
        </div>
        <Link
          href="/admin/user/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah User
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Filter User
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
                placeholder="Cari nama atau email user…"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* EMAIL VERIFIED */}
            <select
              value={filters.emailVerified}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  emailVerified: e.target.value as 'all' | 'verified' | 'unverified'
                })
                setPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {emailVerifiedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-3 pt-2 border-t">
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
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data user</p>
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
      {loading && users.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data user...</span>
        </div>
      )}

      {/* DATA KOSONG */}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Belum ada user yang dibuat</p>
          <Link
            href="/admin/user/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah User Pertama
          </Link>
        </div>
      )}

      {/* DAFTAR USER */}
      {users.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">


          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">User</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Email</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Verifikasi</th>
                  <th className="p-3 font-semibold text-left uppercase tracking-wider">Tanggal Buat</th>
                  <th className="p-3 font-semibold text-center uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-blue-50 transition ${idx === users.length - 1 ? '' : 'border-b border-gray-200'
                      }`}
                  >
                    {/* User */}
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{user.email}</span>
                      </div>
                    </td>

                    {/* Verifikasi */}
                    <td className="p-3 align-middle">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.email_verified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.email_verified ? 'Terverifikasi' : 'Belum'}
                      </span>
                    </td>

                    {/* Tanggal Buat */}
                    <td className="p-3 text-sm text-gray-600 align-middle">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/user/edit/${user.id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleResetPassword(user.id, user.email)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                          title="Reset Password"
                        >
                          <Lock size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={mutationLoading || deleting === user.id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Hapus User"
                        >
                          {deleting === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
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
                <span className="font-semibold">{total}</span> berita
              </p>
              <p className="text-sm text-gray-500">
                Halaman <span className="font-semibold">{page}</span> dari {totalPages}
              </p>
            </div>

            {/* Loading */}
            {loading && users.length > 0 && (
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
      )}
    </div>
  )
}
