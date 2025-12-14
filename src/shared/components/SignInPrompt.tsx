import React from 'react';
import { Icons } from '@/shared/components/Icons';

export const SignInPrompt: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-theme-card flex items-center justify-center mb-6 shadow-lg border border-theme">
                <Icons.User size={32} className="text-theme-secondary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">Sign In Required</h3>
            <p className="text-theme-secondary text-sm mb-8 max-w-xs mx-auto">
                Please sign in to view your transactions and manage your budget.
            </p>
            <a
                href="/auth/login"
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
                <Icons.LogOut size={18} className="rotate-180" /> Sign In
            </a>
        </div>
    );
};
