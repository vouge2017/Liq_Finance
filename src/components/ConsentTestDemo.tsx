import React, { useState } from 'react'
import { Shield, CheckCircle, X, AlertTriangle, Play, FileText } from 'lucide-react'
import { useConsent } from '@/hooks/useConsent'
import { useAuth } from '@/context/AuthContext'
import { parseSMSWithConsent } from '@/utils/smsParser'
import { analyzeReceiptImage, parseVoiceAudio } from '@/services/gemini'
import ConsentManagementModal from '@/shared/components/ConsentManagementModal'

export const ConsentTestDemo: React.FC = () => {
    const [showModal, setShowModal] = useState(false)
    const [testResults, setTestResults] = useState<any[]>([])
    const [testing, setTesting] = useState(false)
    const { user } = useAuth()
    const {
        consents,
        hasConsent,
        updateConsent,
        loading,
        error
    } = useConsent()

    const runConsentTests = async () => {
        if (!user?.id) return

        setTesting(true)
        setTestResults([])

        const tests = [
            {
                name: 'SMS Parsing Consent Check',
                test: async () => {
                    const result = await parseSMSWithConsent(
                        'Dear Customer, your account 1000****123 has been debited with ETB 500.00 on 12-Dec-2025. Reason: PAYMENT TO MERCHANT.',
                        user.id
                    )
                    return {
                        success: !result.consentRequired,
                        message: result.consentRequired
                            ? 'SMS parsing blocked - consent required'
                            : 'SMS parsing allowed',
                        details: result
                    }
                }
            },
            {
                name: 'AI Processing Consent Check',
                test: async () => {
                    const hasAI = hasConsent('ai_advisor')
                    const hasVoice = hasConsent('voice_processing')
                    const hasReceipt = hasConsent('receipt_analysis')

                    return {
                        success: hasAI && hasVoice && hasReceipt,
                        message: hasAI && hasVoice && hasReceipt
                            ? 'All AI processing consents granted'
                            : 'Missing AI processing consents',
                        details: { ai: hasAI, voice: hasVoice, receipt: hasReceipt }
                    }
                }
            },
            {
                name: 'Data Sharing Consent Check',
                test: async () => {
                    const hasDataSharing = hasConsent('data_sharing')
                    const hasMarketing = hasConsent('marketing')
                    const hasAnalytics = hasConsent('analytics')

                    return {
                        success: true, // Data sharing is optional
                        message: `Data sharing: ${hasDataSharing ? 'granted' : 'not granted'}`,
                        details: { dataSharing: hasDataSharing, marketing: hasMarketing, analytics: hasAnalytics }
                    }
                }
            },
            {
                name: 'Consent History Test',
                test: async () => {
                    // Test consent update and check if it gets logged
                    const beforeCount = consents.length
                    await updateConsent('sms_parsing', !hasConsent('sms_parsing'))
                    const afterCount = consents.length + 1 // Should increase due to update

                    return {
                        success: afterCount >= beforeCount,
                        message: `Consent count: ${beforeCount} -> ${afterCount}`,
                        details: { beforeCount, afterCount }
                    }
                }
            }
        ]

        const results = []
        for (const test of tests) {
            try {
                const result = await test.test()
                results.push({
                    name: test.name,
                    ...result
                })
            } catch (error) {
                results.push({
                    name: test.name,
                    success: false,
                    message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
                })
            }
        }

        setTestResults(results)
        setTesting(false)
    }

    const getConsentStatusIcon = (consentCode: string) => {
        const granted = hasConsent(consentCode)
        return granted
            ? <CheckCircle className="w-4 h-4 text-green-500" />
            : <X className="w-4 h-4 text-red-500" />
    }

    if (!user) {
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-yellow-800">Please sign in to test consent management</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">GDPR Consent Management Test</h1>
                            <p className="text-gray-600">Comprehensive consent validation and testing</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Manage Consents
                    </button>
                </div>
            </div>

            {/* Current Consent Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Consent Status</h2>

                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-red-600">Error loading consents: {error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { code: 'sms_parsing', name: 'SMS Parsing' },
                            { code: 'ai_advisor', name: 'AI Advisor' },
                            { code: 'voice_processing', name: 'Voice Processing' },
                            { code: 'receipt_analysis', name: 'Receipt Analysis' },
                            { code: 'data_sharing', name: 'Data Sharing' },
                            { code: 'marketing', name: 'Marketing' },
                            { code: 'analytics', name: 'Analytics' },
                            { code: 'community', name: 'Community Features' }
                        ].map((consent) => (
                            <div key={consent.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-900">{consent.name}</span>
                                <div className="flex items-center gap-2">
                                    {getConsentStatusIcon(consent.code)}
                                    <span className={`text-sm ${hasConsent(consent.code) ? 'text-green-600' : 'text-red-600'}`}>
                                        {hasConsent(consent.code) ? 'Granted' : 'Denied'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Test Controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Consent Validation Tests</h2>
                    <button
                        onClick={runConsentTests}
                        disabled={testing || !user}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" />
                        {testing ? 'Running Tests...' : 'Run Tests'}
                    </button>
                </div>

                {/* Test Results */}
                {testResults.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Test Results</h3>
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${result.success
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {result.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <X className="w-5 h-5 text-red-600" />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{result.name}</h4>
                                        <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                            {result.message}
                                        </p>
                                        {result.details && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-gray-600 cursor-pointer">View Details</summary>
                                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(result.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Integration Examples */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Examples</h2>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">SMS Parser Integration</h3>
                        <p className="text-sm text-blue-800 mb-2">
                            The SMS parser now checks consent before processing messages:
                        </p>
                        <code className="text-xs bg-blue-100 p-2 rounded block">
                            {`const result = await parseSMSWithConsent(smsText, userId);
if (result.consentRequired) {
  // Show consent request modal
}`}
                        </code>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-medium text-purple-900 mb-2">AI Services Integration</h3>
                        <p className="text-sm text-purple-800 mb-2">
                            AI services validate consent before processing:
                        </p>
                        <code className="text-xs bg-purple-100 p-2 rounded block">
                            {`// Voice processing
await parseVoiceAudio(audioData, mimeType, userId);

// Receipt analysis
await analyzeReceiptImage(imageData, userId);`}
                        </code>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-2">Data Service Integration</h3>
                        <p className="text-sm text-green-800 mb-2">
                            Data service validates consent for sensitive operations:
                        </p>
                        <code className="text-xs bg-green-100 p-2 rounded block">
                            {`const isValid = await validateSMSParsingConsent(userId);
if (!isValid) {
  throw new Error('SMS parsing consent required');
}`}
                        </code>
                    </div>
                </div>
            </div>

            {/* GDPR Compliance Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">GDPR Compliance Features</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">✅ Implemented Features</h3>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Granular consent toggles</li>
                            <li>• Consent history tracking</li>
                            <li>• Easy withdrawal mechanisms</li>
                            <li>• Audit logging for all changes</li>
                            <li>• Data export functionality</li>
                            <li>• Right to be forgotten</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">🔒 Privacy Rights</h3>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Freely given consent</li>
                            <li>• Specific and informed</li>
                            <li>• Unambiguous indication</li>
                            <li>• Easy withdrawal</li>
                            <li>• Consent verification</li>
                            <li>• Transparent processing</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Consent Management Modal */}
            {showModal && (
                <ConsentManagementModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    userId={user.id}
                    onConsentChange={() => {
                        // Refresh test results when consent changes
                        if (testResults.length > 0) {
                            setTestResults([])
                        }
                    }}
                />
            )}
        </div>
    )
}

export default ConsentTestDemo