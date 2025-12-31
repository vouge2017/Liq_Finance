import React from 'react';
import { useAppContext } from '@/context/AppContext';

interface SubscriptionWidgetProps {
    onOpenModal: () => void;
}

export const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({ onOpenModal }) => {
    const { state } = useAppContext();
    const { recurringTransactions } = state;

    if (recurringTransactions.length === 0) return null;

    // Color themes for date icons
    const colorThemes = [
        { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-500/20' },
        { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20' },
        { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-500/20' },
    ];

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#111318] dark:text-white">Upcoming Bills</h3>
                <button
                    onClick={onOpenModal}
                    className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                    See All
                </button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
                {recurringTransactions.slice(0, 5).map((sub, index) => {
                    const date = new Date(sub.next_due_date);
                    const month = date.toLocaleString('default', { month: 'short' });
                    const day = date.getDate();
                    const theme = colorThemes[index % colorThemes.length];

                    return (
                        <div
                            key={sub.id}
                            className="w-[80%] md:w-[250px] shrink-0 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                {/* Date Icon */}
                                <div className={`w-12 h-12 rounded-xl ${theme.bg} flex flex-col items-center justify-center ${theme.text} shrink-0 font-bold border ${theme.border}`}>
                                    <span className="text-[9px] uppercase tracking-wider opacity-80">{month}</span>
                                    <span className="text-lg leading-none">{day}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-[#111318] dark:text-white text-sm">{sub.name}</h4>
                                    <p className="text-gray-500 text-xs">
                                        {sub.recurrence === 'monthly' ? 'Monthly Utility' : sub.recurrence}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-auto">
                                <p className="font-bold text-[#111318] dark:text-white text-base">
                                    ETB {sub.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
