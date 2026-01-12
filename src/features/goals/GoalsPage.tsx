import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { SavingsGoal } from '@/types';
import { CelebrationOverlay } from '@/shared/components/celebrationOverlay';

const GOAL_ICONS = [
    { id: 'car', icon: Icons.Car, color: 'from-orange-400 to-red-500', label: 'Vehicle' },
    { id: 'house', icon: Icons.Home, color: 'from-blue-400 to-indigo-500', label: 'Housing' },
    { id: 'emergency', icon: Icons.Emergency, color: 'from-emerald-400 to-teal-500', label: 'Safety' },
    { id: 'travel', icon: Icons.Plane, color: 'from-sky-400 to-cyan-500', label: 'Travel' },
    { id: 'education', icon: Icons.Education, color: 'from-purple-400 to-fuchsia-500', label: 'Education' },
    { id: 'wedding', icon: Icons.Ring, color: 'from-pink-400 to-rose-500', label: 'Wedding' },
    { id: 'tech', icon: Icons.Laptop, color: 'from-slate-700 to-slate-900', label: 'Tech' },
    { id: 'business', icon: Icons.Briefcase, color: 'from-amber-400 to-yellow-500', label: 'Business' },
    { id: 'baby', icon: Icons.Baby, color: 'from-rose-300 to-pink-400', label: 'Family' },
];

export const GoalsPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        state,
        isPrivacyMode,
        contributeToGoal,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        activeProfile,
        navigationState,
        clearNavigation
    } = useAppContext();

    const { savingsGoals, accounts } = state;

    const [showAddGoal, setShowAddGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [newGoalIcon, setNewGoalIcon] = useState('car');
    const [newGoalAccount, setNewGoalAccount] = useState('');
    const [newGoalRecurringAmount, setNewGoalRecurringAmount] = useState('');
    const [newGoalRecurringFreq, setNewGoalRecurringFreq] = useState<'daily' | 'weekly' | 'monthly' | ''>('');
    const [showCelebration, setShowCelebration] = useState(false);
    const [selectedGoalDetail, setSelectedGoalDetail] = useState<SavingsGoal | null>(null);
    const [showMenuId, setShowMenuId] = useState<string | null>(null);

    useEffect(() => {
        if (navigationState.type === 'goal' && navigationState.targetId) {
            const goal = savingsGoals.find(g => g.id === navigationState.targetId);
            if (goal) {
                setSelectedGoalDetail(goal);
            }
            clearNavigation();
        }
    }, [navigationState, savingsGoals, clearNavigation]);

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''));

    const getDaysLeft = (dateStr?: string) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days > 0 ? days : 0;
    };

    const openAddGoalModal = (goal?: SavingsGoal) => {
        if (goal) {
            setEditingGoal(goal);
            setNewGoalTitle(goal.title);
            setNewGoalTarget(goal.targetAmount.toLocaleString());
            setNewGoalDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
            setNewGoalIcon(goal.icon);
            setNewGoalColor(goal.color);
            setNewGoalAccount(goal.defaultAccountId || accounts[0]?.id || '');
            setNewGoalRecurringAmount(goal.recurringAmount ? goal.recurringAmount.toLocaleString() : '');
            setNewGoalRecurringFreq(goal.recurringFrequency || '');
        } else {
            setEditingGoal(null);
            resetGoalForm();
            setNewGoalAccount(accounts[0]?.id || '');
        }
        setShowAddGoal(true);
    };

    const handleSaveGoal = () => {
        const hasTitle = !!newGoalTitle.trim();
        const hasTarget = !!newGoalTarget && getRawNumber(newGoalTarget) > 0;

        if (!hasTitle || !hasTarget) {
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        const goalData: SavingsGoal = {
            id: editingGoal ? editingGoal.id : Date.now().toString(),
            title: newGoalTitle,
            targetAmount: getRawNumber(newGoalTarget),
            currentAmount: editingGoal ? editingGoal.currentAmount : 0,
            icon: newGoalIcon,
            color: newGoalColor,
            roundUpEnabled: editingGoal ? editingGoal.roundUpEnabled : false,
            profile: activeProfile === 'All' ? 'Personal' : activeProfile,
            deadline: newGoalDeadline,
            defaultAccountId: newGoalAccount,
            recurringAmount: newGoalRecurringAmount ? getRawNumber(newGoalRecurringAmount) : undefined,
            recurringFrequency: newGoalRecurringFreq || undefined
        };

        if (editingGoal) {
            updateSavingsGoal(goalData);
        } else {
            addSavingsGoal(goalData);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
        }
        setShowAddGoal(false);
        resetGoalForm();
    };

    const resetGoalForm = () => {
        setNewGoalTitle('');
        setNewGoalTarget('');
        setNewGoalDeadline('');
        setNewGoalAccount('');
        setNewGoalIcon('car');
        setNewGoalRecurringAmount('');
        setNewGoalRecurringFreq('');
    };

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            <CelebrationOverlay
                isVisible={showCelebration}
                onClose={() => setShowCelebration(false)}
                title="Congratulations!"
                message="You've successfully saved toward your goal!"
            />

            <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
                <button
                    onClick={() => window.history.back()}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-white/20 dark:border-white/5 active:scale-90 transition-all"
                >
                    <Icons.ChevronLeft size={20} className="text-gray-900 dark:text-white" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('goals.title')}</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">የፋይናንስ</p>
                </div>
                <button
                    onClick={() => openAddGoalModal()}
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow active:scale-90 transition-all text-white"
                >
                    <Icons.Plus size={24} />
                </button>
            </header>

            <div className="px-5 space-y-4">
                {savingsGoals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Icons.Goals size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Start saving for your dreams today. Create your first goal now.</p>
                    </div>
                ) : (
                    savingsGoals.map(goal => {
                        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const isComplete = percentage >= 100;
                        const iconObj = GOAL_ICONS.find(i => i.id === goal.icon) || GOAL_ICONS[0];

                        return (
                            <div
                                key={goal.id}
                                className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden shadow-sm"
                            >
                                {isComplete && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>}

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconObj.color} shadow-lg text-white`}>
                                            <iconObj.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-1">{goal.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                                                    {isComplete ? 'Completed' : 'In Progress'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowMenuId(showMenuId === goal.id ? null : goal.id); }}
                                        className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <Icons.MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="mb-6 relative z-10">
                                    <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                                        <span>{Math.round(percentage)}%</span>
                                        <span>{isPrivacyMode ? '••••' : goal.targetAmount.toLocaleString()} ETB</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${iconObj.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {!isComplete && (
                                    <button
                                        onClick={() => {
                                            setShowMenuId(null);
                                            setSelectedGoalDetail(goal);
                                        }}
                                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/5"
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {showAddGoal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddGoal(false)} />
                    <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingGoal ? 'Edit Goal' : 'New Goal'}
                            </h3>
                            <button onClick={() => setShowAddGoal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                <Icons.Close size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Goal Name</label>
                                <input
                                    type="text"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    placeholder="e.g. New Car, Emergency Fund"
                                    className="w-full bg-gray-50 dark:bg-white/5 border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                />
                            </div>

                            <div className="grid grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Target Amount</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newGoalTarget}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/,/g, '');
                                                if (/^\d*$/.test(val)) setNewGoalTarget(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                                            }}
                                            placeholder="0"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all pr-12"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ETB</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={newGoalDeadline}
                                        onChange={(e) => setNewGoalDeadline(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icons.RefreshCw size={20} />
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white">Auto-Save</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Recurring Contribution</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Amount</label>
                                        <input
                                            type="text"
                                            value={newGoalRecurringAmount}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/,/g, '');
                                                if (/^\d*$/.test(val)) setNewGoalRecurringAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                                            }}
                                            placeholder="Optional"
                                            className="w-full bg-white dark:bg-white/5 border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Frequency</label>
                                        <select
                                            value={newGoalRecurringFreq}
                                            onChange={(e) => setNewGoalRecurringFreq(e.target.value as any)}
                                            className="w-full bg-white dark:bg-white/5 border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none appearance-none"
                                        >
                                            <option value="">None</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Select Icon</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {GOAL_ICONS.map((item) => (
                                        <button
                                            onClick={() => {
                                                setNewGoalIcon(item.id);
                                                setNewGoalColor(item.color.split(' ')[1].replace('to-', '').split('-')[0]);
                                            }}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${newGoalIcon === item.id ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-110` : 'bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                        >
                                            <item.icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveGoal}
                                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-glow active:scale-[0.98] transition-all"
                            >
                                {editingGoal ? 'Update Goal' : 'Create Goal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedGoalDetail && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGoalDetail(null)} />
                    <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <button onClick={() => setSelectedGoalDetail(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                            <Icons.Close size={20} />
                        </button>

                        <div className="mt-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedGoalDetail(null);
                                        openAddGoalModal(selectedGoalDetail);
                                    }}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    Edit Goal
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this goal?')) {
                                            deleteSavingsGoal(selectedGoalDetail.id);
                                            setSelectedGoalDetail(null);
                                        }
                                    }}
                                    className="flex-1 py-4 bg-rose-500/10 text-rose-500 font-bold rounded-xl hover:bg-rose-500/20 active:scale-95 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalsPage;
