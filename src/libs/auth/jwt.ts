// src/libs/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

// ============================================================================
// SECURITY: JWT Secret Configuration
// ============================================================================

/**
 * Get JWT secret from environment
 * Throws error if not configured (prevents using insecure fallback)
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
      'This is a critical security configuration. ' +
      'Please set JWT_SECRET in your .env file with a strong random string (at least 32 characters).'
    );
  }

  // Validate secret strength
  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long. ' +
      `Current length: ${secret.length}. ` +
      'Please use a stronger secret for production security.'
    );
  }

  return new TextEncoder().encode(secret);
}

const secretKey = getJWTSecret();

// ============================================================================
// Token Types
// ============================================================================

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  type?: 'access' | 'refresh';
  tokenId?: string; // Unique identifier for token instance
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

// ============================================================================
// Token Blacklist Management (In-Memory)
// ============================================================================

interface BlacklistedToken {
  tokenId: string;
  expiresAt: number;
  userId: number;
}

const tokenBlacklist = new Map<string, BlacklistedToken>();

// Cleanup expired blacklist entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [tokenId, token] of tokenBlacklist.entries()) {
    if (token.expiresAt < now) {
      tokenBlacklist.delete(tokenId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if token is blacklisted
 */
export function isTokenBlacklisted(tokenId: string): boolean {
  const token = tokenBlacklist.get(tokenId);
  if (!token) return false;

  // Check if expired
  if (token.expiresAt < Date.now()) {
    tokenBlacklist.delete(tokenId);
    return false;
  }

  return true;
}

/**
 * Add token to blacklist
 */
export function blacklistToken(tokenId: string, userId: number, expiresAt: number): void {
  tokenBlacklist.set(tokenId, { tokenId, userId, expiresAt });
}

/**
 * Blacklist all tokens for a user (logout from all devices)
 */
export function blacklistAllUserTokens(userId: number): void {
  const now = Date.now();
  for (const [tokenId, token] of tokenBlacklist.entries()) {
    if (token.userId === userId) {
      // Update expiration to now (effectively immediate)
      token.expiresAt = now;
    }
  }
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate unique token ID
 */
function generateTokenId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

/**
 * Generate access token (short-lived)
 */
export async function generateAccessToken(payload: Omit<JWTPayload, 'type' | 'tokenId'>): Promise<string> {
  const tokenId = generateTokenId();

  return await new SignJWT({
    ...payload,
    type: 'access',
    tokenId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Access token: 15 minutes
    .sign(secretKey);
}

/**
 * Generate refresh token (long-lived)
 */
export async function generateRefreshToken(payload: Omit<JWTPayload, 'type' | 'tokenId'>): Promise<string> {
  const tokenId = generateTokenId();

  return await new SignJWT({
    ...payload,
    type: 'refresh',
    tokenId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Refresh token: 7 days
    .sign(secretKey);
}

/**
 * Generate token pair (access + refresh)
 */
export async function generateTokenPair(payload: Omit<JWTPayload, 'type' | 'tokenId'>): Promise<TokenPair> {
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    accessExpiresIn: 15 * 60, // 15 minutes in seconds
    refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateTokenPair instead
 */
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'type' | 'tokenId'>): Promise<string> {
  return await generateAccessToken(payload);
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify and decode token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secretKey);
  const decoded = payload as unknown as JWTPayload;

  // Check if token is blacklisted
  if (decoded.tokenId && isTokenBlacklisted(decoded.tokenId)) {
    throw new Error('Token has been revoked');
  }

  return decoded;
}

/**
 * Verify access token specifically
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const payload = await verifyToken(token);

  if (payload.type !== 'access') {
    throw new Error('Invalid token type: expected access token');
  }

  return payload;
}

/**
 * Verify refresh token specifically
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const payload = await verifyToken(token);

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type: expected refresh token');
  }

  return payload;
}

// ============================================================================
// Token Rotation
// ============================================================================

/**
 * Rotate refresh token and issue new token pair
 * This should be called when refreshing tokens
 */
export async function rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
  // Verify old refresh token
  const payload = await verifyRefreshToken(refreshToken);

  // Blacklist old token
  if (payload.tokenId) {
    try {
      const { payload: decodedPayload } = await jwtVerify(refreshToken, secretKey);
      const exp = (decodedPayload as any).exp * 1000; // Convert to milliseconds
      blacklistToken(payload.tokenId!, payload.id, exp);
    } catch (error) {
      // Token might be expired, that's okay - just generate new one
      console.warn('Failed to blacklist old token during rotation:', error);
    }
  }

  // Generate new token pair
  const { id, email, name, role } = payload;
  return await generateTokenPair({ id, email, name, role });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const tokenPair = await rotateRefreshToken(refreshToken);

  return {
    accessToken: tokenPair.accessToken,
    expiresIn: tokenPair.accessExpiresIn,
  };
}

// ============================================================================
// Legacy Functions (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use rotateRefreshToken instead
 */
export async function refreshToken(token: string): Promise<string> {
  const payload = await verifyToken(token);
  return await generateToken(payload);
}