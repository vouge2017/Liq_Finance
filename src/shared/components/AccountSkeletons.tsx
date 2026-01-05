import React from 'react'

// Skeleton for account cards with Ethiopian-specific elements
export const AccountCardSkeleton: React.FC = () => (
    <div className="bg-theme-card border border-theme rounded-3xl p-5 animate-pulse">
        {/* Account Header */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
            </div>
            <div className="flex gap-1">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
            </div>
        </div>

        {/* Balance Display */}
        <div className="flex items-baseline gap-2 mb-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
        </div>

        {/* Quick Actions Preview */}
        <div className="flex gap-2 mb-4">
            <div className="flex-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
            <div className="flex-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        </div>

        {/* Recent Activity Preview */}
        <div className="border-t border-theme pt-4">
            <div className="flex items-center gap-1 mb-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <div className="space-y-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                    <div className="space-y-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-14"></div>
                    </div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
            </div>
        </div>
    </div>
)

// Skeleton for institution groups
export const InstitutionGroupSkeleton: React.FC = () => (
    <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        </div>
        <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-gray-700 to-gray-900 animate-pulse">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"></div>
                        <div>
                            <div className="h-5 bg-white/20 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-white/20 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="w-8 h-8 bg-black/20 rounded-lg backdrop-blur-md"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-baseline gap-1">
                        <div className="h-8 bg-white/20 rounded w-20"></div>
                        <div className="h-4 bg-white/20 rounded w-8"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// Skeleton for net worth display
export const NetWorthSkeleton: React.FC = () => (
    <div className="mb-6 flex flex-col gap-2 animate-pulse">
        <div className="flex justify-between items-center mb-1">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            </div>
        </div>
        <div className="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: '60%' }}></div>
            <div className="h-full bg-cyan-500" style={{ width: '30%' }}></div>
            <div className="h-full bg-gray-500 flex-1"></div>
        </div>
    </div>
)

// Ethiopian-optimized loading list
interface AccountSkeletonListProps {
    count?: number
}

export const AccountSkeletonList: React.FC<AccountSkeletonListProps> = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }, (_, index) => (
            <AccountCardSkeleton key={index} />
        ))}
    </div>
)

// Loading state for account selection
export const AccountSelectionSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        {/* Net Worth Header */}
        <NetWorthSkeleton />

        {/* Account Groups */}
        <div className="space-y-8">
            <InstitutionGroupSkeleton />
            <InstitutionGroupSkeleton />
        </div>

        {/* Add Account Button */}
        <div className="w-full py-4 bg-gray-300 dark:bg-gray-600 rounded-2xl animate-pulse"></div>
    </div>
)

// Ethiopian-specific skeleton for mobile money accounts
export const MobileMoneySkeleton: React.FC = () => (
    <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-300 dark:bg-cyan-700 rounded-xl"></div>
            <div>
                <div className="h-5 bg-cyan-300 dark:bg-cyan-700 rounded w-32 mb-1"></div>
                <div className="h-4 bg-cyan-300 dark:bg-cyan-700 rounded w-24"></div>
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <div className="h-8 bg-cyan-300 dark:bg-cyan-700 rounded w-20"></div>
            <div className="h-4 bg-cyan-300 dark:bg-cyan-700 rounded w-8"></div>
        </div>
    </div>
)

// Loading state for transfer modal
export const TransferModalSkeleton: React.FC = () => (
    <div className="space-y-4 mb-8 relative animate-pulse">
        <div className="absolute left-[23px] top-12 bottom-12 w-0.5 bg-gray-300 dark:bg-gray-600 border-l-2 border-dashed opacity-50"></div>

        <div className="bg-theme-main rounded-2xl p-1 border border-theme">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 ml-3 mt-2 mb-1"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl mx-3"></div>
        </div>

        <div className="bg-theme-main rounded-2xl p-1 border border-theme">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 ml-3 mt-2 mb-1"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl mx-3"></div>
        </div>

        <div className="bg-theme-main rounded-2xl p-1 border border-theme">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 ml-3 mt-2 mb-1"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl mx-3"></div>
        </div>
    </div>
)