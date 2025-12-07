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
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            {icon && (
                <div className="w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-4 text-gray-500">
                    {icon}
                </div>
            )}

            <h3 className="text-lg font-bold text-gray-300 mb-2">{title}</h3>

            {description && (
                <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold rounded-xl hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                    {action.icon}
                    {action.label}
                </button>
            )}
        </div>
    );
};
