"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
    onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'primary',
    onClick
}) => {
    const colorClasses = {
        primary: 'bg-gradient-to-br from-primary to-primary/80 text-white',
        success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
        warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
        danger: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white',
        neutral: 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[#111318] dark:text-white',
    }

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl p-5 shadow-lg transition-all duration-300
                ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
                ${color === 'neutral' ? colorClasses.neutral : colorClasses[color]}
            `}
        >
            {icon && color !== 'neutral' && (
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-bold uppercase tracking-wider ${color === 'neutral' ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}>
                        {title}
                    </p>
                    {icon && (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'neutral' ? 'bg-gray-100 dark:bg-white/10' : 'bg-white/20'}`}>
                            {icon}
                        </div>
                    )}
                </div>

                <p className={`text-2xl font-black tracking-tight ${color === 'neutral' ? 'text-[#111318] dark:text-white' : 'text-white'}`}>
                    {value}
                </p>

                {(subtitle || trend) && (
                    <div className="flex items-center gap-2 mt-2">
                        {trend && (
                            <span className={`flex items-center gap-0.5 text-xs font-bold ${
                                trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                                {trend.isPositive ? (
                                    <Icons.TrendingUp size={12} />
                                ) : (
                                    <Icons.ArrowDown size={12} />
                                )}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        {subtitle && (
                            <p className={`text-xs font-medium ${color === 'neutral' ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

interface QuickStatsGridProps {
    children: React.ReactNode
    columns?: 2 | 3 | 4
}

export const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({ children, columns = 2 }) => {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4',
    }

    return (
        <div className={`grid ${gridCols[columns]} gap-4 mb-8`}>
            {children}
        </div>
    )
}
