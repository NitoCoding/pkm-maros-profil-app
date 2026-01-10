// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTokenPair } from '@/libs/auth/jwt';
import { validateUserCredentials } from '@/libs/auth/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await validateUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token pair (access + refresh)
    const tokenPair = await generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      tokenExpiresIn: tokenPair.accessExpiresIn, // 15 minutes
    });

    // Set access token as cookie
    response.cookies.set('token', tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenPair.accessExpiresIn,
      path: '/',
    });

    // Set refresh token as cookie (longer-lived)
    response.cookies.set('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenPair.refreshExpiresIn,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}