"use client"

import React from 'react'
import { Icons } from "@/shared/components/Icons"

interface AdvancedTransactionDetailsProps {
    date: string
    setDate: (val: string) => void
    isRecurring: boolean
    setIsRecurring: (val: boolean) => void
}

export const AdvancedTransactionDetails: React.FC<AdvancedTransactionDetailsProps> = ({
    date,
    setDate,
    isRecurring,
    setIsRecurring
}) => {
    const getTodayDate = () => new Date().toISOString().split('T')[0]
    const getYesterdayDate = () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.toISOString().split('T')[0]
    }

    return (
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10 animate-slide-down">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-primary appearance-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Icons.Calendar size={16} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDate(getTodayDate())}
                            className="flex-1 py-1.5 px-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-[10px] font-medium text-gray-500 dark:text-gray-400 transition-all"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDate(getYesterdayDate())}
                            className="flex-1 py-1.5 px-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-[10px] font-medium text-gray-500 dark:text-gray-400 transition-all"
                        >
                            Yesterday
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Recurring</label>
                    <button
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`w-full h-[70px] rounded-xl border flex items-center justify-center gap-2 transition-all ${
                            isRecurring
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isRecurring ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400"
                        }`}>
                            <Icons.Recurring size={18} className={isRecurring ? "" : ""} />
                        </div>
                        <div className="text-left">
                            <span className={`block font-bold text-sm ${isRecurring ? "text-primary" : "text-gray-600 dark:text-gray-300"}`}>
                                {isRecurring ? "Repeat" : "One-time"}
                            </span>
                            <span className="block text-[10px] text-gray-400">
                                {isRecurring ? "Monthly transaction" : "Single entry"}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Icons.Sparkles size={16} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {isRecurring
                        ? "This transaction will be added to your recurring list. You can manage it in Subscriptions."
                        : "Enable recurring for regular expenses like rent, bills, or subscriptions to track them automatically."}
                </p>
            </div>
        </div>
    )
}
