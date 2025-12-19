import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useHaptic } from '@/hooks/useHaptic';

export const BottomNav: React.FC = () => {
    const { activeTab, setActiveTab, openTransactionModal } = useAppContext();
    const { triggerHaptic } = useHaptic();

    // Updated Order: Home, Budget, FAB, Goals, Advisor

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-theme-main/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 z-50 transition-colors duration-300" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <div className="flex justify-between items-center">

                {/* Left Side */}
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            <Icons.Dashboard size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-gray-500'}`}>Home</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('budget')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-2 rounded-xl transition-all ${activeTab === 'budget' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            <Icons.Budget size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'budget' ? 'text-cyan-400' : 'text-gray-500'}`}>Budget</span>
                    </button>
                </div>

                {/* FAB (Center) */}
                <div className="relative -top-8">
                    <button
                        onMouseDown={() => {
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
                            e.preventDefault();
                        }}
                        className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] border-4 border-theme-main active:scale-90 transition-transform group relative overflow-hidden"
                    >
                        <Icons.Plus size={32} className="text-white relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>

                {/* Right Side */}
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('goals')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-2 rounded-xl transition-all ${activeTab === 'goals' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            <Icons.Goals size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'goals' ? 'text-cyan-400' : 'text-gray-500'}`}>Goals</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('ai')}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-2 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            <Icons.AI size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'ai' ? 'text-cyan-400' : 'text-gray-500'}`}>Advisor</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
