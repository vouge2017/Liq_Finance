import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/shared/components/Icons';
import { getBankIcon } from '@/shared/components/BankIcons';
import { useAppContext } from '@/context/AppContext';
import { Account, Transaction } from '@/types';

export const AccountsPage: React.FC = () => {
    const { t } = useTranslation();
    const { state, addAccount, deleteAccount, updateAccount, setDefaultAccount, transferFunds, formatDate, activeProfile, isPrivacyMode, togglePrivacyMode, openTransactionModal } = useAppContext();
    const { accounts, transactions } = state;

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);

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

    // --- Grouping Logic ---

    // Helper to group accounts by Institution
    const groupByInstitution = (accList: Account[]) => {
        return accList.reduce((groups, account) => {
            const key = account.institution;
            if (!groups[key]) {
                groups[key] = {
                    name: key,
                    accounts: [],
                    totalBalance: 0,
                    type: account.type,
                    color: account.color
                };
            }
            groups[key].accounts.push(account);
            groups[key].totalBalance += account.balance;
            return groups;
        }, {} as Record<string, { name: string, accounts: Account[], totalBalance: number, type: string, color: string }>);
    };

    // Helper to sort accounts within a group
    const sortAccounts = (accList: Account[]) => {
        if (sortOption === 'balance') return [...accList].sort((a, b) => b.balance - a.balance);
        if (sortOption === 'name') return [...accList].sort((a, b) => a.name.localeCompare(b.name));
        return accList;
    };

    // Helper to sort groups
    const sortGroups = (groups: any[]) => {
        if (sortOption === 'balance') return groups.sort((a, b) => b.totalBalance - a.totalBalance);
        if (sortOption === 'name') return groups.sort((a, b) => a.name.localeCompare(b.name));
        return groups;
    };

    // If activeProfile is 'All', we group by Profile first.
    const profileGroups = activeProfile === 'All'
        ? {
            'Personal': groupByInstitution(accounts.filter(a => a.profile === 'Personal')),
            'Family': groupByInstitution(accounts.filter(a => a.profile === 'Family')),
        }
        : {
            [activeProfile]: groupByInstitution(accounts)
        };

    // Flatten to sections with sorting applied
    const sections = Object.entries(profileGroups)
        .filter(([_, groups]) => Object.keys(groups).length > 0)
        .map(([profileName, groups]) => {
            const sortedGroupValues = sortGroups(Object.values(groups));
            return { profileName, groups: sortedGroupValues };
        });

    // --- Colors & Styling ---
    const colorOptions = [
        { class: 'from-purple-900 to-fuchsia-800', name: 'CBE (Purple)' },
        { class: 'from-cyan-500 to-emerald-500', name: 'Telebirr (Green/Cyan)' },
        { class: 'from-blue-950 to-indigo-900', name: 'Dashen (Navy)' },
        { class: 'from-blue-700 to-orange-500', name: 'Awash (Blue/Orange)' },
        { class: 'from-green-800 to-lime-600', name: 'Coop (Green)' },
        { class: 'from-rose-900 to-red-700', name: 'Hibret (Red)' },
        { class: 'from-yellow-700 to-amber-600', name: 'Zemen (Gold)' },
        { class: 'from-slate-700 to-slate-900', name: 'Generic (Slate)' },
        { class: 'from-gray-700 to-gray-800', name: 'Cash (Gray)' },
        { class: 'from-indigo-600 to-blue-500', name: 'Standard (Blue)' },
    ];

    const getBrandColor = (institution: string, type: string) => {
        const inst = institution.toLowerCase();
        if (inst.includes('cbe') || inst.includes('commercial')) return 'from-purple-900 to-fuchsia-800';
        if (inst.includes('telebirr')) return 'from-cyan-500 to-emerald-500';
        if (inst.includes('dashen')) return 'from-blue-950 to-indigo-900';
        if (inst.includes('awash')) return 'from-blue-700 to-orange-500';
        if (inst.includes('coop')) return 'from-green-800 to-lime-600';
        if (inst.includes('hibret')) return 'from-rose-900 to-red-700';
        if (inst.includes('zemen')) return 'from-yellow-700 to-amber-600';
        // Defaults
        if (type === 'Cash') return 'from-gray-700 to-gray-800';
        if (type === 'Mobile Money') return 'from-cyan-600 to-teal-600';
        if (type === 'Loan') return 'from-rose-900 to-red-800'; // Loan Color
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

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setNewAccName(account.name);
        setNewAccBalance(account.balance.toLocaleString());
        setNewAccInstitution(account.institution);
        setNewAccType(account.type);
        setNewAccColor(account.color);
        setNewAccColor(account.color);
        if (account.type === 'Loan') {
            setNewAccSubtype(account.subtype);
            setNewAccDueDate(account.loanDetails?.dueDate || '');
            setNewAccInterest(account.loanDetails?.interestRate?.toString() || '');
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

    const handleDeleteAccount = (id: string) => {
        deleteAccount(id);
        setShowDeleteConfirm(null);
        // If no accounts left for this institution, close the modal
        const remaining = accounts.filter(a => a.institution === selectedInstitution && a.id !== id);
        if (remaining.length === 0) {
            setSelectedInstitution(null);
        }
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
    const loanLiabilities = accounts.filter((a: Account) => a.type === 'Loan').reduce((acc, curr) => acc + curr.balance, 0);
    const grossAssets = accounts.reduce((acc, curr) => {
        if (curr.type !== 'Loan') return acc + curr.balance;
        return acc;
    }, 0);

    return (
        <div className="pb-28 animate-push relative">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-theme-primary text-xl font-bold">{t('accounts.myAccounts')}</h2>
                    <p className="text-theme-secondary text-xs ethiopic">{t('accounts.myAccounts')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={cycleSortOption}
                        className="flex items-center gap-2 bg-theme-card border border-theme px-3 py-2 rounded-full text-theme-secondary text-xs font-bold hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
                        title="Sort Accounts"
                    >
                        <Icons.Filter size={14} />
                        {sortOption === 'default' ? 'Default' : sortOption === 'balance' ? 'Balance' : 'Name'}
                    </button>
                    <button
                        onClick={() => setShowTransferModal(true)}
                        className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-full text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
                    >
                        <Icons.Transfer size={14} />
                        Transfer
                    </button>
                </div>
            </div>

            {/* Net Worth Bar */}
            <div className="mb-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-theme-secondary mb-1">
                    <span>{t('accounts.netWorth')} ({activeProfile})</span>
                    <div className="flex items-center gap-2">
                        <button onClick={togglePrivacyMode} className="hover:text-cyan-400 transition-colors">
                            {isPrivacyMode ? <Icons.EyeOff size={14} /> : <Icons.Eye size={14} />}
                        </button>
                        <span className="font-mono text-theme-primary font-bold text-sm">
                            {isPrivacyMode ? '••••••' : totalAssets.toLocaleString()} ETB
                        </span>
                    </div>
                </div>
                <div className="w-full h-3 bg-theme-card rounded-full flex overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: grossAssets > 0 ? `${(bankAssets / grossAssets) * 100}%` : '0%' }}></div>
                    <div className="h-full bg-cyan-500" style={{ width: grossAssets > 0 ? `${(mobileAssets / grossAssets) * 100}%` : '0%' }}></div>
                    <div className="h-full bg-gray-500 flex-1"></div>
                </div>
            </div>

            {/* Accounts Groups */}
            <div className="space-y-8">
                {sections.map(({ profileName, groups }) => (
                    <div key={profileName} className="animate-fade-in">
                        {activeProfile === 'All' && (
                            <div className="flex items-center gap-2 mb-3 mt-6">
                                <div className={`w-2 h-2 rounded-full ${profileName === 'Personal' ? 'bg-cyan-400' : 'bg-pink-500'}`}></div>
                                <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wider">{profileName} Accounts</h3>
                            </div>
                        )}

                        <div className="space-y-4">
                            {groups.map((inst) => (
                                <div
                                    key={`${profileName}-${inst.name}`}
                                    onClick={() => setSelectedInstitution(inst.name)}
                                    className={`cursor-pointer relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${inst.color} shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] border border-white/5`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                                                {inst.type === 'Bank' && <Icons.Bank className="text-white" size={18} />}
                                                {inst.type === 'Mobile Money' && <Icons.Phone className="text-white" size={18} />}
                                                {inst.type === 'Cash' && <Icons.Cash className="text-white" size={18} />}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold leading-tight">{inst.name}</h4>
                                                <p className="text-white/70 text-[10px] uppercase tracking-wider">{inst.accounts.length} Account{inst.accounts.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        <div className="bg-black/20 p-1.5 rounded-lg backdrop-blur-md">
                                            <Icons.ChevronRight className="text-white/80" size={16} />
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-white text-2xl font-bold tracking-tight">
                                                {isPrivacyMode ? '••••••' : inst.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            <span className="text-white/70 text-sm font-medium">ETB</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add Account Button - COLOR CODED */}
                <button
                    onClick={() => { setSelectedInstitution(null); openAddModal(); }}
                    className="w-full py-4 bg-cyan-500 rounded-2xl flex items-center justify-center gap-2 text-black hover:bg-cyan-400 transition-all font-bold shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <Icons.Plus size={16} />
                    </div>
                    <span className="font-bold text-sm">Add New Bank / Wallet</span>
                </button>
            </div>

            {/* ... (rest of modals unchanged but context ensures they work) */}

            {/* --- INSTITUTION DETAIL VIEW (HERO EXPAND) --- */}
            {selectedInstitution && (
                <div className="fixed inset-0 bg-theme-main z-[60] overflow-y-auto animate-hero pb-safe">
                    <div className="sticky top-0 bg-theme-main/95 backdrop-blur-md p-4 flex items-center justify-between border-b border-theme z-20">
                        <button
                            onClick={() => setSelectedInstitution(null)}
                            className="w-10 h-10 rounded-full bg-theme-card border border-theme flex items-center justify-center text-theme-secondary hover:text-theme-primary"
                        >
                            <Icons.Close size={20} />
                        </button>
                        <span className="font-bold text-theme-primary text-lg">{selectedInstitution}</span>
                        <button
                            onClick={() => openAddModal(selectedInstitution)}
                            className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all"
                        >
                            <Icons.Plus size={18} />
                        </button>
                    </div>

                    <div className="p-6 pb-24">
                        {/* Detail Header (Aggregated) */}
                        {(() => {
                            const relevantAccounts = accounts.filter(a => a.institution === selectedInstitution);
                            const totalInstBalance = relevantAccounts.reduce((sum, a) => sum + a.balance, 0);
                            const instType = relevantAccounts[0]?.type || 'Bank';
                            const instColor = relevantAccounts[0]?.color || 'from-slate-700 to-slate-900';

                            return (
                                <div className={`rounded-[2rem] p-8 mb-8 bg-gradient-to-br ${instColor} text-center shadow-2xl relative overflow-hidden animate-hero`}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-inner">
                                        {(() => {
                                            const BankIcon = getBankIcon(selectedInstitution);
                                            if (BankIcon) return <BankIcon size={48} />;
                                            if (instType === 'Bank') return <Icons.Bank className="text-white" size={36} />;
                                            if (instType === 'Mobile Money') return <Icons.Phone className="text-white" size={36} />;
                                            return <Icons.Cash className="text-white" size={36} />;
                                        })()}
                                    </div>

                                    <h2 className="text-white text-4xl font-bold mb-2 tracking-tight">
                                        {isPrivacyMode ? '••••••' : totalInstBalance.toLocaleString()}
                                        <span className="text-lg opacity-80 font-normal"> ETB</span>
                                    </h2>
                                    <p className="text-white/80 font-medium uppercase tracking-widest text-xs">Total Balance</p>
                                </div>
                            );
                        })()}

                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-theme-primary font-bold text-lg">Accounts</h3>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-theme-secondary uppercase font-bold bg-theme-card px-2 py-1 rounded-md border border-theme">
                                    Sorted by {sortOption}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            {sortAccounts(accounts.filter(a => a.institution === selectedInstitution)).map(acc => (
                                <div key={acc.id} className="bg-theme-card p-5 rounded-3xl border border-theme relative group shadow-sm transition-all animate-slide-up">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-theme-primary text-lg">{acc.name}</h4>
                                                {/* Default Account Indicator */}
                                                {state.defaultAccountId === acc.id && (
                                                    <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Icons.Star size={10} fill="currentColor" /> Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <p className="text-xs text-theme-secondary font-mono bg-theme-main px-2 py-1 rounded-md">{acc.accountNumber || '****'}</p>
                                                {activeProfile === 'All' && (
                                                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${acc.profile === 'Personal' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-pink-500/10 text-pink-500'}`}>
                                                        {acc.profile}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {/* Set Default */}
                                            <button
                                                onClick={() => setDefaultAccount(acc.id)}
                                                className={`p-2.5 rounded-xl border transition-colors ${state.defaultAccountId === acc.id ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 cursor-default' : 'bg-theme-main text-theme-secondary border-theme hover:text-yellow-400'}`}
                                                title={state.defaultAccountId === acc.id ? "Default Account" : "Set as Default"}
                                            >
                                                <Icons.Star size={16} fill={state.defaultAccountId === acc.id ? "currentColor" : "none"} />
                                            </button>

                                            {/* Quick Actions - USING GLOBAL MODAL */}
                                            <button
                                                onClick={() => openTransactionModal(undefined, { accountId: acc.id, type: 'income' })}
                                                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                                                title="Add Income"
                                            >
                                                <Icons.Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => openTransactionModal(undefined, { accountId: acc.id, type: 'expense' })}
                                                className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors mr-2"
                                                title="Add Expense"
                                            >
                                                <Icons.ArrowUp size={16} className="rotate-45" />
                                            </button>

                                            {/* Tools */}
                                            <button
                                                onClick={() => setViewHistoryId(viewHistoryId === acc.id ? null : acc.id)}
                                                className={`p-2.5 rounded-xl border transition-colors ${viewHistoryId === acc.id ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-theme-main text-theme-secondary border-theme hover:text-cyan-400'}`}
                                                title="View History"
                                            >
                                                <Icons.Clock size={16} className={viewHistoryId === acc.id ? "" : "opacity-70"} />
                                            </button>

                                            <button
                                                onClick={() => openEditModal(acc)}
                                                className="p-2.5 rounded-xl bg-theme-main text-theme-secondary hover:text-cyan-400 transition-colors border border-theme"
                                            >
                                                <Icons.Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(acc.id)}
                                                className="p-2.5 rounded-xl bg-theme-main text-theme-secondary hover:text-rose-500 transition-colors border border-theme"
                                            >
                                                <Icons.Delete size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-cyan-400">
                                            {isPrivacyMode ? '••••••' : acc.balance.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-theme-secondary font-medium">ETB</span>
                                    </div>

                                    {/* Delete Confirmation - DIALOG BOUNCE */}
                                    {showDeleteConfirm === acc.id && (
                                        <div className="absolute inset-0 modal-content z-20 flex flex-col items-center justify-center rounded-3xl text-center p-6 animate-dialog border-2 border-rose-500/30">
                                            <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-2">
                                                <Icons.Alert size={20} />
                                            </div>
                                            <p className="text-base font-bold text-theme-primary mb-4">Delete {acc.name}?</p>
                                            <div className="flex gap-3 w-full">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                    className="flex-1 py-3 rounded-xl bg-theme-main border border-theme text-xs font-bold hover:bg-theme-card"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAccount(acc.id)}
                                                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 shadow-lg shadow-rose-900/20"
                                                >
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* IN-LINE HISTORY VIEW */}
                                    {viewHistoryId === acc.id && (
                                        <div className="mt-6 pt-6 border-t border-theme animate-fade-in">
                                            <div className="flex justify-between items-center mb-4">
                                                <h5 className="text-xs font-bold text-theme-secondary uppercase tracking-wider flex items-center gap-2">
                                                    <Icons.History size={12} /> Transaction History
                                                </h5>
                                                <span className="text-[10px] text-cyan-400 font-medium">Past 30 Days</span>
                                            </div>

                                            {(() => {
                                                const accountTx = transactions.filter(t => t.accountId === acc.id);
                                                if (accountTx.length === 0) return <p className="text-xs text-theme-secondary italic text-center py-4">No recent transactions found.</p>;
                                                const sortedTx = [...accountTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                                let runningBal = acc.balance;
                                                const historyWithBalance = sortedTx.map(tx => {
                                                    const effect = tx.type === 'income' ? tx.amount : -tx.amount;
                                                    const snapshot = runningBal;
                                                    runningBal = runningBal - effect;
                                                    return { ...tx, snapshotBalance: snapshot };
                                                });

                                                return (
                                                    <div className="relative border-l border-theme/50 ml-2 space-y-6 pl-4">
                                                        {historyWithBalance.map((tx, idx) => (
                                                            <div key={tx.id} className="relative">
                                                                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-theme-card ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-sm text-theme-primary font-medium">{tx.title}</p>
                                                                        <p className="text-[10px] text-theme-secondary">{formatDate(tx.date)}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`text-sm font-bold font-mono block ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                            {isPrivacyMode ? '••••' : (
                                                                                <>
                                                                                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                        <span className="text-[10px] text-theme-secondary font-mono flex items-center justify-end gap-1">
                                                                            <Icons.Wallet size={8} />
                                                                            {isPrivacyMode ? '••••' : tx.snapshotBalance.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADD / EDIT MODAL (BOTTOM SHEET) --- */}
            {showAddModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
                    className="fixed inset-0 modal-overlay z-[70] flex items-end sm:items-center justify-center"
                >
                    <div className="modal-content w-full max-w-md sm:rounded-3xl rounded-t-[2rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up mb-0 sm:mb-safe shadow-2xl h-[90vh] sm:h-auto overflow-y-auto flex flex-col">
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-8 sm:hidden shrink-0"></div>

                        <h3 className="text-xl font-bold text-theme-primary mb-1 text-center">
                            {editingAccount ? 'Edit Account' : selectedInstitution ? `Add to ${selectedInstitution}` : 'Add New Account'}
                        </h3>
                        <p className="text-xs text-theme-secondary mb-8 text-center">
                            {modalStep === 'form' ? 'Enter details below' : 'Please verify details'}
                        </p>

                        {modalStep === 'form' ? (
                            <div className="space-y-6 mb-6 flex-1">
                                {(!editingAccount && !selectedInstitution) && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['Bank', 'Mobile Money', 'Cash', 'Loan'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => {
                                                    setNewAccType(t);
                                                    if (t === 'Loan' && !newAccInstitution) {
                                                        setNewAccInstitution('Telebirr Mela'); // Default for Loan
                                                    }
                                                }}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${newAccType === t ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 scale-105 shadow-lg shadow-cyan-500/10' : 'bg-theme-main border-theme text-theme-secondary hover:bg-theme-main/80'}`}
                                            >
                                                <div className={`mb-1 ${newAccType === t ? 'text-cyan-400' : 'text-theme-secondary'}`}>
                                                    {t === 'Bank' && <Icons.Bank size={20} />}
                                                    {t === 'Mobile Money' && <Icons.Phone size={20} />}
                                                    {t === 'Cash' && <Icons.Cash size={20} />}
                                                    {t === 'Loan' && <Icons.Wallet size={20} />}
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-wide text-center leading-tight">
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
                                            <label className="text-xs text-theme-secondary block mb-2 font-medium">Loan Type</label>
                                            <div className="flex gap-2">
                                                {(['Digital Loan', 'Micro Loan', 'Personal Loan'] as const).map(st => (
                                                    <button
                                                        key={st}
                                                        onClick={() => setNewAccSubtype(st)}
                                                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold border transition-colors ${newAccSubtype === st ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-theme-main border-theme text-theme-secondary'}`}
                                                    >
                                                        {st}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs text-theme-secondary block mb-2 font-medium">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={newAccDueDate}
                                                    onChange={e => setNewAccDueDate(e.target.value)}
                                                    className="w-full bg-theme-main border border-theme rounded-2xl p-3 text-theme-primary text-sm focus:border-cyan-500 outline-none"
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <label className="text-xs text-theme-secondary block mb-2 font-medium">Interest %</label>
                                                <input
                                                    type="number"
                                                    value={newAccInterest}
                                                    onChange={e => setNewAccInterest(e.target.value)}
                                                    placeholder="0%"
                                                    className="w-full bg-theme-main border border-theme rounded-2xl p-3 text-theme-primary text-sm focus:border-cyan-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!selectedInstitution) && (
                                    <div className={editingAccount ? 'opacity-50 pointer-events-none' : ''}>
                                        <label className="text-xs text-theme-secondary block mb-2 font-medium">
                                            {newAccType === 'Loan' ? 'Lender / Provider' : 'Institution Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={newAccInstitution}
                                            onChange={e => setNewAccInstitution(e.target.value)}
                                            disabled={!!editingAccount}
                                            className="w-full bg-theme-main border border-theme rounded-2xl p-4 text-theme-primary text-sm focus:border-cyan-500 outline-none transition-colors"
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
                                    <label className={`text-xs block mb-2 font-medium uppercase ${errors.name ? 'text-rose-500' : 'text-theme-secondary'}`}>Account Name</label>
                                    <input
                                        type="text"
                                        value={newAccName}
                                        onChange={e => { setNewAccName(e.target.value); setErrors(prev => ({ ...prev, name: false })); }}
                                        className={`w-full bg-theme-main border rounded-2xl p-4 text-theme-primary text-sm outline-none transition-colors ${errors.name ? 'border-rose-500' : 'border-theme focus:border-cyan-500'}`}
                                        placeholder="e.g., Personal Savings"
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs block mb-2 font-medium uppercase ${errors.balance ? 'text-rose-500' : 'text-theme-secondary'}`}>Balance (ETB)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary font-bold">ETB</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={newAccBalance}
                                            onChange={handleBalanceChange}
                                            className={`w-full bg-theme-main border rounded-2xl p-4 pl-14 text-theme-primary text-lg font-bold outline-none transition-colors font-mono ${errors.balance ? 'border-rose-500' : 'border-theme focus:border-cyan-500'}`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-theme-secondary block mb-3 font-medium">Card Theme</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {colorOptions.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setNewAccColor(opt.class)}
                                                className={`w-full aspect-square rounded-full bg-gradient-to-br ${opt.class} ${newAccColor === opt.class ? 'ring-2 ring-offset-2 ring-offset-theme-card ring-cyan-400 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'} transition-all`}
                                                title={opt.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 mt-auto">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-theme-main rounded-2xl text-theme-secondary font-bold border border-theme hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVerifyStep}
                                        className="flex-1 py-4 bg-cyan-500 rounded-2xl text-black font-bold hover:bg-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 mb-6 animate-push flex-1">
                                <div className="bg-theme-main rounded-3xl p-6 border border-theme shadow-inner">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-theme/50">
                                        <span className="text-theme-secondary text-xs font-medium uppercase tracking-wider">Institution</span>
                                        <span className="text-theme-primary font-bold">{newAccInstitution || selectedInstitution || 'Cash'}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-theme/50">
                                        <span className="text-theme-secondary text-xs font-medium uppercase tracking-wider">Account</span>
                                        <span className="text-theme-primary font-bold">{newAccName}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-theme/50">
                                        <span className="text-theme-secondary text-xs font-medium uppercase tracking-wider">Type</span>
                                        <span className="text-theme-primary font-bold">{newAccType}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-theme/50">
                                        <span className="text-theme-secondary text-xs font-medium uppercase tracking-wider">Theme</span>
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${newAccColor} shadow-md`}></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-theme-secondary text-xs font-medium uppercase tracking-wider">Balance</span>
                                        <span className="text-cyan-400 font-mono font-bold text-2xl">
                                            {isPrivacyMode ? '••••••' : parseFloat(newAccBalance.replace(/,/g, '')).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-4">
                                    <button
                                        onClick={() => setModalStep('form')}
                                        className="flex-1 py-4 bg-theme-main rounded-2xl text-theme-secondary font-bold border border-theme hover:bg-gray-800"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinalSave}
                                        className="flex-1 py-4 bg-cyan-500 rounded-2xl text-black font-bold hover:bg-cyan-400 shadow-[0_4px_25px_rgba(6,182,212,0.4)]"
                                    >
                                        Confirm & Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TRANSFER MODAL (BOTTOM SHEET) --- */}
            {showTransferModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowTransferModal(false); }}
                    className="fixed inset-0 modal-overlay z-[70] flex items-end sm:items-center justify-center"
                >
                    <div className="modal-content w-full max-w-md sm:rounded-3xl rounded-t-[2rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up mb-0 sm:mb-safe shadow-2xl">
                        <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-8 sm:hidden"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                <Icons.Transfer size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-theme-primary">Transfer Money</h3>
                                <p className="text-xs text-theme-secondary">Move funds between accounts</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 relative">
                            <div className="absolute left-[23px] top-12 bottom-12 w-0.5 bg-theme border-l-2 border-dashed border-theme-secondary/30 opacity-50 pointer-events-none"></div>

                            <div className="bg-theme-main rounded-2xl p-1 border border-theme">
                                <label className="text-[10px] text-theme-secondary block mb-1 ml-3 mt-2 font-bold uppercase tracking-wider">From</label>
                                <select
                                    value={transferFrom}
                                    onChange={(e) => setTransferFrom(e.target.value)}
                                    className="w-full bg-theme-card p-3 text-theme-primary text-sm focus:outline-none appearance-none font-medium rounded-xl border border-transparent focus:border-cyan-500/50 transition-colors"
                                >
                                    <option value="" className="bg-theme-card text-theme-primary">Select Source Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={acc.id === transferTo} className="bg-theme-card text-theme-primary">
                                            {acc.institution} - {acc.name} ({acc.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-theme-main rounded-2xl p-1 border border-theme">
                                <label className="text-[10px] text-theme-secondary block mb-1 ml-3 mt-2 font-bold uppercase tracking-wider">To</label>
                                <select
                                    value={transferTo}
                                    onChange={(e) => setTransferTo(e.target.value)}
                                    className="w-full bg-theme-card p-3 text-theme-primary text-sm focus:outline-none appearance-none font-medium rounded-xl border border-transparent focus:border-cyan-500/50 transition-colors"
                                >
                                    <option value="" className="bg-theme-card text-theme-primary">Select Destination Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={acc.id === transferFrom} className="bg-theme-card text-theme-primary">
                                            {acc.institution} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-theme-main rounded-2xl p-1 border border-theme">
                                <label className="text-[10px] text-theme-secondary block mb-1 ml-3 mt-2 font-bold uppercase tracking-wider">Amount (ETB)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={transferAmount}
                                    onChange={handleTransferAmountChange}
                                    className="w-full bg-transparent p-3 text-theme-primary text-lg font-bold focus:outline-none font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="flex-1 py-4 bg-theme-main rounded-2xl text-theme-secondary font-bold border border-theme"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={!transferFrom || !transferTo || !transferAmount}
                                className="flex-1 py-4 bg-cyan-500 rounded-2xl text-black font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
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
