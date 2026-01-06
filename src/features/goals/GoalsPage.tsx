import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { EmptyState } from '@/shared/components/EmptyState';
import { SavingsGoal, Iqub, Iddir } from '@/types';
import { HorizontalScroll } from '@/shared/components/HorizontalScroll';
import { GoalVisual } from './components/GoalVisual';
import { CelebrationOverlay } from '@/shared/components/CelebrationOverlay';

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
        addIqub,
        updateIqub,
        deleteSavingsGoal,
        deleteIqub,
        markIqubPaid,
        markIqubWon,
        addIddir,
        updateIddir,
        deleteIddir,
        markIddirPaid,
        activeProfile,
        navigationState,
        clearNavigation,
        setActiveTab: setAppActiveTab
    } = useAppContext();

    const { savingsGoals, iqubs, iddirs, accounts, transactions } = state;

    const [activeTab, setActiveTab] = useState<'personal' | 'iqub' | 'iddir'>('personal');

    // Modals
    const [contributionModal, setContributionModal] = useState<string | null>(null); // goal ID
    const [contributionAccount, setContributionAccount] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');

    const [showPayIqubModal, setShowPayIqubModal] = useState<Iqub | null>(null);
    const [iqubPayAccount, setIqubPayAccount] = useState('');

    // Celebration
    const [showCelebration, setShowCelebration] = useState(false);
    const [showGoalSuccess, setShowGoalSuccess] = useState(false);

    // Add/Edit Goal State
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [newGoalIcon, setNewGoalIcon] = useState('car');
    const [newGoalColor, setNewGoalColor] = useState('cyan');
    const [newGoalAccount, setNewGoalAccount] = useState('');
    const [newGoalRecurringAmount, setNewGoalRecurringAmount] = useState('');
    const [newGoalRecurringFreq, setNewGoalRecurringFreq] = useState<'daily' | 'weekly' | 'monthly' | ''>('');
    const [goalErrors, setGoalErrors] = useState({ title: false, target: false });

    // Detail Modal State
    const [selectedGoalDetail, setSelectedGoalDetail] = useState<SavingsGoal | null>(null);
    const [selectedIqubDetail, setSelectedIqubDetail] = useState<Iqub | null>(null);

    // Add/Edit Iqub State
    const [showAddIqub, setShowAddIqub] = useState(false);
    const [editingIqub, setEditingIqub] = useState<Iqub | null>(null);
    const [newIqubTitle, setNewIqubTitle] = useState('');
    const [newIqubPurpose, setNewIqubPurpose] = useState('');
    const [newIqubAmount, setNewIqubAmount] = useState('');
    const [newIqubMembers, setNewIqubMembers] = useState('');
    const [newIqubStartDate, setNewIqubStartDate] = useState('');
    const [newIqubFreq, setNewIqubFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [iqubErrors, setIqubErrors] = useState({ title: false, amount: false, members: false });

    // Add/Edit Iddir State
    const [showAddIddir, setShowAddIddir] = useState(false);
    const [editingIddir, setEditingIddir] = useState<Iddir | null>(null);
    const [newIddirName, setNewIddirName] = useState('');
    const [newIddirFee, setNewIddirFee] = useState('');
    const [newIddirDate, setNewIddirDate] = useState('1');
    const [newIddirRemind, setNewIddirRemind] = useState(false);
    const [newIddirDays, setNewIddirDays] = useState('3');
    const [iddirErrors, setIddirErrors] = useState({ name: false, fee: false });

    // Menus
    const [showMenuId, setShowMenuId] = useState<string | null>(null);

    // Deep Linking Effect
    useEffect(() => {
        if (navigationState.type === 'goal' && navigationState.targetId) {
            const goal = savingsGoals.find(g => g.id === navigationState.targetId);
            if (goal) {
                setActiveTab('personal');
                setSelectedGoalDetail(goal);
            }
            clearNavigation();
        }
    }, [navigationState, savingsGoals, clearNavigation]);

    // --- Helpers ---

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''));

    const getDaysLeft = (dateStr?: string) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days > 0 ? days : 0;
    };

    const handleContribute = () => {
        if (contributionModal && contributionAmount && contributionAccount) {
            contributeToGoal(contributionModal, getRawNumber(contributionAmount), contributionAccount);
            setContributionModal(null);
            setContributionAmount('');
            setContributionAccount('');
        }
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
        setGoalErrors({ title: false, target: false });
    };

    const handleSaveGoal = () => {
        const hasTitle = !!newGoalTitle.trim();
        const hasTarget = !!newGoalTarget && getRawNumber(newGoalTarget) > 0;

        if (!hasTitle || !hasTarget) {
            setGoalErrors({ title: !hasTitle, target: !hasTarget });
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
            setShowAddGoal(false);
            resetGoalForm();
        } else {
            addSavingsGoal(goalData);
            setShowAddGoal(false);
            setShowGoalSuccess(true);
            resetGoalForm();
        }
    };

    const openAddIqubModal = (iqub?: Iqub) => {
        if (iqub) {
            setEditingIqub(iqub);
            setNewIqubTitle(iqub.title);
            setNewIqubPurpose(iqub.purpose);
            setNewIqubAmount(iqub.amount.toLocaleString());
            setNewIqubMembers(iqub.members.toString());
            setNewIqubStartDate(iqub.startDate ? iqub.startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
            setNewIqubFreq(iqub.cycle);
        } else {
            setEditingIqub(null);
            resetIqubForm();
            setNewIqubStartDate(new Date().toISOString().split('T')[0]);
        }
        setShowAddIqub(true);
        setIqubErrors({ title: false, amount: false, members: false });
    };

    const handleSaveIqub = () => {
        const hasTitle = !!newIqubTitle.trim();
        const hasAmount = !!newIqubAmount && getRawNumber(newIqubAmount) > 0;
        const hasMembers = !!newIqubMembers && parseInt(newIqubMembers) > 0;

        if (!hasTitle || !hasAmount || !hasMembers) {
            setIqubErrors({ title: !hasTitle, amount: !hasAmount, members: !hasMembers });
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        const members = parseInt(newIqubMembers);
        const amount = getRawNumber(newIqubAmount);

        const iqubData: Iqub = {
            id: editingIqub ? editingIqub.id : Date.now().toString(),
            title: newIqubTitle,
            purpose: newIqubPurpose,
            amount: amount,
            cycle: newIqubFreq,
            members: members,
            currentRound: editingIqub ? editingIqub.currentRound : 1,
            paidRounds: editingIqub ? editingIqub.paidRounds : 0,
            startDate: newIqubStartDate,
            payoutAmount: amount * members,
            status: editingIqub ? editingIqub.status : 'active',
            nextPaymentDate: editingIqub ? editingIqub.nextPaymentDate : newIqubStartDate,
            hasWon: editingIqub ? editingIqub.hasWon : false,
            profile: activeProfile === 'All' ? 'Personal' : activeProfile
        };

        if (editingIqub) {
            updateIqub(iqubData);
            setShowAddIqub(false);
            resetIqubForm();
        } else {
            addIqub(iqubData);
            setShowAddIqub(false);
            setShowGoalSuccess(true);
            resetIqubForm();
        }
    };

    const handleIqubPayment = () => {
        if (showPayIqubModal && iqubPayAccount) {
            markIqubPaid(showPayIqubModal.id, iqubPayAccount);
            setShowPayIqubModal(null);
            setIqubPayAccount('');
        }
    };

    const handleClaimWin = (iqub: Iqub) => {
        const accountId = accounts[0]?.id;
        if (accountId) {
            const roundNum = iqub.paidRounds;
            markIqubWon(iqub.id, accountId, roundNum);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 4000);
        }
    };

    const openAddIddirModal = (iddir?: Iddir) => {
        if (iddir) {
            setEditingIddir(iddir);
            setNewIddirName(iddir.name);
            setNewIddirFee(iddir.monthlyContribution.toLocaleString());
            setNewIddirDate(iddir.paymentDate.toString());
            setNewIddirRemind(iddir.reminderEnabled || false);
            setNewIddirDays(iddir.reminderDaysBefore?.toString() || '3');
        } else {
            setEditingIddir(null);
            setNewIddirName('');
            setNewIddirFee('');
            setNewIddirDate('1');
            setNewIddirRemind(false);
            setNewIddirDays('3');
        }
        setShowAddIddir(true);
        setIddirErrors({ name: false, fee: false });
    };

    const handleSaveIddir = () => {
        const hasName = !!newIddirName.trim();
        const hasFee = !!newIddirFee && getRawNumber(newIddirFee) > 0;

        if (!hasName || !hasFee) {
            setIddirErrors({ name: !hasName, fee: !hasFee });
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        const iddirData: Iddir = {
            id: editingIddir ? editingIddir.id : Date.now().toString(),
            name: newIddirName,
            monthlyContribution: getRawNumber(newIddirFee),
            paymentDate: parseInt(newIddirDate),
            status: editingIddir ? editingIddir.status : 'active',
            lastPaidDate: editingIddir ? editingIddir.lastPaidDate : undefined,
            profile: activeProfile === 'All' ? 'Personal' : activeProfile,
            reminderEnabled: newIddirRemind,
            reminderDaysBefore: parseInt(newIddirDays)
        };

        if (editingIddir) {
            updateIddir(iddirData);
        } else {
            addIddir(iddirData);
        }
        setShowAddIddir(false);
        setNewIddirName('');
        setNewIddirFee('');
        setNewIddirRemind(false);
        setNewIddirDays('3');
    };

    const deleteItem = (type: 'goal' | 'iqub' | 'iddir', id: string) => {
        if (type === 'goal') {
            deleteSavingsGoal(id);
            setSelectedGoalDetail(null);
        }
        else if (type === 'iqub') {
            deleteIqub(id);
            setSelectedIqubDetail(null);
        } else {
            deleteIddir(id);
        }
        setShowMenuId(null);
    }

    const resetGoalForm = () => {
        setNewGoalTitle(''); setNewGoalTarget(''); setNewGoalDeadline(''); setNewGoalAccount(''); setNewGoalIcon('car');
        setNewGoalRecurringAmount(''); setNewGoalRecurringFreq('');
        setGoalErrors({ title: false, target: false });
    };
    const resetIqubForm = () => {
        setNewIqubTitle(''); setNewIqubAmount(''); setNewIqubMembers(''); setNewIqubPurpose(''); setNewIqubStartDate(''); setIqubErrors({ title: false, amount: false, members: false });
    };

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            <CelebrationOverlay
                isVisible={showCelebration}
                onClose={() => setShowCelebration(false)}
                title="Congratulations!"
                message="You've successfully claimed your Iqub win. The funds are now available in your account."
            />

            {/* Header */}
            <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
                <button
                    onClick={() => setAppActiveTab('dashboard')}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-white/20 dark:border-white/5 active:scale-90 transition-all"
                >
                    <Icons.ChevronLeft size={20} className="text-gray-900 dark:text-white" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('goals.title')}</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">የፋይናንስ ግቦች</p>
                </div>
                <button
                    onClick={() => {
                        if (activeTab === 'personal') openAddGoalModal();
                        else if (activeTab === 'iqub') openAddIqubModal();
                        else openAddIddirModal();
                    }}
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow active:scale-90 transition-all text-white"
                >
                    <Icons.Plus size={24} />
                </button>
            </header>

            {/* Tab Switcher */}
            <div className="px-5 mb-6">
                <div className="bg-white dark:bg-white/5 p-1.5 rounded-full flex relative border border-white/20 dark:border-white/5 shadow-sm">
                    {(['personal', 'iqub', 'iddir'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-full text-xs font-bold transition-all relative z-10 ${activeTab === tab ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {tab === 'personal' ? 'Personal' : tab === 'iqub' ? 'Iqub' : 'Iddir'}
                        </button>
                    ))}
                    <div
                        className="absolute top-1.5 bottom-1.5 rounded-full bg-primary shadow-glow transition-all duration-300 ease-out"
                        style={{
                            left: activeTab === 'personal' ? '6px' : activeTab === 'iqub' ? '33.33%' : '66.66%',
                            width: 'calc(33.33% - 4px)'
                        }}
                    />
                </div>
            </div>

            <div className="px-5 space-y-6">
                {/* --- PERSONAL GOALS VIEW --- */}
                {activeTab === 'personal' && (
                    <div className="space-y-4 animate-fade-in">
                        {savingsGoals.map(goal => {
                            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            const isComplete = percentage >= 100;
                            const iconObj = GOAL_ICONS.find(i => i.id === goal.icon) || GOAL_ICONS[0];

                            return (
                                <div
                                    key={goal.id}
                                    onClick={() => setSelectedGoalDetail(goal)}
                                    className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden shadow-sm active:scale-[0.98] transition-all"
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
                                            onClick={(e) => { e.stopPropagation(); setContributionModal(goal.id); setContributionAccount(goal.defaultAccountId || accounts[0]?.id || ''); }}
                                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/5"
                                        >
                                            Add Funds
                                        </button>
                                    )}
                                </div>
                            )
                        })}

                        {savingsGoals.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Icons.Goals size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Start saving for your dreams today. Create your first goal now.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- IQUB VIEW --- */}
                {activeTab === 'iqub' && (
                    <div className="space-y-6 animate-fade-in">
                        {iqubs.map(iqub => (
                            <div
                                key={iqub.id}
                                className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden shadow-sm active:scale-[0.98] transition-all"
                                onClick={() => setSelectedIqubDetail(iqub)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="font-black text-gray-900 dark:text-white text-xl mb-1">{iqub.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                            {iqub.cycle} Cycle • {iqub.members} Members
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Active
                                    </div>
                                </div>

                                {/* Cycle Visualization */}
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                                    {Array.from({ length: iqub.members }).map((_, idx) => {
                                        const roundNum = idx + 1;
                                        const isPaid = roundNum <= iqub.paidRounds;
                                        const isWinRound = iqub.winningRound === roundNum;
                                        const isCurrent = roundNum === iqub.paidRounds + 1;

                                        return (
                                            <div
                                                key={idx}
                                                className={`w-10 h-14 rounded-xl shrink-0 flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${isWinRound ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/30 scale-110 z-10' :
                                                    isPaid ? 'bg-emerald-500 border-emerald-400 text-white' :
                                                        isCurrent ? 'bg-white dark:bg-white/10 border-indigo-500 text-indigo-500 ring-2 ring-indigo-500/20' :
                                                            'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-300'
                                                    }`}
                                            >
                                                <span className="mb-1">R{roundNum}</span>
                                                {isWinRound ? <Icons.Trophy size={12} /> : isPaid ? <Icons.Check size={12} /> : <div className="w-2 h-2 rounded-full bg-current opacity-20" />}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowPayIqubModal(iqub); setIqubPayAccount(accounts[0]?.id || ''); }}
                                        disabled={iqub.paidRounds >= iqub.members}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-[1.5rem] transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
                                    >
                                        Pay {isPrivacyMode ? '••••' : iqub.amount}
                                    </button>

                                    {!iqub.hasWon && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleClaimWin(iqub); }}
                                            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-[1.5rem] shadow-lg shadow-yellow-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                        >
                                            <Icons.Trophy size={14} /> I Won!
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- IDDIR VIEW --- */}
                {activeTab === 'iddir' && (
                    <div className="space-y-6 animate-fade-in">
                        {iddirs.map(iddir => {
                            const isPaidThisMonth = iddir.lastPaidDate && new Date(iddir.lastPaidDate).getMonth() === new Date().getMonth();

                            return (
                                <div
                                    key={iddir.id}
                                    className="bg-white dark:bg-white/5 border border-white/20 dark:border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden shadow-sm"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <Icons.Heart size={32} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white text-xl">{iddir.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                                Monthly Due: Day {iddir.paymentDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end bg-gray-50 dark:bg-white/5 p-5 rounded-[2rem]">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Contribution</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{iddir.monthlyContribution.toLocaleString()} <span className="text-sm text-gray-400">ETB</span></p>
                                        </div>
                                        {isPaidThisMonth ? (
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <Icons.Check size={20} />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => markIddirPaid(iddir.id, accounts[0]?.id || '')}
                                                className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Goal Modal */}
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
                                    className={`w-full bg-gray-50 dark:bg-white/5 border ${goalErrors.title ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                            className={`w-full bg-gray-50 dark:bg-white/5 border ${goalErrors.target ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all pr-12`}
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
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Recurring Contribution Section */}
                            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Icons.Recurring size={20} />
                                    </div>
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
                                            className="w-full bg-white dark:bg-white/5 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Frequency</label>
                                        <select
                                            value={newGoalRecurringFreq}
                                            onChange={(e) => setNewGoalRecurringFreq(e.target.value as any)}
                                            className="w-full bg-white dark:bg-white/5 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none appearance-none"
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
                                            key={item.id}
                                            onClick={() => {
                                                setNewGoalIcon(item.id);
                                                setNewGoalColor(item.color.split(' ')[1].replace('to-', '').split('-')[0]); // Extract color name
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
                                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-glow active:scale-[0.98] transition-all mt-4"
                            >
                                {editingGoal ? 'Update Goal' : 'Create Goal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Iqub Modal */}
            {showAddIqub && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddIqub(false)} />
                    <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingIqub ? 'Edit Iqub' : 'New Iqub'}
                            </h3>
                            <button onClick={() => setShowAddIqub(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                <Icons.Close size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Iqub Name</label>
                                <input
                                    type="text"
                                    value={newIqubTitle}
                                    onChange={(e) => setNewIqubTitle(e.target.value)}
                                    placeholder="e.g. Family Iqub, Office Iqub"
                                    className={`w-full bg-gray-50 dark:bg-white/5 border ${iqubErrors.title ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Round Amount</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newIqubAmount}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/,/g, '');
                                                if (/^\d*$/.test(val)) setNewIqubAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                                            }}
                                            placeholder="0"
                                            className={`w-full bg-gray-50 dark:bg-white/5 border ${iqubErrors.amount ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all pr-12`}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ETB</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Members</label>
                                    <input
                                        type="number"
                                        value={newIqubMembers}
                                        onChange={(e) => setNewIqubMembers(e.target.value)}
                                        placeholder="e.g. 12"
                                        className={`w-full bg-gray-50 dark:bg-white/5 border ${iqubErrors.members ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Frequency</label>
                                    <select
                                        value={newIqubFreq}
                                        onChange={(e) => setNewIqubFreq(e.target.value as any)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none appearance-none"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={newIqubStartDate}
                                        onChange={(e) => setNewIqubStartDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveIqub}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all mt-4"
                            >
                                {editingIqub ? 'Update Iqub' : 'Create Iqub'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Iddir Modal */}
            {showAddIddir && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddIddir(false)} />
                    <div className="bg-white dark:bg-[#101622] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-slide-up relative z-10 shadow-2xl border border-white/20 dark:border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingIddir ? 'Edit Iddir' : 'New Iddir'}
                            </h3>
                            <button onClick={() => setShowAddIddir(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                <Icons.Close size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Iddir Name</label>
                                <input
                                    type="text"
                                    value={newIddirName}
                                    onChange={(e) => setNewIddirName(e.target.value)}
                                    placeholder="e.g. Neighborhood Iddir"
                                    className={`w-full bg-gray-50 dark:bg-white/5 border ${iddirErrors.name ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Monthly Fee</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newIddirFee}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/,/g, '');
                                                if (/^\d*$/.test(val)) setNewIddirFee(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                                            }}
                                            placeholder="0"
                                            className={`w-full bg-gray-50 dark:bg-white/5 border ${iddirErrors.fee ? 'border-rose-500' : 'border-transparent'} rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 ring-primary/20 transition-all pr-12`}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ETB</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Payment Day</label>
                                    <select
                                        value={newIddirDate}
                                        onChange={(e) => setNewIddirDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold outline-none appearance-none"
                                    >
                                        {Array.from({ length: 31 }).map((_, i) => (
                                            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Enable Reminders</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Get notified before due date</p>
                                </div>
                                <button
                                    onClick={() => setNewIddirRemind(!newIddirRemind)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${newIddirRemind ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newIddirRemind ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <button
                                onClick={handleSaveIddir}
                                className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-lg shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all mt-4"
                            >
                                {editingIddir ? 'Update Iddir' : 'Create Iddir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showGoalSuccess && (
                <div className="fixed inset-0 modal-overlay z-[110] flex items-center justify-center p-4" onClick={() => setShowGoalSuccess(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] p-8 animate-dialog text-center shadow-2xl relative overflow-hidden border border-black/[0.05] dark:border-white/[0.05]" onClick={e => e.stopPropagation()}>
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400 animate-bounce">
                            <Icons.Trophy size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Goal Set!</h3>
                        <p className="text-gray-500 text-sm mb-8">You've taken the first step. Stay consistent to reach it.</p>
                        <button
                            onClick={() => setShowGoalSuccess(false)}
                            className="w-full py-4 bg-cyan-500 text-black font-bold rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
                        >
                            Awesome
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
