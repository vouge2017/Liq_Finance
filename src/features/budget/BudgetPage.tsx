import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getCurrentBudgetMonth, isDateInBudgetMonth } from '@/utils/dateUtils';
import { Icons } from '@/shared/components/Icons';
import { BudgetCategory, Transaction, RecurringTransaction } from '@/types';
import { HorizontalScroll } from '@/shared/components/HorizontalScroll';

const BUDGET_ICONS = [
    { id: 'Home', icon: Icons.Home },
    { id: 'Zap', icon: Icons.Zap },
    { id: 'Heart', icon: Icons.Heart },
    { id: 'Utensils', icon: Icons.Utensils },
    { id: 'Bus', icon: Icons.Bus },
    { id: 'Shopping', icon: Icons.Shopping },
    { id: 'Film', icon: Icons.Film },
    { id: 'Education', icon: Icons.Education },
    { id: 'Baby', icon: Icons.Baby },
    { id: 'Briefcase', icon: Icons.Briefcase },
    { id: 'Coins', icon: Icons.Coins },
    { id: 'Teff', icon: Icons.Teff }, // New
    { id: 'Bajaji', icon: Icons.Bajaji }, // New
    { id: 'Phone', icon: Icons.Phone }, // New Mapping
    { id: 'Coffee', icon: Icons.Coffee }, // New Mapping
    { id: 'Iddir', icon: Icons.Iddir }, // New Mapping
];

const CATEGORY_COLORS = [
    'bg-cyan-400', 'bg-yellow-400', 'bg-pink-500', 'bg-purple-400',
    'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-blue-500',
    'bg-orange-400', 'bg-teal-400'
];

const SUBSCRIPTION_ICONS = [
    { id: 'Wifi', icon: Icons.Wifi, color: 'from-emerald-600 to-green-700', label: 'Ethio Tel', shadow: 'shadow-emerald-500/30' },
    { id: 'Water', icon: Icons.Water, color: 'from-cyan-500 to-blue-600', label: 'Water Bill', shadow: 'shadow-blue-500/30' },
    { id: 'Electricity', icon: Icons.Electricity, color: 'from-amber-500 to-orange-600', label: 'Electric', shadow: 'shadow-orange-500/30' },
    { id: 'Tv', icon: Icons.Tv, color: 'from-sky-600 to-blue-800', label: 'DSTV', shadow: 'shadow-blue-500/30' },
    { id: 'Music', icon: Icons.Music, color: 'from-pink-500 to-rose-600', label: 'Canal+', shadow: 'shadow-pink-500/30' },
    { id: 'Phone', icon: Icons.Phone, color: 'from-lime-500 to-green-600', label: 'Airtime', shadow: 'shadow-lime-500/30' },
    { id: 'Home', icon: Icons.Home, color: 'from-indigo-600 to-violet-700', label: 'Rent', shadow: 'shadow-indigo-500/30' },
    { id: 'Education', icon: Icons.Education, color: 'from-cyan-600 to-blue-700', label: 'School Fee', shadow: 'shadow-cyan-500/30' },
    { id: 'Zap', icon: Icons.Zap, color: 'from-slate-700 to-slate-900', label: 'Other', shadow: 'shadow-slate-500/30' }
];

export const BudgetPage: React.FC = () => {
    const {
        state,
        isPrivacyMode,
        addBudgetCategory,
        updateBudgetCategory,
        deleteBudgetCategory,
        openTransactionModal,
        formatDate,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        scanForSubscriptions,
        setActiveTab,
        calendarMode,
        navigationState, // Deep linking state
        clearNavigation
    } = useAppContext();

    const { budgetCategories, transactions, recurringTransactions } = state;

    // View State: Month Navigation
    const [currentDate, setCurrentDate] = useState(new Date());

    // Collapsible Sections State
    const [expandedSections, setExpandedSections] = useState({
        variable: true,
        fixed: true,
        subs: true
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- Modals State ---
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

    // Category Form
    const [catName, setCatName] = useState('');
    const [catAlloc, setCatAlloc] = useState('');
    const [catType, setCatType] = useState<'fixed' | 'variable'>('variable');
    const [catIcon, setCatIcon] = useState('Shopping');
    const [catColor, setCatColor] = useState('bg-cyan-400');
    const [catRollover, setCatRollover] = useState(false);
    const [catErrors, setCatErrors] = useState({ name: false, alloc: false });

    // Subscriptions State
    const [showSubModal, setShowSubModal] = useState(false);
    const [editingSub, setEditingSub] = useState<RecurringTransaction | null>(null);

    // Subscription Form
    const [subName, setSubName] = useState('');
    const [subAmount, setSubAmount] = useState('');
    const [subCycle, setSubCycle] = useState<'monthly' | 'weekly' | 'annual'>('monthly');
    const [subDate, setSubDate] = useState('');
    const [subIcon, setSubIcon] = useState('Zap');
    const [subNotes, setSubNotes] = useState('');
    const [subReminders, setSubReminders] = useState<number[]>([]);
    const [subErrors, setSubErrors] = useState({ name: false, amount: false });

    // Drilldown IDs
    const [detailCatId, setDetailCatId] = useState<string | null>(null);
    const [detailSubId, setDetailSubId] = useState<string | null>(null);

    // Recovery Modal
    const [showFixModal, setShowFixModal] = useState(false);

    // Deep Linking Effect
    useEffect(() => {
        if (navigationState.type === 'budget' && navigationState.targetId) {
            setDetailCatId(navigationState.targetId);
            clearNavigation(); // Consume the event
        }
    }, [navigationState, clearNavigation]);

    // Helper: Month Formatting
    const getDisplayMonth = () => {
        if (calendarMode === 'ethiopian') {
            const ethMonthsAmharic = [
                "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት",
                "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
            ];
            // Offset ~8 months back for rough prototype conversion
            let ethIndex = currentDate.getMonth() - 8;
            let ethYear = currentDate.getFullYear() - 8;
            if (ethIndex < 0) {
                ethIndex += 13;
            }
            if (currentDate.getMonth() >= 8 && currentDate.getDate() >= 11) {
                ethYear = currentDate.getFullYear() - 7;
            }
            return `${ethMonthsAmharic[ethIndex % 13]} ${ethYear}`;
        }
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Navigation Handlers
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // --- Calculations based on Month ---
    const calculatedBudget = useMemo(() => {
        // Use the user's preferred start date
        const startDay = state.budgetStartDate || 1;
        const { start: budgetStart, end: budgetEnd } = getCurrentBudgetMonth(startDay, currentDate);

        const transactionsThisMonth = transactions.filter(t => {
            return isDateInBudgetMonth(t.date, budgetStart, budgetEnd) && t.type === 'expense';
        });

        // 1. Calculate spent for known categories
        const catsWithSpent = budgetCategories.map(cat => {
            const spent = transactionsThisMonth
                .filter(t => t.category === cat.name)
                .reduce((sum, t) => sum + t.amount, 0);
            return { ...cat, spent };
        });

        // 2. Identify Uncategorized Transactions
        const knownCategoryNames = new Set(budgetCategories.map(c => c.name));
        const uncategorizedAmount = transactionsThisMonth
            .filter(t => !knownCategoryNames.has(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const uncategorizedCat: BudgetCategory | null = uncategorizedAmount > 0 ? {
            id: 'uncategorized',
            name: 'Other / Uncategorized',
            type: 'variable',
            allocated: 0, // No budget set for "Other"
            spent: uncategorizedAmount,
            icon: 'Alert',
            color: 'bg-slate-500',
            rolloverEnabled: false
        } : null;

        // Variable vs Fixed
        let variable = catsWithSpent.filter(c => c.type === 'variable');
        if (uncategorizedCat) variable.push(uncategorizedCat); // Add to variable list

        const fixed = catsWithSpent.filter(c => c.type === 'fixed');

        // Safe to Spend Logic
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const currentDay = isCurrentMonth ? new Date().getDate() : lastDay;
        const daysRemaining = Math.max(1, lastDay - currentDay);

        const totalVarLimit = variable.reduce((sum, c) => sum + c.allocated, 0);
        const totalVarSpent = variable.reduce((sum, c) => sum + c.spent, 0);

        const remainingVar = totalVarLimit - totalVarSpent;
        const isDeficit = remainingVar < 0;

        const safeDaily = isCurrentMonth ? remainingVar / daysRemaining : 0;

        return {
            all: catsWithSpent,
            variable,
            fixed,
            safeDaily,
            daysRemaining,
            isDeficit,
            remainingVar,
            hasUncategorized: !!uncategorizedCat
        };
    }, [budgetCategories, transactions, currentDate]);

    // --- Handlers ---

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

    const handleSaveCategory = () => {
        const hasName = !!catName.trim();
        const hasAlloc = !!catAlloc && getRawNumber(catAlloc) > 0;

        if (!hasName || !hasAlloc) {
            setCatErrors({ name: !hasName, alloc: !hasAlloc });
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        const data: BudgetCategory = {
            id: editingCategory ? editingCategory.id : Date.now().toString(),
            name: catName,
            allocated: getRawNumber(catAlloc),
            spent: editingCategory ? editingCategory.spent : 0,
            type: catType,
            icon: catIcon,
            color: catColor,
            rolloverEnabled: catRollover
        };

        if (editingCategory) updateBudgetCategory(editingCategory.id, data);
        else addBudgetCategory(data);

        setShowCategoryModal(false);
        resetCatForm();
    };

    const handleSaveSub = () => {
        const hasName = !!subName.trim();
        const hasAmount = !!subAmount && getRawNumber(subAmount) > 0;

        if (!hasName || !hasAmount) {
            setSubErrors({ name: !hasName, amount: !hasAmount });
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        const data: RecurringTransaction = {
            id: editingSub ? editingSub.id : Date.now().toString(),
            name: subName,
            amount: getRawNumber(subAmount),
            currency: 'ETB',
            category: 'Bills',
            recurrence: subCycle,
            next_due_date: subDate || new Date().toISOString().split('T')[0],
            payment_method: 'Manual',
            is_active: true,
            profile: 'Personal',
            icon: subIcon,
            notes: subNotes,
            reminderDays: subReminders.length > 0 ? subReminders : [1]
        };

        if (editingSub) updateRecurringTransaction(data);
        else addRecurringTransaction(data);

        setShowSubModal(false);
        resetSubForm();
    };

    const deleteCat = (id: string) => { deleteBudgetCategory(id); setDetailCatId(null); }
    const deleteSub = (id: string) => { deleteRecurringTransaction(id); setDetailSubId(null); }

    const resetCatForm = () => { setCatName(''); setCatAlloc(''); setCatType('variable'); setCatRollover(false); setCatColor('bg-cyan-400'); setCatErrors({ name: false, alloc: false }); }
    const resetSubForm = () => { setSubName(''); setSubAmount(''); setSubNotes(''); setSubReminders([1]); setSubErrors({ name: false, amount: false }); }

    const openAddCat = (cat?: BudgetCategory, typeOverride?: 'fixed' | 'variable') => {
        if (cat) {
            setEditingCategory(cat);
            setCatName(cat.name);
            setCatAlloc(cat.allocated.toLocaleString());
            setCatType(cat.type);
            setCatIcon(cat.icon);
            setCatColor(cat.color);
            setCatRollover(cat.rolloverEnabled || false);
        } else {
            setEditingCategory(null);
            resetCatForm();
            if (typeOverride) setCatType(typeOverride);
        }
        setShowCategoryModal(true);
    };

    const openQuickAdd = (e: React.MouseEvent, category: string, type: 'expense' | 'income') => {
        e.stopPropagation();
        const now = new Date();
        let defaultDate = now.toISOString();

        if (currentDate.getMonth() !== now.getMonth() || currentDate.getFullYear() !== now.getFullYear()) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const offsetDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
            defaultDate = offsetDate.toISOString();
        }

        openTransactionModal(undefined, { category, type, date: defaultDate });
    };

    const openAddSub = (sub?: RecurringTransaction) => {
        if (sub) {
            setEditingSub(sub);
            setSubName(sub.name);
            setSubAmount(sub.amount.toLocaleString());
            setSubCycle(sub.recurrence as any);
            setSubDate(sub.next_due_date);
            setSubIcon(sub.icon);
            setSubNotes(sub.notes || '');
            setSubReminders(sub.reminderDays || [1]);
        } else {
            setEditingSub(null);
            resetSubForm();
            setSubDate(new Date().toISOString().split('T')[0]);
        }
        setShowSubModal(true);
    };

    const toggleReminder = (day: number) => {
        setSubReminders(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const getSubHistory = (name: string) => {
        return transactions.filter(t => t.title.toLowerCase().includes(name.toLowerCase())).slice(0, 5);
    };

    const getCatHistory = (catName: string) => {
        const m = currentDate.getMonth();
        const y = currentDate.getFullYear();

        // Special Handling for "Uncategorized"
        if (catName === 'Other / Uncategorized') {
            const knownCategoryNames = new Set(budgetCategories.map(c => c.name));
            return transactions.filter(t => {
                const d = new Date(t.date);
                return !knownCategoryNames.has(t.category) && t.type === 'expense' && d.getMonth() === m && d.getFullYear() === y;
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return transactions.filter(t => {
            const d = new Date(t.date);
            return t.category === catName && t.type === 'expense' && d.getMonth() === m && d.getFullYear() === y;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    return (
        <div className="pb-28 animate-fade-in space-y-6">

            {/* Header with Month Navigation */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h2 className="text-theme-primary text-xl font-bold">Monthly Budget</h2>
                    <p className="text-theme-secondary text-xs ethiopic">ወርሀዊ በጀት</p>
                </div>
                <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-full p-1 shadow-sm">
                    <button
                        onClick={prevMonth}
                        className="w-9 h-9 flex items-center justify-center hover:bg-theme-main rounded-full text-theme-secondary hover:text-cyan-400 transition-all active:scale-95"
                    >
                        <Icons.ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold text-cyan-400 min-w-[120px] text-center font-mono tracking-tight cursor-default select-none">
                        {getDisplayMonth()}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="w-9 h-9 flex items-center justify-center hover:bg-theme-main rounded-full text-theme-secondary hover:text-cyan-400 transition-all active:scale-95"
                    >
                        <Icons.ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* 1. Safe to Spend / Recovery Dashboard */}
            {/* 1. Safe to Spend / Recovery Dashboard (UNIFIED HERO) */}
            <div className="bg-hero-gradient rounded-3xl p-6 shadow-lg relative overflow-hidden text-white">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {calculatedBudget.isDeficit ? (
                                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-rose-500/20 border border-rose-500/30">
                                        <Icons.Alert size={12} className="text-rose-300" />
                                        <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Over Budget</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                        <Icons.Check size={12} className="text-emerald-300" />
                                        <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Safe to Spend</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-indigo-200/80 mt-2 font-medium">{calculatedBudget.daysRemaining} days remaining</p>
                        </div>

                        {/* AI Action */}
                        <button
                            onClick={() => setActiveTab('ai')}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                        >
                            <Icons.AI size={16} className="text-indigo-100" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 mb-6">
                        <span className="text-sm text-indigo-200 font-medium">Daily Limit</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold tracking-tight">
                                {isPrivacyMode ? '••••' : Math.abs(Math.round(calculatedBudget.safeDaily)).toLocaleString()}
                            </span>
                            <span className="text-lg font-medium text-indigo-200/60">ETB</span>
                        </div>
                    </div>

                    {/* Progress / Status Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-indigo-200/70">
                            <span>{calculatedBudget.isDeficit ? 'Deficit' : 'Remaining'}</span>
                            <span>{isPrivacyMode ? '••••' : Math.abs(calculatedBudget.remainingVar).toLocaleString()} ETB</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden flex">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${calculatedBudget.isDeficit ? 'bg-rose-500' : 'bg-emerald-400'}`}
                                style={{ width: `${Math.min(100, (Math.abs(calculatedBudget.remainingVar) / (calculatedBudget.variable.reduce((s, c) => s + c.allocated, 0) || 1)) * 100)}%` }}
                            ></div>
                        </div>
                        {calculatedBudget.isDeficit && (
                            <p className="text-[10px] text-rose-300 mt-2 text-center bg-rose-500/10 py-1 rounded-lg border border-rose-500/20">
                                Tip: Save {Math.round(Math.abs(calculatedBudget.safeDaily)).toLocaleString()} ETB/day to recover.
                            </p>
                        )}
                    </div>

                    {calculatedBudget.isDeficit && (
                        <button
                            onClick={() => setShowFixModal(true)}
                            className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Icons.Repeat size={14} /> Fix Budget
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Variable Expenses (Health Bars) - COLLAPSIBLE */}
            <div>
                <div
                    className="flex justify-between items-center mb-3 px-1 cursor-pointer select-none"
                    onClick={() => toggleSection('variable')}
                >
                    <h3 className="text-sm font-bold text-theme-secondary flex items-center gap-2">
                        Variable budgets
                        <Icons.ChevronRight size={14} className={`transition-transform duration-300 ${expandedSections.variable ? 'rotate-90' : ''}`} />
                    </h3>
                    <button
                        onClick={(e) => { e.stopPropagation(); openAddCat(undefined, 'variable'); }}
                        className="text-xs text-cyan-400 font-medium bg-cyan-500/10 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 flex items-center gap-1"
                    >
                        <Icons.Plus size={12} /> Add Category
                    </button>
                </div>

                {expandedSections.variable && (
                    <div className="space-y-3 animate-fade-in">
                        {calculatedBudget.variable.map(cat => {
                            const isUncategorized = cat.id === 'uncategorized';
                            // For Uncategorized, there's no limit, so just show spent
                            const percent = isUncategorized ? 100 : Math.min((cat.spent / (cat.allocated || 1)) * 100, 100);
                            const isOver = !isUncategorized && cat.spent > cat.allocated;
                            const statusColor = isUncategorized ? 'bg-slate-500' : (percent > 95 ? 'bg-rose-500' : percent > 75 ? 'bg-yellow-400' : 'bg-emerald-500');
                            const Icon = BUDGET_ICONS.find(i => i.id === cat.icon)?.icon || Icons.Shopping;

                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => setDetailCatId(cat.id)}
                                    className="soft-card p-5 rounded-3xl cursor-pointer relative overflow-hidden group hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between min-h-[170px]"
                                >
                                    {/* Top Row: Icon + Quick Add */}
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color.replace('bg-', 'text-')} bg-theme-main/50 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={24} />
                                        </div>

                                        <button
                                            onClick={(e) => openQuickAdd(e, cat.name, 'expense')}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-theme-main border border-theme text-theme-secondary hover:text-cyan-400 hover:border-cyan-500 transition-colors shadow-sm"
                                            title="Quick Add Expense"
                                        >
                                            <Icons.Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="relative z-10 mt-4">
                                        <h4 className="font-bold text-theme-primary text-xl leading-tight mb-1">{cat.name}</h4>
                                        <div className="flex justify-between items-end">
                                            <p className="text-xs text-theme-secondary font-medium">
                                                {isPrivacyMode ? '••••' : (cat.allocated - cat.spent).toLocaleString()} left
                                            </p>
                                            <span className="text-[10px] font-bold text-theme-secondary/50">{Math.round(percent)}%</span>
                                        </div>

                                        <div className="w-full h-1.5 bg-theme-main rounded-full overflow-hidden mt-3">
                                            <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 3. Fixed Envelopes - COLLAPSIBLE */}
            <div>
                <div
                    className="flex justify-between items-center mb-3 px-1 cursor-pointer select-none"
                    onClick={() => toggleSection('fixed')}
                >
                    <h3 className="text-sm font-bold text-theme-secondary flex items-center gap-2">
                        Fixed envelopes
                        <Icons.ChevronRight size={14} className={`transition-transform duration-300 ${expandedSections.fixed ? 'rotate-90' : ''}`} />
                    </h3>
                    <button
                        onClick={(e) => { e.stopPropagation(); openAddCat(undefined, 'fixed'); }}
                        className="text-xs text-cyan-400 font-medium bg-cyan-500/10 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 flex items-center gap-1"
                    >
                        <Icons.Plus size={12} /> Add Category
                    </button>
                </div>

                {expandedSections.fixed && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {calculatedBudget.fixed.map(cat => {
                            const percent = Math.min((cat.spent / (cat.allocated || 1)) * 100, 100);
                            const Icon = BUDGET_ICONS.find(i => i.id === cat.icon)?.icon || Icons.Home;

                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => setDetailCatId(cat.id)}
                                    className="soft-card p-5 rounded-3xl cursor-pointer relative overflow-hidden group hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between min-h-[170px]"
                                >
                                    {/* Envelope Flap Effect - Subtle */}
                                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-3xl"></div>

                                    {/* Top Row: Icon + Quick Add */}
                                    <div className="flex justify-between items-start relative z-10">
                                        {/* Hyper-Realistic Icon Container */}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color.replace('bg-', 'text-')} bg-theme-main/50 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={24} />
                                        </div>

                                        {/* Quick Add Button */}
                                        <button
                                            onClick={(e) => openQuickAdd(e, cat.name, 'expense')}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-theme-main border border-theme text-theme-secondary hover:text-cyan-400 hover:border-cyan-500 transition-colors shadow-sm"
                                            title="Quick Add Expense"
                                        >
                                            <Icons.Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="relative z-10 mt-4">
                                        <h4 className="font-bold text-theme-primary text-xl leading-tight mb-1">{cat.name}</h4>
                                        <p className="text-xs text-theme-secondary font-medium">
                                            {isPrivacyMode ? '••••' : (cat.allocated - cat.spent).toLocaleString()} left
                                        </p>

                                        <div className="w-full h-1.5 bg-theme-main rounded-full overflow-hidden mt-3">
                                            <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 4. Subscriptions & Bills - COLLAPSIBLE */}
            <div className="bg-theme-card rounded-3xl p-6 border border-theme shadow-md transition-all">
                <div
                    className="flex justify-between items-center mb-6 cursor-pointer select-none"
                    onClick={() => toggleSection('subs')}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Icons.Recurring size={16} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-theme-primary">Subscriptions & Bills</h3>
                            <Icons.ChevronRight size={16} className={`text-theme-secondary transition-transform duration-300 ${expandedSections.subs ? 'rotate-90' : ''}`} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); scanForSubscriptions(); }} className="text-xs text-theme-secondary hover:text-cyan-400 flex items-center gap-1 border border-theme px-3 py-1.5 rounded-full transition-colors">
                            <Icons.Search size={12} /> Scan
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openAddSub(); }} className="text-xs text-white font-bold bg-cyan-500 px-3 py-1.5 rounded-full hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all">
                            + Add
                        </button>
                    </div>
                </div>

                {expandedSections.subs && (
                    <div className="space-y-3 animate-fade-in">
                        {recurringTransactions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 px-6 text-center border-2 border-dashed border-theme-secondary/20 rounded-2xl bg-theme-main/30">
                                <div className="w-16 h-16 rounded-full bg-theme-card flex items-center justify-center mb-4 shadow-inner border border-theme">
                                    <Icons.Zap size={28} className="text-theme-secondary opacity-50" />
                                </div>
                                <p className="text-theme-primary font-bold text-sm mb-1">No bills tracked</p>
                                <p className="text-theme-secondary text-xs mb-4">Track recurring payments like Rent, Ethio Tel, or DSTV.</p>
                                <button
                                    onClick={() => openAddSub()}
                                    className="text-xs font-bold text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-full hover:bg-cyan-500/10 transition-colors"
                                >
                                    + Add Bill
                                </button>
                            </div>
                        )}
                        {recurringTransactions.map(sub => {
                            const iconObj = SUBSCRIPTION_ICONS.find(i => i.id === sub.icon) || SUBSCRIPTION_ICONS[0];
                            return (
                                <div
                                    key={sub.id}
                                    onClick={() => setDetailSubId(sub.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-theme-main/50 border border-theme hover:border-cyan-500/30 cursor-pointer transition-colors group relative overflow-hidden"
                                >
                                    {/* Hover Highlight */}
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex items-center gap-4 relative z-10">
                                        {/* Realistic Icon */}
                                        <div className={`w-12 h-12 rounded-2xl ${iconObj.color.includes('emerald') ? 'text-emerald-400' : 'text-cyan-400'} bg-white/5 flex items-center justify-center`}>
                                            <iconObj.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-theme-primary group-hover:text-cyan-400 transition-colors">{sub.name}</h4>
                                            <p className="text-[10px] text-theme-secondary flex items-center gap-1 mt-0.5">
                                                <Icons.Calendar size={10} /> Due {new Date(sub.next_due_date).getDate()}{['st', 'nd', 'rd'][((new Date(sub.next_due_date).getDate()) % 10) - 1] || 'th'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="font-bold text-theme-primary text-base">{isPrivacyMode ? '••••' : sub.amount.toLocaleString()}</p>
                                        <span className="text-[9px] font-bold text-theme-secondary uppercase bg-theme-card px-1.5 py-0.5 rounded border border-theme inline-block mt-1">
                                            {sub.recurrence}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* FIX BUDGET MODAL - DIALOG BOUNCE */}
            {showFixModal && (
                <div className="fixed inset-0 modal-overlay z-[90] flex items-center justify-center p-6" onClick={() => setShowFixModal(false)}>
                    <div className="modal-content w-full max-w-sm rounded-3xl p-6 animate-dialog text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <Icons.Alert size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-theme-primary mb-2">Budget Rescue Plan</h3>
                        <p className="text-sm text-theme-secondary mb-6">
                            You are over budget by <span className="text-rose-400 font-bold">{Math.abs(calculatedBudget.remainingVar).toLocaleString()} ETB</span>.
                            Let's get back on track.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => { setShowFixModal(false); setActiveTab('accounts'); }}
                                className="w-full py-4 bg-emerald-500 rounded-2xl text-white font-bold hover:bg-emerald-400 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <Icons.Transfer size={18} /> Cover from Savings
                            </button>
                            <button
                                onClick={() => setShowFixModal(false)}
                                className="w-full py-4 bg-theme-main border border-theme rounded-2xl text-theme-secondary font-bold hover:text-white flex items-center justify-center gap-2"
                            >
                                <Icons.Edit size={18} /> Adjust Categories
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 modal-overlay z-[90] flex items-center justify-center p-4" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal-content w-full max-w-sm rounded-3xl p-6 animate-scale-up relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                        <h3 className="text-lg font-bold text-theme-primary mb-4">{editingCategory ? 'Edit Budget' : 'New Budget Category'}</h3>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={e => { setCatName(e.target.value); setCatErrors(p => ({ ...p, name: false })); }}
                                    placeholder="Category Name"
                                    className={`w-full bg-theme-main border rounded-xl p-3 text-sm text-theme-primary outline-none focus:border-cyan-500 ${catErrors.name ? 'border-rose-500' : 'border-theme'}`}
                                />
                                {catErrors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={catAlloc}
                                    onChange={e => { setCatAlloc(formatNumberInput(e.target.value)); setCatErrors(p => ({ ...p, alloc: false })); }}
                                    placeholder="Monthly Limit"
                                    className={`w-full bg-theme-main border rounded-xl p-3 text-sm text-theme-primary outline-none focus:border-cyan-500 ${catErrors.alloc ? 'border-rose-500' : 'border-theme'}`}
                                />
                                {catErrors.alloc && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                            </div>

                            <div className="flex gap-2">
                                {['variable', 'fixed'].map(t => (
                                    <button key={t} onClick={() => setCatType(t as any)} className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border ${catType === t ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-theme-main border-theme text-theme-secondary'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Rollover Toggle */}
                            <div className="flex items-center justify-between bg-theme-main p-3 rounded-xl border border-theme">
                                <span className="text-xs font-medium text-theme-secondary">Enable Rollover</span>
                                <button
                                    onClick={() => setCatRollover(!catRollover)}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${catRollover ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${catRollover ? 'left-5' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Icon Picker */}
                            <div className="grid grid-cols-5 gap-2">
                                {BUDGET_ICONS.map(i => (
                                    <button key={i.id} onClick={() => setCatIcon(i.id)} className={`p-2 rounded-lg flex items-center justify-center border ${catIcon === i.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-theme-main border-theme text-theme-secondary'}`}>
                                        <i.icon size={16} />
                                    </button>
                                ))}
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORY_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCatColor(c)}
                                            className={`w-8 h-8 rounded-full ${c} ${catColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSaveCategory} className="w-full py-3 bg-cyan-500 rounded-xl text-black font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Drilldown Category Modal */}
            {detailCatId && (
                <div className="fixed inset-0 modal-overlay z-[80] flex items-end sm:items-center justify-center" onClick={() => setDetailCatId(null)}>
                    <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] h-[80vh] animate-slide-up flex flex-col relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                        {(() => {
                            const isUncategorized = detailCatId === 'uncategorized';
                            const cat = isUncategorized
                                ? { id: 'uncategorized', name: 'Other / Uncategorized' }
                                : budgetCategories.find(c => c.id === detailCatId);

                            if (!cat) return null;
                            const history = getCatHistory(cat.name);

                            return (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-theme-primary">{cat.name} History</h3>
                                            <p className="text-xs text-cyan-400 font-medium">{getDisplayMonth()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {!isUncategorized && (
                                                <>
                                                    <button onClick={() => { openAddCat(cat as BudgetCategory); setDetailCatId(null); }} className="p-2 bg-theme-main rounded-full border border-theme"><Icons.Edit size={16} /></button>
                                                    <button onClick={() => deleteCat(cat.id)} className="p-2 bg-theme-main rounded-full border border-theme text-rose-500"><Icons.Delete size={16} /></button>
                                                </>
                                            )}
                                            <button onClick={() => setDetailCatId(null)} className="p-2 bg-theme-main rounded-full border border-theme"><Icons.Close size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3">
                                        {history.map(tx => (
                                            <div key={tx.id} className="flex justify-between p-3 bg-theme-main rounded-xl border border-theme">
                                                <div>
                                                    <p className="text-sm font-bold text-theme-primary">{tx.title}</p>
                                                    <p className="text-xs text-theme-secondary">{formatDate(tx.date)}</p>
                                                    {/* For uncategorized, show what the actual category name is */}
                                                    {isUncategorized && <p className="text-[9px] text-cyan-400 bg-cyan-500/10 inline-block px-1 rounded mt-1">{tx.category}</p>}
                                                </div>
                                                <p className="text-rose-500 font-bold">-{tx.amount.toLocaleString()}</p>
                                            </div>
                                        ))}
                                        {history.length === 0 && <p className="text-center text-xs text-theme-secondary italic mt-10">No transactions in {getDisplayMonth()}.</p>}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Add Subscription Modal */}
            {showSubModal && (
                <div className="fixed inset-0 modal-overlay z-[90] flex items-center justify-center p-4" onClick={() => setShowSubModal(false)}>
                    <div className="modal-content w-full max-w-sm rounded-3xl p-6 animate-scale-up relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                        <h3 className="text-lg font-bold text-theme-primary mb-4">{editingSub ? 'Edit Subscription' : 'New Subscription'}</h3>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={subName}
                                    onChange={e => { setSubName(e.target.value); setSubErrors(p => ({ ...p, name: false })); }}
                                    placeholder="Service Name (e.g. Netflix)"
                                    className={`w-full bg-theme-main border rounded-xl p-3 text-sm text-theme-primary outline-none focus:border-cyan-500 ${subErrors.name ? 'border-rose-500' : 'border-theme'}`}
                                />
                                {subErrors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                            </div>

                            <div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={subAmount}
                                    onChange={e => { setSubAmount(formatNumberInput(e.target.value)); setSubErrors(p => ({ ...p, amount: false })); }}
                                    placeholder="Amount"
                                    className={`w-full bg-theme-main border rounded-xl p-3 text-sm text-theme-primary outline-none focus:border-cyan-500 ${subErrors.amount ? 'border-rose-500' : 'border-theme'}`}
                                />
                                {subErrors.amount && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                            </div>

                            {/* Explicit Date Label */}
                            <div>
                                <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Next Due Date (Gregorian/GC)</label>
                                <input type="date" value={subDate} onChange={e => setSubDate(e.target.value)} className="w-full bg-theme-main border border-theme rounded-xl p-3 text-sm text-theme-primary outline-none" />
                            </div>

                            {/* Icon Picker */}
                            <HorizontalScroll className="flex gap-2 pb-2">
                                {SUBSCRIPTION_ICONS.map(i => (
                                    <button key={i.id} onClick={() => setSubIcon(i.id)} className={`shrink-0 p-2 rounded-xl border flex flex-col items-center gap-1 min-w-[60px] ${subIcon === i.id ? 'bg-cyan-500/20 border-cyan-500' : 'bg-theme-main border-theme'}`}>
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${i.color} flex items-center justify-center text-white text-xs`}><i.icon size={14} /></div>
                                        <span className="text-[10px]">{i.label}</span>
                                    </button>
                                ))}
                            </HorizontalScroll>

                            {/* Reminder Settings */}
                            <div>
                                <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 block">Notify Me</label>
                                <div className="flex gap-2">
                                    {[1, 3, 7].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => toggleReminder(day)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${subReminders.includes(day) ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-theme-main border-theme text-theme-secondary'}`}
                                        >
                                            {day} Day{day > 1 ? 's' : ''} Before
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea value={subNotes} onChange={e => setSubNotes(e.target.value)} placeholder="Notes (e.g. Contract ID)" className="w-full bg-theme-main border border-theme rounded-xl p-3 text-sm text-theme-primary outline-none h-20 resize-none" />

                            <button onClick={handleSaveSub} className="w-full py-3 bg-cyan-500 rounded-xl text-black font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Drilldown Subscription Modal */}
            {detailSubId && (
                <div className="fixed inset-0 modal-overlay z-[80] flex items-end sm:items-center justify-center" onClick={() => setDetailSubId(null)}>
                    <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] h-[70vh] animate-slide-up flex flex-col relative" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                        {(() => {
                            const sub = recurringTransactions.find(s => s.id === detailSubId);
                            if (!sub) return null;
                            const history = getSubHistory(sub.name);

                            return (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                                {(() => { const I = SUBSCRIPTION_ICONS.find(i => i.id === sub.icon)?.icon || Icons.Zap; return <I size={32} /> })()}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-theme-primary">{sub.name}</h3>
                                                <p className="text-sm text-theme-secondary">{sub.amount.toLocaleString()} ETB / {sub.recurrence}</p>
                                                <p className="text-xs text-cyan-400 mt-1">Next due: {sub.next_due_date}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { openAddSub(sub); setDetailSubId(null); }} className="p-2 bg-theme-main rounded-full border border-theme"><Icons.Edit size={16} /></button>
                                            <button onClick={() => deleteSub(sub.id)} className="p-2 bg-theme-main rounded-full border border-theme text-rose-500"><Icons.Delete size={16} /></button>
                                        </div>
                                    </div>

                                    {sub.notes && (
                                        <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 mb-6">
                                            <p className="text-xs text-yellow-500 font-bold uppercase mb-1">Notes</p>
                                            <p className="text-sm text-theme-primary">{sub.notes}</p>
                                        </div>
                                    )}

                                    {/* Reminder status */}
                                    {sub.reminderDays && sub.reminderDays.length > 0 && (
                                        <div className="flex items-center gap-2 mb-6">
                                            <Icons.Bell size={14} className="text-theme-secondary" />
                                            <p className="text-xs text-theme-secondary">Notifies {sub.reminderDays.join(', ')} days before due.</p>
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-y-auto space-y-3">
                                        <h4 className="font-bold text-theme-secondary text-xs uppercase tracking-wider mb-2">Payment History</h4>
                                        {history.map(tx => (
                                            <div key={tx.id} className="flex justify-between p-3 bg-theme-main rounded-xl border border-theme">
                                                <div>
                                                    <p className="text-sm font-bold text-theme-primary">{tx.title}</p>
                                                    <p className="text-xs text-theme-secondary">{formatDate(tx.date)}</p>
                                                </div>
                                                <p className="text-rose-500 font-bold">-{tx.amount.toLocaleString()}</p>
                                            </div>
                                        ))}
                                        {history.length === 0 && <p className="text-center text-xs text-theme-secondary italic mt-4">No matching transactions found.</p>}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

        </div>
    );
};
