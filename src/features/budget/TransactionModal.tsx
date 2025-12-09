"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import type { Transaction } from "@/types"
import { HorizontalScroll } from "@/shared/components/HorizontalScroll"
import { VoiceRecordingModal } from "@/features/voice/VoiceRecordingModal"
import { Mic, Zap, ChevronDown, RefreshCw } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Confetti } from "@/shared/components/Confetti"
import { toEthiopianDateString } from "@/utils/dateUtils"
import { useAIUsage } from "@/services/ai-usage"
import { UpgradePrompt } from "@/shared/components/UpgradePrompt"

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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  // Voice & Quick Templates State
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showQuickTemplates, setShowQuickTemplates] = useState(false)

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
        setAmount(editingTransaction.amount.toLocaleString())
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

  // Handle SMS parsing - REMOVED FOR NOW
  // Bank SMS feature will be added in future phase

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

            {/* Input Method Selector - Prominent buttons when form is empty */}
            {!editingTransaction && !amount && !title && !receiptPreview && (
              <div className="mb-6">
                <p className="text-xs text-theme-secondary text-center mb-3 uppercase tracking-wider font-bold">
                  How do you want to add this?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Voice Button */}
                  <button
                    onClick={() => setShowVoiceModal(true)}
                    className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/50 rounded-2xl hover:border-cyan-400 hover:from-cyan-500/30 hover:to-blue-600/30 transition-all group btn-press"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-2 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
                      <Mic size={28} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-cyan-400">Voice</span>
                    <span className="text-[10px] text-theme-secondary">Speak it</span>
                  </button>

                  {/* Scan Button */}
                  <button
                    onClick={handleCameraClick}
                    className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-2 border-purple-500/50 rounded-2xl hover:border-purple-400 hover:from-purple-500/30 hover:to-pink-600/30 transition-all group btn-press"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                      <Icons.Camera size={28} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-purple-400">Scan</span>
                    <span className="text-[10px] text-theme-secondary">Receipt</span>
                  </button>

                  {/* Manual Button */}
                  <button
                    onClick={() => amountInputRef.current?.focus()}
                    className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/50 rounded-2xl hover:border-emerald-400 hover:from-emerald-500/30 hover:to-teal-600/30 transition-all group btn-press"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all">
                      <Icons.Edit size={28} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-emerald-400">Manual</span>
                    <span className="text-[10px] text-theme-secondary">Type it</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1. Amount */}
            <div
              className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-colors ${errors.amount ? "bg-rose-500/10 border border-rose-500" : ""}`}
            >
              <div className="relative w-full max-w-[200px]">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-theme-secondary text-xl font-medium">
                  ETB
                </span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-transparent text-center text-5xl font-bold text-theme-primary outline-none placeholder-gray-400 font-mono"
                  placeholder="0"
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-500 font-bold mt-1">Amount is required</p>}
            </div>

            {/* 2. Type Toggle */}
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-theme">
              <button
                onClick={() => {
                  setType("expense")
                  setCategory(state.budgetCategories[0]?.name || "Food")
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${type === "expense" ? "bg-theme-card text-pink-500 shadow-sm border border-theme/50" : "text-theme-secondary hover:text-white"}`}
              >
                <Icons.ArrowUp className="rotate-45" size={16} /> Expense
              </button>
              <button
                onClick={() => {
                  setType("income")
                  setCategory("Salary")
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${type === "income" ? "bg-theme-card text-emerald-500 shadow-sm border border-theme/50" : "text-theme-secondary hover:text-white"}`}
              >
                <Icons.ArrowDown className="rotate-45" size={16} /> Income
              </button>
            </div>

            {/* 3. Title & Suggestions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Title / Payee</label>
              <div className={`relative rounded-xl bg-white/5 border border-white/10 ${errors.title ? "border-rose-500" : ""}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary">
                  <Icons.Edit size={18} />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent p-4 pl-12 text-theme-primary outline-none placeholder-gray-400"
                  placeholder="What is this for?"
                />
              </div>
              {errors.title && <p className="text-xs text-rose-500 font-bold">Title is required</p>}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTitle(s)
                        setSuggestions([])
                      }}
                      className="px-3 py-1.5 rounded-lg bg-theme-main border border-theme text-xs text-theme-secondary hover:text-theme-primary hover:border-cyan-500/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Category</label>
              <HorizontalScroll className="pb-2">
                <div className="flex gap-3">
                  {type === "expense"
                    ? categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.name)}
                        className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-2xl border transition-all ${category === cat.name
                          ? "bg-theme-card border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-105"
                          : "bg-white/5 border-transparent hover:bg-white/10"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${getGradientFromColor(cat.color)}`}
                        >
                          {/* Dynamic Icon Rendering */}
                          {(() => {
                            const IconComponent = (Icons as any)[cat.icon] || Icons.Help
                            return <IconComponent size={18} />
                          })()}
                        </div>
                        <span
                          className={`text-[10px] font-medium truncate w-full text-center ${category === cat.name ? "text-cyan-400" : "text-theme-secondary"}`}
                        >
                          {cat.name}
                        </span>
                      </button>
                    ))
                    : INCOME_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.label)}
                        className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-2xl border transition-all ${category === cat.label
                          ? "bg-theme-card border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-105"
                          : "bg-white/5 border-transparent hover:bg-white/10"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${cat.color}`}
                        >
                          <cat.icon size={18} />
                        </div>
                        <span
                          className={`text-[10px] font-medium truncate w-full text-center ${category === cat.label ? "text-emerald-400" : "text-theme-secondary"}`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    ))}
                </div>
              </HorizontalScroll>
            </div>

            {/* 5. Account & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Account</label>
                <div className="relative">
                  <select
                    value={accountId}
                    onChange={(e) => {
                      setAccountId(e.target.value)
                      if (e.target.value) setErrors((prev) => ({ ...prev, account: false }))
                    }}
                    className={`w-full bg-white/5 p-3 rounded-xl border border-white/10 text-theme-primary outline-none appearance-none ${errors.account ? "border-rose-500" : ""}`}
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-400">
                      Select Account
                    </option>
                    {state.accounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="bg-gray-900 text-gray-200">
                        {acc.name}
                      </option>
                    ))}
                  </select>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-theme-primary outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                    <p className="text-[10px] text-theme-secondary text-right pr-1">
                      {toEthiopianDateString(date)}
                    </p>
                  </div>

                  {/* 6. Recurring Toggle */}
                  <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-theme/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${isRecurring
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-theme-main text-theme-secondary"
                          }`}
                      >
                        {/* You can put an icon or text here */}
                        {isRecurring ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-theme-primary">Recurring?</p>
                  <p className="text-[10px] text-theme-secondary">Repeat this monthly</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-7 rounded-full transition-colors relative ${isRecurring ? "bg-purple-500" : "bg-theme-main border border-theme"}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${isRecurring ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {/* Quick Templates Toggle */}
            {!editingTransaction && (
              <button
                onClick={() => setShowQuickTemplates(!showQuickTemplates)}
                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-theme-secondary hover:text-cyan-400 transition-colors border border-dashed border-theme rounded-xl hover:bg-white/5"
              >
                <Zap size={14} />
                {showQuickTemplates ? "Hide Quick Templates" : "Show Quick Templates"}
              </button>
            )}

            {/* Quick Templates Grid */}
            {showQuickTemplates && (
              <div className="grid grid-cols-3 gap-3 animate-fade-in">
                {quickTemplates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => applyQuickTemplate(t)}
                    className="flex flex-col items-center gap-1 p-3 bg-black/40 rounded-xl border border-theme hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-xs font-medium text-theme-primary">{t.label}</span>
                    <span className="text-[10px] text-theme-secondary">{t.amount} ETB</span>
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
