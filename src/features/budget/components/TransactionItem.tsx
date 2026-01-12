"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Transaction } from '@/types'

interface TransactionItemProps {
    transaction: Transaction
    formatDate: (dateStr: string) => string
    isPrivacyMode: boolean
    onEdit: (tx: Transaction) => void
    onDelete: (id: string) => void
    onClick?: (tx: Transaction) => void
}

const CATEGORY_STYLES: Record<string, { icon: React.ElementType; bgColor: string; textColor: string }> = {
    transport: { icon: Icons.Car, bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-600 dark:text-slate-400' },
    food: { icon: Icons.Coffee, bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400' },
    shopping: { icon: Icons.Shopping, bgColor: 'bg-pink-50 dark:bg-pink-900/20', textColor: 'text-pink-600 dark:text-pink-400' },
    utilities: { icon: Icons.Zap, bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
    income: { icon: Icons.Wallet, bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
    transfer: { icon: Icons.Transfer, bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', textColor: 'text-cyan-600 dark:text-cyan-400' },
    default: { icon: Icons.CreditCard, bgColor: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-600 dark:text-gray-400' },
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
    transaction: tx,
    formatDate,
    isPrivacyMode,
    onEdit,
    onDelete,
    onClick
}) => {
    const getCategoryStyle = () => {
        if (tx.type === 'transfer') return CATEGORY_STYLES.transfer
        if (tx.type === 'income') return CATEGORY_STYLES.income
        if (tx.category?.toLowerCase().includes('transport') || tx.title?.toLowerCase().includes('uber')) return CATEGORY_STYLES.transport
        if (tx.category?.toLowerCase().includes('food') || tx.title?.toLowerCase().includes('coffee')) return CATEGORY_STYLES.food
        if (tx.category?.toLowerCase().includes('shopping')) return CATEGORY_STYLES.shopping
        if (tx.category?.toLowerCase().includes('utilities') || tx.title?.toLowerCase().includes('telecom')) return CATEGORY_STYLES.utilities
        return CATEGORY_STYLES.default
    }

    const style = getCategoryStyle()
    const IconComponent = style.icon

    const formatTransactionDate = () => {
        const d = new Date(tx.date)
        const now = new Date()
        const isToday = d.toDateString() === now.toDateString()
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        const isYesterday = d.toDateString() === yesterday.toDateString()
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        if (isToday) return `Today, ${time}`
        if (isYesterday) return 'Yesterday'
        return formatDate(tx.date)
    }

    const handleClick = () => {
        if (onClick) {
            onClick(tx)
        } else {
            onEdit(tx)
        }
    }

    return (
        <div className="group relative bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div
                onClick={handleClick}
                className="p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${style.bgColor} flex items-center justify-center ${style.textColor} shadow-sm`}>
                        <IconComponent size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="font-bold text-[#111318] dark:text-white text-sm">{tx.title}</p>
                        <p className="text-xs text-gray-500 font-medium">{formatTransactionDate()}</p>
                    </div>
                </div>
                <p className="font-black text-[#111318] dark:text-white text-base">
                    {isPrivacyMode ? '••••' : (
                        <>
                            {tx.type === 'income' ? '+' : '-'}ETB {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </>
                    )}
                </p>
            </div>

            <div className="absolute right-0 top-0 bottom-0 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                    className="flex items-center justify-center w-14 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    <Icons.Edit size={18} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                    className="flex items-center justify-center w-14 bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                    <Icons.Delete size={18} />
                </button>
            </div>
        </div>
    )
}
