// src/app/admin/user/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useUserMutation } from '@/hooks/useUser';
import { IUser, IUserUpdate } from '@/types/user';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);

    const { user, loading, error, refresh } = useUser(id);
    const { updateUser, loading: mutationLoading } = useUserMutation();
    const [formData, setFormData] = useState<IUserUpdate>({
        name: '',
        // avatar_url: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                // avatar_url: user.avatar_url || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const success = await updateUser(id, formData);
            if (success) {
                toast.success('User berhasil diperbarui');
                router.push('/admin/user');
            } else {
                toast.error('Gagal memperbarui user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Gagal memperbarui user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">Error: {error || 'User tidak ditemukan'}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link
                    href="/admin/user"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Daftar User</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={user.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                    </div>

                    {/* <div className="mb-6">
                        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
                            URL Avatar
                        </label>
                        <input
                            type="url"
                            id="avatar_url"
                            name="avatar_url"
                            value={formData.avatar_url}
                            onChange={handleChange}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div> */}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={mutationLoading}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {mutationLoading && <Loader2 className="animate-spin" size={16} />}
                            <span>Simpan Perubahan</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}