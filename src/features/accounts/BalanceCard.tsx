import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';

export const BalanceCard: React.FC = () => {
  const { state, isPrivacyMode, setActiveTab } = useAppContext();
  const { totalBalance, totalIncome, totalExpense } = state;

  return (
    <div className="balance-hero-card bg-gradient-to-br from-cyan-600 via-indigo-700 to-purple-800 rounded-[2rem] p-6 mb-8 relative overflow-hidden shadow-2xl shadow-indigo-500/30 group transform hover:scale-[1.02] transition-all duration-300 card-hover">
      {/* Enhanced background decoration - animated blur orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/30 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-400/20 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none animate-pulse-slower"></div>
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-pink-500/15 rounded-full blur-[40px] pointer-events-none animate-float"></div>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      <div
        className="flex justify-between items-start mb-2 relative z-10 cursor-pointer"
        onClick={() => setActiveTab('accounts')}
      >
        <div>
          <h2 className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Balance</h2>
          <div className="flex items-baseline gap-1">
            <span className="text-white/80 text-3xl font-bold">$</span>
            <span className="text-white text-5xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              {isPrivacyMode ? '••••••' : totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        {/* Change indicator badge */}
        <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-400/20">
          <Icons.TrendingUp size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">+3.5%</span>
        </div>
      </div>

      <p className="text-white/50 text-xs mb-6 relative z-10">Since last month</p>

      <div className="flex justify-between items-center gap-3 relative z-10">
        {/* Income */}
        <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/25 flex items-center justify-center">
            <Icons.ArrowDown size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Income</p>
            <p className="text-white font-bold text-base">
              {isPrivacyMode ? '••••' : `$${totalIncome.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-rose-500/25 flex items-center justify-center">
            <Icons.ArrowUp size={18} className="text-rose-400" />
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Expense</p>
            <p className="text-white font-bold text-base">
              {isPrivacyMode ? '••••' : `$${totalExpense.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
