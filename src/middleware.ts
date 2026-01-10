// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/libs/auth/jwt';
import {
  authRateLimiter,
  apiRateLimiter,
  mutationRateLimiter,
  sensitiveRateLimiter,
} from '@/libs/security/rateLimit';
import { corsMiddleware } from '@/libs/security/cors';

/**
 * Rate limiting configuration per route
 */
const RATE_LIMIT_ROUTES: Record<string, any> = {
  '/api/auth/login': authRateLimiter,
  '/api/auth/register': authRateLimiter,
  '/api/auth/forgot-password': authRateLimiter,
  '/api/auth/reset-password': sensitiveRateLimiter,
  '/api/auth/change-password': sensitiveRateLimiter,
  '/api/berita': mutationRateLimiter,
  '/api/wisata': mutationRateLimiter,
  '/api/galeri': mutationRateLimiter,
  '/api/pegawai': mutationRateLimiter,
  '/api/inovasi': mutationRateLimiter,
  '/api/umkm': mutationRateLimiter,
  '/api/produk-umkm': mutationRateLimiter,
  '/api/dashboard': apiRateLimiter,
};

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return pathname.startsWith('/admin') ||
         pathname.startsWith('/api/auth/me') ||
         pathname.startsWith('/api/dashboard');
}

/**
 * Get rate limiter for route
 */
function getRateLimiter(pathname: string, method: string) {
  // Apply stricter limits for mutation operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    for (const [route, limiter] of Object.entries(RATE_LIMIT_ROUTES)) {
      if (pathname.startsWith(route)) {
        return limiter;
      }
    }
  }

  // Apply standard limits for all API routes
  if (pathname.startsWith('/api/')) {
    return apiRateLimiter;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const method = request.method;

  // ============================================================================
  // 1. CORS Handling
  // ============================================================================
  const corsResponse = corsMiddleware.handle(request);
  if (corsResponse) {
    return corsResponse;
  }

  // ============================================================================
  // 2. Rate Limiting
  // ============================================================================
  const rateLimiter = getRateLimiter(pathname, method);
  if (rateLimiter) {
    const rateLimitResult = await rateLimiter.limit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return corsMiddleware.wrap(request, rateLimitResult.response);
    }
  }

  // ============================================================================
  // 3. Authentication Check
  // ============================================================================
  // Jika tidak ada token dan mencoba akses halaman admin
  if (!token && requiresAuth(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return corsMiddleware.wrap(
      request,
      NextResponse.redirect(loginUrl)
    );
  }

  // Jika ada token, verifikasi
  if (token) {
    try {
      const decoded = await verifyToken(token);

      // Jika token valid dan user mencoba akses halaman login, redirect ke admin
      if (pathname === '/login') {
        return corsMiddleware.wrap(
          request,
          NextResponse.redirect(new URL('/admin', request.url))
        );
      }

      // Tambahkan data user ke header request agar bisa diakses di API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id.toString());
      requestHeaders.set('x-user-email', decoded.email);
      requestHeaders.set('x-user-role', decoded.role);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return corsMiddleware.wrap(request, response);
    } catch (error) {
      // Token tidak valid, hapus cookie dan redirect ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
      return corsMiddleware.wrap(request, response);
    }
  }

  // Add CORS headers to response
  const response = NextResponse.next();
  return corsMiddleware.wrap(request, response);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/api/auth/me', // Lindungi endpoint ini
    '/api/berita', // Lindungi endpoint berita
    '/api/galeri', // Lindungi endpoint galeri
    '/api/umkm', // Lindungi endpoint umkm
    '/api/produk-umkm', // Lindungi endpoint produk umkm
    '/api/pegawai', // Lindungi endpoint pegawai
    '/api/profil', // Lindungi endpoint profil (POST/PUT/DELETE butuh auth, GET is public)
    '/api/umum', // Lindungi endpoint umum
    '/api/wisata', // Lindungi endpoint wisata
    '/api/inovasi', // Lindungi endpoint inovasi
  ],
};