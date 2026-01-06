import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { NetWorthCard } from './NetWorthCard';
import { SubscriptionWidget } from './SubscriptionWidget';
import { TransactionList } from '@/features/budget/TransactionList';
import { SubscriptionModal } from '@/shared/components/SubscriptionModal';
import { FinancialProfileModal } from '@/features/auth/FinancialProfileModal';

export const DashboardPage: React.FC = () => {
    const { state, activeProfile, visibleWidgets } = useAppContext();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showFinancialProfile, setShowFinancialProfile] = useState(false);

    return (
        <div className="animate-fade-in pb-28">
            {/* Header - Stitch Design (Moved from App.tsx) */}
            <header className="flex items-center justify-between pt-2 pb-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-2 border-white dark:border-surface-dark shadow-sm"
                                style={{ backgroundImage: `url("${activeProfile === "Personal" ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Family"}")` }}
                                onClick={() => setShowFinancialProfile(true)}
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Good Morning</span>
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-[#111318] dark:text-white">
                                Selam, {state.userName?.split(' ')[0] || "User"}
                            </h2>
                        </div>
                    </div>
                    {/* Date Pill with Calendar Toggle */}
                    <div className="flex items-center gap-2 mt-2 ml-14">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
                            <span className="text-gray-700 dark:text-gray-200 text-xs font-bold tracking-wide">24/10/2023</span>
                            <div className="w-px h-3 bg-gray-200 dark:bg-gray-700"></div>
                            <button className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors">
                                <span className="text-[10px] font-black">GC</span>
                                <Icons.Refresh size={12} />
                            </button>
                        </div>
                    </div>
                </div>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Icons.Bell size={24} />
                </button>
            </header>

            {visibleWidgets.balance && <NetWorthCard />}
            <SubscriptionWidget onOpenModal={() => setShowSubscriptionModal(true)} />
            {visibleWidgets.transactions && <TransactionList />}

            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
            {showFinancialProfile && <FinancialProfileModal onClose={() => setShowFinancialProfile(false)} />}
        </div>
    );
};
