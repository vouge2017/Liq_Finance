/**
 * Multi-Language SMS Parser for Ethiopian Banks
 * Supports both English and Amharic SMS formats with dynamic pattern learning
 */

export interface MultiLanguageParsedSMS {
    bank: 'CBE' | 'Telebirr' | 'Dashen' | 'Awash' | 'NIB' | 'Lion' | 'Zemen' | 'Cooperative' | 'Unknown'
    type: 'expense' | 'income' | 'transfer'
    amount: number
    balance?: number
    merchant?: string
    reference?: string
    date?: string
    confidence: number
    rawAmount: string
    language: 'en' | 'am' | 'mixed'
    transactionReason?: string
    location?: string
    rawText: string
}

/**
 * Language-specific parsing patterns
 */
interface LanguagePatterns {
    english: {
        debit: RegExp[]
        credit: RegExp[]
        amount: RegExp[]
        balance: RegExp[]
        reference: RegExp[]
        merchant: RegExp[]
        reason: RegExp[]
    }
    amharic: {
        debit: RegExp[]
        credit: RegExp[]
        amount: RegExp[]
        balance: RegExp[]
        reference: RegExp[]
        merchant: RegExp[]
        reason: RegExp[]
    }
}

/**
 * Multi-language SMS Parser with Dynamic Learning
 */
export class MultiLanguageSMSParser {
    private static instance: MultiLanguageSMSParser
    private learnedPatterns: Map<string, RegExp[]> = new Map()
    private readonly userPatterns: Map<string, RegExp[]> = new Map()

    // Ethiopian Bank patterns in English and Amharic
    private readonly bankPatterns: LanguagePatterns = {
        english: {
            debit: [
                /Debit:\s*ETB\s*([\d,]+\.?\d*)/i,
                /CBE.*Debit.*ETB\s*([\d,]+\.?\d*)/i,
                /withdrawal\s*(?:of)?\s*ETB\s*([\d,]+\.?\d*)/i,
                /paid\s*ETB\s*([\d,]+\.?\d*)/i,
                /sent\s*ETB\s*([\d,]+\.?\d*)/i
            ],
            credit: [
                /Credit:\s*ETB\s*([\d,]+\.?\d*)/i,
                /CBE.*Credit.*ETB\s*([\d,]+\.?\d*)/i,
                /deposit\s*(?:of)?\s*ETB\s*([\d,]+\.?\d*)/i,
                /received\s*ETB\s*([\d,]+\.?\d*)/i
            ],
            amount: [
                /ETB\s*([\d,]+\.?\d*)/i,
                /([\d,]+\.?\d*)\s*ETB/i
            ],
            balance: [
                /Bal(?:ance)?:\s*ETB\s*([\d,]+\.?\d*)/i,
                /Balance:\s*([\d,]+\.?\d*)/i,
                /Current\s+Bal:\s*ETB\s*([\d,]+\.?\d*)/i,
                /Available\s+Bal:\s*ETB\s*([\d,]+\.?\d*)/i
            ],
            reference: [
                /Ref(?:erence)?:\s*(\w+)/i,
                /Txn(?:ID)?:\s*(\w+)/i,
                /Trans(?:action)?\s*ID:\s*(\w+)/i,
                /Ref\s*#\s*(\w+)/i
            ],
            merchant: [
                /to\s+([^.]+?)\./i,
                /from\s+([^.]+?)\./i,
                /at\s+([^.]+?)\./i,
                /merchant:\s*([^.]+?)\./i
            ],
            reason: [
                /for\s+([^.]+?)\./i,
                /reason:\s*([^.]+?)\./i,
                /purpose:\s*([^.]+?)\./i,
                /note:\s*([^.]+?)\./i
            ]
        },
        amharic: {
            debit: [
                /ተክፋይ:\s*ETB\s*([\d,]+\.?\d*)/i,
                /ተወጪ:\s*ETB\s*([\d,]+\.?\d*)/i,
                /ከተከፈለ\s*ETB\s*([\d,]+\.?\d*)/i,
                /ተላከ\s*ETB\s*([\d,]+\.?\d*)/i,
                /ተክፋይ\s+ETB\s*([\d,]+\.?\d*)/i
            ],
            credit: [
                /ተቀሪይ:\s*ETB\s*([\d,]+\.?\d*)/i,
                /ገቢ:\s*ETB\s*([\d,]+\.?\d*)/i,
                /ወደ\s+ተገባ\s*ETB\s*([\d,]+\.?\d*)/i,
                /ተቀበለ\s*ETB\s*([\d,]+\.?\d*)/i,
                /ተቀሪይ\s+ETB\s*([\d,]+\.?\d*)/i
            ],
            amount: [
                /ETB\s*([\�3,]+.?᫫*)/i, // Support Ethiopic numbers
                /([\d,]+\.?\d*)\s*ETB/i,
                /ብር\s*([\d,]+\.?\d*)/i
            ],
            balance: [
                /ቀሪ\s+ሂሳብ:\s*ETB\s*([\d,]+\.?\d*)/i,
                /ቀሪ\s+ብር:\s*([\d,]+\.?\d*)/i,
                /የአሁኑ\s+ቀሪ:\s*ETB\s*([\d,]+\.?\d*)/i,
                /አሁን\s+ቀሪ:\s*ETB\s*([\d,]+\.?\d*)/i
            ],
            reference: [
                /ሪፍ:\s*(\w+)/i,
                /ቁጥር:\s*(\w+)/i,
                /ተመሳሳይ\s+ቁጥር:\s*(\w+)/i,
                /ሽፋን\s+ቁጥር:\s*(\w+)/i
            ],
            merchant: [
                /ወደ\s+([^።]+)/i,
                /ከ\s+([^።]+)/i,
                /በ\s+([^።]+)/i,
                /አካል:\s*([^።]+)/i
            ],
            reason: [
                /ለ\s+([^።]+)/i,
                /ምክኒያት:\s*([^።]+)/i,
                /ዓላማ:\s*([^።]+)/i,
                /ማስታወሻ:\s*([^።]+)/i
            ]
        }
    }

    public static getInstance(): MultiLanguageSMSParser {
        if (!MultiLanguageSMSParser.instance) {
            MultiLanguageSMSParser.instance = new MultiLanguageSMSParser()
        }
        return MultiLanguageSMSParser.instance
    }

    /**
     * Parse SMS with multi-language support
     */
    parseSMS(smsText: string): MultiLanguageParsedSMS | null {
        const cleanText = smsText.trim()

        // Detect language
        const detectedLanguage = this.detectLanguage(cleanText)

        // Try parsing with detected language patterns
        let result = this.parseWithLanguage(cleanText, detectedLanguage === 'mixed' ? 'en' : detectedLanguage)

        // If primary language fails, try the other language
        if (!result && detectedLanguage !== 'mixed') {
            const fallbackLang = detectedLanguage === 'en' ? 'am' : 'en'
            result = this.parseWithLanguage(cleanText, fallbackLang)
        }

        if (result) {
            result.language = detectedLanguage
            result.rawText = cleanText
            return result
        }

        return null
    }

    /**
     * Parse SMS with specific language patterns
     */
    private parseWithLanguage(text: string, language: 'en' | 'am'): MultiLanguageParsedSMS | null {
        const patterns = this.bankPatterns[language as keyof LanguagePatterns]
        const isAmharic = language === 'am'

        // Try to identify bank first
        const bank = this.identifyBank(text, language)
        if (!bank) return null

        // Extract amount
        const amount = this.extractAmount(text, patterns.amount, isAmharic)
        if (!amount) return null

        // Determine transaction type
        const type = this.determineTransactionType(text, patterns, isAmharic)

        // Extract other fields
        const balance = this.extractBalance(text, patterns.balance, isAmharic)
        const reference = this.extractReference(text, patterns.reference, isAmharic)
        const merchant = this.extractMerchant(text, patterns.merchant, isAmharic)
        const reason = this.extractReason(text, patterns.reason, isAmharic)

        // Calculate confidence
        const confidence = this.calculateConfidence(text, {
            bank,
            amount,
            type,
            balance,
            reference,
            merchant,
            reason
        }, language)

        return {
            bank,
            type,
            amount,
            balance,
            merchant,
            reference,
            transactionReason: reason,
            confidence,
            rawAmount: amount.toString(),
            language,
            rawText: text
        }
    }

    /**
     * Detect language of SMS text
     */
    private detectLanguage(text: string): 'en' | 'am' | 'mixed' {
        const amharicChars = /[ሀ-፼]/
        const englishChars = /[a-zA-Z]/

        const amharicCount = (text.match(amharicChars) || []).length
        const englishCount = (text.match(englishChars) || []).length

        if (amharicCount > englishCount && amharicCount > 5) {
            return 'am'
        } else if (englishCount > amharicCount && englishCount > 5) {
            return 'en'
        } else {
            return 'mixed'
        }
    }

    /**
     * Identify bank from SMS text
     */
    private identifyBank(text: string, language: 'en' | 'am'): MultiLanguageParsedSMS['bank'] | null {
        const lowerText = text.toLowerCase()

        const bankIdentifiers = {
            'CBE': [
                /cbe|commercial.*bank.*ethiopia/i,
                language === 'am' ? /ንግድ\s+ባንክ\s+ኢትዮጵያ/i : null
            ].filter(Boolean),
            'Telebirr': [
                /telebirr/i,
                language === 'am' ? /ቴሌብር/i : null
            ].filter(Boolean),
            'Dashen': [
                /dashen.*bank/i,
                language === 'am' ? /ዳሽን\s+ባንክ/i : null
            ].filter(Boolean),
            'Awash': [
                /awash.*bank/i,
                language === 'am' ? /አዋሽ\s+ባንክ/i : null
            ].filter(Boolean),
            'NIB': [
                /nib.*international.*bank/i,
                language === 'am' ? /ኒብ\s+አለምአቀፍ\s+ባንክ/i : null
            ].filter(Boolean),
            'Lion': [
                /lion.*international.*bank/i,
                language === 'am' ? /አንበሳ\s+አለምአቀፍ\s+ባንክ/i : null
            ].filter(Boolean),
            'Zemen': [
                /zemen.*bank/i,
                language === 'am' ? /ዘመን\s+ባንክ/i : null
            ].filter(Boolean),
            'Cooperative': [
                /cooperative.*bank.*ethiopia/i,
                language === 'am' ? /ህብረት\s+ባንክ\s+ኢትዮጵያ/i : null
            ].filter(Boolean)
        }

        for (const [bankName, patterns] of Object.entries(bankIdentifiers)) {
            const validPatterns = patterns.filter((pattern): pattern is RegExp => pattern !== null)
            if (validPatterns.some(pattern => pattern.test(text))) {
                return bankName as MultiLanguageParsedSMS['bank']
            }
        }

        return null
    }

    /**
     * Extract amount using pattern matching
     */
    private extractAmount(text: string, patterns: RegExp[], isAmharic: boolean): number | null {
        for (const pattern of patterns) {
            const match = text.match(pattern)
            if (match) {
                const amountStr = match[1]
                // Handle Ethiopic numbers if needed
                const cleanAmount = this.cleanAmountString(amountStr)
                const parsed = parseFloat(cleanAmount.replace(/,/g, ''))
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed
                }
            }
        }
        return null
    }

    /**
     * Clean amount string (handle Ethiopic numbers, commas, etc.)
     */
    private cleanAmountString(amountStr: string): string {
        // Convert Ethiopic numbers to Arabic numbers if present
        const ethiopicToArabic: { [key: string]: string } = {
            '፩': '1', '፪': '2', '፫': '3', '፬': '4', '፭': '5',
            '፮': '6', '፯': '7', '፰': '8', '፱': '9', '፲': '10',
            '፳': '20', '፴': '30', '፵': '40', '፶': '50', '፷': '60',
            '፸': '70', '፹': '80', '፺': '90', '፻': '100'
        }

        let cleaned = amountStr
        for (const [ethiopic, arabic] of Object.entries(ethiopicToArabic)) {
            cleaned = cleaned.replace(new RegExp(ethiopic, 'g'), arabic)
        }

        return cleaned
    }

    /**
     * Determine transaction type
     */
    private determineTransactionType(text: string, patterns: LanguagePatterns['english'], isAmharic: boolean): 'expense' | 'income' | 'transfer' {
        // Check debit patterns
        for (const pattern of patterns.debit) {
            if (pattern.test(text)) {
                return 'expense'
            }
        }

        // Check credit patterns
        for (const pattern of patterns.credit) {
            if (pattern.test(text)) {
                return 'income'
            }
        }

        // Check for transfer keywords
        const transferKeywords = isAmharic ?
            ['ተላከ', 'ተለወጠ', 'ተቀየረ'] :
            ['transfer', 'sent', 'remitted']

        if (transferKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
            return 'transfer'
        }

        // Default to expense if ambiguous
        return 'expense'
    }

    /**
     * Extract balance
     */
    private extractBalance(text: string, patterns: RegExp[], isAmharic: boolean): number | undefined {
        for (const pattern of patterns) {
            const match = text.match(pattern)
            if (match) {
                const balanceStr = match[1]
                const cleanBalance = this.cleanAmountString(balanceStr)
                const parsed = parseFloat(cleanBalance.replace(/,/g, ''))
                if (!isNaN(parsed)) {
                    return parsed
                }
            }
        }
        return undefined
    }

    /**
     * Extract reference
     */
    private extractReference(text: string, patterns: RegExp[], isAmharic: boolean): string | undefined {
        for (const pattern of patterns) {
            const match = text.match(pattern)
            if (match) {
                return match[1].trim()
            }
        }
        return undefined
    }

    /**
     * Extract merchant
     */
    private extractMerchant(text: string, patterns: RegExp[], isAmharic: boolean): string | undefined {
        for (const pattern of patterns) {
            const match = text.match(pattern)
            if (match) {
                const merchant = match[1].trim()
                if (merchant.length > 2 && merchant.length < 100) {
                    return merchant
                }
            }
        }
        return undefined
    }

    /**
     * Extract transaction reason
     */
    private extractReason(text: string, patterns: RegExp[], isAmharic: boolean): string | undefined {
        for (const pattern of patterns) {
            const match = text.match(pattern)
            if (match) {
                const reason = match[1].trim()
                if (reason.length > 2 && reason.length < 100) {
                    return reason
                }
            }
        }
        return undefined
    }

    /**
     * Calculate parsing confidence
     */
    private calculateConfidence(text: string, parsed: any, language: 'en' | 'am'): number {
        let confidence = 0.5 // Base confidence

        // Increase confidence for each successfully parsed field
        if (parsed.bank) confidence += 0.2
        if (parsed.amount) confidence += 0.2
        if (parsed.balance !== undefined) confidence += 0.1
        if (parsed.reference) confidence += 0.1
        if (parsed.merchant) confidence += 0.1
        if (parsed.reason) confidence += 0.05

        // Decrease confidence for ambiguous types
        if (parsed.type === 'transfer') confidence -= 0.05

        // Language-specific adjustments
        if (language === 'am') {
            confidence -= 0.1 // Amharic parsing is less mature
        }

        return Math.max(0, Math.min(1, confidence))
    }

    /**
     * Add user-learned pattern
     */
    addUserPattern(patternKey: string, regex: RegExp): void {
        if (!this.userPatterns.has(patternKey)) {
            this.userPatterns.set(patternKey, [])
        }
        this.userPatterns.get(patternKey)!.push(regex)
    }

    /**
     * Get all learned patterns
     */
    getLearnedPatterns(): Map<string, RegExp[]> {
        return new Map([...this.userPatterns, ...this.learnedPatterns])
    }

    /**
     * Clear learned patterns
     */
    clearLearnedPatterns(): void {
        this.userPatterns.clear()
        this.learnedPatterns.clear()
    }
}

// Export singleton instance
export const multiLanguageSMSParser = MultiLanguageSMSParser.getInstance()

// Export convenience functions
export function parseMultiLanguageSMS(smsText: string): MultiLanguageParsedSMS | null {
    return multiLanguageSMSParser.parseSMS(smsText)
}

export function addUserPattern(patternKey: string, regex: RegExp): void {
    multiLanguageSMSParser.addUserPattern(patternKey, regex)
}

export function getLearnedPatterns(): Map<string, RegExp[]> {
    return multiLanguageSMSParser.getLearnedPatterns()
}