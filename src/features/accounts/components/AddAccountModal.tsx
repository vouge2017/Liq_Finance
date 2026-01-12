"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Account } from '@/types'

interface AddAccountModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (account: Account) => void
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('')
    const [type, setType] = useState<'Bank' | 'Mobile Money' | 'Cash' | 'Loan'>('Bank')
    const [institution, setInstitution] = useState('')
    const [balance, setBalance] = useState('')
    const [errors, setErrors] = useState({ name: false, balance: false })

    const accountTypes = [
        { id: 'Bank', icon: Icons.Briefcase, color: 'bg-blue-500' },
        { id: 'Mobile Money', icon: Icons.Phone, color: 'bg-cyan-500' },
        { id: 'Cash', icon: Icons.Coins, color: 'bg-emerald-500' },
        { id: 'Loan', icon: Icons.FileText, color: 'bg-rose-500' },
    ]

    const formatNumber = (value: string) => {
        const val = value.replace(/,/g, '')
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            return parts.join('.')
        }
        return value
    }

    const handleAdd = () => {
        const hasErrors = {
            name: !name.trim(),
            balance: !balance || parseFloat(balance.replace(/,/g, '')) <= 0,
        }
        setErrors(hasErrors)
        if (hasErrors.name || hasErrors.balance) return

        const colors: Record<string, string> = {
            'Bank': 'bg-blue-600',
            'Mobile Money': 'bg-cyan-600',
            'Cash': 'bg-emerald-600',
            'Loan': 'bg-rose-600',
        }

        const newAccount: Account = {
            id: Date.now().toString(),
            name,
            type,
            institution: institution || type,
            balance: parseFloat(balance.replace(/,/g, '')),
            currency: 'ETB',
            color: colors[type],
            profile: 'Personal',
        }

        onAdd(newAccount)
        onClose()
        setName('')
        setBalance('')
        setInstitution('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#F9FAFB] dark:bg-[#101622] rounded-t-[2rem] sm:rounded-3xl p-6 pb-8 shadow-2xl pointer-events-auto animate-slide-up m-4">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Account</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Account Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: false })); }}
                            placeholder="e.g., My Savings"
                            className={`w-full bg-white dark:bg-white/5 border rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ${errors.name ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Account Type</label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {accountTypes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id as any)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${type === t.id ? `${t.color} text-white border-transparent` : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <t.icon size={20} />
                                    <span className="text-[9px] font-bold">{t.id.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Institution (Optional)</label>
                        <input
                            type="text"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder="e.g., Commercial Bank"
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Current Balance</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={balance}
                                onChange={(e) => { setBalance(formatNumber(e.target.value)); setErrors(p => ({ ...p, balance: false })); }}
                                placeholder="0"
                                className={`w-full bg-white dark:bg-white/5 border rounded-xl px-4 py-3 text-2xl font-bold text-gray-900 dark:text-white outline-none pr-16 ${errors.balance ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">ETB</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="w-full py-4 bg-primary rounded-xl text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
                    >
                        Add Account
                    </button>
                </div>
            </div>
        </div>
    )
}
