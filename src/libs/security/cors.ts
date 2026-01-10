// src/libs/security/cors.ts
/**
 * CORS Security Configuration
 * Protects against cross-origin attacks and controls access to API
 */

export interface CORSConfig {
  /** Allowed origins (default: same origin) */
  allowedOrigins?: string[];

  /** Allowed HTTP methods */
  allowedMethods?: string[];

  /** Allowed headers */
  allowedHeaders?: string[];

  /** Headers that can be exposed to browser */
  exposedHeaders?: string[];

  /** Allow credentials (cookies, authorization headers) */
  credentials?: boolean;

  /** Max age for preflight requests (in seconds) */
  maxAge?: number;

  /** Whether to allow private network access */
  allowPrivateNetworkAccess?: boolean;
}

/**
 * Default CORS configuration for development
 */
const DEFAULT_DEV_CORS: CORSConfig = {
  allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 hours
  allowPrivateNetworkAccess: false,
};

/**
 * Default CORS configuration for production
 * IMPORTANT: Update allowedOrigins with your actual domain!
 */
const DEFAULT_PROD_CORS: CORSConfig = {
  allowedOrigins: [
    // Add your production domains here:
    // 'https://yourdomain.com',
    // 'https://www.yourdomain.com',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400,
  allowPrivateNetworkAccess: false,
};

/**
 * Get CORS configuration based on environment
 */
export function getCorsConfig(customConfig?: CORSConfig): CORSConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const defaultConfig = isDevelopment ? DEFAULT_DEV_CORS : DEFAULT_PROD_CORS;

  return {
    ...defaultConfig,
    ...customConfig,
  };
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;

  // Check for exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check for wildcard
  if (allowedOrigins.includes('*')) {
    return true;
  }

  // Check for subdomain wildcard (e.g., *.example.com)
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2); // Remove *.
      if (origin.endsWith(domain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  request: Request,
  response: Response,
  config: CORSConfig
): Response {
  const origin = request.headers.get('origin');
  const allowedOrigins = config.allowedOrigins || [];

  // Set Access-Control-Allow-Origin
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  if (config.allowedMethods) {
    response.headers.set(
      'Access-Control-Allow-Methods',
      config.allowedMethods.join(', ')
    );
  }

  if (config.allowedHeaders) {
    response.headers.set(
      'Access-Control-Allow-Headers',
      config.allowedHeaders.join(', ')
    );
  }

  if (config.exposedHeaders) {
    response.headers.set(
      'Access-Control-Expose-Headers',
      config.exposedHeaders.join(', ')
    );
  }

  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }

  if (config.allowPrivateNetworkAccess) {
    response.headers.set('Access-Control-Allow-Private-Network', 'true');
  }

  return response;
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflightRequest(request: Request, config: CORSConfig): Response {
  const origin = request.headers.get('origin');
  const allowedOrigins = config.allowedOrigins || [];

  // Check if origin is allowed
  if (!origin || !isOriginAllowed(origin, allowedOrigins)) {
    return new Response(null, {
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes('*') ? '*' : 'false',
      },
    });
  }

  // Create response with CORS headers
  const response = new Response(null, { status: 204 });

  return applyCorsHeaders(request, response, config);
}

/**
 * CORS middleware class for Next.js
 */
export class CORSMiddleware {
  private config: CORSConfig;

  constructor(config?: CORSConfig) {
    this.config = getCorsConfig(config);
  }

  /**
   * Handle incoming request with CORS
   */
  handle(request: Request): Response | null {
    const method = request.method;

    // Handle preflight request
    if (method === 'OPTIONS') {
      return handlePreflightRequest(request, this.config);
    }

    // For non-OPTIONS requests, return null (let request pass through)
    return null;
  }

  /**
   * Wrap a response with CORS headers
   */
  wrap(request: Request, response: Response): Response {
    return applyCorsHeaders(request, response, this.config);
  }
}

// ============================================================================
// Pre-configured CORS Middleware Instances
// ============================================================================

/**
 * Default CORS middleware (uses environment-based config)
 */
export const corsMiddleware = new CORSMiddleware();

/**
 * Strict CORS - only allow specific origins
 */
export const strictCors = new CORSMiddleware({
  allowedOrigins: [
    // Add your specific origins here
    'http://localhost:3000',
  ],
  credentials: true,
});

/**
 * Permissive CORS - allow all origins (USE WITH CAUTION)
 * Only use for public APIs
 */
export const permissiveCors = new CORSMiddleware({
  allowedOrigins: ['*'],
  credentials: false,
});

/**
 * Development-only CORS
 */
export const devCors = new CORSMiddleware({
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: true,
});
