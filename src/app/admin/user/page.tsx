// src/app/admin/user/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUsers, useUserMutation } from '@/hooks/useUser'
import { IUser } from '@/types/user'
import { ArrowLeft, Edit, Trash2, Loader2, Lock, Mail, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function AdminUserPage() {
    const pageSize = 10
    const { users, loading, error, refresh, loadMore, hasMore } = useUsers({ pageSize: pageSize })
    const { deleteUser, resetPassword, loading: mutationLoading } = useUserMutation()
    const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({})

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) return

        try {
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

    const toggleShowPassword = (id: number) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
                    <p className="text-gray-600">Kelola akun pengguna sistem</p>
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
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 mx-auto"
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
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.email_verified
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
                                                    disabled={mutationLoading}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* FOOTER: LOAD MORE & LOADING TAMBAHAN */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        {loading && (
                            <div className="flex justify-center items-center py-2">
                                <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                                <span className="ml-2 text-gray-600">Memuat data...</span>
                            </div>
                        )}

                        {!loading && hasMore && (
                            <div className="text-center">
                                <button
                                    onClick={loadMore}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Loader2 size={16} className={`${loading ? 'animate-spin' : 'invisible'} h-4 w-4`} />
                                    Muat User Lainnya
                                </button>
                            </div>
                        )}

                        {!hasMore && users.length > pageSize && (
                            <p className="text-center text-gray-500 text-sm py-4">
                                Semua user telah dimuat
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}