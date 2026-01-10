// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken, verifyRefreshToken, blacklistToken } from '@/libs/auth/jwt';
import { verifyToken } from '@/libs/auth/jwt';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify and rotate refresh token
    const { accessToken, expiresIn } = await refreshAccessToken(refreshToken);

    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresIn,
    });

    // Set new access token
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Token refresh error:', error);

    // If token is invalid/expired, clear cookies
    const response = NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );

    response.cookies.delete('token');
    response.cookies.delete('refreshToken');

    return response;
  }
}
