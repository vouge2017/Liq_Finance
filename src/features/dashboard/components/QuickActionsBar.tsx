"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

interface QuickActionsBarProps {
    onVoiceOpen?: () => void
    onScanOpen?: () => void
    onAddTransaction?: () => void
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
    onVoiceOpen,
    onScanOpen,
    onAddTransaction
}) => {
    const { openTransactionModal } = useAppContext()

    const handleAddTransaction = () => {
        if (onAddTransaction) {
            onAddTransaction()
        } else {
            openTransactionModal()
        }
    }

    const handleVoiceOpen = () => {
        if (onVoiceOpen) {
            onVoiceOpen()
        } else {
            openTransactionModal(undefined, undefined, { voice: true })
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 mb-8 px-1">
            <button
                onClick={handleAddTransaction}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-cyan-400 text-black font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
            >
                <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                    <Icons.Plus size={22} strokeWidth={3} />
                </div>
                <span className="text-sm font-black tracking-wide">Add Transaction</span>
            </button>

            <button
                onClick={handleVoiceOpen}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icons.Mic size={22} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-black tracking-wide">Voice</span>
            </button>

            <button
                onClick={onScanOpen}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 font-bold rounded-2xl shadow-lg shadow-gray-200 dark:shadow-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
            >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <Icons.Scan size={22} className="text-gray-600 dark:text-gray-300" />
                </div>
            </button>
        </div>
    )
}
