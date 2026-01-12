"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface IqubVisualProps {
    currentRound: number
    totalMembers: number
    paidRounds: number
    winningRound?: number
    hasWon: boolean
    size?: 'sm' | 'md' | 'lg'
}

export const IqubVisual: React.FC<IqubVisualProps> = ({
    currentRound,
    totalMembers,
    paidRounds,
    winningRound,
    hasWon,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: { container: 'w-8 h-10', text: 'text-[8px]', padding: 'p-1' },
        md: { container: 'w-10 h-14', text: 'text-[10px]', padding: 'p-1.5' },
        lg: { container: 'w-12 h-16', text: 'text-xs', padding: 'p-2' },
    }

    const s = sizeClasses[size]

    return (
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {Array.from({ length: totalMembers }).map((_, idx) => {
                const roundNum = idx + 1
                const isPaid = roundNum <= paidRounds
                const isWinRound = winningRound === roundNum
                const isCurrent = roundNum === paidRounds + 1

                const getStyles = () => {
                    if (isWinRound) {
                        return 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-300 text-black shadow-lg shadow-yellow-500/40 scale-110 z-10'
                    }
                    if (isPaid) {
                        return 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400 text-white'
                    }
                    if (isCurrent) {
                        return 'bg-white dark:bg-white/10 border-2 border-primary shadow-lg shadow-primary/20'
                    }
                    return 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-300'
                }

                return (
                    <div
                        key={idx}
                        className={`${s.container} ${s.padding} rounded-lg flex flex-col items-center justify-center font-bold border-2 transition-all ${getStyles()}`}
                    >
                        <span className={s.text}>R{roundNum}</span>
                        {isWinRound ? (
                            <Icons.Trophy size={10} className="mt-0.5" />
                        ) : isPaid ? (
                            <Icons.Check size={10} className="mt-0.5" />
                        ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20 mt-0.5" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

interface IqubCardProps {
    title: string
    amount: number
    cycle: string
    members: number
    currentRound: number
    paidRounds: number
    nextPaymentDate: string
    hasWon: boolean
    winningRound?: number
    isPrivacyMode?: boolean
    onPay?: () => void
    onClaimWin?: () => void
}

export const IqubCard: React.FC<IqubCardProps> = ({
    title,
    amount,
    cycle,
    members,
    currentRound,
    paidRounds,
    nextPaymentDate,
    hasWon,
    winningRound,
    isPrivacyMode,
    onPay,
    onClaimWin
}) => {
    const isComplete = paidRounds >= members
    const progress = (paidRounds / members) * 100

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">
                        {cycle} • {members} members
                    </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    isComplete
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                }`}>
                    {isComplete ? 'Complete' : 'Active'}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Round {paidRounds + 1} of {members}</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <IqubVisual
                currentRound={currentRound}
                totalMembers={members}
                paidRounds={paidRounds}
                winningRound={winningRound}
                hasWon={hasWon}
                size="sm"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Next Payment</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {isPrivacyMode ? '••••' : `${amount.toLocaleString()} ETB`}
                        <span className="text-xs text-gray-400 font-normal ml-1">
                            • {new Date(nextPaymentDate).toLocaleDateString()}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                {!isComplete && (
                    <button
                        onClick={onPay}
                        disabled={isComplete}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    >
                        Pay {isPrivacyMode ? '••••' : amount.toLocaleString()}
                    </button>
                )}
                {!hasWon && isComplete && onClaimWin && (
                    <button
                        onClick={onClaimWin}
                        className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-1"
                    >
                        <Icons.Trophy size={14} />
                        I Won!
                    </button>
                )}
            </div>
        </div>
    )
}

interface IddirCardProps {
    name: string
    monthlyContribution: number
    paymentDate: number
    lastPaidDate?: string
    isPrivacyMode?: boolean
    onPay?: () => void
}

export const IddirCard: React.FC<IddirCardProps> = ({
    name,
    monthlyContribution,
    paymentDate,
    lastPaidDate,
    isPrivacyMode,
    onPay
}) => {
    const isPaidThisMonth = lastPaidDate && new Date(lastPaidDate).getMonth() === new Date().getMonth()

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <Icons.Heart size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Due: Day {paymentDate}
                    </p>
                </div>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-xl ${isPaidThisMonth ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-gray-50 dark:bg-white/5'}`}>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Monthly</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                        {isPrivacyMode ? '••••' : monthlyContribution.toLocaleString()}
                        <span className="text-sm font-bold text-gray-400 ml-1">ETB</span>
                    </p>
                </div>
                {isPaidThisMonth ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Icons.Check size={20} />
                    </div>
                ) : (
                    <button
                        onClick={onPay}
                        className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all"
                    >
                        Pay Now
                    </button>
                )}
            </div>
        </div>
    )
}
