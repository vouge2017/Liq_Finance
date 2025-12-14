"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import type { Transaction } from "@/types"
import { HorizontalScroll } from "@/shared/components/HorizontalScroll"
import { VoiceRecordingModal } from "@/features/voice/VoiceRecordingModal"
import { Mic, Zap, ChevronDown, RefreshCw, Coffee, Utensils, Car, ShoppingCart, Film, Moon, Sun } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Confetti } from "@/shared/components/Confetti"
import { toEthiopianDateString } from "@/utils/dateUtils"
import { useAIUsage } from "@/services/ai-usage"
import { UpgradePrompt } from "@/shared/components/UpgradePrompt"
import { parseSMS } from "@/utils/smsParser"

// Smart Suggestion Type
interface SmartSuggestion {
  id: string
  label: string
  category: string
  amount?: string
  icon: any
}

// Helper to get suggestions based on time
const getSmartSuggestions = (): SmartSuggestion[] => {
  const hour = new Date().getHours()

  // Morning (5 AM - 11 AM)
  if (hour >= 5 && hour < 11) {
    return [
      { id: "coffee", label: "Coffee", category: "Food", amount: "50", icon: Coffee },
      { id: "breakfast", label: "Breakfast", category: "Food", amount: "150", icon: Sun },
      { id: "transport", label: "Transport", category: "Transport", amount: "30", icon: Car },
    ]
  }

  // Lunch (11 AM - 2 PM)
  if (hour >= 11 && hour < 14) {
    return [
      { id: "lunch", label: "Lunch", category: "Food", amount: "200", icon: Utensils },
      { id: "transport", label: "Transport", category: "Transport", amount: "30", icon: Car },
      { id: "coffee", label: "Coffee", category: "Food", amount: "50", icon: Coffee },
    ]
  }

  // Afternoon (2 PM - 5 PM)
  if (hour >= 14 && hour < 17) {
    return [
      { id: "snack", label: "Snack", category: "Food", amount: "100", icon: Coffee },
      { id: "transport", label: "Transport", category: "Transport", amount: "30", icon: Car },
      { id: "groceries", label: "Groceries", category: "Groceries", amount: "500", icon: ShoppingCart },
    ]
  }

  // Evening (5 PM - 10 PM)
  if (hour >= 17 && hour < 22) {
    return [
      { id: "dinner", label: "Dinner", category: "Food", amount: "300", icon: Utensils },
      { id: "groceries", label: "Groceries", category: "Groceries", amount: "500", icon: ShoppingCart },
      { id: "transport", label: "Transport", category: "Transport", amount: "50", icon: Car },
    ]
  }

  // Night (10 PM - 5 AM)
  return [
    { id: "entertainment", label: "Fun", category: "Entertainment", amount: "500", icon: Film },
    { id: "taxi", label: "Taxi", category: "Transport", amount: "300", icon: Car },
    { id: "snack", label: "Late Snack", category: "Food", amount: "150", icon: Moon },
  ]
}

// Ethiopian Income Types for Contextual Selection
const INCOME_CATEGORIES = [
  { id: "Salary", icon: Icons.Briefcase, label: "Salary", color: "from-emerald-500 to-teal-600" },
  { id: "Business", icon: Icons.Store, label: "Business", color: "from-amber-400 to-orange-500" },
  { id: "Iqub", icon: Icons.Users, label: "Iqub Win", color: "from-pink-500 to-rose-500" },
  { id: "Remittance", icon: Icons.Globe, label: "Remittance", color: "from-blue-400 to-indigo-500" },
  { id: "Rent", icon: Icons.Home, label: "Rent", color: "from-indigo-500 to-purple-600" },
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
  } = useAppContext()

  const { canUseFeature, incrementUsage, upgradeToPro } = useAIUsage()
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Form State with Auto-Save Drafts
  const [amount, setAmount] = useLocalStorage<string>("draft_tx_amount", "")
  const [title, setTitle] = useLocalStorage<string>("draft_tx_title", "")
  const [type, setType] = useLocalStorage<"income" | "expense">("draft_tx_type", "expense")
  const [category, setCategory] = useLocalStorage<string>("draft_tx_category", state.budgetCategories[0]?.name || "Food")
  const [accountId, setAccountId] = useLocalStorage<string>("draft_tx_account", "")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]) // Date usually resets to today
  const [isRecurring, setIsRecurring] = useState(false)

  // UI State
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  // Voice & Quick Templates State
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showQuickTemplates, setShowQuickTemplates] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pastedSMS, setPastedSMS] = useState("")

  // Validation State
  const [errors, setErrors] = useState({ amount: false, title: false, account: false })

  // Input Ref
  const amountInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Helper: Format Number with Commas
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, "")
    if (/^\d*\.?\d*$/.test(val)) {
      const parts = val.split(".")
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      setAmount(parts.join("."))
      if (val) setErrors((prev) => ({ ...prev, amount: false }))
    }
  }

  // Helper: Get raw number for saving
  const getRawAmount = () => Number.parseFloat(amount.replace(/,/g, ""))

  const analyzeReceiptViaAPI = async (
    base64Image: string,
  ): Promise<{
    title?: string
    amount?: number
    date?: string
    category?: string
  } | null> => {
    try {
      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze receipt")
      }

      const data = await response.json()
      return data.data || null
    } catch (error) {
      console.error("Receipt analysis error:", error)
      return null
    }
  }

  // Handle external scan triggering
  useEffect(() => {
    if (isTransactionModalOpen && scannedImage && !receiptPreview) {

      // Rate Limit Check
      const { allowed, reason } = canUseFeature('receipt')
      if (!allowed) {
        if (reason === 'upgrade_required' || reason === 'daily_limit') {
          setShowUpgrade(true)
          setScannedImage(null) // Clear image so it doesn't loop
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
            incrementUsage('receipt') // Increment usage on success

            if (result.amount) setAmount(result.amount.toLocaleString())
            if (result.title) setTitle(result.title)

            // Match category
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
      setShowVoiceModal(false) // Reset voice modal state
      setShowQuickTemplates(false) // Reset templates state
      if (editingTransaction) {
        setAmount(editingTransaction.amount?.toLocaleString() || "")
        setTitle(editingTransaction.title)
        setType(editingTransaction.type === "transfer" ? "expense" : editingTransaction.type)
        setCategory(editingTransaction.category)
        setAccountId(editingTransaction.accountId || "")
        setDate(editingTransaction.date.split("T")[0])
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

  // Load Smart Suggestions on Open
  useEffect(() => {
    if (isTransactionModalOpen && !editingTransaction) {
      setSmartSuggestions(getSmartSuggestions())
    }
  }, [isTransactionModalOpen, editingTransaction])

  // Handle Smart Suggestion Click
  const handleSmartClick = (s: SmartSuggestion) => {
    setTitle(s.label)
    setCategory(s.category)
    if (s.amount) setAmount(s.amount)
    // Optional: Vibrate for feedback
    if (navigator.vibrate) navigator.vibrate(10)
  }

  // Auto-suggest logic
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

  // Handle voice transaction parsed
  const handleVoiceTransaction = (tx: {
    type: "income" | "expense"
    amount: number
    category: string
    title: string
    date: string
  }) => {
    setAmount(tx.amount.toLocaleString())
    setTitle(tx.title)
    setType(tx.type)
    setCategory(tx.category)
    setDate(tx.date)
    showNotification("Voice transaction added! Review and save.", "success")
  }

  // Handle SMS parsing
  const handleParseSMS = () => {
    if (!pastedSMS.trim()) return

    const result = parseSMS(pastedSMS)
    if (result) {
      if (result.amount) setAmount(result.amount.toLocaleString())
      if (result.merchant) setTitle(result.merchant)
      if (result.date) setDate(result.date)

      // Try to match category if possible, otherwise default
      // For now, we default to "Other" or keep existing

      setType("expense") // SMS are usually expenses
      showNotification("SMS parsed successfully!", "success")
      setShowPasteModal(false)
      setPastedSMS("")
    } else {
      showNotification("Could not parse SMS. Try manual entry.", "error")
    }
  }

  // Quick template presets
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

    // Rate Limit Check
    const { allowed, reason } = canUseFeature('receipt')
    if (!allowed) {
      if (reason === 'upgrade_required' || reason === 'daily_limit') {
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
          incrementUsage('receipt') // Increment usage on success

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

  const handleSave = () => {
    const newErrors = {
      amount: !amount || Number.parseFloat(amount.replace(/,/g, "")) === 0,
      title: !title.trim(),
      account: !accountId,
    }

    if (newErrors.amount || newErrors.title || newErrors.account) {
      setErrors(newErrors)
      if (navigator.vibrate) navigator.vibrate(200)
      return
    }

    if (navigator.vibrate) navigator.vibrate(50)

    const txData: Transaction = {
      id: editingTransaction ? editingTransaction.id : Date.now().toString(),
      title: isRecurring ? `${title} (Recurring)` : title,
      amount: getRawAmount(),
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

      // Clear drafts
      setAmount("")
      setTitle("")
      setAccountId("")
      // Keep category and type as they might be useful defaults for next time

      setTimeout(() => {
        setIsSuccess(false)
        closeTransactionModal()
      }, 2500)
    }
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

  const getGradientFromColor = (colorClass: string) => {
    if (colorClass.includes("cyan")) return "from-cyan-400 to-blue-500"
    if (colorClass.includes("yellow")) return "from-yellow-400 to-orange-500"
    if (colorClass.includes("pink")) return "from-pink-500 to-rose-500"
    if (colorClass.includes("purple")) return "from-purple-400 to-indigo-500"
    if (colorClass.includes("emerald")) return "from-emerald-400 to-green-600"
    if (colorClass.includes("indigo")) return "from-indigo-400 to-blue-600"
    if (colorClass.includes("rose")) return "from-rose-400 to-red-600"
    if (colorClass.includes("blue")) return "from-blue-400 to-indigo-600"
    if (colorClass.includes("orange")) return "from-orange-400 to-red-500"
    if (colorClass.includes("teal")) return "from-teal-400 to-emerald-600"
    return "from-slate-700 to-slate-900"
  }

  const categories = state.budgetCategories

  if (!isTransactionModalOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
        <div
          className="absolute inset-0 modal-overlay pointer-events-auto transition-opacity"
          onClick={() => closeTransactionModal()}
        />

        <div className="modal-content w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl pointer-events-auto animate-slide-up relative overflow-hidden h-[90vh] sm:h-auto flex flex-col">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />

          {/* Success Overlay */}
          {isSuccess && (
            <>
              <Confetti />
              <div className="absolute inset-0 z-50 bg-theme-card flex flex-col items-center justify-center animate-fade-in">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-bounce">
                  <Icons.Coins className="text-emerald-500 w-12 h-12" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-500">Saved!</h3>
                <p className="text-theme-secondary text-sm">Transaction recorded.</p>
              </div>
            </>
          )}

          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-50 bg-theme-card/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan-down"></div>
                <Icons.Scan size={40} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary animate-pulse">Analyzing Receipt...</h3>
              <p className="text-theme-secondary text-sm mt-2">Extracting details with AI</p>
            </div>
          )}

          <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xl font-bold text-theme-primary">
              {editingTransaction ? "Edit Transaction" : "New Transaction"}
            </h3>
            <div className="flex gap-2">
              {!editingTransaction && (
                <div className="flex items-center bg-theme-main rounded-full border border-theme p-1 gap-1">
                  <button
                    onClick={() => setShowVoiceModal(true)}
                    className="p-2 rounded-full hover:bg-cyan-500/10 text-cyan-400 transition-colors"
                    title="Voice Input"
                    aria-label="Voice Input"
                  >
                    <Mic size={18} />
                  </button>
                  <div className="w-px h-4 bg-theme-secondary/20"></div>
                  <button
                    onClick={handleCameraClick}
                    className="p-2 rounded-full hover:bg-cyan-500/10 text-cyan-400 transition-colors"
                    title="Take Photo"
                    aria-label="Take Photo"
                  >
                    <Icons.Camera size={18} />
                  </button>
                  <div className="w-px h-4 bg-theme-secondary/20"></div>
                  <button
                    onClick={handleGalleryClick}
                    className="p-2 rounded-full hover:bg-cyan-500/10 text-cyan-400 transition-colors"
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
                  className="p-2 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
                >
                  <Icons.Delete size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 z-40 bg-theme-card/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-dialog">
              <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 shrink-0 sm:hidden"></div>
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-500">
                <Icons.Delete size={32} />
              </div>
              <h4 className="text-lg font-bold text-theme-primary mb-2">Delete this transaction?</h4>
              <p className="text-sm text-theme-secondary mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-theme-main rounded-xl font-bold text-theme-secondary"
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

          {/* Paste SMS Modal */}
          {showPasteModal && (
            <div className="absolute inset-0 z-40 bg-theme-card/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-dialog">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-theme-primary">Paste SMS</h3>
                  <button onClick={() => setShowPasteModal(false)} className="text-theme-secondary">
                    <Icons.Close size={24} />
                  </button>
                </div>
                <p className="text-sm text-theme-secondary mb-4">Paste the transaction SMS from your bank (CBE, Telebirr, etc.)</p>
                <textarea
                  value={pastedSMS}
                  onChange={(e) => setPastedSMS(e.target.value)}
                  placeholder="Paste SMS here..."
                  className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 mb-4 resize-none"
                  autoFocus
                />
                <button
                  onClick={handleParseSMS}
                  disabled={!pastedSMS.trim()}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors"
                >
                  Parse & Fill
                </button>
              </div>
            </div>
          )}

          {/* Form Body - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-4 no-scrollbar">
            {/* Receipt Preview */}
            {(receiptPreview || scanError) && (
              <div className="relative w-full rounded-xl overflow-hidden border border-theme bg-black/50 p-1">
                {scanError ? (
                  <div className="p-4 text-center">
                    <Icons.Alert className="text-yellow-500 mx-auto mb-2" size={24} />
                    <p className="text-xs text-theme-primary font-bold">{scanError}</p>
                    <button onClick={handleCameraClick} className="text-xs text-cyan-400 mt-2 underline">
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
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white backdrop-blur-md font-medium flex items-center gap-1">
                      <Icons.Check size={10} className="text-emerald-400" /> Receipt Scanned
                    </div>
                  </div>
                )}
                <button
                  onClick={clearReceipt}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-rose-500 transition-colors backdrop-blur-md border border-white/10"
                  title="Remove"
                >
                  <Icons.Close size={14} />
                </button>
              </div>
            )}

            {/* Voice Input Trigger - Prominent */}
            {!editingTransaction && !amount && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 transition-all active:scale-95 group"
                >
                  <div className="p-2 bg-cyan-500 rounded-full text-black group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <Mic size={20} />
                  </div>
                  <span className="font-bold text-sm">Tap to Speak</span>
                </button>
              </div>
            )}

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
              {!editingTransaction && (
                <div className="flex justify-center gap-3">
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
                <div className="flex flex-wrap gap-2 mt-2 px-1">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTitle(s)
                        setSuggestions([])
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Category Selection - GRID LAYOUT */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-theme-secondary ml-1">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {type === "expense"
                  ? categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.name)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${category === cat.name
                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getGradientFromColor(cat.color)} shadow-sm`}
                      >
                        {(() => {
                          const IconComponent = (Icons as any)[cat.icon] || Icons.Help
                          return <IconComponent size={18} />
                        })()}
                      </div>
                      <span
                        className={`text-[10px] font-bold truncate w-full text-center ${category === cat.name ? "text-cyan-400" : "text-gray-500"}`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  ))
                  : INCOME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.label)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${category === cat.label
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        : "bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${cat.color} shadow-sm`}
                      >
                        <cat.icon size={18} />
                      </div>
                      <span
                        className={`text-[10px] font-bold truncate w-full text-center ${category === cat.label ? "text-emerald-400" : "text-gray-500"}`}
                      >
                        {cat.label}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* 4. Account & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider ml-1">Account</label>
                <div className={`relative rounded-2xl bg-black/20 border border-white/5 focus-within:border-cyan-500/50 transition-colors ${errors.account ? "border-rose-500" : ""}`}>
                  <select
                    value={accountId}
                    onChange={(e) => {
                      setAccountId(e.target.value)
                      if (e.target.value) setErrors((prev) => ({ ...prev, account: false }))
                    }}
                    className="w-full bg-transparent p-4 text-sm text-white outline-none appearance-none"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-500">
                      Select Account
                    </option>
                    {state.accounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="bg-gray-900 text-white">
                        {acc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <Icons.ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider ml-1">Date</label>
                <div className="relative rounded-2xl bg-black/20 border border-white/5 focus-within:border-cyan-500/50 transition-colors">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent p-4 text-sm text-white outline-none"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 text-right pr-1">
                  {toEthiopianDateString(date)}
                </p>
              </div>
            </div>

            {/* 5. Extras (Recurring & Templates) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${isRecurring ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-black/20 border-white/5 text-gray-500 hover:text-white"}`}
              >
                <Icons.Repeat size={16} />
                <span className="text-xs font-bold">Recurring</span>
              </button>

              {!editingTransaction && (
                <button
                  onClick={() => setShowQuickTemplates(!showQuickTemplates)}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${showQuickTemplates ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "bg-black/20 border-white/5 text-gray-500 hover:text-white"}`}
                >
                  <Zap size={16} />
                  <span className="text-xs font-bold">Templates</span>
                </button>
              )}
            </div>

            {/* Quick Templates Grid */}
            {showQuickTemplates && (
              <div className="grid grid-cols-3 gap-3 animate-fade-in bg-black/20 p-4 rounded-2xl border border-white/5">
                {quickTemplates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => applyQuickTemplate(t)}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-800/50 rounded-xl border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-xs font-medium text-white">{t.label}</span>
                    <span className="text-[10px] text-gray-500">{t.amount} ETB</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-auto shrink-0">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
              {isSuccess ? <Icons.Check size={24} /> : editingTransaction ? "Update Transaction" : "Save Transaction"}
            </button>
          </div>
        </div>
      </div >

      {/* Voice Modal */}
      < VoiceRecordingModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTransactionParsed={handleVoiceTransaction}
      />

      {/* Upgrade Prompt */}
      < UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => {
          upgradeToPro()
          setShowUpgrade(false)
        }}
        feature="receipt"
      />
    </>
  )
}
