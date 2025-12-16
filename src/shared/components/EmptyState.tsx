import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
            <div className="relative mb-6 group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

                {/* Icon Container */}
                <div className="relative w-24 h-24 rounded-3xl bg-theme-card border border-theme flex items-center justify-center text-theme-secondary shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    {icon ? (
                        <div className="scale-150 opacity-80 group-hover:opacity-100 transition-opacity">
                            {icon}
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-theme-secondary/20"></div>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold text-theme-primary mb-3 tracking-tight">{title}</h3>

            {description && (
                <p className="text-sm text-theme-secondary max-w-xs mb-8 leading-relaxed opacity-80">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-2xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95 transform"
                >
                    {action.icon}
                    {action.label}
                </button>
            )}
        </div>
    );
};
