"use client"

import type React from "react"
import { useState } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"

export const Onboarding: React.FC = () => {
  const { completeOnboarding, setUserName, setUserPhone, setUserGoal } = useAppContext()
  const [step, setStep] = useState(0)

  // Form State
  const [phone, setPhone] = useState("")
  const [name, setNameInput] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [phoneError, setPhoneError] = useState("")

  const goals = [
    {
      id: "save",
      label: "Build Savings",
      icon: <Icons.PiggyBank size={24} />,
      color: "cyan",
      desc: "Emergency fund & future",
    },
    {
      id: "debt",
      label: "Pay Off Debt",
      icon: <Icons.ArrowUp size={24} className="rotate-45" />,
      color: "rose",
      desc: "Become debt-free",
    },
    {
      id: "budget",
      label: "Track Spending",
      icon: <Icons.Budget size={24} />,
      color: "purple",
      desc: "Know where money goes",
    },
    {
      id: "iqub",
      label: "Join/Track Iqub",
      icon: <Icons.Users size={24} />,
      color: "yellow",
      desc: "Community savings",
    },
    {
      id: "invest",
      label: "Start Investing",
      icon: <Icons.TrendingUp size={24} />,
      color: "emerald",
      desc: "Grow your wealth",
    },
    { id: "family", label: "Family Budget", icon: <Icons.Home size={24} />, color: "blue", desc: "Household planning" },
  ]

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  // Normalize phone to exactly 9 digits (strips leading 0, keeps only last 9 digits)
  const normalizePhoneInput = (p: string): string => {
    // Remove all non-digit characters
    let clean = p.replace(/\D/g, "")
    // Remove leading 0 if present
    if (clean.startsWith("0")) {
      clean = clean.substring(1)
    }
    // Only keep last 9 digits if more are entered
    if (clean.length > 9) {
      clean = clean.slice(-9)
    }
    return clean
  }

  // Check if phone is valid: permissive but safe
  const isPhoneValid = (p: string): boolean => {
    const clean = normalizePhoneInput(p)
    // Must be 9 digits and start with 7 or 9
    return clean.length === 9 && ['7', '9'].includes(clean[0])
  }

  // Check if the button should be enabled for step 1
  const isPhoneButtonEnabled = (): boolean => {
    return isPhoneValid(phone)
  }

  const validatePhone = (p: string) => {
    const clean = normalizePhoneInput(p)
    // Must be exactly 9 digits, starting with 7 or 9
    return /^[79]\d{8}$/.test(clean)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!phone.trim()) {
        setPhoneError("Phone number is required")
        return
      }
      if (!validatePhone(phone)) {
        setPhoneError("Please enter a valid phone number")
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setPhoneError("")
    }

    if (step === 2) {
      const nameParts = name.trim().split(/\s+/)
      if (nameParts.length < 1) {
        return // Require at least one name
      }
    }
    if (step === 3 && selectedGoals.length === 0) return

    if (step < 4) {
      setStep(step + 1)
    } else {
      let normalizedPhone = phone.replace(/[\s-]/g, "")
      // Remove leading 0 if present to get base 9 digits
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = normalizedPhone.substring(1)
      }

      // Ensure we have the standard 0-prefix format for storage if that's what backend expects
      // Or just keep it as 0 + 9 digits
      normalizedPhone = "0" + normalizedPhone

      setUserPhone(normalizedPhone)
      setUserName(name)
      const goalLabels = selectedGoals.map((id) => goals.find((g) => g.id === id)?.label).join(", ")
      setUserGoal(goalLabels)
      completeOnboarding()
    }
  }

  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center text-center animate-fade-in px-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-8 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)] relative">
              <Icons.Wallet size={56} className="text-cyan-400" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <Icons.Sparkles size={16} className="text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Liq</h1>
            <p className="text-cyan-400 font-bold text-sm mb-2">Your Personal Financial Expert</p>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-8">
              Ethiopia's intelligent financial partner. Master your money with local insight.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-3 text-center">
                <Icons.AI size={20} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400">AI Advisor</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-3 text-center">
                <Icons.Camera size={20} className="text-purple-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400">Scan Receipts</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-3 text-center">
                <Icons.TrendingUp size={20} className="text-emerald-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400">Track Goals</p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3 max-w-xs text-left">
              <Icons.Shield className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-emerald-400 font-bold mb-1">Secure & Private</p>
                <p className="text-[10px] text-gray-400 leading-snug">
                  Your financial data stays on your device. Bank-level security.
                </p>
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="w-full max-w-xs text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
              <Icons.Phone size={32} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Mobile Number</h2>
            <p className="text-gray-400 text-sm mb-8">We use this to personalize your experience.</p>

            <div className="relative group text-left">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-2 block uppercase tracking-wider">
                Ethiopian Mobile
              </label>
              <div
                className={`flex items-center bg-gray-900 border-2 rounded-2xl p-1 transition-all ${phoneError ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "border-gray-700 focus-within:border-cyan-500 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)]"}`}
              >
                <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-700 bg-gray-800/50 rounded-l-xl py-3">
                  <span className="text-2xl leading-none">🇪🇹</span>
                  <span className="text-gray-300 font-bold text-sm">+251</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // Allow only digits and limit to 9 (after normalization)
                    const rawValue = e.target.value
                    // Remove non-digits for validation but keep display value for UX
                    const digitsOnly = rawValue.replace(/\D/g, "")
                    // If starts with 0, allow up to 10, otherwise 9
                    const maxLen = digitsOnly.startsWith("0") ? 10 : 9
                    const limited = digitsOnly.slice(0, maxLen)
                    setPhone(limited)
                    setPhoneError("")
                  }}
                  placeholder="911234567"
                  className="w-full bg-transparent p-3 text-xl font-bold text-white outline-none placeholder-gray-400 font-mono tracking-wider"
                  maxLength={10}
                  autoFocus
                />
              </div>
              {phoneError && (
                <p className="text-xs text-rose-500 mt-3 flex items-center gap-2 font-bold bg-rose-500/10 p-2 rounded-lg">
                  <Icons.Alert size={14} /> {phoneError}
                </p>
              )}
              <p className="text-[10px] text-gray-500 mt-3 text-center">
                Enter 9 digits starting with 9 or 7 (e.g. 911... or 712...)
              </p>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="w-full max-w-xs text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
              <Icons.User size={32} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">What's Your Full Name?</h2>
            <p className="text-gray-400 text-sm mb-8">First and last name so your advisor knows you.</p>

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Abebe Kebede"
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-2xl p-4 text-center text-2xl font-bold text-white focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] outline-none transition-all placeholder-gray-400"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-3">What should we call you?</p>
          </div>
        )
      case 3:
        return (
          <div className="w-full max-w-sm animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What Are Your Goals?</h2>
              <p className="text-gray-400 text-sm">Select all that apply. This helps your AI advisor.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {goals.map((g) => {
                const isSelected = selectedGoals.includes(g.id)
                const colorClasses: Record<string, string> = {
                  cyan: "border-cyan-500 bg-cyan-500/10 shadow-cyan-500/20",
                  rose: "border-rose-500 bg-rose-500/10 shadow-rose-500/20",
                  purple: "border-purple-500 bg-purple-500/10 shadow-purple-500/20",
                  yellow: "border-yellow-500 bg-yellow-500/10 shadow-yellow-500/20",
                  emerald: "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20",
                  blue: "border-blue-500 bg-blue-500/10 shadow-blue-500/20",
                }
                const iconColors: Record<string, string> = {
                  cyan: "text-cyan-400",
                  rose: "text-rose-400",
                  purple: "text-purple-400",
                  yellow: "text-yellow-400",
                  emerald: "text-emerald-400",
                  blue: "text-blue-400",
                }
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 relative overflow-hidden ${isSelected ? `${colorClasses[g.color]} shadow-lg scale-[1.02]` : "bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"}`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Icons.CheckCircle size={16} className={iconColors[g.color]} />
                      </div>
                    )}
                    <div className={isSelected ? iconColors[g.color] : "text-gray-500"}>{g.icon}</div>
                    <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>
                      {g.label}
                    </span>
                    <span className={`text-[10px] ${isSelected ? "text-gray-300" : "text-gray-600"}`}>{g.desc}</span>
                  </button>
                )
              })}
            </div>

            {selectedGoals.length > 0 && (
              <p className="text-center text-xs text-cyan-400 mt-4 font-medium">
                {selectedGoals.length} goal{selectedGoals.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )
      case 4:
        return (
          <div className="flex flex-col items-center text-center animate-fade-in px-4">
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                <Icons.AI size={48} className="text-cyan-400" />
              </div>
              <div className="absolute -top-4 -right-8 bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-none border border-gray-700 shadow-xl animate-bounce">
                <p className="text-sm text-white font-medium">Hello, {name}! 👋</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Your Advisor is Ready</h2>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-8">
              I'm here to help you achieve:{" "}
              <span className="text-cyan-400 font-medium">
                {selectedGoals.map((id) => goals.find((g) => g.id === id)?.label).join(", ")}
              </span>
            </p>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 w-full max-w-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What You Can Do</h3>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Icons.Plus size={16} className="text-cyan-400" />
                </div>
                <p className="text-xs text-gray-300">Add transactions with one tap</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Icons.Camera size={16} className="text-purple-400" />
                </div>
                <p className="text-xs text-gray-300">Scan receipts with AI</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Icons.AI size={16} className="text-emerald-400" />
                </div>
                <p className="text-xs text-gray-300">Get personalized financial advice</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-between p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-black to-black z-0 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      {/* Progress Indicators - Simplified */}
      <div className="relative z-10 w-full max-w-sm pt-4">
        {/* Step Dots Only */}
        <div className="flex justify-center gap-2 mt-2 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= step
                ? "bg-cyan-500"
                : "bg-gray-800"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Skip Button - Only show on step 0 */}
      {step === 0 && (
        <button
          onClick={() => setStep(1)}
          className="absolute top-6 right-6 z-20 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Skip Intro
        </button>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center w-full items-center">{renderContent()}</div>

      {/* Footer Action */}
      <div className="relative z-10 w-full max-w-sm pb-6 space-y-3">
        <button
          onClick={handleNext}
          disabled={
            (step === 1 && !isPhoneButtonEnabled()) ||
            (step === 2 && !name.trim()) ||
            (step === 3 && selectedGoals.length === 0)
          }
          className="w-full py-4 rounded-2xl font-bold text-lg text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {step === 4 ? (
            <>
              <Icons.Sparkles size={20} />
              Start My Journey
            </>
          ) : step === 0 ? (
            <>
              Get Started
              <Icons.ChevronRight size={20} />
            </>
          ) : (
            <>
              Continue
              <Icons.ChevronRight size={20} />
            </>
          )}
        </button>

        {step > 0 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  )
}
