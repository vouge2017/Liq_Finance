/**
 * Data Encryption Service for Financial Data
 * Implements encryption/decryption for sensitive financial information
 */

import { getAppConfig, getServerConfig } from '@/lib/config/environment';
import CryptoJS from 'crypto-js';

export interface EncryptedData {
    encrypted: string;
    iv: string;
    authTag: string;
}

export interface EncryptionOptions {
    algorithm?: string;
    keyLength?: number;
    ivLength?: number;
    authTagLength?: number;
}

/**
 * Data Encryption Service
 */
export class DataEncryptionService {
    private encryptionKey: string;
    private algorithm: string;
    private keyLength: number;
    private ivLength: number;
    private authTagLength: number;
    private isClient: boolean;

    constructor(options: EncryptionOptions = {}) {
        // Get encryption key from environment based on runtime
        this.isClient = typeof window !== 'undefined';
        const config = this.isClient ? getAppConfig() : getServerConfig();
        this.encryptionKey = config.security.encryptionKey;
        this.algorithm = options.algorithm || 'aes-256-gcm';
        this.keyLength = options.keyLength || 32; // 256 bits
        this.ivLength = options.ivLength || 16; // 128 bits
        this.authTagLength = options.authTagLength || 16; // 128 bits
    }

    /**
     * Generate a new encryption key
     */
    static generateKey(length: number = 32): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Derive encryption key from password using PBKDF2
     */
    static deriveKeyFromPassword(password: string, salt: string, iterations: number = 100000): string {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: iterations,
            hasher: CryptoJS.algo.SHA256
        }).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate a random salt for password derivation
     */
    static generateSalt(length: number = 32): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Encrypt sensitive financial data
     */
    encrypt(data: string | number | object): EncryptedData {
        try {
            // Convert data to string if it's not already
            const dataString = typeof data === 'string' ? data : JSON.stringify(data);

            // Generate initialization vector
            const iv = CryptoJS.lib.WordArray.random(16);

            // Convert hex key to WordArray
            const key = CryptoJS.enc.Hex.parse(this.encryptionKey);

            // Encrypt using AES-CBC
            const encrypted = CryptoJS.AES.encrypt(dataString, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return {
                encrypted: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
                iv: iv.toString(CryptoJS.enc.Hex),
                authTag: '' // Not used in CBC mode
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Decrypt sensitive financial data
     */
    decrypt(encryptedData: EncryptedData): string {
        try {
            const { encrypted, iv } = encryptedData;

            // Convert hex key to WordArray
            const key = CryptoJS.enc.Hex.parse(this.encryptionKey);

            // Convert iv to WordArray
            const ivWord = CryptoJS.enc.Hex.parse(iv);

            // Convert encrypted to CipherParams
            const encryptedWord = CryptoJS.enc.Hex.parse(encrypted);
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: encryptedWord
            });

            // Decrypt using AES-CBC
            const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
                iv: ivWord,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Encrypt financial amount with validation
     */
    encryptFinancialAmount(amount: number, currency: string = 'ETB'): EncryptedData {
        // Validate amount
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            throw new Error('Invalid financial amount');
        }

        // Validate currency
        if (typeof currency !== 'string' || currency.length !== 3) {
            throw new Error('Invalid currency code');
        }

        // Create structured financial data
        const financialData = {
            amount,
            currency,
            timestamp: Date.now(),
            checksum: this.generateChecksum(amount.toString())
        };

        return this.encrypt(financialData);
    }

    /**
     * Decrypt financial amount with validation
     */
    decryptFinancialAmount(encryptedData: EncryptedData): { amount: number; currency: string; timestamp: number; checksum: string } {
        const decryptedString = this.decrypt(encryptedData);

        try {
            const financialData = JSON.parse(decryptedString);

            // Validate structure
            if (!financialData.amount || !financialData.currency || !financialData.timestamp || !financialData.checksum) {
                throw new Error('Invalid financial data structure');
            }

            // Validate amount
            if (typeof financialData.amount !== 'number' || financialData.amount < 0) {
                throw new Error('Invalid amount in decrypted data');
            }

            // Validate currency
            if (typeof financialData.currency !== 'string' || financialData.currency.length !== 3) {
                throw new Error('Invalid currency in decrypted data');
            }

            // Verify checksum
            const expectedChecksum = this.generateChecksum(financialData.amount.toString());
            if (financialData.checksum !== expectedChecksum) {
                throw new Error('Data integrity check failed');
            }

            return financialData;
        } catch (error) {
            throw new Error(`Failed to parse decrypted financial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Encrypt user profile sensitive data
     */
    encryptProfileData(profileData: {
        full_name?: string;
        phone?: string;
        financial_goal?: string;
        income?: number;
        expenses?: number;
        savings?: number;
    }): EncryptedData {
        // Filter and validate sensitive fields
        const sensitiveData: any = {};

        if (profileData.full_name) sensitiveData.full_name = profileData.full_name;
        if (profileData.phone) sensitiveData.phone = profileData.phone;
        if (profileData.financial_goal) sensitiveData.financial_goal = profileData.financial_goal;
        if (typeof profileData.income === 'number') sensitiveData.income = profileData.income;
        if (typeof profileData.expenses === 'number') sensitiveData.expenses = profileData.expenses;
        if (typeof profileData.savings === 'number') sensitiveData.savings = profileData.savings;

        // Add metadata
        sensitiveData.encrypted_at = Date.now();
        sensitiveData.data_type = 'profile_sensitive';

        return this.encrypt(sensitiveData);
    }

    /**
     * Decrypt user profile sensitive data
     */
    decryptProfileData(encryptedData: EncryptedData): any {
        const decryptedString = this.decrypt(encryptedData);

        try {
            const profileData = JSON.parse(decryptedString);

            // Validate metadata
            if (profileData.data_type !== 'profile_sensitive') {
                throw new Error('Invalid profile data type');
            }

            // Remove metadata before returning
            const { encrypted_at, data_type, ...sensitiveData } = profileData;

            return sensitiveData;
        } catch (error) {
            throw new Error(`Failed to decrypt profile data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate checksum for data integrity
     */
    private generateChecksum(data: string): string {
        return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex).substring(0, 16);
    }

    /**
     * Hash sensitive data for indexing (one-way)
     */
    hashSensitiveData(data: string): string {
        return CryptoJS.SHA256(data + this.encryptionKey).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate secure random token
     */
    generateSecureToken(length: number = 32): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Validate encryption key strength
     */
    static validateEncryptionKey(key: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!key) {
            errors.push('Encryption key is required');
            return { valid: false, errors };
        }

        if (key.length !== 64) { // 32 bytes = 64 hex characters
            errors.push('Encryption key must be exactly 32 bytes (64 hex characters)');
        }

        if (!/^[a-f0-9]+$/i.test(key)) {
            errors.push('Encryption key must contain only hexadecimal characters');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * Financial Data Types for Type Safety
 */
export interface FinancialAmount {
    amount: number;
    currency: string;
}

export interface TransactionData {
    id: string;
    amount: FinancialAmount;
    description: string;
    category: string;
    date: string;
    account_id: string;
}

export interface AccountData {
    id: string;
    name: string;
    type: string;
    balance: FinancialAmount;
    account_number?: string;
    bank_name?: string;
}

/**
 * Hook for using encryption service
 */
export function useEncryption() {
    const encryptionService = new DataEncryptionService();

    return {
        encrypt: (data: string | number | object) => encryptionService.encrypt(data),
        decrypt: (encryptedData: EncryptedData) => encryptionService.decrypt(encryptedData),
        encryptFinancialAmount: (amount: number, currency?: string) =>
            encryptionService.encryptFinancialAmount(amount, currency),
        decryptFinancialAmount: (encryptedData: EncryptedData) =>
            encryptionService.decryptFinancialAmount(encryptedData),
        encryptProfileData: (profileData: any) => encryptionService.encryptProfileData(profileData),
        decryptProfileData: (encryptedData: EncryptedData) => encryptionService.decryptProfileData(encryptedData),
        hashSensitiveData: (data: string) => encryptionService.hashSensitiveData(data),
        generateSecureToken: (length?: number) => encryptionService.generateSecureToken(length),
    };
}

// Export singleton instance for server-side use
export const dataEncryptionService = new DataEncryptionService();