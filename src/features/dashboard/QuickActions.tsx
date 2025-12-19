import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { ArrowLeftRight, Receipt, Wallet, MoreHorizontal } from 'lucide-react';

interface QuickActionsProps {
    onOpenSubscription: () => void;
    onOpenFinancialProfile: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenSubscription, onOpenFinancialProfile }) => {
    const { openTransactionModal, setActiveTab } = useAppContext();

    const actions = [
        {
            label: 'Transfer',
            icon: ArrowLeftRight,
            gradient: 'from-emerald-300 to-teal-400',
            shadowColor: 'shadow-emerald-500/25',
            textColor: 'text-emerald-900',
            onClick: () => openTransactionModal({ type: 'transfer' } as any)
        },
        {
            label: 'Subscription',
            icon: Receipt,
            gradient: 'from-cyan-300 to-sky-400',
            shadowColor: 'shadow-cyan-500/25',
            textColor: 'text-cyan-900',
            onClick: onOpenSubscription
        },
        {
            label: 'Income',
            icon: Icons.Coins,
            gradient: 'from-pink-300 to-rose-400',
            shadowColor: 'shadow-pink-500/25',
            textColor: 'text-rose-900',
            onClick: onOpenFinancialProfile
        },
        {
            label: 'Accounts',
            icon: Icons.CreditCard,
            gradient: 'from-indigo-300 to-purple-400',
            shadowColor: 'shadow-indigo-500/25',
            textColor: 'text-indigo-900',
            onClick: () => setActiveTab('accounts')
        }
    ];

    return (
        <div className="mb-8">
            <h3 className="flex items-center gap-2 text-xs font-bold text-theme-secondary uppercase tracking-wider mb-4 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className="flex flex-col items-center gap-2.5 group"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} ${action.textColor} flex items-center justify-center shadow-lg ${action.shadowColor} group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300 ease-out`}>
                            <action.icon size={24} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-semibold text-theme-secondary group-hover:text-theme-primary transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
