/**
 * Voice Processing Orchestrator
 * Main orchestrator that coordinates local processing with API fallbacks
 */

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
                error: error instanceof Error ? error.message : 'Voice processing failed',
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