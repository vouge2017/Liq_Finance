import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import CountUp from '@/shared/components/CountUp';

export const BalanceCard: React.FC = () => {
  const { state, isPrivacyMode } = useAppContext();
  const { totalBalance, totalIncome, totalExpense } = state;

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-br from-primary to-[#052c78] rounded-[2rem] shadow-glow-lg p-6 group transition-transform duration-500 hover:scale-[1.01]">
      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px), radial-gradient(#fff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Gradient Orbs - GPU-cheap alternative to blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/10 rounded-full opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full opacity-50"></div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header Row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <p className="text-blue-100/90 text-sm font-bold tracking-wide">Total Balance</p>
            <h1 className="text-[2.5rem] leading-tight font-black text-white tracking-tighter drop-shadow-md font-display mt-1">
              <span className="text-xl align-top mr-0.5 font-bold text-cyan-200 opacity-90">ETB</span>
              {isPrivacyMode ? '••••••' : (
                <CountUp
                  end={totalBalance}
                  duration={1.5}
                  decimals={2}
                  separator=","
                />
              )}
            </h1>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 shadow-sm text-cyan-200 cursor-pointer hover:bg-white/25 transition-colors">
            <span className="text-xs font-semibold">Analytics</span>
            <Icons.ChevronRight size={14} />
          </div>
        </div>

        {/* Income/Expense Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Icons.Check size={18} className="text-green-400" />
              <span className="text-xs font-medium text-gray-200">Income</span>
            </div>
            <p className="text-lg font-bold text-white">
              {isPrivacyMode ? '••••' : totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <Icons.ArrowUpRight size={18} className="text-rose-400" />
              <span className="text-xs font-medium text-gray-200">Expense</span>
            </div>
            <p className="text-lg font-bold text-white">
              {isPrivacyMode ? '••••' : totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
