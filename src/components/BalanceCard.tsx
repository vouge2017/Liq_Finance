import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, DollarIcon } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  percentageChange: number;
  currency?: string;
  gregorianDate?: string;
  ethiopianDate?: string;
  isLoading?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  income,
  expense,
  percentageChange,
  currency = 'ETB',
  gregorianDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  ethiopianDate,
  isLoading = false,
}) => {
  const isPositive = percentageChange >= 0;
  const formattedBalance = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedIncome = income.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const formattedExpense = expense.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#5855d6] via-[#6b5dd6] to-[#7c3aed] rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-white/20 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-white/10 rounded-xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#5855d6] via-[#6b5dd6] to-[#7c3aed] rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
            <DollarIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white/70 text-xs uppercase tracking-wide font-medium">
            Total Balance
          </span>
        </div>

        {/* Change Indicator */}
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            isPositive
              ? 'bg-emerald-500/20 border border-emerald-400/30'
              : 'bg-rose-500/20 border border-rose-400/30'
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className="w-3 h-3 text-emerald-400" strokeWidth={3} />
          ) : (
            <ArrowDownIcon className="w-3 h-3 text-rose-400" strokeWidth={3} />
          )}
          <span
            className={`text-xs font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {percentageChange.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Balance Section */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-white/80 text-lg font-medium">{currency}</span>
          <span className="text-white text-5xl font-bold tracking-tight">
            {formattedBalance}
          </span>
        </div>

        {/* Date Information */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-white/60 text-sm">{gregorianDate}</span>
          {ethiopianDate && (
            <>
              <span className="text-white/40">•</span>
              <span className="text-white/60 text-sm">{ethiopianDate}</span>
            </>
          )}
        </div>
      </div>

      {/* Since Last Month Label */}
      <div className="text-white/50 text-xs mb-3">Since last month</div>

      {/* Income/Expense Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-400/30 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpIcon className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
            <span className="text-white/70 text-xs uppercase tracking-wide font-medium">
              Income
            </span>
          </div>
          <div className="text-white text-xl font-bold tracking-tight">
            {formattedIncome} <span className="text-sm text-white/60">{currency}</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-rose-400/30 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownIcon className="w-4 h-4 text-rose-400" strokeWidth={2.5} />
            <span className="text-white/70 text-xs uppercase tracking-wide font-medium">
              Expense
            </span>
          </div>
          <div className="text-white text-xl font-bold tracking-tight">
            {formattedExpense} <span className="text-sm text-white/60">{currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
