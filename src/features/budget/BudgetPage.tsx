import React, { useState, useMemo, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { getCurrentBudgetMonth, isDateInBudgetMonth } from '@/utils/dateUtils'
import { Icons } from '@/shared/components/Icons'
import type { BudgetCategory, Transaction, RecurringTransaction } from '@/types'
import { BudgetHeader } from './components/BudgetHeader'
import { MonthNavigator } from './components/MonthNavigator'
import { BudgetSummary } from './components/BudgetSummary'
import { BudgetCard } from './components/BudgetCard'
import { TransactionItem } from '@/features/budget/components/TransactionItem'
import { EmptyState } from '@/shared/components/EmptyState'
import { CategorySetupWizard } from './components/CategorySetupWizard'

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
        setActiveTab,
        calendarMode,
        navigationState,
        clearNavigation
    } = useAppContext()

    const { budgetCategories, transactions } = state
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
    const [detailCatId, setDetailCatId] = useState<string | null>(null)
    const [showSetupWizard, setShowSetupWizard] = useState(budgetCategories.length === 0)

    const [catName, setCatName] = useState('')
    const [catAlloc, setCatAlloc] = useState('')
    const [catType, setCatType] = useState<'fixed' | 'variable'>('variable')
    const [catIcon, setCatIcon] = useState('Shopping')
    const [catColor, setCatColor] = useState('bg-cyan-400')
    const [catRollover, setCatRollover] = useState(false)
    const [catErrors, setCatErrors] = useState({ name: false, alloc: false })

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
        { id: 'Teff', icon: Icons.Teff },
        { id: 'Bajaji', icon: Icons.Bajaji },
        { id: 'Phone', icon: Icons.Phone },
        { id: 'Coffee', icon: Icons.Coffee },
        { id: 'Iddir', icon: Icons.Iddir },
    ]

    const CATEGORY_COLORS = [
        'bg-cyan-400', 'bg-yellow-400', 'bg-pink-500', 'bg-purple-400',
        'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-blue-500',
        'bg-orange-400', 'bg-teal-400'
    ]

    useEffect(() => {
        if (navigationState.type === 'budget' && navigationState.targetId) {
            setDetailCatId(navigationState.targetId)
            clearNavigation()
        }
    }, [navigationState, clearNavigation])

    const calculatedBudget = useMemo(() => {
        const startDay = state.budgetStartDate || 1
        const { start: budgetStart, end: budgetEnd } = getCurrentBudgetMonth(startDay, currentDate)

        const transactionsThisMonth = useMemo(() => {
            return transactions.filter(t => {
                return isDateInBudgetMonth(t.date, budgetStart, budgetEnd) && t.type === 'expense'
            })
        }, [transactions, budgetStart, budgetEnd])

        const catsWithSpent = useMemo(() => {
            return budgetCategories.map(cat => {
                const spent = transactionsThisMonth
                    .filter(t => t.category === cat.name)
                    .reduce((sum, t) => sum + t.amount, 0)
                return { ...cat, spent }
            })
        }, [budgetCategories, transactionsThisMonth])

        const knownCategoryNames = useMemo(() => {
            return new Set(budgetCategories.map(c => c.name))
        }, [budgetCategories])

        const uncategorizedAmount = useMemo(() => {
            return transactionsThisMonth
                .filter(t => !knownCategoryNames.has(t.category))
                .reduce((sum, t) => sum + t.amount, 0)
        }, [transactionsThisMonth, knownCategoryNames])

        const uncategorizedCat: (BudgetCategory & { spent: number }) | null = uncategorizedAmount > 0 ? {
            id: 'uncategorized',
            name: 'Other / Uncategorized',
            type: 'variable',
            allocated: 0,
            spent: uncategorizedAmount,
            icon: 'Alert',
            color: 'bg-slate-500',
            rolloverEnabled: false
        } : null

        let variable = catsWithSpent.filter(c => c.type === 'variable')
        if (uncategorizedCat) variable.push(uncategorizedCat)

        const fixed = catsWithSpent.filter(c => c.type === 'fixed')

        const month = currentDate.getMonth()
        const year = currentDate.getFullYear()
        const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear()
        const lastDay = new Date(year, month + 1, 0).getDate()
        const currentDay = isCurrentMonth ? new Date().getDate() : lastDay
        const daysRemaining = Math.max(1, lastDay - currentDay)

        const totalVarLimit = variable.reduce((sum, c) => sum + c.allocated, 0)
        const totalVarSpent = variable.reduce((sum, c) => sum + c.spent, 0)
        const totalFixed = fixed.reduce((sum, c) => sum + c.allocated, 0)

        const remainingVar = totalVarLimit - totalVarSpent
        const totalRemaining = (totalFixed + totalVarLimit) - (fixed.reduce((sum, c) => sum + c.spent, 0) + totalVarSpent)

        return {
            all: catsWithSpent,
            variable,
            fixed,
            daysRemaining,
            isDeficit: totalRemaining < 0,
            remainingVar,
            totalBudget: totalFixed + totalVarLimit,
            totalSpent: fixed.reduce((sum, c) => sum + c.spent, 0) + totalVarSpent,
            hasUncategorized: !!uncategorizedCat,
            remaining: totalRemaining
        }
    }, [budgetCategories, transactions, currentDate, state.budgetStartDate])

    const formatNumberInput = (value: string) => {
        const val = value.replace(/,/g, '')
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            return parts.join('.')
        }
        return value
    }

    const getRawNumber = (val: string) => parseFloat(val.replace(/,/g, ''))

    const handleSaveCategory = () => {
        const hasName = !!catName.trim()
        const hasAlloc = !!catAlloc && getRawNumber(catAlloc) > 0

        if (!hasName || !hasAlloc) {
            setCatErrors({ name: !hasName, alloc: !hasAlloc })
            if (navigator.vibrate) navigator.vibrate(200)
            return
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
        }

        if (editingCategory) updateBudgetCategory(editingCategory.id, data)
        else addBudgetCategory(data)

        setShowCategoryModal(false)
        resetCatForm()
    }

    const resetCatForm = () => {
        setCatName('')
        setCatAlloc('')
        setCatType('variable')
        setCatRollover(false)
        setCatColor('bg-cyan-400')
        setCatErrors({ name: false, alloc: false })
    }

    const openAddCat = (cat?: BudgetCategory) => {
        if (cat) {
            setEditingCategory(cat)
            setCatName(cat.name)
            setCatAlloc(cat.allocated.toLocaleString())
            setCatType(cat.type)
            setCatIcon(cat.icon)
            setCatColor(cat.color)
            setCatRollover(cat.rolloverEnabled || false)
        } else {
            setEditingCategory(null)
            resetCatForm()
        }
        setShowCategoryModal(true)
    }

    const deleteCat = (id: string) => { deleteBudgetCategory(id); setDetailCatId(null) }

    const getCatHistory = (catName: string) => {
        const m = currentDate.getMonth()
        const y = currentDate.getFullYear()

        if (catName === 'Other / Uncategorized') {
            const knownCategoryNames = new Set(budgetCategories.map(c => c.name))
            return transactions.filter(t => {
                const d = new Date(t.date)
                return !knownCategoryNames.has(t.category) && t.type === 'expense' && d.getMonth() === m && d.getFullYear() === y
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        return transactions.filter(t => {
            const d = new Date(t.date)
            return t.category === catName && t.type === 'expense' && d.getMonth() === m && d.getFullYear() === y
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    const handleEdit = (tx: Transaction) => openTransactionModal(tx)
    const handleDelete = (id: string) => { /* Add delete transaction logic */ }
    const handleItemClick = (tx: Transaction) => openTransactionModal(tx)

    return (
        <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
            <BudgetHeader
                onBack={() => setActiveTab('dashboard')}
                onSearch={() => { }}
            />

            {showSetupWizard && <CategorySetupWizard onClose={() => setShowSetupWizard(false)} />}

            <div className="px-5 space-y-6">
                <MonthNavigator
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    calendarMode={calendarMode}
                />

                <BudgetSummary
                    totalBudget={calculatedBudget.totalBudget}
                    totalSpent={calculatedBudget.totalSpent}
                    remaining={calculatedBudget.remaining}
                    daysRemaining={calculatedBudget.daysRemaining}
                    isOverBudget={calculatedBudget.isDeficit}
                    isPrivacyMode={isPrivacyMode}
                />

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
                        <button
                            onClick={() => openAddCat()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                        >
                            <Icons.Plus size={14} />
                            Add Category
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {calculatedBudget.all.slice(0, 6).map((cat) => (
                            <BudgetCard
                                key={cat.id}
                                category={cat}
                                onClick={() => setDetailCatId(cat.id)}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
                    </div>

                    {transactions.filter(t => t.type === 'expense').slice(0, 5).length === 0 ? (
                        <EmptyState
                            icon={<Icons.Shopping size={32} />}
                            title="No expenses this month"
                            description="Start tracking your spending by adding your first expense."
                            action={{
                                label: "Add Expense",
                                onClick: () => openTransactionModal(),
                                icon: <Icons.Plus size={18} />
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {transactions
                                .filter(t => t.type === 'expense')
                                .slice(0, 5)
                                .map((tx) => (
                                    <TransactionItem
                                        key={tx.id}
                                        transaction={tx}
                                        formatDate={formatDate}
                                        isPrivacyMode={isPrivacyMode}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onClick={handleItemClick}
                                    />
                                ))}
                        </div>
                    )}
                </section>
            </div>

            {showCategoryModal && (
                <div className="fixed inset-0 modal-overlay z-[90] flex items-end sm:items-center justify-center" onClick={() => setShowCategoryModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-white/10 rounded-full mx-auto mb-8 sm:hidden shrink-0" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{editingCategory ? 'Edit Category' : 'New Category'}</h3>

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={e => { setCatName(e.target.value); setCatErrors(p => ({ ...p, name: false })); }}
                                    placeholder="Category Name"
                                    className={`w-full bg-gray-50 dark:bg-black/20 border rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-primary ${catErrors.name ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
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
                                    className={`w-full bg-gray-50 dark:bg-black/20 border rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-primary ${catErrors.alloc ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'}`}
                                />
                                {catErrors.alloc && <p className="text-[10px] text-rose-500 font-bold mt-1">Required</p>}
                            </div>

                            <div className="flex gap-2">
                                {['variable', 'fixed'].map(t => (
                                    <button key={t} onClick={() => setCatType(t as any)} className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border ${catType === t ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {BUDGET_ICONS.map(i => (
                                    <button key={i.id} onClick={() => setCatIcon(i.id)} className={`p-2 rounded-lg flex items-center justify-center border ${catIcon === i.id ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                        <i.icon size={18} />
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCatColor(c)}
                                        className={`w-10 h-10 rounded-full ${c} ${catColor === c ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'} transition-all`}
                                    />
                                ))}
                            </div>

                            <button onClick={handleSaveCategory} className="w-full py-3 bg-primary rounded-xl text-white font-bold shadow-lg shadow-primary/20">
                                {editingCategory ? 'Update' : 'Create'} Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {detailCatId && (
                <div className="fixed inset-0 modal-overlay z-[80] flex items-end sm:items-center justify-center" onClick={() => setDetailCatId(null)}>
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 h-[85vh] animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 shrink-0" />

                        {(() => {
                            const isUncategorized = detailCatId === 'uncategorized'
                            const cat = isUncategorized
                                ? { id: 'uncategorized', name: 'Other / Uncategorized', allocated: 0, spent: 0, type: 'variable' as const, icon: 'Alert', color: 'bg-slate-500' }
                                : budgetCategories.find(c => c.id === detailCatId)

                            if (!cat) return null
                            const history = getCatHistory(cat.name)
                            const totalSpent = history.reduce((sum, t) => sum + t.amount, 0)

                            return (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {history.length} transactions • {totalSpent.toLocaleString()} ETB total
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {!isUncategorized && (
                                                <>
                                                    <button onClick={() => { openAddCat(cat); setDetailCatId(null); }} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                                        <Icons.Edit size={16} />
                                                    </button>
                                                    <button onClick={() => deleteCat(cat.id)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-rose-500">
                                                        <Icons.Delete size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => setDetailCatId(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                                <Icons.Close size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                                        {history.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                                    <Icons.Shopping size={32} className="text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">No transactions in this category</p>
                                            </div>
                                        ) : (
                                            history.map(tx => (
                                                <div key={tx.id} className="flex justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.title}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                                                    </div>
                                                    <p className="text-rose-500 font-bold">-{tx.amount.toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            )}
        </div>
    )
}
