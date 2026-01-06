/**
 * ImpactPreview - Real-time transaction impact visualization
 * 
 * Shows the user how a proposed transaction affects their:
 * - Cash runway
 * - Budget category
 * - Upcoming obligations
 */

import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { ImpactSummary } from '@/lib/guidance-engine';
import { AlertTriangle, Info, TrendingDown, TrendingUp, Clock } from 'lucide-react';

interface ImpactPreviewProps {
    summary: ImpactSummary;
    className?: string;
}

export const ImpactPreview: React.FC<ImpactPreviewProps> = ({ summary, className = '' }) => {
    const {
        beforeBalance,
        afterBalance,
        beforeRunway,
        afterRunway,
        budgetImpact,
        risks
    } = summary;

    const runwayChange = afterRunway - beforeRunway;
    const isRunwayDecreasing = runwayChange < 0;

    // Format currency
    const formatETB = (amount: number) => {
        return new Intl.NumberFormat('en-ET', {
            style: 'currency',
            currency: 'ETB',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className={`space-y-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/10 shadow-sm animate-fade-in ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Impact Preview</h4>
                <div className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                    Simulation
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Balance Impact */}
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-zinc-500">Projected Balance</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            {formatETB(afterBalance)}
                        </span>
                        <span className={`text-[10px] font-bold ${afterBalance >= beforeBalance ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {afterBalance >= beforeBalance ? '+' : ''}{formatETB(afterBalance - beforeBalance)}
                        </span>
                    </div>
                </div>

                {/* Runway Impact */}
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-zinc-500">Cash Runway</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            {afterRunway === Infinity ? '∞' : `${afterRunway} days`}
                        </span>
                        {beforeRunway !== Infinity && afterRunway !== Infinity && runwayChange !== 0 && (
                            <span className={`text-[10px] font-bold ${runwayChange > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {runwayChange > 0 ? '↑' : '↓'}{Math.abs(runwayChange)}d
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget Impact */}
            {budgetImpact && (
                <div className="pt-3 border-t border-black/[0.03] dark:border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-medium text-zinc-500">{budgetImpact.category} Budget</p>
                        <p className="text-[10px] font-bold text-zinc-900 dark:text-white">
                            {Math.round((budgetImpact.afterSpent / budgetImpact.allocated) * 100)}%
                        </p>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${budgetImpact.afterSpent > budgetImpact.allocated
                                    ? 'bg-rose-500'
                                    : budgetImpact.afterSpent > budgetImpact.allocated * 0.8
                                        ? 'bg-amber-500'
                                        : 'bg-blue-500'
                                }`}
                            style={{ width: `${Math.min((budgetImpact.afterSpent / budgetImpact.allocated) * 100, 100)}%` }}
                        />
                    </div>
                    {budgetImpact.afterSpent > budgetImpact.allocated && (
                        <p className="text-[9px] font-bold text-rose-500 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Over budget by {formatETB(budgetImpact.afterSpent - budgetImpact.allocated)}
                        </p>
                    )}
                </div>
            )}

            {/* Risks */}
            {risks.length > 0 && (
                <div className="pt-3 border-t border-black/[0.03] dark:border-white/10 space-y-2">
                    {risks.map((risk, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{risk.title}</p>
                                <p className="text-[9px] text-rose-500/80 leading-tight">{risk.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!risks.length && !budgetImpact?.afterSpent && (
                <div className="pt-3 border-t border-black/[0.03] dark:border-white/10">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic flex items-center gap-1.5">
                        <Info size={12} />
                        No critical risks detected for this transaction.
                    </p>
                </div>
            )}
        </div>
    );
};
