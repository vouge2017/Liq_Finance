import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { Account } from '@/types';

export const NetWorthCard: React.FC = () => {
    const { t } = useTranslation();
    const { state, isPrivacyMode, togglePrivacyMode } = useAppContext();
    const { accounts } = state;

    const totalAssets = accounts.reduce((acc, curr) => {
        if (curr.type === 'Loan') return acc - curr.balance;
        return acc + curr.balance;
    }, 0);
    const bankAssets = accounts.filter((a: Account) => a.type === 'Bank').reduce((acc, curr) => acc + curr.balance, 0);
    const mobileAssets = accounts.filter((a: Account) => a.type === 'Mobile Money').reduce((acc, curr) => acc + curr.balance, 0);
    const grossAssets = accounts.reduce((acc, curr) => {
        if (curr.type !== 'Loan') return acc + curr.balance;
        return acc;
    }, 0);

    return (
        <section className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 shadow-sm border border-white/20 dark:border-white/5 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('accounts.netWorth') || 'Net Worth'}</p>
                    <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {isPrivacyMode ? '••••••' : totalAssets.toLocaleString()}
                            <span className="text-lg text-gray-400 ml-1 font-bold">ETB</span>
                        </h2>
                        <button onClick={togglePrivacyMode} className="text-gray-400 hover:text-primary transition-colors">
                            {isPrivacyMode ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icons.Wallet size={24} />
                </div>
            </div>

            {/* Asset Allocation Bar */}
            <div className="mt-8">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    <span>Asset Allocation</span>
                    <span>{grossAssets > 0 ? '100%' : '0%'}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full flex overflow-hidden">
                    <div
                        className="h-full bg-primary"
                        style={{ width: grossAssets > 0 ? `${(bankAssets / grossAssets) * 100}%` : '0%' }}
                    />
                    <div
                        className="h-full bg-cyan-400"
                        style={{ width: grossAssets > 0 ? `${(mobileAssets / grossAssets) * 100}%` : '0%' }}
                    />
                </div>
                <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-[10px] font-bold text-gray-500">Bank</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                        <span className="text-[10px] font-bold text-gray-500">Mobile</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
