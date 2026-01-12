"use client"

import React from 'react'

const BudgetCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-white/5 rounded mb-4" />
        <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full">
            <div className="w-2/3 h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
    </div>
)

const BudgetSummarySkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="flex justify-between mb-6">
            <div className="h-4 w-24 bg-gray-600 rounded" />
            <div className="h-6 w-16 bg-gray-600 rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-600 rounded mb-6" />
        <div className="w-full h-3 bg-gray-700 rounded-full mb-2">
            <div className="w-2/3 h-full bg-gray-500 rounded-full" />
        </div>
        <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-600 rounded" />
            <div className="h-3 w-20 bg-gray-600 rounded" />
        </div>
    </div>
)

const TransactionItemSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 flex items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 rounded" />
        </div>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
)

const CategoryFilterSkeleton: React.FC = () => (
    <div className="flex gap-3 overflow-hidden py-2">
        {Array.from({ length: 5 }).map((_, i) => (
            <div
                key={i}
                className={`h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${i === 0 ? 'w-20' : 'w-16'}`}
            />
        ))}
    </div>
)

export const BudgetSkeleton: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>

        <BudgetSummarySkeleton />

        <div className="flex items-center gap-3 overflow-hidden">
            <CategoryFilterSkeleton />
        </div>

        <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <BudgetCardSkeleton key={i} />
            ))}
        </div>

        <div className="space-y-3">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
                <TransactionItemSkeleton key={i} />
            ))}
        </div>
    </div>
)

export const BudgetPageSkeleton: React.FC = () => <BudgetSkeleton />

export {
    BudgetCardSkeleton,
    BudgetSummarySkeleton,
    TransactionItemSkeleton,
    CategoryFilterSkeleton
}
