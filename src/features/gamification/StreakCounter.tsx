import React from 'react';
import { Icons } from '@/shared/components/Icons';

interface StreakCounterProps {
    streak: number;
    className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak, className = '' }) => {
    const isActive = streak > 0;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`relative ${isActive ? 'animate-flicker' : ''}`}>
                <Icons.Zap
                    size={24}
                    className={isActive ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}
                />
                {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
                )}
            </div>
            <div>
                <span className={`text-2xl font-extrabold ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                    {streak}
                </span>
                <span className="text-xs text-theme-secondary ml-1">
                    {streak === 1 ? 'week' : 'weeks'}
                </span>
            </div>
            {streak >= 4 && (
                <div className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-bold">
                    🔥 On Fire!
                </div>
            )}
        </div>
    );
};
