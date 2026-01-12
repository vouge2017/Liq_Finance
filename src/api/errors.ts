/**
 * API Error Classes
 * Standardized error handling for backend APIs
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  toJSON() {
    return {
      status: this.statusCode,
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && { details: this.details }),
    }
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, 'VALIDATION_ERROR', details)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required', details?: Record<string, unknown>) {
    super(401, message, 'AUTHENTICATION_ERROR', details)
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied', details?: Record<string, unknown>) {
    super(403, message, 'AUTHORIZATION_ERROR', details)
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(404, `${resource} not found`, 'NOT_FOUND', details)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(409, message, 'CONFLICT', details)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number = 60, details?: Record<string, unknown>) {
    super(429, 'Too many requests, please try again later', 'RATE_LIMIT_EXCEEDED', { retryAfter, ...details })
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: Record<string, unknown>) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, message, 'DATABASE_ERROR', details)
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(502, `${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', details)
    Object.setPrototypeOf(this, ExternalServiceError.prototype)
  }
}
