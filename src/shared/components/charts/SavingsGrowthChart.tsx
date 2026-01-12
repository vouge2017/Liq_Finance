"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface SavingsGrowthData {
    date: string
    amount: number
}

interface SavingsGrowthChartProps {
    data: SavingsGrowthData[]
    targetAmount: number
    currentAmount: number
    height?: number
}

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({
    data,
    targetAmount,
    currentAmount,
    height = 180
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center" style={{ height }}>
                <div className="text-center">
                    <Icons.TrendingUp size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No history yet</p>
                </div>
            </div>
        )
    }

    const maxAmount = Math.max(targetAmount, ...data.map(d => d.amount), 1)
    const minAmount = Math.min(0, ...data.map(d => d.amount))
    const range = maxAmount - minAmount || 1

    const linePoints = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = height - ((d.amount - minAmount) / range) * (height - 40) - 20
        return `${x}%,${y}`
    }).join(' ')

    const areaPoints = `${linePoints} 100%,${height} 0%,${0},${height}`

    const targetLineY = height - ((targetAmount - minAmount) / range) * (height - 40) - 20

    const gradientId = 'savingsGradient'
    const targetLineId = 'targetLine'

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                        {currentAmount.toLocaleString()} <span className="text-sm font-bold text-gray-400">ETB</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target</p>
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
                        {targetAmount.toLocaleString()}
                    </p>
                </div>
            </div>

            <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={targetLineId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <polygon
                    points={areaPoints}
                    fill={`url(#${gradientId})`}
                />

                <polyline
                    points={linePoints}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                />

                <line
                    x1="0"
                    y1={targetLineY}
                    x2="100"
                    y2={targetLineY}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.7"
                />

                <text
                    x="100"
                    y={targetLineY - 5}
                    textAnchor="end"
                    className="text-[8px] fill-amber-500 font-bold"
                >
                    Target
                </text>

                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100
                    const y = height - ((d.amount - minAmount) / range) * (height - 40) - 20
                    return (
                        <circle
                            key={i}
                            cx={`${x}%`}
                            cy={y}
                            r="2"
                            fill="white"
                            stroke="#10b981"
                            strokeWidth="2"
                            className="transition-transform hover:scale-150"
                        />
                    )
                })}
            </svg>

            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>{data[0]?.date || ''}</span>
                <span>{data[data.length - 1]?.date || ''}</span>
            </div>
        </div>
    )
}

interface GoalProgressRingProps {
    currentAmount: number
    targetAmount: number
    size?: number
    strokeWidth?: number
}

export const GoalProgressRing: React.FC<GoalProgressRingProps> = ({
    currentAmount,
    targetAmount,
    size = 140,
    strokeWidth = 10
}) => {
    const percentage = Math.min((currentAmount / targetAmount) * 100, 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    const getStatusColor = () => {
        if (percentage >= 100) return '#10b981'
        if (percentage >= 75) return '#3b82f6'
        if (percentage >= 50) return '#8b5cf6'
        if (percentage >= 25) return '#f59e0b'
        return '#ef4444'
    }

    const statusColor = getStatusColor()

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-gray-700"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={statusColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {percentage.toFixed(0)}%
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Complete
                </span>
            </div>
        </div>
    )
}
