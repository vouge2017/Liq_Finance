/**
 * Authentication Middleware
 * Verifies JWT tokens and extracts user context
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { logger } from '../logger'
import { AuthenticationError, AuthorizationError } from '../errors'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    iat?: number
    exp?: number
  }
}

/**
 * Extract and verify JWT token from request
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

/**
 * Middleware to verify JWT token
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req)

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email?: string; iat?: number; exp?: number }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    }

    logger.debug('User authenticated', { userId: decoded.id })
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { error: error.message })
      return res.status(401).json({
        status: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message })
      return res.status(401).json({
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      })
    }

    if (error instanceof AuthenticationError) {
      return res.status(error.statusCode).json(error.toJSON())
    }

    logger.error('Auth middleware error', error instanceof Error ? error : new Error(String(error)))
    return res.status(500).json({
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Authentication failed',
    })
  }
}

/**
 * Verify user has required permissions
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      })
    }

    // TODO: Implement permission checking logic based on user roles/permissions
    // For now, authenticated users have all permissions
    next()
  }
}

/**
 * Verify user can access their own data
 */
export function requireUserMatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required',
    })
  }

  const userId = req.params.userId || req.body?.userId

  if (userId && userId !== req.user.id) {
    logger.warn('User attempted to access another users data', {
      requestedUser: userId,
      actualUser: req.user.id,
    })
    return res.status(403).json({
      status: 403,
      code: 'AUTHORIZATION_ERROR',
      message: 'You do not have permission to access this resource',
    })
  }

  next()
}
