import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { EmptyState } from '@/shared/components/EmptyState';
import { FamilyMember, Invitation } from '@/types';

export const CommunityPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        state,
        activeProfile,
        setActiveTab
    } = useAppContext();

    const { familyMembers, invitations } = state;
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Mock Data for Visualization if empty (remove in production)
    const mockMembers: FamilyMember[] = familyMembers.length > 0 ? familyMembers : [
        { id: '1', userId: 'u1', name: 'Abebe K.', role: 'Admin', joinedAt: '2023-01-01', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abebe' },
        { id: '2', userId: 'u2', name: 'Sara T.', role: 'Editor', joinedAt: '2023-02-15', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
        { id: '3', userId: 'u3', name: 'Kidist M.', role: 'Viewer', joinedAt: '2023-03-10', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kidist' },
    ];

    const mockInvites: Invitation[] = invitations.length > 0 ? invitations : [
        { id: 'i1', email: 'kebede@gmail.com', role: 'Viewer', invitedBy: 'u1', invitedAt: '2023-10-25', status: 'pending', token: 'abc' },
    ];

    const displayMembers = mockMembers;
    const displayInvites = mockInvites;

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            {/* Header */}
            <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-white/20 dark:border-white/5 active:scale-90 transition-all"
                >
                    <Icons.ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">My Community</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">የኔ ማህበረሰብ</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow active:scale-90 transition-all text-white"
                >
                    <Icons.UserPlus size={24} />
                </button>
            </header>

            <div className="px-5 space-y-8">
                {/* Hero / Shared Wallet Summary */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Shared Wallet</p>
                                <h2 className="text-3xl font-black">45,000 <span className="text-lg font-medium text-indigo-200">ETB</span></h2>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <Icons.Wallet size={24} />
                            </div>
                        </div>

                        {/* Fake Chart Bars */}
                        <div className="flex items-end gap-2 h-16 mb-4 opacity-80">
                            <div className="w-1/5 h-[40%] bg-white/30 rounded-t-lg"></div>
                            <div className="w-1/5 h-[60%] bg-white/40 rounded-t-lg"></div>
                            <div className="w-1/5 h-[30%] bg-white/30 rounded-t-lg"></div>
                            <div className="w-1/5 h-[80%] bg-white/50 rounded-t-lg"></div>
                            <div className="w-1/5 h-[100%] bg-white rounded-t-lg shadow-lg"></div>
                        </div>

                        <div className="flex justify-between text-xs font-medium text-indigo-100">
                            <span className="flex items-center gap-1 text-emerald-300"><Icons.TrendingUp size={12} /> +12.5% this month</span>
                            <span>Updated just now</span>
                        </div>
                    </div>
                </div>

                {/* Household Members */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Household Members</h3>
                        <button className="text-xs text-primary font-bold">View All</button>
                    </div>

                    <div className="space-y-4">
                        {displayMembers.map(member => (
                            <div key={member.id} className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-4 rounded-[2rem] flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/10" />
                                        {member.role === 'Admin' && (
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-[10px]">
                                                <Icons.Star size={10} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{member.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {member.role === 'Admin' ? 'Family Administrator' : member.role === 'Editor' ? 'Contributor' : 'Viewer'}
                                        </p>
                                    </div>
                                </div>
                                <button className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors">
                                    <Icons.MoreVertical size={20} />
                                </button>
                            </div>
                        ))}

                        {/* Add Member Button */}
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="w-full py-4 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-[2rem] flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                <Icons.Plus size={16} />
                            </div>
                            Add Member
                        </button>
                    </div>
                </section>

                {/* Pending Invitations */}
                {displayInvites.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">Pending Invitations</h3>
                        <div className="space-y-3">
                            {displayInvites.map(invite => (
                                <div key={invite.id} className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-4 rounded-[2rem] flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                                            {invite.email?.substring(0, 2).toUpperCase() || 'INV'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{invite.email || invite.phone}</h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Sent {new Date(invite.invitedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-500">Cancel</button>
                                        <button className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">Remind</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Invite Modal (Placeholder) */}
            {showInviteModal && (
                <div className="fixed inset-0 modal-overlay z-[110] flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-6 animate-dialog shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Invite Member</h3>
                        <p className="text-gray-500 text-sm mb-6">Send an invitation link to add a new member to your household.</p>
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-glow">Send Invite</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
