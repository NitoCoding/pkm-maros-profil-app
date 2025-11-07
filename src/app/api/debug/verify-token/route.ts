// src/app/api/debug/verify-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/libs/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Coba verifikasi token
    const decoded = verifyToken(token);

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      decoded,
    });

  } catch (error: any) {
    console.error('[Debug API] Verification failed:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Token is invalid',
        reason: error.message 
      },
      { status: 401 }
    );
  }
}