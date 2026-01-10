// src/libs/security/errorHandler.ts
/**
 * Error Handling & Sanitization System
 * Prevents information leakage through error messages
 *
 * - Sanitizes error messages before sending to clients
 * - Logs detailed errors server-side
 * - Provides user-friendly error messages
 * - Prevents exposure of sensitive information
 */

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isDev: boolean = false
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict errors (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Too many requests. Please try again later.',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Internal server errors (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

// ============================================================================
// Error Types
// ============================================================================

export type ErrorResponse = {
  error: string;
  code?: string;
  field?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  requestId?: string;
};

export type SanitizedError = {
  message: string;
  statusCode: number;
  code?: string;
  field?: string;
  shouldLog: boolean;
};

// ============================================================================
// Error Sanitization Configuration
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  // Database errors
  'ER_DUP_ENTRY': 'A record with this information already exists',
  'ER_NO_REFERENCED_ROW_2': 'Referenced record does not exist',
  'ER_ROW_IS_REFERENCED_2': 'Cannot delete this record as it is referenced by other records',
  'ER_BAD_NULL_ERROR': 'Required field is missing',
  'ER_DUP_ENTRY_WITH_KEY_NAME': 'A record with this value already exists',
  'ER_NO_SUCH_TABLE': 'Data operation failed',
  'ER_UNKNOWN_TABLE': 'Data operation failed',
  'ER_PARSE_ERROR': 'Invalid data format',
  'ER_EMPTY_QUERY': 'Invalid request',
  'ER_GET_CONNECTION': 'Database connection error',

  // Network errors
  'ECONNREFUSED': 'Service unavailable',
  'ETIMEDOUT': 'Request timed out',
  'ENOTFOUND': 'Service unavailable',
  'ECONNRESET': 'Connection interrupted',

  // JWT errors
  'JWT_EXPIRED': 'Session expired. Please login again',
  'JWT_INVALID': 'Invalid session. Please login again',
  'JWT_MALFORMED': 'Invalid session. Please login again',

  // Validation errors
  'INVALID_JSON': 'Invalid JSON format',
  'MISSING_FIELD': 'Required field is missing',
  'INVALID_FORMAT': 'Invalid data format',
  'INVALID_TYPE': 'Invalid data type',

  // File upload errors
  'FILE_TOO_LARGE': 'File is too large',
  'INVALID_FILE_TYPE': 'Invalid file type',
  'FILE_UPLOAD_FAILED': 'File upload failed',

  // Rate limiting
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later',

  // Generic fallback
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again',
};

// ============================================================================
// Error Sanitization Functions
// ============================================================================

/**
 * Check if error is a database error
 */
function isDatabaseError(error: any): boolean {
  const errorCode = error?.code;
  const sqlState = error?.sqlState;

  return (
    errorCode?.startsWith('ER_') ||
    sqlState?.startsWith('45') ||
    error?.errno !== undefined
  );
}

/**
 * Check if error should be hidden from client
 */
function shouldHideError(error: any): boolean {
  // Hide database errors
  if (isDatabaseError(error)) {
    return true;
  }

  // Hide network errors
  if (error?.code?.startsWith('ECONN') ||
      error?.code?.startsWith('ETIMEDOUT') ||
      error?.code?.startsWith('ENOTFOUND')) {
    return true;
  }

  // Hide system errors
  if (error?.code?.startsWith('EACCES') ||
      error?.code?.startsWith('EPERM')) {
    return true;
  }

  // Hide errors with stack traces
  if (error?.stack && !error.isDev) {
    return true;
  }

  return false;
}

/**
 * Get user-friendly error message
 */
function getSanitizedMessage(error: any): string {
  // If it's our custom error, use its message
  if (error instanceof AppError) {
    return error.message;
  }

  // If error has a code we recognize
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Check for specific error patterns
  const errorMessage = error?.message || '';

  // SQL injection patterns (shouldn't happen, but just in case)
  if (/SQL.*syntax/i.test(errorMessage)) {
    return 'Invalid data format';
  }

  // Connection errors
  if (/connect|connection|network/i.test(errorMessage)) {
    return 'Service temporarily unavailable';
  }

  // Timeout errors
  if (/timeout|timed out/i.test(errorMessage)) {
    return 'Request timed out';
  }

  // Permission errors
  if (/permission|denied|forbidden/i.test(errorMessage)) {
    return 'You do not have permission to perform this action';
  }

  // Not found errors
  if (/not found|doesn't exist|no such/i.test(errorMessage)) {
    return 'Resource not found';
  }

  // Default generic message
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Sanitize error for client response
 */
export function sanitizeError(error: any): SanitizedError {
  // If it's already our custom error
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      field: error instanceof ValidationError ? error.field : undefined,
      shouldLog: error.statusCode >= 500,
    };
  }

  // Determine if we should hide details
  const shouldHide = shouldHideError(error);

  // Get appropriate status code
  let statusCode = 500;
  if (error?.statusCode) {
    statusCode = error.statusCode;
  } else if (error?.status) {
    statusCode = error.status;
  } else if (shouldHide) {
    statusCode = 500;
  }

  // Get sanitized message
  const message = shouldHide ? getSanitizedMessage(error) : (error?.message || ERROR_MESSAGES.UNKNOWN_ERROR);

  return {
    message,
    statusCode,
    code: error?.code,
    shouldLog: statusCode >= 500 || shouldHide,
  };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: any, path?: string, requestId?: string): ErrorResponse {
  const sanitized = sanitizeError(error);

  return {
    error: sanitized.message,
    code: sanitized.code,
    field: sanitized.field,
    statusCode: sanitized.statusCode,
    timestamp: new Date().toISOString(),
    path,
    requestId,
  };
}

// ============================================================================
// Error Logging Functions
// ============================================================================

/**
 * Log error with full details (server-side only)
 */
export function logError(error: any, context?: {
  path?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}): void {
  const sanitized = sanitizeError(error);

  // Only log important errors
  if (!sanitized.shouldLog) {
    return;
  }

  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
      statusCode: sanitized.statusCode,
    },
    context,
    sanitized: {
      clientMessage: sanitized.message,
      clientCode: sanitized.code,
    },
  };

  // In development, log everything
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', JSON.stringify(logData, null, 2));
  } else {
    // In production, log without stack trace (use proper logging service)
    console.error('[ERROR]', {
      timestamp: logData.timestamp,
      error: {
        message: logData.error.message,
        name: logData.error.name,
        code: logData.error.code,
      },
      context,
    });
  }
}

/**
 * Log error with additional metadata
 */
export function logErrorWithMetadata(
  error: any,
  metadata: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    body?: any;
    query?: any;
    [key: string]: any;
  }
): void {
  logError(error, metadata);
}

// ============================================================================
// Try-Catch Wrapper Helper
// ============================================================================

/**
 * Wrap async functions with automatic error handling
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  };
}

// ============================================================================
// Next.js API Route Helper
// ============================================================================

import { NextResponse } from 'next/server';

/**
 * Handle errors in Next.js API routes
 */
export function handleApiError(
  error: any,
  request?: Request
): NextResponse {
  // Log the error
  const requestId = crypto.randomUUID();
  logError(error, {
    requestId,
    url: request?.url,
    method: request?.method,
  });

  // Format response
  const sanitized = sanitizeError(error);
  const errorResponse = formatErrorResponse(
    error,
    new URL(request?.url || '').pathname,
    requestId
  );

  return NextResponse.json(errorResponse, {
    status: sanitized.statusCode,
    headers: {
      'X-Request-ID': requestId,
      'Content-Type': 'application/json',
    },
  });
}

// ============================================================================
// Error Response Helpers
// ============================================================================

/**
 * Create validation error response
 */
export function validationError(message: string, field?: string): NextResponse {
  const error = new ValidationError(message, field);
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: 400 });
}

/**
 * Create not found error response
 */
export function notFound(resource: string = 'Resource'): NextResponse {
  const error = new NotFoundError(resource);
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: 404 });
}

/**
 * Create unauthorized error response
 */
export function unauthorized(message?: string): NextResponse {
  const error = new AuthenticationError(message);
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: 401 });
}

/**
 * Create forbidden error response
 */
export function forbidden(message?: string): NextResponse {
  const error = new AuthorizationError(message);
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: 403 });
}

/**
 * Create conflict error response
 */
export function conflict(message: string): NextResponse {
  const error = new ConflictError(message);
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: 409 });
}

/**
 * Create rate limit error response
 */
export function rateLimit(retryAfter?: number): NextResponse {
  const error = new RateLimitError(undefined, retryAfter);
  const response = formatErrorResponse(error);

  return NextResponse.json(response, {
    status: 429,
    headers: {
      'Retry-After': retryAfter?.toString() || '60',
    },
  });
}

/**
 * Create internal server error response
 */
export function internalError(): NextResponse {
  const error = new InternalServerError();
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: 500 });
}
