"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

export interface FutureImpactData {
    cashRunway: {
        value: number
        unit: 'days' | 'months'
        status: 'healthy' | 'warning' | 'critical'
        previousValue?: number
    }
    iqubRisk: {
        hasActiveIqub: boolean
        nextPaymentDate?: string
        daysUntilPayment?: number
        canAfford: boolean
        riskLevel: 'low' | 'medium' | 'high'
    }
    budgetHealth: {
        spentPercentage: number
        remainingBudget: number
        isOverBudget: boolean
        daysRemainingInMonth: number
    }
    savingsRate: {
        currentRate: number
        targetRate: number
        status: 'on_track' | 'behind' | 'ahead'
    }
}

interface FutureMirrorDialogProps {
    isOpen: boolean
    impact: FutureImpactData
    onClose: () => void
    onConfirm: () => void
    transactionAmount: number
    transactionType: 'income' | 'expense'
}

export const FutureMirrorDialog: React.FC<FutureMirrorDialogProps> = ({
    isOpen,
    impact,
    onClose,
    onConfirm,
    transactionAmount,
    transactionType
}) => {
    if (!isOpen) return null

    const getRunwayColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30'
            case 'warning': return 'text-amber-500 bg-amber-500/20 border-amber-500/30'
            case 'critical': return 'text-rose-500 bg-rose-500/20 border-rose-500/30'
            default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30'
        }
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-emerald-500 bg-emerald-500/20'
            case 'medium': return 'text-amber-500 bg-amber-500/20'
            case 'high': return 'text-rose-500 bg-rose-500/20'
            default: return 'text-gray-500 bg-gray-500/20'
        }
    }

    const formatRunwayValue = (value: number, unit: 'days' | 'months') => {
        if (unit === 'months') {
            return value.toFixed(1)
        }
        return Math.round(value).toString()
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pointer-events-none">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#F9FAFB] dark:bg-[#101622] rounded-t-[2rem] sm:rounded-3xl p-6 pb-8 shadow-2xl pointer-events-auto animate-slide-up m-4">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Icons.Sparkles size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Future Mirror</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Transaction Impact Preview</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className={`p-5 rounded-2xl border-2 ${getRunwayColor(impact.cashRunway.status)}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Icons.Clock size={20} />
                                <span className="font-bold text-sm uppercase tracking-wider">Cash Runway</span>
                            </div>
                            {impact.cashRunway.status === 'critical' && (
                                <span className="px-3 py-1 rounded-full text-xs font-black animate-pulse">ACTION NEEDED</span>
                            )}
                        </div>
                        <div className="text-4xl font-black tracking-tight mb-1">
                            {formatRunwayValue(impact.cashRunway.value, impact.cashRunway.unit)}
                            <span className="text-lg font-bold ml-1 opacity-70">{impact.cashRunway.unit}</span>
                        </div>
                        <p className="text-xs font-medium opacity-80">
                            {transactionType === 'expense'
                                ? `This ${transactionAmount.toLocaleString()} ETB expense will reduce your runway`
                                : `This income will extend your runway`}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Icons.Users size={20} className="text-rose-500" />
                            <span className="font-bold text-sm uppercase tracking-wider text-rose-500">Iqub Risk</span>
                        </div>
                        {!impact.iqubRisk.hasActiveIqub ? (
                            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">No active Iqub - you're safe</p>
                        ) : (
                            <div className="space-y-2">
                                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(impact.iqubRisk.riskLevel)}`}>
                                    {impact.iqubRisk.riskLevel.toUpperCase()} RISK
                                </div>
                                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                                    {impact.iqubRisk.daysUntilPayment !== undefined && impact.iqubRisk.daysUntilPayment <= 3
                                        ? `Payment due in ${impact.iqubRisk.daysUntilPayment} day${impact.iqubRisk.daysUntilPayment === 1 ? '' : 's'}`
                                        : `Next payment: ${impact.iqubRisk.nextPaymentDate}`}
                                </p>
                                {!impact.iqubRisk.canAfford && (
                                    <p className="text-xs font-bold text-rose-500 bg-rose-500/20 px-2 py-1 rounded mt-2 inline-block">
                                        ⚠️ May not have enough for payment
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.PieChart size={16} className="text-gray-500" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget</span>
                            </div>
                            <p className={`text-xl font-black ${impact.budgetHealth.isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {impact.budgetHealth.spentPercentage.toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                                {impact.budgetHealth.isOverBudget
                                    ? `${Math.abs(impact.budgetHealth.remainingBudget).toLocaleString()} ETB over`
                                    : `${impact.budgetHealth.remainingBudget.toLocaleString()} ETB left`}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.TrendingUp size={16} className="text-gray-500" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Savings Rate</span>
                            </div>
                            <p className={`text-xl font-black ${impact.savingsRate.status === 'behind' ? 'text-rose-500' : impact.savingsRate.status === 'ahead' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {impact.savingsRate.currentRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                                Target: {impact.savingsRate.targetRate}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                        Review
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl text-white font-bold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all active:scale-[0.98]"
                    >
                        Save Anyway
                    </button>
                </div>
            </div>
        </div>
    )
}
