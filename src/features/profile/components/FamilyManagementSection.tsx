"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

export const FamilyManagementSection: React.FC = () => {
    const { state } = useAppContext()
    const { familyMembers, invitations } = state
    const [showInviteModal, setShowInviteModal] = useState(false)

    const displayMembers = familyMembers.length > 0 ? familyMembers : []
    const displayInvites = invitations.length > 0 ? invitations : []

    return (
        <div className="space-y-4">
            <section>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Household Members</span>
                    <span className="text-xs text-primary font-bold">{displayMembers.length} Active</span>
                </div>

                {displayMembers.length > 0 ? (
                    <div className="space-y-3">
                        {displayMembers.map(member => (
                            <div 
                                key={member.id} 
                                className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-4 rounded-[2rem] flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img 
                                            src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
                                            alt={member.name} 
                                            className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/10" 
                                        />
                                        {member.role === 'Admin' && (
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-[10px]">
                                                <Icons.Star size={10} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{member.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {member.role === 'Admin' ? 'Family Administrator' : member.role === 'Member' ? 'Contributor' : 'Viewer'}
                                        </p>
                                    </div>
                                </div>
                                <button className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors">
                                    <Icons.MoreVertical size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-6 text-center">
                        <Icons.Users size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No household members yet</p>
                    </div>
                )}
            </section>

            {displayInvites.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">Pending Invitations</h3>
                    <div className="space-y-3">
                        {displayInvites.map(invite => (
                            <div 
                                key={invite.id} 
                                className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-4 rounded-[2rem] flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                                        {invite.emailOrPhone?.substring(0, 2).toUpperCase() || 'INV'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{invite.emailOrPhone}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Sent {new Date(invite.sentDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => console.log('Cancel invite:', invite.id)}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <button 
                onClick={() => setShowInviteModal(true)}
                className="w-full py-4 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-[2rem] flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                    <Icons.UserPlus size={16} />
                </div>
                Invite Member
            </button>

            {showInviteModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-6 animate-dialog shadow-2xl relative border border-black/[0.05]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icons.UserPlus size={20} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invite Member</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">
                            Invite family members to join your household and manage finances together.
                        </p>
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white font-bold"
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        console.log('Send invite (UI-only)')
                                        setShowInviteModal(false)
                                    }}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
