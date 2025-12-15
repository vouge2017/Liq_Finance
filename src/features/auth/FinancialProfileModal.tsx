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
                <div className="modal-content w-full max-w-sm rounded-3xl p-8 animate-scale-up text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 animate-bounce">
                        <Icons.CheckCircle size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Profile Updated!</h3>
                    <p className="text-theme-secondary text-sm mb-8">Your income source has been saved. We can now plan your budget more accurately.</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => { setShowSuccess(false); onClose(); setActiveTab('budget'); }}
                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                        >
                            Go to Budget
                        </button>
                        <button
                            onClick={() => { setShowSuccess(false); resetForm(); }}
                            className="w-full py-4 bg-theme-main text-theme-secondary font-bold rounded-2xl hover:text-white transition-colors"
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
            <div className="modal-content w-full max-w-md rounded-3xl p-6 animate-scale-up h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Drag Handle */}
                <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 sm:hidden shrink-0" />

                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-theme-primary">Financial Profile</h2>
                        <p className="text-xs text-theme-secondary">Manage your income sources</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-theme-main border border-theme text-theme-secondary hover:text-white">
                        <Icons.Close size={20} />
                    </button>
                </div>

                {/* SUMMARY CARD */}
                {!isAdding && (
                    <div className="space-y-4 mb-6 shrink-0">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-5 border border-emerald-500/30 flex justify-between items-center shadow-lg">
                            <div>
                                <p className="text-xs text-emerald-200/80 uppercase font-bold tracking-wider mb-1">Total Monthly Income</p>
                                <p className="text-2xl font-bold text-white tracking-tight">{totalMonthlyIncome.toLocaleString()} ETB</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Icons.Briefcase className="text-emerald-400" size={24} />
                            </div>
                        </div>

                        {/* Budget Start Date Setting */}
                        <div className="bg-theme-card p-4 rounded-2xl border border-theme flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-theme-primary text-sm">Budget Start Date</h4>
                                <p className="text-xs text-theme-secondary">When does your month start?</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-cyan-400">Day</span>
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
                                    className="w-12 bg-theme-main p-2 rounded-lg text-center text-sm font-bold border border-theme outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* List of Sources */}
                {!isAdding && (
                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 no-scrollbar">
                        {incomeSources.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-theme-secondary/20 rounded-3xl bg-theme-main/30">
                                <div className="w-20 h-20 rounded-full bg-theme-card flex items-center justify-center mb-4 shadow-inner border border-theme">
                                    <Icons.Wallet size={36} className="text-theme-secondary opacity-50" />
                                </div>
                                <p className="text-theme-primary font-bold text-lg mb-2">Income not set</p>
                                <p className="text-theme-secondary text-sm mb-6 max-w-[200px] leading-relaxed">
                                    Add your salary or business income to unlock smart budgeting.
                                </p>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    <Icons.Plus size={18} /> Add Income Source
                                </button>
                            </div>
                        )}

                        {incomeSources.map(source => {
                            const iconObj = INCOME_TYPES.find(t => t.id === source.type) || INCOME_TYPES[0];
                            const lastReceived = getLastReceivedDate(source.name);
                            const isReceivedThisMonth = lastReceived && new Date(lastReceived).getMonth() === new Date().getMonth();

                            return (
                                <div key={source.id} className="bg-theme-main p-4 rounded-2xl border border-theme group hover:border-cyan-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconObj.color.replace('bg-', 'bg-').replace('500', '500/10 text-' + iconObj.color.replace('bg-', ''))}`}>
                                                <iconObj.icon size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-theme-primary">{source.name}</h4>
                                                <p className="text-xs text-theme-secondary flex items-center gap-2">
                                                    {source.amount.toLocaleString()} ETB / {source.frequency}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEdit(source)}
                                                className="p-2 text-theme-secondary hover:text-cyan-400 hover:bg-theme-card rounded-full transition-colors"
                                            >
                                                <Icons.Edit size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action & Status Row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-theme/50">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${isReceivedThisMonth ? 'bg-emerald-500' : 'bg-theme-secondary/50'}`}></div>
                                            <span className="text-[10px] text-theme-secondary">
                                                {lastReceived ? `Last: ${formatDate(lastReceived)}` : 'No history yet'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleReceiveNow(source)}
                                            className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                <Icons.Plus size={12} />
                                            </div>
                                            Receive Now
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Add/Edit Form */}
                {isAdding ? (
                    <div className="bg-theme-main p-5 rounded-2xl border border-theme space-y-4 animate-fade-in flex-1 overflow-y-auto no-scrollbar">
                        <h3 className="font-bold text-theme-primary text-sm">{editingId ? 'Edit Income Source' : 'New Income Source'}</h3>

                        {/* Name */}
                        <div>
                            <label className={`text-xs font-bold uppercase mb-1.5 block ${errors.name ? 'text-rose-500' : 'text-theme-secondary'}`}>Source Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: false })); }}
                                placeholder="e.g. Primary Job"
                                className={`w-full bg-theme-card p-3 rounded-xl text-sm outline-none border transition-colors ${errors.name ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                            />
                            {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                        </div>

                        {/* Income Type Carousel */}
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase mb-1.5 block">Income Type</label>
                            <HorizontalScroll className="flex gap-3 pb-2">
                                {INCOME_TYPES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id as any)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[80px] transition-all ${type === t.id ? `bg-${t.color.replace('bg-', '')}-500/10 border-${t.color.replace('bg-', '')}-500` : 'bg-theme-card border-theme opacity-60 hover:opacity-100'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${t.color.replace('bg-', 'text-')}-400 bg-white/5`}>
                                            <t.icon size={20} />
                                        </div>
                                        <span className={`text-[10px] font-bold ${type === t.id ? 'text-white' : 'text-theme-secondary'}`}>{t.label}</span>
                                    </button>
                                ))}
                            </HorizontalScroll>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className={`text-xs font-bold uppercase mb-1.5 block ${errors.amount ? 'text-rose-500' : 'text-theme-secondary'}`}>Expected Amount</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={e => { setAmount(formatNumberInput(e.target.value)); setErrors(p => ({ ...p, amount: false })); }}
                                    placeholder="0.00"
                                    className={`w-full bg-theme-card p-3 pl-14 rounded-xl text-lg font-bold outline-none border transition-colors font-mono ${errors.amount ? 'border-rose-500 bg-rose-500/10' : 'border-theme focus:border-cyan-500'}`}
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary font-bold text-sm">ETB</span>
                            </div>
                            {errors.amount && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                        </div>

                        {/* Frequency */}
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase mb-1.5 block">Frequency</label>
                            <div className="grid grid-cols-2 gap-2">
                                {FREQUENCIES.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFrequency(f as any)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${frequency === f ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-theme-card border-theme text-theme-secondary'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payday Input (Only if not irregular) */}
                        {frequency !== 'Irregular' && (
                            <div className="bg-theme-card p-3 rounded-xl border border-theme">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-theme-secondary">Payday (Day of Month)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={payday}
                                        onChange={e => setPayday(e.target.value)}
                                        placeholder="25"
                                        className="w-16 bg-theme-main p-1.5 rounded-lg text-center text-sm font-bold border border-theme outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-theme/50">
                                    <span className="text-xs text-theme-secondary">Get Notification?</span>
                                    <button
                                        onClick={() => setRemind(!remind)}
                                        className={`w-10 h-6 rounded-full relative transition-colors ${remind ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${remind ? 'left-5' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* LINKED ACCOUNT - NEW */}
                        <div>
                            <label className="text-xs font-bold text-theme-secondary uppercase mb-1.5 block">Deposit To (Optional)</label>
                            <select
                                value={linkedAccount}
                                onChange={e => setLinkedAccount(e.target.value)}
                                className="w-full bg-theme-card p-3 rounded-xl text-sm outline-none border border-theme focus:border-cyan-500 transition-colors"
                            >
                                <option value="">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.institution})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2 pt-4 mt-auto">
                            <button onClick={resetForm} className="flex-1 py-3 rounded-xl bg-theme-card text-xs font-bold border border-theme hover:bg-theme-main">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                                {editingId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    incomeSources.length > 0 && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border-2 border-dashed border-theme rounded-2xl flex items-center justify-center gap-2 text-theme-secondary hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-theme-card transition-all mb-4 shrink-0"
                        >
                            <Icons.Plus size={16} /> Add Income Source
                        </button>
                    )
                )}

                {!isAdding && (
                    <button onClick={onClose} className="w-full py-4 bg-cyan-500 rounded-2xl font-bold text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 shrink-0">
                        Done
                    </button>
                )}
            </div>
        </div>
    );
};
