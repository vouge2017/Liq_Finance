import React from 'react';

/**
 * Optimized skeleton loaders for low-end Android devices
 * Uses simple pulse animation (GPU-cheap) instead of complex animations
 * No backdrop-blur or expensive effects
 */

// Balance Card Skeleton - matches BalanceCard.tsx structure
export const BalanceCardSkeleton: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] p-6">
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header Row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>

        {/* Income/Expense Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 p-3 rounded-xl">
            <div className="h-3 w-12 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 p-3 rounded-xl">
            <div className="h-3 w-12 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Transaction List Item Skeleton - matches TransactionList.tsx structure
export const TransactionItemSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
};

// Transaction List Skeleton
export const TransactionListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <TransactionItemSkeleton key={index} />
      ))}
    </div>
  );
};

// Goals Summary Skeleton
export const GoalsSummarySkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};

