"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

interface BudgetHeaderProps {
    onBack: () => void
    onSearch: () => void
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({ onBack, onSearch }) => {
    const { calendarMode } = useAppContext()

    return (
        <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 active:scale-90 transition-all"
                    aria-label="Go back to dashboard"
                >
                    <Icons.ChevronLeft size={22} className="text-gray-900 dark:text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Budget & Expenses</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                        {calendarMode === 'ethiopian' ? 'በጀት እና ወጪዎች' : 'ወርሃዊ በጀት'}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </p>
                </div>
            </div>
            <button
                onClick={onSearch}
                className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 active:scale-90 transition-all"
                aria-label="Search transactions"
            >
                <Icons.Search size={22} className="text-gray-700 dark:text-gray-300" />
            </button>
        </header>
    )
}
