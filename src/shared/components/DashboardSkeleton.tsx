"use client"

import React from 'react'

// Individual skeleton components matching dashboard widget shapes
const BalanceCardSkeleton = () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <div className="h-3 w-20 bg-gray-700 rounded mb-3" />
                <div className="h-8 w-36 bg-gray-700 rounded" />
            </div>
            <div className="h-10 w-10 bg-gray-700 rounded-full" />
        </div>
        {/* Account Pills */}
        <div className="flex gap-2 overflow-hidden">
            <div className="h-16 w-32 bg-gray-700/50 rounded-2xl" />
            <div className="h-16 w-32 bg-gray-700/50 rounded-2xl" />
            <div className="h-16 w-32 bg-gray-700/50 rounded-2xl" />
        </div>
    </div>
)

const ExpenseTrackingSkeleton = () => (
    <div className="bg-theme-card rounded-3xl p-6 border border-theme animate-pulse">
        <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-28 bg-gray-700 rounded" />
            <div className="h-6 w-16 bg-gray-700 rounded-full" />
        </div>
        {/* Chart placeholder */}
        <div className="h-48 bg-gray-800/50 rounded-2xl mb-4 flex items-end justify-center gap-2 p-4">
            {[40, 65, 35, 80, 55, 45, 70].map((h, i) => (
                <div
                    key={i}
                    className="w-8 bg-gray-700 rounded-t-lg"
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-4">
            <div className="h-3 w-16 bg-gray-700 rounded" />
            <div className="h-3 w-16 bg-gray-700 rounded" />
        </div>
    </div>
)

const SavingsGoalsSkeleton = () => (
    <div className="bg-theme-card rounded-3xl p-6 border border-theme animate-pulse">
        <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-24 bg-gray-700 rounded" />
            <div className="h-5 w-5 bg-gray-700 rounded" />
        </div>
        {/* Goal cards */}
        <div className="space-y-3">
            {[1, 2].map((i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                            <div className="h-3 w-20 bg-gray-700 rounded mb-2" />
                            <div className="h-2 w-full bg-gray-700 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const TransactionListSkeleton = () => (
    <div className="bg-theme-card rounded-3xl p-6 border border-theme animate-pulse">
        <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-32 bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-700 rounded" />
        </div>
        {/* Transaction items */}
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-0">
                    <div className="w-10 h-10 bg-gray-700 rounded-xl" />
                    <div className="flex-1">
                        <div className="h-3 w-24 bg-gray-700 rounded mb-2" />
                        <div className="h-2 w-16 bg-gray-700 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-gray-700 rounded" />
                </div>
            ))}
        </div>
    </div>
)

// Main Dashboard Skeleton - combines all widget skeletons
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Balance Card */}
            <BalanceCardSkeleton />

            {/* Expense Tracking */}
            <ExpenseTrackingSkeleton />

            {/* Savings Goals */}
            <SavingsGoalsSkeleton />

            {/* Transaction List */}
            <TransactionListSkeleton />
        </div>
    )
}

// Export individual skeletons for granular use
export {
    BalanceCardSkeleton,
    ExpenseTrackingSkeleton,
    SavingsGoalsSkeleton,
    TransactionListSkeleton
}
