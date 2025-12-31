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
        <div className="space-y-4 pt-4 border-t border-black/[0.03] animate-slide-down">
            <div className="grid grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white border border-black/[0.03] shadow-sm rounded-2xl p-4 text-sm text-zinc-900 font-bold outline-none focus:border-blue-600/30 appearance-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                            <Icons.Calendar size={16} />
                        </div>
                    </div>
                </div>

                {/* Recurring Toggle */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Recurring?</label>
                    <button
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`w-full p-4 rounded-2xl border flex items-center justify-center gap-2 transition-all ${isRecurring
                            ? "bg-blue-50 border-blue-600/20 text-blue-600 shadow-sm"
                            : "bg-white border-black/[0.03] text-zinc-400 hover:bg-zinc-50 shadow-sm"
                            }`}
                    >
                        <Icons.Recurring size={18} className={isRecurring ? "animate-spin-slow" : ""} />
                        <span className="font-bold text-xs">{isRecurring ? "Yes, Repeat" : "No, One-time"}</span>
                    </button>
                </div>
            </div>

            {/* Future: Add Notes, Tags, Attachments here */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-black/[0.03] text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Advanced fields coming soon</p>
            </div>
        </div>
    );
};
