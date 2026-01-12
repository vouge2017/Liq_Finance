"use client"

import React, { useState, useEffect } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { SyncStatus } from '@/components/SyncStatus'

interface DashboardHeaderProps {
    onProfileClick?: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onProfileClick }) => {
    const { state, activeProfile, setActiveProfile } = useAppContext()
    const [currentDate, setCurrentDate] = useState<Date>(new Date())

    useEffect(() => {
        const interval = setInterval(() => setCurrentDate(new Date()), 60000)
        return () => clearInterval(interval)
    }, [])

    const formatDisplayDate = () => {
        const now = new Date()
        const ethMonths = ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"]
        const ethDate = {
            month: ethMonths[now.getMonth()],
            day: now.getDate(),
            year: now.getFullYear() - 8
        }
        return `${ethDate.month} ${ethDate.day}, ${ethDate.year} ዓ.ም`
    }

    const getGreeting = () => {
        const hour = currentDate.getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 18) return "Good Afternoon"
        return "Good Evening"
    }

    return (
        <header className="flex items-center justify-between pt-2 pb-6">
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-2 border-white dark:border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            onClick={onProfileClick}
                            style={{ backgroundImage: `url("${activeProfile === "Personal" ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Family"}")` }}
                        />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-background-dark animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getGreeting()}</span>
                        <h2 className="text-2xl font-black leading-tight tracking-tight text-[#111318] dark:text-white">
                            Selam, {state.userName?.split(' ')[0] || "User"}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-14">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 rounded-full border border-gray-100 dark:border-gray-800 shadow-md">
                        <span className="text-gray-700 dark:text-gray-200 text-xs font-bold">{formatDisplayDate()}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <SyncStatus />
                <button className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-white/5 shadow-md border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">
                    <Icons.Bell size={22} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-background-dark" />
                </button>
            </div>
        </header>
    )
}
