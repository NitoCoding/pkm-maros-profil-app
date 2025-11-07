// src/app/admin/user/reset-password/page.tsx
"use client";

import { useState } from 'react';
import { useUserMutation } from '@/hooks/useUser';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const { resetPassword, loading } = useUserMutation();
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const password = await resetPassword(email);
            setNewPassword(password);
            setIsSuccess(true);
            toast.success('Password berhasil direset');
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Gagal mereset password');
        }
    };

    const handleReset = () => {
        setEmail('');
        setNewPassword('');
        setIsSuccess(false);
    };

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
                <h1 className="text-2xl font-bold text-gray-800">Reset Password User</h1>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                {isSuccess ? (
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Password Berhasil Direset
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Password baru untuk user dengan email <strong>{email}</strong> adalah:
                        </p>
                        <div className="bg-gray-100 p-3 rounded-md mb-4">
                            <p className="text-lg font-mono font-bold text-gray-900">{newPassword}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Silakan berikan password baru ini kepada user. User dapat mengubah password ini setelah login.
                        </p>
                        <button
                            onClick={handleReset}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Reset Password Lain
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email User
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    required
                                    placeholder="user@example.com"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Password baru akan dihasilkan secara acak dan ditampilkan di halaman ini.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="animate-spin" size={16} />}
                                <span>Reset Password</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}