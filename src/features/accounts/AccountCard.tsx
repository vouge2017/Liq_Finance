import React from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';

interface AccountCardProps {
    account: {
        id: string;
        name: string;
        institution: string;
        type: string;
        balance: number;
        accountNumber?: string;
        phoneNumber?: string;
    };
    onTransfer?: () => void;
    onAddMoney?: () => void;
    onSendMoney?: () => void;
    onTopUp?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
    account,
    onTransfer,
    onAddMoney,
    onSendMoney,
    onTopUp
}) => {
    const { isPrivacyMode } = useAppContext();
    const isBankAccount = account.type === 'Bank';
    const isMobileMoney = account.type === 'Mobile Money';

    const getGradientClasses = () => {
        if (account.institution.toLowerCase().includes('cbe') || account.institution.toLowerCase().includes('commercial')) {
            return 'from-emerald-500 to-emerald-600';
        }
        if (account.institution.toLowerCase().includes('telebirr') || account.institution.toLowerCase().includes('tele')) {
            return 'from-cyan-500 to-cyan-600';
        }
        return 'from-slate-500 to-slate-600';
    };

    const getIcon = () => {
        if (isBankAccount) return '🏦';
        if (isMobileMoney) return '📱';
        return '💰';
    };

    const getInstitutionLabel = () => {
        if (isBankAccount) return 'Commercial Bank';
        if (isMobileMoney) return 'Mobile Money';
        return account.type;
    };

    return (
        <div className={`bg-gradient-to-br ${getGradientClasses()} rounded-[40px] p-8 shadow-2xl mb-6 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-white/20 transition-all duration-500"></div>

            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                        <span className="text-white text-2xl drop-shadow-sm">{getIcon()}</span>
                    </div>
                    <div>
                        <div className="text-white text-xl font-black tracking-tight">{account.institution}</div>
                        <div className="text-white/70 text-xs font-bold uppercase tracking-widest">{getInstitutionLabel()}</div>
                    </div>
                </div>
                <button className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center active:scale-90 transition-all border border-white/20">
                    <Icons.MoreVertical className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Account Number/Phone Number */}
            <div className="mb-4">
                <div className="text-white/60 text-xs mb-1">
                    {isBankAccount ? 'Account Number' : 'Phone Number'}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-mono">
                        {isPrivacyMode ? '•••• •••• ••••' :
                            isBankAccount ? `**** **** ${account.accountNumber?.slice(-4) || '****'}` :
                                `+251 9** *** ***`}
                    </span>
                    <button className="text-white/60 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Balance */}
            <div className="border-t border-white/20 pt-6">
                <div className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-white text-5xl font-black tracking-tighter">
                        {isPrivacyMode ? '••••••' : account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-white/80 text-lg font-black">ETB</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
                {isBankAccount ? (
                    <>
                        <button
                            onClick={onTransfer}
                            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-black/5"
                        >
                            Transfer
                        </button>
                        <button
                            onClick={onAddMoney}
                            className="flex-1 bg-white hover:bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-white/10"
                        >
                            Add Money
                        </button>
                    </>
                ) : isMobileMoney ? (
                    <>
                        <button
                            onClick={onSendMoney}
                            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-black/5"
                        >
                            Send Money
                        </button>
                        <button
                            onClick={onTopUp}
                            className="flex-1 bg-white hover:bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-white/10"
                        >
                            Top Up
                        </button>
                    </>
                ) : (
                    <button className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-black/5">
                        View Details
                    </button>
                )}
            </div>
        </div>
    );
};

export default AccountCard;