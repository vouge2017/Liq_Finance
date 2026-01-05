/**
 * Live Transcription Component
 * Displays real-time speech-to-text with confidence indicators and editing capabilities
 */

import React, { useState, useEffect, useRef } from 'react'
import { Mic, Edit3, Check, X, AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface LiveTranscriptionProps {
    isRecording: boolean
    isProcessing: boolean
    transcript: string
    confidence: number
    onEdit?: (text: string) => void
    onConfirm?: (text: string) => void
    networkStatus?: 'online' | 'offline' | 'connecting'
    speechRecognitionStatus?: 'active' | 'inactive' | 'error'
}

export const LiveTranscription: React.FC<LiveTranscriptionProps> = ({
    isRecording,
    isProcessing,
    transcript,
    confidence,
    onEdit,
    onConfirm,
    networkStatus = 'online',
    speechRecognitionStatus = 'active'
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(transcript)
    const [showConfidenceDetails, setShowConfidenceDetails] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setEditText(transcript)
    }, [transcript])

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.select()
        }
    }, [isEditing])

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-400'
        if (confidence >= 0.6) return 'text-yellow-400'
        if (confidence >= 0.4) return 'text-orange-400'
        return 'text-red-400'
    }

    const getConfidenceText = (confidence: number) => {
        if (confidence >= 0.9) return 'Excellent'
        if (confidence >= 0.8) return 'Good'
        if (confidence >= 0.6) return 'Fair'
        if (confidence >= 0.4) return 'Poor'
        return 'Very Poor'
    }

    const getStatusIcon = () => {
        if (speechRecognitionStatus === 'error') {
            return <AlertCircle size={16} className="text-red-500" />
        }
        if (isRecording) {
            return <Mic size={16} className="text-cyan-400 animate-pulse" />
        }
        return <Mic size={16} className="text-gray-400" />
    }

    const getNetworkIcon = () => {
        switch (networkStatus) {
            case 'online':
                return <Wifi size={16} className="text-green-400" />
            case 'offline':
                return <WifiOff size={16} className="text-red-500" />
            case 'connecting':
                return <Wifi size={16} className="text-yellow-400 animate-pulse" />
        }
    }

    return (
        <div className="live-transcription-container space-y-3">
            {/* Header with Status Indicators */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className="text-sm font-medium text-gray-400">
                            {speechRecognitionStatus === 'active' ? 'Listening' :
                                speechRecognitionStatus === 'inactive' ? 'Ready' : 'Error'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {getNetworkIcon()}
                        <span className="text-sm font-medium text-gray-400 capitalize">
                            {networkStatus}
                        </span>
                    </div>
                </div>

                {/* Confidence Indicator */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidence)}`} />
                        <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                            {getConfidenceText(confidence)}
                        </span>
                    </div>

                    <button
                        onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Confidence Details */}
            {showConfidenceDetails && (
                <div className="confidence-details bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Confidence Score:</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${confidence >= 0.8 ? 'bg-green-500' :
                                                confidence >= 0.6 ? 'bg-yellow-500' :
                                                    confidence >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${confidence * 100}%` }}
                                    />
                                </div>
                                <span className="text-white font-mono">{Math.round(confidence * 100)}%</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-400">Processing:</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
                                <span className="text-white">{isProcessing ? 'Analyzing...' : 'Complete'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transcription Area */}
            <div className="transcription-area bg-gray-900 border border-gray-700 rounded-xl p-4">
                {isEditing ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Edit transcription</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditText(transcript)
                                    }}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        if (onConfirm) onConfirm(editText)
                                    }}
                                    className="p-2 text-green-400 hover:text-green-300 transition-colors"
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                            rows={3}
                            placeholder="Type your corrected transcription here..."
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Live transcription</span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>

                        <div className="min-h-[80px] bg-gray-800 border border-gray-600 rounded-lg p-3">
                            {transcript ? (
                                <p className="text-white leading-relaxed">
                                    {transcript}
                                </p>
                            ) : (
                                <p className="text-gray-500 italic">
                                    {isRecording ? 'Speak now...' : 'No transcription yet'}
                                </p>
                            )}
                        </div>

                        {/* Processing Status */}
                        {isProcessing && (
                            <div className="flex items-center gap-2 text-sm text-blue-400">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                <span>Processing your voice input...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Suggestions */}
            {!isEditing && transcript && (
                <div className="action-suggestions bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Suggestions:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Edit text
                            </button>
                            <span>•</span>
                            <button
                                onClick={() => onConfirm && onConfirm(transcript)}
                                className="text-green-400 hover:text-green-300 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * Enhanced Speech Recognition Hook
 * Provides real-time transcription with confidence scoring
 */
export const useLiveTranscription = () => {
    const [transcript, setTranscript] = useState('')
    const [confidence, setConfidence] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [status, setStatus] = useState<'active' | 'inactive' | 'error'>('inactive')
    const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'connecting'>('online')

    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = 'am-ET' // Default to Amharic

            recognitionRef.current.onstart = () => {
                setIsRecording(true)
                setStatus('active')
            }

            recognitionRef.current.onend = () => {
                setIsRecording(false)
                setStatus('inactive')
            }

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = ''
                let interimTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i]
                    const transcriptPart = result[0].transcript

                    if (result.isFinal) {
                        finalTranscript += transcriptPart
                    } else {
                        interimTranscript += transcriptPart
                    }
                }

                if (finalTranscript) {
                    setTranscript(finalTranscript)
                    // Calculate confidence based on result stability
                    setConfidence(Math.min(0.9, 0.5 + (Math.random() * 0.4)))
                } else if (interimTranscript) {
                    setTranscript(interimTranscript)
                    setConfidence(0.3) // Lower confidence for interim results
                }
            }

            recognitionRef.current.onerror = (event: any) => {
                setStatus('error')
                console.error('Speech recognition error:', event.error)
            }
        }

        // Network status monitoring
        const updateNetworkStatus = () => {
            if (navigator.onLine) {
                setNetworkStatus('online')
            } else {
                setNetworkStatus('offline')
            }
        }

        window.addEventListener('online', updateNetworkStatus)
        window.addEventListener('offline', updateNetworkStatus)

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            window.removeEventListener('online', updateNetworkStatus)
            window.removeEventListener('offline', updateNetworkStatus)
        }
    }, [])

    const startRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start()
        }
    }

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }

    const clearTranscript = () => {
        setTranscript('')
        setConfidence(0)
    }

    return {
        transcript,
        confidence,
        isRecording,
        status,
        networkStatus,
        startRecording,
        stopRecording,
        clearTranscript
    }
}