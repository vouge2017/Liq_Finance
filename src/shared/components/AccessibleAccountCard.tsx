import React, { useState, useRef, useEffect } from 'react'
import { Icons } from '@/shared/components/Icons'
import { EthiopianNumericKeypad } from './EthiopianNumericKeypad'
import { useHaptic } from '@/hooks/useHaptic'
import { Account } from '@/types'
import { calculateLoanAmortization } from '@/lib/loan-utils'

interface AccessibleAccountCardProps {
    account: Account
    defaultAccountId?: string
    isSelected: boolean
    onSelect: (accountId: string) => void
    onEdit: (account: Account) => void
    onDelete: (accountId: string) => void
    onSetDefault: (accountId: string) => void
    onAddTransaction: (accountId: string, type: 'income' | 'expense') => void
    isPrivacyMode: boolean
    formatDate: (date: string) => string
    transactions: any[]
}

export const AccessibleAccountCard: React.FC<AccessibleAccountCardProps> = ({
    account,
    defaultAccountId,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onSetDefault,
    onAddTransaction,
    isPrivacyMode,
    formatDate,
    transactions
}) => {
    const [showKeypad, setShowKeypad] = useState(false)
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
    const [showActions, setShowActions] = useState(false)
    const [showBreakdown, setShowBreakdown] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const { triggerHaptic } = useHaptic()

    // WCAG 2.1 AA compliant focus management
    useEffect(() => {
        if (isSelected && cardRef.current) {
            cardRef.current.focus()
        }
    }, [isSelected])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(account.id)
            triggerHaptic('medium')
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            const nextCard = cardRef.current?.nextElementSibling as HTMLElement
            nextCard?.focus()
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            const prevCard = cardRef.current?.previousElementSibling as HTMLElement
            prevCard?.focus()
        }
    }

    const handleTransactionAmount = (amount: string) => {
        // Convert to ETB (assuming amount is in cents)
        const etbAmount = parseInt(amount) / 100
        onAddTransaction(account.id, transactionType)
        setShowKeypad(false)
        triggerHaptic('heavy')
    }

    // Ethiopian-optimized color classes (neutral for expenses)
    const getExpenseColor = (type: string) => {
        if (type === 'income') return 'text-emerald-500'
        if (type === 'expense') return 'text-gray-600 dark:text-gray-300' // Neutral instead of red
        return 'text-theme-primary'
    }

    const accountTransactions = transactions.filter(t => t.accountId === account.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div
            ref={cardRef}
            role="button"
            tabIndex={0}
            aria-label={`Account ${account.name} with balance ${isPrivacyMode ? 'hidden' : `${account.balance} Ethiopian Birr`}`}
            aria-expanded={showActions}
            aria-describedby={`account-${account.id}-balance`}
            className={`
        relative bg-theme-card border-2 rounded-3xl p-5 transition-all duration-300
        ${isSelected
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'border-theme hover:border-cyan-400/50 hover:shadow-md'
                }
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-theme-main
        ${account.type === 'Loan' ? 'border-l-4 border-l-amber-500' : ''}
        card-enhanced
      `}
            onClick={() => onSelect(account.id)}
            onKeyDown={handleKeyDown}
        >
            {/* Account Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3
                            className="font-bold text-theme-primary text-lg leading-tight ethiopic"
                            style={{ fontSize: '16px', lineHeight: '1.6' }} // Ethiopian typography
                        >
                            {account.name}
                        </h3>
                        {account.id === defaultAccountId && (
                            <span
                                className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1"
                                aria-label="Default account"
                            >
                                <Icons.Star size={10} fill="currentColor" />
                                Default
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-theme-secondary font-mono bg-theme-main px-2 py-1 rounded-md">
                            {account.accountNumber || '****'}
                        </span>
                        <span className={`
              text-[10px] px-2 py-1 rounded-md font-bold
              ${account.type === 'Bank' ? 'bg-blue-500/10 text-blue-400' :
                                account.type === 'Mobile Money' ? 'bg-cyan-500/10 text-cyan-400' :
                                    account.type === 'Cash' ? 'bg-gray-500/10 text-gray-400' :
                                        'bg-amber-500/10 text-amber-400'
                            }
            `}>
                            {account.type}
                        </span>
                        <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                            <Icons.Shield size={10} />
                            Encrypted
                        </span>
                        {account.type === 'Loan' && account.loanDetails && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                    Due: {account.loanDetails.dueDate}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowBreakdown(true); }}
                                    className="text-[10px] text-cyan-500 font-bold hover:underline text-left"
                                >
                                    View Breakdown
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 ml-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onSetDefault(account.id)
                            triggerHaptic('light')
                        }}
                        className={`
              p-2.5 rounded-xl border transition-all duration-200
              ${account.id === defaultAccountId
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 cursor-default'
                                : 'bg-theme-main text-theme-secondary border-theme hover:text-yellow-400 hover:border-yellow-400/30'
                            }
            `}
                        aria-label={account.id === defaultAccountId ? "Default account" : "Set as default account"}
                        title={account.id === defaultAccountId ? "Default Account" : "Set as Default"}
                    >
                        <Icons.Star size={16} fill={account.id === defaultAccountId ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowActions(!showActions)
                            triggerHaptic('light')
                        }}
                        className="p-2.5 rounded-xl bg-theme-main text-theme-secondary hover:text-cyan-400 border border-theme hover:border-cyan-400/30 transition-all"
                        aria-label="Show account actions"
                        aria-expanded={showActions}
                    >
                        <Icons.MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Balance Display */}
            <div
                id={`account-${account.id}-balance`}
                className="flex items-baseline gap-2 mb-4"
                aria-live="polite"
            >
                <span
                    className="text-2xl font-bold text-cyan-400 font-mono"
                    aria-label={`Balance: ${isPrivacyMode ? 'hidden for privacy' : `${account.balance} Ethiopian Birr`}`}
                >
                    {isPrivacyMode ? '••••••' : account.balance.toLocaleString()}
                </span>
                <span className="text-sm text-theme-secondary font-medium">ETB</span>
            </div>

            {/* Quick Action Buttons */}
            {showActions && (
                <div
                    className="flex gap-2 mb-4 animate-fade-in"
                    role="group"
                    aria-label="Quick actions"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setTransactionType('income')
                            setShowKeypad(true)
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-1"
                        aria-label="Add income transaction"
                    >
                        <Icons.Plus size={14} />
                        Income
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setTransactionType('expense')
                            setShowKeypad(true)
                        }}
                        className="flex-1 py-2 px-3 bg-gray-500/10 text-gray-600 dark:text-gray-300 border border-gray-500/20 rounded-xl text-xs font-bold hover:bg-gray-500 hover:text-white transition-all flex items-center justify-center gap-1"
                        aria-label="Add expense transaction"
                    >
                        <Icons.ArrowUp size={14} className="rotate-45" />
                        Expense
                    </button>
                </div>
            )}

            {/* Transaction History Preview */}
            {accountTransactions.length > 0 && (
                <div className="border-t border-theme pt-4">
                    <h4 className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Icons.History size={12} />
                        Recent Activity
                    </h4>
                    <div className="space-y-2">
                        {accountTransactions.slice(0, 2).map((tx, idx) => (
                            <div key={tx.id} className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-theme-primary font-medium">{tx.title}</p>
                                    <p className="text-[10px] text-theme-secondary">{formatDate(tx.date)}</p>
                                </div>
                                <span className={`text-sm font-bold font-mono ${getExpenseColor(tx.type)}`}>
                                    {tx.type === 'income' ? '+' : '-'}{isPrivacyMode ? '••••' : tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {accountTransactions.length > 2 && (
                            <button
                                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Open detailed history
                                }}
                            >
                                View all {accountTransactions.length} transactions
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Loan Breakdown Modal */}
            {showBreakdown && account.type === 'Loan' && account.loanDetails && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBreakdown(false)} />
                    <div className="bg-white dark:bg-[#101622] w-full max-w-lg rounded-[2.5rem] p-8 animate-dialog relative z-10 shadow-2xl border border-white/20 dark:border-white/5 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Loan Breakdown</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{account.name} • {account.loanDetails.provider}</p>
                            </div>
                            <button onClick={() => setShowBreakdown(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                <Icons.Close size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Principal</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{(account.loanDetails.principal || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Rate</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{account.loanDetails.interestRate || 0}%</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Term</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{account.loanDetails.termMonths || 0} Mo</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white dark:bg-[#101622] z-10">
                                    <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
                                        <th className="pb-4">No.</th>
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Payment</th>
                                        <th className="pb-4">Principal</th>
                                        <th className="pb-4">Interest</th>
                                        <th className="pb-4 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {calculateLoanAmortization(
                                        account.loanDetails.principal || 0,
                                        account.loanDetails.interestRate || 0,
                                        account.loanDetails.termMonths || 0
                                    ).map((item) => (
                                        <tr key={item.period} className="text-sm">
                                            <td className="py-4 font-bold text-gray-400">{item.period}</td>
                                            <td className="py-4 font-bold text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</td>
                                            <td className="py-4 font-black text-gray-900 dark:text-white">{Math.round(item.payment).toLocaleString()}</td>
                                            <td className="py-4 text-gray-500">{Math.round(item.principal).toLocaleString()}</td>
                                            <td className="py-4 text-amber-500">{Math.round(item.interest).toLocaleString()}</td>
                                            <td className="py-4 text-right font-bold text-gray-900 dark:text-white">{Math.round(item.remainingBalance).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Interest</p>
                                <p className="text-xl font-black text-amber-500">
                                    {Math.round(
                                        calculateLoanAmortization(
                                            account.loanDetails.principal || 0,
                                            account.loanDetails.interestRate || 0,
                                            account.loanDetails.termMonths || 0
                                        ).reduce((sum, item) => sum + item.interest, 0)
                                    ).toLocaleString()} ETB
                                </p>
                            </div>
                            <button
                                onClick={() => setShowBreakdown(false)}
                                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ethiopian Numeric Keypad Modal */}
            {showKeypad && (
                <EthiopianNumericKeypad
                    onAmountChange={() => { }}
                    onConfirm={() => handleTransactionAmount('0')}
                    onClose={() => setShowKeypad(false)}
                    currentAmount=""
                    title={`Add ${transactionType} to ${account.name}`}
                />
            )}
        </div>
    )
}