"use client"

import React, { useState, useEffect } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

interface EditProfileModalProps {
    onClose: () => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
    const { state, setUserName, setUserPhone, activeProfile } = useAppContext()

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        setName(state.userName || '')
        setPhone(state.userPhone || '')
        setAvatarUrl(activeProfile === 'Personal' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Family')
    }, [state, activeProfile])

    const handleSave = () => {
        if (name.trim()) {
            setUserName(name)
        }
        if (phone.trim()) {
            setUserPhone(phone)
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border border-white/20 dark:border-white/5" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Edit Profile</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                        <Icons.Close size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div 
                            className="bg-center bg-no-repeat bg-cover rounded-full w-24 h-24 border-4 border-white dark:border-white/10 shadow-lg"
                            style={{ backgroundImage: `url("${avatarUrl}")` }}
                        />
                        <button className="text-xs text-primary font-bold hover:underline">
                            Change Avatar
                        </button>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 block">Phone Number</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+251</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 9)
                                    setPhone(val)
                                }}
                                placeholder="911 123 456"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl pl-16 pr-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
