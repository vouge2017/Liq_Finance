"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'

interface PullToRefreshIndicatorProps {
    pullProgress: number // 0 to 1
    isRefreshing: boolean
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
    pullProgress,
    isRefreshing
}) => {
    if (pullProgress === 0 && !isRefreshing) return null

    const rotation = pullProgress * 180
    const scale = 0.5 + (pullProgress * 0.5)
    const opacity = pullProgress

    return (
        <div
            className="flex justify-center py-4 transition-all"
            style={{
                opacity: isRefreshing ? 1 : opacity,
                transform: `translateY(${isRefreshing ? 0 : (pullProgress * 20 - 20)}px)`
            }}
        >
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRefreshing
                        ? 'bg-cyan-500/20 border-2 border-cyan-500'
                        : pullProgress >= 1
                            ? 'bg-emerald-500/20 border-2 border-emerald-500'
                            : 'bg-theme-card border-2 border-theme'
                    }`}
                style={{
                    transform: isRefreshing ? 'scale(1)' : `scale(${scale})`,
                }}
            >
                {isRefreshing ? (
                    <Loader2 size={20} className="text-cyan-400 animate-spin" />
                ) : (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={pullProgress >= 1 ? 'text-emerald-400' : 'text-theme-secondary'}
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        <path d="M12 5v14M5 12l7-7 7 7" />
                    </svg>
                )}
            </div>
            {isRefreshing && (
                <span className="ml-2 text-sm text-cyan-400 font-medium self-center">
                    Refreshing...
                </span>
            )}
        </div>
    )
}
