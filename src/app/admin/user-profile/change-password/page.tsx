// src/app/user/profile/change-password/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserMutation } from '@/hooks/useUser';
import { IPasswordChange } from '@/types/user';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import PageHead from '@/components/PageHead';

export default function ChangePasswordPage() {
    const router = useRouter();
    const { user, loading } = useCurrentUser();
    const { changePassword, loading: mutationLoading, error } = useUserMutation();

    const [formData, setFormData] = useState<IPasswordChange>({
        current_password: '',
        new_password: '',
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Redirect jika user belum login
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.current_password) {
            toast.error('Password saat ini harus diisi');
            return false;
        }

        if (!formData.new_password) {
            toast.error('Password baru harus diisi');
            return false;
        }

        if (formData.new_password.length < 6) {
            toast.error('Password baru minimal 6 karakter');
            return false;
        }

        if (formData.new_password !== confirmPassword) {
            toast.error('Konfirmasi password tidak cocok');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!user) return;

        try {
            const success = await changePassword(user.id, {
                current_password: formData.current_password,
                new_password: formData.new_password,
            });

            if (success) {
                setIsSuccess(true);
                toast.success('Password berhasil diubah');

                // Reset form
                setFormData({
                    current_password: '',
                    new_password: '',
                });
                setConfirmPassword('');

                // Redirect ke halaman profil setelah 2 detik
                setTimeout(() => {
                    router.push('/user/profile');
                }, 2000);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Gagal mengubah password');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Akan redirect
    }

    return (
        <>
            <PageHead
                title="Ganti Password - Profil User"
                description="Ubah password akun Anda"
            />
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Ganti Password</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Ubah password akun Anda untuk menjaga keamanan
                        </p>
                    </div>

                    {/* Success Message */}
                    {isSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Password berhasil diubah!
                                    </p>
                                    <p className="mt-1 text-sm text-green-700">
                                        Anda akan dialihkan ke halaman profil...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Current Password */}
                            <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                    Password Saat Ini
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="current_password"
                                        name="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Masukkan password saat ini"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                                    Password Baru
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="new_password"
                                        name="new_password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Masukkan password baru (minimal 6 karakter)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                    Konfirmasi Password Baru
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Masukkan kembali password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={mutationLoading || isSuccess}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {mutationLoading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Memproses...
                                        </>
                                    ) : isSuccess ? (
                                        <>
                                            <CheckCircle className="-ml-1 mr-3 h-5 w-5 text-white" />
                                            Berhasil
                                        </>
                                    ) : (
                                        'Ganti Password'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Back Link */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/user/profile"
                                className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Profil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}