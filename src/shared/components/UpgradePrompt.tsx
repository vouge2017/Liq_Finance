"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { X, Crown } from 'lucide-react'

interface UpgradePromptProps {
    feature: 'voice' | 'receipt'
    isOpen: boolean
    onClose: () => void
    onUpgrade: () => void
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, onUpgrade, feature }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-theme-card w-full max-w-sm rounded-3xl p-6 relative animate-scale-up border border-theme shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                        <Crown size={32} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                        Upgrade to Pro
                    </h3>

                    <p className="text-gray-400 text-sm mb-6">
                        You've reached your daily limit for {feature === 'voice' ? 'Voice Commands' : 'Receipt Scanning'}.
                        Unlock unlimited AI power for just <span className="text-cyan-400 font-bold">100 ETB/month</span>.
                    </p>

                    <div className="w-full space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Icons.CheckCircle className="text-emerald-400 shrink-0" size={20} />
                            <span className="text-sm text-gray-300">Unlimited Voice & Scan</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Icons.CheckCircle className="text-emerald-400 shrink-0" size={20} />
                            <span className="text-sm text-gray-300">Advanced Spending Insights</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <Icons.CheckCircle className="text-emerald-400 shrink-0" size={20} />
                            <span className="text-sm text-gray-300">Priority Support</span>
                        </div>
                    </div>

                    <button
                        onClick={onUpgrade}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-bold text-black shadow-lg hover:shadow-orange-500/20 transition-all active:scale-[0.98]"
                    >
                        Upgrade Now
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-300"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    )
}
