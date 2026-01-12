/**
 * Secure Authentication Service
 * Enhanced authentication with security measures integrated
 */

import { createClient } from '@/lib/supabase/client';
import { SecurityUtils, type PasswordStrength } from './auth-security';
import type { User } from '@supabase/supabase-js';

export interface SecureAuthResult {
    success: boolean;
    error?: string;
    data?: {
        user?: User;
        needsEmailConfirmation?: boolean;
        passwordStrength?: PasswordStrength;
        rateLimited?: boolean;
        nextAllowedTime?: number;
    };
}

export interface SecureAuthOptions {
    ipAddress?: string;
    userAgent?: string;
    validatePassword?: boolean;
    requireStrongPassword?: boolean;
}

/**
 * Secure Authentication Service
 */
export class SecureAuthService {
    private supabase = createClient();

    private ensureClient() {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }
        return this.supabase;
    }

    /**
     * Secure sign up with password validation and rate limiting
     */
    async secureSignUp(
        email: string,
        password: string,
        metadata?: any,
        options: SecureAuthOptions = {}
    ): Promise<SecureAuthResult> {
        try {
            // Validate email format
            const emailValidation = SecurityUtils.validateEmail(email);
            if (!emailValidation.valid) {
                return { success: false, error: emailValidation.error };
            }

            // Check rate limiting for signup
            const authKey = SecurityUtils.generateAuthKey(
                email.toLowerCase(),
                'SIGNUP',
                options.ipAddress
            );

            const rateLimitCheck = await await SecurityUtils.isRateLimited(authKey, 'SIGNUP');
            if (rateLimitCheck.blocked) {
                SecurityUtils.securityLogger.logEvent({
                    type: 'rate_limited',
                    identifier: email.toLowerCase(),
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    timestamp: Date.now(),
                    success: false,
                    details: `Signup blocked due to rate limiting. Next allowed: ${new Date(rateLimitCheck.resetTime).toISOString()}`
                });

                return {
                    success: false,
                    error: `Too many signup attempts. Please try again after ${new Date(rateLimitCheck.resetTime).toLocaleString()}`,
                    data: {
                        nextAllowedTime: rateLimitCheck.resetTime,
                        rateLimited: true
                    }
                };
            }

            // Validate password if requested
            let passwordStrength: PasswordStrength | undefined;
            if (options.validatePassword !== false) {
                passwordStrength = SecurityUtils.validatePasswordStrength(password);

                if (!passwordStrength.isValid) {
                    if (options.requireStrongPassword && passwordStrength.score < 3) {
                        return {
                            success: false,
                            error: 'Password is too weak. Please choose a stronger password.',
                            data: { passwordStrength }
                        };
                    }

                    // Log weak password attempt
                    SecurityUtils.securityLogger.logEvent({
                        type: 'signup_attempt',
                        identifier: email.toLowerCase(),
                        ipAddress: options.ipAddress,
                        userAgent: options.userAgent,
                        timestamp: Date.now(),
                        success: false,
                        details: `Weak password attempted: ${passwordStrength.feedback.join(', ')}`
                    });
                }
            }

            // Ensure client is available
            const supabase = this.ensureClient();

            // Attempt signup
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        ...metadata,
                        signup_ip: options.ipAddress,
                        signup_user_agent: options.userAgent,
                        password_strength_score: passwordStrength?.score || 0,
                        password_strength_feedback: passwordStrength?.feedback.join('; ') || ''
                    }
                }
            });

            if (error) {
                // Log failed signup attempt
                SecurityUtils.securityLogger.logEvent({
                    type: 'signup_attempt',
                    identifier: email.toLowerCase(),
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    timestamp: Date.now(),
                    success: false,
                    details: `Signup failed: ${error.message}`
                });

                return { success: false, error: error.message };
            }

            // Log successful signup
            SecurityUtils.securityLogger.logEvent({
                type: 'signup_attempt',
                identifier: email.toLowerCase(),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                timestamp: Date.now(),
                success: true,
                details: 'Account created successfully'
            });

            return {
                success: true,
                data: {
                    user: data.user || undefined,
                    needsEmailConfirmation: !data.session,
                    passwordStrength
                }
            };

        } catch (error) {
            SecurityUtils.securityLogger.logEvent({
                type: 'signup_attempt',
                identifier: email.toLowerCase(),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                timestamp: Date.now(),
                success: false,
                details: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });

            return { success: false, error: 'An unexpected error occurred during signup' };
        }
    }

    /**
     * Secure sign in with rate limiting and security logging
     */
    async secureSignIn(
        email: string,
        password: string,
        options: SecureAuthOptions = {}
    ): Promise<SecureAuthResult> {
        try {
            // Validate email format
            const emailValidation = SecurityUtils.validateEmail(email);
            if (!emailValidation.valid) {
                return { success: false, error: emailValidation.error };
            }

            // Check rate limiting for login
            const authKey = SecurityUtils.generateAuthKey(
                email.toLowerCase(),
                'LOGIN',
                options.ipAddress
            );

            const rateLimitCheck = await await SecurityUtils.isRateLimited(authKey, 'LOGIN');
            if (rateLimitCheck.blocked) {
                SecurityUtils.securityLogger.logEvent({
                    type: 'rate_limited',
                    identifier: email.toLowerCase(),
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    timestamp: Date.now(),
                    success: false,
                    details: `Login blocked due to rate limiting. Next allowed: ${new Date(rateLimitCheck.resetTime).toISOString()}`
                });

                return {
                    success: false,
                    error: `Account temporarily locked due to too many failed attempts. Please try again after ${new Date(rateLimitCheck.resetTime).toLocaleString()}`,
                    data: {
                        nextAllowedTime: rateLimitCheck.resetTime,
                        rateLimited: true
                    }
                };
            }

            // Ensure client is available
            const supabase = this.ensureClient();

            // Attempt sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Record failed attempt for rate limiting
                const failedAttempt = await SecurityUtils.recordFailedAttempt(authKey, 'LOGIN');

                // Log failed login attempt
                SecurityUtils.securityLogger.logEvent({
                    type: 'login_attempt',
                    identifier: email.toLowerCase(),
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    timestamp: Date.now(),
                    success: false,
                    details: `Login failed: ${error.message}. Attempts remaining: ${failedAttempt.remaining}`
                });

                if (failedAttempt.blocked) {
                    SecurityUtils.securityLogger.logEvent({
                        type: 'account_locked',
                        identifier: email.toLowerCase(),
                        ipAddress: options.ipAddress,
                        userAgent: options.userAgent,
                        timestamp: Date.now(),
                        success: false,
                        details: `Account locked due to excessive failed attempts. Lock expires: ${new Date(failedAttempt.nextAllowedTime!).toISOString()}`
                    });

                    return {
                        success: false,
                        error: `Account locked due to too many failed attempts. Please try again after ${new Date(failedAttempt.nextAllowedTime!).toLocaleString()}`,
                        data: {
                            nextAllowedTime: failedAttempt.nextAllowedTime,
                            rateLimited: true
                        }
                    };
                }

                return {
                    success: false,
                    error: `Invalid credentials. ${failedAttempt.remaining} attempts remaining before account lock.`,
                    data: {
                        rateLimited: false,
                        nextAllowedTime: failedAttempt.resetTime
                    }
                };
            }

            // Successful login - reset rate limiting
            SecurityUtils.resetRateLimit(authKey, 'LOGIN');

            // Log successful login
            SecurityUtils.securityLogger.logEvent({
                type: 'login_attempt',
                identifier: email.toLowerCase(),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                timestamp: Date.now(),
                success: true,
                details: 'Login successful'
            });

            return {
                success: true,
                data: {
                    user: data.user || undefined
                }
            };

        } catch (error) {
            SecurityUtils.securityLogger.logEvent({
                type: 'login_attempt',
                identifier: email.toLowerCase(),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                timestamp: Date.now(),
                success: false,
                details: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });

            return { success: false, error: 'An unexpected error occurred during sign in' };
        }
    }

    /**
     * Secure password reset with rate limiting
     */
    async securePasswordReset(
        email: string,
        options: SecureAuthOptions = {}
    ): Promise<SecureAuthResult> {
        try {
            // Validate email format
            const emailValidation = SecurityUtils.validateEmail(email);
            if (!emailValidation.valid) {
                return { success: false, error: emailValidation.error };
            }

            // Check rate limiting for password reset
            const authKey = SecurityUtils.generateAuthKey(
                email.toLowerCase(),
                'PASSWORD_RESET',
                options.ipAddress
            );

            const rateLimitCheck = await SecurityUtils.isRateLimited(authKey, 'PASSWORD_RESET');
            if (rateLimitCheck.blocked) {
                return {
                    success: false,
                    error: `Too many password reset attempts. Please try again after ${new Date(rateLimitCheck.resetTime).toLocaleString()}`,
                    data: {
                        nextAllowedTime: rateLimitCheck.resetTime,
                        rateLimited: true
                    }
                };
            }

            // Ensure client is available
            const supabase = this.ensureClient();

            // Attempt password reset
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            });

            if (error) {
                // Record failed attempt
                await SecurityUtils.recordFailedAttempt(authKey, 'PASSWORD_RESET');

                // Log failed password reset attempt
                SecurityUtils.securityLogger.logEvent({
                    type: 'password_reset',
                    identifier: email.toLowerCase(),
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    timestamp: Date.now(),
                    success: false,
                    details: `Password reset failed: ${error.message}`
                });

                return { success: false, error: error.message };
            }

            // Log successful password reset request
            SecurityUtils.securityLogger.logEvent({
                type: 'password_reset',
                identifier: email.toLowerCase(),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                timestamp: Date.now(),
                success: true,
                details: 'Password reset email sent'
            });

            return { success: true };

        } catch (error) {
            SecurityUtils.securityLogger.logEvent({
                type: 'password_reset',
                identifier: email.toLowerCase(),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                timestamp: Date.now(),
                success: false,
                details: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });

            return { success: false, error: 'An unexpected error occurred during password reset' };
        }
    }

    /**
     * Get client IP address (simplified for frontend)
     */
    getClientInfo(): { ipAddress?: string; userAgent?: string } {
        // In a real implementation, this would be handled by the backend
        // For now, we'll use a placeholder and rely on server-side IP detection
        return {
            userAgent: navigator.userAgent
            // IP address would be provided by the server in production
        };
    }

    /**
     * Check current rate limit status for an email
     */
    async getRateLimitStatus(
        email: string,
        operation: 'LOGIN' | 'SIGNUP' | 'PASSWORD_RESET',
        ipAddress?: string
    ) {
        const authKey = SecurityUtils.generateAuthKey(
            email.toLowerCase(),
            operation,
            ipAddress
        );

        return await SecurityUtils.isRateLimited(authKey, operation);
    }

    /**
     * Get security events for monitoring
     */
    getSecurityEvents(filter?: {
        type?: string;
        identifier?: string;
        since?: number;
    }) {
        return SecurityUtils.securityLogger.getEvents(filter);
    }
}

// Export singleton instance
export const secureAuthService = new SecureAuthService();