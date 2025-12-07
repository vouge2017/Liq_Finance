import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';

export const BalanceCard: React.FC = () => {
  const { state, isPrivacyMode, setActiveTab } = useAppContext();
  const { totalBalance, totalIncome, totalExpense } = state;

  return (
    <div className="bg-theme-card rounded-3xl p-6 mb-6 border border-theme relative overflow-hidden transition-colors duration-300 shadow-lg group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

      <div 
        className="flex justify-between items-start mb-2 relative z-10 cursor-pointer"
        onClick={() => setActiveTab('accounts')}
      >
        <div>
          <h2 className="text-theme-secondary text-xs font-medium tracking-wider uppercase group-hover:text-cyan-400 transition-colors">Total Balance / <span className="ethiopic">ጠቅላላ ቀሪ ሂሳብ</span></h2>
        </div>
        <button className="flex items-center text-cyan-400 text-sm font-medium hover:text-cyan-300">
          Details <Icons.ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-baseline gap-2 mb-6 relative z-10 cursor-pointer" onClick={() => setActiveTab('accounts')}>
        <span className="text-cyan-400 text-2xl font-bold">ETB</span>
        <span className="text-cyan-400 text-4xl font-bold tracking-tight">
          {isPrivacyMode ? '••••••' : totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex justify-between items-center gap-4 relative z-10">
        {/* Income */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-900/20 flex items-center justify-center border border-emerald-900/30">
            <Icons.ArrowDown className="text-emerald-500" size={18} />
          </div>
          <div>
            <p className="text-theme-secondary text-xs">Income</p>
            <p className="text-emerald-500 font-semibold">
                {isPrivacyMode ? '••••' : totalIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-900/20 flex items-center justify-center border border-rose-900/30">
            <Icons.ArrowUp className="text-rose-500" size={18} />
          </div>
          <div>
            <p className="text-theme-secondary text-xs">Expense</p>
            <p className="text-rose-500 font-semibold">
                {isPrivacyMode ? '••••' : totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
