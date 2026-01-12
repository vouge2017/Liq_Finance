"use client"

import React, { useState, useEffect } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { ProfileSection } from './components/ProfileSection'
import { PreferencesSection } from './components/PreferencesSection'
import { SecuritySettings } from './components/SecuritySettings'

export const SettingsPage: React.FC = () => {
    const { state, setCalendarMode, setActiveTab } = useAppContext()
    const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'security'>('profile')

    const sections = [
        { id: 'profile', icon: Icons.User, label: 'Profile', description: 'Account details' },
        { id: 'preferences', icon: Icons.Settings, label: 'Preferences', description: 'App settings' },
        { id: 'security', icon: Icons.Shield, label: 'Security', description: 'Privacy & safety' },
    ]

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            <header className="px-5 pt-6 pb-4 sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10"
                    >
                        <Icons.ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">ማስተካከያዎች</p>
                    </div>
                    <div className="w-12 h-12" />
                </div>
            </header>

            <div className="px-5 space-y-6">
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</h3>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id as any)}
                                className={`w-full flex items-center gap-4 p-4 transition-all ${
                                    activeSection === section.id
                                        ? 'bg-primary/10 border-l-4 border-primary'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    activeSection === section.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                                }`}>
                                    <section.icon size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-gray-900 dark:text-white">{section.label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
                                </div>
                                <Icons.ChevronRight size={18} className="text-gray-400" />
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">App Info</h3>
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Icons.Info size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Version</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">1.0.0</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Icons.Star size={20} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Rate App</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Share your feedback</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Icons.HelpCircle size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Help Center</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">FAQs & Support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pb-8">
                    <button className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                        Sign Out
                    </button>
                </section>
            </div>

            {activeSection === 'profile' && <ProfileSection onClose={() => setActiveSection('preferences')} />}
            {activeSection === 'preferences' && <PreferencesSection />}
            {activeSection === 'security' && <SecuritySettings />}
        </div>
    )
}
