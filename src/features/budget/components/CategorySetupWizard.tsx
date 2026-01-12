import React, { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Icons } from '@/shared/components/Icons'

const ETHIOPIAN_CATEGORIES = [
    {
        id: 'food',
        name: 'Food & Groceries',
        emoji: '🥘',
        recommended: 30,
        description: 'Injera, teff, coffee, daily meals',
        color: 'bg-emerald-500'
    },
    {
        id: 'transport',
        name: 'Transport',
        emoji: '🚕',
        recommended: 15,
        description: 'Taxi, bajaj, bus, ride-share',
        color: 'bg-cyan-500'
    },
    {
        id: 'utilities',
        name: 'Utilities',
        emoji: '⚡',
        recommended: 10,
        description: 'Electricity, water, internet',
        color: 'bg-amber-500'
    },
    {
        id: 'social',
        name: 'Social & Iddir',
        emoji: '👥',
        recommended: 10,
        description: 'Iqub, Iddir, community events',
        color: 'bg-purple-500'
    },
    {
        id: 'shopping',
        name: 'Shopping',
        emoji: '🛍️',
        recommended: 15,
        description: 'Clothes, personal items, gifts',
        color: 'bg-rose-500'
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        emoji: '🎬',
        recommended: 10,
        description: 'Movies, restaurants, hobbies',
        color: 'bg-indigo-500'
    },
    {
        id: 'savings',
        name: 'Savings',
        emoji: '🏦',
        recommended: 10,
        description: 'Emergency fund, goals',
        color: 'bg-blue-500'
    },
]

type Step = 'welcome' | 'select' | 'allocate' | 'review' | 'complete'

export const CategorySetupWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, addBudgetCategory } = useAppContext()
    const [step, setStep] = useState<Step>('welcome')
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['food', 'transport', 'utilities', 'social'])
    const [allocations, setAllocations] = useState<Record<string, number>>({})

    const monthlyIncome = state.accounts.reduce((sum, acc) => {
        if (acc.type === 'Loan') return sum - acc.balance
        return sum + acc.balance
    }, 0)

    const handleSelectCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const handleNext = () => {
        const steps: Step[] = ['welcome', 'select', 'allocate', 'review', 'complete']
        const currentIndex = steps.indexOf(step)
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1])
        }
    }

    const handleComplete = () => {
        selectedCategories.forEach(catId => {
            const category = ETHIOPIAN_CATEGORIES.find(c => c.id === catId)
            if (category) {
                const percent = allocations[catId] || category.recommended
                addBudgetCategory({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: category.name,
                    allocated: Math.floor(monthlyIncome * (percent / 100)),
                    spent: 0,
                    type: 'variable',
                    icon: category.id === 'food' ? 'Utensils' : category.id === 'transport' ? 'Bus' : category.id === 'utilities' ? 'Zap' : category.id === 'social' ? 'Iddir' : 'Shopping',
                    color: category.color,
                    rolloverEnabled: false
                })
            }
        })
        onClose()
    }

    // STEP 1: Welcome
    if (step === 'welcome') {
        return (
            <div className="fixed inset-0 modal-overlay z-[100] flex items-center justify-center p-6">
                <div className="bg-gradient-to-br from-[#5855d6] to-[#7c3aed] rounded-[2.5rem] p-10 max-w-sm w-full animate-dialog text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="text-7xl mb-8 text-center drop-shadow-lg">📊</div>
                    <h2 className="text-3xl font-black mb-4 text-center tracking-tight">Set Up Your Budget</h2>
                    <p className="text-white/80 mb-10 text-center text-sm leading-relaxed font-medium">
                        Let's create a budget tailored to your Ethiopian lifestyle. Just 2 minutes to get started.
                    </p>

                    <div className="space-y-4 mb-10 text-xs text-white/70 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
                            <Icons.Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <span>Smart recommendations</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
                            <Icons.Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <span>Allocation suggestions</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
                            <Icons.Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <span>Edit anytime</span>
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full bg-white text-[#5855d6] font-black py-5 rounded-2xl hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                    >
                        Let's Go →
                    </button>
                </div>
            </div>
        )
    }

    // STEP 2: Category Selection
    if (step === 'select') {
        return (
            <div className="fixed inset-0 modal-overlay z-[100] flex items-center justify-center p-6">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-sm w-full animate-dialog shadow-2xl flex flex-col h-[80vh]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Categories</h2>
                            <p className="text-gray-500 text-xs font-bold mt-1">{selectedCategories.length} SELECTED</p>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 font-medium">
                        Pick the categories that match your spending.
                    </p>

                    <div className="flex-1 space-y-3 mb-8 overflow-y-auto no-scrollbar pr-1">
                        {ETHIOPIAN_CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                onClick={() => handleSelectCategory(category.id)}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${selectedCategories.includes(category.id)
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${category.color} bg-opacity-10`}>
                                    {category.emoji}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{category.name}</h4>
                                    <p className="text-gray-500 text-[10px] font-medium mt-0.5">{category.description}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCategories.includes(category.id) ? 'bg-primary border-primary' : 'border-gray-200 dark:border-white/10'
                                    }`}>
                                    {selectedCategories.includes(category.id) && <Icons.Check size={14} className="text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('welcome')}
                            className="flex-1 border-2 border-gray-100 dark:border-white/5 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={selectedCategories.length === 0}
                            className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // STEP 3: Allocation
    if (step === 'allocate') {
        const currentAllocations = selectedCategories.reduce((acc, catId) => {
            const cat = ETHIOPIAN_CATEGORIES.find(c => c.id === catId)
            acc[catId] = allocations[catId] || cat?.recommended || 15
            return acc
        }, {} as Record<string, number>)

        const totalAllocated = Object.values(currentAllocations).reduce((a, b) => a + b, 0)

        return (
            <div className="fixed inset-0 modal-overlay z-[100] flex items-center justify-center p-6">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-sm w-full animate-dialog shadow-2xl flex flex-col h-[80vh]">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Allocation</h2>
                    <p className="text-gray-500 text-sm mb-6 font-medium">
                        Divide your <span className="text-primary font-bold">{monthlyIncome.toLocaleString()} ETB</span> income.
                    </p>

                    {/* Allocation Status */}
                    <div className={`mb-8 p-6 rounded-3xl border-2 transition-all duration-500 ${totalAllocated === 100
                        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                        : totalAllocated > 100
                            ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20'
                            : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Used</span>
                            <span className={`text-3xl font-black ${totalAllocated === 100 ? 'text-emerald-500' : totalAllocated > 100 ? 'text-rose-500' : 'text-amber-500'
                                }`}>
                                {totalAllocated}%
                            </span>
                        </div>
                        <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${totalAllocated === 100 ? 'bg-emerald-500' : totalAllocated > 100 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, totalAllocated)}%` }}
                            />
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="flex-1 space-y-6 mb-8 overflow-y-auto no-scrollbar pr-1">
                        {selectedCategories.map(catId => {
                            const category = ETHIOPIAN_CATEGORIES.find(c => c.id === catId)!
                            const percent = currentAllocations[catId]
                            const amount = Math.floor(monthlyIncome * (percent / 100))

                            return (
                                <div key={catId} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{category.emoji}</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{category.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-primary">{percent}%</span>
                                            <p className="text-[10px] text-gray-500 font-bold">{amount.toLocaleString()} ETB</p>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={percent}
                                        onChange={(e) => setAllocations({
                                            ...currentAllocations,
                                            [catId]: parseInt(e.target.value)
                                        })}
                                        className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('select')}
                            className="flex-1 border-2 border-gray-100 dark:border-white/5 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={totalAllocated !== 100}
                            className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // STEP 4: Review
    if (step === 'review') {
        return (
            <div className="fixed inset-0 modal-overlay z-[100] flex items-center justify-center p-6">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-sm w-full animate-dialog shadow-2xl">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Review</h2>

                    <div className="space-y-3 mb-10 bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                        {selectedCategories.map(catId => {
                            const category = ETHIOPIAN_CATEGORIES.find(c => c.id === catId)!
                            const percent = allocations[catId] || category.recommended
                            const amount = Math.floor(monthlyIncome * (percent / 100))

                            return (
                                <div key={catId} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{category.emoji}</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{category.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-gray-900 dark:text-white text-sm">{amount.toLocaleString()} ETB</span>
                                        <p className="text-[10px] text-gray-500 font-bold">{percent}%</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('allocate')}
                            className="flex-1 border-2 border-gray-100 dark:border-white/5 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Confirm →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // STEP 5: Complete
    if (step === 'complete') {
        return (
            <div className="fixed inset-0 modal-overlay z-[100] flex items-center justify-center p-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-10 max-w-sm w-full animate-dialog text-white shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="text-8xl mb-8 drop-shadow-lg">🎉</div>
                    <h2 className="text-3xl font-black mb-4 tracking-tight">You're All Set!</h2>
                    <p className="text-white/90 mb-10 text-sm font-medium leading-relaxed">
                        Your budget is ready. We'll help you stay on track and reach your financial goals.
                    </p>

                    <button
                        onClick={handleComplete}
                        className="w-full bg-white text-emerald-600 font-black py-5 rounded-2xl hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                    >
                        Start Tracking →
                    </button>
                </div>
            </div>
        )
    }

    return null
}
