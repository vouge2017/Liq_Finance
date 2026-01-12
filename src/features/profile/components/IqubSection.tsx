"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { IqubModal } from './IqubModal'
import type { Iqub } from '@/types'

export const IqubSection: React.FC = () => {
    const { state, isPrivacyMode, addIqub, updateIqub, deleteIqub, markIqubPaid, markIqubWon } = useAppContext()
    const { iqubs, accounts } = state

    const [showAddModal, setShowAddModal] = useState<Iqub | null>(null)
    const [showPayModal, setShowPayModal] = useState<Iqub | null>(null)
    const [payAccount, setPayAccount] = useState('')

    const handlePayIqub = () => {
        if (showPayModal && payAccount) {
            markIqubPaid(showPayModal.id, payAccount)
            setShowPayModal(null)
            setPayAccount('')
        }
    }

    const handleClaimWin = (iqub: Iqub) => {
        const accountId = accounts[0]?.id
        if (accountId) {
            const roundNum = iqub.paidRounds
            markIqubWon(iqub.id, accountId, roundNum)
        }
    }

    return (
        <>
            <div className="space-y-3">
                {iqubs.length > 0 ? (
                    iqubs.map(iqub => (
                        <div 
                            key={iqub.id} 
                            className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-5 rounded-[2.5rem] shadow-sm active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-xl mb-1">{iqub.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                        {iqub.cycle} Cycle • {iqub.members} Members
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowAddModal(iqub)}
                                    className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"
                                >
                                    <Icons.Edit size={18} />
                                </button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
                                {Array.from({ length: iqub.members }).map((_, idx) => {
                                    const roundNum = idx + 1
                                    const isPaid = roundNum <= iqub.paidRounds
                                    const isWinRound = iqub.winningRound === roundNum
                                    const isCurrent = roundNum === iqub.paidRounds + 1

                                    return (
                                        <div
                                            key={idx}
                                            className={`w-10 h-14 rounded-xl shrink-0 flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${
                                                isWinRound ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/30 scale-110 z-10' :
                                                isPaid ? 'bg-emerald-500 border-emerald-400 text-white' :
                                                isCurrent ? 'bg-white dark:bg-white/10 border-indigo-500 text-indigo-500 ring-2 ring-indigo-500/20' :
                                                'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-300'
                                            }`}
                                        >
                                            <span className="mb-1">R{roundNum}</span>
                                            {isWinRound ? <Icons.Trophy size={12} /> : isPaid ? <Icons.Check size={12} /> : <div className="w-2 h-2 rounded-full bg-current opacity-20" />}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowPayModal(iqub); setPayAccount(accounts[0]?.id || '') }}
                                    disabled={iqub.paidRounds >= iqub.members}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-[1.5rem] transition-all disabled:opacity-50 text-xs uppercase tracking-wider active:scale-95"
                                >
                                    Pay {isPrivacyMode ? '••••' : iqub.amount}
                                </button>

                                {!iqub.hasWon && (
                                    <button
                                        onClick={() => handleClaimWin(iqub)}
                                        className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-[1.5rem] shadow-lg shadow-yellow-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                    >
                                        <Icons.Trophy size={14} /> I Won!
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-8 text-center">
                        <Icons.Users size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No Iqubs yet</p>
                    </div>
                )}
            </div>

            <button 
                onClick={() => setShowAddModal(null)}
                className="w-full py-4 bg-indigo-500/10 text-indigo-500 rounded-2xl font-bold border border-indigo-500/20 hover:bg-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Icons.Plus size={18} />
                Add Iqub
            </button>

            {showAddModal && (
                <IqubModal 
                    iqub={showAddModal}
                    onClose={() => setShowAddModal(null)}
                    onSave={(data) => {
                        if (showAddModal?.id) {
                            updateIqub(data)
                        } else {
                            addIqub(data)
                        }
                        setShowAddModal(null)
                    }}
                    onDelete={(id) => {
                        deleteIqub(id)
                        setShowAddModal(null)
                    }}
                />
            )}

            {showPayModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayModal(null)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-6 animate-dialog shadow-2xl relative border border-black/[0.05]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pay Iqub Contribution</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {showPayModal.title} - {isPrivacyMode ? '••••' : showPayModal.amount.toLocaleString()} ETB
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1 block">From Account</label>
                                <select
                                    value={payAccount}
                                    onChange={(e) => setPayAccount(e.target.value)}
                                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white font-bold appearance-none"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} - {acc.balance.toLocaleString()} ETB</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={handlePayIqub}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
