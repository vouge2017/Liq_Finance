import React from 'react';
import { cn } from '@/lib/utils';

interface HeroCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'custom';
  className?: string;
  gradient?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  children,
  variant = 'primary',
  className,
  gradient,
}) => {
  const gradients = {
    primary: 'bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-600',
    success: 'bg-gradient-to-br from-emerald-500 via-green-400 to-teal-600',
    warning: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-600',
    danger: 'bg-gradient-to-br from-red-500 via-rose-400 to-pink-600',
    custom: gradient || 'bg-gradient-to-br from-cyan-500 to-blue-600',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 shadow-lg overflow-hidden relative',
        'before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent',
        gradients[variant],
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const HeroText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h1 className={cn('text-hero font-bold text-white drop-shadow-lg', className)}>
    {children}
  </h1>
);

export const HeroSubtext: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p className={cn('text-body text-white/90 drop-shadow-md', className)}>
    {children}
  </p>
);
