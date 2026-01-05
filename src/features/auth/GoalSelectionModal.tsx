import React from 'react';
import { useTranslation } from 'react-i18next';

interface GoalSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGoal: (goal: string) => void;
}

interface GoalOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

export const GoalSelectionModal: React.FC<GoalSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelectGoal
}) => {
    const { t } = useTranslation();

    const goalOptions: GoalOption[] = [
        {
            id: 'savings',
            title: 'Build Savings',
            description: 'Emergency fund & future',
            icon: '🏦',
            color: 'emerald'
        },
        {
            id: 'debt',
            title: 'Pay Off Debt',
            description: 'Become debt-free',
            icon: '💳',
            color: 'rose'
        },
        {
            id: 'spending',
            title: 'Track Spending',
            description: 'Know where money goes',
            icon: '📊',
            color: 'amber'
        },
        {
            id: 'iqub',
            title: 'Join/Track Iqub',
            description: 'Community savings',
            icon: '👥',
            color: 'cyan'
        },
        {
            id: 'investing',
            title: 'Start Investing',
            description: 'Grow your wealth',
            icon: '📈',
            color: 'purple'
        },
        {
            id: 'family',
            title: 'Family Budget',
            description: 'Household planning',
            icon: '🏠',
            color: 'blue'
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-6 z-50">
            {/* Logo/Branding */}
            <div className="mb-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-cyan-500/50">
                    <span className="text-white text-3xl font-bold">💰</span>
                </div>
                <h1 className="text-white text-2xl font-bold mb-2">{t('auth.goalSelection.title')}</h1>
                <p className="text-gray-400 text-sm">{t('auth.goalSelection.subtitle')}</p>
            </div>

            {/* Goal Cards Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                {goalOptions.map((goal) => (
                    <button
                        key={goal.id}
                        onClick={() => onSelectGoal(goal.id)}
                        className={`bg-gradient-to-br from-${goal.color}-500/20 to-${goal.color}-600/10 border-2 border-${goal.color}-500/30 rounded-2xl p-6 text-left active:scale-95 transition-transform hover:shadow-lg hover:shadow-${goal.color}-500/20`}
                    >
                        <div className={`w-12 h-12 bg-${goal.color}-500/20 rounded-xl flex items-center justify-center mb-4`}>
                            <span className="text-2xl">{goal.icon}</span>
                        </div>
                        <h3 className="text-white font-bold text-base mb-1">{t(`auth.goalSelection.goals.${goal.id}.title`)}</h3>
                        <p className="text-gray-400 text-xs">{t(`auth.goalSelection.goals.${goal.id}.description`)}</p>
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md space-y-3">
                <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl font-semibold text-base shadow-lg shadow-cyan-500/25 active:scale-98 transition-transform hover:shadow-cyan-500/40"
                >
                    {t('auth.goalSelection.continue')}
                </button>
                <button
                    onClick={onClose}
                    className="w-full text-gray-400 py-3 font-medium text-sm active:scale-98 transition-transform hover:text-gray-300"
                >
                    {t('auth.goalSelection.skip')}
                </button>
            </div>
        </div>
    );
};

export default GoalSelectionModal;