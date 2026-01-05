/**
 * Enhanced voice processing types for Phase 1 implementation
 */

export interface EnhancedVoiceResult {
    success: boolean
    data?: EnhancedTransaction
    error?: string
    transcript?: string
    source: 'local' | 'gemini' | 'hasab_ai' | 'fallback'
    confidence: number
    processingTime: number
}

export interface EnhancedTransaction {
    type: TransactionType
    amount: number
    currency: string
    category: string
    title: string
    date: string
    paymentMethod?: PaymentMethod
    fromAccount?: string
    toAccount?: string
    dueDate?: string
    recurrence?: RecurrencePattern
    confidence: number
    merchant: MerchantInfo
    rawText: string
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'bill_payment' | 'recurring'

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer'

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface MerchantInfo {
    original: string
    normalized: string
    confidence: number
    alternatives: string[]
    categoryHint?: string
}

export interface ProcessingContext {
    userPlan: 'free' | 'premium'
    networkAvailable: boolean
    audioQuality: 'high' | 'medium' | 'low'
    languageDetected: 'amharic' | 'english' | 'mixed'
    processingTime: number
    confidenceThreshold: number
}

export interface RateLimitInfo {
    available: boolean
    remaining: number
    resetTime: Date
    limit: number
}

export interface APIHealthCheck {
    gemini: boolean
    hasabAi: boolean
    network: boolean
    localProcessing: boolean
}
