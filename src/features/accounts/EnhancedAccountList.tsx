import React, { useState } from 'react';
import { AccountCard } from './AccountCard';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';

interface Account {
    id: string;
    name: string;
    institution: string;
    type: string;
    balance: number;
    accountNumber?: string;
    phoneNumber?: string;
}

interface EnhancedAccountListProps {
    accounts: Account[];
    onTransfer?: (account: Account) => void;
    onAddMoney?: (account: Account) => void;
    onSendMoney?: (account: Account) => void;
    onTopUp?: (account: Account) => void;
    onAddAccount?: () => void;
}

export const EnhancedAccountList: React.FC<EnhancedAccountListProps> = ({
    accounts,
    onTransfer,
    onAddMoney,
    onSendMoney,
    onTopUp,
    onAddAccount
}) => {
    const { isPrivacyMode } = useAppContext();
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    const handleAccountAction = (action: string, account: Account) => {
        setSelectedAccount(account.id);
        switch (action) {
            case 'transfer':
                onTransfer?.(account);
                break;
            case 'addMoney':
                onAddMoney?.(account);
                break;
            case 'sendMoney':
                onSendMoney?.(account);
                break;
            case 'topUp':
                onTopUp?.(account);
                break;
        }
    };

    return (
        <div className="space-y-6">
            {/* Total Balance Summary */}
            <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-white/[0.03] rounded-[40px] p-8 shadow-2xl shadow-black/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="text-theme-secondary text-[10px] font-black uppercase tracking-widest mb-3">Total Balance</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-theme-primary text-5xl font-black tracking-tighter">
                        {isPrivacyMode ? '••••••' : totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-theme-secondary text-xl font-black">ETB</span>
                </div>
                <div className="text-theme-secondary text-xs font-medium mt-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Account Cards */}
            <div className="space-y-4">
                {accounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onTransfer={() => handleAccountAction('transfer', account)}
                        onAddMoney={() => handleAccountAction('addMoney', account)}
                        onSendMoney={() => handleAccountAction('sendMoney', account)}
                        onTopUp={() => handleAccountAction('topUp', account)}
                    />
                ))}
            </div>

            {/* Add Account Button */}
            <button
                onClick={onAddAccount}
                className="w-full bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.05] border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[40px] p-10 flex items-center justify-center gap-4 transition-all active:scale-95 group"
            >
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icons.Plus size={24} className="text-cyan-500" />
                </div>
                <div className="text-left">
                    <div className="text-theme-primary text-xl font-black tracking-tight">Add New Account</div>
                    <div className="text-theme-secondary text-sm font-medium">Connect bank or mobile money</div>
                </div>
            </button>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 border border-black/[0.03] dark:border-white/[0.03] rounded-[40px] p-8 shadow-2xl shadow-black/5">
                <h3 className="text-theme-primary text-xl font-black tracking-tight mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-[32px] p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group">
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icons.Transfer size={24} className="text-cyan-500" />
                        </div>
                        <span className="text-theme-primary text-sm font-black">Transfer</span>
                    </button>

                    <button className="bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-[32px] p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icons.Plus size={24} className="text-emerald-500" />
                        </div>
                        <span className="text-theme-primary text-sm font-black">Add Money</span>
                    </button>

                    <button className="bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-[32px] p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group">
                        <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icons.Wallet size={24} className="text-orange-500" />
                        </div>
                        <span className="text-theme-primary text-sm font-black">Pay Bills</span>
                    </button>

                    <button className="bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-[32px] p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icons.History size={24} className="text-purple-500" />
                        </div>
                        <span className="text-theme-primary text-sm font-black">Analytics</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedAccountList;