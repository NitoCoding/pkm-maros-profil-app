// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/libs/auth/jwt';

/**
 * POST /api/auth/verify
 * Verify JWT token (for client-side checks)
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token
    const payload = await verifyToken(token);

    return NextResponse.json({
      valid: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
