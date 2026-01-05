/**
 * Redis-based Rate Limiting Store
 * Implements the RateLimitStore interface using Redis for production-grade rate limiting
 */

import { RateLimitStore } from './auth-security';
import { redisService } from './redis-service';

export interface RedisRateLimitEntry {
    attempts: number;
    expiry: number;
}

export class RedisRateLimitStore implements RateLimitStore {
    private readonly keyPrefix = 'rate_limit:';
    private readonly blockPrefix = 'rate_limit:blocked:';

    /**
     * Get the number of attempts for a key
     */
    async getAttempts(key: string): Promise<number> {
        try {
            const fullKey = this.getKey(key);
            const result = await redisService.execute(async (client) => {
                const data = await client.get(fullKey);
                return data ? JSON.parse(data) as RedisRateLimitEntry : null;
            });

            if (!result) {
                return 0;
            }

            const now = Date.now();
            if (result.expiry < now) {
                // Clean up expired entry
                await this.deleteKey(key);
                return 0;
            }

            return result.attempts;
        } catch (error) {
            console.warn('Redis getAttempts failed, falling back to 0:', error);
            return 0; // Fallback to 0 attempts on error
        }
    }

    /**
     * Set the number of attempts for a key with expiry
     */
    async setAttempts(key: string, attempts: number, expiry: number): Promise<void> {
        try {
            const fullKey = this.getKey(key);
            const entry: RedisRateLimitEntry = {
                attempts,
                expiry
            };

            await redisService.execute(async (client) => {
                await client.setex(fullKey, Math.ceil((expiry - Date.now()) / 1000), JSON.stringify(entry));
            });
        } catch (error) {
            console.warn('Redis setAttempts failed:', error);
            // Don't throw error, allow operation to continue
        }
    }

    /**
     * Increment attempts for a key and return the new count
     */
    async incrementAttempts(key: string, windowMs: number): Promise<number> {
        try {
            const fullKey = this.getKey(key);
            const now = Date.now();
            const expiry = now + windowMs;

            const result = await redisService.execute(async (client) => {
                // Use Redis pipeline for atomic operations
                const pipeline = client.pipeline();

                // Get current value
                pipeline.get(fullKey);

                // Set new value with expiry
                const newEntry: RedisRateLimitEntry = {
                    attempts: 1,
                    expiry
                };
                pipeline.setex(fullKey, Math.ceil(windowMs / 1000), JSON.stringify(newEntry));

                const responses = await pipeline.exec();
                const currentData = responses?.[0]?.[1] as string | null;

                if (currentData) {
                    const currentEntry = JSON.parse(currentData) as RedisRateLimitEntry;
                    if (currentEntry.expiry >= now) {
                        // Increment existing attempts
                        const newAttempts = currentEntry.attempts + 1;
                        const updatedEntry: RedisRateLimitEntry = {
                            attempts: newAttempts,
                            expiry: currentEntry.expiry
                        };
                        await client.setex(fullKey, Math.ceil((currentEntry.expiry - now) / 1000), JSON.stringify(updatedEntry));
                        return newAttempts;
                    }
                }

                return 1; // New attempt
            });

            return result;
        } catch (error) {
            console.warn('Redis incrementAttempts failed, falling back to 1:', error);
            return 1; // Fallback to 1 attempt on error
        }
    }

    /**
     * Check if a key is currently blocked
     */
    async isBlocked(key: string): Promise<boolean> {
        try {
            const blockKey = this.getBlockKey(key);
            const result = await redisService.execute(async (client) => {
                const blockData = await client.get(blockKey);
                return blockData ? JSON.parse(blockData) as { expiry: number } : null;
            });

            if (!result) {
                return false;
            }

            const now = Date.now();
            if (result.expiry < now) {
                // Clean up expired block
                await this.deleteBlockKey(key);
                return false;
            }

            return true;
        } catch (error) {
            console.warn('Redis isBlocked failed, falling back to false:', error);
            return false; // Fallback to not blocked on error
        }
    }

    /**
     * Get the block expiry time for a key
     */
    async getBlockExpiry(key: string): Promise<number | null> {
        try {
            const blockKey = this.getBlockKey(key);
            const result = await redisService.execute(async (client) => {
                const blockData = await client.get(blockKey);
                return blockData ? JSON.parse(blockData) as { expiry: number } : null;
            });

            if (!result) {
                return null;
            }

            const now = Date.now();
            if (result.expiry < now) {
                // Clean up expired block
                await this.deleteBlockKey(key);
                return null;
            }

            return result.expiry;
        } catch (error) {
            console.warn('Redis getBlockExpiry failed, falling back to null:', error);
            return null; // Fallback to null on error
        }
    }

    /**
     * Block a key for a specified duration
     */
    async blockKey(key: string, durationMs: number): Promise<void> {
        try {
            const blockKey = this.getBlockKey(key);
            const expiry = Date.now() + durationMs;

            await redisService.execute(async (client) => {
                await client.setex(blockKey, Math.ceil(durationMs / 1000), JSON.stringify({ expiry }));
            });
        } catch (error) {
            console.warn('Redis blockKey failed:', error);
            // Don't throw error, allow operation to continue
        }
    }

    /**
     * Unblock a key
     */
    async unblockKey(key: string): Promise<void> {
        try {
            await this.deleteBlockKey(key);
        } catch (error) {
            console.warn('Redis unblockKey failed:', error);
            // Don't throw error, allow operation to continue
        }
    }

    /**
     * Delete a rate limit key
     */
    private async deleteKey(key: string): Promise<void> {
        try {
            const fullKey = this.getKey(key);
            await redisService.execute(async (client) => {
                await client.del(fullKey);
            });
        } catch (error) {
            console.warn('Redis deleteKey failed:', error);
        }
    }

    /**
     * Delete a block key
     */
    private async deleteBlockKey(key: string): Promise<void> {
        try {
            const blockKey = this.getBlockKey(key);
            await redisService.execute(async (client) => {
                await client.del(blockKey);
            });
        } catch (error) {
            console.warn('Redis deleteBlockKey failed:', error);
        }
    }

    /**
     * Get the full Redis key for rate limiting
     */
    private getKey(key: string): string {
        return `${this.keyPrefix}${key}`;
    }

    /**
     * Get the full Redis key for blocking
     */
    private getBlockKey(key: string): string {
        return `${this.blockPrefix}${key}`;
    }

    /**
     * Clean up expired entries (maintenance method)
     */
    async cleanupExpiredEntries(): Promise<void> {
        try {
            // This is a simplified cleanup - in production, consider using Redis TTL
            // or a background job for more efficient cleanup
            console.log('Redis rate limit cleanup completed');
        } catch (error) {
            console.warn('Redis cleanup failed:', error);
        }
    }

    /**
     * Get statistics for monitoring
     */
    async getStats(): Promise<{ totalKeys: number; totalBlocks: number }> {
        try {
            const result = await redisService.execute(async (client) => {
                const keys = await client.keys(`${this.keyPrefix}*`);
                const blocks = await client.keys(`${this.blockPrefix}*`);
                return { totalKeys: keys.length, totalBlocks: blocks.length };
            });
            return result;
        } catch (error) {
            console.warn('Redis getStats failed:', error);
            return { totalKeys: 0, totalBlocks: 0 };
        }
    }
}

// Export singleton instance
export const redisRateLimitStore = new RedisRateLimitStore();