"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import type { Transaction } from "@/types"
import { VoiceRecordingModal, ParsedTransaction } from "@/features/voice/VoiceRecordingModal"
import { Mic } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Confetti } from "@/shared/components/Confetti"
import { useAIUsage } from "@/services/ai-usage"
import { UpgradePrompt } from "@/shared/components/UpgradePrompt"
import { parseSMS } from "@/utils/smsParser"
import { SimpleTransactionForm } from "@/features/budget/components/SimpleTransactionForm"
import { AdvancedTransactionDetails } from "@/features/budget/components/AdvancedTransactionDetails"
import { getSmartSuggestions, SmartSuggestion } from "@/utils/smartSuggestions"
import { analyzeReceiptImage } from "@/services/gemini"
import { FutureMirrorDialog, type FutureImpactData } from "./components/FutureMirrorDialog"
import { simulateTransaction, type ImpactSummary } from "@/lib/guidance-engine"

const INCOME_CATEGORIES = [
    { id: "Salary", icon: Icons.Briefcase, label: "Salary", color: "from-emerald-500 to-teal-600" },
    { id: "Business", icon: Icons.Store, label: "Business", color: "from-amber-400 to-orange-500" },
    { id: "Iqub", icon: Icons.Users, label: "Iqub Win", color: "from-pink-500 to-rose-500" },
    { id: "Remittance", icon: Icons.Globe, label: "Remittance", color: "from-blue-400 to-indigo-500" },
    { id: "Freelance", icon: Icons.Laptop, label: "Freelance", color: "from-purple-400 to-fuchsia-500" },
    { id: "Gift", icon: Icons.Heart, label: "Gift", color: "from-rose-300 to-pink-400" },
    { id: "Other", icon: Icons.More, label: "Other", color: "from-slate-500 to-gray-600" },
]

export const TransactionModal: React.FC = () => {
    const {
        isTransactionModalOpen,
        closeTransactionModal,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        editingTransaction,
        prefillTx,
        state,
        payeeHistory,
        activeProfile,
        showNotification,
        scannedImage,
        setScannedImage,
        startVoiceOnOpen,
    } = useAppContext()
    const { t } = useTranslation()

    const { canUseFeature, incrementUsage, upgradeToPro } = useAIUsage()
    const [showUpgrade, setShowUpgrade] = useState(false)

    const [amount, setAmount] = useLocalStorage<string>("draft_tx_amount", "")
    const [title, setTitle] = useLocalStorage<string>("draft_tx_title", "")
    const [type, setType] = useLocalStorage<"income" | "expense">("draft_tx_type", "expense")
    const [category, setCategory] = useLocalStorage<string>("draft_tx_category", state.budgetCategories[0]?.name || "Food")
    const [accountId, setAccountId] = useLocalStorage<string>("draft_tx_account", "")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [isRecurring, setIsRecurring] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)

    const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [scanError, setScanError] = useState<string | null>(null)
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

    const [showVoiceModal, setShowVoiceModal] = useState(false)
    const [showQuickTemplates, setShowQuickTemplates] = useState(false)
    const [pastedSMS, setPastedSMS] = useState("")

    const [errors, setErrors] = useState({ amount: false, title: false, account: false })

    const [showFutureMirror, setShowFutureMirror] = useState(false)
    const [futureImpact, setFutureImpact] = useState<FutureImpactData | null>(null)

    const amountInputRef = useRef<HTMLInputElement>(null!)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, "")
        if (/^\d*\.?\d*$/.test(val)) {
            const parts = val.split(".")
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            setAmount(parts.join("."))
            if (val) setErrors((prev) => ({ ...prev, amount: false }))
        }
    }

    const getRawAmount = () => Number.parseFloat(amount.replace(/,/g, ""))

    const analyzeReceiptViaAPI = async (base64Image: string) => {
        try {
            const result = await analyzeReceiptImage(base64Image)
            return result.success ? result.data : null
        } catch (error) {
            console.error("Receipt analysis error:", error)
            return null
        }
    }

    useEffect(() => {
        if (isTransactionModalOpen && scannedImage && !receiptPreview) {
            const { allowed, reason } = canUseFeature('receipt')
            if (!allowed) {
                if (reason === 'upgrade_required' || reason === 'daily_limit') {
                    setShowUpgrade(true)
                    setScannedImage(null)
                    return
                }
            }

            setReceiptPreview(scannedImage)
            setIsScanning(true)

            const analyze = async () => {
                try {
                    const rawBase64 = scannedImage.split(",")[1]
                    const result = await analyzeReceiptViaAPI(rawBase64)

                    if (result) {
                        incrementUsage('receipt')
                        if (result.amount) setAmount(result.amount.toLocaleString())
                        if (result.title) setTitle(result.title)
                        if (result.category) {
                            const match = state.budgetCategories.find((c) => c.name.toLowerCase() === result.category?.toLowerCase())
                            if (match) setCategory(match.name)
                            else setCategory(state.budgetCategories[0]?.name || "Food")
                        }
                        if (result.date) setDate(result.date)
                        setType("expense")
                        showNotification("Receipt scanned successfully!", "success")
                    } else {
                        setScanError("Could not extract details. Please enter manually.")
                        showNotification("Could not analyze receipt.", "error")
                    }
                } catch (e) {
                    console.error(e)
                    setScanError("Error processing image.")
                } finally {
                    setIsScanning(false)
                    setScannedImage(null)
                }
            }
            analyze()
        }
    }, [isTransactionModalOpen, scannedImage, receiptPreview, canUseFeature, incrementUsage, setScannedImage, showNotification, state.budgetCategories])

    useEffect(() => {
        if (isTransactionModalOpen) {
            setErrors({ amount: false, title: false, account: false })
            setShowVoiceModal(startVoiceOnOpen)
            setShowQuickTemplates(false)
            if (editingTransaction) {
                setAmount(editingTransaction.amount?.toLocaleString() || "")
                setTitle(editingTransaction.title)
                setType(editingTransaction.type === "transfer" ? "expense" : editingTransaction.type)
                setCategory(editingTransaction.category)
                setAccountId(editingTransaction.accountId || "")
                setDate(editingTransaction.date?.split("T")[0] || new Date().toISOString().split("T")[0])
                setReceiptPreview(null)
                setScanError(null)
                setIsRecurring(false)
            } else {
                if (!scannedImage) {
                    setAmount(prefillTx?.amount ? prefillTx.amount.toLocaleString() : "")
                    setTitle(prefillTx?.title || "")
                    const prefType = prefillTx?.type
                    setType(prefType === "income" || prefType === "expense" ? prefType : "expense")
                    if (prefType === "income") {
                        setCategory(prefillTx?.category || "Salary")
                    } else {
                        const defaultCat = prefillTx?.category || state.budgetCategories[0]?.name || "Food"
                        setCategory(defaultCat)
                    }
                    const defaultAcc = prefillTx?.accountId || state.accounts[0]?.id || ""
                    setAccountId(defaultAcc)
                    setDate(prefillTx?.date ? prefillTx.date.split("T")[0] : new Date().toISOString().split("T")[0])
                    setIsRecurring(false)
                    if (!scannedImage) {
                        setReceiptPreview(null)
                        setScanError(null)
                    }
                }
                setIsSuccess(false)
                setShowDeleteConfirm(false)
                if (!scannedImage) {
                    setTimeout(() => amountInputRef.current?.focus(), 100)
                }
            }
        } else {
            setReceiptPreview(null)
            setScanError(null)
            setIsScanning(false)
        }
    }, [isTransactionModalOpen, editingTransaction, prefillTx, state.accounts, state.budgetCategories, scannedImage])

    useEffect(() => {
        if (isTransactionModalOpen && !editingTransaction) {
            setSmartSuggestions(getSmartSuggestions())
        }
    }, [isTransactionModalOpen, editingTransaction])

    const handleSmartClick = (s: SmartSuggestion) => {
        setTitle(s.label)
        setCategory(s.category)
        if (s.amount) setAmount(s.amount)
        if (navigator.vibrate) navigator.vibrate(10)
    }

    useEffect(() => {
        if (title && !editingTransaction) {
            const matches = payeeHistory
                .filter((p) => p.toLowerCase().includes(title.toLowerCase()) && p !== title)
                .slice(0, 3)
            setSuggestions(matches)
        } else {
            setSuggestions([])
        }
    }, [title, payeeHistory, editingTransaction])

    const handleCameraClick = () => {
        setScanError(null)
        cameraInputRef.current?.click()
    }

    const handleGalleryClick = () => {
        setScanError(null)
        galleryInputRef.current?.click()
    }

    const selectCashAccount = () => {
        const cashAcc = state.accounts.find((a) => a.type === "Cash")
        if (cashAcc) {
            setAccountId(cashAcc.id)
            setErrors((prev) => ({ ...prev, account: false }))
        } else {
            showNotification("No Cash account found. Please add one in Accounts.", "error")
        }
    }

    const handleVoiceTransaction = (tx: ParsedTransaction) => {
        setAmount(tx.amount.toLocaleString())
        setTitle(tx.title)
        if (tx.type === "income") {
            setType("income")
        } else {
            setType("expense")
        }
        setCategory(tx.category)
        setDate(tx.date)
        showNotification("Voice transaction added! Review and save.", "success")
    }

    const handleParseSMS = () => {
        if (!pastedSMS.trim()) return
        const result = parseSMS(pastedSMS)
        if (result) {
            if (result.amount) setAmount(result.amount.toLocaleString())
            if (result.merchant) setTitle(result.merchant)
            if (result.date) setDate(result.date)
            setType("expense")
            showNotification("SMS parsed successfully!", "success")
            setShowPasteModal(false)
            setPastedSMS("")
        } else {
            showNotification("Could not parse SMS. Try manual entry.", "error")
        }
    }

    const quickTemplates = [
        { icon: "☕", label: "Coffee", amount: 80, category: "Food" },
        { icon: "🚕", label: "Taxi", amount: 100, category: "Transport" },
        { icon: "🍽️", label: "Lunch", amount: 300, category: "Food" },
        { icon: "⛽", label: "Fuel", amount: 500, category: "Transport" },
        { icon: "🛒", label: "Groceries", amount: 1000, category: "Groceries" },
    ]

    const applyQuickTemplate = (template: { label: string; amount: number; category: string }) => {
        setAmount(template.amount.toLocaleString())
        setTitle(template.label)
        setCategory(template.category)
        setType("expense")
        setShowQuickTemplates(false)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const { allowed, reason } = canUseFeature("receipt")
        if (!allowed) {
            if (reason === "upgrade_required" || reason === "daily_limit") {
                setShowUpgrade(true)
                if (cameraInputRef.current) cameraInputRef.current.value = ""
                if (galleryInputRef.current) galleryInputRef.current.value = ""
                return
            }
        }

        setIsScanning(true)
        setScanError(null)
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64String = reader.result as string
                setReceiptPreview(base64String)
                const rawBase64 = base64String.split(",")[1]
                const result = await analyzeReceiptViaAPI(rawBase64)

                if (result) {
                    incrementUsage("receipt")
                    if (result.amount) setAmount(result.amount.toLocaleString())
                    if (result.title) setTitle(result.title)
                    if (result.category) {
                        const match = state.budgetCategories.find((c) => c.name.toLowerCase() === result.category?.toLowerCase())
                        if (match) setCategory(match.name)
                        else setCategory(state.budgetCategories[0]?.name || "Food")
                    }
                    if (result.date) setDate(result.date)
                    setType("expense")
                    showNotification("Receipt scanned successfully!", "success")
                } else {
                    setScanError("Could not extract details. Please enter manually.")
                    showNotification("Could not analyze receipt.", "error")
                }
                setIsScanning(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error(error)
            setIsScanning(false)
            setScanError("Error reading image file.")
        }
        if (cameraInputRef.current) cameraInputRef.current.value = ""
        if (galleryInputRef.current) galleryInputRef.current.value = ""
    }

    const transformImpactSummaryToFutureImpactData = (impact: ImpactSummary, rawAmount: number, isExpense: boolean): FutureImpactData => {
        const runwayDays = impact.afterRunway
        const runwayMonths = runwayDays / 30

        let runwayStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
        if (runwayDays < 7) runwayStatus = 'critical'
        else if (runwayDays < 30) runwayStatus = 'warning'

        const activeIqubs = state.iqubs.filter(i => i.status === 'active')
        const hasActiveIqub = activeIqubs.length > 0
        let iqubRiskLevel: 'low' | 'medium' | 'high' = 'low'
        let canAffordIqub = true
        let daysUntilPayment: number | undefined

        if (hasActiveIqub) {
            const nextIqub = activeIqubs[0]
            const nextDate = new Date(nextIqub.nextPaymentDate)
            const now = new Date()
            daysUntilPayment = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            canAffordIqub = impact.afterBalance >= nextIqub.amount
            if (!canAffordIqub) iqubRiskLevel = 'high'
            else if (daysUntilPayment <= 3) iqubRiskLevel = 'high'
            else if (daysUntilPayment <= 7) iqubRiskLevel = 'medium'
        }

        const totalAllocated = state.budgetCategories.reduce((sum, c) => sum + c.allocated, 0)
        const totalSpent = state.budgetCategories.reduce((sum, c) => sum + c.spent, 0)
        const remainingBudget = totalAllocated - totalSpent
        const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

        const monthlyIncome = state.incomeSources.reduce((sum, src) => {
            if (src.frequency === "Monthly") return sum + src.amount
            if (src.frequency === "Weekly") return sum + src.amount * 4
            return sum
        }, 0)
        const totalExpenses = state.totalExpense + (isExpense ? rawAmount : 0)
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0
        let savingsStatus: 'on_track' | 'behind' | 'ahead' = 'behind'
        if (savingsRate >= 20) savingsStatus = 'on_track'
        if (savingsRate >= 30) savingsStatus = 'ahead'

        return {
            cashRunway: {
                value: runwayMonths,
                unit: 'months',
                status: runwayStatus
            },
            iqubRisk: {
                hasActiveIqub,
                nextPaymentDate: hasActiveIqub ? activeIqubs[0].nextPaymentDate : undefined,
                daysUntilPayment,
                canAfford: canAffordIqub,
                riskLevel: iqubRiskLevel
            },
            budgetHealth: {
                spentPercentage,
                remainingBudget,
                isOverBudget: remainingBudget < 0,
                daysRemainingInMonth: 30 - new Date().getDate()
            },
            savingsRate: {
                currentRate: Math.max(0, savingsRate),
                targetRate: 20,
                status: savingsStatus
            }
        }
    }

    const calculateFutureImpact = (): FutureImpactData => {
        const rawAmount = getRawAmount()
        const isExpense = type === "expense"

        const pendingTx: Partial<Transaction> = {
            amount: rawAmount,
            type,
            category,
            accountId
        }

        const impactSummary = simulateTransaction(state, pendingTx)
        return transformImpactSummaryToFutureImpactData(impactSummary, rawAmount, isExpense)
    }

    const handleSave = () => {
        const rawAmount = getRawAmount()
        const newErrors = {
            amount: !amount || isNaN(rawAmount) || rawAmount <= 0,
            title: !title.trim(),
            account: !accountId,
        }

        if (newErrors.amount || newErrors.title || newErrors.account) {
            setErrors(newErrors)
            if (navigator.vibrate) navigator.vibrate(200)
            return
        }

        if (navigator.vibrate) navigator.vibrate(50)

        const impact = calculateFutureImpact()
        setFutureImpact(impact)
        setShowFutureMirror(true)
    }

    const handleConfirmSave = () => {
        const rawAmount = getRawAmount()
        const txData: Transaction = {
            id: editingTransaction ? editingTransaction.id : Date.now().toString(),
            title: isRecurring ? `${title} (Recurring)` : title,
            amount: rawAmount,
            type,
            category,
            date: new Date(date).toISOString(),
            accountId,
            profile: activeProfile,
            icon: type === "income" ? "card" : "shopping",
        }

        if (editingTransaction) {
            updateTransaction(txData)
            closeTransactionModal()
        } else {
            addTransaction(txData)
            setIsSuccess(true)

            setAmount("")
            setTitle("")
            setAccountId("")

            setTimeout(() => {
                setIsSuccess(false)
                closeTransactionModal()
            }, 2500)
        }
        setShowFutureMirror(false)
    }

    const handleDelete = () => {
        if (editingTransaction) {
            deleteTransaction(editingTransaction.id)
            closeTransactionModal()
        }
    }

    const clearReceipt = () => {
        setReceiptPreview(null)
        setScanError(null)
    }

    const [showPasteModal, setShowPasteModal] = useState(false)

    if (!isTransactionModalOpen) return null

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
                <div
                    className="absolute inset-0 modal-overlay pointer-events-auto transition-opacity"
                    onClick={() => closeTransactionModal()}
                />

                <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl pointer-events-auto animate-slide-up relative overflow-hidden h-[90vh] sm:max-h-[90vh] flex flex-col bg-[#F9FAFB] dark:bg-[#101622]">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />

                    {isSuccess && (
                        <>
                            <Confetti />
                            <div className="absolute inset-0 z-50 bg-white dark:bg-[#101622] flex flex-col items-center justify-center animate-fade-in">
                                <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4 animate-bounce">
                                    <Icons.Coins className="text-emerald-500 w-12 h-12" strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Saved!</h3>
                                <p className="text-zinc-400 dark:text-zinc-500 text-sm font-bold">Transaction recorded.</p>
                            </div>
                        </>
                    )}

                    {isScanning && (
                        <div className="absolute inset-0 z-50 bg-white/90 dark:bg-[#101622]/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-600/20 flex items-center justify-center mb-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)] animate-scan-down"></div>
                                <Icons.Scan size={40} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white animate-pulse">Analyzing Receipt...</h3>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2 font-bold">Extracting details with AI</p>
                        </div>
                    )}

                    <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden shrink-0" />

                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {editingTransaction ? "Edit Transaction" : "New Transaction"}
                        </h3>
                        <div className="flex gap-2">
                            {!editingTransaction && (
                                <div className="flex items-center bg-white dark:bg-white/5 rounded-full border border-black/[0.03] dark:border-white/10 p-1 gap-1 shadow-sm">
                                    <button
                                        onClick={() => setShowVoiceModal(true)}
                                        className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
                                        title="Voice Input"
                                        aria-label="Voice Input"
                                    >
                                        <Mic size={18} />
                                    </button>
                                    <div className="w-px h-4 bg-zinc-100 dark:bg-white/10"></div>
                                    <button
                                        onClick={handleCameraClick}
                                        className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
                                        title="Take Photo"
                                        aria-label="Take Photo"
                                    >
                                        <Icons.Camera size={18} />
                                    </button>
                                    <div className="w-px h-4 bg-zinc-100 dark:bg-white/10"></div>
                                    <button
                                        onClick={handleGalleryClick}
                                        className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
                                        title="Upload from Gallery"
                                        aria-label="Upload from Gallery"
                                    >
                                        <Icons.Image size={18} />
                                    </button>
                                </div>
                            )}
                            {editingTransaction && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors"
                                >
                                    <Icons.Delete size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {showDeleteConfirm && (
                        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-[#101622]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-dialog">
                            <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-500">
                                <Icons.Delete size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Delete this transaction?</h4>
                            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6 font-medium">This action cannot be undone.</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 bg-zinc-100 dark:bg-white/5 rounded-xl font-bold text-zinc-600 dark:text-zinc-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-rose-500 rounded-xl font-bold text-white shadow-lg shadow-rose-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}

                    {showPasteModal && (
                        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-[#101622]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-dialog">
                            <div className="w-full max-w-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Paste SMS</h3>
                                    <button onClick={() => setShowPasteModal(false)} className="text-zinc-400">
                                        <Icons.Close size={24} />
                                    </button>
                                </div>
                                <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4 font-medium">
                                    Paste the transaction SMS from your bank (CBE, Telebirr, etc.)
                                </p>
                                <textarea
                                    value={pastedSMS}
                                    onChange={(e) => setPastedSMS(e.target.value)}
                                    placeholder="Paste SMS here..."
                                    className="w-full h-32 bg-zinc-50 dark:bg-white/5 border border-black/[0.03] dark:border-white/10 rounded-xl p-4 text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-600 outline-none focus:border-blue-600/30 mb-4 resize-none font-bold"
                                    autoFocus
                                />
                                <button
                                    onClick={handleParseSMS}
                                    disabled={!pastedSMS.trim()}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    Parse & Fill
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-6 pb-4 no-scrollbar">
                        {(receiptPreview || scanError) && (
                            <div className="relative w-full rounded-xl overflow-hidden border border-black/[0.03] dark:border-white/10 bg-white dark:bg-white/5 p-1 shadow-sm">
                                {scanError ? (
                                    <div className="p-4 text-center">
                                        <Icons.Alert className="text-amber-500 mx-auto mb-2" size={24} />
                                        <p className="text-xs text-zinc-900 dark:text-white font-bold">{scanError}</p>
                                        <button onClick={handleCameraClick} className="text-xs text-blue-600 dark:text-blue-400 mt-2 underline font-bold">
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative h-32">
                                        <img
                                            src={receiptPreview! || "/placeholder.svg"}
                                            alt="Receipt Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-black/80 px-2 py-1 rounded text-[10px] text-zinc-900 dark:text-white backdrop-blur-md font-bold flex items-center gap-1 border border-black/[0.03] dark:border-white/10">
                                            <Icons.Check size={10} className="text-emerald-600 dark:text-emerald-400" /> Receipt Scanned
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={clearReceipt}
                                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-full text-zinc-400 hover:text-rose-500 transition-colors backdrop-blur-md border border-black/[0.03] dark:border-white/10"
                                    title="Remove"
                                >
                                    <Icons.Close size={14} />
                                </button>
                            </div>
                        )}

                        {!editingTransaction && !amount && (
                            <div className="flex justify-center mb-2">
                                <button
                                    onClick={() => setShowVoiceModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-600/10 dark:border-blue-500/20 transition-all active:scale-95 group shadow-sm"
                                >
                                    <div className="p-2 bg-blue-600 rounded-full text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                                        <Mic size={20} />
                                    </div>
                                    <span className="font-bold text-sm">Tap to Speak</span>
                                </button>
                            </div>
                        )}

                        <SimpleTransactionForm
                            amount={amount}
                            setAmount={setAmount}
                            handleAmountChange={handleAmountChange}
                            title={title}
                            setTitle={setTitle}
                            type={type}
                            setType={setType}
                            category={category}
                            setCategory={setCategory}
                            accountId={accountId}
                            setAccountId={setAccountId}
                            errors={errors}
                            amountInputRef={amountInputRef}
                            smartSuggestions={smartSuggestions}
                            handleSmartClick={handleSmartClick}
                            suggestions={suggestions}
                            isEditing={!!editingTransaction}
                            INCOME_CATEGORIES={INCOME_CATEGORIES}
                        />

                        <div className="flex justify-center py-2">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-full uppercase tracking-widest"
                            >
                                {showAdvanced ? "Less Details" : "More Details"}
                                <Icons.ChevronDown
                                    className={`transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
                                    size={12}
                                />
                            </button>
                        </div>

                        {showAdvanced && (
                            <div className="animate-slide-down space-y-6">
                                <AdvancedTransactionDetails
                                    date={date}
                                    setDate={setDate}
                                    isRecurring={isRecurring}
                                    setIsRecurring={setIsRecurring}
                                />

                                {!editingTransaction && (
                                    <div className="space-y-3 pt-4 border-t border-black/[0.03] dark:border-white/10">
                                        <button
                                            onClick={() => setShowQuickTemplates(!showQuickTemplates)}
                                            className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${showQuickTemplates ? "bg-blue-50 dark:bg-blue-500/10 border-blue-600/20 dark:border-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-white/5 border-black/[0.03] dark:border-white/10 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 shadow-sm"}`}
                                        >
                                            <Icons.Zap size={16} />
                                            <span className="text-xs font-bold">Quick Templates</span>
                                        </button>

                                        {showQuickTemplates && (
                                            <div className="grid grid-cols-3 gap-3 animate-fade-in bg-white dark:bg-white/5 p-4 rounded-2xl border border-black/[0.03] dark:border-white/10 shadow-sm">
                                                {quickTemplates.map((t, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => applyQuickTemplate(t)}
                                                        className="flex flex-col items-center gap-1 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-black/[0.03] dark:border-white/10 hover:border-blue-600/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                                                    >
                                                        <span className="text-xl">{t.icon}</span>
                                                        <span className="text-[10px] font-bold text-zinc-900 dark:text-white">{t.label}</span>
                                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold">{t.amount} ETB</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-auto shrink-0 pb-6">
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                        >
                            {isSuccess ? <Icons.Check size={24} /> : editingTransaction ? "Update Transaction" : "Save Transaction"}
                        </button>
                    </div>
                </div>
            </div>

            <VoiceRecordingModal
                isOpen={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                onTransactionParsed={handleVoiceTransaction}
            />

            <UpgradePrompt
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                onUpgrade={() => {
                    upgradeToPro()
                    setShowUpgrade(false)
                }}
                feature="receipt"
            />

            <FutureMirrorDialog
                isOpen={showFutureMirror}
                impact={futureImpact!}
                onClose={() => setShowFutureMirror(false)}
                onConfirm={handleConfirmSave}
                transactionAmount={getRawAmount()}
                transactionType={type}
            />
        </>
    )
}
