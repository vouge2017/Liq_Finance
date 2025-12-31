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
            <div className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm space-y-6">
                <div className="text-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Amount</label>
                    <div className="relative inline-block">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-bold -ml-10">
                            ETB
                        </span>
                        <input
                            ref={amountInputRef}
                            type="text"
                            inputMode="decimal"
                            value={amount || ""}
                            onChange={handleAmountChange}
                            className={`bg-transparent text-center text-6xl font-bold outline-none placeholder-zinc-200 w-full ${type === "income" ? "text-emerald-600" : "text-blue-600"
                                }`}
                            placeholder="0"
                        />
                    </div>
                    {errors.amount && <p className="text-[10px] text-rose-500 font-bold mt-1">Amount is required</p>}
                </div>

                {/* Smart Suggestions (Quick Chips) */}
                {!isEditing && (
                    <div className="flex justify-center gap-2 flex-wrap">
                        {smartSuggestions.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => handleSmartClick(s)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-full border border-black/[0.03] transition-all active:scale-95"
                            >
                                <s.icon size={12} className="text-blue-600" />
                                <span className="text-[10px] font-bold text-zinc-600">{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Type Toggle */}
                <div className="flex bg-zinc-100 p-1 rounded-2xl border border-black/[0.03]">
                    <button
                        onClick={() => {
                            setType("expense")
                            setCategory(state.budgetCategories[0]?.name || "Food")
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${type === "expense" ? "bg-white text-blue-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                        <Icons.ArrowUp className="rotate-45" size={14} /> Expense
                    </button>
                    <button
                        onClick={() => {
                            setType("income")
                            setCategory("Salary")
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${type === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                        <Icons.ArrowDown className="rotate-45" size={14} /> Income
                    </button>
                </div>
            </div>

            {/* 2. Title & Payee */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Title / Payee</label>
                <div className={`relative rounded-2xl bg-white border border-black/[0.03] shadow-sm focus-within:border-blue-600/30 transition-all ${errors.title ? "border-rose-500" : ""}`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Icons.Edit size={18} />
                    </div>
                    <input
                        type="text"
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent p-4 pl-12 text-sm text-zinc-900 outline-none placeholder-zinc-300 font-bold"
                        placeholder="What is this for?"
                    />
                </div>
                {errors.title && <p className="text-[10px] text-rose-500 font-bold ml-1">Title is required</p>}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setTitle(s)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-50 rounded-full text-[10px] font-bold text-zinc-600 whitespace-nowrap border border-black/[0.03] shadow-sm"
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
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
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
                                        ? "bg-blue-50 border-blue-600/20 shadow-sm"
                                        : "bg-white border-black/[0.03] hover:bg-zinc-50"
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-zinc-50 text-zinc-400"}`}>
                                        <cat.icon size={18} />
                                    </div>
                                    <span className={`text-[9px] font-bold truncate w-full text-center ${isSelected ? "text-blue-600" : "text-zinc-400"}`}>
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
                                        ? "bg-blue-50 border-blue-600/20 shadow-sm"
                                        : "bg-white border-black/[0.03] hover:bg-zinc-50"
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-zinc-50 text-zinc-400"}`}>
                                        <IconComp size={18} />
                                    </div>
                                    <span className={`text-[9px] font-bold truncate w-full text-center ${isSelected ? "text-blue-600" : "text-zinc-400"}`}>
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
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Account</label>
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
                                    ? "bg-blue-50 border-blue-600/20 shadow-sm"
                                    : "bg-white border-black/[0.03] hover:bg-zinc-50"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs ${acc.color || 'bg-zinc-600'}`}>
                                    {acc.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold ${isSelected ? "text-blue-600" : "text-zinc-900"}`}>{acc.name}</p>
                                    <p className="text-[10px] text-zinc-400">{acc.institution || acc.type}</p>
                                </div>
                                {isSelected && (
                                    <div className="ml-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
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
