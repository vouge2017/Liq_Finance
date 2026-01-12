"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { PreferencesSection } from '@/features/settings/components/PreferencesSection'
import { SecuritySettings } from '@/features/settings/components/SecuritySettings'
import { FamilyManagementSection } from './components/FamilyManagementSection'
import { IqubSection } from './components/IqubSection'
import { IddirSection } from './components/IddirSection'
import { AccountsSection } from './components/AccountsSection'
import { EditProfileModal } from './components/EditProfileModal'

interface ProfilePageProps {
    onClose: () => void
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
    const { state, logout, activeProfile, setActiveProfile } = useAppContext()
    
    const [showPreferences, setShowPreferences] = useState(false)
    const [showSecurity, setShowSecurity] = useState(false)
    const [showEditProfile, setShowEditProfile] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const handleLogout = () => {
        logout()
        setShowLogoutConfirm(false)
        onClose()
    }

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-[#f6f6f8] dark:bg-[#101622] animate-fade-in">
                <div className="flex items-center gap-4 px-5 pt-6 pb-4 border-b border-gray-100 dark:border-white/10">
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center active:scale-95 transition-all"
                    >
                        <Icons.ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h2>
                </div>

                <div className="px-5 py-6 space-y-8 overflow-y-auto h-[calc(100vh-120px)] no-scrollbar pb-32">
                    
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full w-24 h-24 border-4 border-white dark:border-white/10 shadow-lg mx-auto"
                                style={{ backgroundImage: `url("${activeProfile === "Personal" ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Family"}")` }}
                            />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-background-dark animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{state.userName || 'User'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{state.userPhone || 'No phone set'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                            {[
                                { id: 'Personal', name: 'Personal', icon: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
                                { id: 'Family', name: 'Family', icon: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Family' }
                            ].map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => setActiveProfile(profile.id as any)}
                                    className={`p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                                        activeProfile === profile.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-100 dark:border-white/10 hover:border-primary/30'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-center bg-no-repeat bg-cover mx-auto mb-2" style={{ backgroundImage: `url("${profile.icon}")` }} />
                                    <p className="font-bold text-xs text-gray-900 dark:text-white">{profile.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="w-full py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center gap-3 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <Icons.Edit size={18} />
                        Edit Profile
                    </button>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Accounts</h3>
                        <AccountsSection />
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Family & Community</h3>
                        <FamilyManagementSection />
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                            <span className="text-lg">🔄</span> Iqub
                        </h3>
                        <IqubSection />
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                            <span className="text-lg">❤️</span> Iddir
                        </h3>
                        <IddirSection />
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Settings</h3>
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                            <button 
                                onClick={() => setShowPreferences(true)}
                                className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Icons.Settings size={20} className="text-primary" />
                                    </div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Preferences</span>
                                </div>
                                <Icons.ChevronRight size={18} className="text-gray-400" />
                            </button>
                            <button 
                                onClick={() => setShowSecurity(true)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Icons.Shield size={20} className="text-emerald-500" />
                                    </div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Security</span>
                                </div>
                                <Icons.ChevronRight size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">App Info</h3>
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Icons.Info size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-gray-200">Version</p>
                                        <p className="text-xs text-gray-500">1.0.0</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Icons.Star size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-gray-200">Rate App</p>
                                        <p className="text-xs text-gray-500">Share your feedback</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Icons.HelpCircle size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-gray-200">Help Center</p>
                                        <p className="text-xs text-gray-500">FAQs & Support</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </section>

                    <section className="pt-4">
                        <button 
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-bold border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all"
                        >
                            Sign Out
                        </button>
                    </section>
                </div>
            </div>

            {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
            {showPreferences && <PreferencesSection />}
            {showSecurity && <SecuritySettings />}

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="bg-white dark:bg-[#101622] w-full max-w-sm rounded-[2.5rem] p-8 animate-dialog text-center shadow-2xl relative border border-black/[0.05]" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <Icons.Alert size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign Out?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This will reset your session and clear all local data on this device.</p>
                        <div className="space-y-3">
                            <button 
                                onClick={handleLogout}
                                className="w-full py-4 bg-rose-500 rounded-2xl text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                            >
                                Confirm Reset
                            </button>
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="w-full py-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 font-bold active:scale-95 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
