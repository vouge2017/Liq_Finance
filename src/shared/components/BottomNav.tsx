import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useHaptic } from '@/hooks/useHaptic';

export const BottomNav: React.FC = () => {
    const { activeTab, setActiveTab, openTransactionModal } = useAppContext();
    const { triggerHaptic } = useHaptic();

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
                        onMouseDown={() => {
                            // Start Long Press Timer
                            const timer = setTimeout(() => {
                                triggerHaptic('heavy');
                                openTransactionModal(undefined, undefined, { voice: true });
                            }, 600);
                            (window as any).longPressTimer = timer;
                        }}
                        onMouseUp={() => {
                            if ((window as any).longPressTimer) {
                                clearTimeout((window as any).longPressTimer);
                                (window as any).longPressTimer = null;
                            }
                        }}
                        onClick={(e) => {
                            // If long press triggered, don't open normal modal
                            // But here we rely on the fact that openTransactionModal is called in timeout
                            // We need to prevent default if long press happened? 
                            // Actually, simpler: just use onClick for tap, and separate for long press.
                            // But standard onClick fires after mouseUp.
                            // Let's keep it simple: Tap = Normal, Long Press = Voice.
                            // If long press fires, we should prevent onClick.

                            // For now, let's just use a simple approach:
                            // If timer cleared before execution -> Tap.
                            // If timer executed -> Long Press.
                        }}
                        // Mobile Touch Events
                        onTouchStart={() => {
                            const timer = setTimeout(() => {
                                triggerHaptic('heavy');
                                openTransactionModal(undefined, undefined, { voice: true });
                                (window as any).longPressTriggered = true;
                            }, 600);
                            (window as any).longPressTimer = timer;
                            (window as any).longPressTriggered = false;
                        }}
                        onTouchEnd={(e) => {
                            if ((window as any).longPressTimer) {
                                clearTimeout((window as any).longPressTimer);
                            }
                            if (!(window as any).longPressTriggered) {
                                openTransactionModal();
                            }
                            e.preventDefault(); // Prevent ghost click
                        }}
                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group fab-glow"
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
                    onClick={() => setActiveTab('accounts')}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                    <Icons.Wallet
                        size={24}
                        className={`${activeTab === 'accounts' ? 'text-cyan-400' : 'text-theme-secondary'} transition-colors duration-200`}
                    />
                    <span className={`text-[10px] font-medium ${activeTab === 'accounts' ? 'text-cyan-400' : 'text-theme-secondary'}`}>Accounts</span>
                </button>

            </div>
        </div>
    );
};
