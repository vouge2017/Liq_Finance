import React from 'react';
import { Icons } from '@/shared/components/Icons';

interface GoalVisualProps {
    percentage: number;
    color: string;
    icon: any; // Lucide Icon
    isComplete: boolean;
}

export const GoalVisual: React.FC<GoalVisualProps> = ({ percentage, color, icon: Icon, isComplete }) => {
    // Map tailwind color names to hex/rgba for inline styles if needed, 
    // or just use the passed color class for the fill.
    // We'll assume 'color' is like 'cyan', 'rose', etc. and map to tailwind classes.

    const getColorClass = (c: string) => {
        const map: Record<string, string> = {
            cyan: 'bg-cyan-400',
            rose: 'bg-rose-500',
            purple: 'bg-purple-500',
            yellow: 'bg-yellow-400',
            emerald: 'bg-emerald-500',
            blue: 'bg-blue-500',
            orange: 'bg-orange-500',
            pink: 'bg-pink-500',
            slate: 'bg-slate-500',
        };
        return map[c] || 'bg-cyan-400';
    };

    const fillClass = isComplete ? 'bg-emerald-500' : getColorClass(color);

    return (
        <div className="relative w-full h-32 flex items-center justify-center mb-4">
            {/* The Jar Container */}
            <div className="relative w-24 h-28 border-4 border-white/20 rounded-b-3xl rounded-t-lg bg-white/5 backdrop-blur-sm overflow-hidden">
                {/* Lid */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-2 bg-white/30 rounded-full"></div>

                {/* Liquid Fill */}
                <div
                    className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out ${fillClass} opacity-80`}
                    style={{ height: `${Math.max(5, percentage)}%` }}
                >
                    {/* Bubbles / Texture */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-white/20 animate-pulse"></div>
                </div>

                {/* Floating Icon */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${isComplete ? 'scale-125 text-white drop-shadow-lg' : 'text-white/50 scale-100'}`}>
                    <Icon size={32} />
                </div>

                {/* Glass Reflection */}
                <div className="absolute top-4 right-2 w-2 h-16 bg-white/10 rounded-full blur-[1px]"></div>
            </div>

            {/* Percentage Badge (Floating) */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-theme-card border border-theme px-3 py-1 rounded-xl shadow-lg">
                <span className="text-lg font-bold text-theme-primary">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};
