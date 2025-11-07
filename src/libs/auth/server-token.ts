// src/libs/auth/server-token.ts
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

// Get token from cookie (server-side only)
export async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

// Check if user is authenticated (server-side only)
export function isServerAuthenticated() {
  const token = getServerToken();
  if (!token) return false;
  
  try {
    const decoded = verifyToken(token as unknown as string);
    return !!decoded;
  } catch (error) {
    return false;
  }
}