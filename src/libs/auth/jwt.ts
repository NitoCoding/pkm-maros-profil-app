// src/libs/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_change_this_in_production'
);

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role: string; // Tambahkan role untuk otorisasi
}

// Fungsi untuk membuat token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '24h')
    .sign(secretKey);
}

// Fungsi untuk memverifikasi token
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as JWTPayload;
}

// Fungsi untuk menyegarkan token
export async function refreshToken(token: string): Promise<string> {
  const payload = await verifyToken(token);
  return await generateToken(payload);
}