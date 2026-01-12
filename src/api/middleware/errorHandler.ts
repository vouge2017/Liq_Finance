/**
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../logger'
import { ApiError } from '../errors'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))

    return res.status(400).json({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    })
  }

  // Handle API errors
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.code}`, { statusCode: err.statusCode, message: err.message })
    return res.status(err.statusCode).json(err.toJSON())
  }

  // Handle standard errors
  if (err instanceof Error) {
    logger.error('Unhandled error', err)
    return res.status(500).json({
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    })
  }

  // Handle unknown errors
  logger.error('Unknown error type', new Error(String(err)))
  return res.status(500).json({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  })
}

/**
 * 404 handler for unmapped routes
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: 404,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  })
}
