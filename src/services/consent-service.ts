import { createClient } from "@/lib/supabase/client"

export interface ConsentType {
    id: string
    code: string
    name: string
    description: string
    category: string
    legal_basis: string
    required: boolean
    is_active: boolean
}

export interface UserConsent {
    id: string
    user_id: string
    consent_type_id: string
    consent_type: ConsentType
    granted: boolean
    granted_at: string | null
    withdrawn_at: string | null
    method: string
    ip_address: string | null
    user_agent: string | null
    consent_version: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ConsentHistoryEntry {
    id: string
    user_consent_id: string
    user_id: string
    consent_type_id: string
    consent_type: ConsentType
    action: 'granted' | 'withdrawn' | 'updated'
    old_value: boolean | null
    new_value: boolean
    method: string
    reason: string | null
    ip_address: string | null
    user_agent: string | null
    session_id: string | null
    created_at: string
}

export interface ConsentValidationResult {
    isValid: boolean
    granted: boolean
    consentType: ConsentType
    reason?: string
}

/**
 * GDPR-Compliant Consent Management Service
 * 
 * This service provides comprehensive consent management functionality including:
 * - Consent validation and enforcement
 * - Consent history tracking
 * - Integration with existing services
 * - Audit logging for compliance
 */
class ConsentService {
    private supabase = createClient()

    // ============= CONSENT TYPE MANAGEMENT =============

    /**
     * Get all available consent types
     */
    async getConsentTypes(): Promise<ConsentType[]> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return []
        }

        const { data, error } = await this.supabase
            .from('consent_types')
            .select('*')
            .eq('is_active', true)
            .order('category', { ascending: true })

        if (error) {
            console.error('[ConsentService] Error fetching consent types:', error)
            return []
        }

        return data || []
    }

    /**
     * Get consent types by category
     */
    async getConsentTypesByCategory(category: string): Promise<ConsentType[]> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return []
        }

        const { data, error } = await this.supabase
            .from('consent_types')
            .select('*')
            .eq('is_active', true)
            .eq('category', category)
            .order('name', { ascending: true })

        if (error) {
            console.error('[ConsentService] Error fetching consent types by category:', error)
            return []
        }

        return data || []
    }

    // ============= USER CONSENT MANAGEMENT =============

    /**
     * Get user's current consents
     */
    async getUserConsents(userId: string): Promise<UserConsent[]> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return []
        }

        const { data, error } = await this.supabase
            .from('user_consents')
            .select(`
        *,
        consent_type:consent_types(*)
      `)
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[ConsentService] Error fetching user consents:', error)
            return []
        }

        return (data || []).map(item => ({
            ...item,
            consent_type: item.consent_types
        })).filter(item => item.consent_type)
    }

    /**
     * Get user's specific consent by type code
     */
    async getUserConsent(userId: string, consentTypeCode: string): Promise<UserConsent | null> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return null
        }

        const { data, error } = await this.supabase
            .from('user_consents')
            .select(`
        *,
        consent_type:consent_types(*)
      `)
            .eq('user_id', userId)
            .eq('consent_type.code', consentTypeCode)
            .eq('is_active', true)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('[ConsentService] Error fetching user consent:', error)
            return null
        }

        if (!data) return null

        return {
            ...data,
            consent_type: data.consent_types
        }
    }

    /**
     * Update user consent
     */
    async updateConsent(
        userId: string,
        consentTypeCode: string,
        granted: boolean,
        method: 'explicit' | 'implied' | 'system' = 'explicit',
        reason?: string
    ): Promise<boolean> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return false
        }

        try {
            // Get user's IP and user agent for audit trail
            const ipAddress = this.getClientIP()
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null

            // Use the database function for consistent logging
            const { error } = await this.supabase.rpc('update_user_consent', {
                p_user_id: userId,
                p_consent_type_code: consentTypeCode,
                p_granted: granted,
                p_method: method,
                p_ip_address: ipAddress,
                p_user_agent: userAgent
            })

            if (error) {
                console.error('[ConsentService] Error updating consent:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('[ConsentService] Error in updateConsent:', error)
            return false
        }
    }

    /**
     * Grant or withdraw consent with detailed audit trail
     */
    async grantConsent(
        userId: string,
        consentTypeCode: string,
        method: 'explicit' | 'implied' | 'system' = 'explicit'
    ): Promise<boolean> {
        return this.updateConsent(userId, consentTypeCode, true, method)
    }

    /**
     * Withdraw consent with audit trail
     */
    async withdrawConsent(
        userId: string,
        consentTypeCode: string,
        reason?: string
    ): Promise<boolean> {
        return this.updateConsent(userId, consentTypeCode, false, 'explicit', reason)
    }

    /**
     * Check if user has granted consent for a specific type
     */
    async hasConsent(userId: string, consentTypeCode: string): Promise<boolean> {
        const consent = await this.getUserConsent(userId, consentTypeCode)
        return consent ? consent.granted : false
    }

    // ============= CONSENT VALIDATION =============

    /**
     * Validate consent before processing sensitive data
     */
    async validateConsent(userId: string, consentTypeCode: string): Promise<ConsentValidationResult> {
        const consentType = await this.getConsentTypeByCode(consentTypeCode)

        if (!consentType) {
            return {
                isValid: false,
                granted: false,
                consentType: null as any,
                reason: 'Invalid consent type'
            }
        }

        const userConsent = await this.getUserConsent(userId, consentTypeCode)

        if (!userConsent) {
            return {
                isValid: false,
                granted: false,
                consentType,
                reason: 'No consent record found'
            }
        }

        if (!userConsent.granted) {
            return {
                isValid: false,
                granted: false,
                consentType,
                reason: 'Consent withdrawn or not granted'
            }
        }

        // Check if consent is within valid timeframe (optional - can be configured)
        const consentAge = Date.now() - new Date(userConsent.granted_at!).getTime()
        const maxConsentAge = 365 * 24 * 60 * 60 * 1000 // 1 year

        if (consentAge > maxConsentAge) {
            return {
                isValid: false,
                granted: false,
                consentType,
                reason: 'Consent expired'
            }
        }

        return {
            isValid: true,
            granted: true,
            consentType
        }
    }

    /**
     * Validate multiple consents at once
     */
    async validateConsents(userId: string, consentTypeCodes: string[]): Promise<{
        valid: string[]
        invalid: { code: string; reason: string }[]
    }> {
        const valid: string[] = []
        const invalid: { code: string; reason: string }[] = []

        for (const code of consentTypeCodes) {
            const validation = await this.validateConsent(userId, code)
            if (validation.isValid) {
                valid.push(code)
            } else {
                invalid.push({ code, reason: validation.reason || 'Unknown reason' })
            }
        }

        return { valid, invalid }
    }

    // ============= CONSENT HISTORY =============

    /**
     * Get user's consent history
     */
    async getConsentHistory(userId: string, limit = 100): Promise<ConsentHistoryEntry[]> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return []
        }

        const { data, error } = await this.supabase
            .from('consent_history')
            .select(`
        *,
        consent_type:consent_types(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('[ConsentService] Error fetching consent history:', error)
            return []
        }

        return (data || []).map(item => ({
            ...item,
            consent_type: item.consent_types
        })).filter(item => item.consent_type)
    }

    // ============= INTEGRATION HELPERS =============

    /**
     * Check consent before SMS parsing
     */
    async validateSMSParsingConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'sms_parsing')
    }

    /**
     * Check consent before AI processing
     */
    async validateAIProcessingConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'ai_advisor')
    }

    /**
     * Check consent before voice processing
     */
    async validateVoiceProcessingConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'voice_processing')
    }

    /**
     * Check consent before receipt analysis
     */
    async validateReceiptAnalysisConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'receipt_analysis')
    }

    /**
     * Check consent before data sharing
     */
    async validateDataSharingConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'data_sharing')
    }

    /**
     * Check consent before marketing
     */
    async validateMarketingConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'marketing')
    }

    /**
     * Check consent before analytics
     */
    async validateAnalyticsConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'analytics')
    }

    /**
     * Check consent before community features
     */
    async validateCommunityConsent(userId: string): Promise<ConsentValidationResult> {
        return this.validateConsent(userId, 'community')
    }

    // ============= UTILITY METHODS =============

    /**
     * Get consent type by code
     */
    private async getConsentTypeByCode(code: string): Promise<ConsentType | null> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return null
        }

        const { data, error } = await this.supabase
            .from('consent_types')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single()

        if (error) {
            console.error('[ConsentService] Error fetching consent type:', error)
            return null
        }

        return data
    }

    /**
     * Get client IP address (for audit logging)
     */
    private getClientIP(): string | null {
        try {
            // In a real implementation, this would be handled server-side
            // For client-side, we can't reliably get the actual IP
            return null
        } catch {
            return null
        }
    }

    /**
     * Export user data for GDPR compliance (consent information)
     */
    async exportUserConsentData(userId: string): Promise<{
        consents: UserConsent[]
        history: ConsentHistoryEntry[]
        exportDate: string
    }> {
        const [consents, history] = await Promise.all([
            this.getUserConsents(userId),
            this.getConsentHistory(userId, 1000) // Get full history
        ])

        return {
            consents,
            history,
            exportDate: new Date().toISOString()
        }
    }

    /**
     * Delete all user consent data (for GDPR right to be forgotten)
     */
    async deleteAllUserConsentData(userId: string): Promise<boolean> {
        if (!this.supabase) {
            console.warn('[ConsentService] Supabase not configured')
            return false
        }

        try {
            // Delete consent history first (due to foreign key constraints)
            const { error: historyError } = await this.supabase
                .from('consent_history')
                .delete()
                .eq('user_id', userId)

            if (historyError) {
                console.error('[ConsentService] Error deleting consent history:', historyError)
                return false
            }

            // Delete user consents
            const { error: consentsError } = await this.supabase
                .from('user_consents')
                .delete()
                .eq('user_id', userId)

            if (consentsError) {
                console.error('[ConsentService] Error deleting user consents:', consentsError)
                return false
            }

            return true
        } catch (error) {
            console.error('[ConsentService] Error in deleteAllUserConsentData:', error)
            return false
        }
    }
}

// Export singleton instance
export const consentService = new ConsentService()

// Export individual functions for convenience
export const {
    getConsentTypes,
    getConsentTypesByCategory,
    getUserConsents,
    getUserConsent,
    updateConsent,
    grantConsent,
    withdrawConsent,
    hasConsent,
    validateConsent,
    validateConsents,
    getConsentHistory,
    validateSMSParsingConsent,
    validateAIProcessingConsent,
    validateVoiceProcessingConsent,
    validateReceiptAnalysisConsent,
    validateDataSharingConsent,
    validateMarketingConsent,
    validateAnalyticsConsent,
    validateCommunityConsent,
    exportUserConsentData,
    deleteAllUserConsentData
} = consentService

export default consentService