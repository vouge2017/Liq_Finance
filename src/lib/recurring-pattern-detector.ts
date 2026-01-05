/**
 * Recurring Pattern Detection and Subscription Management Service
 * Analyzes transaction patterns to automatically detect recurring payments
 * and convert them to subscription management
 */

import { parseEnhancedSMS, EnhancedParsedSMS } from './enhanced-sms-parser'

export interface TransactionPattern {
    id: string
    merchant: string
    amount: number
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'unknown'
    confidence: number
    occurrences: number
    firstDate: Date
    lastDate: Date
    nextExpectedDate?: Date
    averageInterval: number // days
    variance: number // consistency score
}

export interface DetectedSubscription {
    id: string
    name: string
    merchant: string
    amount: number
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    nextBillingDate: Date
    category: string
    isActive: boolean
    confidence: number
    sourceTransactions: string[] // IDs of transactions that formed this pattern
    createdAt: Date
    autoRenewal: boolean
    notes?: string
}

export interface PatternAnalysisResult {
    patterns: TransactionPattern[]
    subscriptions: DetectedSubscription[]
    suggestions: PatternSuggestion[]
    confidence: number
    analysisDate: Date
}

export interface PatternSuggestion {
    type: 'convert_to_subscription' | 'review_pattern' | 'missing_transactions' | 'amount_variance'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    actionRequired: boolean
    relatedPatternId?: string
}

/**
 * Recurring Pattern Detection Service
 */
export class RecurringPatternDetector {
    private patterns: Map<string, TransactionPattern> = new Map()
    private subscriptions: Map<string, DetectedSubscription> = new Map()
    private transactionHistory: ParsedTransaction[] = []

    // Ethiopian-specific merchant patterns
    private readonly SUBSCRIPTION_MERCHANTS = {
        // Streaming services
        'netflix': { category: 'Entertainment', frequency: 'monthly' },
        'spotify': { category: 'Entertainment', frequency: 'monthly' },
        'youtube': { category: 'Entertainment', frequency: 'monthly' },

        // Ethiopian telecom services
        'ethio telecom': { category: 'Bills', frequency: 'monthly' },
        'ethiotelecom': { category: 'Bills', frequency: 'monthly' },
        'safaricom': { category: 'Bills', frequency: 'monthly' },

        // Utilities
        'electric': { category: 'Bills', frequency: 'monthly' },
        'water': { category: 'Bills', frequency: 'monthly' },
        'eelpa': { category: 'Bills', frequency: 'monthly' },

        // Insurance
        'insurance': { category: 'Insurance', frequency: 'monthly' },

        // Transportation
        'uber': { category: 'Transport', frequency: 'weekly' },
        'feres': { category: 'Transport', frequency: 'weekly' },
        'zay': { category: 'Transport', frequency: 'weekly' }
    }

    /**
     * Analyze transactions for recurring patterns
     */
    analyzeTransactions(transactions: ParsedTransaction[], options?: {
        minOccurrences?: number
        confidenceThreshold?: number
        lookbackDays?: number
    }): PatternAnalysisResult {
        const {
            minOccurrences = 3,
            confidenceThreshold = 0.7,
            lookbackDays = 365
        } = options || {}

        // Filter recent transactions
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - lookbackDays)

        const recentTransactions = transactions.filter(t =>
            new Date(t.date) >= cutoffDate
        )

        this.transactionHistory = recentTransactions

        // Group transactions by merchant
        const merchantGroups = this.groupByMerchant(recentTransactions)

        // Analyze each merchant group for patterns
        const patterns: TransactionPattern[] = []
        for (const [merchant, merchantTransactions] of merchantGroups) {
            const pattern = this.analyzeMerchantPattern(merchant, merchantTransactions)
            if (pattern && pattern.occurrences >= minOccurrences) {
                patterns.push(pattern)
                this.patterns.set(pattern.id, pattern)
            }
        }

        // Generate subscription suggestions
        const subscriptions = this.generateSubscriptions(patterns, confidenceThreshold)

        // Generate suggestions and recommendations
        const suggestions = this.generateSuggestions(patterns, subscriptions)

        // Calculate overall confidence
        const overallConfidence = this.calculateOverallConfidence(patterns, subscriptions)

        return {
            patterns,
            subscriptions,
            suggestions,
            confidence: overallConfidence,
            analysisDate: new Date()
        }
    }

    /**
     * Group transactions by merchant for pattern analysis
     */
    private groupByMerchant(transactions: ParsedTransaction[]): Map<string, ParsedTransaction[]> {
        const groups = new Map<string, ParsedTransaction[]>()

        transactions.forEach(transaction => {
            const merchant = this.normalizeMerchantName(transaction.merchant || transaction.bank)
            if (!groups.has(merchant)) {
                groups.set(merchant, [])
            }
            groups.get(merchant)!.push(transaction)
        })

        // Sort each group by date
        for (const transactions of groups.values()) {
            transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }

        return groups
    }

    /**
     * Analyze pattern for a specific merchant
     */
    private analyzeMerchantPattern(merchant: string, transactions: ParsedTransaction[]): TransactionPattern | null {
        if (transactions.length < 3) return null

        const amounts = transactions.map(t => t.amount)
        const amountVariance = this.calculateAmountVariance(amounts)

        // Check for consistent amounts (low variance indicates recurring payment)
        if (amountVariance > 0.2) { // 20% variance threshold
            return null
        }

        const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length

        // Calculate intervals between transactions
        const intervals: number[] = []
        for (let i = 1; i < transactions.length; i++) {
            const current = new Date(transactions[i].date).getTime()
            const previous = new Date(transactions[i - 1].date).getTime()
            const daysDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24))
            intervals.push(daysDiff)
        }

        if (intervals.length === 0) return null

        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
        const intervalVariance = this.calculateAmountVariance(intervals)

        // Determine frequency based on average interval
        const frequency = this.determineFrequency(averageInterval, intervalVariance)

        // Calculate confidence based on pattern consistency
        const confidence = this.calculatePatternConfidence(intervals, amountVariance, frequency)

        if (confidence < 0.5) return null

        // Calculate next expected date
        const lastTransaction = transactions[transactions.length - 1]
        const nextExpectedDate = this.calculateNextDate(new Date(lastTransaction.date), frequency)

        return {
            id: this.generatePatternId(merchant, averageAmount),
            merchant,
            amount: averageAmount,
            frequency,
            confidence,
            occurrences: transactions.length,
            firstDate: new Date(transactions[0].date),
            lastDate: new Date(transactions[transactions.length - 1].date),
            nextExpectedDate,
            averageInterval,
            variance: intervalVariance
        }
    }

    /**
     * Generate subscription suggestions from patterns
     */
    private generateSubscriptions(patterns: TransactionPattern[], confidenceThreshold: number): DetectedSubscription[] {
        const subscriptions: DetectedSubscription[] = []

        for (const pattern of patterns) {
            if (pattern.confidence >= confidenceThreshold) {
                // Check if this merchant is known for subscriptions
                const merchantInfo = this.SUBSCRIPTION_MERCHANTS[
                    pattern.merchant.toLowerCase() as keyof typeof this.SUBSCRIPTION_MERCHANTS
                ]

                const category = merchantInfo?.category || this.inferCategory(pattern.merchant)
                const subscriptionFrequency = merchantInfo?.frequency === 'unknown' ? 'monthly' : (merchantInfo?.frequency || pattern.frequency)
                const finalFrequency = subscriptionFrequency === 'unknown' ? 'monthly' : subscriptionFrequency

                const subscription: DetectedSubscription = {
                    id: this.generateSubscriptionId(pattern),
                    name: this.generateSubscriptionName(pattern.merchant),
                    merchant: pattern.merchant,
                    amount: pattern.amount,
                    frequency: finalFrequency as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
                    nextBillingDate: pattern.nextExpectedDate || new Date(),
                    category,
                    isActive: true,
                    confidence: pattern.confidence,
                    sourceTransactions: [], // Will be populated with actual transaction IDs
                    createdAt: new Date(),
                    autoRenewal: true,
                    notes: this.generateSubscriptionNotes(pattern)
                }

                subscriptions.push(subscription)
                this.subscriptions.set(subscription.id, subscription)
            }
        }

        return subscriptions
    }

    /**
     * Generate suggestions based on patterns and subscriptions
     */
    private generateSuggestions(patterns: TransactionPattern[], subscriptions: DetectedSubscription[]): PatternSuggestion[] {
        const suggestions: PatternSuggestion[] = []

        // Suggest converting high-confidence patterns to subscriptions
        patterns.forEach(pattern => {
            if (pattern.confidence > 0.8 && !subscriptions.find(s => s.merchant === pattern.merchant)) {
                suggestions.push({
                    type: 'convert_to_subscription',
                    title: `Convert ${pattern.merchant} to subscription`,
                    description: `Detected ${pattern.occurrences} recurring payments to ${pattern.merchant} totaling ETB ${pattern.amount.toFixed(2)}. Consider converting to automatic subscription management.`,
                    priority: 'high',
                    actionRequired: true,
                    relatedPatternId: pattern.id
                })
            }
        })

        // Suggest reviewing low-confidence patterns
        patterns.filter(p => p.confidence < 0.6).forEach(pattern => {
            suggestions.push({
                type: 'review_pattern',
                title: `Review pattern for ${pattern.merchant}`,
                description: `Pattern detected with ${(pattern.confidence * 100).toFixed(1)}% confidence. Manual review recommended.`,
                priority: 'medium',
                actionRequired: true,
                relatedPatternId: pattern.id
            })
        })

        // Suggest checking for missing transactions
        patterns.filter(p => p.frequency === 'unknown').forEach(pattern => {
            suggestions.push({
                type: 'missing_transactions',
                title: `Missing transactions for ${pattern.merchant}`,
                description: `Pattern unclear - may be missing some transactions or have irregular frequency.`,
                priority: 'medium',
                actionRequired: false,
                relatedPatternId: pattern.id
            })
        })

        return suggestions
    }

    // Utility methods

    private normalizeMerchantName(merchant: string): string {
        return merchant.toLowerCase().trim()
    }

    private calculateAmountVariance(amounts: number[]): number {
        const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
        const squaredDiffs = amounts.map(amount => Math.pow(amount - mean, 2))
        const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / amounts.length
        return Math.sqrt(variance) / mean
    }

    private determineFrequency(averageInterval: number, variance: number): 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'unknown' {
        // Consider variance in frequency determination
        if (variance > 0.3) return 'unknown' // Too inconsistent

        if (averageInterval >= 6 && averageInterval <= 8) return 'weekly'
        if (averageInterval >= 27 && averageInterval <= 33) return 'monthly'
        if (averageInterval >= 85 && averageInterval <= 100) return 'quarterly'
        if (averageInterval >= 360 && averageInterval <= 380) return 'yearly'

        return 'unknown'
    }

    private calculatePatternConfidence(intervals: number[], amountVariance: number, frequency: string): number {
        let confidence = 1.0

        // Reduce confidence based on interval variance
        const intervalVariance = this.calculateAmountVariance(intervals)
        confidence -= intervalVariance * 0.3

        // Reduce confidence based on amount variance
        confidence -= amountVariance * 0.2

        // Reduce confidence for unknown frequency
        if (frequency === 'unknown') {
            confidence -= 0.3
        }

        // Ensure confidence is between 0 and 1
        return Math.max(0, Math.min(1, confidence))
    }

    private calculateNextDate(lastDate: Date, frequency: string): Date {
        const nextDate = new Date(lastDate)

        switch (frequency) {
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7)
                break
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1)
                break
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3)
                break
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1)
                break
            default:
                nextDate.setMonth(nextDate.getMonth() + 1) // Default to monthly
        }

        return nextDate
    }

    private calculateOverallConfidence(patterns: TransactionPattern[], subscriptions: DetectedSubscription[]): number {
        if (patterns.length === 0) return 0

        const patternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
        const subscriptionConfidence = subscriptions.reduce((sum, s) => sum + s.confidence, 0) / Math.max(1, subscriptions.length)

        return (patternConfidence + subscriptionConfidence) / 2
    }

    private generatePatternId(merchant: string, amount: number): string {
        return `pattern_${merchant.replace(/\s+/g, '_')}_${amount.toFixed(2)}`
    }

    private generateSubscriptionId(pattern: TransactionPattern): string {
        return `subscription_${pattern.id}`
    }

    private generateSubscriptionName(merchant: string): string {
        // Clean up merchant name for subscription display
        return merchant
            .replace(/\b(bank|cbe|telebirr)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    private inferCategory(merchant: string): string {
        const lowerMerchant = merchant.toLowerCase()

        for (const [key, info] of Object.entries(this.SUBSCRIPTION_MERCHANTS)) {
            if (lowerMerchant.includes(key)) {
                return info.category
            }
        }

        // Default categorization based on merchant characteristics
        if (/netflix|spotify|youtube|entertainment/i.test(merchant)) return 'Entertainment'
        if (/insurance/i.test(merchant)) return 'Insurance'
        if (/uber|feres|zay|transport/i.test(merchant)) return 'Transport'
        if (/telecom|phone|mobile/i.test(merchant)) return 'Bills'

        return 'Other'
    }

    private generateSubscriptionNotes(pattern: TransactionPattern): string {
        return `Auto-detected from ${pattern.occurrences} transactions. ` +
            `Average interval: ${pattern.averageInterval.toFixed(1)} days. ` +
            `Confidence: ${(pattern.confidence * 100).toFixed(1)}%.`
    }
}

/**
 * Transaction data interface for pattern analysis
 */
interface ParsedTransaction {
    id: string
    amount: number
    merchant?: string
    bank: string
    date: string
    type: 'expense' | 'income' | 'transfer'
    confidence: number
}

// Export singleton instance
export const patternDetector = new RecurringPatternDetector()

/**
 * Convenience function to analyze transactions for recurring patterns
 */
export function analyzeRecurringPatterns(
    transactions: ParsedTransaction[],
    options?: {
        minOccurrences?: number
        confidenceThreshold?: number
        lookbackDays?: number
    }
): PatternAnalysisResult {
    return patternDetector.analyzeTransactions(transactions, options)
}

/**
 * Get all detected patterns
 */
export function getDetectedPatterns(): TransactionPattern[] {
    return Array.from(patternDetector['patterns'].values())
}

/**
 * Get all subscriptions
 */
export function getDetectedSubscriptions(): DetectedSubscription[] {
    return Array.from(patternDetector['subscriptions'].values())
}

/**
 * Convert a pattern to a subscription
 */
export function convertPatternToSubscription(patternId: string): DetectedSubscription | null {
    const patterns = getDetectedPatterns()
    const pattern = patterns.find(p => p.id === patternId)

    if (!pattern) return null

    const subscriptions = getDetectedSubscriptions()
    return subscriptions.find(s => s.merchant === pattern.merchant) || null
}