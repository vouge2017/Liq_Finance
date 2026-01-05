import React from 'react';
import { Badge } from '@/types';
import { Icons } from '@/shared/components/Icons';

// Predefined badge definitions
export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
    {
        id: 'first-save',
        name: 'First Steps',
        description: 'Made your first savings contribution',
        icon: 'Star',
        tier: 'bronze',
        requirement: 'Save any amount'
    },
    {
        id: 'saver-100',
        name: 'Penny Pincher',
        description: 'Saved your first 100 ETB',
        icon: 'PiggyBank',
        tier: 'bronze',
        requirement: 'Save 100 ETB total'
    },
    {
        id: 'saver-1000',
        name: 'Smart Saver',
        description: 'Reached 1,000 ETB in savings',
        icon: 'PiggyBank',
        tier: 'silver',
        requirement: 'Save 1,000 ETB total'
    },
    {
        id: 'saver-10000',
        name: 'Savings Champion',
        description: 'Reached 10,000 ETB in savings',
        icon: 'Trophy',
        tier: 'gold',
        requirement: 'Save 10,000 ETB total'
    },
    {
        id: 'streak-4',
        name: 'Consistent Saver',
        description: '4-week savings streak',
        icon: 'Zap',
        tier: 'silver',
        requirement: 'Save for 4 weeks straight'
    },
    {
        id: 'streak-12',
        name: 'Savings Master',
        description: '12-week savings streak',
        icon: 'Zap',
        tier: 'gold',
        requirement: 'Save for 12 weeks straight'
    },
    {
        id: 'goal-1',
        name: 'Goal Getter',
        description: 'Completed your first goal',
        icon: 'Target',
        tier: 'silver',
        requirement: 'Complete 1 savings goal'
    },
    {
        id: 'goal-3',
        name: 'Goal Crusher',
        description: 'Completed 3 savings goals',
        icon: 'Target',
        tier: 'gold',
        requirement: 'Complete 3 savings goals'
    },
    {
        id: 'iqub-win',
        name: 'Iqub Champion',
        description: 'Won an Iqub payout',
        icon: 'Users',
        tier: 'gold',
        requirement: 'Win an Iqub round'
    },
    {
        id: 'budget-master',
        name: 'Budget Master',
        description: 'Stayed under budget for 3 months',
        icon: 'PieChart',
        tier: 'diamond',
        requirement: 'Stay under budget for 3 months'
    }
];

const tierColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-yellow-400 to-amber-500',
    diamond: 'from-cyan-400 to-blue-500'
};

const tierBorders = {
    bronze: 'border-amber-600/30',
    silver: 'border-slate-400/30',
    gold: 'border-yellow-500/30',
    diamond: 'border-cyan-400/30'
};

interface BadgeShowcaseProps {
    earnedBadges: Badge[];
    showLocked?: boolean;
    className?: string;
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
    earnedBadges,
    showLocked = true,
    className = ''
}) => {
    const earnedIds = new Set(earnedBadges.map(b => b.id));

    const renderBadge = (badge: Omit<Badge, 'earnedAt'>, isEarned: boolean) => {
        const IconComponent = (Icons as any)[badge.icon] || Icons.Star;

        return (
            <div
                key={badge.id}
                className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${isEarned
                        ? `bg-gradient-to-br ${tierColors[badge.tier]} ${tierBorders[badge.tier]} shadow-lg`
                        : 'bg-theme-card border-theme opacity-40 grayscale'
                    }`}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isEarned ? 'bg-white/20' : 'bg-theme-main'
                    }`}>
                    <IconComponent size={24} className={isEarned ? 'text-white' : 'text-theme-secondary'} />
                </div>
                <span className={`text-xs font-bold text-center ${isEarned ? 'text-white' : 'text-theme-secondary'}`}>
                    {badge.name}
                </span>
                {!isEarned && (
                    <div className="absolute top-2 right-2">
                        <Icons.Lock size={12} className="text-theme-secondary" />
                    </div>
                )}
                {isEarned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Icons.Check size={12} className="text-white" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {BADGE_DEFINITIONS.map(badge => {
                const isEarned = earnedIds.has(badge.id);
                if (!isEarned && !showLocked) return null;
                return renderBadge(badge, isEarned);
            })}
        </div>
    );
};
