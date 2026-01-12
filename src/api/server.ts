/**
 * Express Server Setup
 * Main application entry point with middleware and route configuration
 */

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { config, isDevelopment } from './config'
import { logger } from './logger'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import settingsRoutes from './routes/settings'
import subscriptionsRoutes from './routes/subscriptions'

const app = express()
const PORT = process.env.PORT || 3001

/**
 * Trust proxy - Important for correct client IP and HTTPS detection
 */
app.set('trust proxy', 1)

/**
 * Request logging middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })
  })

  next()
})

/**
 * Parse JSON request bodies
 */
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600, // 1 hour
}

app.use(cors(corsOptions))

/**
 * Security headers middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})

/**
 * API Routes
 */
app.use('/api/settings', settingsRoutes)
app.use('/api/subscriptions', subscriptionsRoutes)

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 200,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Liq Finance API',
    version: '1.0.0',
    endpoints: {
      settings: '/api/settings',
      subscriptions: '/api/subscriptions',
      health: '/api/health',
    },
  })
})

/**
 * 404 handler - must be after all routes
 */
app.use(notFoundHandler)

/**
 * Error handler - must be last
 */
app.use(errorHandler)

/**
 * Start server
 */
export function startServer() {
  return new Promise<void>((resolve, reject) => {
    try {
      app.listen(PORT, () => {
        logger.info(`Server started successfully`, { port: PORT, env: config.nodeEnv })
        resolve()
      })
    } catch (error) {
      logger.error('Failed to start server', error instanceof Error ? error : new Error(String(error)))
      reject(error)
    }
  })
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, gracefully shutting down')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, gracefully shutting down')
  process.exit(0)
})

export default app
