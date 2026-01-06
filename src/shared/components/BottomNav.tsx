import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useHaptic } from '@/hooks/useHaptic';

export const BottomNav: React.FC = () => {
    const { activeTab, setActiveTab, openTransactionModal } = useAppContext();
    const { triggerHaptic } = useHaptic();

    const tabs = [
        { id: 'dashboard', label: 'Home', icon: Icons.Home },
        { id: 'budget', label: 'Budget', icon: Icons.PieChart }, // Changed to PieChart to match Stitch
        { id: 'goals', label: 'Goal', icon: Icons.Flag }, // Changed to Flag to match Stitch
        { id: 'ai', label: 'AI Advisor', icon: Icons.AI }, // Changed to Bot to match Stitch smart_toy
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center items-end pointer-events-none pb-[env(safe-area-inset-bottom)]">
            <div className="relative w-full max-w-sm px-6 flex justify-center pointer-events-auto">
                <nav className="h-16 w-full bg-surface-light dark:bg-surface-dark rounded-[2rem] shadow-elevation-3 border border-gray-200 dark:border-gray-700 flex items-center justify-around px-2 relative z-50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                triggerHaptic('light');
                                setActiveTab(tab.id as any);
                            }}
                            className={`flex flex-col items-center justify-center gap-1 w-14 group transition-colors ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-primary dark:hover:text-primary'
                                }`}
                        >
                            <tab.icon
                                size={26}
                                strokeWidth={activeTab === tab.id ? 2.5 : 2}
                                className="group-hover:scale-110 transition-transform"
                            />
                            <span className={`text-[9px] ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}

                    {/* FAB Integrated as 5th item */}
                    <button
                        onClick={() => {
                            triggerHaptic('heavy');
                            openTransactionModal();
                        }}
                        className="flex flex-col items-center justify-center gap-1 w-14 group -mt-1"
                    >
                        <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                            <Icons.Plus size={28} strokeWidth={2.5} />
                        </div>
                    </button>
                </nav>
            </div>
        </div>
    );
};
