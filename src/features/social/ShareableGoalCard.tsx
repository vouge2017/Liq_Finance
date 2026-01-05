import React, { useState } from 'react';
import { SavingsGoal } from '@/types';
import { Icons } from '@/shared/components/Icons';

interface ShareableGoalCardProps {
    goal: SavingsGoal;
    className?: string;
}

export const ShareableGoalCard: React.FC<ShareableGoalCardProps> = ({ goal, className = '' }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

    const handleShare = async () => {
        if (!navigator.share) {
            // Fallback for browsers without Web Share API
            try {
                await navigator.clipboard.writeText(
                    `I'm ${Math.round(progress)}% towards my ${goal.title} goal on Liq Finance! 🚀`
                );
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } catch {
                console.error('Failed to copy to clipboard');
            }
            return;
        }

        setIsSharing(true);

        try {
            await navigator.share({
                title: `My ${goal.title} Goal`,
                text: `I'm ${Math.round(progress)}% towards my ${goal.title} goal! 🎯 ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()} ETB saved.`,
                url: 'https://liq.finance'
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (err) {
            // User cancelled or error
            console.log('Share cancelled or failed');
        } finally {
            setIsSharing(false);
        }
    };

    const IconComponent = (Icons as any)[goal.icon] || Icons.Target;

    return (
        <div className={`relative ${className}`}>
            {/* The shareable card preview */}
            <div className="bg-gradient-to-br from-cyan-600 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-xl -ml-8 -mb-8" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <IconComponent size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{goal.title}</h3>
                            <p className="text-white/70 text-sm">Savings Goal</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/80">{goal.currentAmount.toLocaleString()} ETB</span>
                            <span className="font-bold">{goal.targetAmount.toLocaleString()} ETB</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center">
                        <div className="text-3xl font-extrabold">{Math.round(progress)}%</div>
                        <div className="text-right">
                            <div className="text-white/70 text-xs">Remaining</div>
                            <div className="font-bold">{(goal.targetAmount - goal.currentAmount).toLocaleString()} ETB</div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icons.Sparkles size={16} />
                            <span className="text-sm font-medium">Liq Finance</span>
                        </div>
                        <span className="text-xs text-white/50">🇪🇹</span>
                    </div>
                </div>
            </div>

            {/* Share Button */}
            <button
                onClick={handleShare}
                disabled={isSharing}
                className="mt-4 w-full py-3 bg-theme-card border border-theme rounded-xl font-bold text-theme-primary flex items-center justify-center gap-2 hover:bg-theme-muted transition-colors active:scale-95"
            >
                {isSharing ? (
                    <>
                        <Icons.Loader size={18} className="animate-spin" />
                        Sharing...
                    </>
                ) : showSuccess ? (
                    <>
                        <Icons.Check size={18} className="text-emerald-500" />
                        Shared!
                    </>
                ) : (
                    <>
                        <Icons.Send size={18} />
                        Share Progress
                    </>
                )}
            </button>
        </div>
    );
};

// Helper hook for sharing
export const useGoalShare = () => {
    const [isSharing, setIsSharing] = useState(false);

    const shareGoal = async (goal: SavingsGoal): Promise<boolean> => {
        if (!navigator.share) {
            return false;
        }

        setIsSharing(true);

        try {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            await navigator.share({
                title: `My ${goal.title} Goal`,
                text: `I'm ${Math.round(progress)}% towards my ${goal.title} goal! 🎯`,
                url: 'https://liq.finance'
            });
            return true;
        } catch {
            return false;
        } finally {
            setIsSharing(false);
        }
    };

    return { shareGoal, isSharing };
};
