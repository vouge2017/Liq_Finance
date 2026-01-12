"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

interface SmartSuggestion {
    id: string
    label: string
    category: string
    amount?: string
    icon: any
}

interface SimpleTransactionFormProps {
    amount: string
    setAmount: (val: string) => void
    handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    title: string
    setTitle: (val: string) => void
    type: "income" | "expense"
    setType: (val: "income" | "expense") => void
    category: string
    setCategory: (val: string) => void
    accountId: string
    setAccountId: (val: string) => void
    errors: { amount: boolean; title: boolean; account: boolean }
    amountInputRef: React.RefObject<HTMLInputElement>
    smartSuggestions: SmartSuggestion[]
    handleSmartClick: (s: SmartSuggestion) => void
    suggestions: string[]
    isEditing: boolean
    INCOME_CATEGORIES: any[]
}

const CATEGORY_COLORS: Record<string, string> = {
    Food: 'bg-orange-500',
    Transport: 'bg-blue-500',
    Shopping: 'bg-pink-500',
    Utilities: 'bg-cyan-500',
    Entertainment: 'bg-purple-500',
    Health: 'bg-emerald-500',
    Education: 'bg-indigo-500',
    Other: 'bg-gray-500',
    Salary: 'bg-emerald-500',
    Business: 'bg-amber-500',
    Iqub: 'bg-rose-500',
    Remittance: 'bg-blue-400',
    Freelance: 'bg-purple-400',
    Gift: 'bg-pink-400',
}

export const SimpleTransactionForm: React.FC<SimpleTransactionFormProps> = ({
    amount,
    handleAmountChange,
    title,
    setTitle,
    type,
    setType,
    category,
    setCategory,
    accountId,
    setAccountId,
    errors,
    amountInputRef,
    smartSuggestions,
    handleSmartClick,
    suggestions,
    isEditing,
    INCOME_CATEGORIES
}) => {
    const { state } = useAppContext()

    const getCategoryIcon = (catName: string) => {
        const cat = state.budgetCategories.find(c => c.name === catName)
        if (cat) {
            const IconComp = (Icons as any)[cat.icon] || Icons.Shopping
            return <IconComp size={18} />
        }
        const incomeCat = INCOME_CATEGORIES.find(c => c.id === catName)
        if (incomeCat) {
            const IconComp = incomeCat.icon
            return <IconComp size={18} />
        }
        return <Icons.Shopping size={18} />
    }

    return (
        <div className="space-y-5">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
                <div className="text-center mb-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Amount</p>
                    <div className="relative inline-block w-full max-w-xs">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400 -ml-2">ETB</span>
                        <input
                            ref={amountInputRef}
                            type="text"
                            inputMode="decimal"
                            value={amount || ""}
                            onChange={handleAmountChange}
                            className={`w-full bg-transparent text-center text-5xl font-black outline-none placeholder-gray-200 dark:placeholder-gray-700 ${
                                type === "income" ? "text-emerald-500" : "text-gray-900 dark:text-white"
                            }`}
                            placeholder="0"
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-xs text-rose-500 font-bold mt-2 flex items-center justify-center gap-1">
                            <Icons.Alert size={12} />
                            Amount is required
                        </p>
                    )}
                </div>

                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <button
                        onClick={() => { setType("expense"); setCategory(state.budgetCategories[0]?.name || "Food"); }}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            type === "expense"
                                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${type === "expense" ? "bg-rose-500" : "bg-gray-300"}`} />
                        Expense
                    </button>
                    <button
                        onClick={() => { setType("income"); setCategory("Salary"); }}
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            type === "income"
                                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${type === "income" ? "bg-emerald-500" : "bg-gray-300"}`} />
                        Income
                    </button>
                </div>

                {!isEditing && smartSuggestions.length > 0 && (
                    <div className="mt-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Quick amounts</p>
                        <div className="flex flex-wrap gap-2">
                            {smartSuggestions.slice(0, 6).map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSmartClick(s)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full border border-gray-100 dark:border-white/5 transition-all active:scale-95"
                                >
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{s.label}</span>
                                    {s.amount && <span className="text-[10px] text-gray-400">{s.amount}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Description</label>
                <div className={`relative rounded-xl bg-white dark:bg-white/5 border transition-all ${
                    errors.title ? "border-rose-500" : "border-gray-100 dark:border-white/10 focus-within:border-primary"
                }`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icons.Edit size={16} />
                    </div>
                    <input
                        type="text"
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent px-4 py-3.5 pl-12 text-sm font-semibold text-gray-900 dark:text-white outline-none placeholder-gray-300 dark:placeholder-gray-600"
                        placeholder="What was this for?"
                    />
                </div>
                {errors.title && (
                    <p className="text-xs text-rose-500 font-bold ml-1 flex items-center gap-1">
                        <Icons.Alert size={12} />
                        Description is required
                    </p>
                )}

                {suggestions.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setTitle(s)}
                                className="flex-shrink-0 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5 transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                    {category && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[category] || 'bg-gray-500'}`}>
                            {category}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {(type === 'income' ? INCOME_CATEGORIES : state.budgetCategories).map((cat) => {
                        const isSelected = category === (cat.id || cat.name)
                        const catIcon = type === 'income'
                            ? cat.icon
                            : (Icons as any)[(cat as any).icon] || Icons.Shopping

                        return (
                            <button
                                key={cat.id || cat.name}
                                onClick={() => setCategory(cat.id || cat.name)}
                                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all active:scale-95 ${
                                    isSelected
                                        ? "bg-primary/10 border-primary shadow-sm"
                                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                    isSelected
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 dark:bg-white/10 text-gray-500"
                                }`}>
                                    {React.createElement(catIcon, { size: 16 })}
                                </div>
                                <span className={`text-[9px] font-bold truncate w-full text-center ${
                                    isSelected ? "text-primary" : "text-gray-500 dark:text-gray-400"
                                }`}>
                                    {cat.label || cat.name}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account</label>
                    {errors.account && <span className="text-xs text-rose-500 font-bold animate-pulse">Required</span>}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
                    {state.accounts.map((acc) => {
                        const isSelected = accountId === acc.id
                        return (
                            <button
                                key={acc.id}
                                onClick={() => setAccountId(acc.id)}
                                className={`flex-shrink-0 flex items-center gap-2.5 p-2.5 pr-4 rounded-xl border transition-all active:scale-95 ${
                                    isSelected
                                        ? "bg-primary/10 border-primary shadow-sm"
                                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs ${acc.color || 'bg-gray-600'}`}>
                                    {acc.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold ${isSelected ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}>
                                        {acc.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{acc.institution || acc.type}</p>
                                </div>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <Icons.Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
