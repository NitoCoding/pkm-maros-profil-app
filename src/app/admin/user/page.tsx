// src/app/admin/user/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useUsers, useUserMutation } from '@/hooks/useUser';
import { IUser } from '@/types/user';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminUserPage() {
    const { users, loading, error, refresh } = useUsers();
    const { deleteUser, resetPassword, loading: mutationLoading } = useUserMutation();
    const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) {
            try {
                const success = await deleteUser(id);
                if (success) {
                    toast.success('User berhasil dihapus');
                    refresh();
                } else {
                    toast.error('Gagal menghapus user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Gagal menghapus user');
            }
        }
    };

    const handleResetPassword = async (id: number, email: string) => {
        if (confirm(`Apakah Anda yakin ingin mereset password untuk user dengan email "${email}"?`)) {
            try {
                const newPassword = await resetPassword(email);
                toast.success(`Password berhasil direset. Password baru: ${newPassword}`);
            } catch (error) {
                console.error('Error resetting password:', error);
                toast.error('Gagal mereset password');
            }
        }
    };

    const toggleShowPassword = (id: number) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
                <Link
                    href="/admin/user/add"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={16} />
                    <span>Tambah User</span>
                </Link>
            </div>

            <div className="overflow-x-auto ">
                <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="p-3 font-semibold text-left uppercase tracking-wider">User</th>
                            <th className="p-3 font-semibold text-left uppercase tracking-wider">Email</th>
                            <th className="p-3 font-semibold text-left uppercase tracking-wider">Verifikasi</th>
                            <th className="p-3 font-semibold text-left uppercase tracking-wider">Tanggal Buat</th>
                            <th className="p-3 font-semibold text-center uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    Belum ada user
                                </td>
                            </tr>
                        ) : (
                            users.map((user, idx) => (
                                <tr
                                    key={user.id}
                                    className={`hover:bg-blue-50 transition-colors ${idx === users.length - 1 ? "" : "border-b border-gray-100"
                                        }`}
                                >
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            {user.avatar_url ? (
                                                <Image
                                                    src={user.avatar_url}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full object-cover shadow-sm border"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                                                    <span className="text-blue-700 font-semibold text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4 text-sm text-gray-700 align-middle">{user.email}</td>

                                    <td className="p-4 align-middle">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.email_verified
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {user.email_verified ? "Terverifikasi" : "Belum"}
                                        </span>
                                    </td>

                                    <td className="p-4 text-sm text-gray-600 align-middle">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString("id-ID", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "-"}
                                    </td>

                                    <td className="p-4 text-center align-middle">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/admin/user/edit/${user.id}`}
                                                className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleResetPassword(user.id, user.email)}
                                                className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-50 rounded transition"
                                                title="Reset Password"
                                            >
                                                <Lock size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition"
                                                title="Hapus User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}