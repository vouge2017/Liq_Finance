/**
 * Test suite for enhanced voice processing components
 */

import { EnhancedLocalProcessor } from '../enhanced-local-processor'
import { MerchantNormalizationService } from '../merchant-normalization'
import { VoiceProcessingOrchestrator } from '../voice-processing-orchestrator'

describe('Enhanced Voice Processing System', () => {
    let processor: EnhancedLocalProcessor
    let merchantService: MerchantNormalizationService
    let orchestrator: VoiceProcessingOrchestrator

    beforeEach(() => {
        processor = new EnhancedLocalProcessor()
        merchantService = new MerchantNormalizationService()
        orchestrator = new VoiceProcessingOrchestrator()
    })

    describe('Enhanced Local Processor', () => {
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

    describe('Merchant Normalization Service', () => {
        test('should normalize bank names', async () => {
            const result = await merchantService.normalizeMerchant('Awash')

            expect(result.normalized).toBe('Awash Bank')
            expect(result.confidence).toBe(1.0)
        })

        test('should handle fuzzy matching', async () => {
            const result = await merchantService.normalizeMerchant('Awash Bank Ethiopia')

            expect(result.normalized).toBe('Awash Bank')
            expect(result.confidence).toBeGreaterThan(0.7)
        })

        test('should return alternatives for unknown merchants', async () => {
            const result = await merchantService.normalizeMerchant('Unknown Store')

            expect(result.original).toBe('Unknown Store')
            expect(result.confidence).toBe(0.3)
            expect(result.alternatives).toHaveLength(3)
        })
    })

    describe('Voice Processing Orchestrator', () => {
        test('should use local processing for high confidence', async () => {
            const mockAudio = createMockAudio('Paid 150 birr for lunch')
            const context = {
                userPlan: 'free' as const,
                networkAvailable: false,
                audioQuality: 'high' as const,
                languageDetected: 'english' as const,
                processingTime: 0,
                confidenceThreshold: 0.7
            }

            const result = await orchestrator.processVoiceWithHybridFallback(mockAudio, context)

            expect(result.success).toBe(true)
            expect(result.source).toBe('local')
            expect(result.confidence).toBeGreaterThan(0.7)
        })

        test('should show processing source in results', async () => {
            const mockAudio = createMockAudio('Transfer 500 birr from CBE to Awash')
            const context = {
                userPlan: 'free' as const,
                networkAvailable: true,
                audioQuality: 'high' as const,
                languageDetected: 'english' as const,
                processingTime: 0,
                confidenceThreshold: 0.7
            }

            const result = await orchestrator.processVoiceWithHybridFallback(mockAudio, context)

            expect(result.success).toBe(true)
            expect(result.source).toBe('local') // Should use local for high confidence
            expect(result.data?.type).toBe('transfer')
        })
    })

    describe('Integration Tests', () => {
        test('should handle complete transaction flow', async () => {
            const mockAudio = createMockAudio('Transfer 1000 birr from CBE to Awash Bank using Telebirr')
            const context = {
                userPlan: 'free' as const,
                networkAvailable: true,
                audioQuality: 'high' as const,
                languageDetected: 'english' as const,
                processingTime: 0,
                confidenceThreshold: 0.7
            }

            const result = await orchestrator.processVoiceWithHybridFallback(mockAudio, context)

            expect(result.success).toBe(true)
            expect(result.data?.type).toBe('transfer')
            expect(result.data?.amount).toBe(1000)
            expect(result.data?.paymentMethod).toBe('mobile_money')
            expect(result.data?.merchant?.normalized).toBe('Awash Bank')
        })
    })
})

function createMockAudio(text: string): Blob {
    // Mock audio blob for testing
    return new Blob([text], { type: 'audio/wav' })
}