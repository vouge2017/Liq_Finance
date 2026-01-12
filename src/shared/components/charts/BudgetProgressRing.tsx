"use client"

import React from 'react'

interface BudgetProgressRingProps {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: string
    bgColor?: string
    showLabel?: boolean
    label?: string
    subLabel?: string
    animate?: boolean
}

export const BudgetProgressRing: React.FC<BudgetProgressRingProps> = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = '#3b82f6',
    bgColor = '#e5e7eb',
    showLabel = true,
    label,
    subLabel,
    animate = true
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference

    const getStatusColor = () => {
        if (percentage >= 100) return '#ef4444'
        if (percentage >= 80) return '#f59e0b'
        return color
    }

    const displayColor = getStatusColor()

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={displayColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={animate ? 'transition-all duration-700 ease-out' : ''}
                />
            </svg>

            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {percentage.toFixed(0)}%
                    </span>
                    {label && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {label}
                        </span>
                    )}
                    {subLabel && (
                        <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                            {subLabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

interface CategoryRingGridProps {
    categories: Array<{
        name: string
        percentage: number
        color: string
        amount: number
    }>
    size?: number
}

export const CategoryRingGrid: React.FC<CategoryRingGridProps> = ({
    categories,
    size = 80
}) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            {categories.map((cat, i) => (
                <div key={i} className="flex flex-col items-center">
                    <BudgetProgressRing
                        percentage={cat.percentage}
                        size={size}
                        color={cat.color}
                        showLabel={false}
                    />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-2 text-center truncate w-full">
                        {cat.name}
                    </span>
                    <span className="text-[9px] font-medium text-gray-400">
                        {cat.amount.toLocaleString()} ETB
                    </span>
                </div>
            ))}
        </div>
    )
}
