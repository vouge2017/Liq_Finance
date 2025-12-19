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
    const { state, addIncomeSource, updateIncomeSource, deleteIncomeSource, setActiveTab, openTransactionModal, formatDate, setBudgetStartDate } = useAppContext();
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
            <div className="fixed inset-0 modal-overlay z-[110] flex items-center justify-center p-4" onClick={onClose}>
                <div className="modal-content w-full max-w-sm rounded-[2.5rem] p-8 animate-scale-up text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-emerald-500/30 relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                        <Icons.CheckCircle size={48} strokeWidth={3} />
                    </div>

                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Profile Updated!</h3>
                    <p className="text-theme-secondary text-sm mb-10 leading-relaxed px-4">Your income source has been saved. We can now plan your budget with <span className="text-emerald-400 font-bold">precision</span>.</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => { setShowSuccess(false); onClose(); setActiveTab('budget'); }}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all active:scale-95"
                        >
                            Go to Budget
                        </button>
                        <button
                            onClick={() => { setShowSuccess(false); resetForm(); }}
                            className="w-full py-4 bg-theme-main/50 text-theme-secondary font-black rounded-2xl hover:text-white transition-all border border-theme hover:border-theme-secondary/30"
                        >
                            Add Another Source
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 modal-overlay z-[110] flex items-center justify-center p-4" onClick={onClose}>
            <div className="modal-content w-full max-w-md rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-scale-up h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Drag Handle */}
                <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 sm:hidden shrink-0" />

                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-theme-primary">Financial Profile</h2>
                        <p className="text-xs text-theme-secondary">Manage your income sources</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isAdding && (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                                title="Add Income Source"
                            >
                                <Icons.Plus size={20} strokeWidth={3} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2.5 rounded-xl bg-theme-main border border-theme text-theme-secondary hover:text-white transition-all">
                            <Icons.Close size={20} />
                        </button>
                    </div>
                </div>

                {/* SUMMARY CARD */}
                {!isAdding && (
                    <div className="space-y-4 mb-6 shrink-0">
                        {/* Summary Card */}
                        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-xl shadow-emerald-500/20 group">
                            {/* Decorative background glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-emerald-100/80 uppercase font-black tracking-[0.2em] mb-1">Total Monthly Income</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white tracking-tight">{totalMonthlyIncome.toLocaleString()}</span>
                                        <span className="text-sm font-bold text-emerald-100/80">ETB</span>
                                    </div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                    <Icons.Coins className="text-white" size={28} />
                                </div>
                            </div>
                        </div>

                        {/* Budget Start Date Setting */}
                        <div className="bg-theme-card/50 backdrop-blur-md p-4 rounded-2xl border border-theme flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                    <Icons.Calendar size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-theme-primary text-sm">Budget Start Date</h4>
                                    <p className="text-[10px] text-theme-secondary uppercase tracking-wider">Monthly Cycle</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-theme-main p-1 rounded-xl border border-theme">
                                <span className="text-[10px] font-black text-cyan-500 px-2">DAY</span>
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
                                    className="w-10 bg-theme-card p-1.5 rounded-lg text-center text-sm font-black text-theme-primary border-none outline-none focus:ring-1 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* List of Sources */}
                {!isAdding && (
                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 no-scrollbar">
                        {incomeSources.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-theme-secondary/20 rounded-[2.5rem] bg-theme-main/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="w-24 h-24 rounded-full bg-theme-card flex items-center justify-center mb-6 shadow-2xl border border-theme relative z-10">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse"></div>
                                    <Icons.Wallet size={40} className="text-theme-secondary opacity-40" />
                                </div>
                                <h3 className="text-theme-primary font-black text-xl mb-2 relative z-10">Income not set</h3>
                                <p className="text-theme-secondary text-sm mb-8 max-w-[220px] leading-relaxed relative z-10">
                                    Add your salary or business income to unlock <span className="text-emerald-400 font-bold">smart budgeting</span>.
                                </p>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95"
                                >
                                    <Icons.Plus size={20} strokeWidth={3} /> Add Income Source
                                </button>
                            </div>
                        )}

                        {incomeSources.map(source => {
                            const iconObj = INCOME_TYPES.find(t => t.id === source.type) || INCOME_TYPES[0];
                            const lastReceived = getLastReceivedDate(source.name);
                            const isReceivedThisMonth = lastReceived && new Date(lastReceived).getMonth() === new Date().getMonth();

                            return (
                                <div key={source.id} className="bg-theme-card/40 backdrop-blur-sm p-4 rounded-[1.5rem] border border-theme group hover:border-cyan-500/40 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${iconObj.color.replace('bg-', 'bg-').replace('500', '500/10 text-' + iconObj.color.replace('bg-', ''))}`}>
                                                <iconObj.icon size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-theme-primary tracking-tight">{source.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-cyan-400">{source.amount.toLocaleString()} ETB</span>
                                                    <span className="w-1 h-1 rounded-full bg-theme-secondary/30"></span>
                                                    <span className="text-[10px] text-theme-secondary uppercase font-black tracking-wider">{source.frequency}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openEdit(source)}
                                            className="flex items-center gap-2 px-3 py-2 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500 shadow-sm"
                                        >
                                            <Icons.Edit size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Edit</span>
                                        </button>
                                    </div>

                                    {/* Action & Status Row */}
                                    <div className="flex items-center justify-between pt-4 border-t border-theme/30">
                                        <div className="flex items-center gap-2 bg-theme-main/50 px-3 py-1.5 rounded-full border border-theme/50">
                                            <div className={`w-2 h-2 rounded-full ${isReceivedThisMonth ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-theme-secondary/30'}`}></div>
                                            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-tighter">
                                                {lastReceived ? `Last: ${formatDate(lastReceived)}` : 'No history'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleReceiveNow(source)}
                                            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 border border-cyan-500/20 hover:border-cyan-500 shadow-sm"
                                        >
                                            <Icons.Plus size={14} strokeWidth={3} />
                                            Receive
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Add/Edit Form */}
                {isAdding ? (
                    <div className="bg-theme-main/50 backdrop-blur-xl p-6 rounded-[2rem] border border-theme space-y-6 animate-fade-in flex-1 overflow-y-auto no-scrollbar shadow-inner">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <Icons.Plus size={18} />
                            </div>
                            <h3 className="font-black text-theme-primary tracking-tight">{editingId ? 'Edit Income Source' : 'New Income Source'}</h3>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${errors.name ? 'text-rose-500' : 'text-theme-secondary'}`}>Source Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: false })); }}
                                placeholder="e.g. Primary Job"
                                className={`w-full bg-theme-card/80 p-4 rounded-2xl text-sm font-bold outline-none border transition-all ${errors.name ? 'border-rose-500 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-theme focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]'}`}
                            />
                            {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">Required</p>}
                        </div>

                        {/* Income Type Carousel */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-theme-secondary">Income Type</label>
                            <HorizontalScroll className="flex gap-3 pb-2">
                                {INCOME_TYPES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id as any)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border min-w-[90px] transition-all duration-300 ${type === t.id ? `bg-${t.color.replace('bg-', '')}-500/10 border-${t.color.replace('bg-', '')}-500 shadow-lg shadow-${t.color.replace('bg-', '')}-500/10 scale-105` : 'bg-theme-card/50 border-theme opacity-50 hover:opacity-100'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${t.color.replace('bg-', 'text-')}-400 bg-white/5 shadow-inner`}>
                                            <t.icon size={24} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${type === t.id ? 'text-white' : 'text-theme-secondary'}`}>{t.label}</span>
                                    </button>
                                ))}
                            </HorizontalScroll>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${errors.amount ? 'text-rose-500' : 'text-theme-secondary'}`}>Expected Amount</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-theme-main px-2 py-1 rounded-lg border border-theme text-theme-secondary font-black text-[10px] tracking-widest group-focus-within:text-cyan-500 group-focus-within:border-cyan-500/50 transition-colors">ETB</div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={e => { setAmount(formatNumberInput(e.target.value)); setErrors(p => ({ ...p, amount: false })); }}
                                    placeholder="0.00"
                                    className={`w-full bg-theme-card/80 p-4 pl-16 rounded-2xl text-2xl font-black outline-none border transition-all font-mono tracking-tight ${errors.amount ? 'border-rose-500 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-theme focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]'}`}
                                />
                            </div>
                            {errors.amount && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">Required</p>}
                        </div>

                        {/* Frequency */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-theme-secondary">Frequency</label>
                            <div className="grid grid-cols-2 gap-3">
                                {FREQUENCIES.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFrequency(f as any)}
                                        className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${frequency === f ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10' : 'bg-theme-card/50 border-theme text-theme-secondary hover:border-theme-secondary/30'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payday Input (Only if not irregular) */}
                        {frequency !== 'Irregular' && (
                            <div className="bg-theme-card/80 p-4 rounded-2xl border border-theme space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Icons.Calendar size={16} className="text-theme-secondary" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary">Payday (Day of Month)</label>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={payday}
                                        onChange={e => setPayday(e.target.value)}
                                        placeholder="25"
                                        className="w-14 bg-theme-main p-2 rounded-xl text-center text-sm font-black border border-theme outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-theme/30">
                                    <div className="flex items-center gap-2">
                                        <Icons.Bell size={16} className="text-theme-secondary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary">Reminders</span>
                                    </div>
                                    <button
                                        onClick={() => setRemind(!remind)}
                                        className={`w-12 h-7 rounded-full relative transition-all duration-300 p-1 ${remind ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-gray-800'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${remind ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* LINKED ACCOUNT */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-theme-secondary">Deposit To (Optional)</label>
                            <div className="relative">
                                <select
                                    value={linkedAccount}
                                    onChange={e => setLinkedAccount(e.target.value)}
                                    className="w-full bg-theme-card/80 p-4 rounded-2xl text-sm font-bold outline-none border border-theme focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.institution})</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-secondary">
                                    <Icons.ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 mt-auto">
                            {editingId ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this income source?')) {
                                                deleteIncomeSource(editingId);
                                                resetForm();
                                            }
                                        }}
                                        className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                        title="Delete Source"
                                    >
                                        <Icons.Delete size={20} />
                                    </button>
                                    <button onClick={resetForm} className="flex-1 py-4 rounded-2xl bg-theme-card text-[11px] font-black uppercase tracking-widest border border-theme hover:bg-theme-main transition-all active:scale-95">Cancel</button>
                                    <button onClick={handleSave} className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[11px] font-black uppercase tracking-widest hover:from-cyan-400 hover:to-blue-400 shadow-xl shadow-cyan-500/20 transition-all active:scale-95">
                                        Update
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={resetForm} className="flex-1 py-4 rounded-2xl bg-theme-card text-[11px] font-black uppercase tracking-widest border border-theme hover:bg-theme-main transition-all active:scale-95">Cancel</button>
                                    <button onClick={handleSave} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[11px] font-black uppercase tracking-widest hover:from-cyan-400 hover:to-blue-400 shadow-xl shadow-cyan-500/20 transition-all active:scale-95">
                                        Save Source
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : null}
                {!isAdding && (
                    <button onClick={onClose} className="w-full py-4 bg-cyan-500 rounded-2xl font-bold text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 shrink-0 mt-auto">
                        Done
                    </button>
                )}
            </div>
        </div>
    );
};
