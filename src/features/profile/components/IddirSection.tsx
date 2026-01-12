"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { IddirModal } from './IddirModal'
import type { Iddir } from '@/types'

export const IddirSection: React.FC = () => {
    const { state, isPrivacyMode, addIddir, updateIddir, deleteIddir, markIddirPaid } = useAppContext()
    const { iddirs, accounts } = state

    const [showAddModal, setShowAddModal] = useState<Iddir | null>(null)
    const [showPayModal, setShowPayModal] = useState<Iddir | null>(null)
    const [payAccount, setPayAccount] = useState('')

    const handlePayIddir = () => {
        if (showPayModal && payAccount) {
            markIddirPaid(showPayModal.id, payAccount)
            setShowPayModal(null)
            setPayAccount('')
        }
    }

    return (
        <>
            <div className="space-y-3">
                {iddirs.length > 0 ? (
                    iddirs.map(iddir => {
                        const isPaidThisMonth = iddir.lastPaidDate && new Date(iddir.lastPaidDate).getMonth() === new Date().getMonth()

                        return (
                            <div 
                                key={iddir.id} 
                                className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-5 rounded-[2.5rem] shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-rose-500">
                                        <Icons.Heart size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 dark:text-white text-xl">{iddir.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                            Monthly Due: Day {iddir.paymentDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end bg-gray-50 dark:bg-white/5 p-5 rounded-[2rem] mb-3">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Contribution</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                            {iddir.monthlyContribution.toLocaleString()} <span className="text-sm text-gray-400 font-bold">ETB</span>
                                        </p>
                                    </div>
                                    {isPaidThisMonth ? (
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <Icons.Check size={20} />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setShowPayModal(iddir); setPayAccount(accounts[0]?.id || '') }}
                                            className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                </div>

                                <button 
                                    onClick={() => setShowAddModal(iddir)}
                                    className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-2xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                >
                                    Edit Details
                                </button>
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-8 text-center">
                        <Icons.Heart size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No Iddirs yet</p>
                    </div>
                )}
            </div>

            <button 
                onClick={() => setShowAddModal(null)}
                className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-bold border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Icons.Plus size={18} />
                Add Iddir
            </button>

            {showAddModal && (
                <IddirModal 
                    iddir={showAddModal}
                    onClose={() => setShowAddModal(null)}
                    onSave={(data) => {
                        if (showAddModal?.id) {
                            updateIddir(data)
                        } else {
                            addIddir(data)
                        }
                        setShowAddModal(null)
                    }}
                    onDelete={(id) => {
                        deleteIddir(id)
                        setShowAddModal(null)
                    }}
                />
            )}

            {showPayModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayModal(null)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-6 animate-dialog shadow-2xl relative border border-black/[0.05]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pay Iddir Contribution</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {showPayModal.name} - {isPrivacyMode ? '••••' : showPayModal.monthlyContribution.toLocaleString()} ETB
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
                                onClick={handlePayIddir}
                                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
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
