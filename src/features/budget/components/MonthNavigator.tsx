"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface MonthNavigatorProps {
    currentDate: Date
    onDateChange: (date: Date) => void
    calendarMode: 'gregorian' | 'ethiopian'
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
    currentDate,
    onDateChange,
    calendarMode
}) => {
    const ethMonths = [
        "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት",
        "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
    ]

    const getDisplayMonth = () => {
        if (calendarMode === 'ethiopian') {
            const ethDate = getEthiopianDate(currentDate)
            return `${ethDate.month} ${ethDate.year}`
        }
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    }

    const getEthiopianDate = (date: Date) => {
        let ethIndex = date.getMonth() - 8
        let ethYear = date.getFullYear() - 8
        if (ethIndex < 0) ethIndex += 13
        if (date.getMonth() >= 8 && date.getDate() >= 11) ethYear = date.getFullYear() - 7
        return { month: ethMonths[ethIndex % 13], year: ethYear }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (calendarMode === 'ethiopian') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        }
        onDateChange(newDate)
    }

    const goToToday = () => {
        onDateChange(new Date())
    }

    const isCurrentMonth = () => {
        const today = new Date()
        return currentDate.getMonth() === today.getMonth() &&
               currentDate.getFullYear() === today.getFullYear()
    }

    return (
        <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-md border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all"
                    aria-label="Previous month"
                >
                    <Icons.ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
                </button>

                <div className="flex flex-col items-center min-w-[140px]">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        {getDisplayMonth()}
                    </h2>
                    {!isCurrentMonth() && (
                        <button
                            onClick={goToToday}
                            className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 mt-0.5"
                        >
                            <Icons.Calendar size={12} />
                            Go to today
                        </button>
                    )}
                </div>

                <button
                    onClick={() => navigateMonth('next')}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-md border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all"
                    aria-label="Next month"
                >
                    <Icons.ChevronRight size={22} className="text-gray-700 dark:text-gray-300" />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10">
                    <Icons.Calendar size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {calendarMode === 'ethiopian' ? 'Ethiopian' : 'Gregorian'}
                    </span>
                </div>
            </div>
        </div>
    )
}
