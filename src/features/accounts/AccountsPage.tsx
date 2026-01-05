import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { Account } from '@/types';
import { EnhancedAccountList } from './EnhancedAccountList';

export const AccountsPage: React.FC = () => {
    const { t } = useTranslation();
    const { state, addAccount, deleteAccount, updateAccount, transferFunds, activeProfile, isPrivacyMode, togglePrivacyMode, openTransactionModal, setActiveTab } = useAppContext();
    const { accounts } = state;

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);

    // Add/Edit Flow State
    const [modalStep, setModalStep] = useState<'form' | 'confirm'>('form');
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    // Sorting
    const [sortOption, setSortOption] = useState<'default' | 'balance' | 'name'>('default');

    // Form State: Add Account
    const [newAccName, setNewAccName] = useState('');
    const [newAccBalance, setNewAccBalance] = useState('');
    const [newAccType, setNewAccType] = useState<Account['type']>('Bank');
    const [newAccInstitution, setNewAccInstitution] = useState('');
    const [newAccColor, setNewAccColor] = useState('from-slate-700 to-slate-900');

    // Loan Specific State
    const [newAccSubtype, setNewAccSubtype] = useState<Account['subtype']>('Digital Loan');
    const [newAccDueDate, setNewAccDueDate] = useState('');
    const [newAccInterest, setNewAccInterest] = useState('');

    // Form Validation
    const [errors, setErrors] = useState({ name: false, balance: false });

    // Form State: Transfer
    const [transferFrom, setTransferFrom] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    // Number Formatting Helper
    const formatNumberInput = (value: string) => {
        const val = value.replace(/,/g, '');
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join('.');
        }
        return value;
    };

    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewAccBalance(formatNumberInput(e.target.value));
        setErrors(prev => ({ ...prev, balance: false }));
    };

    const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTransferAmount(formatNumberInput(e.target.value));
    };

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''));

    // --- Colors & Styling ---
    const colorOptions = [
        { class: 'from-[#10b981] to-[#059669]', name: 'CBE (Green)' },
        { class: 'from-[#00b4d8] to-[#0096c7]', name: 'TeleBirr (Cyan)' },
        { class: 'from-[#ef4444] to-[#dc2626]', name: 'Dashen (Red)' },
        { class: 'from-[#f59e0b] to-[#d97706]', name: 'Awash (Orange)' },
        { class: 'from-[#8b5cf6] to-[#7c3aed]', name: 'Bank of Abyssinia (Purple)' },
        { class: 'from-[#00b4d8] to-[#0096c7]', name: 'Tegbar (Cyan)' },
        { class: 'from-[#10b981] to-[#059669]', name: 'Zemen (Green)' },
        { class: 'from-slate-700 to-slate-900', name: 'Generic (Slate)' },
        { class: 'from-gray-700 to-gray-800', name: 'Cash (Gray)' },
        { class: 'from-indigo-600 to-blue-500', name: 'Standard (Blue)' },
    ];

    const getBrandColor = (institution: string, type: string) => {
        const inst = institution.toLowerCase();
        if (inst.includes('cbe') || inst.includes('commercial')) return 'from-[#10b981] to-[#059669]';
        if (inst.includes('telebirr') || inst.includes('telebirr')) return 'from-[#00b4d8] to-[#0096c7]';
        if (inst.includes('dashen')) return 'from-[#ef4444] to-[#dc2626]';
        if (inst.includes('awash')) return 'from-[#f59e0b] to-[#d97706]';
        if (inst.includes('coop')) return 'from-[#8b5cf6] to-[#7c3aed]';
        if (inst.includes('hibret')) return 'from-[#00b4d8] to-[#0096c7]';
        if (inst.includes('zemen')) return 'from-[#10b981] to-[#059669]';
        // Defaults
        if (type === 'Cash') return 'from-gray-700 to-gray-800';
        if (type === 'Mobile Money') return 'from-[#00b4d8] to-[#0096c7]';
        if (type === 'Loan') return 'from-[#ef4444] to-[#dc2626]'; // Loan Color
        return 'from-slate-700 to-slate-900';
    };

    useEffect(() => {
        if (!showAddModal) {
            setModalStep('form');
            setEditingAccount(null);
            setNewAccName('');
            setNewAccBalance('');
            setNewAccInstitution('');
            setNewAccType('Bank');
            setNewAccSubtype('Digital Loan');
            setNewAccDueDate('');
            setNewAccInterest('');
            setErrors({ name: false, balance: false });
        }
    }, [showAddModal]);

    useEffect(() => {
        // Only auto-set color if we are adding a NEW account (not editing)
        // and we have an institution name typed in.
        if (!editingAccount && newAccInstitution) {
            const autoColor = getBrandColor(newAccInstitution, newAccType);
            setNewAccColor(autoColor);
        }
    }, [newAccInstitution, newAccType, editingAccount]);

    // --- Handlers ---

    const openAddModal = (institutionName?: string) => {
        setEditingAccount(null);
        setNewAccName('');
        setNewAccBalance('');
        setNewAccType('Bank');

        if (institutionName) {
            setNewAccInstitution(institutionName);
            // Try to find type from existing accounts
            const allAccounts = state.accounts; // Use raw state accounts
            const existing = allAccounts.find(a => a.institution === institutionName);

            if (existing) {
                setNewAccType(existing.type);
                setNewAccColor(existing.color);
            } else {
                setNewAccColor(getBrandColor(institutionName, 'Bank'));
            }
        } else {
            setNewAccInstitution('');
            setNewAccColor('from-slate-700 to-slate-900');
        }

        setModalStep('form');
        setShowAddModal(true);
    };

    const handleVerifyStep = () => {
        // Validation
        const newErrors = {
            name: !newAccName.trim(),
            balance: !newAccBalance
        };

        if (newErrors.name || newErrors.balance) {
            setErrors(newErrors);
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }

        setModalStep('confirm');
    };

    const handleFinalSave = () => {
        let inst = newAccInstitution;
        if (!inst) {
            if (newAccName.toLowerCase().includes('telebirr')) inst = 'Telebirr';
            else if (newAccName.toLowerCase().includes('cbe')) inst = 'CBE';
            else inst = newAccType === 'Mobile Money' ? 'Mobile Money' : newAccType === 'Bank' ? 'Bank' : 'Cash';
        }

        const accountData: Account = {
            id: editingAccount ? editingAccount.id : Date.now().toString(),
            name: newAccName,
            institution: inst,
            type: newAccType,
            balance: getRawNumber(newAccBalance),
            color: newAccColor,
            // If adding new, default to current active profile unless 'All', then default to Personal
            profile: editingAccount ? editingAccount.profile : (activeProfile === 'All' ? 'Personal' : activeProfile),
            subtype: newAccType === 'Loan' ? newAccSubtype : undefined,
            loanDetails: newAccType === 'Loan' ? {
                provider: inst,
                dueDate: newAccDueDate,
                interestRate: newAccInterest ? parseFloat(newAccInterest) : undefined
            } : undefined
        };

        if (editingAccount) {
            updateAccount(accountData);
        } else {
            addAccount(accountData);
        }

        setShowAddModal(false);
    };

    const handleTransfer = () => {
        if (!transferFrom || !transferTo || !transferAmount) return;
        if (transferFrom === transferTo) return;
        transferFunds(transferFrom, transferTo, getRawNumber(transferAmount));
        setShowTransferModal(false);
        setTransferAmount('');
    };

    const cycleSortOption = () => {
        if (sortOption === 'default') setSortOption('balance');
        else if (sortOption === 'balance') setSortOption('name');
        else setSortOption('default');
    }

    const totalAssets = accounts.reduce((acc, curr) => {
        if (curr.type === 'Loan') return acc - curr.balance;
        return acc + curr.balance;
    }, 0);
    const bankAssets = accounts.filter((a: Account) => a.type === 'Bank').reduce((acc, curr) => acc + curr.balance, 0);
    const mobileAssets = accounts.filter((a: Account) => a.type === 'Mobile Money').reduce((acc, curr) => acc + curr.balance, 0);
    const grossAssets = accounts.reduce((acc, curr) => {
        if (curr.type !== 'Loan') return acc + curr.balance;
        return acc;
    }, 0);

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            {/* Header */}
            <header className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl z-50">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-white/20 dark:border-white/5 active:scale-90 transition-all"
                >
                    <Icons.ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('accounts.myAccounts')}</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">የእኔ መለያዎች</p>
                </div>
                <button
                    onClick={() => setShowTransferModal(true)}
                    className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-white/20 dark:border-white/5 active:scale-90 transition-all text-cyan-500"
                >
                    <Icons.Transfer size={20} />
                </button>
            </header>

            <div className="px-5 space-y-8">
                {/* Net Worth Hub */}
                <section className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 shadow-sm border border-white/20 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('accounts.netWorth')}</p>
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                    {isPrivacyMode ? '••••••' : totalAssets.toLocaleString()}
                                    <span className="text-lg text-gray-400 ml-1 font-bold">ETB</span>
                                </h2>
                                <button onClick={togglePrivacyMode} className="text-gray-400 hover:text-primary transition-colors">
                                    {isPrivacyMode ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icons.Wallet size={24} />
                        </div>
                    </div>

                    {/* Asset Allocation Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <span>Asset Allocation</span>
                            <span>{grossAssets > 0 ? '100%' : '0%'}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full flex overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{ width: grossAssets > 0 ? `${(bankAssets / grossAssets) * 100}%` : '0%' }}
                            />
                            <div
                                className="h-full bg-cyan-400"
                                style={{ width: grossAssets > 0 ? `${(mobileAssets / grossAssets) * 100}%` : '0%' }}
                            />
                        </div>
                        <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-[10px] font-bold text-gray-500">Bank</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-[10px] font-bold text-gray-500">Mobile</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account List */}
                <EnhancedAccountList
                    accounts={accounts}
                    onTransfer={(account) => {
                        setTransferFrom(account.id);
                        setShowTransferModal(true);
                    }}
                    onAddMoney={(account) => {
                        openTransactionModal(undefined, { accountId: account.id, type: 'income' });
                    }}
                    onSendMoney={(account) => {
                        openTransactionModal(undefined, { accountId: account.id, type: 'expense' });
                    }}
                    onTopUp={(account) => {
                        openTransactionModal(undefined, { accountId: account.id, type: 'income' });
                    }}
                    onAddAccount={() => openAddModal()}
                />
            </div>

            {/* --- ADD / EDIT MODAL --- */}
            {showAddModal && (
                <div className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up mb-0 sm:mb-safe shadow-2xl h-[90vh] sm:h-auto overflow-y-auto flex flex-col border border-black/[0.05] dark:border-white/[0.05]" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-white/10 rounded-full mx-auto mb-8 sm:hidden shrink-0"></div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 text-center tracking-tight">
                            {editingAccount ? 'Edit Account' : selectedInstitution ? `Add to ${selectedInstitution}` : 'Add New Account'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 text-center font-medium">
                            {modalStep === 'form' ? 'Enter details below' : 'Please verify details'}
                        </p>

                        {modalStep === 'form' ? (
                            <div className="space-y-6 mb-6 flex-1">
                                {(!editingAccount && !selectedInstitution) && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {(['Bank', 'Mobile Money', 'Cash', 'Loan'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => {
                                                    setNewAccType(t);
                                                    if (t === 'Loan' && !newAccInstitution) {
                                                        setNewAccInstitution('Telebirr Mela');
                                                    }
                                                }}
                                                className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border transition-all duration-300 ${newAccType === t ? 'bg-primary/10 border-primary text-primary scale-105 shadow-lg shadow-primary/10' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                            >
                                                <div className={`mb-2 ${newAccType === t ? 'text-primary' : 'text-gray-400'}`}>
                                                    {t === 'Bank' && <Icons.Bank size={24} />}
                                                    {t === 'Mobile Money' && <Icons.Phone size={24} />}
                                                    {t === 'Cash' && <Icons.Cash size={24} />}
                                                    {t === 'Loan' && <Icons.Wallet size={24} />}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                                                    {t === 'Mobile Money' ? 'Mobile' : t}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Loan Specific Fields */}
                                {newAccType === 'Loan' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">Loan Type</label>
                                            <div className="flex gap-2">
                                                {(['Digital Loan', 'Micro Loan', 'Personal Loan'] as const).map(st => (
                                                    <button
                                                        key={st}
                                                        onClick={() => setNewAccSubtype(st)}
                                                        className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${newAccSubtype === st ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/10' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                                    >
                                                        {st}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={newAccDueDate}
                                                    onChange={e => setNewAccDueDate(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-gray-900 dark:text-white text-sm font-bold focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">Interest %</label>
                                                <input
                                                    type="number"
                                                    value={newAccInterest}
                                                    onChange={e => setNewAccInterest(e.target.value)}
                                                    placeholder="0%"
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-gray-900 dark:text-white text-sm font-bold focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!selectedInstitution) && (
                                    <div className={editingAccount ? 'opacity-50 pointer-events-none' : ''}>
                                        <label className="text-xs text-gray-500 block mb-2 font-bold uppercase tracking-wider">
                                            {newAccType === 'Loan' ? 'Lender / Provider' : 'Institution Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={newAccInstitution}
                                            onChange={e => setNewAccInstitution(e.target.value)}
                                            disabled={!!editingAccount}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-gray-900 dark:text-white text-sm font-bold focus:border-primary outline-none transition-all"
                                            placeholder={newAccType === 'Loan' ? "e.g. Telebirr Mela, Michu" : (newAccType === 'Bank' ? "e.g. CBE, Dashen, Awash" : "e.g. Telebirr, MPesa")}
                                            list={newAccType === 'Loan' ? "loan-providers" : undefined}
                                        />
                                        {newAccType === 'Loan' && (
                                            <datalist id="loan-providers">
                                                <option value="Telebirr Mela" />
                                                <option value="Michu" />
                                                <option value="CBE Birr" />
                                                <option value="M-Pesa" />
                                            </datalist>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className={`text-xs block mb-2 font-bold uppercase tracking-wider ${errors.name ? 'text-rose-500' : 'text-gray-500'}`}>Account Name</label>
                                    <input
                                        type="text"
                                        value={newAccName}
                                        onChange={e => { setNewAccName(e.target.value); setErrors(prev => ({ ...prev, name: false })); }}
                                        className={`w-full bg-gray-50 dark:bg-white/5 border rounded-2xl p-4 text-gray-900 dark:text-white text-sm font-bold outline-none transition-all ${errors.name ? 'border-rose-500' : 'border-gray-100 dark:border-white/5 focus:border-primary'}`}
                                        placeholder="e.g., Personal Savings"
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs block mb-2 font-bold uppercase tracking-wider ${errors.balance ? 'text-rose-500' : 'text-gray-500'}`}>Balance (ETB)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">ETB</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={newAccBalance}
                                            onChange={handleBalanceChange}
                                            className={`w-full bg-gray-50 dark:bg-white/5 border rounded-2xl p-4 pl-14 text-gray-900 dark:text-white text-2xl font-black outline-none transition-all tracking-tight ${errors.balance ? 'border-rose-500' : 'border-gray-100 dark:border-white/5 focus:border-primary'}`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 block mb-3 font-bold uppercase tracking-wider">Card Theme</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        {colorOptions.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setNewAccColor(opt.class)}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${opt.class} ${newAccColor === opt.class ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-primary scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'} transition-all`}
                                                title={opt.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 mt-auto">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-gray-50 dark:bg-white/5 rounded-full text-gray-500 font-black border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVerifyStep}
                                        className="flex-1 py-4 bg-primary rounded-full text-white font-black hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 mb-6 animate-push flex-1">
                                <div className="bg-gray-50 dark:bg-white/5 rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-black/[0.03] dark:border-white/[0.03]">
                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Institution</span>
                                        <span className="text-gray-900 dark:text-white font-black">{newAccInstitution || selectedInstitution || 'Cash'}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-black/[0.03] dark:border-white/[0.03]">
                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Account</span>
                                        <span className="text-gray-900 dark:text-white font-black">{newAccName}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-black/[0.03] dark:border-white/[0.03]">
                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Type</span>
                                        <span className="text-gray-900 dark:text-white font-black">{newAccType}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-black/[0.03] dark:border-white/[0.03]">
                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Theme</span>
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${newAccColor} shadow-lg`}></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3">
                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Balance</span>
                                        <span className="text-primary font-black text-3xl tracking-tighter">
                                            {isPrivacyMode ? '••••••' : parseFloat(newAccBalance.replace(/,/g, '')).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-4">
                                    <button
                                        onClick={() => setModalStep('form')}
                                        className="flex-1 py-4 bg-gray-50 dark:bg-white/5 rounded-full text-gray-500 font-black border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinalSave}
                                        className="flex-1 py-4 bg-primary rounded-full text-white font-black hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    >
                                        Confirm & Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TRANSFER MODAL --- */}
            {showTransferModal && (
                <div className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center" onClick={() => setShowTransferModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up mb-0 sm:mb-safe shadow-2xl border border-black/[0.05] dark:border-white/[0.05]" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-white/10 rounded-full mx-auto mb-8 sm:hidden"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                <Icons.Transfer size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Transfer Money</h3>
                                <p className="text-sm text-gray-500 font-medium">Move funds between accounts</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 relative">
                            <div className="absolute left-[23px] top-12 bottom-12 w-0.5 bg-gray-200 dark:bg-white/10 border-l-2 border-dashed border-gray-300 dark:border-white/20 opacity-50 pointer-events-none"></div>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-1 border border-gray-100 dark:border-white/5">
                                <label className="text-[10px] text-gray-400 block mb-1 ml-4 mt-2 font-black uppercase tracking-widest">From</label>
                                <select
                                    value={transferFrom}
                                    onChange={(e) => setTransferFrom(e.target.value)}
                                    className="w-full bg-transparent p-4 text-gray-900 dark:text-white text-sm focus:outline-none appearance-none font-black rounded-xl transition-all"
                                >
                                    <option value="" className="bg-white dark:bg-zinc-900">Select Source Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={acc.id === transferTo} className="bg-white dark:bg-zinc-900">
                                            {acc.institution} - {acc.name} ({acc.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-1 border border-gray-100 dark:border-white/5">
                                <label className="text-[10px] text-gray-400 block mb-1 ml-4 mt-2 font-black uppercase tracking-widest">To</label>
                                <select
                                    value={transferTo}
                                    onChange={(e) => setTransferTo(e.target.value)}
                                    className="w-full bg-transparent p-4 text-gray-900 dark:text-white text-sm focus:outline-none appearance-none font-black rounded-xl transition-all"
                                >
                                    <option value="" className="bg-white dark:bg-zinc-900">Select Destination Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={acc.id === transferFrom} className="bg-white dark:bg-zinc-900">
                                            {acc.institution} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-1 border border-gray-100 dark:border-white/5">
                                <label className="text-[10px] text-gray-400 block mb-1 ml-4 mt-2 font-black uppercase tracking-widest">Amount (ETB)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={transferAmount}
                                    onChange={handleTransferAmountChange}
                                    className="w-full bg-transparent p-4 text-gray-900 dark:text-white text-2xl font-black focus:outline-none tracking-tight"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="flex-1 py-4 bg-gray-50 dark:bg-white/5 rounded-full text-gray-500 font-black border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={!transferFrom || !transferTo || !transferAmount}
                                className="flex-1 py-4 bg-cyan-500 rounded-full text-white font-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                            >
                                Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
