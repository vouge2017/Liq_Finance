import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';
import { EmptyState } from '@/shared/components/EmptyState';
import { SavingsGoal, Iqub, Account, Iddir } from '@/types';
import { HorizontalScroll } from '@/shared/components/HorizontalScroll';

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
        formatDate,
        navigationState,
        clearNavigation
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
    const [newGoalColor, setNewGoalColor] = useState('cyan'); // Can keep generic colors for progress bars
    const [newGoalAccount, setNewGoalAccount] = useState(''); // Default account
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
    const [newIddirDate, setNewIddirDate] = useState('1'); // Day of Month
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

    // Number Formatting
    const formatNumberInput = (value: string) => {
        const val = value.replace(/,/g, '');
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join('.');
        }
        return value;
    };

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''));

    const getGoalHistory = (goalId: string) => {
        return transactions.filter(t => t.goalId === goalId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
            // Ensure format is YYYY-MM-DD for date input
            setNewGoalDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
            setNewGoalIcon(goal.icon);
            setNewGoalColor(goal.color);
            setNewGoalAccount(goal.defaultAccountId || accounts[0]?.id || '');
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
            defaultAccountId: newGoalAccount
        };

        if (editingGoal) {
            updateSavingsGoal(goalData);
            setShowAddGoal(false);
            resetGoalForm();
        } else {
            addSavingsGoal(goalData);
            setShowAddGoal(false);
            setShowGoalSuccess(true); // Success Screen
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
            setShowGoalSuccess(true); // Success Screen
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
        const accountId = accounts[0]?.id; // Default to first for claim
        if (accountId) {
            // Lock winning round to current paid rounds
            const roundNum = iqub.paidRounds;
            markIqubWon(iqub.id, accountId, roundNum);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 4000);
        }
    };

    // --- IDDIR CRUD ---

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
        setNewGoalTitle(''); setNewGoalTarget(''); setNewGoalDeadline(''); setNewGoalAccount(''); setNewGoalIcon('car'); setGoalErrors({ title: false, target: false });
    };
    const resetIqubForm = () => {
        setNewIqubTitle(''); setNewIqubAmount(''); setNewIqubMembers(''); setNewIqubPurpose(''); setNewIqubStartDate(''); setIqubErrors({ title: false, amount: false, members: false });
    };

    // --- Calculations ---

    const getDaysLeft = (dateStr?: string) => {
        if (!dateStr) return null;
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days > 0 ? days : 0;
    };

    // Generate Smart Iqub Schedule
    const generateIqubSchedule = (iqub: Iqub) => {
        const dates = [];
        const start = new Date(iqub.startDate);
        for (let i = 0; i < iqub.members; i++) {
            const d = new Date(start);
            if (iqub.cycle === 'weekly') d.setDate(start.getDate() + (i * 7));
            else if (iqub.cycle === 'daily') d.setDate(start.getDate() + i);
            else d.setMonth(start.getMonth() + i);

            dates.push({
                round: i + 1,
                date: d.toISOString(),
                isMyTurn: iqub.myTurnDate && new Date(iqub.myTurnDate).toDateString() === d.toDateString(),
                isPast: d < new Date(),
                isPaid: (i + 1) <= iqub.paidRounds
            });
        }
        return dates;
    };

    // Smart Goal Insight
    const getGoalInsight = (goal: SavingsGoal) => {
        if (!goal.deadline) return "Keep saving!";
        const totalDays = (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 3600 * 24);
        const needed = goal.targetAmount - goal.currentAmount;
        if (needed <= 0) return "Goal Achieved!";

        const monthlyNeed = needed / (totalDays / 30);
        return `Save ${Math.round(monthlyNeed).toLocaleString()} ETB/mo to reach goal on time.`;
    };

    // SUCCESS MODAL FOR GOALS - DIALOG BOUNCE
    if (showGoalSuccess) {
        return (
            <div className="fixed inset-0 modal-overlay z-[110] flex items-center justify-center p-4" onClick={() => setShowGoalSuccess(false)}>
                <div className="modal-content w-full max-w-sm rounded-3xl p-8 animate-dialog text-center shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400 animate-bounce">
                        <Icons.Trophy size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">New Goal Set!</h3>
                    <p className="text-theme-secondary text-sm mb-8">You've taken the first step. Stay consistent to reach it.</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => setShowGoalSuccess(false)}
                            className="w-full py-4 bg-cyan-500 text-black font-bold rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
                        >
                            View Goal
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-28 animate-push space-y-6 relative">

            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h2 className="text-theme-primary text-xl font-bold">
                        Community Finance
                    </h2>
                    <p className="text-theme-secondary text-xs ethiopic">የማህበረሰብ ገንዘብ</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Icons.Trophy size={20} />
                </div>
            </div>

            {/* --- FLOATING GLASS TABS (NEW) --- */}
            <div className="sticky top-24 z-30 mb-6">
                <div className="glass-panel p-1.5 rounded-full flex items-center justify-between shadow-lg mx-4 border border-white/10">
                    {(['personal', 'iqub', 'iddir'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-300 relative overflow-hidden ${activeTab === tab
                                ? 'text-white shadow-md'
                                : 'text-theme-secondary hover:text-theme-primary hover:bg-white/5'
                                }`}
                        >
                            {activeTab === tab && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full -z-10 animate-fade-in"></div>
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {tab === 'personal' && <Icons.Goals size={14} />}
                                {tab === 'iqub' && <Icons.Users size={14} />}
                                {tab === 'iddir' && <Icons.Heart size={14} />}
                                {tab === 'personal' ? 'My Goals' : tab === 'iqub' ? 'Digital Iqub' : 'Iddir'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- PERSONAL GOALS VIEW --- */}
            {activeTab === 'personal' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wider">Active Goals</h3>
                        <button
                            onClick={() => openAddGoalModal()}
                            className="text-xs text-cyan-400 font-medium flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 transition-colors"
                        >
                            <Icons.Plus size={12} /> New Goal
                        </button>
                    </div>

                    {savingsGoals.map(goal => {
                        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const isComplete = percentage >= 100;
                        const iconObj = GOAL_ICONS.find(i => i.id === goal.icon) || GOAL_ICONS[0];

                        return (
                            <div
                                key={goal.id}
                                onClick={() => setSelectedGoalDetail(goal)}
                                className="soft-card p-5 rounded-3xl cursor-pointer group hover:shadow-md relative overflow-hidden transition-transform active:scale-[0.99]"
                            >
                                {isComplete && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        {/* Render Gradient Icon */}
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconObj.color} shadow-lg shadow-${goal.color}-500/20 text-white`}>
                                            <iconObj.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-theme-primary text-lg">{goal.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-500/20 text-emerald-500' : 'bg-theme-main text-theme-secondary'}`}>
                                                    {isComplete ? 'Completed!' : 'On Track'}
                                                </span>
                                                {goal.deadline && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-main text-theme-secondary flex items-center gap-1">
                                                        <Icons.CalendarClock size={10} /> {getDaysLeft(goal.deadline)} days
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="relative" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setShowMenuId(showMenuId === goal.id ? null : goal.id)} className="p-1 rounded-full hover:bg-theme-main">
                                                <Icons.MoreVertical size={16} className="text-theme-secondary" />
                                            </button>
                                            {showMenuId === goal.id && (
                                                <div className="absolute right-0 top-6 bg-theme-main border border-theme rounded-xl shadow-xl z-20 w-32 py-1">
                                                    <button onClick={() => { openAddGoalModal(goal); setShowMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-theme-primary hover:bg-theme-card flex items-center gap-2">
                                                        <Icons.Edit size={12} /> Edit
                                                    </button>
                                                    <button onClick={() => deleteItem('goal', goal.id)} className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-theme-card flex items-center gap-2">
                                                        <Icons.Delete size={12} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 relative z-10">
                                    <div className="w-full h-3 bg-theme-main rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : goal.color === 'cyan' ? 'bg-cyan-400' : goal.color === 'pink' ? 'bg-pink-500' : 'bg-yellow-400'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-theme-secondary">
                                        <span>{isPrivacyMode ? '••••' : goal.currentAmount.toLocaleString()} ETB</span>
                                        <span>Target: {isPrivacyMode ? '••••' : goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {!isComplete && (
                                    <div className="flex gap-3 relative z-10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setContributionModal(goal.id); setContributionAccount(goal.defaultAccountId || accounts[0]?.id || ''); }}
                                            className="flex-1 py-3 bg-theme-main hover:bg-theme-main/80 border border-theme rounded-xl text-sm font-bold text-theme-primary transition-colors btn-press"
                                        >
                                            Add Funds
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {savingsGoals.length === 0 && (
                        <EmptyState
                            icon={<Icons.Goals size={32} />}
                            title="No dreams yet?"
                            description="Define your dreams. Set a target to start saving systematically."
                            action={{
                                label: `Create ${activeProfile} Goal`,
                                onClick: () => openAddGoalModal(),
                                icon: <Icons.Plus size={18} />
                            }}
                        />
                    )}
                </div>
            )}

            {/* --- DIGITAL IQUB VIEW --- */}
            {activeTab === 'iqub' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Iqub Hero Banner */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 relative overflow-hidden shadow-lg text-white mb-6">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Digital Iqub</h2>
                                    <p className="text-indigo-200 text-xs">Modern rotating savings circles.</p>
                                </div>
                                <button
                                    onClick={() => openAddIqubModal()}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 transition-colors"
                                >
                                    + New Circle
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-black/20 rounded-xl p-3 text-center backdrop-blur-sm">
                                    <span className="block text-lg font-bold">{iqubs.length}</span>
                                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Active</span>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 text-center backdrop-blur-sm">
                                    <span className="block text-lg font-bold">{iqubs.reduce((acc, i) => acc + i.members, 0)}</span>
                                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Members</span>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 text-center backdrop-blur-sm">
                                    <span className="block text-lg font-bold text-emerald-400">98%</span>
                                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Payout</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {iqubs.map(iqub => (
                        <div
                            key={iqub.id}
                            className="soft-card p-6 rounded-3xl relative cursor-pointer hover:shadow-md transition-all"
                            onClick={() => setSelectedIqubDetail(iqub)}
                        >
                            {/* Menu */}
                            <div className="absolute top-6 right-6 z-10" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setShowMenuId(showMenuId === iqub.id ? null : iqub.id)} className="p-1 rounded-full hover:bg-theme-main">
                                    <Icons.MoreVertical size={16} className="text-theme-secondary" />
                                </button>
                                {showMenuId === iqub.id && (
                                    <div className="absolute right-0 top-6 bg-theme-main border border-theme rounded-xl shadow-xl z-20 w-32 py-1">
                                        <button onClick={() => { openAddIqubModal(iqub); setShowMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-theme-primary hover:bg-theme-card flex items-center gap-2">
                                            <Icons.Edit size={12} /> Edit
                                        </button>
                                        <button onClick={() => deleteItem('iqub', iqub.id)} className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-theme-card flex items-center gap-2">
                                            <Icons.Delete size={12} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-theme-primary text-xl mb-1">{iqub.title}</h4>
                                    <p className="text-xs text-theme-secondary flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        {iqub.cycle} Cycle • {iqub.members} Members
                                    </p>
                                    {iqub.purpose && (
                                        <p className="text-[10px] text-cyan-400 font-medium">Goal: {iqub.purpose}</p>
                                    )}
                                </div>
                            </div>

                            {/* Visual Blocks Tracker */}
                            <HorizontalScroll className="flex gap-1 mb-6 py-2">
                                {Array.from({ length: iqub.members }).map((_, idx) => {
                                    const roundNum = idx + 1;
                                    const isPaid = roundNum <= iqub.paidRounds;
                                    const isWinRound = iqub.winningRound === roundNum;

                                    return (
                                        <div
                                            key={idx}
                                            className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold border transition-colors ${isWinRound ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/30 scale-110 z-10' :
                                                isPaid ? 'bg-emerald-500 border-emerald-400 text-black' :
                                                    'bg-theme-main border-theme text-theme-secondary'
                                                }`}
                                        >
                                            {isWinRound ? <Icons.Trophy size={14} /> : isPaid ? <Icons.Check size={14} /> : roundNum}
                                        </div>
                                    )
                                })}
                            </HorizontalScroll>

                            <div className="bg-theme-main rounded-2xl p-4 border border-theme mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-theme-secondary uppercase tracking-wider mb-1">Your Turn</p>
                                    <p className="text-theme-primary font-bold">{iqub.myTurnDate ? new Date(iqub.myTurnDate).toLocaleDateString() : 'Not Set'}</p>
                                </div>
                                <div className="h-8 w-px bg-theme-secondary/20"></div>
                                <div>
                                    <p className="text-[10px] text-theme-secondary uppercase tracking-wider mb-1">Total Payout</p>
                                    <p className="text-cyan-400 font-bold">{isPrivacyMode ? '••••' : (iqub.payoutAmount).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => { setShowPayIqubModal(iqub); setIqubPayAccount(accounts[0]?.id || ''); }}
                                    disabled={iqub.paidRounds >= iqub.members}
                                    className="flex-1 py-4 bg-theme-main hover:bg-theme-card border border-theme text-theme-primary font-bold rounded-2xl transition-all disabled:opacity-50"
                                >
                                    Pay {isPrivacyMode ? '••••' : iqub.amount}
                                </button>

                                {!iqub.hasWon ? (
                                    <button
                                        onClick={() => handleClaimWin(iqub)}
                                        className="flex-1 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-2xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Icons.Trophy size={18} /> I Won!
                                    </button>
                                ) : (
                                    <div className="flex-1 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold rounded-2xl flex items-center justify-center gap-2">
                                        <Icons.CheckCircle size={18} /> Payout Recieved
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {iqubs.length === 0 && (
                        <EmptyState
                            icon={<Icons.Users size={32} />}
                            title="No Iqubs Active"
                            description="Join a digital Iqub to save with friends and colleagues. Track rounds and payouts easily."
                            action={{
                                label: "Start New Iqub",
                                onClick: () => openAddIqubModal(),
                                icon: <Icons.Plus size={18} />
                            }}
                        />
                    )}
                </div>
            )}

            {/* --- IDDIR VIEW (Phase 2) --- */}
            {activeTab === 'iddir' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Iddir Hero Banner */}
                    <div className="bg-gradient-to-br from-rose-900 to-pink-900 rounded-3xl p-6 relative overflow-hidden shadow-lg text-white mb-6">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Community Iddir</h2>
                                    <p className="text-rose-200 text-xs">Social insurance & emergency funds.</p>
                                </div>
                                <button
                                    onClick={() => openAddIddirModal()}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 transition-colors"
                                >
                                    + Join Iddir
                                </button>
                            </div>
                        </div>
                    </div>

                    {iddirs.map(iddir => {
                        const isPaidThisMonth = iddir.lastPaidDate && new Date(iddir.lastPaidDate).getMonth() === new Date().getMonth() && new Date(iddir.lastPaidDate).getFullYear() === new Date().getFullYear();

                        return (
                            <div
                                key={iddir.id}
                                className={`soft-card p-6 rounded-3xl relative group transition-colors ${isPaidThisMonth ? 'border-emerald-500/50' : ''}`}
                            >
                                {/* Edit/Delete Menu for Iddir */}
                                <div className="absolute top-6 right-6 z-10">
                                    <button onClick={() => setShowMenuId(showMenuId === iddir.id ? null : iddir.id)} className="p-2 rounded-full hover:bg-theme-main text-theme-secondary">
                                        <Icons.MoreVertical size={16} />
                                    </button>
                                    {showMenuId === iddir.id && (
                                        <div className="absolute right-0 top-6 bg-theme-main border border-theme rounded-xl shadow-xl z-20 w-32 py-1">
                                            <button onClick={() => { openAddIddirModal(iddir); setShowMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-theme-primary hover:bg-theme-card flex items-center gap-2">
                                                <Icons.Edit size={12} /> Edit
                                            </button>
                                            <button onClick={() => deleteItem('iddir', iddir.id)} className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-theme-card flex items-center gap-2">
                                                <Icons.Delete size={12} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPaidThisMonth ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                        <Icons.Iddir size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-theme-primary text-lg">{iddir.name}</h4>
                                            {isPaidThisMonth && <Icons.CheckCircle size={18} fill="currentColor" className="text-emerald-500 bg-theme-card rounded-full" />}
                                        </div>
                                        <p className="text-xs text-theme-secondary">Monthly Due: Day {iddir.paymentDate}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-theme-secondary uppercase font-bold mb-1">Contribution</p>
                                        <p className="text-xl font-bold text-white">{iddir.monthlyContribution.toLocaleString()} <span className="text-sm font-normal text-theme-secondary">ETB</span></p>
                                    </div>

                                    {isPaidThisMonth ? (
                                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <Icons.Check size={14} /> Paid
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => markIddirPaid(iddir.id, accounts[0]?.id || '')}
                                            className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                </div>

                                {/* Reminder Badge */}
                                {iddir.reminderEnabled && !isPaidThisMonth && (
                                    <div className="absolute top-6 right-16 flex items-center gap-1 text-[10px] text-theme-secondary bg-theme-main px-2 py-1 rounded-full border border-theme">
                                        <Icons.Bell size={10} /> {iddir.reminderDaysBefore}d before
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {iddirs.length === 0 && (
                        <EmptyState
                            icon={<Icons.Iddir size={32} />}
                            title="No Iddir memberships"
                            description="Social insurance is crucial. Add your Iddir to track monthly dues."
                            action={{
                                label: "Register New Iddir",
                                onClick: () => openAddIddirModal(),
                                icon: <Icons.Plus size={18} />
                            }}
                        />
                    )}
                </div>
            )}

            {/* CELEBRATION OVERLAY */}
            {showCelebration && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"></div>
                    <div className="relative z-10 flex flex-col items-center animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <Icons.Celebration size={120} className="text-yellow-400 drop-shadow-lg" />
                        <h2 className="text-4xl font-bold text-white mt-8 drop-shadow-md text-center">Congratulations!</h2>
                        <p className="text-white/80 text-lg mt-2">You won the Iqub Payout!</p>
                    </div>
                </div>
            )}

            {/* PAY IQUB MODAL */}
            {showPayIqubModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowPayIqubModal(null); }}
                    className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center"
                >
                    <div className="modal-content w-full max-w-sm rounded-t-[2rem] sm:rounded-3xl animate-slide-up shadow-2xl relative flex flex-col max-h-[85vh]">
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mt-6 mb-2 shrink-0 sm:hidden"></div>

                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <h3 className="text-lg font-bold text-theme-primary mb-2">Pay Iqub Contribution</h3>
                            <p className="text-xs text-theme-secondary mb-6">Make your payment for this cycle.</p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">From Account</label>
                                    <select
                                        className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500"
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Amount Due</label>
                                    <div className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary text-2xl font-bold font-mono">
                                        {showPayIqubModal.amount} ETB
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-4 mt-auto shrink-0 border-t border-theme/10">
                            <div className="flex gap-3">
                                <button onClick={() => setShowPayIqubModal(null)} className="flex-1 py-3 bg-theme-main rounded-xl text-theme-secondary font-bold">Cancel</button>
                                <button onClick={handlePayIqub} className="flex-1 py-3 bg-cyan-500 rounded-xl text-black font-bold">Confirm Payment</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTRIBUTION MODAL (PERSONAL) */}
            {
                contributionModal && (
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) setContributionModal(null); }}
                        className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center"
                    >
                        <div className="modal-content w-full max-w-sm rounded-t-[2rem] sm:rounded-3xl animate-slide-up shadow-2xl relative flex flex-col max-h-[85vh]">
                            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mt-6 mb-2 shrink-0 sm:hidden"></div>

                            <div className="flex-1 overflow-y-auto p-6 pt-2">
                                <h3 className="text-lg font-bold text-theme-primary mb-2">Add Contribution</h3>
                                <p className="text-xs text-theme-secondary mb-6">Move money to this goal.</p>

                                <div className="space-y-4 mb-6">
                                    {/* Account Selector */}
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">From Account</label>
                                        <select
                                            value={contributionAccount}
                                            onChange={(e) => setContributionAccount(e.target.value)}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500"
                                        >
                                            {accounts.map(a => (
                                                <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Amount (ETB)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={contributionAmount}
                                            onChange={(e) => setContributionAmount(formatNumberInput(e.target.value))}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary text-3xl font-bold focus:border-cyan-500 outline-none font-mono"
                                            autoFocus
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-4 mt-auto shrink-0 border-t border-theme/10">
                                <div className="flex gap-3">
                                    <button onClick={() => setContributionModal(null)} className="flex-1 py-3 bg-theme-main rounded-xl text-theme-secondary font-bold">Cancel</button>
                                    <button onClick={handleContribute} className="flex-1 py-3 bg-cyan-500 rounded-xl text-black font-bold">Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ADD / EDIT IQUB MODAL */}
            {
                showAddIqub && (
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddIqub(false); }}
                        className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center"
                    >
                        <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl animate-slide-up shadow-2xl max-h-[90vh] flex flex-col relative">
                            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mt-6 mb-2 shrink-0 sm:hidden"></div>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
                                <h3 className="text-lg font-bold text-theme-primary mb-6 text-center">{editingIqub ? 'Edit Iqub' : 'Start New Iqub'}</h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${iqubErrors.title ? 'text-rose-500' : 'text-theme-secondary'}`}>Iqub Title</label>
                                        <input
                                            type="text"
                                            value={newIqubTitle}
                                            onChange={(e) => { setNewIqubTitle(e.target.value); setIqubErrors(p => ({ ...p, title: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary outline-none ${iqubErrors.title ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                                            placeholder="e.g. Office Iqub"
                                        />
                                        {iqubErrors.title && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${iqubErrors.amount ? 'text-rose-500' : 'text-theme-secondary'}`}>Contribution Amount (ETB)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={newIqubAmount}
                                            onChange={(e) => { setNewIqubAmount(formatNumberInput(e.target.value)); setIqubErrors(p => ({ ...p, amount: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary font-bold outline-none font-mono ${iqubErrors.amount ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                                            placeholder="0.00"
                                        />
                                        {iqubErrors.amount && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${iqubErrors.members ? 'text-rose-500' : 'text-theme-secondary'}`}>Number of Members</label>
                                        <input
                                            type="number"
                                            value={newIqubMembers}
                                            onChange={(e) => { setNewIqubMembers(e.target.value); setIqubErrors(p => ({ ...p, members: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary outline-none ${iqubErrors.members ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                                            placeholder="e.g. 12"
                                        />
                                        {iqubErrors.members && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Cycle Frequency</label>
                                        <div className="flex bg-theme-main p-1 rounded-2xl border border-theme">
                                            {(['daily', 'weekly', 'monthly'] as const).map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setNewIqubFreq(f)}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${newIqubFreq === f ? 'bg-theme-card text-cyan-400 shadow-sm' : 'text-theme-secondary hover:text-white'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Start Date</label>
                                        <input
                                            type="date"
                                            value={newIqubStartDate}
                                            onChange={(e) => setNewIqubStartDate(e.target.value)}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Purpose (Optional)</label>
                                        <input
                                            type="text"
                                            value={newIqubPurpose}
                                            onChange={(e) => setNewIqubPurpose(e.target.value)}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500"
                                            placeholder="e.g. Buying a Car"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-4 mt-auto shrink-0 border-t border-theme/10">
                                <div className="flex gap-3">
                                    <button onClick={() => setShowAddIqub(false)} className="flex-1 py-3 bg-theme-main rounded-xl text-theme-secondary font-bold">Cancel</button>
                                    <button onClick={handleSaveIqub} className="flex-1 py-3 bg-cyan-500 rounded-xl text-black font-bold hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">{editingIqub ? 'Update' : 'Start Iqub'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ADD / EDIT IDDIR MODAL */}
            {
                showAddIddir && (
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddIddir(false); }}
                        className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center"
                    >
                        <div className="modal-content w-full max-w-sm rounded-t-[2rem] sm:rounded-3xl animate-slide-up shadow-2xl relative flex flex-col max-h-[85vh]">
                            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mt-6 mb-2 shrink-0 sm:hidden"></div>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
                                <h3 className="text-lg font-bold text-theme-primary mb-6 text-center">{editingIddir ? 'Edit Iddir' : 'New Iddir Membership'}</h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${iddirErrors.name ? 'text-rose-500' : 'text-theme-secondary'}`}>Iddir Name</label>
                                        <input
                                            type="text"
                                            value={newIddirName}
                                            onChange={(e) => { setNewIddirName(e.target.value); setIddirErrors(p => ({ ...p, name: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary outline-none ${iddirErrors.name ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-rose-500'}`}
                                            placeholder="e.g. Community Iddir"
                                        />
                                        {iddirErrors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${iddirErrors.fee ? 'text-rose-500' : 'text-theme-secondary'}`}>Monthly Contribution (ETB)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={newIddirFee}
                                            onChange={(e) => { setNewIddirFee(formatNumberInput(e.target.value)); setIddirErrors(p => ({ ...p, fee: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary font-bold outline-none font-mono ${iddirErrors.fee ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-rose-500'}`}
                                            placeholder="0.00"
                                        />
                                        {iddirErrors.fee && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Payment Day (1-30)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={newIddirDate}
                                            onChange={(e) => setNewIddirDate(e.target.value)}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none focus:border-rose-500"
                                        />
                                    </div>

                                    {/* Reminder Toggle */}
                                    <div className="bg-theme-main p-3 rounded-2xl border border-theme">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-theme-secondary">Payment Reminder</span>
                                            <button
                                                onClick={() => setNewIddirRemind(!newIddirRemind)}
                                                className={`w-10 h-6 rounded-full relative transition-colors ${newIddirRemind ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newIddirRemind ? 'left-5' : 'left-1'}`}></div>
                                            </button>
                                        </div>

                                        {newIddirRemind && (
                                            <div className="pt-2 mt-2 border-t border-theme/50 flex items-center gap-2 animate-fade-in">
                                                <span className="text-xs text-theme-secondary">Remind me</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="7"
                                                    value={newIddirDays}
                                                    onChange={e => setNewIddirDays(e.target.value)}
                                                    className="w-12 bg-theme-card p-1 text-center rounded border border-theme text-sm font-bold outline-none"
                                                />
                                                <span className="text-xs text-theme-secondary">days before due.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-4 mt-auto shrink-0 border-t border-theme/10">
                                <div className="flex gap-3">
                                    <button onClick={() => setShowAddIddir(false)} className="flex-1 py-3 bg-theme-main rounded-xl text-theme-secondary font-bold">Cancel</button>
                                    <button onClick={handleSaveIddir} className="flex-1 py-3 bg-rose-500 rounded-xl text-white font-bold hover:bg-rose-400 shadow-lg shadow-rose-500/20">{editingIddir ? 'Update' : 'Register'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ADD / EDIT GOAL MODAL */}
            {
                showAddGoal && (
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddGoal(false); }}
                        className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center"
                    >
                        <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl animate-slide-up shadow-2xl max-h-[90vh] flex flex-col relative">
                            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mt-6 mb-2 shrink-0 sm:hidden"></div>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
                                <h3 className="text-lg font-bold text-theme-primary mb-6 text-center">{editingGoal ? 'Edit Goal' : `Create ${activeProfile} Goal`}</h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${goalErrors.title ? 'text-rose-500' : 'text-theme-secondary'}`}>Goal Name</label>
                                        <input
                                            type="text"
                                            value={newGoalTitle}
                                            onChange={(e) => { setNewGoalTitle(e.target.value); setGoalErrors(p => ({ ...p, title: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary outline-none ${goalErrors.title ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                                            placeholder="e.g. New Laptop"
                                        />
                                        {goalErrors.title && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${goalErrors.target ? 'text-rose-500' : 'text-theme-secondary'}`}>Target Amount (ETB)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={newGoalTarget}
                                            onChange={(e) => { setNewGoalTarget(formatNumberInput(e.target.value)); setGoalErrors(p => ({ ...p, target: false })); }}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary font-bold outline-none font-mono ${goalErrors.target ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                                            placeholder="0.00"
                                        />
                                        {goalErrors.target && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Default Account</label>
                                        <select
                                            value={newGoalAccount}
                                            onChange={(e) => setNewGoalAccount(e.target.value)}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none focus:border-cyan-500"
                                        >
                                            {accounts.map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Target Date (Gregorian/GC)</label>
                                        <input
                                            type="date"
                                            value={newGoalDeadline}
                                            onChange={(e) => setNewGoalDeadline(e.target.value)}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary outline-none"
                                        />
                                    </div>

                                    {/* Premium Icon Picker - Horizontal Scroll */}
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Select Icon</label>
                                        <HorizontalScroll className="flex gap-4 pb-2">
                                            {GOAL_ICONS.map(ic => (
                                                <button
                                                    key={ic.id}
                                                    onClick={() => setNewGoalIcon(ic.id)}
                                                    className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all p-2 rounded-2xl border ${newGoalIcon === ic.id ? 'border-cyan-500 bg-theme-main' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${ic.color} shadow-lg text-white`}>
                                                        <ic.icon size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-theme-secondary">{ic.label}</span>
                                                </button>
                                            ))}
                                        </HorizontalScroll>
                                    </div>

                                    {/* Color Picker */}
                                    <div>
                                        <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Color</label>
                                        <div className="flex gap-3">
                                            {['cyan', 'pink', 'yellow'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setNewGoalColor(c)}
                                                    className={`flex-1 h-12 rounded-2xl border transition-all ${newGoalColor === c ? 'border-white scale-110' : 'border-transparent opacity-70'} ${c === 'cyan' ? 'bg-cyan-400' : c === 'pink' ? 'bg-pink-500' : 'bg-yellow-400'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-4 mt-auto shrink-0 border-t border-theme/10">
                                <div className="flex gap-3">
                                    <button onClick={() => setShowAddGoal(false)} className="flex-1 py-3 bg-theme-main rounded-xl text-theme-secondary font-bold">Cancel</button>
                                    <button onClick={handleSaveGoal} className="flex-1 py-3 bg-cyan-500 rounded-xl text-black font-bold hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">{editingGoal ? 'Update' : 'Create'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* GOAL DETAIL / FINANCIAL GPS MODAL - HERO EXPAND */}
            {
                selectedGoalDetail && (
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedGoalDetail(null); }}
                        className="fixed inset-0 modal-overlay z-[80] flex items-end sm:items-center justify-center"
                    >
                        <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 animate-hero shadow-2xl h-[85vh] flex flex-col relative">
                            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 sm:hidden shrink-0"></div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 shrink-0">
                                <div className="flex gap-4 items-center">
                                    {/* Icon */}
                                    {(() => {
                                        const iconObj = GOAL_ICONS.find(i => i.id === selectedGoalDetail.icon) || GOAL_ICONS[0];
                                        return (
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconObj.color} shadow-lg text-white`}>
                                                <iconObj.icon size={24} />
                                            </div>
                                        )
                                    })()}
                                    <div>
                                        <h3 className="text-2xl font-bold text-theme-primary">{selectedGoalDetail.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-theme-secondary font-mono">{selectedGoalDetail.currentAmount.toLocaleString()} / {selectedGoalDetail.targetAmount.toLocaleString()} ETB</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { openAddGoalModal(selectedGoalDetail); setSelectedGoalDetail(null); }} className="p-2 bg-theme-main rounded-full border border-theme text-theme-secondary hover:text-cyan-400 transition-colors">
                                        <Icons.Edit size={20} />
                                    </button>
                                    <button onClick={() => setSelectedGoalDetail(null)} className="p-2 bg-theme-main rounded-full border border-theme text-theme-secondary">
                                        <Icons.Close size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">

                                {/* Financial GPS Card */}
                                <div className="bg-theme-main rounded-3xl p-6 border border-theme relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider flex items-center gap-2">
                                            <Icons.MapPin size={14} className="text-cyan-400" /> Financial GPS
                                        </span>
                                        <span className="text-xs text-theme-primary font-bold">
                                            {Math.round((selectedGoalDetail.currentAmount / selectedGoalDetail.targetAmount) * 100)}% Complete
                                        </span>
                                    </div>

                                    {/* Linear Progress Road */}
                                    <div className="relative mb-6 px-2">
                                        {/* Track */}
                                        <div className="h-2 bg-theme-card rounded-full w-full relative">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 absolute top-0 left-0 transition-all duration-1000`}
                                                style={{ width: `${Math.min((selectedGoalDetail.currentAmount / selectedGoalDetail.targetAmount) * 100, 100)}%` }}
                                            >
                                                {/* Car/Marker */}
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-theme-card border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-lg text-emerald-500">
                                                    <Icons.Car size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Labels */}
                                        <div className="flex justify-between mt-4 text-[10px] font-bold text-theme-secondary uppercase tracking-wider">
                                            <span>Start</span>
                                            <span className="flex items-center gap-1 text-emerald-500"><Icons.Flag size={10} /> Goal</span>
                                        </div>
                                    </div>

                                    {/* BEHAVIORAL INSIGHT */}
                                    <div className="bg-theme-card/50 p-3 rounded-xl border border-theme/50 mb-6 flex items-start gap-3">
                                        <Icons.Sparkles className="text-yellow-400 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-theme-primary font-medium leading-relaxed">
                                            {getGoalInsight(selectedGoalDetail)}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-theme-secondary mb-1">Distance Remaining</p>
                                            <p className="text-lg font-bold text-theme-primary">{(selectedGoalDetail.targetAmount - selectedGoalDetail.currentAmount).toLocaleString()} <span className="text-xs opacity-50">ETB</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-theme-secondary mb-1">Estimated Arrival</p>
                                            <p className="text-lg font-bold text-cyan-400">
                                                {selectedGoalDetail.deadline ? new Date(selectedGoalDetail.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* History */}
                                <div>
                                    <h4 className="font-bold text-theme-primary mb-3 flex items-center gap-2">
                                        <Icons.History size={16} /> Recent Activity
                                    </h4>
                                    <div className="space-y-3">
                                        {getGoalHistory(selectedGoalDetail.id).length > 0 ? (
                                            getGoalHistory(selectedGoalDetail.id).map(tx => (
                                                <div key={tx.id} className="flex justify-between items-center bg-theme-main p-4 rounded-2xl border border-theme">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-theme-card border border-theme flex items-center justify-center text-emerald-500">
                                                            <Icons.ArrowDown size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-theme-primary">Contribution</p>
                                                            <p className="text-[10px] text-theme-secondary">{formatDate(tx.date)}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-emerald-500 font-bold font-mono">+{tx.amount.toLocaleString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-theme-main rounded-2xl border border-theme border-dashed">
                                                <p className="text-xs text-theme-secondary italic">No contributions yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto">
                                <button
                                    onClick={() => { setContributionModal(selectedGoalDetail.id); setContributionAccount(selectedGoalDetail.defaultAccountId || accounts[0]?.id || ''); setSelectedGoalDetail(null); }}
                                    className="w-full py-4 bg-cyan-500 rounded-2xl text-black font-bold hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                                >
                                    Add Funds Now
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* IQUB DETAIL / SCHEDULE MODAL */}
            {
                selectedIqubDetail && (
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedIqubDetail(null); }}
                        className="fixed inset-0 modal-overlay z-[80] flex items-end sm:items-center justify-center"
                    >
                        <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 border-t sm:border border-theme animate-slide-up shadow-2xl h-[85vh] flex flex-col relative">
                            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 sm:hidden shrink-0"></div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 shrink-0">
                                <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                        <Icons.Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-theme-primary">{selectedIqubDetail.title}</h3>
                                        <p className="text-xs text-theme-secondary">{selectedIqubDetail.status === 'active' ? 'Active Cycle' : 'Completed'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { openAddIqubModal(selectedIqubDetail); setSelectedIqubDetail(null); }}
                                        className="p-2 bg-theme-main rounded-full border border-theme text-theme-secondary hover:text-cyan-400"
                                    >
                                        <Icons.Edit size={20} />
                                    </button>
                                    <button onClick={() => setSelectedIqubDetail(null)} className="p-2 bg-theme-main rounded-full border border-theme text-theme-secondary">
                                        <Icons.Close size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Schedule */}
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                                {/* Stats Summary */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-theme-main p-4 rounded-2xl border border-theme">
                                        <p className="text-[10px] text-theme-secondary uppercase font-bold">Total Payout</p>
                                        <p className="text-xl font-bold text-cyan-400">{selectedIqubDetail.payoutAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-theme-main p-4 rounded-2xl border border-theme">
                                        <p className="text-[10px] text-theme-secondary uppercase font-bold">Contribution</p>
                                        <p className="text-xl font-bold text-white">{selectedIqubDetail.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Schedule List */}
                                <div>
                                    <h4 className="font-bold text-theme-primary mb-3 flex items-center gap-2">
                                        <Icons.CalendarCheck size={16} /> Cycle Schedule
                                    </h4>
                                    <div className="space-y-3 relative">
                                        {/* Vertical Line */}
                                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-theme-main border-l border-dashed border-theme-secondary/30"></div>

                                        {generateIqubSchedule(selectedIqubDetail).map((round) => (
                                            <div key={round.round} className={`relative flex items-center gap-4 p-3 rounded-2xl border transition-colors ${round.isMyTurn ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-theme-main border-theme'}`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-theme-card ${round.isMyTurn ? 'bg-yellow-500 text-black' :
                                                    round.isPaid ? 'bg-emerald-500 text-white' :
                                                        'bg-theme-card border border-theme text-theme-secondary'
                                                    }`}>
                                                    {round.isMyTurn ? <Icons.Trophy size={16} /> : round.isPaid ? <Icons.Check size={16} /> : <span className="text-xs font-bold">{round.round}</span>}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${round.isMyTurn ? 'text-yellow-500' : 'text-theme-primary'}`}>
                                                            {round.isMyTurn ? 'Your Turn (Payout)' : `Round ${round.round}`}
                                                        </span>
                                                        <span className="text-[10px] text-theme-secondary">{new Date(round.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[10px] opacity-70 mt-1">
                                                        {round.isPaid ? 'Paid' : round.isPast ? 'Overdue' : 'Upcoming'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto">
                                {!selectedIqubDetail.hasWon ? (
                                    <button
                                        onClick={() => { handleClaimWin(selectedIqubDetail); setSelectedIqubDetail(null); }}
                                        className="w-full py-4 bg-yellow-500 text-black font-bold rounded-2xl shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-transform"
                                    >
                                        Claim Payout Now
                                    </button>
                                ) : (
                                    <div className="w-full py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold rounded-2xl flex items-center justify-center gap-2">
                                        <Icons.CheckCircle size={18} /> Payout Received
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
