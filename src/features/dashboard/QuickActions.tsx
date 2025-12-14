import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { ArrowLeftRight, Receipt, Wallet, MoreHorizontal } from 'lucide-react';

export const QuickActions: React.FC = () => {
    const { openTransactionModal, setActiveTab } = useAppContext();

    const actions = [
        {
            label: 'Transfer',
            icon: ArrowLeftRight,
            color: 'bg-lime-400',
            textColor: 'text-lime-950',
            onClick: () => openTransactionModal({ type: 'transfer' })
        },
        {
            label: 'Pay Bill',
            icon: Receipt,
            color: 'bg-cyan-400',
            textColor: 'text-cyan-950',
            onClick: () => openTransactionModal({ category: 'Bills', type: 'expense' })
        },
        {
            label: 'Deposit',
            icon: Wallet,
            color: 'bg-pink-500',
            textColor: 'text-white',
            onClick: () => openTransactionModal({ type: 'income' })
        },
        {
            label: 'More',
            icon: MoreHorizontal,
            color: 'bg-gray-200',
            textColor: 'text-gray-700',
            onClick: () => setActiveTab('accounts') // Or open a "More" modal
        }
    ];

    return (
        <div className="mb-8">
            <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${action.color} ${action.textColor} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-105 transition-transform duration-200`}>
                            <action.icon size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-medium text-theme-secondary group-hover:text-theme-primary transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
