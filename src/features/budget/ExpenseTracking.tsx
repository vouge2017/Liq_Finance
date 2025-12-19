import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { FinancialProfileModal } from '@/features/auth/FinancialProfileModal';

const BUDGET_ICONS = [
    { id: 'Home', icon: Icons.Home },
    { id: 'Zap', icon: Icons.Zap },
    { id: 'Heart', icon: Icons.Heart },
    { id: 'Utensils', icon: Icons.Utensils },
    { id: 'Bus', icon: Icons.Bus },
    { id: 'Shopping', icon: Icons.Shopping },
    { id: 'Film', icon: Icons.Film },
    { id: 'Education', icon: Icons.Education },
    { id: 'Baby', icon: Icons.Baby },
    { id: 'Briefcase', icon: Icons.Briefcase },
    { id: 'Coins', icon: Icons.Coins },
    { id: 'Teff', icon: Icons.Teff },
    { id: 'Bajaji', icon: Icons.Bajaji },
    { id: 'Phone', icon: Icons.Phone },
    { id: 'Coffee', icon: Icons.Coffee },
    { id: 'Iddir', icon: Icons.Iddir },
];

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
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-purple-700 p-6 shadow-2xl shadow-blue-500/20 cursor-pointer transition-all active:scale-[0.99] group"
                onClick={() => setActiveTab('budget')}
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">✅ Safe to Spend</span>
                        </div>

                        <div className="text-right">
                            <span className="text-[10px] text-blue-100/60 font-bold uppercase tracking-widest">
                                {safeToSpend.daysRemaining} days left
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-4xl font-black text-white tracking-tight">
                                {isPrivacyMode ? '••••' : Math.round(safeToSpend.daily).toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-blue-100/70 uppercase tracking-widest">ETB / day</span>
                        </div>
                        <p className="text-[10px] text-blue-100/50 uppercase tracking-[0.2em] font-bold mt-1">Daily Limit</p>
                    </div>

                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/5 flex items-center justify-between group-hover:bg-black/30 transition-colors">
                        <p className="text-[10px] text-blue-50/90 leading-relaxed max-w-[80%]">
                            Try to spend under <span className="font-bold text-white">500 ETB</span> today to stay on track.
                        </p>
                        <Icons.ChevronRight className="text-white/50 group-hover:text-white transition-colors" size={18} />
                    </div>
                </div>
            </div>

            {/* Widget 2: Top Expenses List (Simplified) */}
            <div className="bg-theme-card rounded-[2rem] p-6 border border-theme shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-theme-primary font-bold text-sm uppercase tracking-widest opacity-70">Top Expenses</h3>
                    <button onClick={() => setActiveTab('budget')} className="text-xs text-cyan-400 font-bold hover:underline">View All</button>
                </div>

                <div className="space-y-4">
                    {topCategories.length > 0 ? topCategories.map(cat => {
                        const percentage = Math.min((cat.spent / cat.allocated) * 100, 100);
                        const Icon = BUDGET_ICONS.find(i => i.id === cat.icon)?.icon || Icons.Shopping;
                        return (
                            <div
                                key={cat.id}
                                onClick={() => navigateTo('budget', 'budget', cat.id)}
                                className="group cursor-pointer bg-theme-main/30 p-4 rounded-2xl border border-transparent hover:border-cyan-500/30 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-theme-card flex items-center justify-center ${cat.color.replace('bg-', 'text-')} shadow-inner`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-theme-primary group-hover:text-cyan-400 transition-colors">{cat.name}</span>
                                            <span className="text-[10px] font-bold text-theme-secondary">{Math.round(percentage)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-theme-main rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-rose-500' : cat.color}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-theme-secondary font-medium">
                                        {isPrivacyMode ? '••••' : (cat.allocated - cat.spent).toLocaleString()} ETB remaining
                                    </p>
                                    {percentage > 90 && (
                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">🚨 Near Limit</span>
                                    )}
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center py-6 opacity-50">
                            <Icons.Shopping size={32} className="mx-auto mb-2 text-theme-secondary" />
                            <p className="text-xs italic">No variable expenses tracked yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
