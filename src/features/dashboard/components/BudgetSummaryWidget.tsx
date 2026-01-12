"use client"

import React from 'react'
import { useAppContext } from '@/context/AppContext'
import { Icons } from '@/shared/components/Icons'

export const BudgetSummaryWidget: React.FC = () => {
    const { state } = useAppContext()
    const { transactions, budgetCategories } = state

    const currentMonth = new Date()
    const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    })

    const totalBudget = budgetCategories.reduce((acc, cat) => acc + cat.allocated, 0)
    const monthlySpent = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    const budgetUsedPercent = totalBudget > 0 ? Math.round((monthlySpent / totalBudget) * 100) : 0

    const topCategories = budgetCategories
        .map(cat => {
            const catSpent = monthlyTransactions.filter(t => 
                t.category === cat.id && t.type === 'expense'
            ).reduce((acc, t) => acc + t.amount, 0)
            const catPercent = cat.allocated > 0 ? Math.round((catSpent / cat.allocated) * 100) : 0
            return { ...cat, spent: catSpent, percent: catPercent }
        })
        .filter(cat => cat.allocated > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 3)

    return (
        <div className="bg-gradient-to-br from-[#1B4D3E] via-[#2D6A5A] to-[#1B4D3E] rounded-2xl p-6 shadow-2xl shadow-[#1B4D3E]/25 mb-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icons.Budget className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-bold">Monthly Budget</h3>
                        <p className="text-white/70 text-sm">October 2024</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    budgetUsedPercent >= 90 ? 'bg-rose-500 text-white' 
                        : budgetUsedPercent >= 70 ? 'bg-amber-500 text-white' 
                        : 'bg-emerald-500 text-white'
                }`}>
                    {budgetUsedPercent}% Used
                </div>
            </div>

            <div className="mb-5">
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-white/60 text-sm">Total Budget</span>
                    <span className="text-white text-4xl font-bold">
                        {totalBudget.toLocaleString()}
                    </span>
                    <span className="text-white/80 text-2xl font-bold">ETB</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                     <Icons.Plus size={16} />
                      <span>{monthlySpent.toLocaleString()} spent</span>
                </div>
                <div className={`text-sm font-medium ${budgetUsedPercent >= 90 ? 'text-rose-300' : budgetUsedPercent >= 70 ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {budgetUsedPercent >= 90 && '⚠️ Over budget!'}
                    {budgetUsedPercent >= 70 && budgetUsedPercent < 90 && '⚠️ Monitor spending'}
                    {budgetUsedPercent < 70 && '✅ On Track'}
                </div>
            </div>

            <div>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-4">Top Categories</p>
                <div className="space-y-3">
                    {topCategories.map((cat, index) => (
                        <div key={cat.id} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                index === 0 ? 'bg-emerald-500/20' 
                                    : index === 1 ? 'bg-amber-500/20' 
                                    : 'bg-rose-500/20'
                            }`}>
                                <Icons.Plus size={16} className={`${
                                    index === 0 ? 'text-emerald-400' 
                                    : index === 1 ? 'text-amber-400' 
                                    : 'text-rose-400'
                                }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium">{cat.name}</span>
                                    <span className={`text-sm font-bold ${
                                        cat.percent >= 90 ? 'text-rose-300' 
                                        : cat.percent >= 70 ? 'text-amber-300' 
                                        : 'text-emerald-300'
                                    }`}>
                                        {cat.percent}%
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            cat.percent >= 90 ? 'bg-rose-400' 
                                            : cat.percent >= 70 ? 'bg-amber-400' 
                                            : 'bg-emerald-400'
                                        }`}
                                        style={{ width: `${Math.min(100, cat.percent)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-xs">{cat.spent.toLocaleString()} ETB</p>
                                <p className="text-white/40 text-xs">of {cat.allocated.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
