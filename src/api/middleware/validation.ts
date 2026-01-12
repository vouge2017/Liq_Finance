/**
 * Request Validation Middleware
 */

import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { logger } from '../logger'

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })

      req.body = validated.body || req.body
      req.query = validated.query || req.query
      req.params = validated.params || req.params

      next()
    } catch (error) {
      logger.warn('Request validation failed', { path: req.path, method: req.method })
      next(error)
    }
  }
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      logger.warn('Body validation failed', { path: req.path, method: req.method })
      next(error)
    }
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query)
      next()
    } catch (error) {
      logger.warn('Query validation failed', { path: req.path, method: req.method })
      next(error)
    }
  }
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params)
      next()
    } catch (error) {
      logger.warn('Params validation failed', { path: req.path, method: req.method })
      next(error)
    }
  }
}
