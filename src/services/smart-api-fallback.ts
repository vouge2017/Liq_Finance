/**
 * Smart API Fallback System
 * Handles intelligent fallback to external APIs when local processing fails or confidence is low
 */

import { EnhancedVoiceResult, ProcessingContext, EnhancedTransaction } from '../types/voice'

export class SmartApiFallback {
    private readonly CONFIDENCE_THRESHOLD = 0.7;
    private readonly API_TIMEOUT = 5000;

    async processWithFallback(
        audio: Blob,
        localResult: EnhancedVoiceResult,
        context: ProcessingContext
    ): Promise<EnhancedVoiceResult> {

        // If local processing succeeded with high confidence, use it
        if (localResult.success && localResult.confidence >= this.CONFIDENCE_THRESHOLD) {
            return localResult;
        }

        // Try external APIs in priority order
        const apis = [
            { name: 'gemini', processor: this.geminiProcessor },
            { name: 'hasab_ai', processor: this.hasabAiProcessor }
        ];

        for (const api of apis) {
            try {
                const result = await this.processWithApi(audio, api.processor, api.name, context);
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.warn(`API ${api.name} failed:`, error);
                continue;
            }
        }

        // Return original local result even if confidence was low
        return localResult;
    }

    private async processWithApi(
        audio: Blob,
        processor: { processVoice: (audio: Blob) => Promise<unknown> },
        apiName: string,
        context: ProcessingContext
    ): Promise<EnhancedVoiceResult> {

        const startTime = Date.now();

        try {
            // Check if API is available and user has access
            if (apiName === 'hasab_ai' && context.userPlan !== 'premium') {
                throw new Error('Hasab AI requires premium subscription');
            }

            // Process with API
            const result = await processor.processVoice(audio) as any;

            return {
                success: true,
                data: result as EnhancedTransaction,
                source: apiName as 'gemini' | 'hasab_ai',
                confidence: result.confidence || 0.8,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                source: 'fallback',
                confidence: 0,
                processingTime: Date.now() - startTime
            };
        }
    }

    // Placeholder for future Hasab AI integration
    private hasabAiProcessor = {
        processVoice: async (_audio: Blob): Promise<unknown> => {
            throw new Error('Hasab AI integration not yet implemented');
        }
    };

    // Gemini processor integration
    private geminiProcessor = {
        processVoice: async (_audio: Blob): Promise<unknown> => {
            // This would integrate with the existing resilient gemini service
            throw new Error('Gemini integration placeholder');
        }
    };
}

export class NetworkDetectionService {
    async isNetworkAvailable(): Promise<boolean> {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async checkAPIAvailability(apiUrl: string): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(apiUrl, {
                method: 'HEAD',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch {
            return false;
        }
    }
}

export class ResilientGeminiService {
    private retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff

    async processVoice(audio: Blob): Promise<unknown> {
        try {
            // 1. Check rate limits
            const rateLimit = await this.checkRateLimit();
            if (!rateLimit.available) {
                throw new Error('Rate limit exceeded');
            }

            // 2. Process with retry logic
            return await this.processWithRetry(audio);

        } catch (error) {
            console.error('Gemini API failed:', error);
            throw error;
        }
    }

    private async processWithRetry(audio: Blob, retries: number = 3): Promise<unknown> {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.processVoiceOnce(audio);
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
            }
        }
    }

    private async processVoiceOnce(_audio: Blob): Promise<unknown> {
        // Placeholder for actual Gemini API integration
        throw new Error('Gemini API integration not yet implemented');
    }

    private async checkRateLimit(): Promise<{ available: boolean }> {
        // Placeholder for rate limit checking
        return { available: true };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}