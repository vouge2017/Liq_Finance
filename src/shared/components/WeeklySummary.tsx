"use client"

import React, { useMemo } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { calculateInsights } from '@/utils/insights'

export const WeeklySummary: React.FC = () => {
    const { state } = useAppContext()
    const { transactions } = state

    // Mock monthly income for now (or get from settings if available)
    const monthlyIncome = 15000

    const insights = useMemo(() =>
        calculateInsights(transactions, monthlyIncome, 7),
        [transactions]
    )

    if (transactions.length < 3) return null // Need some data

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700/50 mb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-white font-bold text-lg">Weekly Insights</h3>
                    <p className="text-gray-400 text-xs">Last 7 days analysis</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${insights.trend === 'down' ? 'bg-emerald-500/20 text-emerald-400' :
                    insights.trend === 'up' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-gray-700 text-gray-300'
                    }`}>
                    {insights.trend === 'down' ? <Icons.ArrowDown size={12} /> :
                        insights.trend === 'up' ? <Icons.ArrowUp size={12} /> :
                            <Icons.Minus size={12} />}
                    {Math.round(insights.trendPercentage)}% vs last week
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-2xl p-4">
                    <p className="text-gray-500 text-xs mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-white">
                        {Math.round(insights.totalSpent).toLocaleString()}
                        <span className="text-xs text-gray-500 font-normal ml-1">ETB</span>
                    </p>
                </div>
                <div className="bg-black/30 rounded-2xl p-4">
                    <p className="text-gray-500 text-xs mb-1">Daily Average</p>
                    <p className="text-2xl font-bold text-white">
                        {Math.round(insights.dailyAverage).toLocaleString()}
                        "use client"

                        import React, {useMemo} from 'react'
                        import {Icons} from '@/shared/components/Icons'
                        import {useAppContext} from '@/context/AppContext'
                        import {calculateInsights} from '@/utils/insights'

export const WeeklySummary: React.FC = () => {
    const {state} = useAppContext()
                        const {transactions} = state

                        // Mock monthly income for now (or get from settings if available)
                        const monthlyIncome = 15000

    const insights = useMemo(() =>
                        calculateInsights(transactions, monthlyIncome, 7),
                        [transactions]
                        )

                        if (transactions.length < 3) return null // Need some data

                        return (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700/50 mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Weekly Insights</h3>
                                    <p className="text-gray-400 text-xs">Last 7 days analysis</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${insights.trend === 'down' ? 'bg-emerald-500/20 text-emerald-400' :
                                    insights.trend === 'up' ? 'bg-rose-500/20 text-rose-400' :
                                        'bg-gray-700 text-gray-300'
                                    }`}>
                                    {insights.trend === 'down' ? <Icons.ArrowDown size={12} /> :
                                        insights.trend === 'up' ? <Icons.ArrowUp size={12} /> :
                                            <Icons.Minus size={12} />}
                                    {Math.round(insights.trendPercentage)}% vs last week
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/30 rounded-2xl p-4">
                                    <p className="text-gray-500 text-xs mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-white">
                                        {Math.round(insights.totalSpent).toLocaleString()}
                                        <span className="text-xs text-gray-500 font-normal ml-1">ETB</span>
                                    </p>
                                </div>
                                <div className="bg-black/30 rounded-2xl p-4">
                                    <p className="text-gray-500 text-xs mb-1">Daily Average</p>
                                    <p className="text-2xl font-bold text-white">
                                        {Math.round(insights.dailyAverage).toLocaleString()}
                                        <span className="text-xs text-gray-500 font-normal ml-1">ETB</span>
                                    </p>
                                </div>
                            </div>

                            {insights.topCategory && (
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <Icons.PieChart size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-white font-medium">{insights.topCategory.name}</span>
                                            <span className="text-sm text-gray-400">{Math.round(insights.topCategory.percentage)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500 rounded-full"
                                                style={{ width: `${insights.topCategory.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Highest spending category this week
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Budget Alerts */}
                            {insights.totalSpent > (monthlyIncome / 4) * 1.2 && (
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                    <Icons.AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-xs font-bold text-orange-400 mb-1">High Spending Alert</p>
                                        <p className="text-[10px] text-gray-400">
                                            You've spent {Math.round((insights.totalSpent / (monthlyIncome / 4)) * 100)}% of your weekly average.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        )
}
