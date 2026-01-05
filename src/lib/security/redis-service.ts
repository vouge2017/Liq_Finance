/**
 * Redis Service for Production Rate Limiting
 * Provides Redis connection management and health checks
 */

import Redis from 'ioredis';
import { getServerConfig } from '../config/environment';

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    retryDelayOnFailover?: number;
    maxRetriesPerRequest?: number;
    lazyConnect?: boolean;
    keepAlive?: number;
    family?: number;
    connectTimeout?: number;
    commandTimeout?: number;
}

export interface RedisHealth {
    status: 'healthy' | 'unhealthy' | 'connecting';
    error?: string;
    lastError?: string;
    lastErrorTime?: number;
    connectionAttempts: number;
    lastSuccessfulConnection?: number;
}

class RedisService {
    private client: Redis | null = null;
    private config: RedisConfig | null = null;
    private health: RedisHealth = {
        status: 'unhealthy',
        connectionAttempts: 0,
        lastError: undefined,
        lastErrorTime: undefined,
        lastSuccessfulConnection: undefined,
    };
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // 1 second

    /**
     * Initialize Redis connection with configuration
     */
    async initialize(config?: RedisConfig): Promise<void> {
        try {
            // Use provided config or try to get from environment
            this.config = config || this.getConfigFromEnv();

            if (!this.config) {
                throw new Error('Redis configuration not found');
            }

            // Create Redis client with production-ready configuration
            this.client = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password,
                db: this.config.db || 0,
                retryDelayOnFailover: this.config.retryDelayOnFailover || 100,
                maxRetriesPerRequest: this.config.maxRetriesPerRequest || 3,
                lazyConnect: this.config.lazyConnect !== false,
                keepAlive: this.config.keepAlive || 30000,
                family: this.config.family || 4,
                connectTimeout: this.config.connectTimeout || 10000,
                commandTimeout: this.config.commandTimeout || 5000,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                reconnectOnError: (err: Error) => {
                    const targetError = 'READONLY';
                    return err.message.includes(targetError);
                },
            });

            // Set up event handlers
            this.setupEventHandlers();

            // Test connection
            await this.client.ping();
            this.updateHealth('healthy', undefined, Date.now());
            this.reconnectAttempts = 0;

            console.log('Redis connection established successfully');
        } catch (error) {
            this.updateHealth('unhealthy', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Failed to initialize Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get Redis configuration from environment variables
     */
    private getConfigFromEnv(): RedisConfig | null {
        try {
            const serverConfig = getServerConfig();

            // Check for Redis URL first (common in cloud providers)
            const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
            if (redisUrl) {
                const url = new URL(redisUrl);
                return {
                    host: url.hostname,
                    port: parseInt(url.port) || 6379,
                    password: url.password || undefined,
                    db: parseInt(url.pathname.slice(1)) || 0,
                };
            }

            // Fallback to individual environment variables
            const host = process.env.REDIS_HOST || process.env.REDIS_SERVER || 'localhost';
            const port = parseInt(process.env.REDIS_PORT || '6379');
            const password = process.env.REDIS_PASSWORD || process.env.REDIS_AUTH || undefined;
            const db = parseInt(process.env.REDIS_DB || '0');

            return {
                host,
                port,
                password,
                db,
            };
        } catch (error) {
            console.warn('Redis configuration not found in environment:', error);
            return null;
        }
    }

    /**
     * Set up Redis event handlers for monitoring
     */
    private setupEventHandlers(): void {
        if (!this.client) return;

        this.client.on('connect', () => {
            console.log('Redis client connected');
            this.updateHealth('healthy', undefined, Date.now());
            this.reconnectAttempts = 0;
        });

        this.client.on('ready', () => {
            console.log('Redis client ready');
            this.updateHealth('healthy', undefined, Date.now());
        });

        this.client.on('error', (error: Error) => {
            console.error('Redis client error:', error);
            this.updateHealth('unhealthy', error.message, Date.now());
        });

        this.client.on('close', () => {
            console.log('Redis connection closed');
            this.updateHealth('unhealthy', 'Connection closed', Date.now());
        });

        this.client.on('reconnecting', () => {
            console.log('Redis client reconnecting');
            this.updateHealth('connecting', 'Reconnecting...', Date.now());
        });

        this.client.on('end', () => {
            console.log('Redis connection ended');
            this.updateHealth('unhealthy', 'Connection ended', Date.now());
        });
    }

    /**
     * Update health status
     */
    private updateHealth(status: RedisHealth['status'], error?: string, timestamp?: number): void {
        this.health = {
            ...this.health,
            status,
            lastError: error,
            lastErrorTime: error ? (timestamp || Date.now()) : undefined,
            lastSuccessfulConnection: status === 'healthy' ? (timestamp || Date.now()) : this.health.lastSuccessfulConnection,
        };
    }

    /**
     * Get Redis client instance
     */
    getClient(): Redis | null {
        return this.client;
    }

    /**
     * Get current health status
     */
    getHealth(): RedisHealth {
        return { ...this.health };
    }

    /**
     * Check if Redis is healthy
     */
    isHealthy(): boolean {
        return this.health.status === 'healthy';
    }

    /**
     * Perform health check with ping
     */
    async healthCheck(): Promise<boolean> {
        try {
            if (!this.client) {
                this.updateHealth('unhealthy', 'No Redis client available');
                return false;
            }

            await this.client.ping();
            this.updateHealth('healthy', undefined, Date.now());
            return true;
        } catch (error) {
            this.updateHealth('unhealthy', error instanceof Error ? error.message : 'Health check failed', Date.now());
            return false;
        }
    }

    /**
     * Reconnect to Redis
     */
    async reconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            throw new Error(`Max reconnection attempts (${this.maxReconnectAttempts}) exceeded`);
        }

        this.reconnectAttempts++;
        this.updateHealth('connecting', `Reconnection attempt ${this.reconnectAttempts}`, Date.now());

        // Wait before attempting to reconnect
        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));

        try {
            if (this.client) {
                await this.client.disconnect();
            }
            await this.initialize(this.config || undefined);
        } catch (error) {
            this.updateHealth('unhealthy', `Reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, Date.now());
            throw error;
        }
    }

    /**
     * Execute Redis command with error handling
     */
    async execute<T>(command: (client: Redis) => Promise<T>): Promise<T> {
        if (!this.client) {
            throw new Error('Redis client not initialized');
        }

        try {
            const result = await command(this.client);
            if (!this.isHealthy()) {
                this.updateHealth('healthy', undefined, Date.now());
            }
            return result;
        } catch (error) {
            this.updateHealth('unhealthy', error instanceof Error ? error.message : 'Command execution failed', Date.now());

            // Try to reconnect once on error
            if (this.reconnectAttempts === 0) {
                try {
                    await this.reconnect();
                    return await command(this.client);
                } catch (reconnectError) {
                    throw new Error(`Redis command failed and reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            throw error;
        }
    }

    /**
     * Close Redis connection
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            try {
                await this.client.disconnect();
                this.client = null;
                this.updateHealth('unhealthy', 'Disconnected', Date.now());
                console.log('Redis connection closed');
            } catch (error) {
                console.error('Error closing Redis connection:', error);
                throw error;
            }
        }
    }

    /**
     * Get Redis info for monitoring
     */
    async getInfo(): Promise<any> {
        try {
            if (!this.client) {
                throw new Error('Redis client not initialized');
            }
            return await this.client.info();
        } catch (error) {
            throw new Error(`Failed to get Redis info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

// Export singleton instance
export const redisService = new RedisService();

// Auto-initialize if in server environment and Redis is configured
if (typeof window === 'undefined') {
    // Server-side initialization
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
    if (redisUrl) {
        redisService.initialize().catch(error => {
            console.warn('Redis auto-initialization failed:', error.message);
        });
    }
}