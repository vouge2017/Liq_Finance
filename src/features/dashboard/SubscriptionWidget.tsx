import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { SUBSCRIPTION_ICONS } from '@/shared/constants';

interface SubscriptionWidgetProps {
    onOpenModal: () => void;
}

export const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({ onOpenModal }) => {
    const { state } = useAppContext();
    const { recurringTransactions } = state;

    if (recurringTransactions.length === 0) return null;

    return (
        <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="flex items-center gap-2 text-xs font-bold text-theme-secondary uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    Subscriptions
                </h3>
                <button
                    onClick={onOpenModal}
                    className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
                >
                    Manage
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {recurringTransactions.slice(0, 3).map(sub => {
                    const iconObj = SUBSCRIPTION_ICONS.find(i => i.id === sub.icon) || SUBSCRIPTION_ICONS[0];
                    return (
                        <div
                            key={sub.id}
                            className="p-4 rounded-[2rem] bg-theme-card border border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${iconObj.color} flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                                    <iconObj.icon size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-theme-primary">{sub.name}</h4>
                                    <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider opacity-60">
                                        Next: {sub.next_due_date}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-theme-primary">{sub.amount.toLocaleString()} ETB</p>
                                <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest opacity-40">{sub.recurrence}</p>
                            </div>
                        </div>
                    );
                })}

                {recurringTransactions.length > 3 && (
                    <button
                        onClick={onOpenModal}
                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-theme-secondary uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                        View {recurringTransactions.length - 3} More
                    </button>
                )}
            </div>
        </div>
    );
};
