// src/libs/security/rateLimit.ts
/**
 * In-memory Rate Limiting Middleware
 * Protects against DDoS attacks and brute force attempts
 *
 * Uses a sliding window algorithm to track request counts per IP
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  limit: number;

  /** Time window in milliseconds */
  window: number;

  /** Custom identifier generator (defaults to IP address) */
  identifier?: (request: Request) => string;

  /** Custom error message */
  errorMessage?: string;

  /** Whether to skip successful requests from counting */
  skipSuccessfulRequests?: boolean;

  /** Whether to skip failed requests from counting */
  skipFailedRequests?: boolean;
}

// In-memory store for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware class
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      limit: config.limit,
      window: config.window,
      identifier: config.identifier || this.defaultIdentifier,
      errorMessage: config.errorMessage || 'Too many requests. Please try again later.',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };
  }

  /**
   * Default identifier generator using IP address
   */
  private defaultIdentifier(request: Request): string {
    // Try to get real IP from headers (for proxied requests)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

    const ip = forwardedFor?.split(',')[0].trim() ||
               realIp ||
               cfConnectingIp ||
               'unknown';

    return ip;
  }

  /**
   * Check if request should be rate limited
   */
  private checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Reset if window has expired
    if (!entry || entry.resetTime < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.window,
      };
      rateLimitStore.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: this.config.limit - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.config.limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Rate limit middleware function
   */
  async limit(request: Request): Promise<{ allowed: boolean; response?: Response }> {
    const identifier = this.config.identifier(request);
    const result = this.checkLimit(identifier);

    if (!result.allowed) {
      const response = new Response(
        JSON.stringify({
          error: this.config.errorMessage,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': this.config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          },
        }
      );

      return { allowed: false, response };
    }

    return { allowed: true };
  }

  /**
   * Reset rate limit for a specific identifier (for testing/admin purposes)
   */
  static reset(identifier: string): void {
    rateLimitStore.delete(identifier);
  }

  /**
   * Clear all rate limit data (for testing/admin purposes)
   */
  static clear(): void {
    rateLimitStore.clear();
  }

  /**
   * Get current stats for an identifier
   */
  static getStats(identifier: string): { count: number; resetTime: number } | null {
    const entry = rateLimitStore.get(identifier);
    return entry ? { count: entry.count, resetTime: entry.resetTime } : null;
  }
}

// ============================================================================
// Pre-configured Rate Limiters for Different Use Cases
// ============================================================================

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = new RateLimiter({
  limit: 5,
  window: 15 * 60 * 1000, // 15 minutes
  errorMessage: 'Too many login attempts. Please try again later.',
});

/**
 * Standard rate limiter for API endpoints
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = new RateLimiter({
  limit: 100,
  window: 15 * 60 * 1000, // 15 minutes
  errorMessage: 'Too many API requests. Please try again later.',
});

/**
 * Lenient rate limiter for public endpoints
 * 1000 requests per hour per IP
 */
export const publicRateLimiter = new RateLimiter({
  limit: 1000,
  window: 60 * 60 * 1000, // 1 hour
  errorMessage: 'Too many requests. Please slow down.',
});

/**
 * Strict rate limiter for create/update/delete operations
 * 20 requests per 10 minutes per IP
 */
export const mutationRateLimiter = new RateLimiter({
  limit: 20,
  window: 10 * 60 * 1000, // 10 minutes
  errorMessage: 'Too many write operations. Please try again later.',
});

/**
 * Very strict rate limiter for sensitive operations (password change, etc.)
 * 3 requests per hour per IP
 */
export const sensitiveRateLimiter = new RateLimiter({
  limit: 3,
  window: 60 * 60 * 1000, // 1 hour
  errorMessage: 'Too many sensitive operations. Please try again later.',
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  return forwardedFor?.split(',')[0].trim() ||
         realIp ||
         cfConnectingIp ||
         'unknown';
}

/**
 * Check if rate limit headers indicate the client is being rate limited
 */
export function isRateLimited(response: Response): boolean {
  return response.status === 429;
}

/**
 * Get remaining requests from rate limit headers
 */
export function getRemainingRequests(response: Response): number {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  return remaining ? parseInt(remaining) : -1;
}
