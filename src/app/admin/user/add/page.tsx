// src/app/admin/user/add/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserMutation } from '@/hooks/useUser';
import { IUserCreate } from '@/types/user';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AddUserPage() {
  const router = useRouter();
  const { createUser, loading } = useUserMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<IUserCreate>({
    email: '',
    password: '',
    name: '',
  });

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
      const success = await createUser(formData);
      if (success) {
        toast.success('User berhasil ditambahkan');
        router.push('/admin/user');
        router.refresh();
      } else {
        toast.error('Gagal menambahkan user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Gagal menambahkan user');
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Tambah User Baru</h1>
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
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              <span>Tambah User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}