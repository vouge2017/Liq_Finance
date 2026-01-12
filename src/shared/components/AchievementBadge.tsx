"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Badge } from '@/types'

interface AchievementBadgeProps {
    badge: Badge
    earned?: boolean
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    badge,
    earned = false,
    size = 'md',
    onClick
}) => {
    const sizeClasses = {
        sm: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-[8px]' },
        md: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-[10px]' },
        lg: { container: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-xs' },
    }

    const tierColors = {
        bronze: { bg: 'bg-amber-700/20', border: 'border-amber-500', text: 'text-amber-500', glow: 'shadow-amber-500/30' },
        silver: { bg: 'bg-gray-400/20', border: 'border-gray-400', text: 'text-gray-400', glow: 'shadow-gray-400/30' },
        gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-500', glow: 'shadow-yellow-500/30' },
        diamond: { bg: 'bg-cyan-400/20', border: 'border-cyan-400', text: 'text-cyan-400', glow: 'shadow-cyan-400/30' },
    }

    const colors = tierColors[badge.tier] || tierColors.bronze

    const IconComponent = (Icons as any)[badge.icon] || Icons.Star

    return (
        <div
            onClick={onClick}
            className={`${sizeClasses[size].container} rounded-full flex items-center justify-center ${colors.bg} ${colors.border} border-2 relative ${earned ? 'cursor-pointer hover:scale-110 transition-transform' : 'opacity-50'}`}
        >
            <div className={`${colors.glow} absolute inset-0 rounded-full blur-lg opacity-50`} />
            <IconComponent className={`${colors.text} ${sizeClasses[size].icon}`} />
            {!earned && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Icons.Lock size={12} className="text-gray-400" />
                </div>
            )}
        </div>
    )
}

interface AchievementCardProps {
    badge: Badge
    earned?: boolean
    onClick?: () => void
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
    badge,
    earned = false,
    onClick
}) => {
    const tierColors = {
        bronze: { bg: 'from-amber-700 to-amber-800', border: 'border-amber-500', text: 'text-amber-500' },
        silver: { bg: 'from-gray-400 to-gray-500', border: 'border-gray-400', text: 'text-gray-400' },
        gold: { bg: 'from-yellow-500 to-amber-600', border: 'border-yellow-500', text: 'text-yellow-500' },
        diamond: { bg: 'from-cyan-400 to-blue-500', border: 'border-cyan-400', text: 'text-cyan-400' },
    }

    const colors = tierColors[badge.tier] || tierColors.bronze

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl p-4 border transition-all cursor-pointer
                ${earned
                    ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:shadow-lg hover:border-primary/30'
                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 opacity-60'
                }
            `}
        >
            <div className="flex items-center gap-4">
                <AchievementBadge badge={badge} size="md" earned={earned} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-sm ${earned ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {badge.name}
                        </h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-gradient-to-r ${colors.bg} text-white`}>
                            {badge.tier}
                        </span>
                    </div>
                    <p className={`text-xs ${earned ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>
                        {badge.description}
                    </p>
                    <div className="mt-2">
                        <span className={`text-[10px] font-bold ${earned ? 'text-primary' : 'text-gray-400'}`}>
                            {earned ? '✓ Earned' : `Goal: ${badge.requirement}`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface AchievementsGridProps {
    badges: Badge[]
    earnedIds: string[]
    columns?: 2 | 3 | 4
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
    badges,
    earnedIds,
    columns = 3
}) => {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    }

    return (
        <div className={`grid ${gridCols[columns]} gap-4`}>
            {badges.map((badge) => (
                <AchievementBadge
                    key={badge.id}
                    badge={badge}
                    earned={earnedIds.includes(badge.id)}
                />
            ))}
        </div>
    )
}

interface StreakDisplayProps {
    days: number
    color?: 'primary' | 'success' | 'warning'
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
    days,
    color = 'primary'
}) => {
    const colors = {
        primary: { bg: 'bg-primary/10', text: 'text-primary', fire: 'text-rose-500' },
        success: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', fire: 'text-rose-500' },
        warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', fire: 'text-rose-500' },
    }

    const c = colors[color]

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${c.bg}`}>
            <span className={`${c.fire} text-lg animate-pulse`}>🔥</span>
            <span className={`${c.text} font-bold`}>{days}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">day streak</span>
        </div>
    )
}
