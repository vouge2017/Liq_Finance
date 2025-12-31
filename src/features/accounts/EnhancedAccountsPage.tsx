import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/shared/components/Icons'
import { getBankIcon } from '@/shared/components/BankIcons'
import { AccessibleAccountCard } from '@/shared/components/AccessibleAccountCard'
import { AccountSelectionSkeleton, NetWorthSkeleton } from '@/shared/components/AccountSkeletons'
import { EthiopianNumericKeypad } from '@/shared/components/EthiopianNumericKeypad'
import { useAppContext } from '@/context/AppContext'
import { useHaptic } from '@/hooks/useHaptic'
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates'
import { Account, Transaction } from '@/types'

export const EnhancedAccountsPage: React.FC = () => {
    const { t } = useTranslation()
    const {
        state,
        addAccount,
        deleteAccount,
        updateAccount,
        setDefaultAccount,
        transferFunds,
        formatDate,
        activeProfile,
        isPrivacyMode,
        togglePrivacyMode,
        openTransactionModal
    } = useAppContext()
    const { accounts, transactions } = state
    const { triggerHaptic } = useHaptic()

    // Loading state for skeleton screens
    const [isLoading, setIsLoading] = useState(true)

    // Accessibility: Focus management
    const [focusedAccountId, setFocusedAccountId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Ethiopian-optimized optimistic updates
    const { optimisticUpdate, pendingItems } = useOptimisticUpdates(accounts)

    // Simulate loading for skeleton demonstration
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    // WCAG 2.1 AA compliant contrast ratios maintained
    const getExpenseColor = (type: string) => {
        // Ethiopian color psychology: neutral grays for expenses to reduce anxiety
        if (type === 'income') return 'text-emerald-500' // High contrast green
        if (type === 'expense') return 'text-gray-600 dark:text-gray-300' // Neutral, not anxiety-inducing red
        return 'text-theme-primary'
    }

    // Accessibility: Keyboard navigation
    const handleKeyNavigation = useCallback((e: KeyboardEvent) => {
        if (!containerRef.current) return

        const focusableElements = containerRef.current.querySelectorAll('[tabindex="0"]')
        const currentIndex = Array.from(focusableElements).findIndex(el =>
            (el as HTMLElement).dataset.accountId === focusedAccountId
        )

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                const nextIndex = (currentIndex + 1) % focusableElements.length
                const nextElement = focusableElements[nextIndex] as HTMLElement
                nextElement?.focus()
                setFocusedAccountId(nextElement.dataset.accountId || null)
                triggerHaptic('light')
                break
            case 'ArrowUp':
                e.preventDefault()
                const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
                const prevElement = focusableElements[prevIndex] as HTMLElement
                prevElement?.focus()
                setFocusedAccountId(prevElement.dataset.accountId || null)
                triggerHaptic('light')
                break
            case 'Home':
                e.preventDefault()
                const firstElement = focusableElements[0] as HTMLElement
                firstElement?.focus()
                setFocusedAccountId(firstElement.dataset.accountId || null)
                triggerHaptic('light')
                break
            case 'End':
                e.preventDefault()
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
                lastElement?.focus()
                setFocusedAccountId(lastElement.dataset.accountId || null)
                triggerHaptic('light')
                break
        }
    }, [focusedAccountId, triggerHaptic])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyNavigation)
        return () => document.removeEventListener('keydown', handleKeyNavigation)
    }, [handleKeyNavigation])

    // Ethiopian typography with proper font sizes and line heights
    const ethiopianTextStyle = {
        fontSize: '16px', // Never below 16px for Amharic
        lineHeight: '1.6', // Increased for Fidel character clarity
        fontFamily: "'Noto Sans Ethiopic', 'Inter', sans-serif"
    }

    // Enhanced account selection with optimistic updates
    const handleAccountSelect = useCallback(async (accountId: string) => {
        const account = accounts.find(a => a.id === accountId)
        if (!account) return

        triggerHaptic('medium')

        // Optimistic UI update - immediately show selection
        setFocusedAccountId(accountId)

        // If this was a double-click or special action, handle it
        // This can be extended for more complex interactions
    }, [accounts, triggerHaptic])

    // Ethiopian numeric keypad integration for balance inputs
    const handleBalanceEdit = useCallback(async (accountId: string, newBalance: number) => {
        const account = accounts.find(a => a.id === accountId)
        if (!account) return

        const updatedAccount = { ...account, balance: newBalance }

        try {
            await optimisticUpdate(
                async () => {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 500))
                    return updatedAccount
                },
                updatedAccount
            )
            triggerHaptic('heavy')
        } catch (error) {
            console.error('Failed to update balance:', error)
            triggerHaptic('error')
        }
    }, [accounts, optimisticUpdate, triggerHaptic])

    // Financial calculations with Ethiopian context
    const totalAssets = accounts.reduce((acc, curr) => {
        if (curr.type === 'Loan') return acc - curr.balance
        return acc + curr.balance
    }, 0)

    const bankAssets = accounts.filter(a => a.type === 'Bank').reduce((acc, curr) => acc + curr.balance, 0)
    const mobileAssets = accounts.filter(a => a.type === 'Mobile Money').reduce((acc, curr) => acc + curr.balance, 0)
    const loanLiabilities = accounts.filter(a => a.type === 'Loan').reduce((acc, curr) => acc + curr.balance, 0)
    const grossAssets = accounts.reduce((acc, curr) => curr.type !== 'Loan' ? acc + curr.balance : acc, 0)

    // WCAG 2.1 AA compliant color ratios
    const getNetWorthColor = () => {
        if (totalAssets >= 0) return 'text-emerald-400' // High contrast green
        return 'text-amber-400' // High contrast amber for negative
    }

    if (isLoading) {
        return (
            <div className="pb-28 animate-push" ref={containerRef}>
                <AccountSelectionSkeleton />
            </div>
        )
    }

    return (
        <div className="pb-28 animate-push relative" ref={containerRef}>
            {/* Enhanced Header with Accessibility */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1
                        className="text-theme-primary text-xl font-bold ethiopic"
                        style={ethiopianTextStyle}
                    >
                        {t('accounts.myAccounts')}
                    </h1>
                    <p
                        className="text-theme-secondary text-xs ethiopic"
                        style={ethiopianTextStyle}
                    >
                        የእኔ ሂሳቦች
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => { }}
                        className="flex items-center gap-2 bg-theme-card border border-theme px-3 py-2 rounded-full text-theme-secondary text-xs font-bold hover:text-cyan-400 hover:border-cyan-400/30 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        aria-label="Sort accounts by different criteria"
                        title="Sort Accounts"
                    >
                        <Icons.Filter size={14} aria-hidden="true" />
                        <span>Sort</span>
                    </button>

                    <button
                        onClick={() => { }}
                        className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-full text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        aria-label="Transfer money between accounts"
                    >
                        <Icons.Transfer size={14} aria-hidden="true" />
                        <span>Transfer</span>
                    </button>
                </div>
            </header>

            {/* Enhanced Net Worth Display with Ethiopian Context */}
            <section className="mb-6 flex flex-col gap-2" aria-label="Net worth summary">
                <div className="flex justify-between items-center text-xs text-theme-secondary mb-1">
                    <span style={ethiopianTextStyle}>
                        {t('accounts.netWorth')} ({activeProfile})
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePrivacyMode}
                            className="hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                            aria-label={isPrivacyMode ? "Show balances" : "Hide balances for privacy"}
                        >
                            {isPrivacyMode ? <Icons.EyeOff size={14} aria-hidden="true" /> : <Icons.Eye size={14} aria-hidden="true" />}
                        </button>
                        <span
                            className="font-mono text-theme-primary font-bold text-sm"
                            aria-live="polite"
                            aria-label={`Net worth: ${isPrivacyMode ? 'hidden for privacy' : `${totalAssets} Ethiopian Birr`}`}
                        >
                            {isPrivacyMode ? '••••••' : totalAssets.toLocaleString()} ETB
                        </span>
                    </div>
                </div>

                <div className="w-full h-3 bg-theme-card rounded-full flex overflow-hidden" role="img" aria-label="Asset allocation breakdown">
                    <div
                        className="h-full bg-purple-500"
                        style={{ width: grossAssets > 0 ? `${(bankAssets / grossAssets) * 100}%` : '0%' }}
                        aria-label={`Bank accounts: ${bankAssets} ETB`}
                    ></div>
                    <div
                        className="h-full bg-cyan-500"
                        style={{ width: grossAssets > 0 ? `${(mobileAssets / grossAssets) * 100}%` : '0%' }}
                        aria-label={`Mobile money: ${mobileAssets} ETB`}
                    ></div>
                    <div className="h-full bg-gray-500 flex-1" aria-label="Other assets"></div>
                </div>

                {/* Ethiopian Financial Context */}
                {loanLiabilities > 0 && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            💡 <strong>Financial Tip:</strong> You have {loanLiabilities.toLocaleString()} ETB in loans. Consider prioritizing loan payments for better financial health.
                        </p>
                    </div>
                )}
            </section>

            {/* Accessible Account Grid */}
            <main>
                <div className="space-y-6" role="list" aria-label="Financial accounts">
                    {accounts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-theme-card rounded-full flex items-center justify-center mx-auto mb-4 border border-theme">
                                <Icons.Bank size={32} className="text-theme-secondary" />
                            </div>
                            <h3 className="text-theme-primary font-bold mb-2" style={ethiopianTextStyle}>
                                No accounts yet
                            </h3>
                            <p className="text-theme-secondary text-sm mb-6 max-w-sm mx-auto">
                                Add your first bank account, mobile money wallet, or track cash to start managing your finances.
                            </p>
                            <button
                                onClick={() => { }}
                                className="bg-cyan-500 text-black font-bold py-3 px-6 rounded-2xl hover:bg-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                            >
                                Add First Account
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                            {accounts.map((account, index) => (
                                <div
                                    key={account.id}
                                    data-account-id={account.id}
                                    role="listitem"
                                    tabIndex={0}
                                >
                                    <AccessibleAccountCard
                                        account={account}
                                        defaultAccountId={state.defaultAccountId}
                                        isSelected={focusedAccountId === account.id}
                                        onSelect={handleAccountSelect}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                        onSetDefault={setDefaultAccount}
                                        onAddTransaction={(accountId, type) => openTransactionModal(undefined, { accountId, type })}
                                        isPrivacyMode={isPrivacyMode}
                                        formatDate={formatDate}
                                        transactions={transactions}
                                    />

                                    {/* Pending transaction indicator */}
                                    {pendingItems.includes(account.id) && (
                                        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                Syncing changes...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enhanced Add Account Button with Ethiopian Context */}
                <button
                    onClick={() => { }}
                    className="w-full mt-6 py-4 bg-cyan-500 rounded-2xl flex items-center justify-center gap-2 text-black hover:bg-cyan-400 transition-all font-bold shadow-lg shadow-cyan-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    aria-label="Add new bank account, mobile money wallet, or cash account"
                >
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <Icons.Plus size={16} aria-hidden="true" />
                    </div>
                    <span style={ethiopianTextStyle}>Add New Account</span>
                </button>
            </main>

            {/* Accessibility: Screen reader announcements */}
            <div
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
                id="account-announcements"
            >
                {/* Dynamic announcements for screen readers */}
            </div>
        </div>
    )
}