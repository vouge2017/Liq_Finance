/**
 * Authentication Security Utilities
 * Implements password validation, rate limiting, and security measures
 */

import { z } from 'zod';

// Password strength requirements
export interface PasswordStrength {
    score: number; // 0-4 (weak to very strong)
    feedback: string[];
    isValid: boolean;
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
        noCommonPatterns: boolean;
    };
}

// Rate limiting configuration
export interface RateLimitConfig {
    windowMs: number;
    maxAttempts: number;
    blockDuration: number;
}

// Authentication security configuration
export interface AuthSecurityConfig {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecial: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    sessionTimeout: number; // in minutes
}

/**
 * Default security configuration
 */
export const DEFAULT_AUTH_SECURITY: AuthSecurityConfig = {
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    sessionTimeout: 30, // 30 minutes
};

/**
 * Common weak passwords and patterns to avoid
 */
const COMMON_PASSWORDS = [
    'password', '123456', 'password123', 'admin', 'root', 'user',
    'welcome', 'login', 'test', 'guest', 'qwerty', 'abc123',
    '111111', '123123', 'password1', 'admin123', 'root123'
];

const WEAK_PATTERNS = [
    /^(.)\1{4,}$/, // Repeated single character
    /^(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl)/i, // Sequential letters
    /\d{4,}/, // Long sequences of numbers
    /^[a-z]{5,}$/i, // Only letters
];

/**
 * Validate password strength and requirements
 */
export function validatePasswordStrength(
    password: string,
    config: AuthSecurityConfig = DEFAULT_AUTH_SECURITY
): PasswordStrength {
    const feedback: string[] = [];
    const requirements = {
        minLength: password.length >= config.passwordMinLength,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        noCommonPatterns: !COMMON_PASSWORDS.includes(password.toLowerCase()) &&
            !WEAK_PATTERNS.some(pattern => pattern.test(password))
    };

    // Check minimum length
    if (!requirements.minLength) {
        feedback.push(`Password must be at least ${config.passwordMinLength} characters long`);
    }

    // Check character requirements
    if (config.passwordRequireUppercase && !requirements.hasUppercase) {
        feedback.push('Password must contain at least one uppercase letter');
    }

    if (config.passwordRequireLowercase && !requirements.hasLowercase) {
        feedback.push('Password must contain at least one lowercase letter');
    }

    if (config.passwordRequireNumbers && !requirements.hasNumber) {
        feedback.push('Password must contain at least one number');
    }

    if (config.passwordRequireSpecial && !requirements.hasSpecial) {
        feedback.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (!requirements.noCommonPatterns) {
        feedback.push('Password contains common patterns and should be more unique');
    }

    // Calculate strength score
    let score = 0;
    if (requirements.minLength) score++;
    if (requirements.hasUppercase) score++;
    if (requirements.hasLowercase) score++;
    if (requirements.hasNumber) score++;
    if (requirements.hasSpecial) score++;
    if (requirements.noCommonPatterns) score++;

    // Bonus points for longer passwords
    if (password.length >= 16) score++;
    if (password.length >= 20) score++;

    const isValid = requirements.minLength &&
        (config.passwordRequireUppercase ? requirements.hasUppercase : true) &&
        (config.passwordRequireLowercase ? requirements.hasLowercase : true) &&
        (config.passwordRequireNumbers ? requirements.hasNumber : true) &&
        (config.passwordRequireSpecial ? requirements.hasSpecial : true) &&
        requirements.noCommonPatterns;

    return {
        score: Math.min(score, 4),
        feedback,
        isValid,
        requirements
    };
}

/**
 * Rate limiting storage interface
 */
export interface RateLimitStore {
    getAttempts(key: string): Promise<number>;
    setAttempts(key: string, attempts: number, expiry: number): Promise<void>;
    incrementAttempts(key: string, windowMs: number): Promise<number>;
    isBlocked(key: string): Promise<boolean>;
    getBlockExpiry(key: string): Promise<number | null>;
}

/**
 * In-memory rate limiting store (fallback for when Redis is unavailable)
 */
class InMemoryRateLimitStore implements RateLimitStore {
    private store = new Map<string, { attempts: number; expiry: number }>();

    async getAttempts(key: string): Promise<number> {
        const entry = this.store.get(key);
        const now = Date.now();

        if (!entry || entry.expiry < now) {
            this.store.delete(key);
            return 0;
        }

        return entry.attempts;
    }

    async setAttempts(key: string, attempts: number, expiry: number): Promise<void> {
        this.store.set(key, { attempts, expiry });
    }

    async incrementAttempts(key: string, windowMs: number): Promise<number> {
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || entry.expiry < now) {
            // Reset or create new entry
            this.setAttempts(key, 1, now + windowMs);
            return 1;
        }

        // Increment existing attempts
        const newAttempts = entry.attempts + 1;
        this.setAttempts(key, newAttempts, entry.expiry);
        return newAttempts;
    }

    async isBlocked(key: string): Promise<boolean> {
        const entry = this.store.get(key);
        const now = Date.now();

        if (!entry) return false;

        if (entry.expiry < now) {
            this.store.delete(key);
            return false;
        }

        return true;
    }

    async getBlockExpiry(key: string): Promise<number | null> {
        const entry = this.store.get(key);
        const now = Date.now();

        if (!entry || entry.expiry < now) {
            return null;
        }

        return entry.expiry;
    }
}

/**
 * Hybrid rate limiting store that uses Redis when available, falls back to in-memory
 */
class HybridRateLimitStore implements RateLimitStore {
    private inMemoryStore = new InMemoryRateLimitStore();
    private redisStore: any = null; // Will be imported dynamically to avoid SSR issues
    private redisInitialized = false;
    private redisHealthChecked = false;
    private redisHealthy = false;

    async initializeRedis(): Promise<void> {
        if (this.redisInitialized) return;

        try {
            // Dynamic import to avoid SSR issues
            const { redisRateLimitStore } = await import('./redis-rate-limit-store');
            this.redisStore = redisRateLimitStore;
            this.redisInitialized = true;

            // Check Redis health
            const { redisService } = await import('./redis-service');
            this.redisHealthy = await redisService.healthCheck();
            this.redisHealthChecked = true;

            console.log('Redis rate limiting initialized successfully');
        } catch (error) {
            console.warn('Redis rate limiting not available, using in-memory fallback:', error);
            this.redisInitialized = true;
            this.redisHealthy = false;
        }
    }

    async getAttempts(key: string): Promise<number> {
        await this.initializeRedis();

        if (this.redisHealthy && this.redisStore) {
            try {
                return await this.redisStore.getAttempts(key);
            } catch (error) {
                console.warn('Redis getAttempts failed, falling back to in-memory:', error);
                this.redisHealthy = false;
            }
        }

        return await this.inMemoryStore.getAttempts(key);
    }

    async setAttempts(key: string, attempts: number, expiry: number): Promise<void> {
        await this.initializeRedis();

        const promises: Promise<void>[] = [];

        // Always update in-memory store
        promises.push(this.inMemoryStore.setAttempts(key, attempts, expiry));

        // Update Redis if available
        if (this.redisHealthy && this.redisStore) {
            try {
                promises.push(this.redisStore.setAttempts(key, attempts, expiry));
            } catch (error) {
                console.warn('Redis setAttempts failed:', error);
                this.redisHealthy = false;
            }
        }

        await Promise.allSettled(promises);
    }

    async incrementAttempts(key: string, windowMs: number): Promise<number> {
        await this.initializeRedis();

        if (this.redisHealthy && this.redisStore) {
            try {
                const result = await this.redisStore.incrementAttempts(key, windowMs);
                // Also update in-memory for consistency
                await this.inMemoryStore.setAttempts(key, result, Date.now() + windowMs);
                return result;
            } catch (error) {
                console.warn('Redis incrementAttempts failed, falling back to in-memory:', error);
                this.redisHealthy = false;
            }
        }

        return await this.inMemoryStore.incrementAttempts(key, windowMs);
    }

    async isBlocked(key: string): Promise<boolean> {
        await this.initializeRedis();

        if (this.redisHealthy && this.redisStore) {
            try {
                return await this.redisStore.isBlocked(key);
            } catch (error) {
                console.warn('Redis isBlocked failed, falling back to in-memory:', error);
                this.redisHealthy = false;
            }
        }

        return await this.inMemoryStore.isBlocked(key);
    }

    async getBlockExpiry(key: string): Promise<number | null> {
        await this.initializeRedis();

        if (this.redisHealthy && this.redisStore) {
            try {
                return await this.redisStore.getBlockExpiry(key);
            } catch (error) {
                console.warn('Redis getBlockExpiry failed, falling back to in-memory:', error);
                this.redisHealthy = false;
            }
        }

        return await this.inMemoryStore.getBlockExpiry(key);
    }

    /**
     * Get store health status
     */
    async getHealthStatus(): Promise<{ redisHealthy: boolean; redisInitialized: boolean }> {
        await this.initializeRedis();
        return {
            redisHealthy: this.redisHealthy,
            redisInitialized: this.redisInitialized
        };
    }

    /**
     * Force Redis reconnection
     */
    async reconnectRedis(): Promise<void> {
        try {
            const { redisService } = await import('./redis-service');
            await redisService.reconnect();
            this.redisHealthy = await redisService.healthCheck();
            this.redisHealthChecked = true;
        } catch (error) {
            console.warn('Redis reconnection failed:', error);
            this.redisHealthy = false;
        }
    }
}

// Singleton store instance
const rateLimitStore = new HybridRateLimitStore();

/**
 * Rate limiting configuration for different operations
 */
export const RATE_LIMITS = {
    LOGIN: { windowMs: 15 * 60 * 1000, maxAttempts: 5 }, // 15 minutes, 5 attempts
    SIGNUP: { windowMs: 60 * 60 * 1000, maxAttempts: 3 }, // 1 hour, 3 attempts
    PASSWORD_RESET: { windowMs: 60 * 60 * 1000, maxAttempts: 3 }, // 1 hour, 3 attempts
    API_GENERAL: { windowMs: 15 * 60 * 1000, maxAttempts: 100 }, // 15 minutes, 100 requests
} as const;

/**
 * Check if an operation is rate limited
 */
export async function isRateLimited(
    key: string,
    operation: keyof typeof RATE_LIMITS
): Promise<{ blocked: boolean; remaining: number; resetTime: number }> {
    const config = RATE_LIMITS[operation];
    const attempts = await rateLimitStore.getAttempts(key);
    const isBlocked = await rateLimitStore.isBlocked(key);
    const blockExpiry = await rateLimitStore.getBlockExpiry(key);

    const remaining = Math.max(0, config.maxAttempts - attempts);
    const resetTime = blockExpiry || Date.now() + config.windowMs;

    return {
        blocked: isBlocked,
        remaining,
        resetTime
    };
}

/**
 * Record a failed authentication attempt
 */
export async function recordFailedAttempt(
    key: string,
    operation: keyof typeof RATE_LIMITS
): Promise<{ blocked: boolean; remaining: number; resetTime: number; nextAllowedTime?: number }> {
    const config = RATE_LIMITS[operation];
    const attempts = await rateLimitStore.incrementAttempts(key, config.windowMs);
    const remaining = Math.max(0, config.maxAttempts - attempts);

    // Check if user should be blocked
    if (attempts >= config.maxAttempts) {
        const blockExpiry = await rateLimitStore.getBlockExpiry(key);
        if (blockExpiry) {
            return {
                blocked: true,
                remaining: 0,
                resetTime: blockExpiry,
                nextAllowedTime: blockExpiry
            };
        }
    }

    return {
        blocked: false,
        remaining,
        resetTime: Date.now() + config.windowMs
    };
}

/**
 * Reset rate limiting (after successful authentication)
 */
export async function resetRateLimit(key: string, operation: keyof typeof RATE_LIMITS): Promise<void> {
    const config = RATE_LIMITS[operation];
    await rateLimitStore.setAttempts(key, 0, Date.now() + config.windowMs);
}

/**
 * Generate secure authentication key for rate limiting
 */
export function generateAuthKey(
    identifier: string,
    operation: string,
    ipAddress?: string
): string {
    const base = `${identifier}:${operation}`;
    return ipAddress ? `${base}:${ipAddress}` : base;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    const emailSchema = z.string().email('Invalid email format');

    try {
        emailSchema.parse(email);
        return { valid: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { valid: false, error: error.issues[0].message };
        }
        return { valid: false, error: 'Invalid email format' };
    }
}

/**
 * Security event logging
 */
export interface SecurityEvent {
    type: 'login_attempt' | 'signup_attempt' | 'password_reset' | 'account_locked' | 'rate_limited';
    identifier: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: number;
    success: boolean;
    details?: string;
}

class SecurityLogger {
    private events: SecurityEvent[] = [];

    logEvent(event: SecurityEvent): void {
        this.events.push(event);

        // Keep only last 1000 events to prevent memory issues
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }

        // In production, send to monitoring service
        console.log('Security Event:', event);
    }

    getEvents(filter?: { type?: string; identifier?: string; since?: number }): SecurityEvent[] {
        let filtered = this.events;

        if (filter?.type) {
            filtered = filtered.filter(e => e.type === filter.type);
        }

        if (filter?.identifier) {
            filtered = filtered.filter(e => e.identifier === filter.identifier);
        }

        if (filter?.since) {
            filtered = filtered.filter(e => e.timestamp >= filter.since!);
        }

        return filtered;
    }
}

export const securityLogger = new SecurityLogger();

/**
 * Security validation utilities
 */
export const SecurityUtils = {
    validatePasswordStrength,
    isRateLimited,
    recordFailedAttempt,
    resetRateLimit,
    generateAuthKey,
    validateEmail,
    securityLogger,
    // Redis management functions
    getRateLimitHealth: () => rateLimitStore.getHealthStatus(),
    reconnectRateLimitRedis: () => rateLimitStore.reconnectRedis(),
};