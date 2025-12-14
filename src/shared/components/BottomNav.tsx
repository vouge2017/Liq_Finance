import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';

export const BottomNav: React.FC = () => {
    const { activeTab, setActiveTab, openTransactionModal } = useAppContext();

    // Updated Order: Home, Budget, FAB, Goals, Advisor

    return (
        <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 pt-2 px-6 pb-4 z-50 transition-colors duration-300" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <div className="flex justify-between items-end">

                {/* Left Side */}
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <Icons.Dashboard
                        size={24}
                        className={`${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-theme-secondary'} transition-colors duration-200`}
                    />
                    <span className={`text-[10px] font-medium ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-theme-secondary'}`}>Home</span>
                </button>

                {/* Budget Tab (Replaces Accounts) */}
                <button
                    onClick={() => setActiveTab('budget')}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <Icons.Budget
                        size={24}
                        className={`${activeTab === 'budget' ? 'text-cyan-400' : 'text-theme-secondary'} transition-colors duration-200`}
                    />
                    <span className={`text-[10px] font-medium ${activeTab === 'budget' ? 'text-cyan-400' : 'text-theme-secondary'}`}>Budget</span>
                </button>

                {/* FAB (Center) */}
                <div className="relative -top-5">
                    <button
                        onClick={() => openTransactionModal()}
                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
                    >
                        <Icons.Plus size={32} strokeWidth={3} />
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping pointer-events-none group-hover:opacity-40"></div>
                    </button>
                </div>

                {/* Right Side */}
                <button
                    onClick={() => setActiveTab('goals')}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <Icons.Goals
                        size={24}
                        className={`${activeTab === 'goals' ? 'text-cyan-400' : 'text-theme-secondary'} transition-colors duration-200`}
                    />
                    <span className={`text-[10px] font-medium ${activeTab === 'goals' ? 'text-cyan-400' : 'text-theme-secondary'}`}>Goals</span>
                </button>

                <button
                    onClick={() => setActiveTab('ai')}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <Icons.AI
                        size={24}
                        className={`${activeTab === 'ai' ? 'text-cyan-400' : 'text-theme-secondary'} transition-colors duration-200`}
                    />
                    <span className={`text-[10px] font-medium ${activeTab === 'ai' ? 'text-cyan-400' : 'text-theme-secondary'}`}>Advisor</span>
                </button>

            </div>
        </div>
    );
};
