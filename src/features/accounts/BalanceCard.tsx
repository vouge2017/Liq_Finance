import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';

export const BalanceCard: React.FC = () => {
  const { state, isPrivacyMode, setActiveTab } = useAppContext();
  const { totalBalance, totalIncome, totalExpense } = state;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 mb-8 relative overflow-hidden shadow-2xl shadow-indigo-500/20 group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

      <div
        className="flex justify-between items-start mb-1 relative z-10 cursor-pointer"
        onClick={() => setActiveTab('accounts')}
      >
        <div>
          <h2 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-blue-200 text-2xl font-bold">$</span>
            <span className="text-white text-4xl font-bold tracking-tight">
              {isPrivacyMode ? '••••••' : totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <Icons.TrendingUp size={12} className="text-lime-300" />
          <span className="text-[10px] font-bold text-white">+3.5%</span>
        </div>
      </div>

      <p className="text-blue-200/60 text-xs mb-6 relative z-10">Since last month</p>

      <div className="flex justify-between items-center gap-4 relative z-10">
        {/* Income */}
        <div className="flex items-center gap-3 bg-black/10 rounded-xl p-2 pr-4 backdrop-blur-sm border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Icons.ArrowDown size={16} />
          </div>
          <div>
            <p className="text-blue-200/60 text-[10px] font-medium">Income</p>
            <p className="text-white font-bold text-sm">
              {isPrivacyMode ? '••••' : totalIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="flex items-center gap-3 bg-black/10 rounded-xl p-2 pr-4 backdrop-blur-sm border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300">
            <Icons.ArrowUp size={16} />
          </div>
          <div>
            <p className="text-blue-200/60 text-[10px] font-medium">Expense</p>
            <p className="text-white font-bold text-sm">
              {isPrivacyMode ? '••••' : totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
