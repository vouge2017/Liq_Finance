import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';

export const ActionableInsights: React.FC = () => {
    const { state, openTransactionModal, setActiveTab } = useAppContext();
    const { savingsGoals } = state;

    // Mock upcoming bills (in a real app, this would come from recurring transactions)
    const upcomingBills = [
        { name: 'Ethio Telecom', amount: 450, days: 2, icon: Icons.Wifi },
        { name: 'Rent', amount: 8500, days: 5, icon: Icons.Home },
    ];

    // Find a goal that is close to completion or needs attention
    const activeGoal = savingsGoals.find(g => g.currentAmount < g.targetAmount);
    const goalProgress = activeGoal ? (activeGoal.currentAmount / activeGoal.targetAmount) * 100 : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Upcoming Bills Card */}
            <div className="bg-theme-card border border-theme rounded-2xl p-4 shadow-sm hover:border-cyan-500/30 transition-colors">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-theme-primary flex items-center gap-2">
                        <Icons.Calendar size={16} className="text-rose-500" />
                        Due Soon
                    </h3>
                    <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">2 Bills</span>
                </div>

                <div className="space-y-3">
                    {upcomingBills.map((bill, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-theme-bg flex items-center justify-center text-theme-secondary">
                                    <bill.icon size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-theme-primary">{bill.name}</p>
                                    <p className="text-[10px] text-theme-secondary">Due in {bill.days} days</p>
                                </div>
                            </div>
                            <button
                                onClick={() => openTransactionModal(undefined, { category: 'Bills', amount: bill.amount, title: bill.name, type: 'expense' })}
                                className="text-xs font-bold text-cyan-500 hover:text-cyan-400"
                            >
                                Pay
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Goal Nudge Card */}
            {activeGoal ? (
                <div className="bg-theme-card border border-theme rounded-2xl p-4 shadow-sm hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-theme-primary flex items-center gap-2">
                            <Icons.Goals size={16} className="text-emerald-500" />
                            Smart Nudge
                        </h3>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                            {Math.round(goalProgress)}%
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Icons.TrendingUp size={20} className="text-emerald-500" />
                        </div>
                        <p className="text-xs text-theme-secondary leading-relaxed">
                            You're close to your <span className="text-theme-primary font-bold">{activeGoal.title}</span> goal. Add <span className="text-emerald-500 font-bold">$500</span> today to stay on track?
                        </p>
                    </div>

                    <button
                        onClick={() => setActiveTab('goals')}
                        className="w-full py-2 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-colors"
                    >
                        Add Contribution
                    </button>
                </div>
            ) : (
                <div className="bg-theme-card border border-theme rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-theme-secondary mb-2">No active goals</p>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className="text-xs font-bold text-cyan-500"
                    >
                        Create a Goal
                    </button>
                </div>
            )}
        </div>
    );
};
