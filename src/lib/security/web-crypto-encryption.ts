/**
 * Web Crypto API Encryption Service for Financial Data
 * Uses Web Crypto API for client-side encryption (compatible with browser environment)
 */

export interface EncryptedData {
    encrypted: string;
    iv: string;
    salt: string;
}

export interface EncryptionOptions {
    algorithm?: string;
    keyLength?: number;
    ivLength?: number;
}

/**
 * Web Crypto API Encryption Service
 * Note: This is a simplified implementation for demonstration
 * In production, use server-side encryption for sensitive financial data
 */
export class WebCryptoEncryptionService {
    private algorithm: string;
    private keyLength: number;
    private ivLength: number;

    constructor(options: EncryptionOptions = {}) {
        this.algorithm = options.algorithm || 'AES-GCM';
        this.keyLength = options.keyLength || 256;
        this.ivLength = options.ivLength || 12; // 96 bits for GCM
    }

    /**
     * Check if Web Crypto API is available
     */
    static isSupported(): boolean {
        return typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto;
    }

    /**
     * Generate a random encryption key
     */
    static generateKey(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate a random salt
     */
    static generateSalt(): string {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate a random IV
     */
    private generateIV(): Uint8Array {
        const iv = new Uint8Array(this.ivLength);
        crypto.getRandomValues(iv);
        return iv;
    }

    /**
     * Convert hex string to ArrayBuffer
     */
    private hexToArrayBuffer(hex: string): ArrayBuffer {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes.buffer;
    }

    /**
     * Convert ArrayBuffer to hex string
     */
    private arrayBufferToHex(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Import key from hex string
     */
    private async importKey(keyHex: string): Promise<CryptoKey> {
        const keyData = this.hexToArrayBuffer(keyHex);
        return crypto.subtle.importKey(
            'raw',
            keyData,
            { name: this.algorithm },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data (simplified - use with caution for sensitive data)
     */
    async encrypt(data: string, keyHex: string): Promise<EncryptedData> {
        if (!WebCryptoEncryptionService.isSupported()) {
            throw new Error('Web Crypto API not supported');
        }

        try {
            // Generate IV and salt
            const iv = this.generateIV();
            const salt = WebCryptoEncryptionService.generateSalt();

            // Import key
            const key = await this.importKey(keyHex);

            // Encrypt data
            const encodedData = new TextEncoder().encode(data);
            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv as BufferSource,
                },
                key,
                encodedData
            );

            return {
                encrypted: this.arrayBufferToHex(encryptedBuffer),
                iv: this.arrayBufferToHex(iv.buffer as ArrayBuffer),
                salt: salt
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Decrypt data
     */
    async decrypt(encryptedData: EncryptedData, keyHex: string): Promise<string> {
        if (!WebCryptoEncryptionService.isSupported()) {
            throw new Error('Web Crypto API not supported');
        }

        try {
            // Import key
            const key = await this.importKey(keyHex);

            // Decrypt data
            const encryptedBuffer = this.hexToArrayBuffer(encryptedData.encrypted);
            const iv = this.hexToArrayBuffer(encryptedData.iv);

            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv as BufferSource,
                },
                key,
                encryptedBuffer
            );

            return new TextDecoder().decode(decryptedBuffer);
        } catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Encrypt financial amount (client-side only - for non-sensitive display data)
     */
    async encryptFinancialAmount(amount: number, currency: string = 'ETB', keyHex: string): Promise<EncryptedData> {
        // Validate inputs
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            throw new Error('Invalid financial amount');
        }

        if (typeof currency !== 'string' || currency.length !== 3) {
            throw new Error('Invalid currency code');
        }

        // Create structured data
        const financialData = {
            amount,
            currency,
            timestamp: Date.now(),
            checksum: this.simpleHash(amount.toString())
        };

        return this.encrypt(JSON.stringify(financialData), keyHex);
    }

    /**
     * Decrypt financial amount
     */
    async decryptFinancialAmount(encryptedData: EncryptedData, keyHex: string): Promise<{
        amount: number;
        currency: string;
        timestamp: number;
        checksum: string;
    }> {
        const decryptedString = await this.decrypt(encryptedData, keyHex);

        try {
            const financialData = JSON.parse(decryptedString);

            // Validate structure
            if (!financialData.amount || !financialData.currency || !financialData.timestamp || !financialData.checksum) {
                throw new Error('Invalid financial data structure');
            }

            // Validate data types
            if (typeof financialData.amount !== 'number' || financialData.amount < 0) {
                throw new Error('Invalid amount in decrypted data');
            }

            if (typeof financialData.currency !== 'string' || financialData.currency.length !== 3) {
                throw new Error('Invalid currency in decrypted data');
            }

            // Verify checksum
            const expectedChecksum = this.simpleHash(financialData.amount.toString());
            if (financialData.checksum !== expectedChecksum) {
                throw new Error('Data integrity check failed');
            }

            return financialData;
        } catch (error) {
            throw new Error(`Failed to parse decrypted financial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Simple hash function for checksums
     */
    private simpleHash(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Hash sensitive data for indexing (one-way)
     */
    hashSensitiveData(data: string): string {
        // Simple hash for demonstration - use proper hashing in production
        return this.simpleHash(data);
    }

    /**
     * Generate secure token
     */
    generateSecureToken(length: number = 32): string {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate if data looks encrypted
     */
    isEncrypted(data: string): boolean {
        return /^[a-f0-9]+$/i.test(data) && data.length % 2 === 0;
    }

    /**
     * Mask sensitive data for display
     */
    maskSensitiveData(data: string, visibleChars: number = 4): string {
        if (data.length <= visibleChars * 2) {
            return '*'.repeat(data.length);
        }

        const start = data.substring(0, visibleChars);
        const end = data.substring(data.length - visibleChars);
        const middle = '*'.repeat(data.length - (visibleChars * 2));

        return start + middle + end;
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
 * Client-side encryption utilities (use with caution)
 * For production financial applications, always use server-side encryption
 */
export const clientEncryptionUtils = {
    /**
     * Check if client-side encryption is supported and recommended
     */
    isRecommended(): boolean {
        return WebCryptoEncryptionService.isSupported();
    },

    /**
     * Generate a session key for temporary client-side encryption
     */
    generateSessionKey(): string {
        return WebCryptoEncryptionService.generateKey();
    },

    /**
     * Mask financial amounts for privacy
     */
    maskAmount(amount: number, currency: string = 'ETB'): string {
        return `${currency} ${'•'.repeat(Math.min(amount.toString().length, 8))}`;
    },

    /**
     * Create privacy-safe financial display
     */
    createPrivateDisplay(amount: number, currency: string = 'ETB'): {
        masked: string;
        lastDigits: string;
    } {
        const amountStr = amount.toString();
        return {
            masked: this.maskAmount(amount, currency),
            lastDigits: amountStr.slice(-4)
        };
    }
};

/**
 * Hook for using Web Crypto encryption
 */
export function useWebEncryption() {
    const encryptionService = new WebCryptoEncryptionService();

    return {
        encrypt: (data: string, keyHex: string) => encryptionService.encrypt(data, keyHex),
        decrypt: (encryptedData: EncryptedData, keyHex: string) =>
            encryptionService.decrypt(encryptedData, keyHex),
        encryptFinancialAmount: (amount: number, currency: string, keyHex: string) =>
            encryptionService.encryptFinancialAmount(amount, currency, keyHex),
        decryptFinancialAmount: (encryptedData: EncryptedData, keyHex: string) =>
            encryptionService.decryptFinancialAmount(encryptedData, keyHex),
        hashSensitiveData: (data: string) => encryptionService.hashSensitiveData(data),
        generateSecureToken: (length?: number) => encryptionService.generateSecureToken(length),
        isEncrypted: (data: string) => encryptionService.isEncrypted(data),
        maskSensitiveData: (data: string, visibleChars?: number) =>
            encryptionService.maskSensitiveData(data, visibleChars),
    };
}

// Export singleton instance
export const webEncryptionService = new WebCryptoEncryptionService();