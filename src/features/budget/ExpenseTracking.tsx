import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { FinancialProfileModal } from '@/features/auth/FinancialProfileModal';

export const ExpenseTracking: React.FC = () => {
    const { state, isPrivacyMode, setActiveTab, navigateTo } = useAppContext();
    const { budgetCategories, incomeSources } = state;
    const [showSetupModal, setShowSetupModal] = useState(false);

    // Persistent Nudge Dismissal
    const [nudgeDismissed, setNudgeDismissed] = useState(true); // Default to true to prevent flash

    useEffect(() => {
        const saved = localStorage.getItem('finethio_nudge_dismissed');
        setNudgeDismissed(saved === 'true');
    }, []);

    const handleDismissNudge = () => {
        setNudgeDismissed(true);
        localStorage.setItem('finethio_nudge_dismissed', 'true');
    };

    // 1. Calculate Daily Safe To Spend
    const safeToSpend = useMemo(() => {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysRemaining = Math.max(1, lastDayOfMonth.getDate() - today.getDate());

        const variableCats = budgetCategories.filter(c => c.type === 'variable');
        const totalVariableLimit = variableCats.reduce((sum, c) => sum + c.allocated, 0);
        const totalVariableSpent = variableCats.reduce((sum, c) => sum + c.spent, 0);

        const remainingVariable = Math.max(0, totalVariableLimit - totalVariableSpent);

        return {
            daily: remainingVariable / daysRemaining,
            remaining: remainingVariable,
            daysRemaining
        };
    }, [budgetCategories]);

    // 2. Get Top 3 Expense Categories
    const topCategories = useMemo(() => {
        const variableCats = budgetCategories.filter(c => c.type === 'variable' && c.allocated > 0);
        // Sort by % spent (descending) or amount spent
        return variableCats
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 3);
    }, [budgetCategories]);

    return (
        <div className="mb-6 space-y-4">
            {showSetupModal && <FinancialProfileModal onClose={() => setShowSetupModal(false)} />}

            {/* Nudge: Income Profile Missing */}
            {incomeSources.length === 0 && !nudgeDismissed && (
                <div className="bg-theme-card p-4 rounded-3xl border border-theme relative animate-slide-down">
                    <button
                        onClick={handleDismissNudge}
                        className="absolute top-2 right-2 text-theme-secondary hover:text-theme-primary p-2"
                    >
                        <Icons.Close size={16} />
                    </button>
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                            <Icons.Briefcase size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-theme-primary text-sm">Unlock Smart Budgeting</h4>
                            <p className="text-xs text-theme-secondary mb-2">Add your income for better AI advice.</p>
                            <button
                                onClick={() => setShowSetupModal(true)}
                                className="text-xs font-bold text-cyan-400 hover:underline"
                            >
                                Setup Profile →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Widget 1: Safe To Spend Card */}
            <div
                className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-6 border border-teal-800/50 shadow-lg relative overflow-hidden group cursor-pointer transition-all active:scale-[0.99] card-hover"
                onClick={() => setActiveTab('budget')}
            >
                {/* Decorative Blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.Check className="text-teal-300" size={16} />
                            <span className="text-xs font-bold text-teal-100/70 uppercase tracking-wider">Safe to Spend</span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white tracking-tight">
                                {isPrivacyMode ? '••••' : Math.round(safeToSpend.daily).toLocaleString()}
                            </span>
                            <span className="text-sm font-medium text-teal-200/80">ETB / day</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] text-teal-200/60 block mb-1">
                            {safeToSpend.daysRemaining} days left
                        </span>
                        <button className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                            <Icons.ChevronRight className="text-teal-100" size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Widget 2: Top Expenses List (Simplified) */}
            <div className="bg-theme-card rounded-3xl p-5 border border-theme card-hover">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-theme-primary font-bold text-sm">Top Expenses</h3>
                    <button onClick={() => setActiveTab('budget')} className="text-xs text-cyan-400 font-medium">View Budget</button>
                </div>

                <div className="space-y-4">
                    {topCategories.length > 0 ? topCategories.map(cat => {
                        const percentage = Math.min((cat.spent / cat.allocated) * 100, 100);
                        return (
                            <div
                                key={cat.id}
                                onClick={() => navigateTo('budget', 'budget', cat.id)}
                                className="cursor-pointer group hover:bg-theme-main/30 p-2 rounded-xl transition-colors -mx-2"
                            >
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-theme-primary font-medium flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                                        <span className="group-hover:text-cyan-400 transition-colors">{cat.name}</span>
                                    </span>
                                    <span className="text-theme-secondary">
                                        {isPrivacyMode ? '•••' : Math.round(percentage)}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-theme-main rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${percentage > 90 ? 'bg-rose-500' : cat.color}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-xs text-theme-secondary italic text-center py-2">No variable expenses tracked yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
