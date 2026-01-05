// Database Optimization Service
// Handles query optimization and performance monitoring

interface QueryStats {
    query: string
    duration: number
    timestamp: number
    success: boolean
}

class DatabaseOptimizationService {
    private queryStats: QueryStats[] = []
    private slowQueryThreshold = 1000 // 1 second

    logQuery(query: string, duration: number, success: boolean) {
        const stat: QueryStats = {
            query,
            duration,
            timestamp: Date.now(),
            success
        }

        this.queryStats.push(stat)

        // Keep only last 100 queries
        if (this.queryStats.length > 100) {
            this.queryStats.shift()
        }

        // Log slow queries
        if (duration > this.slowQueryThreshold) {
            console.warn(`🐌 Slow query detected (${duration}ms):`, query)
        }

        // Log failed queries
        if (!success) {
            console.error(`❌ Failed query:`, query)
        }
    }

    getQueryStats() {
        const totalQueries = this.queryStats.length
        const successfulQueries = this.queryStats.filter(s => s.success).length
        const failedQueries = totalQueries - successfulQueries
        const avgDuration = this.queryStats.reduce((sum, s) => sum + s.duration, 0) / totalQueries
        const slowQueries = this.queryStats.filter(s => s.duration > this.slowQueryThreshold).length

        return {
            totalQueries,
            successfulQueries,
            failedQueries,
            successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
            avgDuration,
            slowQueries,
            slowQueryPercentage: totalQueries > 0 ? (slowQueries / totalQueries) * 100 : 0
        }
    }

    clearStats() {
        this.queryStats = []
    }

    // Index suggestions based on query patterns
    suggestIndexes() {
        const suggestions: string[] = []

        // Look for common query patterns
        const queryPatterns = this.queryStats.map(s => s.query.toLowerCase())

        if (queryPatterns.some(q => q.includes('where user_id'))) {
            suggestions.push('CREATE INDEX idx_transactions_user_id ON transactions(user_id)')
        }

        if (queryPatterns.some(q => q.includes('where account_id'))) {
            suggestions.push('CREATE INDEX idx_transactions_account_id ON transactions(account_id)')
        }

        if (queryPatterns.some(q => q.includes('where date'))) {
            suggestions.push('CREATE INDEX idx_transactions_date ON transactions(transaction_date)')
        }

        if (queryPatterns.some(q => q.includes('order by'))) {
            suggestions.push('Consider adding composite indexes for ORDER BY + WHERE combinations')
        }

        return suggestions
    }

    // Connection pooling optimization
    optimizeConnectionPool() {
        // This would be handled by Supabase, but we can monitor connection usage
        console.log('📊 Database connection optimization recommendations:')
        console.log('- Use connection pooling (handled by Supabase)')
        console.log('- Implement query caching for frequently accessed data')
        console.log('- Use pagination for large result sets')
        console.log('- Consider read replicas for read-heavy workloads')
    }

    // Data fetching optimization
    async optimizeDataFetching(userId: string) {
        const startTime = performance.now()

        try {
            // This would be implemented in your data service
            // For now, just logging the optimization attempt
            console.log(`🚀 Optimizing data fetching for user: ${userId}`)

            const duration = performance.now() - startTime
            this.logQuery(`optimizeDataFetching(${userId})`, duration, true)

            return {
                success: true,
                duration,
                recommendations: [
                    'Implement pagination for transaction lists',
                    'Use query caching for budget calculations',
                    'Batch multiple small queries together',
                    'Consider denormalization for frequently joined data'
                ]
            }
        } catch (error) {
            const duration = performance.now() - startTime
            this.logQuery(`optimizeDataFetching(${userId})`, duration, false)
            throw error
        }
    }
}

export const databaseOptimizer = new DatabaseOptimizationService()

// Performance monitoring middleware for data service
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    queryName: string
): T {
    return (async (...args: Parameters<T>) => {
        const startTime = performance.now()

        try {
            const result = await fn(...args)
            const duration = performance.now() - startTime

            databaseOptimizer.logQuery(queryName, duration, true)
            return result
        } catch (error) {
            const duration = performance.now() - startTime
            databaseOptimizer.logQuery(queryName, duration, false)
            throw error
        }
    }) as T
}