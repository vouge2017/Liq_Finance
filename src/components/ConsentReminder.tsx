/**
 * Consent Reminder Component
 * Shows reminders for features that require consent
 */

import React, { useState } from 'react'
import { Shield, AlertTriangle, ChevronRight, X } from 'lucide-react'
import { useConsent } from '@/hooks/useConsent'

interface ConsentReminderProps {
    consentType: string
    featureName: string
    description?: string
    onConsentGranted?: () => void
    onDismiss?: () => void
    className?: string
}

export const ConsentReminder: React.FC<ConsentReminderProps> = ({
    consentType,
    featureName,
    description,
    onConsentGranted,
    onDismiss,
    className = ''
}) => {
    const { hasConsent, consentTypes, updateConsent, loading } = useConsent()
    const [isUpdating, setIsUpdating] = useState(false)

    const hasUserConsent = hasConsent(consentType)
    const consentTypeInfo = consentTypes.find(t => t.code === consentType)

    // Don't show if user already has consent
    if (hasUserConsent) return null

    const handleGrantConsent = async () => {
        setIsUpdating(true)
        try {
            await updateConsent(consentType, true)
            onConsentGranted?.()
        } catch (error) {
            console.error('Error granting consent:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDismiss = () => {
        onDismiss?.()
    }

    return (
        <div className={`bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield size={18} className="text-amber-500" />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h4 className="font-bold text-amber-400 mb-1">
                                {featureName} Requires Consent
                            </h4>
                            <p className="text-sm text-amber-200 mb-3">
                                {description || `To use ${featureName}, we need your consent to process ${consentTypeInfo?.name || consentType} data.`}
                            </p>

                            {/* Consent Details */}
                            {consentTypeInfo && (
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-amber-300 font-medium mb-1">
                                        What we process:
                                    </p>
                                    <p className="text-xs text-amber-200">
                                        {consentTypeInfo.description}
                                    </p>
                                    <p className="text-xs text-amber-300 mt-2">
                                        Legal basis: {consentTypeInfo.legal_basis}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-amber-500/20 rounded transition-colors flex-shrink-0"
                        >
                            <X size={16} className="text-amber-400" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleGrantConsent}
                            disabled={isUpdating || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Granting...
                                </>
                            ) : (
                                <>
                                    <Shield size={16} />
                                    Grant Consent
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => window.location.hash = '#consent-settings'}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-bold text-sm transition-colors"
                        >
                            Manage All
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConsentReminder