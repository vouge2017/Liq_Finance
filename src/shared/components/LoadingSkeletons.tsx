import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('bg-skeleton animate-pulse rounded-lg', className)} />
);

export const HeroCardSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 shadow-elevation-4', className)}>
    <Skeleton className="h-12 w-32 mb-4 rounded-lg" />
    <Skeleton className="h-6 w-48 rounded-lg" />
  </div>
);

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
};

export const TransactionListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 pb-24">
    {/* Hero Card */}
    <HeroCardSkeleton className="h-32" />

    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg bg-card p-3 border border-border">
          <Skeleton className="h-6 w-16 mb-2" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>

    {/* Recent Transactions Header */}
    <div>
      <Skeleton className="h-6 w-40 mb-4" />
      <TransactionListSkeleton count={4} />
    </div>
  </div>
);

export const BudgetPageSkeleton: React.FC = () => (
  <div className="space-y-6 pb-24">
    {/* Overview Card */}
    <HeroCardSkeleton className="h-28" />

    {/* Categories */}
    <div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-card p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GoalsSkeleton: React.FC = () => (
  <div className="space-y-4 pb-24">
    {/* Goals List */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    ))}
  </div>
);

export const AccountListSkeleton: React.FC = () => (
  <div className="space-y-3 pb-24">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    ))}
    <Skeleton className="h-14 w-full rounded-lg mt-6" />
  </div>
);

export const AISkeleton: React.FC = () => (
  <div className="space-y-4 pb-24">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'rounded-lg p-4 max-w-xs',
          i % 2 === 0 ? 'bg-cyan-500/20 ml-auto' : 'bg-card'
        )}
      >
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </div>
    ))}
  </div>
);

export const PulseLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-skeleton animate-pulse rounded-lg', className)} />
);
