/**
 * Enhanced Error Handling System
 * Provides robust error recovery, retry mechanisms, and user-friendly fallbacks
 */

export interface ErrorContext {
    errorType: 'network' | 'processing' | 'recognition' | 'validation' | 'unknown'
    errorCode?: string
    errorMessage: string
    retryCount: number
    maxRetries: number
    timestamp: Date
    userAction?: string
    systemState?: any
}

export interface RecoveryStrategy {
    name: string
    description: string
    priority: number
    execute: (context: ErrorContext) => Promise<RecoveryResult>
}

export interface RecoveryResult {
    success: boolean
    message: string
    action: 'retry' | 'fallback' | 'manual' | 'abort'
    data?: any
    nextAction?: string
}

export class EnhancedErrorHandling {
    private retryDelays = [1000, 2000, 4000, 8000] // Exponential backoff
    private recoveryStrategies: RecoveryStrategy[] = []

    constructor() {
        this.initializeRecoveryStrategies()
    }

    private initializeRecoveryStrategies() {
        this.recoveryStrategies = [
            {
                name: 'network_retry',
                description: 'Retry with exponential backoff',
                priority: 1,
                execute: async (context: ErrorContext) => {
                    if (context.retryCount < context.maxRetries) {
                        const delay = this.retryDelays[Math.min(context.retryCount, this.retryDelays.length - 1)]
                        await this.delay(delay)

                        return {
                            success: true,
                            message: `Retrying in ${delay}ms...`,
                            action: 'retry',
                            data: { retryCount: context.retryCount + 1 }
                        }
                    }
                    return {
                        success: false,
                        message: 'Max retries exceeded',
                        action: 'fallback'
                    }
                }
            },
            {
                name: 'local_fallback',
                description: 'Switch to local processing',
                priority: 2,
                execute: async (context: ErrorContext) => {
                    return {
                        success: true,
                        message: 'Switching to local processing mode',
                        action: 'fallback',
                        data: { processingMode: 'local' }
                    }
                }
            },
            {
                name: 'simplified_processing',
                description: 'Use simplified parsing rules',
                priority: 3,
                execute: async (context: ErrorContext) => {
                    return {
                        success: true,
                        message: 'Using simplified processing rules',
                        action: 'fallback',
                        data: { processingMode: 'simplified' }
                    }
                }
            },
            {
                name: 'manual_entry',
                description: 'Prompt user for manual entry',
                priority: 4,
                execute: async (context: ErrorContext) => {
                    return {
                        success: true,
                        message: 'Please enter your transaction manually',
                        action: 'manual',
                        data: {
                            suggestedText: this.generateSuggestion(context),
                            format: this.getFormatForError(context.errorType)
                        }
                    }
                }
            }
        ]
    }

    async handleVoiceError(error: any, context: Partial<ErrorContext> = {}): Promise<RecoveryResult> {
        const errorContext: ErrorContext = {
            errorType: this.classifyError(error),
            errorCode: error.code || error.name,
            errorMessage: error.message || 'Unknown error occurred',
            retryCount: context.retryCount || 0,
            maxRetries: context.maxRetries || 3,
            timestamp: new Date(),
            userAction: context.userAction,
            systemState: context.systemState
        }

        console.error('Voice processing error:', errorContext)

        // Sort strategies by priority
        const sortedStrategies = this.recoveryStrategies
            .sort((a, b) => a.priority - b.priority)

        // Try each strategy in priority order
        for (const strategy of sortedStrategies) {
            try {
                const result = await strategy.execute(errorContext)
                if (result.success) {
                    return result
                }
            } catch (strategyError) {
                console.warn(`Recovery strategy ${strategy.name} failed:`, strategyError)
                continue
            }
        }

        // If all strategies fail
        return {
            success: false,
            message: 'Unable to recover from error. Please try again later.',
            action: 'abort'
        }
    }

    private classifyError(error: any): ErrorContext['errorType'] {
        const message = error.message?.toLowerCase() || ''
        const name = error.name?.toLowerCase() || ''

        if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
            return 'network'
        }
        if (message.includes('processing') || message.includes('parse') || name.includes('processing')) {
            return 'processing'
        }
        if (message.includes('recognition') || message.includes('speech') || name.includes('recognition')) {
            return 'recognition'
        }
        if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
            return 'validation'
        }

        return 'unknown'
    }

    private generateSuggestion(context: ErrorContext): string {
        switch (context.errorType) {
            case 'network':
                return 'Network connection issue detected. Please check your internet connection and try again.'
            case 'processing':
                return 'Processing error occurred. Please speak clearly and try again.'
            case 'recognition':
                return 'Speech recognition failed. Please ensure your microphone is working and try again.'
            case 'validation':
                return 'Input validation failed. Please provide a clear transaction description.'
            default:
                return 'An error occurred. Please try again or enter manually.'
        }
    }

    private getFormatForError(errorType: ErrorContext['errorType']): string {
        switch (errorType) {
            case 'network':
                return 'Format: "Paid [amount] [currency] for [description]"'
            case 'processing':
                return 'Format: "Type [income/expense] amount currency merchant"'
            case 'recognition':
                return 'Format: "I spent/paid/received [amount] for [description]"'
            case 'validation':
                return 'Format: "Type amount currency description"'
            default:
                return 'Format: "Type amount currency description"'
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // Enhanced error messages for users
    getErrorMessage(context: ErrorContext): string {
        const baseMessage = this.generateSuggestion(context)

        switch (context.errorType) {
            case 'network':
                return `${baseMessage} You can continue using the app offline with local processing.`
            case 'processing':
                return `${baseMessage} The system will try to process your input with simplified rules.`
            case 'recognition':
                return `${baseMessage} Try speaking more clearly or use the manual entry option.`
            case 'validation':
                return `${baseMessage} Make sure to include amount, currency, and description.`
            default:
                return baseMessage
        }
    }

    // User-friendly recovery suggestions
    getRecoverySuggestions(context: ErrorContext): string[] {
        const suggestions: string[] = []

        switch (context.errorType) {
            case 'network':
                suggestions.push('Check your internet connection')
                suggestions.push('Try again in a few moments')
                suggestions.push('Use offline mode with local processing')
                break
            case 'processing':
                suggestions.push('Speak more clearly and slowly')
                suggestions.push('Use simpler transaction descriptions')
                suggestions.push('Try breaking complex transactions into simpler ones')
                break
            case 'recognition':
                suggestions.push('Ensure your microphone is working')
                suggestions.push('Reduce background noise')
                suggestions.push('Speak at a consistent volume')
                suggestions.push('Try using the manual entry option')
                break
            case 'validation':
                suggestions.push('Include all required information')
                suggestions.push('Use standard currency formats')
                suggestions.push('Provide clear merchant names')
                break
        }

        suggestions.push('Contact support if the problem persists')
        return suggestions
    }
}

/**
 * Retry Manager
 * Handles automatic retry logic with exponential backoff
 */
export class RetryManager {
    private maxRetries: number
    private baseDelay: number
    private maxDelay: number

    constructor(maxRetries = 3, baseDelay = 1000, maxDelay = 8000) {
        this.maxRetries = maxRetries
        this.baseDelay = baseDelay
        this.maxDelay = maxDelay
    }

    async executeWithRetry<T>(
        operation: () => Promise<T>,
        shouldRetry: (error: any) => boolean = () => true
    ): Promise<T> {
        let lastError: any

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await operation()
                return result
            } catch (error) {
                lastError = error

                if (!shouldRetry(error) || attempt === this.maxRetries) {
                    throw error
                }

                const delay = Math.min(
                    this.baseDelay * Math.pow(2, attempt),
                    this.maxDelay
                )

                console.log(`Retry attempt ${attempt + 1}/${this.maxRetries + 1}, waiting ${delay}ms`)
                await this.delay(delay)
            }
        }

        throw lastError
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

/**
 * Graceful Degradation Manager
 * Manages fallback to alternative input methods
 */
export class GracefulDegradationManager {
    private currentMode: 'voice' | 'text' | 'manual' = 'voice'
    private degradationLevel: number = 0

    handleDegradation(errorContext: ErrorContext): { mode: string, message: string, options: string[] } {
        this.degradationLevel++

        if (this.degradationLevel === 1) {
            this.currentMode = 'text'
            return {
                mode: 'text',
                message: 'Voice recognition temporarily unavailable. Please type your transaction.',
                options: ['Use text input', 'Try voice again', 'Manual entry']
            }
        } else if (this.degradationLevel === 2) {
            this.currentMode = 'manual'
            return {
                mode: 'manual',
                message: 'Advanced input methods unavailable. Please use manual entry.',
                options: ['Manual entry', 'Try again later', 'Contact support']
            }
        }

        return {
            mode: this.currentMode,
            message: 'System operating in degraded mode.',
            options: ['Continue', 'Restart app', 'Contact support']
        }
    }

    resetDegradation(): void {
        this.degradationLevel = 0
        this.currentMode = 'voice'
    }

    getCurrentMode(): string {
        return this.currentMode
    }
}