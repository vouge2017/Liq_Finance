import React from 'react';
import { useTranslation } from 'react-i18next';

interface EmptyStateCardProps {
    onAddGoal: () => void;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ onAddGoal }) => {
    const { t } = useTranslation();

    return (
        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-800 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Icon with Animation */}
                <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full border-2 border-cyan-500/30">
                    <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>

                {/* Headline */}
                <h3 className="text-white text-2xl font-bold mb-3">{t('goals.startJourney')}</h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
                    {t('goals.setFinancialGoals')}
                </p>

                {/* Amharic Text */}
                <p className="text-cyan-400/70 text-xs mb-8" style={{ fontFamily: 'Nyala, sans-serif' }}>
                    "ህልሜን የማግኘት ጊዜ"
                </p>

                {/* CTA Button */}
                <button
                    onClick={onAddGoal}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-base shadow-lg shadow-cyan-500/25 active:scale-95 transition-transform hover:shadow-cyan-500/40"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('goals.createPersonalGoal')}
                </button>
            </div>
        </div>
    );
};

export default EmptyStateCard;
