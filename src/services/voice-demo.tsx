/**
 * Simple demo component to test local voice processing
 */

import React, { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Mic, CheckCircle, XCircle, Play } from "lucide-react"
import { parseTranscript, processVoiceInput } from "./local-voice-service"

export const VoiceDemo: React.FC = () => {
    const [result, setResult] = useState<any>(null)
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const testSample = (text: string) => {
        setError(null)
        const parsed = parseTranscript(text)
        setResult({
            success: true,
            data: parsed,
            transcript: text
        })
    }

    const handleVoiceTest = async () => {
        setIsListening(true)
        setError(null)
        setResult(null)

        try {
            const voiceResult = await processVoiceInput()

            if (voiceResult.success) {
                setResult(voiceResult)
            } else {
                setError(voiceResult.error || "Voice processing failed")
            }
        } catch (err) {
            setError("An error occurred while processing voice input")
        } finally {
            setIsListening(false)
        }
    }

    return (
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Voice Processing Demo</h2>

            <div className="space-y-4">
                {/* Test Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => testSample("ከፈልኩ 150 ብር ለምግብ")}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
                    >
                        <Play size={20} />
                        Amharic: "ከፈልኩ 150 ብር ለምግብ"
                    </Button>

                    <Button
                        onClick={() => testSample("Paid 150 birr for lunch")}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Play size={20} />
                        English: "Paid 150 birr for lunch"
                    </Button>

                    <Button
                        onClick={() => testSample("ቀንሰኩ 5000 ብር ከמשכורת")}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        <Play size={20} />
                        Amharic Income: "ቀንሰኩ 5000 ብር ከמשכורת"
                    </Button>

                    <Button
                        onClick={() => testSample("Received 5000 birr from salary")}
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
                    >
                        <Play size={20} />
                        English Income: "Received 5000 birr from salary"
                    </Button>
                </div>

                {/* Voice Input Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleVoiceTest}
                        disabled={isListening}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        {isListening ? (
                            <>
                                <Mic size={20} className="animate-pulse" />
                                Listening...
                            </>
                        ) : (
                            <>
                                <Mic size={20} />
                                Test Voice Input
                            </>
                        )}
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
                        <XCircle size={20} className="text-rose-500" />
                        <span className="text-rose-400">{error}</span>
                    </div>
                )}

                {/* Result Display */}
                {result && result.success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={20} className="text-emerald-500" />
                            <h3 className="text-emerald-400 font-bold">Success!</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Transcript:</span>
                                <p className="text-white font-mono bg-black/20 p-2 rounded mt-1">{result.transcript}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-400 text-xs">Type</span>
                                    <p className="text-white capitalize font-bold">{result.data.type}</p>
                                </div>
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-400 text-xs">Amount</span>
                                    <p className="text-white font-bold">{result.data.amount} ETB</p>
                                </div>
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-400 text-xs">Category</span>
                                    <p className="text-white font-bold">{result.data.category}</p>
                                </div>
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-400 text-xs">Date</span>
                                    <p className="text-white font-bold">{result.data.date}</p>
                                </div>
                                <div className="bg-black/20 p-2 rounded col-span-2">
                                    <span className="text-gray-400 text-xs">Title</span>
                                    <p className="text-white font-bold">{result.data.title}</p>
                                </div>
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-400 text-xs">Confidence</span>
                                    <p className="text-white font-bold">{Math.round(result.data.confidence * 100)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}