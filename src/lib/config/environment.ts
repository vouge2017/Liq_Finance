/**
 * Secure Environment Configuration
 * Handles environment variables with validation and type safety
 */

import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
    // Supabase Configuration (optional in demo mode)
    VITE_SUPABASE_URL: z.string().url().optional(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),

    // Demo mode flag
    VITE_DEMO_MODE: z.string().optional().default('false'),

    // Feature Flags (optional with defaults)
    VITE_ENABLE_AI_FEATURES: z.string().optional().default('true'),
    VITE_ENABLE_VOICE_INPUT: z.string().optional().default('true'),
    VITE_ENABLE_RECEIPT_SCAN: z.string().optional().default('true'),

    // Development Flags (optional with defaults)
    VITE_DEBUG_MODE: z.string().optional().default('false'),
    VITE_MOCK_API: z.string().optional().default('false'),

    // Client-side Encryption Key (optional with default)
    VITE_ENCRYPTION_KEY: z.string().optional().default('development-client-encryption-key-32'),

    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Server-side only environment variables (not exposed to frontend)
const serverEnvSchema = z.object({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required for server operations').optional(),
    SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required').optional(),
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for AI features').optional(),

    // Security Configuration (optional with defaults)
    ENCRYPTION_KEY: z.string().length(32, 'ENCRYPTION_KEY must be exactly 32 characters').optional(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
    RATE_LIMIT_WINDOW: z.string().optional().default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().optional().default('100'),

    // Redis Configuration (optional for rate limiting)
    REDIS_URL: z.string().url().optional(),
    REDIS_CONNECTION_STRING: z.string().optional(),
    REDIS_HOST: z.string().optional().default('localhost'),
    REDIS_PORT: z.string().optional().default('6379'),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.string().optional().default('0'),
    REDIS_SERVER: z.string().optional(),
    REDIS_AUTH: z.string().optional(),

    // Optional Monitoring
    SENTRY_DSN: z.string().url().optional(),
    ANALYTICS_ID: z.string().optional(),
});

export interface AppConfig {
    supabase: {
        url: string;
        anonKey: string;
    };
    features: {
        ai: boolean;
        voice: boolean;
        receiptScan: boolean;
    };
    development: {
        debugMode: boolean;
        mockApi: boolean;
    };
    security: {
        encryptionKey: string;
    };
    environment: 'development' | 'production' | 'test';
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
}

export interface ServerConfig {
    supabase: {
        serviceRoleKey: string;
        jwtSecret: string;
    };
    gemini: {
        apiKey: string;
    };
    security: {
        encryptionKey: string;
        jwtSecret: string;
        rateLimitWindow: number;
        rateLimitMaxRequests: number;
    };
    redis?: {
        enabled: boolean;
        host: string;
        port: number;
        password?: string;
        db: number;
    };
    monitoring?: {
        sentryDsn?: string;
        analyticsId?: string;
    };
}

/**
 * Validate and parse environment variables for frontend
 */
function validateFrontendEnv(): AppConfig {
    try {
        // Use import.meta.env for Vite environment variables
        const envData = {
            VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
            VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE || 'false',
            VITE_ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES || 'true',
            VITE_ENABLE_VOICE_INPUT: import.meta.env.VITE_ENABLE_VOICE_INPUT || 'true',
            VITE_ENABLE_RECEIPT_SCAN: import.meta.env.VITE_ENABLE_RECEIPT_SCAN || 'true',
            VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE || 'false',
            VITE_MOCK_API: import.meta.env.VITE_MOCK_API || 'false',
            VITE_ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'development-client-encryption-key-32',
            NODE_ENV: import.meta.env.NODE_ENV || 'development',
        };

        const env = envSchema.parse(envData);
        const isDemoMode = env.VITE_DEMO_MODE === 'true';

        // In demo mode, Supabase credentials are optional
        if (!isDemoMode && (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY)) {
            throw new Error('Supabase credentials are required when not in demo mode');
        }

        return {
            supabase: {
                url: env.VITE_SUPABASE_URL || 'demo-url',
                anonKey: env.VITE_SUPABASE_ANON_KEY || 'demo-key',
            },
            features: {
                ai: env.VITE_ENABLE_AI_FEATURES === 'true',
                voice: env.VITE_ENABLE_VOICE_INPUT === 'true',
                receiptScan: env.VITE_ENABLE_RECEIPT_SCAN === 'true',
            },
            development: {
                debugMode: env.VITE_DEBUG_MODE === 'true',
                mockApi: env.VITE_MOCK_API === 'true',
            },
            security: {
                encryptionKey: env.VITE_ENCRYPTION_KEY || 'development-client-encryption-key-32',
            },
            environment: env.NODE_ENV,
            isDevelopment: env.NODE_ENV === 'development',
            isProduction: env.NODE_ENV === 'production',
            isTest: env.NODE_ENV === 'test',
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new Error(`Invalid environment configuration: ${missingVars}`);
        }
        throw error;
    }
}

/**
 * Validate and parse environment variables for server-side operations
 */
function validateServerEnv(): ServerConfig {
    try {
        const env = serverEnvSchema.parse(process.env);

        return {
            supabase: {
                serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || 'development-service-key',
                jwtSecret: env.SUPABASE_JWT_SECRET || 'development-jwt-secret',
            },
            gemini: {
                apiKey: env.GEMINI_API_KEY || 'development-gemini-key',
            },
            security: {
                encryptionKey: env.ENCRYPTION_KEY || 'development-encryption-key-32',
                jwtSecret: env.JWT_SECRET || 'development-jwt-secret-32-chars-min',
                rateLimitWindow: parseInt(env.RATE_LIMIT_WINDOW) || 900000,
                rateLimitMaxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS) || 100,
            },
            redis: env.REDIS_URL || env.REDIS_HOST ? {
                enabled: true,
                host: env.REDIS_HOST || 'localhost',
                port: parseInt(env.REDIS_PORT || '6379'),
                password: env.REDIS_PASSWORD || env.REDIS_AUTH,
                db: parseInt(env.REDIS_DB || '0'),
            } : {
                enabled: false,
                host: 'localhost',
                port: 6379,
                db: 0,
            },
            monitoring: env.SENTRY_DSN || env.ANALYTICS_ID ? {
                sentryDsn: env.SENTRY_DSN,
                analyticsId: env.ANALYTICS_ID,
            } : undefined,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new Error(`Invalid server environment configuration: ${missingVars}`);
        }
        throw error;
    }
}

/**
 * Check if we're running on the server (Node.js)
 */
function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Get application configuration
 */
export function getAppConfig(): AppConfig {
    return validateFrontendEnv();
}

/**
 * Get server configuration (server-side only)
 */
export function getServerConfig(): ServerConfig {
    if (!isServer()) {
        throw new Error('Server configuration is only available on the server side');
    }
    return validateServerEnv();
}

/**
 * Validate environment variables and return warnings for missing optional ones
 */
export function validateEnvironment(): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    try {
        validateFrontendEnv();

        // Check for server-side variables if on server
        if (isServer()) {
            try {
                validateServerEnv();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const missingRequired = error.issues.filter(err => !err.message.includes('optional')).map(err => err.path.join('.'));
                    if (missingRequired.length > 0) {
                        return {
                            valid: false,
                            warnings: [`Missing required server environment variables: ${missingRequired.join(', ')}`]
                        };
                    }
                }
            }
        }

        return { valid: true, warnings };
    } catch (error) {
        return {
            valid: false,
            warnings: [error instanceof Error ? error.message : 'Unknown environment validation error']
        };
    }
}

/**
 * Get configuration for build time
 */
export function getBuildConfig() {
    const config = getAppConfig();

    return {
        // Only expose safe configuration to the frontend build
        VITE_SUPABASE_URL: config.supabase.url,
        VITE_SUPABASE_ANON_KEY: config.supabase.anonKey,
        VITE_ENABLE_AI_FEATURES: config.features.ai.toString(),
        VITE_ENABLE_VOICE_INPUT: config.features.voice.toString(),
        VITE_ENABLE_RECEIPT_SCAN: config.features.receiptScan.toString(),
        VITE_DEBUG_MODE: config.development.debugMode.toString(),
        VITE_MOCK_API: config.development.mockApi.toString(),
    };
}

// Export singleton instance
let appConfig: AppConfig | null = null;

/**
 * Get cached application configuration
 */
export function getCachedAppConfig(): AppConfig {
    if (!appConfig) {
        appConfig = getAppConfig();
    }
    return appConfig;
}