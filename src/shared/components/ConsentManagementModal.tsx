import React, { useState, useEffect } from 'react'
import { X, Shield, CheckCircle, AlertCircle, Info, Eye, EyeOff } from 'lucide-react'
import { consentService, type ConsentType, type UserConsent } from '@/services/consent-service'
import { useAuth } from '@/context/AuthContext'

interface ConsentManagementModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    onConsentChange?: () => void
}

export const ConsentManagementModal: React.FC<ConsentManagementModalProps> = ({
    isOpen,
    onClose,
    userId,
    onConsentChange
}) => {
    const [consentTypes, setConsentTypes] = useState<ConsentType[]>([])
    const [userConsents, setUserConsents] = useState<UserConsent[]>([])
    const [consentHistory, setConsentHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
    const [showDetails, setShowDetails] = useState<string[]>([])

    useEffect(() => {
        if (isOpen && userId) {
            loadConsentData()
        }
    }, [isOpen, userId])

    const loadConsentData = async () => {
        setLoading(true)
        try {
            const [types, consents, history] = await Promise.all([
                consentService.getConsentTypes(),
                consentService.getUserConsents(userId),
                consentService.getConsentHistory(userId, 50)
            ])

            setConsentTypes(types)
            setUserConsents(consents)
            setConsentHistory(history)
        } catch (error) {
            console.error('Error loading consent data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConsentChange = async (consentTypeCode: string, granted: boolean) => {
        try {
            const success = await consentService.updateConsent(
                userId,
                consentTypeCode,
                granted,
                'explicit'
            )

            if (success) {
                await loadConsentData()
                onConsentChange?.()
            }
        } catch (error) {
            console.error('Error updating consent:', error)
        }
    }

    const getUserConsent = (consentTypeCode: string): UserConsent | null => {
        return userConsents.find(consent => consent.consent_type.code === consentTypeCode) || null
    }

    const getConsentStatus = (consentType: ConsentType): 'granted' | 'withdrawn' | 'not_set' => {
        const userConsent = getUserConsent(consentType.code)
        if (!userConsent) return 'not_set'
        return userConsent.granted ? 'granted' : 'withdrawn'
    }

    const toggleDetails = (consentTypeCode: string) => {
        setShowDetails(prev =>
            prev.includes(consentTypeCode)
                ? prev.filter(code => code !== consentTypeCode)
                : [...prev, consentTypeCode]
        )
    }

    const groupConsentTypes = (types: ConsentType[]) => {
        return types.reduce((groups, type) => {
            const category = type.category
            if (!groups[category]) {
                groups[category] = []
            }
            groups[category].push(type)
            return groups
        }, {} as Record<string, ConsentType[]>)
    }

    const getConsentIcon = (status: string) => {
        switch (status) {
            case 'granted':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'withdrawn':
                return <X className="w-5 h-5 text-red-500" />
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />
        }
    }

    const getConsentColor = (status: string) => {
        switch (status) {
            case 'granted':
                return 'border-green-200 bg-green-50'
            case 'withdrawn':
                return 'border-red-200 bg-red-50'
            default:
                return 'border-gray-200 bg-gray-50'
        }
    }

    if (!isOpen) return null

    const groupedTypes = groupConsentTypes(consentTypes)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">GDPR Consent Management</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'current'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Current Consents
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'history'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Consent History
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : activeTab === 'current' ? (
                        <div className="space-y-6">
                            {/* GDPR Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-2">Your Privacy Rights</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• You can withdraw consent at any time</li>
                                            <li>• We only process data with your explicit consent</li>
                                            <li>• You can export or delete your data anytime</li>
                                            <li>• All consent changes are logged for transparency</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Consent Types by Category */}
                            {Object.entries(groupedTypes).map(([category, types]) => (
                                <div key={category} className="space-y-3">
                                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                                        {category.replace('_', ' ')} Features
                                    </h3>

                                    <div className="space-y-3">
                                        {types.map((consentType) => {
                                            const status = getConsentStatus(consentType)
                                            const userConsent = getUserConsent(consentType.code)
                                            const isExpanded = showDetails.includes(consentType.code)

                                            return (
                                                <div
                                                    key={consentType.id}
                                                    className={`border rounded-lg p-4 ${getConsentColor(status)}`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {getConsentIcon(status)}
                                                                <h4 className="font-medium text-gray-900">
                                                                    {consentType.name}
                                                                </h4>
                                                                {consentType.required && (
                                                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-sm text-gray-600 mb-3">
                                                                {consentType.description}
                                                            </p>

                                                            {/* Expandable Details */}
                                                            <button
                                                                onClick={() => toggleDetails(consentType.code)}
                                                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <EyeOff className="w-4 h-4" />
                                                                        Hide details
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="w-4 h-4" />
                                                                        Show details
                                                                    </>
                                                                )}
                                                            </button>

                                                            {isExpanded && (
                                                                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border text-xs">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <span className="font-medium">Legal Basis:</span>
                                                                            <span className="ml-2 capitalize">{consentType.legal_basis}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Category:</span>
                                                                            <span className="ml-2 capitalize">{consentType.category}</span>
                                                                        </div>
                                                                    </div>
                                                                    {userConsent && (
                                                                        <div className="mt-2 pt-2 border-t">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <span className="font-medium">Granted:</span>
                                                                                    <span className="ml-2">
                                                                                        {userConsent.granted_at
                                                                                            ? new Date(userConsent.granted_at).toLocaleDateString()
                                                                                            : 'N/A'
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium">Method:</span>
                                                                                    <span className="ml-2 capitalize">{userConsent.method}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Toggle Switch */}
                                                        <div className="ml-4">
                                                            <button
                                                                onClick={() => handleConsentChange(
                                                                    consentType.code,
                                                                    status !== 'granted'
                                                                )}
                                                                disabled={consentType.required}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${status === 'granted'
                                                                        ? 'bg-blue-600'
                                                                        : 'bg-gray-300'
                                                                    } ${consentType.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status === 'granted' ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Consent History Tab */
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Recent Consent Changes</h3>

                            {consentHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No consent history available
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {consentHistory.map((entry) => (
                                        <div key={entry.id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {entry.action === 'granted' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : entry.action === 'withdrawn' ? (
                                                        <X className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <Info className="w-5 h-5 text-blue-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} {entry.consent_type?.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(entry.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.action === 'granted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : entry.action === 'withdrawn'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {entry.action}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1 capitalize">
                                                        via {entry.method}
                                                    </p>
                                                </div>
                                            </div>

                                            {entry.reason && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <span className="font-medium">Reason:</span> {entry.reason}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        Your consent preferences are stored securely and can be changed at any time.
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConsentManagementModal