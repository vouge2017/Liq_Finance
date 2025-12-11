import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { FamilyMember, Invitation } from '@/types';

export const CommunityPage: React.FC = () => {
    const { state, addFamilyMember, removeFamilyMember, sendInvitation } = useAppContext();
    const { familyMembers, invitations } = state;

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail.trim()) {
            sendInvitation(inviteEmail, inviteRole);
            setInviteEmail('');
            setIsInviteModalOpen(false);
        }
    };

    // Mock function to simulate a member joining (for demo purposes)
    const simulateJoin = (invite: Invitation) => {
        const newMember: FamilyMember = {
            id: Date.now().toString(),
            name: invite.emailOrPhone.split('@')[0] || 'New Member',
            role: invite.role,
            email: invite.emailOrPhone,
            status: 'Active',
            joinedDate: new Date().toISOString(),
            avatar: `https://ui-avatars.com/api/?name=${invite.emailOrPhone}&background=random`
        };
        addFamilyMember(newMember);
    };

    return (
        <div className="p-4 space-y-6 pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Family & Community</h1>
                    <p className="text-gray-400 text-sm">Manage your household finances together</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                >
                    <Icons.Plus size={18} />
                    <span>Invite</span>
                </button>
            </div>

            {/* Family Members List */}
            <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Icons.Users size={20} className="text-purple-400" />
                    Family Members
                </h2>

                {familyMembers.length === 0 ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icons.Users size={32} className="text-gray-600" />
                        </div>
                        <p className="text-gray-300 font-medium mb-1">No family members yet</p>
                        <p className="text-gray-500 text-sm mb-4">Invite your spouse or family to track expenses together.</p>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="text-cyan-400 text-sm font-bold hover:underline"
                        >
                            Invite someone now
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {familyMembers.map(member => (
                            <div key={member.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="text-white font-bold">{member.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">{member.role}</span>
                                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                            <span className={`text-xs ${member.status === 'Active' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                {member.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFamilyMember(member.id)}
                                    className="text-gray-500 hover:text-rose-400 p-2 transition-colors"
                                >
                                    <Icons.Delete size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Icons.Mail size={20} className="text-yellow-400" />
                        Pending Invitations
                    </h2>
                    <div className="grid gap-3">
                        {invitations.map(invite => (
                            <div key={invite.id} className="bg-gray-900/50 border border-gray-800 border-dashed p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold">
                                        {invite.emailOrPhone.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-gray-300 font-medium">{invite.emailOrPhone}</p>
                                        <p className="text-xs text-gray-500">Invited as {invite.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => simulateJoin(invite)}
                                    className="text-xs bg-gray-800 hover:bg-gray-700 text-cyan-400 px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                                >
                                    Simulate Join
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Invite Member</h3>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="text-gray-500 hover:text-white"
                            >
                                <Icons.Close size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email or Phone</label>
                                <input
                                    type="text"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="e.g. spouse@example.com"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Admin', 'Member', 'Viewer'] as const).map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setInviteRole(role)}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold border transition-all ${inviteRole === role
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">
                                    {inviteRole === 'Admin' && "Can manage all accounts and settings."}
                                    {inviteRole === 'Member' && "Can add transactions and view shared accounts."}
                                    {inviteRole === 'Viewer' && "Read-only access to shared accounts."}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!inviteEmail.trim()}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl mt-4 transition-colors"
                            >
                                Send Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};
