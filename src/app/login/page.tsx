// src/app/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handler login Email/Password (Menggunakan API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login berhasil, API sudah mengatur cookie
        // Arahkan pengguna ke halaman yang diminta
        router.push(redirect);
      } else {
        // Login gagal, tampilkan pesan error dari API
        toast.error(data.error || 'Login failed');
      }
    } catch (err: any) {
      // Error jaringan atau error lainnya
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler login Google (Masih menggunakan API yang Anda siapkan)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      // Panggil API Google login yang sudah Anda buat
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Body ini mungkin perlu disesuaikan dengan cara Anda mengimplementasikan Google OAuth
        // Saat ini, ini adalah mock data
        body: JSON.stringify({
          googleId: 'mock-google-id',
          email: 'user@gmail.com',
          name: 'Mock User',
          picture: 'https://via.placeholder.com/150',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login berhasil, API sudah mengatur cookie
        router.push(redirect);
      } else {
        toast.error(data.error || 'Google login failed');
      }
    } catch (err: any) {
      toast.error('Network error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-sm'>
        <h1 className='text-2xl font-bold mb-6 w-full text-center'>Login</h1>
        <Image
          src='/logo.png'
          alt='Logo'
          width={100}
          height={100}
          className='mx-auto mb-4'
        />
        <p className='text-gray-600 mb-4 w-full text-center'>
          Masuk ke akun Anda untuk mengelola konten Desa Benteng Gajah.
        </p>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2' htmlFor='email'>
              Email
            </label>
            <input
              type='email'
              id='email'
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete='username'
              required
              disabled={loading || googleLoading}
            />
          </div>
          <div className='mb-6'>
            <label
              className='block text-sm font-medium mb-2'
              htmlFor='password'
            >
              Password
            </label>
            <input
              type='password'
              id='password'
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              required
              disabled={loading || googleLoading}
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors mb-3'
            disabled={loading || googleLoading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        {/* <div className='flex items-center my-4'>
          <div className='flex-grow border-t border-gray-300'></div>
          <span className='mx-2 text-gray-500 text-xs'>atau</span>
          <div className='flex-grow border-t border-gray-300'></div>
        </div>
        <button
          type='button'
          className='w-full border border-blue-600 text-black py-2 rounded hover:text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
        >
          <Image src='/google.svg' alt='Google' width={24} height={24} />
          {googleLoading ? 'Loading...' : 'Login dengan Google'}
        </button>
          {/* </div> */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div>Loading halaman...</div>}>
        <LoginPageContent />
      </Suspense>
}