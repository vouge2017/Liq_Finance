/**
 * API Configuration and Validation
 * Centralizes all API configuration with validation
 */

import { z } from 'zod'

// Configuration validation schema
const ConfigSchema = z.object({
  supabaseUrl: z.string().url('Invalid Supabase URL'),
  supabaseAnonKey: z.string().min(1, 'Supabase anon key is required'),
  supabaseServiceRoleKey: z.string().min(1, 'Supabase service role key is required'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  encryptionKey: z.string().min(32, 'Encryption key must be at least 32 characters'),
  rateLimitWindow: z.number().int().positive().default(900000), // 15 minutes
  rateLimitMaxRequests: z.number().int().positive().default(100),
})

export type AppConfig = z.infer<typeof ConfigSchema>

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): AppConfig {
  const config = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || '',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  }

  try {
    return ConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Configuration validation failed: ${messages}`)
    }
    throw error
  }
}

// Export singleton instance
export const config = loadConfig()

/**
 * Check if running in production
 */
export const isProduction = config.nodeEnv === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = config.nodeEnv === 'development'
