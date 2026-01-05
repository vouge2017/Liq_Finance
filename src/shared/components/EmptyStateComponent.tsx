import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-96 rounded-2xl border-2 border-dashed border-border bg-surface-main/50 p-8 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="text-6xl mb-4">
        {typeof icon === 'string' ? icon : icon}
      </div>

      {/* Title */}
      <h2 className="text-primary-heading font-semibold text-theme-primary mb-2">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-body text-theme-secondary mb-6 max-w-sm">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {action && (
          <Button size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" size="lg" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Specialized Empty States

export const NoTransactionsState: React.FC<{ onAddClick: () => void }> = ({
  onAddClick,
}) => (
  <EmptyState
    icon="💸"
    title="No Transactions Yet"
    description="Start by adding your first transaction to track your spending."
    action={{
      label: 'Add Transaction',
      onClick: onAddClick,
    }}
  />
);

export const NoBudgetState: React.FC<{ onCreateClick: () => void }> = ({
  onCreateClick,
}) => (
  <EmptyState
    icon="📊"
    title="No Budgets Created"
    description="Set up a budget to keep track of your spending categories."
    action={{
      label: 'Create Budget',
      onClick: onCreateClick,
    }}
  />
);

export const NoGoalsState: React.FC<{ onCreateClick: () => void }> = ({
  onCreateClick,
}) => (
  <EmptyState
    icon="🎯"
    title="No Goals Yet"
    description="Set financial goals and watch your progress grow."
    action={{
      label: 'Create Goal',
      onClick: onCreateClick,
    }}
  />
);

export const NoSearchResults: React.FC<{ 
  query: string;
  onClear: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    icon="🔍"
    title="No Results Found"
    description={`We couldn't find anything matching "${query}".`}
    action={{
      label: 'Clear Search',
      onClick: onClear,
    }}
  />
);

export const NoConnectionState: React.FC<{ onRetry: () => void }> = ({
  onRetry,
}) => (
  <EmptyState
    icon="🌐"
    title="Connection Lost"
    description="Check your internet connection and try again."
    action={{
      label: 'Retry',
      onClick: onRetry,
    }}
  />
);

export const NoDataState: React.FC<{ 
  title?: string;
  onRefresh: () => void;
}> = ({ title = 'No Data Available', onRefresh }) => (
  <EmptyState
    icon="📭"
    title={title}
    description="There's nothing to show right now."
    action={{
      label: 'Refresh',
      onClick: onRefresh,
    }}
  />
);
