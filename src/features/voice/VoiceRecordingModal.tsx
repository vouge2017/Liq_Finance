"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Icons } from "@/shared/components/Icons"
import { Mic, Square, Loader2, Check, X, Edit3 } from "lucide-react"
import { useAIUsage } from "@/services/ai-usage"
import { UpgradePrompt } from "@/shared/components/UpgradePrompt"

interface ParsedTransaction {
    type: "income" | "expense"
    amount: number
    category: string
    title: string
    date: string
    confidence: number
}

interface VoiceRecordingModalProps {
    isOpen: boolean
    onClose: () => void
    onTransactionParsed: (tx: ParsedTransaction) => void
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
    isOpen,
    onClose,
    onTransactionParsed,
}) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [transcript, setTranscript] = useState("")
    const [parsedResult, setParsedResult] = useState<ParsedTransaction | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const { canUseFeature, incrementUsage, upgradeToPro } = useAIUsage()
    const [showUpgrade, setShowUpgrade] = useState(false)

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            resetState()
        }
    }, [isOpen])

    const resetState = () => {
        setIsRecording(false)
        setIsProcessing(false)
        setAudioBlob(null)
        setTranscript("")
        setParsedResult(null)
        setError(null)
        setRecordingTime(0)
        audioChunksRef.current = []
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    const startRecording = async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
            })

            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start(100) // Collect data every 100ms
            setIsRecording(true)

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

        } catch (err) {
            console.error("Microphone error:", err)
            setError("Could not access microphone. Please grant permission.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const processAudio = async () => {
        if (!audioBlob) return

        // Rate Limit Check
        const { allowed, reason } = canUseFeature('voice')
        if (!allowed) {
            if (reason === 'upgrade_required' || reason === 'daily_limit') {
                setShowUpgrade(true)
                return
            }
        }

        setIsProcessing(true)
        setError(null)

        try {
            // Convert blob to base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(",")[1]
                    resolve(base64)
                }
            })
            reader.readAsDataURL(audioBlob)
            const audioBase64 = await base64Promise

            // Send to API
            const response = await fetch("/api/parse-voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audio: audioBase64,
                    mimeType: audioBlob.type,
                    language: "am-ET"
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to process audio")
            }

            const result = await response.json()

            if (result.success && result.data) {
                setParsedResult(result.data)
                setTranscript(result.transcript || "")
                incrementUsage('voice') // Increment usage on success
            } else {
                setError(result.error || "Could not understand the audio. Please try again.")
            }
        } catch (err) {
            console.error("Processing error:", err)
            setError("Error processing audio. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleConfirm = () => {
        if (parsedResult) {
            onTransactionParsed(parsedResult)
            onClose()
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 modal-overlay backdrop-blur-md bg-black/80"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="modal-content w-full max-w-sm mx-4 rounded-3xl p-6 shadow-2xl animate-dialog relative bg-gray-900 border border-gray-800">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mic size={20} className="text-cyan-400" />
                        Voice Transaction
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Recording State */}
                {!audioBlob && !parsedResult && (
                    <div className="flex flex-col items-center py-8">
                        {/* Microphone Button */}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                                ? "bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.6)] scale-110 animate-pulse"
                                : "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:scale-105"
                                }`}
                        >
                            {isRecording ? (
                                <Square size={48} className="text-white" fill="white" />
                            ) : (
                                <Mic size={56} className="text-white" />
                            )}
                        </button>

                        {/* Recording Timer & Status */}
                        <div className="mt-8 flex flex-col items-center gap-2 h-16">
                            {isRecording ? (
                                <>
                                    <div className="flex items-center gap-2 animate-pulse">
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        <span className="text-rose-400 font-bold uppercase tracking-widest text-xs">Recording</span>
                                    </div>
                                    <span className="text-4xl font-mono text-white font-bold tracking-wider">
                                        {formatTime(recordingTime)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-gray-400 text-sm font-medium">Tap microphone to start</span>
                            )}
                        </div>

                        {/* Instructions */}
                        {!isRecording && (
                            <div className="mt-6 space-y-3 text-center w-full">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Try saying (Amharic/English):</p>
                                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                                    <p className="text-sm text-cyan-400 italic">"Paid 450 birr for lunch"</p>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                                    <p className="text-sm text-cyan-400 italic">"Taxi to Bole 120"</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Audio Recorded - Process Button */}
                {audioBlob && !parsedResult && !isProcessing && (
                    <div className="flex flex-col items-center py-8">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                            <Check size={48} className="text-emerald-500" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">Recording Complete!</p>
                        <p className="text-gray-400 text-sm mb-8">{formatTime(recordingTime)} recorded</p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={resetState}
                                className="flex-1 py-4 bg-gray-800 rounded-xl font-bold text-gray-400 hover:text-white border border-gray-700 transition-colors"
                            >
                                Re-record
                            </button>
                            <button
                                onClick={processAudio}
                                className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/20 transition-all"
                            >
                                Analyze Audio
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                    <div className="flex flex-col items-center py-12">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Icons.Cpu size={32} className="text-cyan-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-white font-bold text-lg">Analyzing...</p>
                        <p className="text-gray-400 text-sm mt-2">Understanding Amharic & English</p>
                    </div>
                )}

                {/* Parsed Result - Confirmation */}
                {/* Parsed Result - Confirmation & Edit */}
                {parsedResult && (
                    <div className="py-2 animate-fade-in">
                        {/* Transcript Display */}
                        {transcript && (
                            <div className="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative">
                                <div className="absolute -top-3 left-4 bg-gray-900 px-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2">
                                    <Icons.Mic size={10} /> I heard
                                </div>
                                <p className="text-white italic text-center text-lg">
                                    "{transcript}"
                                </p>
                            </div>
                        )}

                        {/* Editable Transaction Card */}
                        <div className={`p-5 rounded-2xl border mb-6 transition-colors ${parsedResult.confidence < 0.7
                            ? "bg-yellow-500/10 border-yellow-500/30"
                            : parsedResult.type === "income"
                                ? "bg-cyan-500/10 border-cyan-500/30"
                                : "bg-pink-500/10 border-pink-500/30"
                            }`}>

                            <div className="space-y-4">
                                {/* Type Toggle */}
                                <div className="flex justify-center mb-2">
                                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                        <button
                                            onClick={() => setParsedResult({ ...parsedResult, type: "expense" })}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${parsedResult.type === "expense" ? "bg-pink-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                        >
                                            Expense
                                        </button>
                                        <button
                                            onClick={() => setParsedResult({ ...parsedResult, type: "income" })}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${parsedResult.type === "income" ? "bg-cyan-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                        >
                                            Income
                                        </button>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="text-center">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Amount</label>
                                    <div className="relative inline-block">
                                        <input
                                            type="number"
                                            value={parsedResult.amount}
                                            onChange={(e) => setParsedResult({ ...parsedResult, amount: parseFloat(e.target.value) || 0 })}
                                            className={`bg-transparent text-4xl font-bold font-mono text-center outline-none w-48 ${parsedResult.type === "income" ? "text-cyan-400" : "text-pink-400"}`}
                                        />
                                        <span className="text-sm text-gray-500 absolute top-1/2 -translate-y-1/2 -right-8">ETB</span>
                                    </div>
                                </div>

                                {/* Title Input */}
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Title</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={parsedResult.title}
                                            onChange={(e) => setParsedResult({ ...parsedResult, title: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white font-medium outline-none focus:border-cyan-500/50 transition-colors"
                                        />
                                        <Icons.Edit size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Category Input */}
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Category</label>
                                        <input
                                            type="text"
                                            value={parsedResult.category}
                                            onChange={(e) => setParsedResult({ ...parsedResult, category: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                                        />
                                    </div>
                                    {/* Date Input */}
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            value={parsedResult.date}
                                            onChange={(e) => setParsedResult({ ...parsedResult, date: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                                            style={{ colorScheme: "dark" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={resetState}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-gray-800 border border-gray-700 transition-colors"
                            >
                                Retry
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-[2] py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl font-bold text-white shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <Check size={20} />
                                Confirm & Save
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 animate-shake">
                        <Icons.Alert size={20} className="text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-rose-400 font-bold text-sm">Recording Error</p>
                            <p className="text-rose-400/80 text-xs mt-1">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            <UpgradePrompt
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                onUpgrade={() => {
                    upgradeToPro()
                    setShowUpgrade(false)
                }}
                feature="voice"
            />
        </div>
    )
}
