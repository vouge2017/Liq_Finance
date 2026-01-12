/**
 * Payment Error Classes
 * 
 * Comprehensive error hierarchy for payment processing
 * All errors include helpful context for debugging and user feedback
 */

/**
 * Base payment error class
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'PaymentError'
    Object.setPrototypeOf(this, PaymentError.prototype)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
    }
  }
}

/**
 * Telebirr-specific payment error
 */
export class TelebirrPaymentError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'TELEBIRR_ERROR', 400, context)
    this.name = 'TelebirrPaymentError'
    Object.setPrototypeOf(this, TelebirrPaymentError.prototype)
  }
}

/**
 * CBE-specific payment error
 */
export class CBEPaymentError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'CBE_ERROR', 400, context)
    this.name = 'CBEPaymentError'
    Object.setPrototypeOf(this, CBEPaymentError.prototype)
  }
}

/**
 * Stripe-specific payment error
 */
export class StripePaymentError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'STRIPE_ERROR', 400, context)
    this.name = 'StripePaymentError'
    Object.setPrototypeOf(this, StripePaymentError.prototype)
  }
}

/**
 * Network error (timeout, connection refused, etc.)
 */
export class NetworkError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'NETWORK_ERROR', 503, context)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Validation error (invalid input)
 */
export class PaymentValidationError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', 422, context)
    this.name = 'PaymentValidationError'
    Object.setPrototypeOf(this, PaymentValidationError.prototype)
  }
}

/**
 * Authentication error (API key invalid, unauthorized)
 */
export class AuthenticationError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, context)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Authorization error (user not allowed to perform action)
 */
export class AuthorizationError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, context)
    this.name = 'AuthorizationError'
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * Rate limit error (too many requests)
 */
export class RateLimitError extends PaymentError {
  constructor(
    message: string = 'Too many requests. Please try again later.',
    context?: any
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, context)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Idempotency error (duplicate request detected)
 */
export class IdempotencyError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'DUPLICATE_REQUEST', 409, context)
    this.name = 'IdempotencyError'
    Object.setPrototypeOf(this, IdempotencyError.prototype)
  }
}

/**
 * Subscription error
 */
export class SubscriptionError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'SUBSCRIPTION_ERROR', 400, context)
    this.name = 'SubscriptionError'
    Object.setPrototypeOf(this, SubscriptionError.prototype)
  }
}

/**
 * Database error
 */
export class DatabaseError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'DATABASE_ERROR', 500, context)
    this.name = 'DatabaseError'
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'CONFIGURATION_ERROR', 500, context)
    this.name = 'ConfigurationError'
    Object.setPrototypeOf(this, ConfigurationError.prototype)
  }
}

/**
 * Unknown/unexpected error
 */
export class UnknownPaymentError extends PaymentError {
  constructor(message: string, context?: any) {
    super(message, 'UNKNOWN_ERROR', 500, context)
    this.name = 'UnknownPaymentError'
    Object.setPrototypeOf(this, UnknownPaymentError.prototype)
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Convert any error to PaymentError
   */
  static normalize(error: unknown): PaymentError {
    if (error instanceof PaymentError) {
      return error
    }

    if (error instanceof Error) {
      return new UnknownPaymentError(error.message, {
        originalError: error.name,
        stack: error.stack,
      })
    }

    return new UnknownPaymentError('An unknown error occurred', {
      raw: String(error),
    })
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: PaymentError): string {
    const messages: Record<string, string> = {
      TELEBIRR_ERROR: 'Telebirr payment failed. Please try again.',
      CBE_ERROR: 'CBE payment failed. Please try again.',
      STRIPE_ERROR: 'Card payment failed. Please check your card details.',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      VALIDATION_ERROR: 'Invalid payment details. Please review and try again.',
      AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
      AUTHORIZATION_ERROR: 'You are not authorized to perform this action.',
      RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait before trying again.',
      DUPLICATE_REQUEST: 'Payment already in progress. Please wait.',
      SUBSCRIPTION_ERROR: 'Subscription error. Please contact support.',
      DATABASE_ERROR: 'Service temporarily unavailable. Please try again later.',
      CONFIGURATION_ERROR: 'System configuration error. Please contact support.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
    }

    return messages[error.code] || error.message
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: PaymentError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'DUPLICATE_REQUEST', // Can retry idempotently
    ]

    return retryableCodes.includes(error.code)
  }

  /**
   * Get HTTP status code
   */
  static getStatusCode(error: PaymentError): number {
    return error.statusCode || 500
  }

  /**
   * Format error for logging (no PII)
   */
  static formatForLogging(error: PaymentError): object {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      // Don't log the full context as it might contain PII
      contextKeys: error.context ? Object.keys(error.context) : [],
    }
  }
}
