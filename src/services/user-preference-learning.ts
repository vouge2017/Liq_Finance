/**
 * User Preference Learning System
 * Learns from user behavior to improve voice recognition accuracy and user experience
 */

export interface UserPreferences {
    frequentlyUsedMerchants: string[]
    preferredCategories: string[]
    commonAmounts: number[]
    preferredTransactionTypes: string[]
    speechPatterns: SpeechPattern[]
    languagePreferences: {
        primaryLanguage: string
        secondaryLanguages: string[]
        languageConfidence: Record<string, number>
    }
    usagePatterns: {
        peakUsageTimes: string[]
        averageProcessingTime: number
        errorRate: number
        successRate: number
    }
}

export interface SpeechPattern {
    pattern: string
    frequency: number
    confidence: number
    lastUsed: Date
}

export interface LearningContext {
    transactionType: string
    merchant: string
    category: string
    amount: number
    timestamp: Date
    confidence: number
    correctionsMade: boolean
    language: string
}

export class UserPreferenceLearning {
    private preferences: UserPreferences
    private learningEnabled: boolean = true
    private storageKey = 'voice_user_preferences'

    constructor() {
        this.preferences = this.loadPreferences()
    }

    // Learn from transaction processing
    learnFromTransaction(context: LearningContext): void {
        if (!this.learningEnabled) return

        // Update frequently used merchants
        this.updateFrequentMerchants(context.merchant)

        // Update preferred categories
        this.updatePreferredCategories(context.category)

        // Update common amounts
        this.updateCommonAmounts(context.amount)

        // Update preferred transaction types
        this.updatePreferredTransactionTypes(context.transactionType)

        // Update speech patterns
        this.updateSpeechPatterns(context)

        // Update language preferences
        this.updateLanguagePreferences(context.language)

        // Update usage patterns
        this.updateUsagePatterns(context)

        // Save preferences
        this.savePreferences()
    }

    // Get personalized suggestions
    getPersonalizedSuggestions(input: string): {
        merchants: string[]
        categories: string[]
        amounts: number[]
        transactionTypes: string[]
        corrections: string[]
    } {
        const suggestions = {
            merchants: this.getMerchantSuggestions(input),
            categories: this.getCategorySuggestions(input),
            amounts: this.getAmountSuggestions(input),
            transactionTypes: this.getTransactionTypeSuggestions(input),
            corrections: this.getCorrectionSuggestions(input)
        }

        return suggestions
    }

    // Get smart defaults for new transactions
    getSmartDefaults(): {
        category: string | null
        transactionType: string | null
        amount: number | null
    } {
        return {
            category: this.getMostLikelyCategory(),
            transactionType: this.getMostLikelyTransactionType(),
            amount: this.getMostLikelyAmount()
        }
    }

    // Personalize voice recognition
    personalizeRecognition(input: string): {
        enhancedInput: string
        confidenceBoost: number
        suggestedCorrections: string[]
    } {
        const suggestions = this.getPersonalizedSuggestions(input)
        let enhancedInput = input
        let confidenceBoost = 0
        const suggestedCorrections: string[] = []

        // Apply merchant corrections
        for (const merchant of suggestions.merchants) {
            if (this.similarity(input, merchant) > 0.7) {
                enhancedInput = input.replace(/\b\w+\b/, merchant)
                confidenceBoost += 0.1
                suggestedCorrections.push(`Did you mean "${merchant}"?`)
            }
        }

        // Apply category corrections
        for (const category of suggestions.categories) {
            if (this.similarity(input, category) > 0.7) {
                confidenceBoost += 0.05
            }
        }

        return {
            enhancedInput,
            confidenceBoost: Math.min(confidenceBoost, 0.3), // Cap at 30%
            suggestedCorrections
        }
    }

    // Update preferences based on user corrections
    recordCorrection(original: string, corrected: string, fieldType: string): void {
        switch (fieldType) {
            case 'merchant':
                this.updateFrequentMerchants(corrected)
                break
            case 'category':
                this.updatePreferredCategories(corrected)
                break
            case 'amount':
                const amount = parseFloat(corrected)
                if (!isNaN(amount)) {
                    this.updateCommonAmounts(amount)
                }
                break
        }

        this.savePreferences()
    }

    // Get learning statistics
    getLearningStats(): {
        totalTransactions: number
        accuracyImprovement: number
        mostLearnedPattern: string | null
        languageProficiency: Record<string, number>
    } {
        const totalTransactions = this.preferences.usagePatterns.successRate + this.preferences.usagePatterns.errorRate
        const accuracyImprovement = this.calculateAccuracyImprovement()
        const mostLearnedPattern = this.getMostFrequentPattern()
        const languageProficiency = this.preferences.languagePreferences.languageConfidence

        return {
            totalTransactions,
            accuracyImprovement,
            mostLearnedPattern,
            languageProficiency
        }
    }

    // Reset learning data
    resetLearning(): void {
        this.preferences = this.getDefaultPreferences()
        this.savePreferences()
    }

    // Enable/disable learning
    setLearningEnabled(enabled: boolean): void {
        this.learningEnabled = enabled
    }

    private updateFrequentMerchants(merchant: string): void {
        const index = this.preferences.frequentlyUsedMerchants.indexOf(merchant)
        if (index > -1) {
            // Move to front (most recent)
            this.preferences.frequentlyUsedMerchants.splice(index, 1)
        }

        this.preferences.frequentlyUsedMerchants.unshift(merchant)

        // Keep only top 20
        if (this.preferences.frequentlyUsedMerchants.length > 20) {
            this.preferences.frequentlyUsedMerchants = this.preferences.frequentlyUsedMerchants.slice(0, 20)
        }
    }

    private updatePreferredCategories(category: string): void {
        const index = this.preferences.preferredCategories.indexOf(category)
        if (index > -1) {
            this.preferences.preferredCategories.splice(index, 1)
        }

        this.preferences.preferredCategories.unshift(category)

        if (this.preferences.preferredCategories.length > 10) {
            this.preferences.preferredCategories = this.preferences.preferredCategories.slice(0, 10)
        }
    }

    private updateCommonAmounts(amount: number): void {
        const index = this.preferences.commonAmounts.indexOf(amount)
        if (index > -1) {
            this.preferences.commonAmounts.splice(index, 1)
        }

        this.preferences.commonAmounts.unshift(amount)

        if (this.preferences.commonAmounts.length > 15) {
            this.preferences.commonAmounts = this.preferences.commonAmounts.slice(0, 15)
        }
    }

    private updatePreferredTransactionTypes(type: string): void {
        const index = this.preferences.preferredTransactionTypes.indexOf(type)
        if (index > -1) {
            this.preferences.preferredTransactionTypes.splice(index, 1)
        }

        this.preferences.preferredTransactionTypes.unshift(type)

        if (this.preferences.preferredTransactionTypes.length > 5) {
            this.preferences.preferredTransactionTypes = this.preferences.preferredTransactionTypes.slice(0, 5)
        }
    }

    private updateSpeechPatterns(context: LearningContext): void {
        const pattern = this.extractSpeechPattern(context)

        const existingPattern = this.preferences.speechPatterns.find(p => p.pattern === pattern)
        if (existingPattern) {
            existingPattern.frequency++
            existingPattern.lastUsed = new Date()
            existingPattern.confidence = Math.min(existingPattern.confidence + 0.05, 1.0)
        } else {
            this.preferences.speechPatterns.push({
                pattern,
                frequency: 1,
                confidence: context.confidence,
                lastUsed: new Date()
            })
        }

        // Keep only top 50 patterns
        this.preferences.speechPatterns.sort((a, b) => b.frequency - a.frequency)
        if (this.preferences.speechPatterns.length > 50) {
            this.preferences.speechPatterns = this.preferences.speechPatterns.slice(0, 50)
        }
    }

    private updateLanguagePreferences(language: string): void {
        if (!this.preferences.languagePreferences.languageConfidence[language]) {
            this.preferences.languagePreferences.languageConfidence[language] = 0
        }

        this.preferences.languagePreferences.languageConfidence[language] += 0.1

        // Update primary language if needed
        const maxConfidence = Math.max(...Object.values(this.preferences.languagePreferences.languageConfidence))
        if (this.preferences.languagePreferences.languageConfidence[language] === maxConfidence) {
            this.preferences.languagePreferences.primaryLanguage = language
        }
    }

    private updateUsagePatterns(context: LearningContext): void {
        const hour = context.timestamp.getHours().toString()
        if (!this.preferences.usagePatterns.peakUsageTimes.includes(hour)) {
            this.preferences.usagePatterns.peakUsageTimes.push(hour)
        }

        // Update success/error rates
        if (context.confidence > 0.8) {
            this.preferences.usagePatterns.successRate++
        } else {
            this.preferences.usagePatterns.errorRate++
        }
    }

    private extractSpeechPattern(context: LearningContext): string {
        // Extract pattern from transaction description
        return `${context.transactionType}_${context.category}_${context.amount}`
    }

    private getMerchantSuggestions(input: string): string[] {
        return this.preferences.frequentlyUsedMerchants.filter(merchant =>
            this.similarity(input, merchant) > 0.6
        ).slice(0, 5)
    }

    private getCategorySuggestions(input: string): string[] {
        return this.preferences.preferredCategories.filter(category =>
            this.similarity(input, category) > 0.6
        ).slice(0, 3)
    }

    private getAmountSuggestions(input: string): number[] {
        // Return amounts that are close to any numbers in the input
        const numbers = input.match(/\d+/g)?.map(Number) || []
        return this.preferences.commonAmounts.filter(amount =>
            numbers.some(num => Math.abs(num - amount) < 100)
        ).slice(0, 5)
    }

    private getTransactionTypeSuggestions(input: string): string[] {
        return this.preferences.preferredTransactionTypes.filter(type =>
            this.similarity(input, type) > 0.6
        ).slice(0, 3)
    }

    private getCorrectionSuggestions(input: string): string[] {
        const corrections: string[] = []

        // Check for common misspellings or variations
        for (const merchant of this.preferences.frequentlyUsedMerchants) {
            if (this.similarity(input, merchant) > 0.8) {
                corrections.push(`Did you mean "${merchant}"?`)
            }
        }

        return corrections.slice(0, 3)
    }

    private getMostLikelyCategory(): string | null {
        return this.preferences.preferredCategories[0] || null
    }

    private getMostLikelyTransactionType(): string | null {
        return this.preferences.preferredTransactionTypes[0] || null
    }

    private getMostLikelyAmount(): number | null {
        return this.preferences.commonAmounts[0] || null
    }

    private getMostFrequentPattern(): string | null {
        const sorted = this.preferences.speechPatterns.sort((a, b) => b.frequency - a.frequency)
        return sorted[0]?.pattern || null
    }

    private calculateAccuracyImprovement(): number {
        // Calculate improvement based on learning patterns
        const totalPatterns = this.preferences.speechPatterns.length
        const highConfidencePatterns = this.preferences.speechPatterns.filter(p => p.confidence > 0.8).length

        return totalPatterns > 0 ? (highConfidencePatterns / totalPatterns) * 100 : 0
    }

    private similarity(str1: string, str2: string): number {
        const s1 = str1.toLowerCase()
        const s2 = str2.toLowerCase()

        // Simple similarity calculation
        let matches = 0
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
            if (s1[i] === s2[i]) matches++
        }

        return matches / Math.max(s1.length, s2.length)
    }

    private getDefaultPreferences(): UserPreferences {
        return {
            frequentlyUsedMerchants: [],
            preferredCategories: [],
            commonAmounts: [],
            preferredTransactionTypes: [],
            speechPatterns: [],
            languagePreferences: {
                primaryLanguage: 'en-US',
                secondaryLanguages: [],
                languageConfidence: {}
            },
            usagePatterns: {
                peakUsageTimes: [],
                averageProcessingTime: 0,
                errorRate: 0,
                successRate: 0
            }
        }
    }

    private loadPreferences(): UserPreferences {
        try {
            const saved = localStorage.getItem(this.storageKey)
            return saved ? JSON.parse(saved) : this.getDefaultPreferences()
        } catch {
            return this.getDefaultPreferences()
        }
    }

    private savePreferences(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.preferences))
        } catch (error) {
            console.warn('Failed to save user preferences:', error)
        }
    }
}

/**
 * Adaptive Learning Manager
 * Manages the learning process and applies learned patterns
 */
export class AdaptiveLearningManager {
    private learner: UserPreferenceLearning
    private learningThreshold: number = 0.7

    constructor() {
        this.learner = new UserPreferenceLearning()
    }

    // Apply learning to enhance voice processing
    applyLearning(input: string, context: Partial<LearningContext> = {}): {
        enhancedInput: string
        confidenceAdjustment: number
        personalizedSuggestions: any
    } {
        const personalization = this.learner.personalizeRecognition(input)
        const suggestions = this.learner.getPersonalizedSuggestions(input)

        return {
            enhancedInput: personalization.enhancedInput,
            confidenceAdjustment: personalization.confidenceBoost,
            personalizedSuggestions: suggestions
        }
    }

    // Record successful transaction for learning
    recordSuccess(context: LearningContext): void {
        this.learner.learnFromTransaction(context)
    }

    // Get learning insights
    getLearningInsights(): {
        personalizationLevel: number
        accuracyBoost: number
        mostHelpfulPatterns: string[]
    } {
        const stats = this.learner.getLearningStats()
        const personalizationLevel = Math.min(stats.accuracyImprovement / 100, 1.0)
        const accuracyBoost = personalizationLevel * 0.2 // Up to 20% boost
        const mostHelpfulPatterns = this.learner.getLearningStats().mostLearnedPattern ?
            [this.learner.getLearningStats().mostLearnedPattern!] : []

        return {
            personalizationLevel,
            accuracyBoost,
            mostHelpfulPatterns
        }
    }
}