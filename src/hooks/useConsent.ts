import { useState, useEffect } from 'react'
import { consentService, type UserConsent, type ConsentType } from '@/services/consent-service'
import { useAuth } from '@/context/AuthContext'

interface UseConsentReturn {
    consents: UserConsent[]
    consentTypes: ConsentType[]
    loading: boolean
    error: string | null
    hasConsent: (consentTypeCode: string) => boolean
    updateConsent: (consentTypeCode: string, granted: boolean) => Promise<boolean>
    grantConsent: (consentTypeCode: string) => Promise<boolean>
    withdrawConsent: (consentTypeCode: string, reason?: string) => Promise<boolean>
    refreshConsents: () => Promise<void>
    exportConsentData: () => Promise<any>
    deleteAllConsentData: () => Promise<boolean>
}

export const useConsent = (): UseConsentReturn => {
    const [consents, setConsents] = useState<UserConsent[]>([])
    const [consentTypes, setConsentTypes] = useState<ConsentType[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const refreshConsents = async () => {
        if (!user?.id) return

        setLoading(true)
        setError(null)

        try {
            const [userConsents, types] = await Promise.all([
                consentService.getUserConsents(user.id),
                consentService.getConsentTypes()
            ])

            setConsents(userConsents)
            setConsentTypes(types)
        } catch (err) {
            setError('Failed to load consent data')
            console.error('Error loading consent data:', err)
        } finally {
            setLoading(false)
        }
    }

    const hasConsent = (consentTypeCode: string): boolean => {
        const consent = consents.find(c => c.consent_type.code === consentTypeCode)
        return consent ? consent.granted : false
    }

    const updateConsent = async (consentTypeCode: string, granted: boolean): Promise<boolean> => {
        if (!user?.id) return false

        try {
            const success = await consentService.updateConsent(
                user.id,
                consentTypeCode,
                granted,
                'explicit'
            )

            if (success) {
                await refreshConsents()
            }

            return success
        } catch (err) {
            setError('Failed to update consent')
            console.error('Error updating consent:', err)
            return false
        }
    }

    const grantConsent = async (consentTypeCode: string): Promise<boolean> => {
        return updateConsent(consentTypeCode, true)
    }

    const withdrawConsent = async (consentTypeCode: string, reason?: string): Promise<boolean> => {
        return updateConsent(consentTypeCode, false)
    }

    const exportConsentData = async () => {
        if (!user?.id) return null

        try {
            return await consentService.exportUserConsentData(user.id)
        } catch (err) {
            setError('Failed to export consent data')
            console.error('Error exporting consent data:', err)
            return null
        }
    }

    const deleteAllConsentData = async (): Promise<boolean> => {
        if (!user?.id) return false

        try {
            const success = await consentService.deleteAllUserConsentData(user.id)
            if (success) {
                await refreshConsents()
            }
            return success
        } catch (err) {
            setError('Failed to delete consent data')
            console.error('Error deleting consent data:', err)
            return false
        }
    }

    useEffect(() => {
        if (user?.id) {
            refreshConsents()
        } else {
            setConsents([])
            setConsentTypes([])
            setError(null)
        }
    }, [user?.id])

    return {
        consents,
        consentTypes,
        loading,
        error,
        hasConsent,
        updateConsent,
        grantConsent,
        withdrawConsent,
        refreshConsents,
        exportConsentData,
        deleteAllConsentData
    }
}

export default useConsent