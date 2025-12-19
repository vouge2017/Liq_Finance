import React from 'react';
import { Icons } from "@/shared/components/Icons";
import { useAppContext } from "@/context/AppContext";

interface SmartSuggestion {
    id: string;
    label: string;
    category: string;
    amount?: string;
    icon: any;
}

interface SimpleTransactionFormProps {
    amount: string;
    setAmount: (val: string) => void;
    handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title: string;
    setTitle: (val: string) => void;
    type: "income" | "expense";
    setType: (val: "income" | "expense") => void;
    category: string;
    setCategory: (val: string) => void;
    accountId: string;
    setAccountId: (val: string) => void;
    errors: { amount: boolean; title: boolean; account: boolean };
    amountInputRef: React.RefObject<HTMLInputElement>;
    smartSuggestions: SmartSuggestion[];
    handleSmartClick: (s: SmartSuggestion) => void;
    suggestions: string[];
    isEditing: boolean;
    INCOME_CATEGORIES: any[];
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
    const { state } = useAppContext();

    return (
        <div className="space-y-6">
            {/* 1. Amount Input */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                <div className="text-center">
                    <label className="text-xs font-medium text-theme-secondary mb-2 block">Amount</label>
                    <div className="relative inline-block">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-theme-secondary text-2xl font-medium -ml-8">
                            ETB
                        </span>
                        <input
                            ref={amountInputRef}
                            type="text"
                            inputMode="decimal"
                            value={amount || ""}
                            onChange={handleAmountChange}
                            className={`bg-transparent text-center text-6xl font-bold outline-none placeholder-gray-400 font-mono w-full ${type === "income" ? "text-emerald-400" : "text-white"
                                }`}
                            placeholder="0"
                        />
                    </div>
                    {errors.amount && <p className="text-xs text-rose-500 font-bold mt-1">Amount is required</p>}
                </div>

                {/* Smart Suggestions (Quick Chips) */}
                {!isEditing && (
                    <div className="flex justify-center gap-3 flex-wrap">
                        {smartSuggestions.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => handleSmartClick(s)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all active:scale-95"
                            >
                                <s.icon size={14} className="text-cyan-400" />
                                <span className="text-xs font-medium text-gray-300">{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Type Toggle */}
                <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/15">
                    <button
                        onClick={() => {
                            setType("expense")
                            setCategory(state.budgetCategories[0]?.name || "Food")
                        }}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${type === "expense" ? "bg-theme-card text-pink-500 shadow-lg border border-pink-500/20" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <Icons.ArrowUp className="rotate-45" size={16} /> Expense
                    </button>
                    <button
                        onClick={() => {
                            setType("income")
                            setCategory("Salary")
                        }}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${type === "income" ? "bg-theme-card text-emerald-500 shadow-lg border border-emerald-500/20" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <Icons.ArrowDown className="rotate-45" size={16} /> Income
                    </button>
                </div>
            </div>

            {/* 2. Title & Payee */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-theme-secondary ml-1">Title / Payee</label>
                <div className={`relative rounded-2xl bg-white/5 border border-white/10 focus-within:border-cyan-500/50 focus-within:bg-white/10 transition-all ${errors.title ? "border-rose-500" : ""}`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Icons.Edit size={20} />
                    </div>
                    <input
                        type="text"
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent p-4 pl-12 text-lg text-white outline-none placeholder-gray-400 font-medium"
                        placeholder="What is this for?"
                    />
                </div>
                {errors.title && <p className="text-xs text-rose-500 font-bold ml-1">Title is required</p>}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setTitle(s)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 whitespace-nowrap border border-white/5"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Category Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Category</label>
                    <span className="text-[10px] text-cyan-500 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        {category || "Select One"}
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {type === 'income' ? (
                        INCOME_CATEGORIES.map((cat) => {
                            const isSelected = category === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${isSelected
                                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${isSelected ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-400"}`}>
                                        <cat.icon size={20} />
                                    </div>
                                    <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? "text-white" : "text-gray-500"}`}>
                                        {cat.label}
                                    </span>
                                </button>
                            )
                        })
                    ) : (
                        state.budgetCategories.map((cat) => {
                            const isSelected = category === cat.name
                            const IconComp = (Icons as any)[cat.icon] || Icons.Shopping
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.name)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${isSelected
                                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${isSelected ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-400"}`}>
                                        <IconComp size={20} />
                                    </div>
                                    <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? "text-white" : "text-gray-500"}`}>
                                        {cat.name}
                                    </span>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* 4. Account Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Account</label>
                    {errors.account && <span className="text-[10px] text-rose-500 font-bold animate-pulse">Required</span>}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
                    {state.accounts.map((acc) => {
                        const isSelected = accountId === acc.id
                        return (
                            <button
                                key={acc.id}
                                onClick={() => setAccountId(acc.id)}
                                className={`flex-shrink-0 flex items-center gap-3 p-3 pr-5 rounded-2xl border transition-all active:scale-95 ${isSelected
                                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${acc.color || 'bg-gray-600'}`}>
                                    {acc.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>{acc.name}</p>
                                    <p className="text-[10px] text-gray-500">{acc.institution || acc.type}</p>
                                </div>
                                {isSelected && (
                                    <div className="ml-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                                        <Icons.Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
