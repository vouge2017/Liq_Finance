/**
 * Data Encryption Service Tests
 * Tests for AES-256-GCM encryption, decryption, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataEncryptionService, EncryptedData } from '../data-encryption';

// Mock the environment config module
vi.mock('@/lib/config/environment', () => ({
    getServerConfig: () => ({
        security: {
            encryptionKey: '1234567890123456789012345678901234567890123456789012345678901234', // 32 bytes = 64 hex chars
        },
    }),
}));

describe('DataEncryptionService', () => {
    let encryptionService: DataEncryptionService;

    beforeEach(() => {
        encryptionService = new DataEncryptionService();
    });

    // ============= ENCRYPTION/DECRYPTION TESTS =============

    describe('Basic Encryption/Decryption', () => {
        it('should encrypt and decrypt a string successfully', () => {
            const originalData = 'Hello, World!';
            const encrypted = encryptionService.encrypt(originalData);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(originalData);
        });

        it('should produce different encrypted outputs for same input (due to random IV)', () => {
            const originalData = 'Same data';
            const encrypted1 = encryptionService.encrypt(originalData);
            const encrypted2 = encryptionService.encrypt(originalData);

            expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
            expect(encrypted1.iv).not.toBe(encrypted2.iv);
        });

        it('should return valid EncryptedData structure', () => {
            const encrypted = encryptionService.encrypt('test data');

            expect(encrypted).toHaveProperty('encrypted');
            expect(encrypted).toHaveProperty('iv');
            expect(encrypted).toHaveProperty('authTag');
            expect(typeof encrypted.encrypted).toBe('string');
            expect(typeof encrypted.iv).toBe('string');
            expect(typeof encrypted.authTag).toBe('string');
        });
    });

    describe('Financial Amount Encryption', () => {
        it('should encrypt financial amount with ETB currency', () => {
            const amount = 1500.50;
            const encrypted = encryptionService.encryptFinancialAmount(amount, 'ETB');
            const decrypted = encryptionService.decryptFinancialAmount(encrypted);

            expect(decrypted.amount).toBe(amount);
            expect(decrypted.currency).toBe('ETB');
        });

        it('should throw error for invalid amount (negative)', () => {
            expect(() => {
                encryptionService.encryptFinancialAmount(-100);
            }).toThrow('Invalid financial amount');
        });

        it('should throw error for invalid amount (NaN)', () => {
            expect(() => {
                encryptionService.encryptFinancialAmount(NaN);
            }).toThrow('Invalid financial amount');
        });

        it('should throw error for invalid currency', () => {
            expect(() => {
                encryptionService.encryptFinancialAmount(100, 'INVALID');
            }).toThrow('Invalid currency code');
        });

        it('should detect data tampering through checksum', () => {
            const encrypted = encryptionService.encryptFinancialAmount(100, 'ETB');

            // Tamper with the encrypted data
            const tamperedData: EncryptedData = {
                ...encrypted,
                encrypted: encrypted.encrypted.slice(0, -4) + 'xxxx',
            };

            expect(() => {
                encryptionService.decryptFinancialAmount(tamperedData);
            }).toThrow('Data integrity check failed');
        });
    });

    describe('Error Handling', () => {
        it('should throw error for decryption with invalid IV', () => {
            const encrypted = encryptionService.encrypt('test data');

            const invalidData: EncryptedData = {
                ...encrypted,
                iv: 'invalid-iv-hex-characters-here',
            };

            expect(() => {
                encryptionService.decrypt(invalidData);
            }).toThrow();
        });
    });

    // ============= HASHING TESTS =============

    describe('Hash Sensitive Data', () => {
        it('should hash data consistently', () => {
            const data = 'sensitive-data';
            const hash1 = encryptionService.hashSensitiveData(data);
            const hash2 = encryptionService.hashSensitiveData(data);

            expect(hash1).toBe(hash2);
        });

        it('should produce different hashes for different data', () => {
            const hash1 = encryptionService.hashSensitiveData('data1');
            const hash2 = encryptionService.hashSensitiveData('data2');

            expect(hash1).not.toBe(hash2);
        });

        it('should produce 64-character hex hash (SHA-256)', () => {
            const hash = encryptionService.hashSensitiveData('test data');
            expect(hash.length).toBe(64);
        });
    });

    // ============= TOKEN GENERATION TESTS =============

    describe('Generate Secure Token', () => {
        it('should generate random token', () => {
            const token1 = encryptionService.generateSecureToken();
            const token2 = encryptionService.generateSecureToken();

            expect(token1).not.toBe(token2);
        });

        it('should generate 64-character token by default', () => {
            const token = encryptionService.generateSecureToken();
            expect(token.length).toBe(64);
        });
    });

    // ============= KEY GENERATION TESTS =============

    describe('Static Key Methods', () => {
        it('should generate random key', () => {
            const key1 = DataEncryptionService.generateKey();
            const key2 = DataEncryptionService.generateKey();

            expect(key1).not.toBe(key2);
            expect(key1.length).toBe(64); // 32 bytes = 64 hex chars
        });

        it('should generate random salt', () => {
            const salt1 = DataEncryptionService.generateSalt();
            const salt2 = DataEncryptionService.generateSalt();

            expect(salt1).not.toBe(salt2);
            expect(salt1.length).toBe(64); // 32 bytes = 64 hex chars
        });

        it('should derive key from password', () => {
            const password = 'my-password';
            const salt = 'my-salt';

            const key1 = DataEncryptionService.deriveKeyFromPassword(password, salt);
            const key2 = DataEncryptionService.deriveKeyFromPassword(password, salt);

            expect(key1).toBe(key2);
            expect(key1.length).toBe(64);
        });

        it('should validate encryption key correctly', () => {
            const validKey = '1234567890123456789012345678901234567890123456789012345678901234'; // 32 bytes = 64 hex chars
            const result = DataEncryptionService.validateEncryptionKey(validKey);
            expect(result.valid).toBe(true);
        });

        it('should reject invalid encryption key (wrong length)', () => {
            const shortKey = '12345';
            const result = DataEncryptionService.validateEncryptionKey(shortKey);
            expect(result.valid).toBe(false);
        });

        it('should reject empty encryption key', () => {
            const result = DataEncryptionService.validateEncryptionKey('');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Encryption key is required');
        });

        it('should reject key with non-hex characters', () => {
            const invalidKey = '1234567890123456789012345678901xyz';
            const result = DataEncryptionService.validateEncryptionKey(invalidKey);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Encryption key must contain only hexadecimal characters');
        });
    });

    // ============= EDGE CASES =============

    describe('Edge Cases', () => {
        it('should handle empty string encryption', () => {
            const encrypted = encryptionService.encrypt('');
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe('');
        });

        it('should handle unicode characters', () => {
            const unicodeData = 'Hello 世界 🌍';
            const encrypted = encryptionService.encrypt(unicodeData);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(unicodeData);
        });

        it('should handle special characters', () => {
            const specialData = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~';
            const encrypted = encryptionService.encrypt(specialData);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(specialData);
        });

        it('should handle zero amount', () => {
            const encrypted = encryptionService.encryptFinancialAmount(0);
            const decrypted = encryptionService.decryptFinancialAmount(encrypted);
            expect(decrypted.amount).toBe(0);
        });
    });
});
