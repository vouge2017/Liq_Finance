/**
 * Consent Status Indicator Component
 * Shows consent status for various features throughout the app
 */

import React from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useConsent } from '@/hooks/useConsent'

interface ConsentStatusIndicatorProps {
    consentTypes: string[]
    size?: 'sm' | 'md' | 'lg'
    showLabels?: boolean
    className?: string
}

export const ConsentStatusIndicator: React.FC<ConsentStatusIndicatorProps> = ({
    consentTypes,
    size = 'md',
    showLabels = true,
    className = ''
}) => {
    const { hasConsent, consentTypes: allConsentTypes } = useConsent()

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    const getStatusForConsent = (consentType: string) => {
        const hasUserConsent = hasConsent(consentType)
        const consentTypeInfo = allConsentTypes.find(t => t.code === consentType)
        const isRequired = consentTypeInfo?.required || false

        return {
            hasConsent: hasUserConsent,
            isRequired,
            name: consentTypeInfo?.name || consentType,
            status: hasUserConsent ? 'granted' : (isRequired ? 'required' : 'not_granted')
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'granted':
                return <CheckCircle className="text-emerald-500" size={16} />
            case 'required':
                return <AlertTriangle className="text-amber-500" size={16} />
            case 'not_granted':
                return <XCircle className="text-red-500" size={16} />
            default:
                return <Shield className="text-gray-500" size={16} />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'granted':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
            case 'required':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            case 'not_granted':
                return 'text-red-400 bg-red-500/10 border-red-500/30'
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
        }
    }

    if (consentTypes.length === 0) return null

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Overall Status Icon */}
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}>
                <Shield size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-blue-400" />
            </div>

            {/* Individual Consent Status */}
            <div className="flex flex-wrap gap-2">
                {consentTypes.map(consentType => {
                    const status = getStatusForConsent(consentType)

                    return (
                        <div
                            key={consentType}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${getStatusColor(status.status)}`}
                        >
                            {getStatusIcon(status.status)}
                            {showLabels && (
                                <span className={`font-medium ${textSizeClasses[size]}`}>
                                    {status.name}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ConsentStatusIndicator