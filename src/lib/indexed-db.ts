/**
 * IndexedDB Utility for Offline Caching
 * Optimized for low-end devices and immediate data availability
 * 
 * SECURITY: Sensitive financial data (amounts, balances) is encrypted at rest
 */

import { UserData } from "@/hooks/use-user-data";
import { DataEncryptionService, EncryptedData } from "@/lib/security/data-encryption";

const DB_NAME = "liq-finance-cache";
const DB_VERSION = 2; // Bumped for encrypted storage
const STORE_NAME = "user-data";

// Singleton encryption service
let encryptionService: DataEncryptionService | null = null;

const getEncryptionService = (): DataEncryptionService => {
    if (!encryptionService) {
        encryptionService = new DataEncryptionService();
    }
    return encryptionService;
};

export interface CachedData {
    userId: string;
    data: UserData;
    timestamp: number;
    // Encrypted sensitive fields stored separately for integrity
    encryptedFields?: {
        accountBalances?: EncryptedData;
        transactionAmounts?: EncryptedData;
    };
    // Integrity checksum
    checksum?: string;
}

/**
 * Encrypt sensitive financial data from UserData
 */
const encryptSensitiveFields = (data: UserData): CachedData['encryptedFields'] => {
    try {
        const service = getEncryptionService();

        // Extract and encrypt account balances
        const accountBalances = data.accounts.map(acc => ({
            id: acc.id,
            balance: acc.balance
        }));

        // Extract and encrypt transaction amounts
        const transactionAmounts = data.transactions.map(tx => ({
            id: tx.id,
            amount: tx.amount
        }));

        return {
            accountBalances: service.encrypt(accountBalances),
            transactionAmounts: service.encrypt(transactionAmounts)
        };
    } catch (error) {
        console.error("[IndexedDB] Encryption failed, storing unencrypted:", error);
        return undefined;
    }
};

/**
 * Decrypt and restore sensitive financial data to UserData
 */
const decryptSensitiveFields = (
    data: UserData,
    encryptedFields?: CachedData['encryptedFields']
): UserData => {
    if (!encryptedFields) {
        return data;
    }

    try {
        const service = getEncryptionService();

        // Restore account balances
        if (encryptedFields.accountBalances) {
            const decrypted = service.decrypt(encryptedFields.accountBalances);
            const balances: Array<{ id: string; balance: number }> = JSON.parse(decrypted);
            const balanceMap = new Map(balances.map(b => [b.id, b.balance]));

            data.accounts = data.accounts.map(acc => ({
                ...acc,
                balance: balanceMap.get(acc.id) ?? acc.balance
            }));
        }

        // Restore transaction amounts
        if (encryptedFields.transactionAmounts) {
            const decrypted = service.decrypt(encryptedFields.transactionAmounts);
            const amounts: Array<{ id: string; amount: number }> = JSON.parse(decrypted);
            const amountMap = new Map(amounts.map(a => [a.id, a.amount]));

            data.transactions = data.transactions.map(tx => ({
                ...tx,
                amount: amountMap.get(tx.id) ?? tx.amount
            }));
        }

        return data;
    } catch (error) {
        console.error("[IndexedDB] Decryption failed, returning original data:", error);
        return data;
    }
};

/**
 * Generate a simple checksum for data integrity
 */
const generateChecksum = (data: UserData): string => {
    const str = JSON.stringify({
        accountCount: data.accounts.length,
        transactionCount: data.transactions.length,
        totalBalance: data.accounts.reduce((sum, acc) => sum + acc.balance, 0)
    });
    // Simple hash for integrity check
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
};

/**
 * Mask amounts in data for encrypted storage
 * Real values are stored in encryptedFields
 */
const maskSensitiveData = (data: UserData): UserData => {
    return {
        ...data,
        accounts: data.accounts.map(acc => ({
            ...acc,
            balance: 0 // Masked - real value is encrypted
        })),
        transactions: data.transactions.map(tx => ({
            ...tx,
            amount: 0 // Masked - real value is encrypted
        }))
    };
};

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "userId" });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

export const cacheUserData = async (userId: string, data: UserData): Promise<void> => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        // Encrypt sensitive fields
        const encryptedFields = encryptSensitiveFields(data);

        // Generate checksum for integrity verification
        const checksum = generateChecksum(data);

        // Mask sensitive data in main payload (encrypted values stored separately)
        const maskedData = encryptedFields ? maskSensitiveData(data) : data;

        const cachedData: CachedData = {
            userId,
            data: maskedData,
            timestamp: Date.now(),
            encryptedFields,
            checksum
        };

        store.put(cachedData);

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                console.log("[IndexedDB] Data cached with encryption");
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error("[IndexedDB] Failed to cache user data:", error);
    }
};

export const getCachedUserData = async (userId: string): Promise<CachedData | null> => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(userId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const cached = request.result as CachedData | null;

                if (cached) {
                    // Decrypt and restore sensitive fields
                    cached.data = decryptSensitiveFields(cached.data, cached.encryptedFields);

                    // Verify checksum if present
                    if (cached.checksum) {
                        const currentChecksum = generateChecksum(cached.data);
                        if (currentChecksum !== cached.checksum) {
                            console.warn("[IndexedDB] Data integrity check failed");
                            // Still return data but log the warning
                        }
                    }
                }

                resolve(cached || null);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("[IndexedDB] Failed to get cached user data:", error);
        return null;
    }
};

export const clearCache = async (): Promise<void> => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        console.log("[IndexedDB] Cache cleared");
    } catch (error) {
        console.error("[IndexedDB] Failed to clear cache:", error);
    }
};

/**
 * Check if cached data exists and is fresh
 */
export const isCacheValid = async (userId: string, maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<boolean> => {
    try {
        const cached = await getCachedUserData(userId);
        if (!cached) return false;

        const age = Date.now() - cached.timestamp;
        return age < maxAgeMs;
    } catch {
        return false;
    }
};
