"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { Account } from '@/types'

export const NetWorthCard: React.FC = () => {
    const { state, isPrivacyMode, togglePrivacyMode, formatDate } = useAppContext()
    const { accounts, transactions, budgetCategories } = state

    const netWorth = accounts.reduce((acc, curr) => {
        if (curr.type === 'Loan') return acc - curr.balance
        return acc + curr.balance
    }, 0)

    const monthlySpent = transactions
        .filter(t => {
            const d = new Date(t.date)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense'
        })
        .reduce((acc, curr) => acc + curr.amount, 0)

    const totalBudget = budgetCategories.reduce((acc, curr) => acc + curr.allocated, 0)
    const safeToSpend = Math.max(0, totalBudget - monthlySpent)

    const bankAssets = accounts.filter((a: Account) => a.type === 'Bank').reduce((acc, curr) => acc + curr.balance, 0)
    const mobileAssets = accounts.filter((a: Account) => a.type === 'Mobile Money').reduce((acc, curr) => acc + curr.balance, 0)
    const grossAssets = accounts.reduce((acc, curr) => {
        if (curr.type !== 'Loan') return acc + curr.balance
        return acc
    }, 0)

    const bankPercent = grossAssets > 0 ? (bankAssets / grossAssets) * 100 : 0
    const mobilePercent = grossAssets > 0 ? (mobileAssets / grossAssets) * 100 : 0
    const budgetUsagePercent = totalBudget > 0 ? Math.round((monthlySpent / totalBudget) * 100) : 0

    return (
        <div className="bg-gradient-to-br from-[#5855d6] via-[#6b5dd6] to-[#7c3aed] 
                        rounded-[2.5rem] p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(88,85,214,0.3)]
                        transition-all duration-500 relative overflow-hidden mb-8 group">

            {/* Glow effect background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/20 transition-all duration-500" />

            <div className="relative z-10">
                {/* Top Section: Label + Privacy Toggle */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                            <Icons.Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-white/70 text-[10px] uppercase font-black tracking-[0.2em]">
                                Total Balance
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-300 font-bold text-[10px]">Live Updates</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={togglePrivacyMode}
                        className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90 flex items-center justify-center shadow-lg"
                        aria-label="Toggle privacy mode"
                    >
                        {isPrivacyMode ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
                    </button>
                </div>

                {/* Main Balance Display */}
                <div className="mb-8">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-white text-7xl font-black tracking-tighter">
                            {isPrivacyMode ? '•••••••••••••' : netWorth.toLocaleString()}
                        </h2>
                        <span className="text-white/80 text-3xl font-bold">ETB</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/30">
                            <Icons.TrendingUp size={14} className="text-emerald-400" />
                            <span className="text-emerald-300 font-black text-xs">+{budgetUsagePercent.toFixed(1)}%</span>
                        </div>
                        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                            {budgetUsagePercent >= 80 ? 'Over Budget' : budgetUsagePercent >= 60 ? 'Monitor' : '✅ On Track'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                            <Icons.TrendingUp size={12} className="text-emerald-400" />
                            <span className="text-emerald-400 font-black text-[10px]">+12.5%</span>
                        </div>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">vs last month</span>
                    </div>
                </div>

                {/* Safe to Spend Section */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 mb-8 shadow-inner relative overflow-hidden group/safe">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

                    <p className="text-white/60 text-[10px] uppercase tracking-[0.15em] font-black mb-3">
                        Safe to Spend This Month
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-white text-4xl font-black tracking-tight">
                            {isPrivacyMode ? '••••' : safeToSpend.toLocaleString()}
                        </span>
                        <span className="text-white/50 text-base font-bold">ETB</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${budgetUsagePercent > 90 ? 'bg-rose-500' : budgetUsagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                            />
                        </div>
                        <span className="text-white/40 text-[10px] font-black">{budgetUsagePercent}% USED</span>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <p className="text-white/50 text-[10px] uppercase font-black tracking-wider mb-1">Spent Today</p>
                        <p className="text-white text-lg font-black">
                            {isPrivacyMode ? '•••' : '1,250'} <span className="text-xs text-white/40">ETB</span>
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <p className="text-white/50 text-[10px] uppercase font-black tracking-wider mb-1">Monthly Goal</p>
                        <p className="text-white text-lg font-black">
                            75% <span className="text-xs text-white/40">DONE</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
