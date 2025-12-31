/**
 * Security Headers and CORS Configuration
 * Implements comprehensive security headers for financial application
 */

// import type { SecurityPolicyDirective } from 'helmet';

/**
 * Security Headers Configuration
 */
export interface SecurityHeadersConfig {
    contentSecurityPolicy?: {
        directives: Record<string, string[]>;
    };
    crossOriginEmbedderPolicy?: string;
    crossOriginOpenerPolicy?: string;
    crossOriginResourcePolicy?: string;
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    referrerPolicy?: string;
    permissionsPolicy?: Record<string, string[]>;
    strictTransportSecurity?: {
        maxAge: number;
        includeSubDomains?: boolean;
        preload?: boolean;
    };
}

/**
 * CORS Configuration for API Security
 */
export interface CORSConfig {
    origin: string | string[] | boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders?: string[];
    credentials: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}

/**
 * Default Security Headers for Financial Application
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Consider removing 'unsafe-inline' in production
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'", "https://*.supabase.co", "https://api.supabase.io"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            workerSrc: ["'self'"],
            childSrc: ["'none'"],
            formAction: ["'self'"],
            baseUri: ["'self'"],
            manifestSrc: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-site',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
        'accelerometer': ['()'],
        'camera': ['()'],
        'geolocation': ['()'],
        'gyroscope': ['()'],
        'magnetometer': ['()'],
        'microphone': ['()'],
        'payment': ['self'],
        'usb': ['()'],
        'fullscreen': ['self'],
        'clipboard-read': ['()'],
        'clipboard-write': ['self'],
    },
    strictTransportSecurity: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
};

/**
 * Production Security Headers (stricter)
 */
export const PRODUCTION_SECURITY_HEADERS: SecurityHeadersConfig = {
    ...DEFAULT_SECURITY_HEADERS,
    contentSecurityPolicy: {
        directives: {
            ...DEFAULT_SECURITY_HEADERS.contentSecurityPolicy!.directives,
            scriptSrc: ["'self'"], // Remove 'unsafe-inline' in production
            styleSrc: ["'self'", "'unsafe-inline'"], // Keep for component libraries
            connectSrc: [
                "'self'",
                "https://*.supabase.co",
                "https://api.supabase.io",
                "https://gemini.googleapis.com", // For AI features
            ],
        },
    },
};

/**
 * Development Security Headers (more permissive for debugging)
 */
export const DEVELOPMENT_SECURITY_HEADERS: SecurityHeadersConfig = {
    ...DEFAULT_SECURITY_HEADERS,
    contentSecurityPolicy: {
        directives: {
            ...DEFAULT_SECURITY_HEADERS.contentSecurityPolicy!.directives,
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            connectSrc: [
                "'self'",
                "http://localhost:*",
                "https://*.supabase.co",
                "https://api.supabase.io",
                "ws://localhost:*",
                "wss://localhost:*",
            ],
        },
    },
};

/**
 * CORS Configuration for Supabase API
 */
export const SUPABASE_CORS_CONFIG: CORSConfig = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://localhost:3000',
        'https://localhost:5173',
        // Add your production domains here
        // 'https://yourdomain.com',
        // 'https://www.yourdomain.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
    ],
    exposedHeaders: [
        'Content-Range',
        'X-Content-Range',
        'ETag',
        'Last-Modified',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

/**
 * Generate security headers for Vite dev server
 */
export function getDevSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Basic security headers
    headers['X-Frame-Options'] = 'DENY';
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';

    // Content Security Policy for development
    headers['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https://*.supabase.co",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');

    // HSTS (only for HTTPS, but include for dev testing)
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    return headers;
}

/**
 * Generate security headers for production
 */
export function getProductionSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Enhanced security headers for production
    headers['X-Frame-Options'] = 'DENY';
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    headers['Permissions-Policy'] = [
        'accelerometer=()',
        'camera=()',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'payment=self',
        'usb=()',
        'fullscreen=self',
        'clipboard-read=()',
        'clipboard-write=self',
    ].join(', ');

    // Strict Content Security Policy for production
    headers['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self'", // No inline scripts in production
        "style-src 'self' 'unsafe-inline'", // Keep for CSS-in-JS libraries
        "img-src 'self' data: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co https://api.supabase.io https://gemini.googleapis.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
    ].join('; ');

    // HSTS for HTTPS
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';

    // COOP, COEP, CORP headers
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-site';

    return headers;
}

/**
 * Validate security headers configuration
 */
export function validateSecurityHeaders(headers: SecurityHeadersConfig): {
    valid: boolean;
    warnings: string[];
    errors: string[];
} {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check CSP directives
    if (!headers.contentSecurityPolicy?.directives) {
        warnings.push('Content Security Policy not configured');
    } else {
        const csp = headers.contentSecurityPolicy.directives;

        // Critical CSP checks
        if (!csp.defaultSrc) {
            errors.push('CSP defaultSrc directive is required');
        }

        if (!csp.scriptSrc) {
            errors.push('CSP scriptSrc directive is required');
        } else if (csp.scriptSrc.includes("'unsafe-inline'")) {
            warnings.push('CSP scriptSrc includes unsafe-inline. Consider removing for production');
        }

        if (!csp.objectSrc || !csp.objectSrc.includes("'none'")) {
            errors.push('CSP objectSrc should be set to "none" to prevent plugins');
        }

        if (!csp.frameSrc || !csp.frameSrc.includes("'none'")) {
            warnings.push('Consider setting frameSrc to "none" unless embedding is required');
        }
    }

    // Check HSTS
    if (!headers.strictTransportSecurity) {
        warnings.push('HSTS not configured. Recommended for HTTPS sites');
    } else if (headers.strictTransportSecurity.maxAge < 31536000) {
        warnings.push('HSTS max-age should be at least 1 year (31536000 seconds)');
    }

    // Check X-Frame-Options
    if (!headers.xFrameOptions || !['DENY', 'SAMEORIGIN'].includes(headers.xFrameOptions)) {
        errors.push('X-Frame-Options should be set to DENY or SAMEORIGIN');
    }

    // Check X-Content-Type-Options
    if (!headers.xContentTypeOptions || !headers.xContentTypeOptions.includes('nosniff')) {
        errors.push('X-Content-Type-Options should be set to nosniff');
    }

    return {
        valid: errors.length === 0,
        warnings,
        errors,
    };
}

/**
 * Security middleware for API routes
 */
export function createSecurityMiddleware() {
    return {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    fontSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://*.supabase.co"],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    baseUri: ["'self'"],
                    formAction: ["'self'"],
                },
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            xssFilter: true,
            noSniff: true,
            frameguard: { action: 'deny' },
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        },
    };
}

/**
 * CORS preflight handler
 */
export function handleCORS(
    req: { method: string; headers: Record<string, string> },
    res: { setHeader: (header: string, value: string) => void; status: (code: number) => void }
): boolean {
    if (req.method === 'OPTIONS') {
        // Set CORS headers
        const origin = req.headers.origin;

        if (typeof SUPABASE_CORS_CONFIG.origin === 'string') {
            res.setHeader('Access-Control-Allow-Origin', SUPABASE_CORS_CONFIG.origin);
        } else if (Array.isArray(SUPABASE_CORS_CONFIG.origin) && origin && SUPABASE_CORS_CONFIG.origin.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else if (SUPABASE_CORS_CONFIG.origin === true) {
            res.setHeader('Access-Control-Allow-Origin', origin || '');
        }

        res.setHeader('Access-Control-Allow-Methods', SUPABASE_CORS_CONFIG.methods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', SUPABASE_CORS_CONFIG.allowedHeaders.join(', '));
        res.setHeader('Access-Control-Allow-Credentials', SUPABASE_CORS_CONFIG.credentials.toString());

        if (SUPABASE_CORS_CONFIG.maxAge) {
            res.setHeader('Access-Control-Max-Age', SUPABASE_CORS_CONFIG.maxAge.toString());
        }

        res.status(204);
        return true;
    }
    return false;
}

/**
 * Environment-based security configuration
 */
export function getSecurityConfig() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        headers: isDevelopment ? DEVELOPMENT_SECURITY_HEADERS : PRODUCTION_SECURITY_HEADERS,
        cors: SUPABASE_CORS_CONFIG,
        isDevelopment,
        isProduction,
    };
}