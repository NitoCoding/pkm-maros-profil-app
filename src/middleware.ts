// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/libs/auth/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Jika tidak ada token dan mencoba akses halaman admin
  if (!token && pathname.startsWith('/admin')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika ada token, verifikasi
  if (token) {
    try {
      const decoded = await verifyToken(token);

      // Jika token valid dan user mencoba akses halaman login
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Tambahkan data user ke header request agar bisa diakses di API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id.toString());
      requestHeaders.set('x-user-email', decoded.email);
      requestHeaders.set('x-user-role', decoded.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token tidak valid, hapus cookie dan redirect ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/api/auth/me', // Lindungi endpoint ini
    '/api/berita', // Lindungi endpoint berita
    '/api/dashboard', // Lindungi endpoint dashboard
    '/api/berita',
    '/api/galeri', // Lindungi endpoint galeri
    '/api/umkm', // Lindungi endpoint umkm
    '/api/produk-umkm', // Lindungi endpoint produk umkm
    '/api/pegawai', // Lindungi endpoint pegawai
    '/api/profil', // Lindungi endpoint profil
    '/api/umum', // Lindungi endpoint umum
    '/api/wisata', // Lindungi endpoint wisata
    '/api/inovasi', // Lindungi endpoint inovasi
  ],
};