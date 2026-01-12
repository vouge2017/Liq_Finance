"use client"

import React, { useState, useMemo } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { AccountCard } from './components/AccountCard'
import { TransferModal } from './components/TransferModal'
import { AddAccountModal } from './components/AddAccountModal'
import type { Account } from '@/types'

export const AccountsPage: React.FC = () => {
    const { state, isPrivacyMode, addAccount } = useAppContext()
    const { accounts } = state

    const [showTransfer, setShowTransfer] = useState(false)
    const [showAddAccount, setShowAddAccount] = useState(false)
    const [filter, setFilter] = useState<'all' | 'bank' | 'mobile' | 'cash' | 'loan'>('all')

    const totalAssets = useMemo(() => {
        return accounts
            .filter(a => a.type !== 'Loan')
            .reduce((sum, acc) => sum + acc.balance, 0)
    }, [accounts])

    const totalLoans = useMemo(() => {
        return accounts
            .filter(a => a.type === 'Loan')
            .reduce((sum, acc) => sum + acc.balance, 0)
    }, [accounts])

    const netWorth = totalAssets - totalLoans

    const accountsByType = useMemo(() => {
        const grouped: Record<string, Account[]> = {}
        accounts.forEach(acc => {
            const type = acc.type
            if (!grouped[type]) grouped[type] = []
            grouped[type].push(acc)
        })
        return grouped
    }, [accounts])

    const accountTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
        'Bank': { icon: Icons.Briefcase, color: 'bg-blue-500', label: 'Bank Accounts' },
        'Mobile Money': { icon: Icons.Phone, color: 'bg-cyan-500', label: 'Mobile Money' },
        'Cash': { icon: Icons.Coins, color: 'bg-emerald-500', label: 'Cash' },
        'Loan': { icon: Icons.FileText, color: 'bg-rose-500', label: 'Loans' },
    }

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            <header className="px-5 pt-6 pb-4 sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => {}}
                        className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10"
                    >
                        <Icons.ChevronLeft size={22} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">Accounts</h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">ሒሳቦች</p>
                    </div>
                    <button
                        onClick={() => setShowAddAccount(true)}
                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                        <Icons.Plus size={24} className="text-white" />
                    </button>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white/10 dark:to-white/5 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Worth</p>
                            <p className="text-3xl font-black text-white tracking-tight">
                                {isPrivacyMode ? '••••••' : netWorth.toLocaleString()}
                                <span className="text-lg font-bold text-gray-400 ml-2">ETB</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setShowTransfer(true)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white transition-all"
                        >
                            Transfer
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assets</p>
                            <p className="text-lg font-bold text-emerald-400">
                                {isPrivacyMode ? '••••' : totalAssets.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loans</p>
                            <p className="text-lg font-bold text-rose-400">
                                {isPrivacyMode ? '••••' : totalLoans.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-5 space-y-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                    {(['all', 'bank', 'mobile', 'cash', 'loan'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                                filter === f
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>

                {Object.entries(accountsByType).map(([type, typeAccounts]) => {
                    const config = accountTypeConfig[type] || accountTypeConfig['Bank']
                    const IconComponent = config.icon

                    return (
                        <section key={type}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                    <IconComponent size={16} className="text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{config.label}</h3>
                                <span className="text-xs text-gray-400">({typeAccounts.length})</span>
                            </div>

                            <div className="space-y-3">
                                {typeAccounts.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        isPrivacyMode={isPrivacyMode}
                                    />
                                ))}
                            </div>
                        </section>
                    )
                })}

                {accounts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Icons.Wallet size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Accounts Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add your first account to get started</p>
                        <button
                            onClick={() => setShowAddAccount(true)}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30"
                        >
                            Add Account
                        </button>
                    </div>
                )}
            </div>

            <TransferModal
                isOpen={showTransfer}
                onClose={() => setShowTransfer(false)}
                accounts={accounts}
            />

            <AddAccountModal
                isOpen={showAddAccount}
                onClose={() => setShowAddAccount(false)}
                onAdd={addAccount}
            />
        </div>
    )
}
