"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Account } from '@/types'

interface AccountCardProps {
    account: Account
    isPrivacyMode?: boolean
    onClick?: () => void
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, isPrivacyMode, onClick }) => {
    const typeConfig: Record<string, { icon: any; bg: string; text: string }> = {
        'Bank': { icon: Icons.Briefcase, bg: 'bg-blue-500', text: 'text-blue-500' },
        'Mobile Money': { icon: Icons.Phone, bg: 'bg-cyan-500', text: 'text-cyan-500' },
        'Cash': { icon: Icons.Coins, bg: 'bg-emerald-500', text: 'text-emerald-500' },
        'Loan': { icon: Icons.FileText, bg: 'bg-rose-500', text: 'text-rose-500' },
        'Investment': { icon: Icons.TrendingUp, bg: 'bg-purple-500', text: 'text-purple-500' },
    }

    const config = typeConfig[account.type] || typeConfig['Bank']
    const IconComponent = config.icon

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shadow-lg shadow-${account.color?.replace('bg-', '').split(' ')[0] || 'gray'}/30`}>
                    <IconComponent size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{account.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{account.institution || account.type}</p>
                </div>
                <div className="text-right">
                    <p className={`text-lg font-black ${account.type === 'Loan' ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                        {isPrivacyMode ? '••••' : account.balance.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">ETB</p>
                </div>
            </div>
        </div>
    )
}
