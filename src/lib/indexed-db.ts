/**
 * IndexedDB Utility for Offline Caching
 * Optimized for low-end devices and immediate data availability
 */

import { UserData } from "@/hooks/use-user-data";

const DB_NAME = "liq-finance-cache";
const DB_VERSION = 1;
const STORE_NAME = "user-data";

export interface CachedData {
    userId: string;
    data: UserData;
    timestamp: number;
}

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

        const cachedData: CachedData = {
            userId,
            data,
            timestamp: Date.now(),
        };

        store.put(cachedData);

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
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
            request.onsuccess = () => resolve(request.result || null);
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
    } catch (error) {
        console.error("[IndexedDB] Failed to clear cache:", error);
    }
};
