"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import type { UserProfile } from '@/types'

interface ProfileSectionProps {
    onClose?: () => void
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ onClose }) => {
    const { state, activeProfile, setActiveProfile } = useAppContext()

    const profiles: Array<{ id: UserProfile; name: string; icon: string }> = [
        { id: 'Personal', name: 'Personal', icon: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
        { id: 'Family', name: 'Family', icon: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Family' },
    ]

    return (
        <div className="fixed inset-0 z-[60] bg-[#f6f6f8] dark:bg-[#101622] animate-fade-in">
            {onClose && (
                <div className="flex items-center gap-4 px-5 pt-6 pb-4 border-b border-gray-100 dark:border-white/10">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center">
                        <Icons.ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h2>
                </div>
            )}

            <div className="px-5 py-6 space-y-6">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-400 p-1 mx-auto mb-4">
                        <div className="w-full h-full rounded-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${activeProfile === 'Personal' ? profiles[0].icon : profiles[1].icon}")` }} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{state.userName || 'User'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{state.userPhone || 'No phone set'}</p>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 block">Active Profile</label>
                    <div className="grid grid-cols-2 gap-3">
                        {profiles.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => setActiveProfile(profile.id)}
                                className={`p-4 rounded-2xl border-2 transition-all ${
                                    activeProfile === profile.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-100 dark:border-white/10 hover:border-primary/30'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-center bg-no-repeat bg-cover mx-auto mb-2" style={{ backgroundImage: `url("${profile.icon}")` }} />
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{profile.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <Icons.Edit size={18} className="text-gray-400" />
                            <span className="font-bold text-gray-700 dark:text-gray-200">Edit Profile</span>
                        </div>
                        <Icons.ChevronRight size={18} className="text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Icons.Bell size={18} className="text-gray-400" />
                            <span className="font-bold text-gray-700 dark:text-gray-200">Notifications</span>
                        </div>
                        <Icons.ChevronRight size={18} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    )
}
