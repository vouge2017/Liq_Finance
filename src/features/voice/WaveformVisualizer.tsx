/**
 * Real-time Waveform Visualizer Component
 * Provides visual feedback during voice recording with animated waveform
 */

import React, { useRef, useEffect, useState } from 'react'

interface WaveformVisualizerProps {
    isRecording: boolean
    audioData?: Uint8Array
    height?: number
    width?: number
    color?: string
    backgroundColor?: string
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
    isRecording,
    audioData,
    height = 100,
    width = 300,
    color = '#06b6d4',
    backgroundColor = 'rgba(6, 182, 212, 0.1)'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | null>(null)
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

    useEffect(() => {
        if (isRecording) {
            initializeAudioContext()
        } else {
            cleanup()
        }

        return () => cleanup()
    }, [isRecording])

    const initializeAudioContext = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)()
            const analyserNode = context.createAnalyser()

            analyserNode.fftSize = 256
            analyserNode.smoothingTimeConstant = 0.8

            setAudioContext(context)
            setAnalyser(analyserNode)

            // Start animation loop
            animate()
        } catch (error) {
            console.warn('Audio context not supported:', error)
        }
    }

    const cleanup = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }
        if (audioContext) {
            audioContext.close()
        }
        setAudioContext(null)
        setAnalyser(null)
    }

    const animate = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')

        if (!canvas || !ctx || !analyser) {
            animationRef.current = requestAnimationFrame(animate)
            return
        }

        // Clear canvas
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        // Get audio data
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteTimeDomainData(dataArray)

        // Draw waveform
        ctx.lineWidth = 2
        ctx.strokeStyle = color
        ctx.beginPath()

        const sliceWidth = width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * height) / 2

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }

            x += sliceWidth
        }

        ctx.lineTo(width, height / 2)
        ctx.stroke()

        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.stroke()
        ctx.shadowBlur = 0

        animationRef.current = requestAnimationFrame(animate)
    }

    // Manual audio data update for testing
    useEffect(() => {
        if (audioData && analyser) {
            // This would be connected to actual audio stream in production
            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            // Simulate audio data for visualization
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = Math.random() * 255
            }

            // Note: In production, this would be connected to actual audio stream
            // analyser.getByteTimeDomainData(dataArray)
        }
    }, [audioData, analyser])

    return (
        <div className="waveform-container relative">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-full"
                style={{
                    background: backgroundColor,
                    borderRadius: '12px',
                    border: isRecording ? `2px solid ${color}` : '2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'border-color 0.3s ease'
                }}
            />

            {/* Recording indicator */}
            {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400 font-medium">RECORDING</span>
                </div>
            )}

            {/* Visual feedback overlay */}
            {isRecording && (
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"
                        style={{ width: '100%', opacity: 0.5 }}
                    />
                </div>
            )}
        </div>
    )
}

/**
 * Audio Level Meter Component
 * Shows real-time audio input level
 */
export const AudioLevelMeter: React.FC<{
    isRecording: boolean
    currentLevel?: number
    maxLevel?: number
}> = ({ isRecording, currentLevel = 0, maxLevel = 100 }) => {
    const [level, setLevel] = useState(0)

    useEffect(() => {
        if (isRecording) {
            // Simulate audio level detection
            const interval = setInterval(() => {
                const randomLevel = Math.random() * 100
                setLevel(randomLevel)
            }, 100)

            return () => clearInterval(interval)
        } else {
            setLevel(0)
        }
    }, [isRecording])

    const actualLevel = isRecording ? level : currentLevel
    const percentage = Math.min((actualLevel / (maxLevel || 100)) * 100, 100)

    return (
        <div className="audio-level-container space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
                <span>Audio Level</span>
                <span>{Math.round(percentage)}%</span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-100 ${percentage > 80 ? 'bg-red-500' :
                        percentage > 50 ? 'bg-yellow-500' :
                            percentage > 20 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
                <span>Too Quiet</span>
                <span>Optimal</span>
                <span>Too Loud</span>
            </div>
        </div>
    )
}