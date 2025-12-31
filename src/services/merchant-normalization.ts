/**
 * Merchant Normalization Service
 * Handles smart merchant name matching and categorization for Ethiopian context
 */

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

        this.addMerchant('wegagen', {
            original: 'Wegagen',
            normalized: 'Wegagen Bank',
            confidence: 1.0,
            alternatives: ['ወገን ባንክ'],
            categoryHint: 'bank'
        })

        this.addMerchant('abysinia', {
            original: 'Abysinia',
            normalized: 'Abysinia Bank',
            confidence: 1.0,
            alternatives: ['አቢሲኒያ ባንክ'],
            categoryHint: 'bank'
        })

        this.addMerchant('oromia', {
            original: 'Oromia',
            normalized: 'Oromia Bank',
            confidence: 1.0,
            alternatives: ['ኦሮሚያ ባንክ'],
            categoryHint: 'bank'
        })

        // Mobile Money Services
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

        // Telecom
        this.addMerchant('ethiotelecom', {
            original: 'Ethio Telecom',
            normalized: 'Ethio Telecom',
            confidence: 1.0,
            alternatives: ['ኢትዮ ቴሌኮም', 'telecom'],
            categoryHint: 'telecom'
        })

        // Common Retail
        this.addMerchant('walmart', {
            original: 'Walmart',
            normalized: 'Walmart',
            confidence: 1.0,
            alternatives: [],
            categoryHint: 'retail'
        })

        this.addMerchant('mcdonalds', {
            original: 'McDonald\'s',
            normalized: 'McDonald\'s',
            confidence: 1.0,
            alternatives: ['mcdonalds'],
            categoryHint: 'food'
        })

        this.addMerchant('starbucks', {
            original: 'Starbucks',
            normalized: 'Starbucks',
            confidence: 1.0,
            alternatives: [],
            categoryHint: 'food'
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
        // For now, return null - would need user context integration
        return null
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

    // Utility method to add new merchants dynamically
    addNewMerchant(key: string, merchant: MerchantInfo): void {
        this.addMerchant(key, merchant)
    }

    // Get all merchants for debugging or admin purposes
    getAllMerchants(): MerchantInfo[] {
        return Array.from(this.merchantDatabase.values())
    }
}