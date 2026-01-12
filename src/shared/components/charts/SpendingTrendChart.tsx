"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface SpendingTrendData {
    date: string
    amount: number
    label?: string
}

interface SpendingTrendChartProps {
    data: SpendingTrendData[]
    height?: number
    showLabels?: boolean
    color?: string
    gradientId?: string
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
    data,
    height = 200,
    showLabels = true,
    color = '#3b82f6',
    gradientId = 'spendingGradient'
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center" style={{ height }}>
                <div className="text-center">
                    <Icons.TrendingUp size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                </div>
            </div>
        )
    }

    const maxAmount = Math.max(...data.map(d => d.amount), 1)
    const minAmount = Math.min(...data.map(d => d.amount), 0)
    const range = maxAmount - minAmount || 1

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = height - ((d.amount - minAmount) / range) * (height - 40) - 20
        return `${x}%,${y}`
    }).join(' ')

    const areaPoints = `${points} 100%,${height} 0%,${0},${height}`

    return (
        <div className="w-full">
            <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                />

                <polygon
                    points={areaPoints}
                    fill={`url(#${gradientId})`}
                />

                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100
                    const y = height - ((d.amount - minAmount) / range) * (height - 40) - 20
                    return (
                        <g key={i}>
                            <circle
                                cx={`${x}%`}
                                cy={y}
                                r="3"
                                fill="white"
                                stroke={color}
                                strokeWidth="2"
                                className="transition-transform hover:scale-150"
                            />
                            {showLabels && (
                                <text
                                    x={`${x}%`}
                                    y={height - 5}
                                    textAnchor="middle"
                                    className="text-[8px] fill-gray-500 dark:fill-gray-400 font-medium"
                                >
                                    {d.label || d.date.split('-')[2]}
                                </text>
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

interface WeeklySpendingChartProps {
    weekData: number[]
    labels?: string[]
    color?: string
}

export const WeeklySpendingChart: React.FC<WeeklySpendingChartProps> = ({
    weekData,
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    color = '#3b82f6'
}) => {
    const maxValue = Math.max(...weekData, 1)

    return (
        <div className="flex items-end justify-between gap-2 h-32">
            {weekData.map((value, i) => {
                const height = (value / maxValue) * 100
                const isMax = value === maxValue && value > 0

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                                isMax
                                    ? 'bg-gradient-to-t from-blue-600 to-cyan-400'
                                    : 'bg-gray-200 dark:bg-white/10'
                            }`}
                            style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                        {isMax && (
                            <span className="text-[10px] font-bold text-blue-500">{value.toLocaleString()}</span>
                        )}
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">{labels[i]}</span>
                    </div>
                )
            })}
        </div>
    )
}
