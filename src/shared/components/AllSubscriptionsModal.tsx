"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import type { RecurringTransaction } from '@/types'

interface AllSubscriptionsModalProps {
    isOpen: boolean
    onClose: () => void
}

export const AllSubscriptionsModal: React.FC<AllSubscriptionsModalProps> = ({ isOpen, onClose }) => {
    const { state, updateRecurringTransaction, deleteRecurringTransaction } = useAppContext()
    const { recurringTransactions } = state
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'paid'>('all')

    if (!isOpen) return null

    const sortedSubscriptions = [...recurringTransactions].sort((a, b) =>
        new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
    )

    const filteredSubs = sortedSubscriptions.filter(sub => {
        if (filter === 'all') return true
        const dueDate = new Date(sub.next_due_date)
        const now = new Date()
        if (filter === 'upcoming') return dueDate >= now
        if (filter === 'paid') return dueDate < now
        return true
    })

    const totalMonthly = recurringTransactions
        .filter(r => r.recurrence === 'monthly')
        .reduce((sum, r) => sum + r.amount, 0)

    const totalWeekly = recurringTransactions
        .filter(r => r.recurrence === 'weekly')
        .reduce((sum, r) => sum + r.amount * 4, 0)

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'bills': case 'utilities': return Icons.Zap
            case 'rent': case 'housing': return Icons.Home
            case 'food': case 'groceries': return Icons.Utensils
            case 'transport': return Icons.Car
            case 'shopping': return Icons.Shopping
            case 'entertainment': return Icons.Film
            case 'education': return Icons.Education
            case 'health': return Icons.Heart
            default: return Icons.Recurring
        }
    }

    const getRecurrenceLabel = (recurrence: string) => {
        switch (recurrence) {
            case 'weekly': return 'Weekly'
            case 'monthly': return 'Monthly'
            case 'quarterly': return 'Quarterly'
            case 'annual': return 'Yearly'
            default: return recurrence
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const isOverdue = (dateStr: string) => new Date(dateStr) < new Date()

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center pointer-events-none">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#F9FAFB] dark:bg-[#101622] rounded-t-[2rem] sm:rounded-3xl p-6 pb-8 shadow-2xl pointer-events-auto animate-slide-up m-4 max-h-[85vh] flex flex-col">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Subscriptions</h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                    >
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                        <p className="text-xs font-bold opacity-80 mb-1">Monthly Total</p>
                        <p className="text-xl font-black">{totalMonthly.toLocaleString()}</p>
                        <p className="text-[10px] font-medium opacity-70">ETB / month</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
                        <p className="text-xs font-bold opacity-80 mb-1">Weekly Equivalent</p>
                        <p className="text-xl font-black">{(totalWeekly / 4).toLocaleString()}</p>
                        <p className="text-[10px] font-medium opacity-70">ETB / week</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    {(['all', 'upcoming', 'paid'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                                filter === f
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'upcoming' ? 'Upcoming' : 'Paid'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                    {filteredSubs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Icons.Recurring size={32} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">No subscriptions found</p>
                        </div>
                    ) : (
                        filteredSubs.map((sub) => {
                            const IconComponent = getCategoryIcon(sub.category)
                            const overdue = isOverdue(sub.next_due_date)

                            return (
                                <div
                                    key={sub.id}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        overdue
                                            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
                                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            overdue
                                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500'
                                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <IconComponent size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-[#111318] dark:text-white truncate">{sub.name}</h4>
                                                {overdue && (
                                                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex-shrink-0">OVERDUE</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {getRecurrenceLabel(sub.recurrence)} • {sub.payment_method}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-[#111318] dark:text-white">
                                                {sub.amount.toLocaleString()}
                                            </p>
                                            <p className={`text-xs font-medium ${overdue ? 'text-rose-500' : 'text-gray-400'}`}>
                                                Due {formatDate(sub.next_due_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                                        <button
                                            onClick={() => deleteRecurringTransaction(sub.id)}
                                            className="flex-1 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => updateRecurringTransaction({ ...sub, is_active: !sub.is_active })}
                                            className="flex-1 py-2 bg-primary/10 dark:bg-primary/20 rounded-xl text-xs font-bold text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-all"
                                        >
                                            {sub.is_active ? 'Pause' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
