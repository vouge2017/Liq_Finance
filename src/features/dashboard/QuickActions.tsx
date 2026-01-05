import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useHaptic } from '@/hooks/useHaptic';

interface QuickActionsProps {
    onOpenSubscription: () => void;
    onOpenFinancialProfile: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenSubscription, onOpenFinancialProfile }) => {
    const { openTransactionModal, setActiveTab } = useAppContext();
    const { triggerHaptic } = useHaptic();

    const actions = [
        {
            id: 'accounts',
            label: 'Accounts',
            icon: Icons.Bank,
            gradient: 'from-[#2563eb] to-[#06b6d4]',
            shadow: 'shadow-blue-500/20 hover:shadow-blue-500/40',
            onClick: () => setActiveTab('accounts')
        },
        {
            id: 'bills',
            label: 'Bills',
            icon: Icons.FileText,
            gradient: 'from-[#f97316] to-[#fbbf24]',
            shadow: 'shadow-orange-500/20 hover:shadow-orange-500/40',
            onClick: onOpenSubscription
        },
        {
            id: 'community',
            label: 'Community',
            icon: Icons.Users,
            gradient: 'from-[#9333ea] to-[#e879f9]',
            shadow: 'shadow-purple-500/20 hover:shadow-purple-500/40',
            onClick: () => setActiveTab('community')
        },
        {
            id: 'transfer',
            label: 'Transfer',
            icon: Icons.Transfer,
            gradient: 'from-[#10b981] to-[#34d399]',
            shadow: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
            onClick: () => openTransactionModal({ type: 'transfer' } as any)
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 my-8">
            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={() => {
                        triggerHaptic('light');
                        action.onClick();
                    }}
                    className="flex flex-col items-center gap-2 group w-full"
                >
                    <div className={`w-16 h-16 rounded-[1.3rem] bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} flex items-center justify-center text-white group-active:scale-95 transition-all duration-300 relative overflow-hidden ring-1 ring-white/20 dark:ring-white/10`}>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* Ambient glow */}
                        <div className="absolute -top-10 -right-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                        <action.icon className="w-7 h-7 drop-shadow-md" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-tight">{action.label}</span>
                </button>
            ))}
        </div>
    );
};
