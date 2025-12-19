import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';

export const DailyBriefing: React.FC = () => {
    const { t } = useTranslation();
    const { state, isPrivacyMode } = useAppContext();
    const { userName, totalIncome, totalExpense, budgetCategories } = state;

    // Simple "Safe to Spend" calculation
    // (Income - Fixed Expenses - Savings Goals) / Days Remaining
    // For now, we'll use a simplified version: (Budget Limit - Current Expense) / Days Remaining

    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, daysInMonth - today.getDate());

    const calculatedBudget = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    const budget = calculatedBudget > 0 ? calculatedBudget : (totalIncome * 0.8); // Default to 80% of income if no budget set
    const remainingBudget = Math.max(0, budget - totalExpense);
    const dailySafe = remainingBudget / daysRemaining;

    const getGreeting = () => {
        const hour = new Date().getHours();
        // Simple greeting logic, could be expanded in locales if needed
        return t('dashboard.greeting', { name: userName?.split(' ')[0] });
    };

    return (
        <div className="bg-gradient-to-r from-theme-card to-theme-bg border border-theme rounded-2xl p-5 mb-6 shadow-sm relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-theme-secondary text-xs uppercase tracking-wider font-medium mb-1">
                            {getGreeting()}
                        </p>
                        <h2 className="text-theme-primary text-lg font-bold">
                            Financial Overview
                        </h2>
                    </div>
                    <div className="bg-cyan-500/10 p-2 rounded-full">
                        <Icons.Sun size={20} className="text-cyan-500" />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-theme-secondary text-xs mb-1">{t('dashboard.safeToSpend')}</p>
                        <p className="text-2xl font-extrabold text-theme-primary tracking-tight">
                            {isPrivacyMode ? '••••' : `$${dailySafe.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        </p>
                    </div>
                    <div className="w-px h-10 bg-theme-border"></div>
                    <div className="flex-1">
                        <p className="text-theme-secondary text-xs mb-1">{t('dashboard.remaining')}</p>
                        <p className="text-xl font-bold text-theme-primary">{daysRemaining}</p>
                    </div>
                </div>

                {dailySafe < 100 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
                        <Icons.Alert size={14} />
                        <span>{t('dashboard.recoverPlan', { amount: 100 })}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
