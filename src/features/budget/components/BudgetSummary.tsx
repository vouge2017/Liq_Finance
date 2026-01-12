"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface BudgetSummaryProps {
    totalBudget: number
    totalSpent: number
    remaining: number
    daysRemaining: number
    isOverBudget: boolean
    isPrivacyMode: boolean
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
    totalBudget,
    totalSpent,
    remaining,
    daysRemaining,
    isOverBudget,
    isPrivacyMode
}) => {
    const percentSpent = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white/10 dark:to-white/5 rounded-[2rem] p-6 mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Budget</p>
                    <p className="text-3xl font-black text-white tracking-tight">
                        {isPrivacyMode ? '••••••' : totalBudget.toLocaleString()}
                        <span className="text-lg font-bold text-gray-400 ml-2">ETB</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Days Left</p>
                    <p className="text-2xl font-black text-white">{daysRemaining}</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Spent</p>
                    <p className={`text-lg font-black ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPrivacyMode ? '••••' : `${totalSpent.toLocaleString()} ETB`}
                    </p>
                </div>
                <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            percentSpent >= 100
                                ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                                : percentSpent >= 80
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        }`}
                        style={{ width: `${percentSpent}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-gray-500">{percentSpent.toFixed(1)}% used</span>
                    <span className="text-[10px] font-bold text-gray-500">
                        {isPrivacyMode ? '••••' : `${remaining.toLocaleString()} ETB left`}
                    </span>
                </div>
            </div>

            {isOverBudget && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
                    <Icons.AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-rose-400">Over Budget</p>
                        <p className="text-[10px] font-medium text-rose-300/80">
                            You've exceeded your budget by {isPrivacyMode ? '••••' : `${Math.abs(remaining).toLocaleString()} ETB`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
