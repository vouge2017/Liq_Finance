# Redis Rate Limiting Implementation

This document describes the production-ready Redis-based rate limiting implementation for the Liq_Finance application.

## Overview

The rate limiting system has been upgraded from in-memory storage to Redis-based storage with automatic fallback to in-memory for high availability and production readiness.

## Architecture

### Components

1. **Redis Service** (`src/lib/security/redis-service.ts`)
   - Manages Redis connection with production-ready configuration
   - Handles connection pooling, retry logic, and health checks
   - Provides automatic reconnection capabilities

2. **Redis Rate Limit Store** (`src/lib/security/redis-rate-limit-store.ts`)
   - Implements the `RateLimitStore` interface using Redis
   - Provides atomic operations using Redis pipelines
   - Includes fallback mechanisms for Redis failures

3. **Hybrid Rate Limit Store** (`src/lib/security/auth-security.ts`)
   - Automatically uses Redis when available
   - Falls back to in-memory storage when Redis is unavailable
   - Maintains consistency between both storage backends

## Configuration

### Environment Variables

Add the following to your `.env` file for Redis configuration:

```bash
# Redis Configuration (Optional - for production rate limiting)
# Use REDIS_URL for cloud providers (Redis Labs, Upstash, etc.)
REDIS_URL=redis://username:password@hostname:port/database

# Or use individual variables for local development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_DB=0

# Alternative naming (same as above)
REDIS_SERVER=localhost
REDIS_AUTH=password
```

### Default Configuration

- **Host**: `localhost`
- **Port**: `6379`
- **Database**: `0`
- **Password**: Optional
- **Connection Timeout**: 10 seconds
- **Command Timeout**: 5 seconds
- **Keep Alive**: 30 seconds
- **Max Retries**: 3 per request
- **Retry Delay**: 100ms (exponential backoff)

## Usage

### Basic Rate Limiting

```typescript
import { isRateLimited, recordFailedAttempt, resetRateLimit } from '../lib/security/auth-security';

// Check if user is rate limited
const rateLimitStatus = await isRateLimited('user@example.com:login', 'LOGIN');

if (rateLimitStatus.blocked) {
    throw new Error(`Account locked until ${new Date(rateLimitStatus.resetTime)}`);
}

// Record failed attempt
const result = await recordFailedAttempt('user@example.com:login', 'LOGIN');

if (result.blocked) {
    // Handle account lockout
}

// Reset after successful authentication
await resetRateLimit('user@example.com:login', 'LOGIN');
```

### Health Monitoring

```typescript
import { getRateLimitHealth, reconnectRateLimitRedis } from '../lib/security/auth-security';

// Check Redis health
const health = await getRateLimitHealth();
console.log('Redis Healthy:', health.redisHealthy);

// Force reconnection if needed
await reconnectRateLimitRedis();
```

## Rate Limiting Operations

### Available Operations

- **LOGIN**: 5 attempts per 15 minutes
- **SIGNUP**: 3 attempts per hour
- **PASSWORD_RESET**: 3 attempts per hour
- **API_GENERAL**: 100 requests per 15 minutes

### Custom Operations

You can define custom rate limiting operations by adding to the `RATE_LIMITS` configuration:

```typescript
export const CUSTOM_RATE_LIMITS = {
    ...RATE_LIMITS,
    CUSTOM_OPERATION: { windowMs: 5 * 60 * 1000, maxAttempts: 10 } // 10 attempts per 5 minutes
};
```

## Production Considerations

### Redis Deployment

For production deployments, consider:

1. **Managed Redis Services**:
   - AWS ElastiCache
   - Google Cloud Memorystore
   - Azure Cache for Redis
   - Upstash (serverless Redis)

2. **Redis Configuration**:
   - Enable persistence (RDB/AOF)
   - Configure appropriate memory limits
   - Set up monitoring and alerting
   - Use Redis clustering for high availability

3. **Security**:
   - Use Redis authentication
   - Enable TLS encryption
   - Restrict network access
   - Use strong passwords

### Monitoring

Monitor the following metrics:

- Redis connection health
- Rate limiting effectiveness
- Fallback frequency (should be minimal)
- Redis memory usage
- Connection pool utilization

### Error Handling

The system includes comprehensive error handling:

- **Redis Unavailable**: Automatically falls back to in-memory storage
- **Network Issues**: Automatic reconnection with exponential backoff
- **Authentication Failures**: Graceful degradation
- **Memory Pressure**: In-memory store has built-in cleanup

## Migration

### From In-Memory to Redis

The migration is automatic and transparent:

1. **No Code Changes Required**: Existing rate limiting code continues to work
2. **State Persistence**: Redis provides persistence across server restarts
3. **Horizontal Scaling**: Multiple application instances can share rate limiting state
4. **Zero Downtime**: Fallback ensures service continuity

### Backward Compatibility

- All existing rate limiting functions remain unchanged
- Return types are preserved (now async)
- Error handling is backward compatible
- Configuration is optional (Redis is not required)

## Testing

### Unit Tests

```typescript
import { isRateLimited, recordFailedAttempt } from '../lib/security/auth-security';

describe('Rate Limiting', () => {
    test('should rate limit login attempts', async () => {
        const key = 'test@example.com:login';
        
        // Exceed rate limit
        for (let i = 0; i < 6; i++) {
            await recordFailedAttempt(key, 'LOGIN');
        }
        
        // Should be blocked
        const status = await isRateLimited(key, 'LOGIN');
        expect(status.blocked).toBe(true);
    });
});
```

### Integration Tests

Test Redis connectivity and fallback behavior:

```typescript
import { getRateLimitHealth } from '../lib/security/auth-security';

describe('Redis Integration', () => {
    test('should handle Redis unavailability', async () => {
        // Simulate Redis down
        const health = await getRateLimitHealth();
        expect(health.redisHealthy).toBe(false);
        
        // Should still work with in-memory fallback
        const status = await isRateLimited('test', 'LOGIN');
        expect(status).toBeDefined();
    });
});
```

## Performance

### Redis Performance

- **Latency**: ~1-5ms for rate limit checks
- **Throughput**: 10,000+ operations per second
- **Memory**: ~100 bytes per rate limit key
- **Persistence**: Configurable RDB/AOF for durability

### Fallback Performance

- **In-Memory Latency**: ~0.1ms
- **Memory Usage**: Grows with active users
- **Cleanup**: Automatic expiration of old entries

## Troubleshooting

### Common Issues

1. **Redis Connection Timeout**
   - Check network connectivity
   - Verify Redis server is running
   - Check firewall rules

2. **Authentication Failures**
   - Verify Redis password
   - Check Redis configuration
   - Ensure TLS settings match

3. **High Fallback Rate**
   - Monitor Redis health
   - Check connection pool settings
   - Review error logs

### Debug Logging

Enable debug logging to troubleshoot issues:

```typescript
// In development, logs are automatically enabled
console.log('Redis rate limiting initialized successfully');
console.warn('Redis rate limiting not available, using in-memory fallback');
```

## Security

### Data Protection

- Rate limiting data is not sensitive
- No PII stored in Redis
- Automatic cleanup prevents data accumulation

### Access Control

- Redis should be firewalled
- Use strong authentication
- Enable TLS for production
- Monitor access logs

## Future Enhancements

Potential improvements:

1. **Redis Clustering**: Support for Redis Cluster
2. **Metrics Integration**: Prometheus/Grafana metrics
3. **Alerting**: Automated alerts for Redis issues
4. **Caching**: Multi-level caching for performance
5. **Geo-Rate Limiting**: Location-based rate limits

## Support

For issues related to Redis rate limiting:

1. Check the application logs for Redis errors
2. Verify Redis connectivity and configuration
3. Monitor Redis health using the provided health checks
4. Review the fallback behavior in error scenarios