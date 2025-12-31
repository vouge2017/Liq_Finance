/**
 * Authentication Security Service Tests
 * Tests for password validation, rate limiting, and security event logging
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    validatePasswordStrength,
    isRateLimited,
    recordFailedAttempt,
    resetRateLimit,
    generateAuthKey,
    validateEmail,
    securityLogger,
    DEFAULT_AUTH_SECURITY,
    RATE_LIMITS,
} from '../auth-security';

describe('Auth Security Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ============= PASSWORD VALIDATION TESTS =============

    describe('validatePasswordStrength', () => {
        describe('password length validation', () => {
            it('should reject passwords shorter than minimum length', () => {
                const result = validatePasswordStrength('Short1!');
                expect(result.isValid).toBe(false);
                expect(result.requirements.minLength).toBe(false);
                expect(result.feedback).toContain('Password must be at least 12 characters long');
            });

            it('should accept passwords at minimum length', () => {
                const result = validatePasswordStrength('ValidPass123!');
                expect(result.isValid).toBe(true);
                expect(result.requirements.minLength).toBe(true);
            });

            it('should accept long passwords', () => {
                const result = validatePasswordStrength('ThisIsAVeryLongPassword123!');
                expect(result.isValid).toBe(true);
                expect(result.score).toBeGreaterThanOrEqual(3);
            });

            it('should award bonus points for passwords >= 16 characters', () => {
                const shortResult = validatePasswordStrength('ValidPass123!');
                const longResult = validatePasswordStrength('VeryLongPassword123!!');
                expect(longResult.score).toBeGreaterThan(shortResult.score);
            });

            it('should award bonus points for passwords >= 20 characters', () => {
                const mediumResult = validatePasswordStrength('LongPassword12345678!');
                const veryLongResult = validatePasswordStrength('VeryLongPassword1234567890!!');
                expect(veryLongResult.score).toBeGreaterThan(mediumResult.score);
            });
        });

        describe('uppercase letter validation', () => {
            it('should reject passwords without uppercase letters', () => {
                const result = validatePasswordStrength('lowercase123!');
                expect(result.isValid).toBe(false);
                expect(result.requirements.hasUppercase).toBe(false);
                expect(result.feedback).toContain('Password must contain at least one uppercase letter');
            });

            it('should accept passwords with uppercase letters', () => {
                const result = validatePasswordStrength('ValidPassword123!');
                expect(result.requirements.hasUppercase).toBe(true);
            });
        });

        describe('lowercase letter validation', () => {
            it('should reject passwords without lowercase letters', () => {
                const result = validatePasswordStrength('UPPERCASE123!');
                expect(result.isValid).toBe(false);
                expect(result.requirements.hasLowercase).toBe(false);
                expect(result.feedback).toContain('Password must contain at least one lowercase letter');
            });

            it('should accept passwords with lowercase letters', () => {
                const result = validatePasswordStrength('ValidPassword123!');
                expect(result.requirements.hasLowercase).toBe(true);
            });
        });

        describe('number validation', () => {
            it('should reject passwords without numbers', () => {
                const result = validatePasswordStrength('ValidPassword!');
                expect(result.isValid).toBe(false);
                expect(result.requirements.hasNumber).toBe(false);
                expect(result.feedback).toContain('Password must contain at least one number');
            });

            it('should accept passwords with numbers', () => {
                const result = validatePasswordStrength('ValidPassword123!');
                expect(result.requirements.hasNumber).toBe(true);
            });
        });

        describe('special character validation', () => {
            it('should reject passwords without special characters', () => {
                const result = validatePasswordStrength('ValidPassword123');
                expect(result.isValid).toBe(false);
                expect(result.requirements.hasSpecial).toBe(false);
                expect(result.feedback).toContain('Password must contain at least one special character');
            });

            it('should accept passwords with special characters', () => {
                const result = validatePasswordStrength('ValidPassword123!');
                expect(result.requirements.hasSpecial).toBe(true);
            });

            it('should accept various special characters', () => {
                const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
                for (const char of specialChars) {
                    const result = validatePasswordStrength(`ValidPassword123${char}`);
                    expect(result.requirements.hasSpecial).toBe(true);
                }
            });
        });

        describe('common password detection', () => {
            it('should reject common passwords', () => {
                const commonPasswords = ['password', '123123', 'admin456', 'password', 'root'];
                for (const password of commonPasswords) {
                    const result = validatePasswordStrength(password);
                    expect(result.requirements.noCommonPatterns).toBe(false);
                    expect(result.feedback).toContain('Password contains common patterns and should be more unique');
                }
            });

            it('should reject passwords containing common patterns', () => {
                const result = validatePasswordStrength('pass12345678');
                expect(result.requirements.noCommonPatterns).toBe(false);
            });
        });

        describe('weak pattern detection', () => {
            it('should reject passwords with repeated characters', () => {
                const result = validatePasswordStrength('Aaaaaaa1111!');
                expect(result.requirements.noCommonPatterns).toBe(false);
            });

            it('should reject passwords with sequential numbers', () => {
                const result = validatePasswordStrength('ValidPassword123!');
                // 123 is a sequential pattern
                expect(result.requirements.noCommonPatterns).toBe(false);
            });

            it('should reject passwords with sequential letters', () => {
                const result = validatePasswordStrength('Abcdefg123!');
                // abc is a sequential pattern
                expect(result.requirements.noCommonPatterns).toBe(false);
            });

            it('should reject passwords with only letters', () => {
                const result = validatePasswordStrength('AllLettersOnly');
                expect(result.requirements.noCommonPatterns).toBe(false);
            });
        });

        describe('password strength scoring', () => {
            it('should return score of 0 for very weak passwords', () => {
                const result = validatePasswordStrength('123');
                expect(result.score).toBe(0);
            });

            it('should return score of 1-2 for weak passwords', () => {
                const result = validatePasswordStrength('password123');
                expect(result.score).toBeLessThanOrEqual(2);
            });

            it('should return score of 3 for medium strength passwords', () => {
                const result = validatePasswordStrength('ValidPassword');
                expect(result.score).toBe(3);
            });

            it('should return maximum score of 4 for strong passwords', () => {
                const result = validatePasswordStrength('StrongP@ssw0rd!');
                expect(result.score).toBe(4);
            });
        });

        describe('custom configuration', () => {
            it('should use custom minimum length when provided', () => {
                const customConfig = { ...DEFAULT_AUTH_SECURITY, passwordMinLength: 8 };
                const result = validatePasswordStrength('Short1!', customConfig);
                expect(result.isValid).toBe(true);
            });

            it('should skip uppercase requirement when disabled', () => {
                const customConfig = { ...DEFAULT_AUTH_SECURITY, passwordRequireUppercase: false };
                const result = validatePasswordStrength('lowercase123!', customConfig);
                expect(result.isValid).toBe(true);
            });

            it('should skip number requirement when disabled', () => {
                const customConfig = { ...DEFAULT_AUTH_SECURITY, passwordRequireNumbers: false };
                const result = validatePasswordStrength('ValidPassword!', customConfig);
                expect(result.isValid).toBe(true);
            });

            it('should skip special character requirement when disabled', () => {
                const customConfig = { ...DEFAULT_AUTH_SECURITY, passwordRequireSpecial: false };
                const result = validatePasswordStrength('ValidPassword123', customConfig);
                expect(result.isValid).toBe(true);
            });
        });

        describe('empty and null inputs', () => {
            it('should handle empty string', () => {
                const result = validatePasswordStrength('');
                expect(result.isValid).toBe(false);
                expect(result.score).toBe(0);
                expect(result.feedback.length).toBeGreaterThan(0);
            });

            it('should handle null/undefined-like input as string', () => {
                const result = validatePasswordStrength('null');
                expect(result.isValid).toBe(false);
            });
        });
    });

    // ============= RATE LIMITING TESTS =============

    describe('isRateLimited', () => {
        it('should return not blocked for first attempt', () => {
            const result = isRateLimited('test-user', 'LOGIN');
            expect(result.blocked).toBe(false);
            expect(result.remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts);
        });

        it('should return remaining attempts count', () => {
            const result = isRateLimited('test-user', 'LOGIN');
            expect(result.remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts);
        });

        it('should return correct reset time', () => {
            const result = isRateLimited('test-user', 'LOGIN');
            expect(result.resetTime).toBeGreaterThan(Date.now());
        });
    });

    describe('recordFailedAttempt', () => {
        it('should increment failed attempts', () => {
            const key = 'test-user-fail';
            const result1 = recordFailedAttempt(key, 'LOGIN');
            const result2 = recordFailedAttempt(key, 'LOGIN');

            expect(result2.remaining).toBe(result1.remaining - 1);
            expect(result2.remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts - 2);
        });

        it('should block user after max attempts', () => {
            const key = 'test-user-block';

            for (let i = 0; i < RATE_LIMITS.LOGIN.maxAttempts; i++) {
                recordFailedAttempt(key, 'LOGIN');
            }

            const result = recordFailedAttempt(key, 'LOGIN');
            expect(result.blocked).toBe(true);
            expect(result.remaining).toBe(0);
            expect(result.nextAllowedTime).toBeDefined();
        });

        it('should return blocked status when limit exceeded', () => {
            const key = 'test-user-exceed';

            // Exceed the limit
            for (let i = 0; i <= RATE_LIMITS.LOGIN.maxAttempts; i++) {
                recordFailedAttempt(key, 'LOGIN');
            }

            const result = isRateLimited(key, 'LOGIN');
            expect(result.blocked).toBe(true);
        });

        it('should have different limits for different operations', () => {
            const loginKey = 'test-login';
            const signupKey = 'test-signup';

            expect(RATE_LIMITS.LOGIN.maxAttempts).not.toBe(RATE_LIMITS.SIGNUP.maxAttempts);
            expect(RATE_LIMITS.LOGIN.windowMs).not.toBe(RATE_LIMITS.SIGNUP.windowMs);
        });

        it('should track remaining attempts correctly', () => {
            const key = 'test-user-track';
            const initial = isRateLimited(key, 'LOGIN');

            recordFailedAttempt(key, 'LOGIN');
            const afterOne = isRateLimited(key, 'LOGIN');

            expect(afterOne.remaining).toBe(initial.remaining - 1);
        });
    });

    describe('resetRateLimit', () => {
        it('should reset attempts after successful authentication', () => {
            const key = 'test-user-reset';

            // Make some failed attempts
            recordFailedAttempt(key, 'LOGIN');
            recordFailedAttempt(key, 'LOGIN');

            // Reset rate limit
            resetRateLimit(key, 'LOGIN');

            const result = isRateLimited(key, 'LOGIN');
            expect(result.remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts);
            expect(result.blocked).toBe(false);
        });

        it('should allow new attempts after reset', () => {
            const key = 'test-user-new';

            // Exhaust attempts
            for (let i = 0; i < RATE_LIMITS.LOGIN.maxAttempts; i++) {
                recordFailedAttempt(key, 'LOGIN');
            }

            expect(isRateLimited(key, 'LOGIN').blocked).toBe(true);

            // Reset
            resetRateLimit(key, 'LOGIN');

            const result = isRateLimited(key, 'LOGIN');
            expect(result.blocked).toBe(false);
            expect(result.remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts);
        });
    });

    describe('generateAuthKey', () => {
        it('should generate key with identifier and operation', () => {
            const key = generateAuthKey('user123', 'login');
            expect(key).toBe('user123:login');
        });

        it('should include IP address when provided', () => {
            const key = generateAuthKey('user123', 'login', '192.168.1.1');
            expect(key).toBe('user123:login:192.168.1.1');
        });

        it('should handle special characters in identifier', () => {
            const key = generateAuthKey('user@example.com', 'login');
            expect(key).toBe('user@example.com:login');
        });

        it('should handle long identifiers', () => {
            const longId = 'a'.repeat(100);
            const key = generateAuthKey(longId, 'login');
            expect(key.startsWith(longId)).toBe(true);
        });
    });

    // ============= EMAIL VALIDATION TESTS =============

    describe('validateEmail', () => {
        it('should accept valid email addresses', () => {
            const validEmails = [
                'user@example.com',
                'user.name@example.com',
                'user+tag@example.com',
                'user@subdomain.example.com',
                'user123@example.co.uk',
            ];

            for (const email of validEmails) {
                const result = validateEmail(email);
                expect(result.valid).toBe(true);
                expect(result.error).toBeUndefined();
            }
        });

        it('should reject invalid email addresses', () => {
            const invalidEmails = [
                'invalid',
                'invalid@',
                '@example.com',
                'user@.com',
                'user@example',
                'user name@example.com',
                'user@exam ple.com',
            ];

            for (const email of invalidEmails) {
                const result = validateEmail(email);
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            }
        });

        it('should return error message for invalid emails', () => {
            const result = validateEmail('invalid');
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
        });

        it('should handle edge cases', () => {
            const result = validateEmail('');
            expect(result.valid).toBe(false);
        });
    });

    // ============= SECURITY EVENT LOGGING TESTS =============

    describe('securityLogger', () => {
        // Note: We test through the public API since events is private

        it('should log security events', () => {
            const event = {
                type: 'login_attempt' as const,
                identifier: 'user123',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
                timestamp: Date.now(),
                success: true,
            };

            securityLogger.logEvent(event);

            const events = securityLogger.getEvents();
            expect(events.length).toBeGreaterThanOrEqual(1);
            const found = events.find(e => e.identifier === 'user123');
            expect(found).toBeDefined();
        });

        it('should return empty array for non-existent events', () => {
            const events = securityLogger.getEvents({ type: 'nonexistent_type' });
            expect(Array.isArray(events)).toBe(true);
        });

        it('should filter events by type when events exist', () => {
            securityLogger.logEvent({
                type: 'login_attempt',
                identifier: 'user123',
                timestamp: Date.now(),
                success: true,
            });

            securityLogger.logEvent({
                type: 'signup_attempt',
                identifier: 'user123',
                timestamp: Date.now(),
                success: true,
            });

            const loginEvents = securityLogger.getEvents({ type: 'login_attempt' });
            expect(loginEvents.length).toBeGreaterThanOrEqual(1);
            const allLogin = loginEvents.every(e => e.type === 'login_attempt');
            expect(allLogin).toBe(true);
        });

        it('should filter events by identifier', () => {
            securityLogger.logEvent({
                type: 'login_attempt',
                identifier: 'user123',
                timestamp: Date.now(),
                success: true,
            });

            securityLogger.logEvent({
                type: 'login_attempt',
                identifier: 'user456',
                timestamp: Date.now(),
                success: true,
            });

            const user123Events = securityLogger.getEvents({ identifier: 'user123' });
            expect(user123Events.length).toBeGreaterThanOrEqual(1);
            const allUser123 = user123Events.every(e => e.identifier === 'user123');
            expect(allUser123).toBe(true);
        });

        it('should handle various event types', () => {
            const eventTypes: Array<'login_attempt' | 'signup_attempt' | 'password_reset' | 'account_locked' | 'rate_limited'> = [
                'login_attempt',
                'signup_attempt',
                'password_reset',
                'account_locked',
                'rate_limited',
            ];

            for (const type of eventTypes) {
                securityLogger.logEvent({
                    type,
                    identifier: 'user123',
                    timestamp: Date.now(),
                    success: true,
                });
            }

            const events = securityLogger.getEvents();
            expect(events.length).toBeGreaterThanOrEqual(5);
        });
    });

    // ============= EDGE CASES AND ERROR SCENARIOS =============

    describe('Edge Cases', () => {
        describe('Password Validation Edge Cases', () => {
            it('should handle special characters in passwords', () => {
                const result = validatePasswordStrength('P@ss#rd123!');
                expect(result.isValid).toBe(true);
            });

            it('should handle very long passwords', () => {
                const longPassword = 'A'.repeat(100) + '1a!';
                const result = validatePasswordStrength(longPassword);
                expect(result.isValid).toBe(true);
                expect(result.score).toBe(4);
            });

            it('should handle passwords with only special characters', () => {
                const result = validatePasswordStrength('!@#$%^&*()');
                expect(result.isValid).toBe(false);
            });

            it('should handle whitespace in passwords', () => {
                const result = validatePasswordStrength('Valid Pass 123!');
                expect(result.isValid).toBe(true);
            });

            it('should handle leading/trailing whitespace', () => {
                const result = validatePasswordStrength('  ValidPass123!  ');
                expect(result.isValid).toBe(true);
            });
        });

        describe('Rate Limiting Edge Cases', () => {
            it('should handle different IP addresses separately', () => {
                const user1 = generateAuthKey('user123', 'LOGIN', '192.168.1.1');
                const user2 = generateAuthKey('user123', 'LOGIN', '192.168.1.2');

                recordFailedAttempt(user1, 'LOGIN');
                recordFailedAttempt(user2, 'LOGIN');

                expect(isRateLimited(user1, 'LOGIN').remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts - 1);
                expect(isRateLimited(user2, 'LOGIN').remaining).toBe(RATE_LIMITS.LOGIN.maxAttempts - 1);
            });
        });

        describe('Email Validation Edge Cases', () => {
            it('should handle email with maximum length', () => {
                const localPart = 'a'.repeat(64);
                const domain = 'example.com';
                const email = `${localPart}@${domain}`;
                const result = validateEmail(email);
                expect(result.valid).toBe(true);
            });

            it('should handle subdomain emails', () => {
                const result = validateEmail('user@mail.example.com');
                expect(result.valid).toBe(true);
            });
        });
    });

    // ============= CONFIGURATION TESTS =============

    describe('Configuration', () => {
        it('should have correct default values', () => {
            expect(DEFAULT_AUTH_SECURITY.passwordMinLength).toBe(12);
            expect(DEFAULT_AUTH_SECURITY.passwordRequireUppercase).toBe(true);
            expect(DEFAULT_AUTH_SECURITY.passwordRequireLowercase).toBe(true);
            expect(DEFAULT_AUTH_SECURITY.passwordRequireNumbers).toBe(true);
            expect(DEFAULT_AUTH_SECURITY.passwordRequireSpecial).toBe(true);
            expect(DEFAULT_AUTH_SECURITY.maxLoginAttempts).toBe(5);
            expect(DEFAULT_AUTH_SECURITY.lockoutDuration).toBe(15);
            expect(DEFAULT_AUTH_SECURITY.sessionTimeout).toBe(30);
        });

        it('should have correct rate limit configurations', () => {
            expect(RATE_LIMITS.LOGIN.windowMs).toBe(15 * 60 * 1000);
            expect(RATE_LIMITS.LOGIN.maxAttempts).toBe(5);
            expect(RATE_LIMITS.SIGNUP.windowMs).toBe(60 * 60 * 1000);
            expect(RATE_LIMITS.SIGNUP.maxAttempts).toBe(3);
            expect(RATE_LIMITS.PASSWORD_RESET.windowMs).toBe(60 * 60 * 1000);
            expect(RATE_LIMITS.PASSWORD_RESET.maxAttempts).toBe(3);
        });
    });
});
