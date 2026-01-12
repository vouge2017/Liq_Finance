/**
 * Enhanced Bank SMS Parser with Consent Management
 * Integrates consent validation before processing bank SMS messages
 */

import { consentService } from '@/services/consent-service'
import { parseBankSMS, type ParsedSMS, getCategoryFromMerchant } from './sms-parser'

export interface ConsentSMSParseResult {
    success: boolean
    data?: ParsedSMS
    error?: string
    consentRequired?: boolean
}

export interface ValidationResult {
    isValid: boolean
    issues: string[]
    suggestions: string[]
}

// Re-export types from sms-parser for convenience
export type EnhancedParsedSMS = ParsedSMS & { confidence?: number }

/**
 * Parse a bank SMS message and extract transaction details (enhanced version)
 */
export function parseEnhancedSMS(sms: string): EnhancedParsedSMS | null {
    const result = parseBankSMS(sms)
    if (result) {
        return {
            ...result,
            confidence: 0.85
        }
    }
    return null
}

/**
 * Get suggested category based on merchant name (enhanced version)
 */
export function getEnhancedCategory(merchant: string): string {
    return getCategoryFromMerchant(merchant)
}

/**
 * Validate parsed SMS data
 */
export function validateParsedSMS(data: EnhancedParsedSMS): ValidationResult {
    const issues: string[] = []
    const suggestions: string[] = []

    if (!data || typeof data.bank !== 'string') {
        issues.push('Bank information not detected')
    }
    if (!data || typeof data.type !== 'string') {
        issues.push('Transaction type not detected')
    }
    if (!data || typeof data.amount !== 'number' || data.amount <= 0) {
        issues.push('Invalid or missing amount')
    }

    if (data.bank === 'Unknown') {
        suggestions.push('Bank name could not be determined - consider checking the SMS format')
    }
    if (!data.merchant && data.type === 'expense') {
        suggestions.push('Merchant name not detected - manual review may be needed')
    }

    return {
        isValid: issues.length === 0,
        issues,
        suggestions
    }
}

/**
 * Enhanced SMS parser that validates consent before processing
 */
export class ConsentSMSParser {
    /**
     * Parse SMS with consent validation
     */
    async parseSMSWithConsent(sms: string, userId: string): Promise<ConsentSMSParseResult> {
        try {
            // First check if user has SMS parsing consent
            const consentValidation = await consentService.validateSMSParsingConsent(userId)

            if (!consentValidation.isValid) {
                return {
                    success: false,
                    error: 'SMS parsing consent required',
                    consentRequired: true
                }
            }

            // Parse the SMS using the existing parser
            const parsedData = parseBankSMS(sms)

            if (!parsedData) {
                return {
                    success: false,
                    error: 'Could not parse SMS message'
                }
            }

            return {
                success: true,
                data: parsedData
            }
        } catch (error) {
            console.error('Error in consent SMS parsing:', error)
            return {
                success: false,
                error: 'Failed to process SMS with consent validation'
            }
        }
    }

    /**
     * Check if SMS parsing consent is required for a user
     */
    async requiresSMSConsent(userId: string): Promise<boolean> {
        try {
            const consentValidation = await consentService.validateSMSParsingConsent(userId)
            return !consentValidation.isValid
        } catch (error) {
            console.error('Error checking SMS consent requirement:', error)
            return true // Default to requiring consent for safety
        }
    }

    /**
     * Get consent status for SMS parsing
     */
    async getSMSConsentStatus(userId: string): Promise<{
        hasConsent: boolean
        isRequired: boolean
        reason?: string
    }> {
        try {
            const consentValidation = await consentService.validateSMSParsingConsent(userId)

            return {
                hasConsent: consentValidation.isValid && consentValidation.granted,
                isRequired: consentValidation.consentType?.required || false,
                reason: consentValidation.reason
            }
        } catch (error) {
            console.error('Error getting SMS consent status:', error)
            return {
                hasConsent: false,
                isRequired: true
            }
        }
    }
}

// Export singleton instance
export const consentSMSParser = new ConsentSMSParser()

// Export convenience functions
export const {
    parseSMSWithConsent,
    requiresSMSConsent,
    getSMSConsentStatus
} = consentSMSParser

export default consentSMSParser