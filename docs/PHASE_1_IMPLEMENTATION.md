# Phase 1 Implementation: Enhanced Voice Processing

## Overview
This document provides detailed implementation specifications for Week 1 of the enhanced voice-activated transaction system.

## Day 1-2: Enhanced Local Processor

### File: `src/types/voice.ts`

```typescript
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
```

### File: `src/services/enhanced-local-processor.ts`

```typescript
import { EnhancedTransaction, TransactionType, PaymentMethod, MerchantInfo } from '../types/voice'
import { parseTranscript } from './local-voice-service'

export class EnhancedLocalProcessor {
    private readonly ETHIOPIAN_MERCHANTS = new Map<string, string>([
        // Banks
        ['cbe', 'Commercial Bank of Ethiopia'],
        ['commercial bank', 'Commercial Bank of Ethiopia'],
        ['የኢትዮጵያ ንግድ ባንክ', 'Commercial Bank of Ethiopia'],
        ['awash', 'Awash Bank'],
        ['awash bank', 'Awash Bank'],
        ['አዋሽ ባንክ', 'Awash Bank'],
        ['dashen', 'Dashen Bank'],
        ['dashen bank', 'Dashen Bank'],
        ['ዳሽን ባንክ', 'Dashen Bank'],
        ['wegagen', 'Wegagen Bank'],
        ['wegagen bank', 'Wegagen Bank'],
        ['ወገን ባንክ', 'Wegagen Bank'],
        
        // Mobile Money
        ['telebirr', 'Telebirr'],
        ['ቴሌ ብር', 'Telebirr'],
        ['m-pesa', 'M-Pesa'],
        ['mobile money', 'Mobile Money'],
        
        // Common Merchants
        ['walmart', 'Walmart'],
        ['mcdonalds', 'McDonald\'s'],
        ['starbucks', 'Starbucks'],
    ])

    async processVoice(audio: Blob): Promise<EnhancedTransaction> {
        const startTime = Date.now()
        
        try {
            // 1. Extract transcript using existing speech recognition
            const transcript = await this.extractTranscript(audio)
            
            // 2. Enhanced parsing with new patterns
            const enhancedResult = this.enhancedParse(transcript)
            
            // 3. Add transaction type detection
            enhancedResult.type = this.detectTransactionType(transcript)
            
            // 4. Add merchant normalization
            enhancedResult.merchant = await this.normalizeMerchant(transcript)
            
            // 5. Add payment method detection
            enhancedResult.paymentMethod = this.detectPaymentMethod(transcript)
            
            // 6. Calculate overall confidence
            enhancedResult.confidence = this.calculateConfidence(enhancedResult)
            
            // 7. Add processing metadata
            enhancedResult.rawText = transcript
            
            return enhancedResult
            
        } catch (error) {
            console.error('Enhanced local processing failed:', error)
            throw error
        }
    }

    private async extractTranscript(audio: Blob): Promise<string> {
        // Use existing speech recognition from local-voice-service
        // This would integrate with the existing processVoiceInput function
        throw new Error('Implementation needed - integrate with existing speech recognition')
    }

    private enhancedParse(transcript: string): EnhancedTransaction {
        // Extend existing parseTranscript function with enhanced patterns
        const baseResult = parseTranscript(transcript)
        
        return {
            ...baseResult,
            type: 'expense', // Will be overridden by detectTransactionType
            currency: 'ETB',
            paymentMethod: undefined,
            fromAccount: undefined,
            toAccount: undefined,
            dueDate: undefined,
            recurrence: undefined,
            merchant: {
                original: '',
                normalized: '',
                confidence: 0,
                alternatives: []
            },
            rawText: transcript
        }
    }

    detectTransactionType(text: string): TransactionType {
        const lowerText = text.toLowerCase()
        
        // Transfer detection patterns
        const transferPatterns = [
            /transfer\s*(?:from\s+)?(\w+)\s*(?:to\s+)?(\w+)\s*(?:birr|etb)?\s*(\d+)/i,
            /move\s*(?:from\s+)?(\w+)\s*(?:to\s+)?(\w+)\s*(?:birr|etb)?\s*(\d+)/i,
            /from\s+(\w+)\s+to\s+(\w+)\s+(\d+)\s*(?:birr|etb)?/i
        ]
        
        // Bill payment patterns
        const billPaymentPatterns = [
            /pay\s*(?:the\s+)?(\w+)\s*bill\s*(?:of\s+)?(\d+)\s*(?:birr|etb)?/i,
            /bill\s+payment\s+for\s+(\w+)\s*(?:birr|etb)?\s*(\d+)/i,
            /electricity\s+bill\s+(\d+)\s*(?:birr|etb)?/i,
            /water\s+bill\s+(\d+)\s*(?:birr|etb)?/i,
            /房租\s+(\d+)\s*(?:birr|etb)?/i
        ]
        
        // Recurring patterns
        const recurringPatterns = [
            /every\s+(\d+)(?:st|nd|rd|th)\s+(?:of\s+the\s+month)?/i,
            /monthly\s+(?:salary|payment)\s+(\d+)\s*(?:birr|etb)?/i,
            /weekly\s+(?:allowance|payment)\s+(\d+)\s*(?:birr|etb)?/i,
            /daily\s+(?:expense|payment)\s+(\d+)\s*(?:birr|etb)?/i
        ]

        // Check for transfer
        for (const pattern of transferPatterns) {
            if (pattern.test(lowerText)) {
                return 'transfer'
            }
        }

        // Check for bill payment
        for (const pattern of billPaymentPatterns) {
            if (pattern.test(lowerText)) {
                return 'bill_payment'
            }
        }

        // Check for recurring
        for (const pattern of recurringPatterns) {
            if (pattern.test(lowerText)) {
                return 'recurring'
            }
        }

        // Default to income/expense based on existing logic
        return baseResult.type as TransactionType
    }

    detectPaymentMethod(text: string): PaymentMethod | undefined {
        const lowerText = text.toLowerCase()
        
        const paymentPatterns = {
            cash: ['cash', 'በቆሻ', 'ካሽ', 'ብር', ' наличными'],
            card: ['card', 'visa', 'mastercard', 'debit', 'credit', 'ካርድ'],
            mobile_money: ['telebirr', 'm-pesa', 'mobile money', 'ሞባይል ብር', 'ቴሌ ብር'],
            bank_transfer: ['transfer', 'bank transfer', '汇款', 'ባንክ ሽያጭ']
        }

        for (const [method, patterns] of Object.entries(paymentPatterns)) {
            for (const pattern of patterns) {
                if (lowerText.includes(pattern)) {
                    return method as PaymentMethod
                }
            }
        }

        return undefined
    }

    async normalizeMerchant(input: string): Promise<MerchantInfo> {
        const lowerInput = input.toLowerCase()
        
        // Check exact match in database
        if (this.ETHIOPIAN_MERCHANTS.has(lowerInput)) {
            return {
                original: input,
                normalized: this.ETHIOPIAN_MERCHANTS.get(lowerInput)!,
                confidence: 1.0,
                alternatives: []
            }
        }

        // Fuzzy matching
        let bestMatch = ''
        let bestConfidence = 0

        for (const [key, value] of this.ETHIOPIAN_MERCHANTS.entries()) {
            const confidence = this.calculateSimilarity(lowerInput, key)
            if (confidence > bestConfidence && confidence > 0.7) {
                bestConfidence = confidence
                bestMatch = value
            }
        }

        if (bestMatch) {
            return {
                original: input,
                normalized: bestMatch,
                confidence: bestConfidence,
                alternatives: []
            }
        }

        // Return input as-is with low confidence
        return {
            original: input,
            normalized: input,
            confidence: 0.3,
            alternatives: Array.from(this.ETHIOPIAN_MERCHANTS.values()).slice(0, 3)
        }
    }

    private calculateSimilarity(input: string, target: string): number {
        // Simple similarity calculation
        const inputWords = input.split(/\s+/)
        const targetWords = target.split(/\s+/)
        
        let matches = 0
        for (const word of inputWords) {
            if (targetWords.some(t => t.includes(word) || word.includes(t))) {
                matches++
            }
        }
        
        return matches / Math.max(inputWords.length, targetWords.length)
    }

    private calculateConfidence(result: EnhancedTransaction): number {
        let confidence = result.confidence || 0.5
        
        // Boost confidence for detected payment methods
        if (result.paymentMethod) {
            confidence += 0.1
        }
        
        // Boost confidence for normalized merchants
        if (result.merchant.confidence > 0.8) {
            confidence += 0.1
        }
        
        // Boost confidence for specific transaction types
        if (result.type !== 'expense' && result.type !== 'income') {
            confidence += 0.1
        }
        
        return Math.min(1.0, confidence)
    }
}
```

### File: `src/services/merchant-normalization.ts`

```typescript
import { MerchantInfo } from '../types/voice'

export class MerchantNormalizationService {
    private merchantDatabase: Map<string, MerchantInfo>
    private userHistory: Map<string, string[]> // userId -> merchant history

    constructor() {
        this.merchantDatabase = new Map()
        this.userHistory = new Map()
        this.initializeMerchantDatabase()
    }

    private initializeMerchantDatabase() {
        // Ethiopian Banks
        this.addMerchant('cbe', {
            original: 'CBE',
            normalized: 'Commercial Bank of Ethiopia',
            confidence: 1.0,
            alternatives: ['Commercial Bank', 'የኢትዮጵያ ንግድ ባንክ'],
            categoryHint: 'bank'
        })

        this.addMerchant('awash', {
            original: 'Awash',
            normalized: 'Awash Bank',
            confidence: 1.0,
            alternatives: ['አዋሽ ባንክ'],
            categoryHint: 'bank'
        })

        this.addMerchant('dashen', {
            original: 'Dashen',
            normalized: 'Dashen Bank',
            confidence: 1.0,
            alternatives: ['ዳሽን ባንክ'],
            categoryHint: 'bank'
        })

        // Mobile Money
        this.addMerchant('telebirr', {
            original: 'Telebirr',
            normalized: 'Telebirr',
            confidence: 1.0,
            alternatives: ['ቴሌ ብር'],
            categoryHint: 'mobile_money'
        })

        this.addMerchant('m-pesa', {
            original: 'M-Pesa',
            normalized: 'M-Pesa',
            confidence: 1.0,
            alternatives: [],
            categoryHint: 'mobile_money'
        })
    }

    private addMerchant(key: string, merchant: MerchantInfo) {
        this.merchantDatabase.set(key.toLowerCase(), merchant)
    }

    async normalizeMerchant(input: string): Promise<MerchantInfo> {
        const lowerInput = input.toLowerCase()
        
        // 1. Check exact match
        if (this.merchantDatabase.has(lowerInput)) {
            return this.merchantDatabase.get(lowerInput)!
        }

        // 2. Check user history for personalized matching
        const userHistoryMatch = this.checkUserHistory(lowerInput)
        if (userHistoryMatch) {
            return userHistoryMatch
        }

        // 3. Fuzzy matching with similarity scoring
        const fuzzyMatch = this.fuzzyMatch(lowerInput)
        if (fuzzyMatch.confidence > 0.7) {
            return fuzzyMatch
        }

        // 4. Return input as-is with low confidence
        return {
            original: input,
            normalized: input,
            confidence: 0.3,
            alternatives: this.getTopAlternatives(lowerInput)
        }
    }

    private checkUserHistory(input: string): MerchantInfo | null {
        // Check if user has used this merchant before
        // This would integrate with user preference storage
        return null // Placeholder - would need user context
    }

    private fuzzyMatch(input: string): MerchantInfo {
        let bestMatch: MerchantInfo | null = null
        let bestScore = 0

        for (const merchant of this.merchantDatabase.values()) {
            const score = this.calculateMatchScore(input, merchant)
            if (score > bestScore) {
                bestScore = score
                bestMatch = merchant
            }
        }

        if (bestMatch && bestScore > 0.5) {
            return {
                ...bestMatch,
                confidence: bestScore
            }
        }

        return {
            original: input,
            normalized: input,
            confidence: 0.3,
            alternatives: []
        }
    }

    private calculateMatchScore(input: string, merchant: MerchantInfo): number {
        let score = 0
        
        // Check original name
        if (merchant.original.toLowerCase().includes(input) || 
            input.includes(merchant.original.toLowerCase())) {
            score += 0.5
        }
        
        // Check normalized name
        if (merchant.normalized.toLowerCase().includes(input) || 
            input.includes(merchant.normalized.toLowerCase())) {
            score += 0.4
        }
        
        // Check alternatives
        for (const alt of merchant.alternatives) {
            if (alt.toLowerCase().includes(input) || 
                input.includes(alt.toLowerCase())) {
                score += 0.3
            }
        }
        
        return Math.min(1.0, score)
    }

    private getTopAlternatives(input: string): string[] {
        const alternatives: string[] = []
        
        for (const merchant of this.merchantDatabase.values()) {
            if (alternatives.length >= 3) break
            
            const score = this.calculateMatchScore(input, merchant)
            if (score > 0.3) {
                alternatives.push(merchant.normalized)
            }
        }
        
        return alternatives
    }

    async learnFromUserHistory(userId: string, merchant: string): Promise<void> {
        if (!this.userHistory.has(userId)) {
            this.userHistory.set(userId, [])
        }
        
        const history = this.userHistory.get(userId)!
        if (!history.includes(merchant)) {
            history.push(merchant)
        }
    }
}
```

## Day 3-4: Smart API Orchestration

### File: `src/services/voice-processing-orchestrator.ts`

```typescript
import { EnhancedVoiceResult, ProcessingContext, APIHealthCheck } from '../types/voice'
import { EnhancedLocalProcessor } from './enhanced-local-processor'
import { NetworkDetectionService } from './network-detection'
import { ResilientGeminiService } from './resilient-gemini-service'

export class VoiceProcessingOrchestrator {
    private localProcessor: EnhancedLocalProcessor
    private networkDetector: NetworkDetectionService
    private geminiService: ResilientGeminiService

    constructor() {
        this.localProcessor = new EnhancedLocalProcessor()
        this.networkDetector = new NetworkDetectionService()
        this.geminiService = new ResilientGeminiService()
    }

    async processVoiceWithHybridFallback(
        audio: Blob,
        context: ProcessingContext
    ): Promise<EnhancedVoiceResult> {
        const startTime = Date.now()
        
        try {
            // Strategy 1: Enhanced local processing (always available)
            const localResult = await this.localProcessor.processVoice(audio)
            
            if (localResult.confidence > 0.8) {
                return {
                    success: true,
                    data: localResult,
                    source: 'local',
                    confidence: localResult.confidence,
                    processingTime: Date.now() - startTime
                }
            }

            // Strategy 2: Check network and user plan for API fallback
            const networkAvailable = await this.networkDetector.isNetworkAvailable()
            
            if (networkAvailable) {
                if (context.userPlan === 'premium') {
                    // Try premium API for best accuracy (placeholder for future Hasab AI)
                    try {
                        const premiumResult = await this.processWithPremiumAPI(audio)
                        if (premiumResult.confidence > localResult.confidence) {
                            return {
                                success: true,
                                data: premiumResult,
                                source: 'hasab_ai',
                                confidence: premiumResult.confidence,
                                processingTime: Date.now() - startTime
                            }
                        }
                    } catch (error) {
                        console.warn('Premium API failed, falling back to free API:', error)
                    }
                }
                
                // Try free API for free users or when premium fails
                try {
                    const geminiResult = await this.geminiService.processVoice(audio)
                    if (geminiResult.confidence > localResult.confidence) {
                        return {
                            success: true,
                            data: geminiResult,
                            source: 'gemini',
                            confidence: geminiResult.confidence,
                            processingTime: Date.now() - startTime
                        }
                    }
                } catch (error) {
                    console.warn('Gemini API failed, using enhanced local fallback:', error)
                }
            }

            // Strategy 3: Enhanced local fallback
            const fallbackResult = await this.enhancedLocalFallback(audio)
            return {
                success: true,
                data: fallbackResult,
                source: 'fallback',
                confidence: fallbackResult.confidence,
                processingTime: Date.now() - startTime
            }

        } catch (error) {
            return {
                success: false,
                error: error.message,
                source: 'local',
                confidence: 0,
                processingTime: Date.now() - startTime
            }
        }
    }

    private async processWithPremiumAPI(audio: Blob): Promise<any> {
        // Placeholder for future Hasab AI integration
        throw new Error('Premium API not yet implemented')
    }

    private async enhancedLocalFallback(audio: Blob): Promise<any> {
        // Enhanced fallback processing
        // Could include retry logic, different parsing strategies, etc.
        return await this.localProcessor.processVoice(audio)
    }

    async checkAPIHealth(): Promise<APIHealthCheck> {
        const health: APIHealthCheck = {
            gemini: false,
            hasabAi: false,
            network: false,
            localProcessing: false
        }

        try {
            health.network = await this.networkDetector.isNetworkAvailable()
            health.localProcessing = true // Local processing is always available
            
            if (health.network) {
                health.gemini = await this.geminiService.checkAvailability()
                // health.hasabAi = await this.checkHasabAIHealth() // Future
            }
        } catch (error) {
            console.error('API health check failed:', error)
        }

        return health
    }
}
```

## Day 5: Integration & Testing

### File: `src/services/__tests__/enhanced-local-processor.test.ts`

```typescript
import { EnhancedLocalProcessor } from '../enhanced-local-processor'

describe('Enhanced Local Processor', () => {
    let processor: EnhancedLocalProcessor

    beforeEach(() => {
        processor = new EnhancedLocalProcessor()
    })

    test('should detect transfer transactions', async () => {
        const mockAudio = createMockAudio('Transfer 500 birr from CBE to Awash')
        const result = await processor.processVoice(mockAudio)
        
        expect(result.type).toBe('transfer')
        expect(result.amount).toBe(500)
        expect(result.fromAccount).toBe('CBE')
        expect(result.toAccount).toBe('Awash Bank')
    })

    test('should detect bill payments', async () => {
        const mockAudio = createMockAudio('Pay electricity bill 1200 birr')
        const result = await processor.processVoice(mockAudio)
        
        expect(result.type).toBe('bill_payment')
        expect(result.amount).toBe(1200)
        expect(result.category).toBe('Utilities')
    })

    test('should normalize Ethiopian merchants', async () => {
        const mockAudio = createMockAudio('Paid 150 birr at Awash')
        const result = await processor.processVoice(mockAudio)
        
        expect(result.merchant.normalized).toBe('Awash Bank')
        expect(result.merchant.confidence).toBeGreaterThan(0.8)
    })

    test('should detect payment methods', async () => {
        const mockAudio = createMockAudio('Paid 150 birr with Telebirr')
        const result = await processor.processVoice(mockAudio)
        
        expect(result.paymentMethod).toBe('mobile_money')
    })

    test('should handle Amharic transactions', async () => {
        const mockAudio = createMockAudio('ከፈልኩ 150 ብር ለምግብ')
        const result = await processor.processVoice(mockAudio)
        
        expect(result.type).toBe('expense')
        expect(result.amount).toBe(150)
        expect(result.category).toBe('Food')
    })
})

function createMockAudio(text: string): Blob {
    // Mock audio blob for testing
    return new Blob([text], { type: 'audio/wav' })
}
```

## Integration Points

### Update Existing Files

1. **Enhance `src/services/local-voice-service.ts`**:
   - Import new types and classes
   - Update existing functions to use enhanced processing
   - Maintain backward compatibility

2. **Update `src/features/voice/VoiceRecordingModal.tsx`**:
   - Integrate with new orchestrator
   - Display enhanced transaction details
   - Show processing source and confidence

3. **Add new service files**:
   - `src/services/enhanced-local-processor.ts`
   - `src/services/merchant-normalization.ts`
   - `src/services/voice-processing-orchestrator.ts`
   - `src/services/network-detection.ts`
   - `src/services/resilient-gemini-service.ts`

## Success Criteria for Week 1

- ✅ **20% improvement** in parsing accuracy
- ✅ **Transaction type detection** for transfers, bill payments, recurring
- ✅ **Merchant normalization** for Ethiopian banks and common merchants
- ✅ **Payment method detection** (cash, card, mobile money)
- ✅ **Smart API fallback** with local-first approach
- ✅ **Enhanced confidence scoring** with multiple factors
- ✅ **Comprehensive testing** across different transaction types

## Next Steps

After Week 1 implementation:
1. Test thoroughly with real voice inputs
2. Gather user feedback on accuracy improvements
3. Prepare for Week 2: API integration and reliability improvements
4. Plan premium API integration for future phases