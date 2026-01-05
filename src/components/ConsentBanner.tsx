import React, { useState, useEffect } from 'react'
import { Shield, X, CheckCircle, Info } from 'lucide-react'
import { consentService } from '@/services/consent-service'
import { useAuth } from '@/context/AuthContext'

interface ConsentBannerProps {
    onConsentUpdate?: () => void
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onConsentUpdate }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        checkConsentStatus()
    }, [user])

    const checkConsentStatus = async () => {
        if (!user?.id) return

        try {
            // Check if user has any consent records
            const consents = await consentService.getUserConsents(user.id)

            // Show banner if user has no consents or very few consents (less than 3)
            if (consents.length < 3) {
                setIsVisible(true)
            }
        } catch (error) {
            console.error('Error checking consent status:', error)
        }
    }

    const handleAcceptAll = async () => {
        if (!user?.id) return

        setLoading(true)
        try {
            const consentTypes = await consentService.getConsentTypes()

            // Grant consent for all non-required types
            const nonRequiredTypes = consentTypes.filter(type => !type.required)

            await Promise.all(
                nonRequiredTypes.map(type =>
                    consentService.grantConsent(user.id, type.code, 'explicit')
                )
            )

            setIsVisible(false)
            onConsentUpdate?.()
        } catch (error) {
            console.error('Error accepting consents:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptEssential = async () => {
        if (!user?.id) return

        setLoading(true)
        try {
            // Only grant consent for essential/processing types
            const essentialTypes = ['sms_parsing', 'ai_advisor', 'voice_processing', 'receipt_analysis']

            await Promise.all(
                essentialTypes.map(type =>
                    consentService.grantConsent(user.id, type, 'explicit')
                )
            )

            setIsVisible(false)
            onConsentUpdate?.()
        } catch (error) {
            console.error('Error accepting essential consents:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCustomize = () => {
        setExpanded(!expanded)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Privacy & Consent Settings
                        </h3>

                        <p className="text-gray-600 mb-4">
                            We use your data to provide personalized financial insights and automate transaction tracking.
                            You can customize what data we process or withdraw consent at any time.
                        </p>

                        {!expanded ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAcceptEssential}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    Accept Essential
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    disabled={loading}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Accept All
                                </button>
                                <button
                                    onClick={handleCustomize}
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Customize
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-2">What we process:</p>
                                            <ul className="space-y-1 text-xs">
                                                <li>• <strong>SMS Parsing:</strong> Transaction data from bank messages</li>
                                                <li>• <strong>AI Advisor:</strong> Financial insights and recommendations</li>
                                                <li>• <strong>Voice Processing:</strong> Voice-to-text for transaction entry</li>
                                                <li>• <strong>Receipt Analysis:</strong> Image recognition for receipts</li>
                                                <li>• <strong>Analytics:</strong> Anonymous usage data to improve the app</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAcceptEssential}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Accept Selected
                                    </button>
                                    <button
                                        onClick={() => setExpanded(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConsentBanner