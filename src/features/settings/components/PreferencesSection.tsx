"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

export const PreferencesSection: React.FC = () => {
    const { calendarMode, setCalendarMode } = useAppContext()

    const [darkMode, setDarkMode] = useState(true)
    const [notifications, setNotifications] = useState(true)
    const [currency, setCurrency] = useState('ETB')

    const currencies = [
        { code: 'ETB', symbol: 'ETB', name: 'Ethiopian Birr' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
    ]

    return (
        <div className="fixed inset-0 z-[60] bg-[#f6f6f8] dark:bg-[#101622] animate-fade-in">
            <div className="flex items-center gap-4 px-5 pt-6 pb-4 border-b border-gray-100 dark:border-white/10">
                <button onClick={() => {}} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center">
                    <Icons.ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h2>
            </div>

            <div className="px-5 py-6 space-y-6">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Appearance</label>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    {darkMode ? <Icons.Moon size={20} className="text-indigo-500" /> : <Icons.Sun size={20} className="text-amber-500" />}
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">Dark Mode</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Calendar</label>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        <button
                            onClick={() => setCalendarMode(calendarMode === 'ethiopian' ? 'gregorian' : 'ethiopian')}
                            className="w-full flex items-center justify-between p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Icons.Calendar size={20} className="text-primary" />
                                </div>
                                <div className="text-left">
                                    <span className="font-bold text-gray-700 dark:text-gray-200 block">Calendar System</span>
                                    <span className="text-xs text-gray-500">{calendarMode === 'ethiopian' ? 'Ethiopian (የኢትዮጵያ ዘመን)' : 'Gregorian'}</span>
                                </div>
                            </div>
                            <Icons.ChevronRight size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Currency</label>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full flex items-center justify-between p-4 bg-transparent font-bold text-gray-700 dark:text-gray-200 outline-none appearance-none"
                        >
                            {currencies.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Notifications</label>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    <Icons.Bell size={20} className="text-gray-500" />
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">Push Notifications</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </button>
                        <button className="w-full flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    <Icons.Mail size={20} className="text-gray-500" />
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">Email Alerts</span>
                            </div>
                            <div className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600">
                                <div className="w-5 h-5 bg-white rounded-full shadow translate-x-0.5" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
