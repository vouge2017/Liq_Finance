/**
 * Test component for local voice processing
 * This can be used to test the voice functionality without the full modal
 */

import React, { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Mic, Loader2, CheckCircle, XCircle } from "lucide-react"
import { processVoiceInput, parseTranscript } from "@/services/local-voice-service"

interface VoiceTestProps {
    onResult?: (result: any) => void
}

export const VoiceTest: React.FC<VoiceTestProps> = ({ onResult }) => {
    const [isListening, setIsListening] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleVoiceTest = async () => {
        setIsListening(true)
        setError(null)
        setResult(null)

        try {
            const voiceResult = await processVoiceInput()

            if (voiceResult.success) {
                setResult(voiceResult)
                if (onResult) {
                    onResult(voiceResult.data)
                }
            } else {
                setError(voiceResult.error || "Voice processing failed")
            }
        } catch (err) {
            setError("An error occurred while processing voice input")
        } finally {
            setIsListening(false)
        }
    }

    const handleTextTest = () => {
        // Test with sample Amharic text
        const sampleText = "ከፈልኩ 150 ብር ለምግብ"
        const parsed = parseTranscript(sampleText)

        setResult({
            success: true,
            data: parsed,
            transcript: sampleText
        })

        if (onResult) {
            onResult(parsed)
        }
    }

    return (
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Voice Processing Test</h3>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <Button
                        onClick={handleVoiceTest}
                        disabled={isListening}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
                    >
                        {isListening ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Listening...
                            </>
                        ) : (
                            <>
                                <Mic size={20} />
                                Test Voice Input
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleTextTest}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle size={20} />
                        Test Text Parsing
                    </Button>
                </div>

                {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
                        <XCircle size={20} className="text-rose-500" />
                        <span className="text-rose-400">{error}</span>
                    </div>
                )}

                {result && result.success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <h4 className="text-emerald-400 font-bold mb-2">Success!</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-400">Transcript:</span>
                                <p className="text-white">{result.transcript}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Type:</span>
                                <p className="text-white capitalize">{result.data.type}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Amount:</span>
                                <p className="text-white">{result.data.amount} ETB</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Category:</span>
                                <p className="text-white">{result.data.category}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Title:</span>
                                <p className="text-white">{result.data.title}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Date:</span>
                                <p className="text-white">{result.data.date}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Confidence:</span>
                                <p className="text-white">{Math.round(result.data.confidence * 100)}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}