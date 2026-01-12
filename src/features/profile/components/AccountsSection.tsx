"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { type Account } from '@/types'

export const AccountsSection: React.FC = () => {
    const { state, setActiveTab, openTransactionModal } = useAppContext()
    const { accounts } = state

    const getAccountIcon = (type: Account['type']) => {
        switch(type) {
            case 'Bank': return Icons.Bank
            case 'Mobile Money': return Icons.Phone
            case 'Cash': return Icons.Cash
            case 'Loan': return Icons.CreditCard
            default: return Icons.Wallet
        }
    }

    const getAccountColor = (type: Account['type']) => {
        switch(type) {
            case 'Bank': return 'bg-blue-500/10 border-blue-500/20'
            case 'Mobile Money': return 'bg-emerald-500/10 border-emerald-500/20'
            case 'Cash': return 'bg-amber-500/10 border-amber-500/20'
            case 'Loan': return 'bg-rose-500/10 border-rose-500/20'
            default: return 'bg-gray-500/10 border-gray-500/20'
        }
    }

    const getIconColor = (type: Account['type']) => {
        switch(type) {
            case 'Bank': return 'text-blue-500'
            case 'Mobile Money': return 'text-emerald-500'
            case 'Cash': return 'text-amber-500'
            case 'Loan': return 'text-rose-500'
            default: return 'text-gray-500'
        }
    }

    const totalBalance = accounts.reduce((sum, acc) => {
        if (acc.type === 'Loan') return sum - acc.balance
        return sum + acc.balance
    }, 0)

    return (
        <div className="space-y-3">
            <div className="bg-gradient-to-br from-primary to-cyan-500 p-5 rounded-[2rem] text-white">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Icons.Wallet size={20} />
                        <span className="font-bold text-sm">Total Balance</span>
                    </div>
                    <Icons.MoreVertical size={20} className="opacity-60" />
                </div>
                <p className="text-3xl font-black">{totalBalance.toLocaleString()} <span className="text-sm font-bold">ETB</span></p>
            </div>

            <div className="space-y-3">
                {accounts.map(account => {
                    const Icon = getAccountIcon(account.type)
                    const bgColor = getAccountColor(account.type)
                    const iconColor = getIconColor(account.type)
                    
                    return (
                        <div 
                            key={account.id}
                            onClick={() => setActiveTab('accounts')}
                            className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-4 rounded-[2rem] shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${bgColor} border flex items-center justify-center`}>
                                        <Icon size={24} className={iconColor} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-base">{account.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{account.institution}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black ${account.type === 'Loan' ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                                        {account.balance.toLocaleString()} <span className="text-xs text-gray-400 font-bold">ETB</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{account.type}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {accounts.length === 0 && (
                    <div className="bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-6 text-center">
                        <Icons.Plus size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No accounts yet</p>
                    </div>
                )}
            </div>

            <button 
                onClick={() => {
                    openTransactionModal(undefined, { type: 'income' })
                }}
                className="w-full py-4 bg-primary/10 text-primary rounded-2xl font-bold border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Icons.Plus size={18} />
                Add Account
            </button>
        </div>
    )
}
