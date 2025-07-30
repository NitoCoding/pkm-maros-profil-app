import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('middleware running...')
  
  const token = request.cookies.get('token')?.value
  const isProtected = request.nextUrl.pathname.startsWith('/admin')
  
  console.log('Token:', token)
  console.log('Is Protected Route:', isProtected)

  if (isProtected && !token) {
    console.log('Redirecting to login...')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Aktifkan middleware untuk route tertentu
export const config = {
  matcher: ['/admin/:path*'] // Catches all admin routes and sub-routes
}
