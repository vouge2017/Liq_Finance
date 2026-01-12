"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import type { BudgetCategory } from '@/types'

interface BudgetCardProps {
    category: BudgetCategory & { spent: number }
    onClick: () => void
}

const BUDGET_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Home: Icons.Home,
    Zap: Icons.Zap,
    Heart: Icons.Heart,
    Utensils: Icons.Utensils,
    Bus: Icons.Bus,
    Shopping: Icons.Shopping,
    Film: Icons.Film,
    Education: Icons.Education,
    Baby: Icons.Baby,
    Briefcase: Icons.Briefcase,
    Coins: Icons.Coins,
    Teff: Icons.Teff,
    Bajaji: Icons.Bajaji,
    Phone: Icons.Phone,
    Coffee: Icons.Coffee,
    Iddir: Icons.Iddir,
    Alert: Icons.Alert,
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ category, onClick }) => {
    const IconComponent = BUDGET_ICONS[category.icon] || Icons.Shopping
    const percent = Math.round((category.spent / (category.allocated || 1)) * 100)
    const remaining = (category.allocated || 0) - category.spent
    const isOverBudget = remaining < 0

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-white/10" />

            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category.color.replace('bg-', 'bg-opacity-20 text-')} shadow-sm group-hover:scale-110 transition-transform`}>
                    <IconComponent size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-black ${
                    percent >= 100
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : percent >= 80
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                }`}>
                    {percent}%
                </div>
            </div>

            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 truncate">{category.name}</h4>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-4 ${
                isOverBudget
                    ? 'text-rose-500'
                    : remaining < 1000
                        ? 'text-amber-500'
                        : 'text-gray-400'
            }`}>
                {isOverBudget
                    ? `${Math.abs(remaining).toLocaleString()} ETB over`
                    : `${remaining.toLocaleString()} ETB left`
                }
            </p>

            <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                            ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                            : percent >= 80
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-primary to-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                />
            </div>
        </div>
    )
}
