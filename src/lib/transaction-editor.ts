/**
 * Transaction Editor and Correction System
 * Allows users to edit, update, and complete missing transaction information
 * with smart suggestions and validation
 */

import { parseMultiLanguageSMS, MultiLanguageParsedSMS } from './multi-language-sms-parser'
import { getEnhancedCategory } from './enhanced-sms-parser'

export interface TransactionEdit {
    id: string
    originalTransaction: ProcessedTransaction
    updatedFields: Partial<ProcessedTransaction>
    changes: TransactionChange[]
    userEdited: boolean
    suggestions: TransactionSuggestion[]
    validationErrors: ValidationError[]
    lastModified: Date
}

export interface ProcessedTransaction {
    id: string
    amount: number
    bank: string
    merchant?: string
    type: 'expense' | 'income' | 'transfer'
    date: Date
    reference?: string
    balance?: number
    category: string
    transactionReason?: string
    location?: string
    tags: string[]
    notes?: string
    confidence: number
    rawData: any
    language?: 'en' | 'am' | 'mixed'
    rawText?: string
}

export interface TransactionChange {
    field: keyof ProcessedTransaction
    oldValue: any
    newValue: any
    reason: string
    timestamp: Date
}

export interface TransactionSuggestion {
    type: 'category' | 'merchant' | 'reason' | 'completion' | 'validation'
    field: keyof ProcessedTransaction
    suggestedValue: any
    confidence: number
    source: 'ai' | 'pattern' | 'user_history' | 'bank_data'
    description: string
}

export interface ValidationError {
    field: keyof ProcessedTransaction
    message: string
    severity: 'error' | 'warning' | 'info'
    code: string
}

export interface EditSession {
    id: string
    transactionId: string
    startTime: Date
    isActive: boolean
    changes: TransactionChange[]
    userId: string
}

/**
 * Transaction Editor Service
 */
export class TransactionEditor {
    private static instance: TransactionEditor
    private editSessions: Map<string, EditSession> = new Map()
    private userPreferences: Map<string, UserPreferences> = new Map()
    private merchantHistory: Map<string, MerchantData[]> = new Map()

    // Ethiopian-specific merchant and reason suggestions
    private readonly merchantSuggestions = {
        // Addis Ababa locations
        'bole': ['Bole International Airport', 'Bole Road', 'Bole Area'],
        'piassa': ['Piassa Area', 'Piassa Market', 'Piassa Shopping'],
        'merchato': ['Mercato Market', 'Mercato Area'],
        'mexico': ['Mexico Square', 'Mexico Area'],
        'arada': ['Arada District', 'Arada Market'],
        'lideta': ['Lideta District', 'Lideta Market'],

        // Popular restaurants and cafes
        'tomoca': ['Tomoca Coffee', 'Tomoca Coffee Shop'],
        'kaldi': ['Kaldi\'s Coffee', 'Kaldi\'s Coffee Shop'],
        'floral': ['Floral Hotel', 'Floral Restaurant'],
        'garden': ['Garden Restaurant', 'Garden Cafe'],
        'queen': ['Queen of Sheba Restaurant', 'Queen Restaurant'],
        'fantu': ['Fantu Restaurant', 'Fantu Cafe'],

        // Shopping centers
        'edna': ['Edna Mall', 'Edna Shopping Center'],
        'bahir': ['Bahir Dar Mall', 'Bahir Shopping'],
        'hawassa': ['Hawassa Shopping Center'],

        // Banks and financial
        'cbe': ['Commercial Bank of Ethiopia', 'CBE Branch'],
        'dashen': ['Dashen Bank', 'Dashen Branch'],
        'awash': ['Awash Bank', 'Awash Branch'],
        'telebirr': ['Telebirr Service', 'Telebirr Payment']
    }

    // Ethiopian-specific transaction reasons
    private readonly reasonSuggestions = {
        // Transportation
        'taxi': ['Daily commute', 'Airport transport', 'City tour', 'Business travel'],
        'bus': ['Public transport', 'Inter-city travel', 'Daily commute'],
        'uber': ['Ride sharing', 'Convenient transport', 'Late night travel'],
        'feres': ['Local taxi', 'Short distance travel', 'Quick transport'],

        // Food and dining
        'restaurant': ['Business lunch', 'Family dinner', 'Date night', 'Celebration'],
        'coffee': ['Morning coffee', 'Business meeting', 'Study session', 'Social gathering'],
        'grocery': ['Weekly shopping', 'Monthly provisions', 'Daily essentials'],

        // Bills and utilities
        'electricity': ['Monthly bill', 'Late payment', 'New connection'],
        'water': ['Monthly bill', 'Late payment', 'New connection'],
        'phone': ['Monthly bill', 'Top up', 'Data package', 'International call'],
        'internet': ['Monthly bill', 'Installation fee', 'Upgrade'],

        // Healthcare
        'hospital': ['Medical consultation', 'Emergency visit', 'Routine checkup', 'Medicine'],
        'pharmacy': ['Prescription medicine', 'Daily medication', 'Emergency medicine'],

        // Education
        'school': ['Tuition fee', 'School supplies', 'Transportation', 'Meal'],
        'university': ['Semester fee', 'Research material', 'Conference', 'Workshop'],

        // Entertainment
        'movie': ['Weekend entertainment', 'Family time', 'Date night'],
        'shopping': ['Clothes', 'Electronics', 'Gifts', 'Personal items'],

        // Religious and cultural
        'church': ['Tithe', 'Offering', 'Special service', 'Festival'],
        'mosque': ['Charity', 'Special prayer', 'Festival'],

        // Business
        'office': ['Business expense', 'Client meeting', 'Office supplies', 'Professional service'],
        'supplies': ['Office supplies', 'Business equipment', 'Work material']
    }

    public static getInstance(): TransactionEditor {
        if (!TransactionEditor.instance) {
            TransactionEditor.instance = new TransactionEditor()
        }
        return TransactionEditor.instance
    }

    /**
     * Create transaction from SMS with edit capabilities
     */
    createFromSMS(smsText: string): TransactionEdit | null {
        const parsed = parseMultiLanguageSMS(smsText)
        if (!parsed) return null

        const transaction = this.processParsedSMS(parsed)
        const edit: TransactionEdit = {
            id: this.generateEditId(),
            originalTransaction: transaction,
            updatedFields: {},
            changes: [],
            userEdited: false,
            suggestions: this.generateSuggestions(transaction),
            validationErrors: this.validateTransaction(transaction),
            lastModified: new Date()
        }

        return edit
    }

    /**
     * Start editing session for existing transaction
     */
    startEditSession(transactionId: string, userId: string): EditSession {
        const session: EditSession = {
            id: this.generateSessionId(),
            transactionId,
            startTime: new Date(),
            isActive: true,
            changes: [],
            userId
        }

        this.editSessions.set(session.id, session)
        return session
    }

    /**
     * Apply changes to transaction
     */
    applyChange(
        sessionId: string,
        field: keyof ProcessedTransaction,
        newValue: any,
        reason: string = 'User edit'
    ): TransactionEdit | null {
        const session = this.editSessions.get(sessionId)
        if (!session || !session.isActive) return null

        // Get current transaction state (simplified for demo)
        const currentTransaction = this.getTransactionById(session.transactionId)
        if (!currentTransaction) return null

        const oldValue = (currentTransaction as any)[field]
        const change: TransactionChange = {
            field,
            oldValue,
            newValue,
            reason,
            timestamp: new Date()
        }

        session.changes.push(change)

        // Create updated transaction
        const updatedTransaction = {
            ...currentTransaction,
            [field]: newValue
        }

        // Generate new edit object
        const edit: TransactionEdit = {
            id: this.generateEditId(),
            originalTransaction: currentTransaction,
            updatedFields: { [field]: newValue },
            changes: session.changes,
            userEdited: true,
            suggestions: this.generateSuggestions(updatedTransaction),
            validationErrors: this.validateTransaction(updatedTransaction),
            lastModified: new Date()
        }

        return edit
    }

    /**
     * Complete transaction with missing information
     */
    completeTransaction(edit: TransactionEdit, completionData: Partial<ProcessedTransaction>): TransactionEdit {
        const completedTransaction = {
            ...edit.originalTransaction,
            ...edit.updatedFields,
            ...completionData
        }

        const finalEdit: TransactionEdit = {
            ...edit,
            originalTransaction: completedTransaction,
            updatedFields: {
                ...edit.updatedFields,
                ...completionData
            },
            suggestions: [],
            validationErrors: this.validateTransaction(completedTransaction),
            lastModified: new Date()
        }

        return finalEdit
    }

    /**
     * Get smart suggestions for transaction fields
     */
    getSmartSuggestions(transaction: ProcessedTransaction): TransactionSuggestion[] {
        const suggestions: TransactionSuggestion[] = []

        // Category suggestions
        if (!transaction.category || transaction.category === 'Other') {
            const categorySuggestion = this.suggestCategory(transaction)
            if (categorySuggestion) {
                suggestions.push(categorySuggestion)
            }
        }

        // Merchant suggestions
        if (!transaction.merchant) {
            const merchantSuggestion = this.suggestMerchant(transaction)
            if (merchantSuggestion) {
                suggestions.push(merchantSuggestion)
            }
        }

        // Reason suggestions
        if (!transaction.transactionReason) {
            const reasonSuggestion = this.suggestReason(transaction)
            if (reasonSuggestion) {
                suggestions.push(reasonSuggestion)
            }
        }

        // Location suggestions
        if (!transaction.location) {
            const locationSuggestion = this.suggestLocation(transaction)
            if (locationSuggestion) {
                suggestions.push(locationSuggestion)
            }
        }

        return suggestions
    }

    /**
     * Validate transaction data
     */
    validateTransaction(transaction: ProcessedTransaction): ValidationError[] {
        const errors: ValidationError[] = []

        // Amount validation
        if (!transaction.amount || transaction.amount <= 0) {
            errors.push({
                field: 'amount',
                message: 'Amount must be greater than 0',
                severity: 'error',
                code: 'INVALID_AMOUNT'
            })
        }

        // Bank validation
        if (!transaction.bank || transaction.bank === 'Unknown') {
            errors.push({
                field: 'bank',
                message: 'Bank could not be identified',
                severity: 'warning',
                code: 'UNKNOWN_BANK'
            })
        }

        // Category validation
        if (!transaction.category) {
            errors.push({
                field: 'category',
                message: 'Category is required for proper tracking',
                severity: 'warning',
                code: 'MISSING_CATEGORY'
            })
        }

        // Date validation
        if (!transaction.date || isNaN(transaction.date.getTime())) {
            errors.push({
                field: 'date',
                message: 'Valid date is required',
                severity: 'error',
                code: 'INVALID_DATE'
            })
        }

        // Confidence warning
        if (transaction.confidence < 0.5) {
            errors.push({
                field: 'confidence',
                message: 'Low parsing confidence - manual review recommended',
                severity: 'warning',
                code: 'LOW_CONFIDENCE'
            })
        }

        return errors
    }

    /**
     * Learn from user corrections
     */
    learnFromCorrection(transaction: ProcessedTransaction, userCorrections: Partial<ProcessedTransaction>): void {
        const merchant = transaction.merchant?.toLowerCase()
        if (merchant) {
            if (!this.merchantHistory.has(merchant)) {
                this.merchantHistory.set(merchant, [])
            }

            this.merchantHistory.get(merchant)!.push({
                merchant,
                correctedCategory: userCorrections.category || transaction.category,
                correctedReason: userCorrections.transactionReason || transaction.transactionReason,
                correctedLocation: userCorrections.location || transaction.location,
                amount: transaction.amount,
                type: transaction.type,
                frequency: 'unknown', // Would be calculated from pattern analysis
                userFeedback: 'positive' // Would be from user rating
            })
        }
    }

    // Private helper methods

    private processParsedSMS(parsed: MultiLanguageParsedSMS): ProcessedTransaction {
        const transaction: ProcessedTransaction = {
            id: this.generateTransactionId(),
            amount: parsed.amount,
            bank: parsed.bank,
            merchant: parsed.merchant,
            type: parsed.type,
            date: parsed.date ? new Date(parsed.date) : new Date(),
            reference: parsed.reference,
            balance: parsed.balance,
            category: getEnhancedCategory(parsed.merchant || parsed.bank),
            transactionReason: parsed.transactionReason,
            location: parsed.location,
            tags: [], // Will be populated below
            confidence: parsed.confidence,
            rawData: parsed,
            language: parsed.language,
            rawText: parsed.rawText
        }

        // Generate tags after creating the transaction object
        transaction.tags = this.generateTags(transaction)

        return transaction
    }

    private generateSuggestions(transaction: ProcessedTransaction): TransactionSuggestion[] {
        return this.getSmartSuggestions(transaction)
    }

    private suggestCategory(transaction: ProcessedTransaction): TransactionSuggestion | null {
        // Use enhanced category as base suggestion
        const suggestedCategory = getEnhancedCategory(transaction.merchant || transaction.bank)

        if (suggestedCategory !== transaction.category) {
            return {
                type: 'category',
                field: 'category',
                suggestedValue: suggestedCategory,
                confidence: 0.8,
                source: 'ai',
                description: `Based on merchant: ${transaction.merchant || transaction.bank}`
            }
        }

        return null
    }

    private suggestMerchant(transaction: ProcessedTransaction): TransactionSuggestion | null {
        // This would typically come from merchant history or AI suggestions
        // For now, return null as merchant extraction is already done in parsing
        return null
    }

    private suggestReason(transaction: ProcessedTransaction): TransactionSuggestion | null {
        const merchant = transaction.merchant?.toLowerCase() || ''
        const category = transaction.category.toLowerCase()

        // Find relevant reason suggestions
        for (const [key, reasons] of Object.entries(this.reasonSuggestions)) {
            if (merchant.includes(key) || category.includes(key)) {
                return {
                    type: 'reason',
                    field: 'transactionReason',
                    suggestedValue: reasons[0], // Take the first/most common reason
                    confidence: 0.7,
                    source: 'pattern',
                    description: `Common reason for ${key} transactions`
                }
            }
        }

        return null
    }

    private suggestLocation(transaction: ProcessedTransaction): TransactionSuggestion | null {
        const merchant = transaction.merchant?.toLowerCase() || ''

        // Find location suggestions based on merchant
        for (const [location, merchants] of Object.entries(this.merchantSuggestions)) {
            if (merchants.some(m => merchant.includes(location) || m.toLowerCase().includes(location))) {
                return {
                    type: 'completion',
                    field: 'location',
                    suggestedValue: location.charAt(0).toUpperCase() + location.slice(1),
                    confidence: 0.6,
                    source: 'pattern',
                    description: `Common location for ${merchant}`
                }
            }
        }

        return null
    }

    private generateTags(transaction: ProcessedTransaction): string[] {
        const tags: string[] = []

        // Add language tag
        if (transaction.language) {
            tags.push(transaction.language)
        }

        // Add confidence tag
        if (transaction.confidence > 0.8) {
            tags.push('high-confidence')
        } else if (transaction.confidence < 0.5) {
            tags.push('low-confidence')
        }

        // Add category tag
        if (transaction.category) {
            tags.push(`category:${transaction.category.toLowerCase()}`)
        }

        // Add bank tag
        if (transaction.bank) {
            tags.push(`bank:${transaction.bank.toLowerCase()}`)
        }

        return tags
    }

    private generateTransactionId(): string {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private generateEditId(): string {
        return `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private getTransactionById(id: string): ProcessedTransaction | null {
        // In a real implementation, this would fetch from database
        // For now, return a mock transaction
        return {
            id,
            amount: 100,
            bank: 'CBE',
            type: 'expense',
            date: new Date(),
            category: 'Other',
            tags: [],
            confidence: 0.8,
            rawData: {}
        }
    }
}

// Interfaces for additional data structures
interface UserPreferences {
    preferredCategories: Map<string, string>
    commonMerchants: Map<string, string>
    defaultLocations: string[]
    language: 'en' | 'am' | 'mixed'
}

interface MerchantData {
    merchant: string
    correctedCategory: string
    correctedReason?: string
    correctedLocation?: string
    amount: number
    type: 'expense' | 'income' | 'transfer'
    frequency: string
    userFeedback: string
}

// Export singleton instance
export const transactionEditor = TransactionEditor.getInstance()

// Export convenience functions
export function createTransactionFromSMS(smsText: string): TransactionEdit | null {
    return transactionEditor.createFromSMS(smsText)
}

export function startEditSession(transactionId: string, userId: string): EditSession {
    return transactionEditor.startEditSession(transactionId, userId)
}

export function applyTransactionChange(
    sessionId: string,
    field: keyof ProcessedTransaction,
    newValue: any,
    reason?: string
): TransactionEdit | null {
    return transactionEditor.applyChange(sessionId, field, newValue, reason)
}

export function completeTransaction(edit: TransactionEdit, completionData: Partial<ProcessedTransaction>): TransactionEdit {
    return transactionEditor.completeTransaction(edit, completionData)
}

export function validateTransactionData(transaction: ProcessedTransaction): ValidationError[] {
    return transactionEditor.validateTransaction(transaction)
}

export function getSmartSuggestions(transaction: ProcessedTransaction): TransactionSuggestion[] {
    return transactionEditor.getSmartSuggestions(transaction)
}