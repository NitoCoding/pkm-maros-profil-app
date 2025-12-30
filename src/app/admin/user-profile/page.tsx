// src/app/admin/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserMutation } from '@/hooks/useUser';
import { IUser, IUserUpdate, IPasswordChange } from '@/types/user';
import { ArrowLeft, User, Mail, Camera, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function AdminProfilePage() {
    const router = useRouter();
    const { user, loading } = useCurrentUser();
    // // console.log('Current User:', user);

    const { updateUser, changePassword, loading: mutationLoading } = useUserMutation();

    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    // Profile form state
    const [profileData, setProfileData] = useState<IUserUpdate>({
        name: '',
        // avatar_url: '',
    });

    // Password form state
    const [passwordData, setPasswordData] = useState<IPasswordChange>({
        current_password: '',
        new_password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Success states
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Initialize form data when user data is loaded
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                // avatar_url: user.avatar_url || '',
            });
        }
    }, [user]);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const success = await updateUser(user.id, profileData);
            if (success) {
                setProfileSuccess(true);
                toast.success('Profil berhasil diperbarui');
                setTimeout(() => setProfileSuccess(false), 3000);
            } else {
                toast.error('Gagal memperbarui profil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Gagal memperbarui profil');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validation
        if (!passwordData.current_password || !passwordData.new_password || !confirmPassword) {
            toast.error('Semua field password harus diisi');
            return;
        }

        if (passwordData.new_password.length < 6) {
            toast.error('Password baru minimal 6 karakter');
            return;
        }

        if (passwordData.new_password !== confirmPassword) {
            toast.error('Password baru dan konfirmasi tidak cocok');
            return;
        }

        try {
            const success = await changePassword(user.id, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });

            if (success) {
                setPasswordSuccess(true);
                toast.success('Password berhasil diubah');
                // Reset form
                setPasswordData({
                    current_password: '',
                    new_password: '',
                });
                setConfirmPassword('');
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                toast.error('Gagal mengubah password. Periksa password saat ini Anda.');
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
        return null; // Will redirect
    }

    return (
        <>
            <PageHead
                title="Profil Admin"
                description="Kelola informasi profil dan password akun admin Anda"
            />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/admin"
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="mr-2" size={20} />
                            Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Profil Admin</h1>
                        <p className="mt-2 text-gray-600">Kelola informasi profil dan keamanan akun Anda</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tabs */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="border-b border-gray-200">
                                    <nav className="flex -mb-px">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className={`py-4 px-6 text-sm font-medium ${activeTab === 'profile'
                                                ? 'border-b-2 border-green-500 text-green-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Informasi Profil
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('password')}
                                            className={`py-4 px-6 text-sm font-medium ${activeTab === 'password'
                                                ? 'border-b-2 border-green-500 text-green-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Keamanan
                                        </button>
                                    </nav>
                                </div>

                                <div className="p-6">
                                    {/* Profile Tab */}
                                    {activeTab === 'profile' && (
                                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                                            {profileSuccess && (
                                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-green-800">
                                                                Profil berhasil diperbarui
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Avatar Section */}
                                            {/* <div className="flex items-center space-x-6">
                                                <div className="shrink-0">
                                                    {user.avatar_url || profileData.avatar_url ? (
                                                        <Image
                                                            className="h-20 w-20 rounded-full object-cover"
                                                            src={profileData.avatar_url}
                                                            alt={user.name}
                                                            width={80}
                                                            height={80}
                                                        />
                                                    ) : (
                                                        <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <User className="h-8 w-8 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        URL Avatar
                                                    </label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="url"
                                                            name="avatar_url"
                                                            value={profileData.avatar_url}
                                                            onChange={handleProfileChange}
                                                            placeholder="https://example.com/avatar.jpg"
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div> */}

                                            {/* Name Field */}
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={profileData.name}
                                                    onChange={handleProfileChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>

                                            {/* Email Field (Read-only) */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <div className="flex items-center">
                                                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        value={user.email}
                                                        disabled
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah. Hubungi super admin untuk perubahan email.</p>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={mutationLoading}
                                                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                >
                                                    {mutationLoading && <Loader2 className="animate-spin mr-2" size={16} />}
                                                    Simpan Perubahan
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Password Tab */}
                                    {activeTab === 'password' && (
                                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                            {passwordSuccess && (
                                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-green-800">
                                                                Password berhasil diubah
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Current Password */}
                                            <div>
                                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Password Saat Ini
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        id="current_password"
                                                        name="current_password"
                                                        value={passwordData.current_password}
                                                        onChange={handlePasswordChange}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
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
                                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Password Baru
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        id="new_password"
                                                        name="new_password"
                                                        value={passwordData.new_password}
                                                        onChange={handlePasswordChange}
                                                        required
                                                        minLength={6}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
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
                                                <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter</p>
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Konfirmasi Password Baru
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        id="confirm_password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        minLength={6}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
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
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={mutationLoading}
                                                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                >
                                                    {mutationLoading && <Loader2 className="animate-spin mr-2" size={16} />}
                                                    Ganti Password
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Account Info Card */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Akun</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">ID Pengguna</dt>
                                        <dd className="mt-1 text-sm text-gray-900">#{user.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status Email</dt>
                                        <dd className="mt-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.email_verified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.email_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Bergabung Sejak</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(user.created_at.replace(' ', 'T')).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Terakhir Diperbarui</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(user.updated_at.replace(' ', 'T')).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/admin/user"
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Kelola Pengguna
                                    </Link>
                                    {/* <Link
                                        href="/admin/settings"
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Pengaturan Sistem
                                    </Link> */}
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('currentUser');
                                            router.push('/admin/login');
                                        }}
                                        className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                    >
                                        Keluar
                                    </button>
                                    {/* Hubungi Developer */}
                                    <div className="mt-6 border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Hubungi Developer</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Jika Anda menemukan bug, memiliki ide pengembangan, atau butuh bantuan teknis,
                                            silakan hubungi developer aplikasi ini.
                                        </p>
                                        {/* <a
                                            href="mailto:support@cmsbilokka.dev"
                                            className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                        >
                                            Kirim Email ke Developer
                                        </a> */}
                                        <a
                                            href="https://wa.me/6282151827775?text=Halo%20saya%20ingin%20bertanya%20tentang%20CMS%Benteng%20Gajah."
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                                        >
                                            Chat via WhatsApp
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}