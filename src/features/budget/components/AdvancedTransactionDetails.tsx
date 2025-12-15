import React from 'react';
import { Icons } from "@/shared/components/Icons";

interface AdvancedTransactionDetailsProps {
    date: string;
    setDate: (val: string) => void;
    isRecurring: boolean;
    setIsRecurring: (val: boolean) => void;
}

export const AdvancedTransactionDetails: React.FC<AdvancedTransactionDetailsProps> = ({
    date,
    setDate,
    isRecurring,
    setIsRecurring
}) => {
    return (
        <div className="space-y-4 pt-4 border-t border-white/5 animate-slide-down">
            <div className="grid grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-theme-secondary ml-1">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50 appearance-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Icons.Calendar size={16} />
                        </div>
                    </div>
                </div>

                {/* Recurring Toggle */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-theme-secondary ml-1">Recurring?</label>
                    <button
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`w-full p-4 rounded-2xl border flex items-center justify-center gap-2 transition-all ${isRecurring
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                            : "bg-black/20 border-white/5 text-gray-400 hover:bg-white/5"
                            }`}
                    >
                        <Icons.Recurring size={18} className={isRecurring ? "animate-spin-slow" : ""} />
                        <span className="font-bold text-sm">{isRecurring ? "Yes, Repeat" : "No, One-time"}</span>
                    </button>
                </div>
            </div>

            {/* Future: Add Notes, Tags, Attachments here */}
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-theme-secondary">More advanced fields (Notes, Tags, Splits) coming soon.</p>
            </div>
        </div>
    );
};
