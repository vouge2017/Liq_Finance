import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useHaptic } from '@/hooks/useHaptic';

export const BottomNav: React.FC = () => {
    const { activeTab, setActiveTab, openTransactionModal } = useAppContext();
    const { triggerHaptic } = useHaptic();

    const tabs = [
        { id: 'dashboard', label: 'Home', icon: Icons.Home },
        { id: 'accounts', label: 'Account', icon: Icons.Wallet },
        { id: 'budget', label: 'Budget', icon: Icons.PieChart },
        { id: 'goals', label: 'Goals', icon: Icons.Flag },
        { id: 'ai', label: 'AI Adv', icon: Icons.AI },
    ];

    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 rounded-full p-2 flex justify-around items-center h-14 z-50">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => {
                        triggerHaptic('light');
                        setActiveTab(tab.id as any);
                    }}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors ${activeTab === tab.id
                        ? 'text-[#a14c3e]'
                        : 'text-gray-400 dark:text-gray-500 hover:text-[#a14c3e]'
                        }`}
                >
                    <tab.icon
                        size={20}
                        strokeWidth={activeTab === tab.id ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
            ))}

            <button
                onClick={() => {
                    triggerHaptic('heavy');
                    openTransactionModal();
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#a14c3e] text-white shadow-md -mt-1 hover:brightness-110 active:scale-95 transition-all"
            >
                <Icons.Plus size={24} />
            </button>
        </nav>
    );
};