import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  label: string;
  color: 'danger' | 'success' | 'warning';
  icon?: React.ReactNode;
  onClick: () => void;
}

interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: SwipeAction;
  onSwipeRight?: SwipeAction;
  className?: string;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && onSwipeLeft) {
        // Swiped left
        setSwipeDirection('left');
        setIsOpen(true);
      } else if (swipeDistance < 0 && onSwipeRight) {
        // Swiped right
        setSwipeDirection('right');
        setIsOpen(true);
      }
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setIsOpen(false);
    setSwipeDirection(null);
  };

  const actionColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-emerald-600 hover:bg-emerald-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
  };

  return (
    <div
      ref={itemRef}
      className={cn('relative overflow-hidden rounded-lg', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Actions */}
      {isOpen && swipeDirection === 'left' && onSwipeLeft && (
        <div className="absolute inset-0 flex items-center justify-end bg-red-600">
          <button
            onClick={() => handleActionClick(onSwipeLeft)}
            className={cn(
              'flex items-center justify-center h-full w-20 text-white font-medium transition-all',
              actionColors[onSwipeLeft.color]
            )}
          >
            {onSwipeLeft.icon || onSwipeLeft.label}
          </button>
        </div>
      )}

      {isOpen && swipeDirection === 'right' && onSwipeRight && (
        <div className="absolute inset-0 flex items-center justify-start bg-emerald-600">
          <button
            onClick={() => handleActionClick(onSwipeRight)}
            className={cn(
              'flex items-center justify-center h-full w-20 text-white font-medium transition-all',
              actionColors[onSwipeRight.color]
            )}
          >
            {onSwipeRight.icon || onSwipeRight.label}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'relative bg-card transition-all duration-200',
          isOpen && (swipeDirection === 'left' ? '-translate-x-20' : 'translate-x-20')
        )}
      >
        {children}
      </div>

      {/* Overlay to close swipe */}
      {isOpen && (
        <button
          className="absolute inset-0 z-0"
          onClick={() => {
            setIsOpen(false);
            setSwipeDirection(null);
          }}
          aria-label="Close swipe actions"
        />
      )}
    </div>
  );
};

/**
 * Transaction List Item with Swipe Actions
 */
interface TransactionItemProps {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export const SwipeableTransactionItem: React.FC<TransactionItemProps> = ({
  id,
  description,
  amount,
  date,
  category,
  onDelete,
  onEdit,
  className,
}) => {
  return (
    <SwipeableListItem
      onSwipeLeft={
        onDelete
          ? {
              label: 'Delete',
              color: 'danger',
              icon: '🗑️',
              onClick: () => onDelete(id),
            }
          : undefined
      }
      onSwipeRight={
        onEdit
          ? {
              label: 'Edit',
              color: 'success',
              icon: '✏️',
              onClick: () => onEdit(id),
            }
          : undefined
      }
      className={className}
    >
      <div className="flex items-center justify-between p-4 border-b border-border last:border-b-0">
        <div className="flex-1">
          <p className="text-label font-medium text-theme-primary">{description}</p>
          <p className="text-caption text-theme-secondary">{date}</p>
        </div>
        <div className="text-right ml-4">
          <p className={cn('text-body font-semibold', amount > 0 ? 'text-emerald-500' : 'text-red-500')}>
            {amount > 0 ? '+' : ''}{amount} ETB
          </p>
          <p className="text-caption text-theme-secondary">{category}</p>
        </div>
      </div>
    </SwipeableListItem>
  );
};
