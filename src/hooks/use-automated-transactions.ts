/**
 * React Hook for Automated Transaction Processing
 * Provides easy integration with existing Liq Finance components
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    automatedTransactionService,
    initializeAutomation,
    processSMS,
    processClipboard,
    processManual,
    getAutomationStatus,
    setAutomationEnabled,
    grantUserConsent,
    AutomatedTransactionOptions,
    TransactionProcessingResult,
    AutomationStatus
} from '../services/automated-transaction-service'
import { PatternAnalysisResult, DetectedSubscription, TransactionPattern } from '../lib/recurring-pattern-detector'
import { useToast } from './use-toast'

export interface UseAutomatedTransactionsOptions {
    autoInitialize?: boolean
    platform: 'android' | 'ios' | 'web'
    enablePatterns?: boolean
}

export interface UseAutomatedTransactionsReturn {
    // Status
    status: AutomationStatus | null
    isInitialized: boolean
    isProcessing: boolean

    // Actions
    initialize: (options?: AutomatedTransactionOptions) => Promise<void>
    processTransaction: (source: 'sms' | 'clipboard' | 'manual', data: string) => Promise<TransactionProcessingResult>
    enableAutomation: (enabled: boolean) => void
    grantConsent: (granted: boolean) => void

    // Results
    lastResult: TransactionProcessingResult | null
    processingHistory: TransactionProcessingResult[]

    // Pattern Detection
    patterns: TransactionPattern[]
    subscriptions: DetectedSubscription[]
    patternAnalysis: PatternAnalysisResult | null
    analyzePatterns: () => Promise<void>
    convertPatternToSubscription: (patternId: string) => Promise<DetectedSubscription | null>

    // Statistics
    statistics: ReturnType<typeof automatedTransactionService.getStatistics> | null

    // Error handling
    error: string | null
    clearError: () => void
}

/**
 * Main hook for automated transaction processing
 */
export function useAutomatedTransactions(options: UseAutomatedTransactionsOptions): UseAutomatedTransactionsReturn {
    const [status, setStatus] = useState<AutomationStatus | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [lastResult, setLastResult] = useState<TransactionProcessingResult | null>(null)
    const [processingHistory, setProcessingHistory] = useState<TransactionProcessingResult[]>([])
    const [patterns, setPatterns] = useState<TransactionPattern[]>([])
    const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>([])
    const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysisResult | null>(null)
    const [statistics, setStatistics] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const { toast } = useToast()
    const initializedRef = useRef(false)

    // Auto-initialize if requested
    useEffect(() => {
        if (options.autoInitialize && !initializedRef.current) {
            initialize()
            initializedRef.current = true
        }
    }, [options.autoInitialize])

    // Initialize automation service
    const initialize = useCallback(async (initOptions?: AutomatedTransactionOptions) => {
        try {
            setError(null)
            setIsProcessing(true)

            const automationOptions: AutomatedTransactionOptions = {
                platform: options.platform,
                autoProcess: false,
                allowClipboard: true,
                confidenceThreshold: 0.7,
                enablePatterns: options.enablePatterns,
                userConsent: false,
                ...initOptions
            }

            const newStatus = await initializeAutomation(automationOptions)
            setStatus(newStatus)
            setIsInitialized(true)

            // Load existing data
            await refreshData()

            toast({
                title: "Automation Initialized",
                description: `Ready for ${options.platform} platform with ${newStatus.detectedPatterns} patterns detected.`,
            })

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize automation'
            setError(errorMessage)
            toast({
                title: "Initialization Failed",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }, [options.platform, options.enablePatterns, toast])

    // Process transaction from various sources
    const processTransaction = useCallback(async (
        source: 'sms' | 'clipboard' | 'manual',
        data: string
    ): Promise<TransactionProcessingResult> => {
        try {
            setError(null)
            setIsProcessing(true)

            let result: TransactionProcessingResult

            switch (source) {
                case 'sms':
                    result = await processSMS(data)
                    break
                case 'clipboard':
                    result = await processClipboard()
                    break
                case 'manual':
                    result = await processManual(data)
                    break
                default:
                    throw new Error(`Unsupported source: ${source}`)
            }

            setLastResult(result)
            setProcessingHistory(prev => [result, ...prev.slice(0, 49)]) // Keep last 50 results

            // Refresh data after successful processing
            if (result.success) {
                await refreshData()
            }

            // Show toast notification
            if (result.success) {
                toast({
                    title: "Transaction Processed",
                    description: `${source} transaction processed with ${(result.confidence * 100).toFixed(1)}% confidence`,
                    variant: result.requiresReview ? "default" : "default"
                })
            } else {
                toast({
                    title: "Processing Failed",
                    description: result.error || 'Unknown error occurred',
                    variant: "destructive"
                })
            }

            return result

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Processing failed'
            setError(errorMessage)

            const failedResult: TransactionProcessingResult = {
                success: false,
                error: errorMessage,
                confidence: 0,
                source,
                processingTime: 0,
                requiresReview: true
            }

            setLastResult(failedResult)

            toast({
                title: "Processing Error",
                description: errorMessage,
                variant: "destructive"
            })

            return failedResult
        } finally {
            setIsProcessing(false)
        }
    }, [toast])

    // Enable/disable automation
    const enableAutomation = useCallback((enabled: boolean) => {
        try {
            setAutomationEnabled(enabled)
            if (status) {
                setStatus({ ...status, isEnabled: enabled })
            }

            toast({
                title: enabled ? "Automation Enabled" : "Automation Disabled",
                description: enabled ?
                    "Automatic transaction processing is now active" :
                    "Automatic transaction processing is now disabled"
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle automation'
            setError(errorMessage)
            toast({
                title: "Toggle Failed",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }, [status, toast])

    // Grant/revoke user consent
    const grantConsent = useCallback((granted: boolean) => {
        try {
            grantUserConsent(granted)
            if (status) {
                setStatus({ ...status, smsPermission: granted ? 'granted' : 'denied' })
            }

            toast({
                title: granted ? "Consent Granted" : "Consent Revoked",
                description: granted ?
                    "You can now use automated transaction processing" :
                    "Automated processing has been disabled"
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update consent'
            setError(errorMessage)
            toast({
                title: "Consent Update Failed",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }, [status, toast])

    // Analyze patterns
    const analyzePatterns = useCallback(async () => {
        try {
            setIsProcessing(true)
            const analysis = await automatedTransactionService.analyzePatterns()
            setPatternAnalysis(analysis)
            setPatterns(analysis.patterns)
            setSubscriptions(analysis.subscriptions)

            toast({
                title: "Pattern Analysis Complete",
                description: `Found ${analysis.patterns.length} patterns and ${analysis.subscriptions.length} subscriptions`,
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Pattern analysis failed'
            setError(errorMessage)
            toast({
                title: "Analysis Failed",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }, [toast])

    // Convert pattern to subscription
    const convertPatternToSubscription = useCallback(async (patternId: string): Promise<DetectedSubscription | null> => {
        try {
            const subscription = await automatedTransactionService.convertPatternToSubscription(patternId)
            if (subscription) {
                setSubscriptions(prev => [...prev, subscription])
                toast({
                    title: "Subscription Created",
                    description: `${subscription.name} subscription has been created`,
                })
            }
            return subscription
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to convert pattern'
            setError(errorMessage)
            toast({
                title: "Conversion Failed",
                description: errorMessage,
                variant: "destructive"
            })
            return null
        }
    }, [toast])

    // Refresh all data
    const refreshData = useCallback(async () => {
        try {
            const currentStatus = await getAutomationStatus()
            setStatus(currentStatus)
            setStatistics(automatedTransactionService.getStatistics())
        } catch (err) {
            console.warn('Failed to refresh data:', err)
        }
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        // Status
        status,
        isInitialized,
        isProcessing,

        // Actions
        initialize,
        processTransaction,
        enableAutomation,
        grantConsent,

        // Results
        lastResult,
        processingHistory,

        // Pattern Detection
        patterns,
        subscriptions,
        patternAnalysis,
        analyzePatterns,
        convertPatternToSubscription,

        // Statistics
        statistics,

        // Error handling
        error,
        clearError
    }
}

/**
 * Hook for quick SMS processing (Android specific)
 */
export function useSMSProcessing() {
    const automation = useAutomatedTransactions({ platform: 'android', autoInitialize: true })

    const processSMS = useCallback(async (smsText: string) => {
        return automation.processTransaction('sms', smsText)
    }, [automation.processTransaction])

    return {
        ...automation,
        processSMS
    }
}

/**
 * Hook for clipboard processing (iOS/Web specific)
 */
export function useClipboardProcessing() {
    const automation = useAutomatedTransactions({ platform: 'ios', autoInitialize: true })

    const processClipboard = useCallback(async () => {
        return automation.processTransaction('clipboard', '')
    }, [automation.processTransaction])

    return {
        ...automation,
        processClipboard
    }
}

/**
 * Hook for manual text processing (all platforms)
 */
export function useManualProcessing() {
    const automation = useAutomatedTransactions({ platform: 'web', autoInitialize: true })

    const processText = useCallback(async (text: string) => {
        return automation.processTransaction('manual', text)
    }, [automation.processTransaction])

    return {
        ...automation,
        processText
    }
}

/**
 * Hook for pattern detection and subscription management
 */
export function usePatternDetection() {
    const automation = useAutomatedTransactions({
        platform: 'web',
        autoInitialize: true,
        enablePatterns: true
    })

    return {
        patterns: automation.patterns,
        subscriptions: automation.subscriptions,
        patternAnalysis: automation.patternAnalysis,
        analyzePatterns: automation.analyzePatterns,
        convertPatternToSubscription: automation.convertPatternToSubscription,
        isProcessing: automation.isProcessing
    }
}