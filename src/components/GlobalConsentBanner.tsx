/**
 * Global Consent Banner Component
 * Shows consent requests to users who haven't granted sufficient consent
 */

import React, { useState, useEffect } from 'react'
import { Shield, X, ChevronRight, AlertCircle } from 'lucide-react'
import { useConsent } from '@/hooks/useConsent'
import { useAuth } from '@/context/AuthContext'
import { Icons } from '@/shared/components/Icons'

interface GlobalConsentBannerProps {
    onConsentUpdate?: () => void
    onManageConsent?: () => void
}

export const GlobalConsentBanner: React.FC<GlobalConsentBannerProps> = ({
    onConsentUpdate,
    onManageConsent
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const { user } = useAuth()
    const { consents, consentTypes, hasConsent, loading } = useConsent()

    useEffect(() => {
        checkIfConsentBannerShouldShow()
    }, [user, consents, consentTypes])

    const checkIfConsentBannerShouldShow = () => {
        if (!user?.id || loading) return

        // Show banner if user has no consent records or very few consents
        const essentialConsents = ['sms_parsing', 'ai_advisor', 'voice_processing']
        const hasEssentialConsents = essentialConsents.some(consentType => hasConsent(consentType))

        // Don't show if user has dismissed the banner or has essential consents
        if (dismissed || hasEssentialConsents || consents.length >= 3) {
            setIsVisible(false)
        } else {
            setIsVisible(true)
        }
    }

    const handleManageConsent = () => {
        setIsVisible(false)
        onManageConsent?.()
        onConsentUpdate?.()
    }

    const handleDismiss = () => {
        setDismissed(true)
        setIsVisible(false)
        // Store dismissal in localStorage to prevent showing again for a while
        localStorage.setItem('consent_banner_dismissed', Date.now().toString())
    }

    if (!isVisible || !user?.id) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[150] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Shield size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">
                                Privacy & Consent Settings
                            </p>
                            <p className="text-xs opacity-90">
                                Customize how we process your data for better financial insights
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleManageConsent}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
                        >
                            Manage
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Quick consent preview */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {['sms_parsing', 'ai_advisor', 'voice_processing'].map(consentType => {
                        const type = consentTypes.find(t => t.code === consentType)
                        const hasUserConsent = hasConsent(consentType)

                        if (!type) return null

                        return (
                            <div
                                key={consentType}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${hasUserConsent
                                        ? 'bg-emerald-500/20 text-emerald-100'
                                        : 'bg-white/10 text-white'
                                    }`}
                            >
                                {hasUserConsent ? (
                                    <Icons.CheckCircle size={12} />
                                ) : (
                                    <AlertCircle size={12} />
                                )}
                                <span>{type.name}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default GlobalConsentBanner