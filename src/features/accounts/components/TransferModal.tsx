"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Account } from '@/types'

interface TransferModalProps {
    isOpen: boolean
    onClose: () => void
    accounts: Account[]
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, accounts }) => {
    const [fromAccount, setFromAccount] = useState('')
    const [toAccount, setToAccount] = useState('')
    const [amount, setAmount] = useState('')
    const [errors, setErrors] = useState({ amount: false, from: false, to: false })

    if (!isOpen) return null

    const handleTransfer = () => {
        const hasErrors = {
            amount: !amount || parseFloat(amount.replace(/,/g, '')) <= 0,
            from: !fromAccount,
            to: !toAccount || toAccount === fromAccount,
        }
        setErrors(hasErrors)
        if (hasErrors.amount || hasErrors.from || hasErrors.to) return
        onClose()
    }

    const formatNumber = (value: string) => {
        const val = value.replace(/,/g, '')
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            return parts.join('.')
        }
        return value
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#F9FAFB] dark:bg-[#101622] rounded-t-[2rem] sm:rounded-3xl p-6 pb-8 shadow-2xl pointer-events-auto animate-slide-up m-4">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Money</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">From</label>
                        <select
                            value={fromAccount}
                            onChange={(e) => { setFromAccount(e.target.value); setErrors(p => ({ ...p, from: false })); }}
                            className={`w-full bg-white dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ${errors.from ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                            <option value="">Select account</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toLocaleString()} ETB)</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                            <Icons.ArrowDown size={18} className="text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">To</label>
                        <select
                            value={toAccount}
                            onChange={(e) => { setToAccount(e.target.value); setErrors(p => ({ ...p, to: false })); }}
                            className={`w-full bg-white dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ${errors.to ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                            <option value="">Select account</option>
                            {accounts.filter(a => a.id !== fromAccount).map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Amount</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => { setAmount(formatNumber(e.target.value)); setErrors(p => ({ ...p, amount: false })); }}
                                placeholder="0"
                                className={`w-full bg-white dark:bg-white/5 border rounded-xl px-4 py-3 text-2xl font-bold text-gray-900 dark:text-white outline-none pr-16 ${errors.amount ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">ETB</span>
                        </div>
                    </div>

                    <button
                        onClick={handleTransfer}
                        className="w-full py-4 bg-primary rounded-xl text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
                    >
                        Transfer
                    </button>
                </div>
            </div>
        </div>
    )
}
