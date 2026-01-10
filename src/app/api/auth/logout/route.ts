// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, blacklistToken } from '@/libs/auth/jwt';

/**
 * POST /api/auth/logout
 * Logout user and blacklist current tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const accessToken = request.cookies.get('token')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Blacklist both tokens if they exist
    if (accessToken) {
      try {
        const payload = await verifyToken(accessToken);
        if (payload.tokenId) {
          // Blacklist for full expiration time
          blacklistToken(
            payload.tokenId,
            payload.id,
            Date.now() + (15 * 60 * 1000) // 15 minutes from now
          );
        }
      } catch (error) {
        // Token might be expired, that's okay
        console.warn('Access token already expired or invalid');
      }
    }

    if (refreshToken) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(refreshToken, secret);

        if (payload.tokenId) {
          const exp = (payload as any).exp * 1000; // Convert to milliseconds
          blacklistToken(
            payload.tokenId as string,
            payload.id as number,
            exp
          );
        }
      } catch (error) {
        // Token might be expired, that's okay
        console.warn('Refresh token already expired or invalid');
      }
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.delete('token');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('Logout error:', error);

    // Still clear cookies even if there's an error
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.delete('token');
    response.cookies.delete('refreshToken');

    return response;
  }
}

/**
 * DELETE /api/auth/logout
 * Logout from all devices
 */
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(accessToken);

    // Blacklist all tokens for this user
    // Note: This will blacklist future tokens too until server restart
    // For production, you'd want to use Redis or database
    const { blacklistAllUserTokens } = await import('@/libs/auth/jwt');
    blacklistAllUserTokens(payload.id);

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });

    response.cookies.delete('token');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error: any) {
    console.error('Logout all error:', error);

    return NextResponse.json(
      { error: 'Failed to logout from all devices' },
      { status: 500 }
    );
  }
}
