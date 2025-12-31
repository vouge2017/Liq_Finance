/**
 * Enhanced Local Voice Processor
 * Handles transaction type detection, merchant normalization, and payment method detection
 */

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
        ['abysinia', 'Abysinia Bank'],
        ['abysinia bank', 'Abysinia Bank'],
        ['አቢሲኒያ ባንክ', 'Abysinia Bank'],
        ['oromia', 'Oromia Bank'],
        ['oromia bank', 'Oromia Bank'],
        ['ኦሮሚያ ባንክ', 'Oromia Bank'],

        // Mobile Money
        ['telebirr', 'Telebirr'],
        ['ቴሌ ብር', 'Telebirr'],
        ['m-pesa', 'M-Pesa'],
        ['mobile money', 'Mobile Money'],

        // Common Merchants
        ['walmart', 'Walmart'],
        ['mcdonalds', 'McDonald\'s'],
        ['starbucks', 'Starbucks'],
        ['ethiotelecom', 'Ethio Telecom'],
        ['ኢትዮ ቴሌኮም', 'Ethio Telecom'],
        ['telecom', 'Ethio Telecom'],
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
        // For now, we'll use the existing parseTranscript function
        // In a real implementation, this would use the browser's SpeechRecognition API

        // Convert audio to text using existing functionality
        // This is a placeholder - would need proper audio-to-text implementation
        return "Sample transcript from audio processing"
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
            /from\s+(\w+)\s+to\s+(\w+)\s+(\d+)\s*(?:birr|etb)?/i,
            /sent\s*(\d+)\s*(?:birr|etb)?\s*(?:to\s+)?(\w+)/i,
            /ከፈልኩ\s*(\d+)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(\w+)/i
        ]

        // Bill payment patterns
        const billPaymentPatterns = [
            /pay\s*(?:the\s+)?(\w+)\s*bill\s*(?:of\s+)?(\d+)\s*(?:birr|etb)?/i,
            /bill\s+payment\s+for\s+(\w+)\s*(?:birr|etb)?\s*(\d+)/i,
            /electricity\s+bill\s+(\d+)\s*(?:birr|etb)?/i,
            /water\s+bill\s+(\d+)\s*(?:birr|etb)?/i,
            /房租\s+(\d+)\s*(?:birr|etb)?/i,
            /ክፍያ\s+(\d+)\s*(?:ብር|birr|etb)?/i,
            /ከፈልኩ\s*(\d+)\s*(?:ብር|birr|etb)?\s*(?:ለ\s*)?(\w+)\s*ክፍያ/i
        ]

        // Recurring patterns
        const recurringPatterns = [
            /every\s+(\d+)(?:st|nd|rd|th)\s+(?:of\s+the\s+month)?/i,
            /monthly\s+(?:salary|payment)\s+(\d+)\s*(?:birr|etb)?/i,
            /weekly\s+(?:allowance|payment)\s+(\d+)\s*(?:birr|etb)?/i,
            /daily\s+(?:expense|payment)\s+(\d+)\s*(?:birr|etb)?/i,
            /የወር\s+(\d+)\s*(?:ብር|birr|etb)?/i,
            /የሳምንት\s+(\d+)\s*(?:ብር|birr|etb)?/i
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
        const baseResult = parseTranscript(text)
        return baseResult.type as TransactionType
    }

    detectPaymentMethod(text: string): PaymentMethod | undefined {
        const lowerText = text.toLowerCase()

        const paymentPatterns = {
            cash: ['cash', 'በቆሻ', 'ካሽ', 'ብር', 'ንግድ', 'ካሽ ገንዘብ'],
            card: ['card', 'visa', 'mastercard', 'debit', 'credit', 'ካርድ', 'visa ካርድ', 'master ካርድ'],
            mobile_money: ['telebirr', 'm-pesa', 'mobile money', 'ሞባይል ብር', 'ቴሌ ብር', 'ሞባይል ገንዘብ'],
            bank_transfer: ['transfer', 'bank transfer', '汇款', 'ባንክ ሽያጭ', 'ባንክ ከፈል', 'ባንክ ከፈያ']
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