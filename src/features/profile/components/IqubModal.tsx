"use client"

import React, { useState, useEffect } from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Iqub } from '@/types'

interface IqubModalProps {
    iqub: Iqub | null
    onClose: () => void
    onSave: (iqub: Iqub) => void
    onDelete?: (id: string) => void
}

export const IqubModal: React.FC<IqubModalProps> = ({ iqub, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('')
    const [purpose, setPurpose] = useState('')
    const [amount, setAmount] = useState('')
    const [members, setMembers] = useState('')
    const [startDate, setStartDate] = useState('')
    const [freq, setFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
    const [errors, setErrors] = useState({ title: false, amount: false, members: false })

    useEffect(() => {
        if (iqub) {
            setTitle(iqub.title)
            setPurpose(iqub.purpose)
            setAmount(iqub.amount.toLocaleString())
            setMembers(iqub.members.toString())
            setStartDate(iqub.startDate ? iqub.startDate.split('T')[0] : new Date().toISOString().split('T')[0])
            setFreq(iqub.cycle)
        }
    }, [iqub])

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''))

    const handleSave = () => {
        const hasTitle = !!title.trim()
        const hasAmount = !!amount && getRawNumber(amount) > 0
        const hasMembers = !!members && parseInt(members) > 0

        if (!hasTitle || !hasAmount || !hasMembers) {
            setErrors({ title: !hasTitle, amount: !hasAmount, members: !hasMembers })
            return
        }

        const iqubData: Iqub = {
            id: iqub?.id || Date.now().toString(),
            title,
            purpose,
            amount: getRawNumber(amount),
            cycle: freq,
            members: parseInt(members),
            currentRound: iqub?.currentRound || 1,
            paidRounds: iqub?.paidRounds || 0,
            startDate,
            payoutAmount: getRawNumber(amount) * parseInt(members),
            status: iqub?.status || 'active',
            nextPaymentDate: startDate,
            hasWon: iqub?.hasWon || false,
            profile: 'Personal'
        }

        onSave(iqubData)
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        {iqub ? 'Edit Iqub' : 'New Iqub'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Iqub Name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Family Iqub, Office Iqub"
                            className={`w-full bg-gray-50 dark:bg-white/5 border ${errors.title ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Purpose (Optional)</label>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="What is this Iqub for?"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Round Amount</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, '')
                                        if (/^\d*$/.test(val)) setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','))
                                    }}
                                    placeholder="0"
                                    className={`w-full bg-gray-50 dark:bg-white/5 border ${errors.amount ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all pr-12`}
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ETB</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Members</label>
                            <input
                                type="number"
                                value={members}
                                onChange={(e) => setMembers(e.target.value)}
                                placeholder="e.g. 12"
                                className={`w-full bg-gray-50 dark:bg-white/5 border ${errors.members ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Frequency</label>
                            <select
                                value={freq}
                                onChange={(e) => setFreq(e.target.value as any)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none appearance-none"
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {iqub ? 'Update Iqub' : 'Create Iqub'}
                    </button>

                    {iqub && onDelete && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this Iqub?')) {
                                    onDelete(iqub.id)
                                }
                            }}
                            className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-bold hover:bg-rose-500/20 active:scale-95 transition-all"
                        >
                            Delete Iqub
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
