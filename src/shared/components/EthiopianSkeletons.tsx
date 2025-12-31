import React from 'react'

// Skeleton for transaction items
export const TransactionSkeleton: React.FC = () => (
    <div className="bg-theme-card border border-theme rounded-2xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
            </div>
            <div className="text-right">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            </div>
        </div>
    </div>
)

// Skeleton for budget categories
export const BudgetCategorySkeleton: React.FC = () => (
    <div className="bg-theme-card border border-theme rounded-2xl p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
        <div className="mb-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden mb-2"></div>
        <div className="flex justify-between">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
    </div>
)

// Skeleton for dashboard cards
export const DashboardCardSkeleton: React.FC = () => (
    <div className="bg-theme-card border border-theme rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
            <div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
        </div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
    </div>
)

// Skeleton for goals progress
export const GoalProgressSkeleton: React.FC = () => (
    <div className="bg-theme-card border border-theme rounded-2xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
        <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full mb-3"></div>
        <div className="flex justify-between">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
    </div>
)

// Skeleton for subscription items
export const SubscriptionSkeleton: React.FC = () => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-main/50 border border-theme animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
            <div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
        </div>
        <div className="text-right">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
    </div>
)

// Skeleton list container
interface SkeletonListProps {
    count?: number
    type: 'transactions' | 'budget' | 'dashboard' | 'goals' | 'subscriptions'
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
    count = 3,
    type
}) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'transactions':
                return <TransactionSkeleton />
            case 'budget':
                return <BudgetCategorySkeleton />
            case 'dashboard':
                return <DashboardCardSkeleton />
            case 'goals':
                return <GoalProgressSkeleton />
            case 'subscriptions':
                return <SubscriptionSkeleton />
            default:
                return <TransactionSkeleton />
        }
    }

    return (
        <div className="space-y-4">
            {Array.from({ length: count }, (_, index) => (
                <div key={index}>
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    )
}

// Ethiopian-specific skeleton for Iqub/Community savings
export const IqubSkeleton: React.FC = () => (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-300 dark:bg-amber-700 rounded-xl"></div>
            <div>
                <div className="h-5 bg-amber-300 dark:bg-amber-700 rounded w-32 mb-1"></div>
                <div className="h-4 bg-amber-300 dark:bg-amber-700 rounded w-24"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-amber-300 dark:bg-amber-700 rounded w-full"></div>
            <div className="h-3 bg-amber-300 dark:bg-amber-700 rounded w-3/4"></div>
        </div>
        <div className="w-full h-2 bg-amber-300 dark:bg-amber-700 rounded-full mt-4"></div>
    </div>
)