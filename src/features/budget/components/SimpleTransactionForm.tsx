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
    isEditing
}) => {
    const { state } = useAppContext();

    return (
        <div className="space-y-6">
            {/* 1. Amount Input */}
            <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-6">
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
                            value={amount}
                            onChange={handleAmountChange}
                            className={`bg-transparent text-center text-6xl font-bold outline-none placeholder-gray-600 font-mono w-full ${type === "income" ? "text-emerald-400" : "text-white"
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
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
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
                <div className={`relative rounded-2xl bg-black/20 border border-white/5 focus-within:border-cyan-500/50 focus-within:bg-black/40 transition-all ${errors.title ? "border-rose-500" : ""}`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Icons.Edit size={20} />
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent p-4 pl-12 text-lg text-white outline-none placeholder-gray-600 font-medium"
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

            {/* 3. Category & Account Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Category Select */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-theme-secondary ml-1">Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none bg-black/20 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50"
                        >
                            {type === 'income' ? (
                                <optgroup label="Income Sources">
                                    <option value="Salary">Salary</option>
                                    <option value="Business">Business</option>
                                    <option value="Iqub">Iqub Win</option>
                                    <option value="Remittance">Remittance</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Other">Other</option>
                                </optgroup>
                            ) : (
                                <optgroup label="Expense Categories">
                                    {state.budgetCategories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.icon} {c.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Icons.ChevronDown size={16} />
                        </div>
                    </div>
                </div>

                {/* Account Select */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-theme-secondary ml-1">Account</label>
                    <div className={`relative ${errors.account ? "border-rose-500" : ""}`}>
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full appearance-none bg-black/20 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-cyan-500/50"
                        >
                            <option value="" disabled>Select Account</option>
                            {state.accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} ({acc.currency || 'ETB'})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <Icons.ChevronDown size={16} />
                        </div>
                    </div>
                    {errors.account && <p className="text-xs text-rose-500 font-bold ml-1">Required</p>}
                </div>
            </div>
        </div>
    );
};
