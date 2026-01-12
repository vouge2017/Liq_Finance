"use client"

import React, { useState, useEffect } from 'react'
import { Icons } from '@/shared/components/Icons'
import type { Iddir } from '@/types'

interface IddirModalProps {
    iddir: Iddir | null
    onClose: () => void
    onSave: (iddir: Iddir) => void
    onDelete?: (id: string) => void
}

export const IddirModal: React.FC<IddirModalProps> = ({ iddir, onClose, onSave, onDelete }) => {
    const [name, setName] = useState('')
    const [fee, setFee] = useState('')
    const [date, setDate] = useState('1')
    const [remind, setRemind] = useState(false)
    const [days, setDays] = useState('3')
    const [errors, setErrors] = useState({ name: false, fee: false })

    useEffect(() => {
        if (iddir) {
            setName(iddir.name)
            setFee(iddir.monthlyContribution.toLocaleString())
            setDate(iddir.paymentDate.toString())
            setRemind(iddir.reminderEnabled || false)
            setDays(iddir.reminderDaysBefore?.toString() || '3')
        }
    }, [iddir])

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''))

    const handleSave = () => {
        const hasName = !!name.trim()
        const hasFee = !!fee && getRawNumber(fee) > 0

        if (!hasName || !hasFee) {
            setErrors({ name: !hasName, fee: !hasFee })
            return
        }

        const iddirData: Iddir = {
            id: iddir?.id || Date.now().toString(),
            name,
            monthlyContribution: getRawNumber(fee),
            paymentDate: parseInt(date),
            status: iddir?.status || 'active',
            lastPaidDate: iddir?.lastPaidDate,
            profile: 'Personal',
            reminderEnabled: remind,
            reminderDaysBefore: parseInt(days)
        }

        onSave(iddirData)
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        {iddir ? 'Edit Iddir' : 'New Iddir'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Iddir Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Neighborhood Iddir"
                            className={`w-full bg-gray-50 dark:bg-white/5 border ${errors.name ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Monthly Fee</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={fee}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/,/g, '')
                                    if (/^\d*$/.test(val)) setFee(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','))
                                }}
                                placeholder="0"
                                className={`w-full bg-gray-50 dark:bg-white/5 border ${errors.fee ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all pr-12`}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ETB</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Payment Day (1-30)</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="p-5 bg-rose-500/5 rounded-[2rem] border border-rose-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                    <Icons.Bell size={20} className="text-rose-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">Payment Reminder</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified before due date</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRemind(!remind)}
                                className={`w-12 h-6 rounded-full transition-colors ${remind ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${remind ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {remind && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Remind (days before)</label>
                                <input
                                    type="number"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    min="1"
                                    max="7"
                                    className="w-full bg-white dark:bg-white/5 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-lg shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {iddir ? 'Update Iddir' : 'Create Iddir'}
                    </button>

                    {iddir && onDelete && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this Iddir?')) {
                                    onDelete(iddir.id)
                                }
                            }}
                            className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-bold hover:bg-rose-500/20 active:scale-95 transition-all"
                        >
                            Delete Iddir
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
