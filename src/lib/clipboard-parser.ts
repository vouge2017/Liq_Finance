/**
 * Clipboard Parser Service for Ethiopian Financial Automation
 * Provides smart parsing of SMS text copied from mobile phones
 * for iOS/web platforms that don't have direct SMS access
 */

import { EnhancedParsedSMS, parseEnhancedSMS, getEnhancedCategory, validateParsedSMS } from './enhanced-sms-parser'

export interface ClipboardParseOptions {
    autoProcess?: boolean
    showPreview?: boolean
    allowManualEdit?: boolean
    confidenceThreshold?: number
}

export interface ClipboardParseResult {
    parsed: EnhancedParsedSMS | null
    rawText: string
    isValid: boolean
    confidence: number
    suggestions: string[]
    requiresReview: boolean
    processingTime: number
}

/**
 * Smart clipboard parser that extracts financial transaction information
 * from SMS text copied from mobile devices
 */
export class ClipboardParser {
    private static instance: ClipboardParser
    private parseHistory: ClipboardParseResult[] = []
    private readonly MAX_HISTORY = 50

    public static getInstance(): ClipboardParser {
        if (!ClipboardParser.instance) {
            ClipboardParser.instance = new ClipboardParser()
        }
        return ClipboardParser.instance
    }

    /**
     * Parse text from clipboard with smart detection
     */
    async parseFromClipboard(options: ClipboardParseOptions = {}): Promise<ClipboardParseResult> {
        const startTime = performance.now()

        try {
            // Check if Clipboard API is available
            if (!navigator.clipboard) {
                throw new Error('Clipboard API not available. Please paste text manually.')
            }

            // Request clipboard read permission
            const text = await navigator.clipboard.readText()
            return this.parseText(text, options, startTime)
        } catch (error) {
            console.error('Clipboard access failed:', error)
            throw new Error('Failed to access clipboard. Please paste text manually or check browser permissions.')
        }
    }

    /**
     * Parse provided text (manual paste fallback)
     */
    parseText(text: string, options: ClipboardParseOptions = {}, startTime?: number): ClipboardParseResult {
        const processingStart = startTime || performance.now()
        const cleanText = this.cleanAndNormalizeText(text)

        // Try enhanced SMS parsing
        const parsed = parseEnhancedSMS(cleanText)

        // Calculate confidence and validation
        const validation = parsed ? validateParsedSMS(parsed) : { isValid: false, issues: ['No transaction data found'], suggestions: [] }
        const confidence = parsed?.confidence || 0
        const threshold = options.confidenceThreshold || 0.5

        const result: ClipboardParseResult = {
            parsed,
            rawText: text,
            isValid: validation.isValid,
            confidence,
            suggestions: validation.suggestions,
            requiresReview: confidence < threshold || !validation.isValid,
            processingTime: performance.now() - processingStart
        }

        // Add to history
        this.addToHistory(result)

        return result
    }

    /**
     * Clean and normalize text for better parsing
     */
    private cleanAndNormalizeText(text: string): string {
        return text
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Normalize line breaks
            .replace(/\r\n|\r/g, '\n')
            // Remove leading/trailing whitespace
            .trim()
            // Handle common SMS formatting issues
            .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    }

    /**
     * Smart text extraction from various sources
     */
    extractTransactionText(input: string): string {
        // Look for Ethiopian bank SMS patterns
        const ethiopianPatterns = [
            // CBE patterns
            /(?:CBE|Commercial Bank of Ethiopia).*?(?:Debit|Credit).*?ETB[\s\S]*?(?=\n\n|\n[A-Z]|$)/,
            // Telebirr patterns
            /(?:Telebirr|you have (?:paid|received)).*?ETB[\s\S]*?(?=\n\n|\n[A-Z]|$)/,
            // General ETB patterns
            /ETB\s*[\d,]+\.?\d*[\s\S]*?(?=\n\n|\n[A-Z]|$)/
        ]

        for (const pattern of ethiopianPatterns) {
            const match = input.match(pattern)
            if (match) {
                return match[0].trim()
            }
        }

        // Fallback: return original text if no patterns match
        return input.trim()
    }

    /**
     * Validate clipboard content before parsing
     */
    validateClipboardContent(text: string): {
        isValid: boolean
        issues: string[]
        recommendations: string[]
    } {
        const issues: string[] = []
        const recommendations: string[] = []

        // Check minimum length
        if (text.length < 10) {
            issues.push('Text too short to contain meaningful transaction data')
        }

        // Check for ETB currency
        if (!/ETB/i.test(text)) {
            issues.push('No ETB currency detected')
            recommendations.push('Ensure SMS contains Ethiopian Birr (ETB) amounts')
        }

        // Check for banking keywords
        const bankingKeywords = ['debit', 'credit', 'balance', 'ref', 'transaction', 'paid', 'received', 'withdrawal', 'deposit']
        const hasBankingKeywords = bankingKeywords.some(keyword =>
            new RegExp(keyword, 'i').test(text)
        )

        if (!hasBankingKeywords) {
            recommendations.push('Text should contain banking-related keywords for better parsing')
        }

        // Check for amount patterns
        if (!/[\d,]+\.?\d*/.test(text)) {
            issues.push('No numerical amounts found')
        }

        return {
            isValid: issues.length === 0,
            issues,
            recommendations
        }
    }

    /**
     * Get parsing suggestions based on content analysis
     */
    getParsingSuggestions(text: string): string[] {
        const suggestions: string[] = []

        // Suggest including full SMS
        if (text.split('\n').length < 3) {
            suggestions.push('Include the complete SMS for better accuracy')
        }

        // Suggest formatting improvements
        if (text.includes('\r')) {
            suggestions.push('Text appears to be from Windows - consider copying from mobile device')
        }

        // Suggest checking bank-specific formats
        if (!/CBE|Telebirr|Dashen|Awash/i.test(text)) {
            suggestions.push('Include bank name (CBE, Telebirr, etc.) for better recognition')
        }

        return suggestions
    }

    /**
     * Batch parse multiple texts
     */
    async batchParse(texts: string[], options: ClipboardParseOptions = {}): Promise<ClipboardParseResult[]> {
        const results: ClipboardParseResult[] = []

        for (const text of texts) {
            try {
                const result = this.parseText(text, options)
                results.push(result)
            } catch (error) {
                console.error('Batch parse error:', error)
                results.push({
                    parsed: null,
                    rawText: text,
                    isValid: false,
                    confidence: 0,
                    suggestions: [`Parse error: ${error}`],
                    requiresReview: true,
                    processingTime: 0
                })
            }
        }

        return results
    }

    /**
     * Get parsing statistics
     */
    getParsingStats(): {
        totalParsed: number
        successRate: number
        averageConfidence: number
        commonIssues: string[]
        popularBanks: { bank: string; count: number }[]
    } {
        const validParses = this.parseHistory.filter(r => r.isValid)
        const totalParses = this.parseHistory.length

        const bankCounts = new Map<string, number>()
        const issueCounts = new Map<string, number>()
        let totalConfidence = 0

        this.parseHistory.forEach(result => {
            if (result.parsed?.bank) {
                bankCounts.set(result.parsed.bank, (bankCounts.get(result.parsed.bank) || 0) + 1)
            }

            result.suggestions.forEach(suggestion => {
                if (suggestion.includes('error') || suggestion.includes('failed')) {
                    issueCounts.set(suggestion, (issueCounts.get(suggestion) || 0) + 1)
                }
            })

            totalConfidence += result.confidence
        })

        return {
            totalParsed: totalParses,
            successRate: totalParses > 0 ? (validParses.length / totalParses) * 100 : 0,
            averageConfidence: totalParses > 0 ? totalConfidence / totalParses : 0,
            commonIssues: Array.from(issueCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([issue]) => issue),
            popularBanks: Array.from(bankCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([bank, count]) => ({ bank, count }))
        }
    }

    /**
     * Clear parsing history
     */
    clearHistory(): void {
        this.parseHistory = []
    }

    /**
     * Export parsing history
     */
    exportHistory(): ClipboardParseResult[] {
        return [...this.parseHistory]
    }

    /**
     * Add result to history with size limit
     */
    private addToHistory(result: ClipboardParseResult): void {
        this.parseHistory.unshift(result)

        // Maintain history size limit
        if (this.parseHistory.length > this.MAX_HISTORY) {
            this.parseHistory = this.parseHistory.slice(0, this.MAX_HISTORY)
        }
    }
}

/**
 * Convenience function for quick clipboard parsing
 */
export async function parseClipboardContent(options?: ClipboardParseOptions): Promise<ClipboardParseResult> {
    const parser = ClipboardParser.getInstance()
    return parser.parseFromClipboard(options)
}

/**
 * Manual text parsing (for when clipboard API is not available)
 */
export function parseManualText(text: string, options?: ClipboardParseOptions): ClipboardParseResult {
    const parser = ClipboardParser.getInstance()
    return parser.parseText(text, options)
}

/**
 * Utility to detect if text looks like Ethiopian bank SMS
 */
export function isEthiopianBankSMS(text: string): boolean {
    const patterns = [
        /CBE|Commercial Bank of Ethiopia/i,
        /Telebirr/i,
        /Dashen.*Bank/i,
        /Awash.*Bank/i,
        /ETB\s*[\d,]+\.?\d*/i,
        /(?:Debit|Credit|Withdrawal|Deposit).*ETB/i
    ]

    return patterns.some(pattern => pattern.test(text))
}

/**
 * Utility to extract key information from parsed result
 */
export function extractTransactionInfo(result: ClipboardParseResult): {
    amount?: number
    bank?: string
    type?: string
    merchant?: string
    confidence?: number
} {
    if (!result.parsed) {
        return { confidence: result.confidence }
    }

    return {
        amount: result.parsed.amount,
        bank: result.parsed.bank,
        type: result.parsed.type,
        merchant: result.parsed.merchant,
        confidence: result.parsed.confidence
    }
}