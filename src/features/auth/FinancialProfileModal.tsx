import React, { useState, useMemo } from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { IncomeSource } from '@/types';
import { HorizontalScroll } from '@/shared/components/HorizontalScroll';

const INCOME_TYPES = [
    { id: 'Salary', icon: Icons.Briefcase, label: 'Salary', color: 'bg-emerald-500' },
    { id: 'Business', icon: Icons.Store, label: 'Business', color: 'bg-yellow-500' },
    { id: 'Freelance', icon: Icons.Laptop, label: 'Freelance', color: 'bg-purple-500' },
    { id: 'Rent', icon: Icons.Home, label: 'Rent', color: 'bg-indigo-500' },
    { id: 'Side Hustle', icon: Icons.Zap, label: 'Side Hustle', color: 'bg-orange-500' },
    { id: 'Iqub', icon: Icons.Users, label: 'Iqub', color: 'bg-pink-500' },
    { id: 'Other', icon: Icons.More, label: 'Other', color: 'bg-slate-500' },
];

const FREQUENCIES = ['Monthly', 'Weekly', 'Bi-Weekly', 'Irregular'];

interface Props {
    onClose: () => void;
}

export const FinancialProfileModal: React.FC<Props> = ({ onClose }) => {
    const { state, addIncomeSource, updateIncomeSource, deleteIncomeSource, setActiveTab, openTransactionModal, formatDate, setBudgetStartDate, setUserName } = useAppContext();
    const { incomeSources, accounts, transactions } = state;

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<IncomeSource['type']>('Salary');
    const [frequency, setFrequency] = useState<IncomeSource['frequency']>('Monthly');
    const [payday, setPayday] = useState('');
    const [remind, setRemind] = useState(false);
    const [linkedAccount, setLinkedAccount] = useState('');

    // Validation State
    const [errors, setErrors] = useState({ name: false, amount: false });

    const formatNumberInput = (value: string) => {
        const val = value.replace(/,/g, '');
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join('.');
        }
        return value;
    };

    const resetForm = () => {
        setName('');
        setAmount('');
        setType('Salary');
        setFrequency('Monthly');
        setPayday('');
        setRemind(false);
        setLinkedAccount('');
        setIsAdding(false);
        setEditingId(null);
        setErrors({ name: false, amount: false });
    }

    const openEdit = (source: IncomeSource) => {
        setEditingId(source.id);
        setName(source.name);
        setAmount(source.amount.toLocaleString());
        setType(source.type);
        setFrequency(source.frequency);
        setPayday(source.payday ? source.payday.toString() : '');
        setRemind(source.remindPayday || false);
        setLinkedAccount(source.linkedAccountId || '');
        setIsAdding(true);
        setErrors({ name: false, amount: false });
    };

    const handleSave = () => {
        // Validation
        const newErrors = {
            name: !name.trim(),
            amount: !amount || parseFloat(amount.replace(/,/g, '')) === 0
        };

        if (newErrors.name || newErrors.amount) {
            setErrors(newErrors);
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        const sourceData: IncomeSource = {
            id: editingId || Date.now().toString(),
            name,
            type,
            amount: parseFloat(amount.replace(/,/g, '')),
            frequency,
            payday: payday ? parseInt(payday) : undefined,
            stability: (type === 'Salary' || type === 'Rent') ? 'Stable' : 'Variable',
            remindPayday: remind,
            linkedAccountId: linkedAccount
        };

        if (editingId) {
            updateIncomeSource(sourceData);
            resetForm();
        } else {
            addIncomeSource(sourceData);
            setShowSuccess(true); // Trigger success screen
        }
    };

    // --- QUICK ACTION: RECEIVE NOW ---
    const handleReceiveNow = (source: IncomeSource) => {
        onClose(); // Close this modal
        openTransactionModal(undefined, {
            type: 'income',
            title: source.name,
            amount: source.amount,
            category: source.type, // Map Source Type to Category
            accountId: source.linkedAccountId
        });
    };

    const getLastReceivedDate = (sourceName: string) => {
        // Find latest income transaction with same title
        const matches = transactions
            .filter(t => t.type === 'income' && t.title.toLowerCase() === sourceName.toLowerCase())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return matches.length > 0 ? matches[0].date : null;
    };

    const totalMonthlyIncome = useMemo(() => {
        return incomeSources.reduce((sum, s) => {
            if (s.frequency === 'Monthly') return sum + s.amount;
            if (s.frequency === 'Weekly') return sum + (s.amount * 4);
            if (s.frequency === 'Bi-Weekly') return sum + (s.amount * 2);
            return sum;
        }, 0);
    }, [incomeSources]);

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-emerald-500/30 relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                        <Icons.CheckCircle size={48} strokeWidth={3} />
                    </div>

                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Profile Updated!</h3>
                    <p className="text-gray-400 text-sm mb-10 leading-relaxed px-4">Your income source has been saved. We can now plan your budget with <span className="text-emerald-400 font-bold">precision</span>.</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => { setShowSuccess(false); onClose(); setActiveTab('budget'); }}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-[1.5rem] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all active:scale-95"
                        >
                            Go to Budget
                        </button>
                        <button
                            onClick={() => { setShowSuccess(false); resetForm(); }}
                            className="w-full py-4 bg-gray-800 text-gray-400 font-black rounded-[1.5rem] hover:text-white transition-all border border-gray-700 hover:border-gray-600"
                        >
                            Add Another Source
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] bg-[#f6f6f8] dark:bg-black flex flex-col animate-slide-up overflow-hidden transition-colors duration-500">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-[#f6f6f8] to-[#f6f6f8] dark:from-gray-900 dark:via-black dark:to-black z-0 pointer-events-none"></div>

            {/* Header / Nav */}
            <div className="relative z-10 flex items-center justify-between p-6 shrink-0">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all"
                >
                    <Icons.ChevronLeft size={20} />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Identity Hub</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Content Scrollable Area */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">

                {/* Profile Hero */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-24 h-24 mb-4">
                        {/* Completion Ring */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-gray-800" />
                            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="289" strokeDashoffset="50" className="text-cyan-500" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                            <Icons.User size={40} className="text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
                            <Icons.Edit size={12} className="text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{state.userName || 'User'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">+251 {state.userPhone?.replace(/^0/, '') || '--- --- ---'}</p>
                </div>

                {/* Income Sources Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Income Sources</h3>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1.5 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
                        >
                            + Add New
                        </button>
                    </div>

                    {incomeSources.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Wallet size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No income sources added yet.</p>
                            <button onClick={() => setIsAdding(true)} className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">Add Income</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {incomeSources.map(source => {
                                const iconObj = INCOME_TYPES.find(t => t.id === source.type) || INCOME_TYPES[0];
                                return (
                                    <div key={source.id} onClick={() => openEdit(source)} className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconObj.color.replace('bg-', 'bg-').replace('500', '500/10 text-' + iconObj.color.replace('bg-', '') + '-600 dark:text-' + iconObj.color.replace('bg-', '') + '-400')}`}>
                                                <iconObj.icon size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-base">{source.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{source.frequency} • {source.amount.toLocaleString()} ETB</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors">
                                            <Icons.ChevronRight size={16} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Settings Section */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">App Settings</h3>
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Icons.Moon size={20} />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">Appearance</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">System</span>
                                <Icons.ChevronRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Icons.Globe size={20} />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">Language</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">English</span>
                                <Icons.ChevronRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                    <Icons.Bell size={20} />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">Notifications</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">On</span>
                                <Icons.ChevronRight size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget Start Date */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Icons.Calendar size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Budget Cycle</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Starts on day {state.budgetStartDate || 1}</p>
                        </div>
                    </div>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={state.budgetStartDate || 1}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= 31) {
                                setBudgetStartDate(val);
                            }
                        }}
                        className="w-12 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl text-center text-sm font-black text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                </div>

                <div className="text-center pb-8">
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">Liq Finance v1.0.0</p>
                </div>
            </div>

            {/* Add/Edit Form Overlay */}
            {isAdding && (
                <div className="absolute inset-0 z-20 bg-[#f6f6f8] dark:bg-black flex flex-col animate-slide-up">
                    <div className="flex items-center justify-between p-6 shrink-0">
                        <button
                            onClick={resetForm}
                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-all"
                        >
                            <Icons.ChevronLeft size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Income' : 'New Income'}</h2>
                        <div className="w-10" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Source Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: false })); }}
                                placeholder="e.g. Primary Job"
                                className={`w-full bg-white dark:bg-gray-900 p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white outline-none border transition-all ${errors.name ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/5' : 'border-gray-200 dark:border-gray-800 focus:border-cyan-500'}`}
                            />
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Amount</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400">ETB</div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={e => { setAmount(formatNumberInput(e.target.value)); setErrors(p => ({ ...p, amount: false })); }}
                                    placeholder="0.00"
                                    className={`w-full bg-white dark:bg-gray-900 p-4 pl-16 rounded-2xl text-2xl font-black text-gray-900 dark:text-white outline-none border transition-all font-mono tracking-tight ${errors.amount ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/5' : 'border-gray-200 dark:border-gray-800 focus:border-cyan-500'}`}
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Type</label>
                            <HorizontalScroll className="flex gap-3 pb-2">
                                {INCOME_TYPES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id as any)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border min-w-[90px] transition-all duration-300 ${type === t.id ? `bg-${t.color.replace('bg-', '')}-50 dark:bg-${t.color.replace('bg-', '')}-500/10 border-${t.color.replace('bg-', '')}-500 shadow-lg scale-105` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${t.color.replace('bg-', 'text-')}-500 dark:${t.color.replace('bg-', 'text-')}-400 bg-gray-50 dark:bg-white/5`}>
                                            <t.icon size={20} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${type === t.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t.label}</span>
                                    </button>
                                ))}
                            </HorizontalScroll>
                        </div>

                        {/* Frequency */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Frequency</label>
                            <div className="grid grid-cols-2 gap-3">
                                {FREQUENCIES.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFrequency(f as any)}
                                        className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${frequency === f ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 mt-auto flex gap-3">
                            {editingId && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this income source?')) {
                                            deleteIncomeSource(editingId);
                                            resetForm();
                                        }
                                    }}
                                    className="p-4 rounded-[1.5rem] bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-95"
                                >
                                    <Icons.Delete size={20} />
                                </button>
                            )}
                            <button onClick={handleSave} className="flex-1 py-4 rounded-[1.5rem] bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-[0.98]">
                                {editingId ? 'Update Source' : 'Save Source'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
