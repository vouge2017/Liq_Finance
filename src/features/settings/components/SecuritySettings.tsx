"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

export const SecuritySettings: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[60] bg-[#f6f6f8] dark:bg-[#101622] animate-fade-in">
            <div className="flex items-center gap-4 px-5 pt-6 pb-4 border-b border-gray-100 dark:border-white/10">
                <button onClick={() => {}} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center">
                    <Icons.ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security</h2>
            </div>

            <div className="px-5 py-6 space-y-6">
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Icons.Lock size={20} className="text-emerald-500" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-gray-700 dark:text-gray-200 block">Change PIN</span>
                                <span className="text-xs text-gray-500">Update your security PIN</span>
                            </div>
                        </div>
                        <Icons.ChevronRight size={18} className="text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Icons.Fingerprint size={20} className="text-blue-500" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-gray-700 dark:text-gray-200 block">Biometric Lock</span>
                                <span className="text-xs text-gray-500">Use fingerprint or face</span>
                            </div>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600">
                            <div className="w-5 h-5 bg-white rounded-full shadow translate-x-0.5" />
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Icons.Eye size={20} className="text-amber-500" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-gray-700 dark:text-gray-200 block">Privacy Mode</span>
                                <span className="text-xs text-gray-500">Hide amounts on screen</span>
                            </div>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-primary">
                            <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Icons.Shield size={20} className="text-rose-500" />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-gray-700 dark:text-gray-200 block">Two-Factor Auth</span>
                                <span className="text-xs text-gray-500">Add extra security</span>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded">Coming Soon</span>
                    </button>
                </div>

                <div className="bg-rose-500/10 rounded-2xl border border-rose-500/20 p-4">
                    <div className="flex items-start gap-3">
                        <Icons.AlertTriangle size={20} className="text-rose-500 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-rose-500 text-sm">Danger Zone</h4>
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button className="mt-3 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
