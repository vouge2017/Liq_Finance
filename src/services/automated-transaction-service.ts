/**
 * Automated Transaction Service - Main Integration Service
 * Combines SMS parsing, clipboard parsing, and pattern detection
 * to provide seamless automated transaction processing
 */

import { parseEnhancedSMS, EnhancedParsedSMS, validateParsedSMS } from '../lib/enhanced-sms-parser'
import {
    ClipboardParser,
    ClipboardParseResult,
    ClipboardParseOptions,
    parseClipboardContent,
    parseManualText
} from '../lib/clipboard-parser'
import {
    RecurringPatternDetector,
    analyzeRecurringPatterns,
    getDetectedPatterns,
    getDetectedSubscriptions,
    PatternAnalysisResult,
    TransactionPattern,
    DetectedSubscription
} from '../lib/recurring-pattern-detector'

export interface AutomatedTransactionOptions {
    platform: 'android' | 'ios' | 'web'
    autoProcess?: boolean
    allowClipboard?: boolean
    confidenceThreshold?: number
    enablePatterns?: boolean
    userConsent?: boolean
}

export interface TransactionProcessingResult {
    success: boolean
    transaction?: ProcessedTransaction
    error?: string
    confidence: number
    source: 'sms' | 'clipboard' | 'manual'
    processingTime: number
    requiresReview: boolean
}

export interface ProcessedTransaction {
    id: string
    amount: number
    bank: string
    merchant?: string
    type: 'expense' | 'income' | 'transfer'
    date: Date
    reference?: string
    balance?: number
    category: string
    isRecurring?: boolean
    subscriptionId?: string
    confidence: number
    rawData: any
}

export interface AutomationStatus {
    isEnabled: boolean
    platform: 'android' | 'ios' | 'web'
    smsPermission: 'granted' | 'denied' | 'not_requested'
    clipboardAccess: boolean
    patternDetection: boolean
    activeSubscriptions: number
    detectedPatterns: number
    lastProcessed?: Date
    totalProcessed: number
}

/**
 * Main Automated Transaction Service
 */
export class AutomatedTransactionService {
    private static instance: AutomatedTransactionService
    private clipboardParser: ClipboardParser
    private patternDetector: RecurringPatternDetector
    private isEnabled: boolean = false
    private platform: 'android' | 'ios' | 'web' = 'web'
    private userConsent: boolean = false
    private processingHistory: TransactionProcessingResult[] = []
    private readonly MAX_HISTORY = 100

    private constructor() {
        this.clipboardParser = ClipboardParser.getInstance()
        this.patternDetector = new RecurringPatternDetector()
        this.loadSettings()
    }

    public static getInstance(): AutomatedTransactionService {
        if (!AutomatedTransactionService.instance) {
            AutomatedTransactionService.instance = new AutomatedTransactionService()
        }
        return AutomatedTransactionService.instance
    }

    /**
     * Initialize the service with user preferences
     */
    async initialize(options: AutomatedTransactionOptions): Promise<AutomationStatus> {
        this.platform = options.platform
        this.isEnabled = options.autoProcess || false
        this.userConsent = options.userConsent || false

        const status: AutomationStatus = {
            isEnabled: this.isEnabled,
            platform: this.platform,
            smsPermission: await this.checkSMSPermission(),
            clipboardAccess: await this.checkClipboardAccess(),
            patternDetection: options.enablePatterns || false,
            activeSubscriptions: getDetectedSubscriptions().length,
            detectedPatterns: getDetectedPatterns().length,
            totalProcessed: this.processingHistory.length
        }

        if (this.platform === 'android' && !status.smsPermission) {
            await this.requestSMSPermission()
        }

        this.saveSettings()
        return status
    }

    /**
     * Process transaction from SMS (Android)
     */
    async processSMS(smsText: string): Promise<TransactionProcessingResult> {
        const startTime = performance.now()

        try {
            if (!this.userConsent) {
                throw new Error('User consent required for automated processing')
            }

            const parsed = parseEnhancedSMS(smsText)
            if (!parsed) {
                throw new Error('Could not parse SMS content')
            }

            const validation = validateParsedSMS(parsed)
            const processed = await this.processParsedTransaction(parsed, 'sms')

            const result: TransactionProcessingResult = {
                success: true,
                transaction: processed,
                confidence: parsed.confidence,
                source: 'sms',
                processingTime: performance.now() - startTime,
                requiresReview: parsed.confidence < (0.7) || !validation.isValid
            }

            this.addToHistory(result)
            return result

        } catch (error) {
            const result: TransactionProcessingResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                confidence: 0,
                source: 'sms',
                processingTime: performance.now() - startTime,
                requiresReview: true
            }

            this.addToHistory(result)
            return result
        }
    }

    /**
     * Process transaction from clipboard (iOS/Web)
     */
    async processClipboard(options?: ClipboardParseOptions): Promise<TransactionProcessingResult> {
        const startTime = performance.now()

        try {
            if (!this.userConsent) {
                throw new Error('User consent required for clipboard access')
            }

            const clipboardResult = await this.clipboardParser.parseFromClipboard({
                autoProcess: true,
                showPreview: true,
                allowManualEdit: true,
                confidenceThreshold: 0.6,
                ...options
            })

            if (!clipboardResult.parsed) {
                throw new Error('Could not parse clipboard content')
            }

            const processed = await this.processParsedTransaction(clipboardResult.parsed, 'clipboard')

            const result: TransactionProcessingResult = {
                success: true,
                transaction: processed,
                confidence: clipboardResult.confidence,
                source: 'clipboard',
                processingTime: performance.now() - startTime,
                requiresReview: clipboardResult.requiresReview
            }

            this.addToHistory(result)
            return result

        } catch (error) {
            const result: TransactionProcessingResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Clipboard access failed',
                confidence: 0,
                source: 'clipboard',
                processingTime: performance.now() - startTime,
                requiresReview: true
            }

            this.addToHistory(result)
            return result
        }
    }

    /**
     * Process manual text input
     */
    async processManualText(text: string, options?: ClipboardParseOptions): Promise<TransactionProcessingResult> {
        const startTime = performance.now()

        try {
            const manualResult = this.clipboardParser.parseText(text, {
                autoProcess: true,
                confidenceThreshold: 0.5,
                ...options
            })

            if (!manualResult.parsed) {
                throw new Error('Could not parse text content')
            }

            const processed = await this.processParsedTransaction(manualResult.parsed, 'manual')

            const result: TransactionProcessingResult = {
                success: true,
                transaction: processed,
                confidence: manualResult.confidence,
                source: 'manual',
                processingTime: performance.now() - startTime,
                requiresReview: manualResult.requiresReview
            }

            this.addToHistory(result)
            return result

        } catch (error) {
            const result: TransactionProcessingResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Manual processing failed',
                confidence: 0,
                source: 'manual',
                processingTime: performance.now() - startTime,
                requiresReview: true
            }

            this.addToHistory(result)
            return result
        }
    }

    /**
     * Analyze all transactions for recurring patterns
     */
    async analyzePatterns(options?: {
        minOccurrences?: number
        confidenceThreshold?: number
        lookbackDays?: number
    }): Promise<PatternAnalysisResult> {
        // Get all processed transactions
        const transactions = this.processingHistory
            .filter(r => r.success && r.transaction)
            .map(r => ({
                id: r.transaction!.id,
                amount: r.transaction!.amount,
                merchant: r.transaction!.merchant,
                bank: r.transaction!.bank,
                date: r.transaction!.date.toISOString(),
                type: r.transaction!.type,
                confidence: r.transaction!.confidence
            }))

        return analyzeRecurringPatterns(transactions, options)
    }

    /**
     * Convert detected pattern to subscription
     */
    async convertPatternToSubscription(patternId: string): Promise<DetectedSubscription | null> {
        const patterns = getDetectedPatterns()
        const pattern = patterns.find(p => p.id === patternId)

        if (!pattern) {
            throw new Error('Pattern not found')
        }

        // Implementation would integrate with the subscription management system
        // For now, return a mock subscription
        return {
            id: `subscription_${patternId}`,
            name: pattern.merchant,
            merchant: pattern.merchant,
            amount: pattern.amount,
            frequency: pattern.frequency === 'unknown' ? 'monthly' : pattern.frequency,
            nextBillingDate: pattern.nextExpectedDate || new Date(),
            category: this.inferCategory(pattern.merchant),
            isActive: true,
            confidence: pattern.confidence,
            sourceTransactions: [],
            createdAt: new Date(),
            autoRenewal: true
        }
    }

    /**
     * Get automation status
     */
    async getStatus(): Promise<AutomationStatus> {
        return {
            isEnabled: this.isEnabled,
            platform: this.platform,
            smsPermission: await this.checkSMSPermission(),
            clipboardAccess: await this.checkClipboardAccess(),
            patternDetection: true,
            activeSubscriptions: getDetectedSubscriptions().length,
            detectedPatterns: getDetectedPatterns().length,
            lastProcessed: this.processingHistory.length > 0 ?
                new Date(Math.max(...this.processingHistory.map(r => r.processingTime))) : undefined,
            totalProcessed: this.processingHistory.length
        }
    }

    /**
     * Enable/disable automation
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled
        this.saveSettings()
    }

    /**
     * Grant/revoke user consent
     */
    setUserConsent(granted: boolean): void {
        this.userConsent = granted
        this.saveSettings()
    }

    /**
     * Get processing statistics
     */
    getStatistics(): {
        totalProcessed: number
        successRate: number
        averageProcessingTime: number
        sourceBreakdown: Record<string, number>
        confidenceDistribution: { high: number; medium: number; low: number }
        topMerchants: { merchant: string; count: number }[]
    } {
        const results = this.processingHistory
        const successful = results.filter(r => r.success)

        const sourceBreakdown = results.reduce((acc, r) => {
            acc[r.source] = (acc[r.source] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const confidenceDistribution = {
            high: results.filter(r => r.confidence >= 0.8).length,
            medium: results.filter(r => r.confidence >= 0.5 && r.confidence < 0.8).length,
            low: results.filter(r => r.confidence < 0.5).length
        }

        const merchantCounts = results
            .filter(r => r.transaction?.merchant)
            .reduce((acc, r) => {
                const merchant = r.transaction!.merchant!
                acc[merchant] = (acc[merchant] || 0) + 1
                return acc
            }, {} as Record<string, number>)

        const topMerchants = Object.entries(merchantCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([merchant, count]) => ({ merchant, count }))

        return {
            totalProcessed: results.length,
            successRate: results.length > 0 ? (successful.length / results.length) * 100 : 0,
            averageProcessingTime: results.length > 0 ?
                results.reduce((sum, r) => sum + r.processingTime, 0) / results.length : 0,
            sourceBreakdown,
            confidenceDistribution,
            topMerchants
        }
    }

    /**
     * Clear processing history
     */
    clearHistory(): void {
        this.processingHistory = []
    }

    // Private helper methods

    private async processParsedTransaction(parsed: EnhancedParsedSMS, source: 'sms' | 'clipboard' | 'manual'): Promise<ProcessedTransaction> {
        const category = this.inferCategory(parsed.merchant || parsed.bank)

        return {
            id: this.generateTransactionId(),
            amount: parsed.amount,
            bank: parsed.bank,
            merchant: parsed.merchant,
            type: parsed.type,
            date: new Date(),
            reference: parsed.reference,
            balance: parsed.balance,
            category,
            confidence: parsed.confidence,
            rawData: parsed
        }
    }

    private inferCategory(merchant?: string): string {
        if (!merchant) return 'Other'

        const lowerMerchant = merchant.toLowerCase()

        // Ethiopian-specific categorization
        if (/netflix|spotify|youtube|dstv/i.test(lowerMerchant)) return 'Entertainment'
        if (/uber|feres|zay|taxi/i.test(lowerMerchant)) return 'Transport'
        if (/ethio.*telecom|safaricom|electric|water/i.test(lowerMerchant)) return 'Bills'
        if (/insurance/i.test(lowerMerchant)) return 'Insurance'
        if (/pharmacy|hospital|medical/i.test(lowerMerchant)) return 'Health'
        if (/restaurant|hotel|cafe|food/i.test(lowerMerchant)) return 'Food'
        if (/atm|withdrawal|cash/i.test(lowerMerchant)) return 'Cash'

        return 'Other'
    }

    private generateTransactionId(): string {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private addToHistory(result: TransactionProcessingResult): void {
        this.processingHistory.unshift(result)

        // Maintain history size limit
        if (this.processingHistory.length > this.MAX_HISTORY) {
            this.processingHistory = this.processingHistory.slice(0, this.MAX_HISTORY)
        }
    }

    private async checkSMSPermission(): Promise<'granted' | 'denied' | 'not_requested'> {
        if (this.platform !== 'android') return 'not_requested'

        // In a real implementation, this would check Android SMS permissions
        // For now, return a default status
        return 'not_requested'
    }

    private async requestSMSPermission(): Promise<boolean> {
        if (this.platform !== 'android') return false

        // In a real implementation, this would request Android SMS permissions
        // For now, return false to indicate permission not granted
        return false
    }

    private async checkClipboardAccess(): Promise<boolean> {
        try {
            if (!navigator.clipboard) return false
            await navigator.clipboard.readText()
            return true
        } catch {
            return false
        }
    }

    private loadSettings(): void {
        try {
            const settings = localStorage.getItem('automatedTransactionSettings')
            if (settings) {
                const parsed = JSON.parse(settings)
                this.isEnabled = parsed.isEnabled ?? false
                this.userConsent = parsed.userConsent ?? false
            }
        } catch (error) {
            console.warn('Failed to load automation settings:', error)
        }
    }

    private saveSettings(): void {
        try {
            const settings = {
                isEnabled: this.isEnabled,
                userConsent: this.userConsent,
                platform: this.platform
            }
            localStorage.setItem('automatedTransactionSettings', JSON.stringify(settings))
        } catch (error) {
            console.warn('Failed to save automation settings:', error)
        }
    }
}

// Export singleton instance
export const automatedTransactionService = AutomatedTransactionService.getInstance()

// Export convenience functions
export async function initializeAutomation(options: AutomatedTransactionOptions) {
    return automatedTransactionService.initialize(options)
}

export async function processSMS(smsText: string) {
    return automatedTransactionService.processSMS(smsText)
}

export async function processClipboard(options?: ClipboardParseOptions) {
    return automatedTransactionService.processClipboard(options)
}

export async function processManual(text: string, options?: ClipboardParseOptions) {
    return automatedTransactionService.processManualText(text, options)
}

export function getAutomationStatus() {
    return automatedTransactionService.getStatus()
}

export function setAutomationEnabled(enabled: boolean) {
    automatedTransactionService.setEnabled(enabled)
}

export function grantUserConsent(granted: boolean) {
    automatedTransactionService.setUserConsent(granted)
}