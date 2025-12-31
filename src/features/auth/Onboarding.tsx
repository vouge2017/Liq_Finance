"use client"

import type React from "react"
import { useState } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import { ConsentBanner } from "@/components/ConsentBanner"

export const Onboarding: React.FC = () => {
  const { completeOnboarding, setUserName, setUserPhone, setUserGoal } = useAppContext()
  const [step, setStep] = useState(0)

  // Form State
  const [phone, setPhone] = useState("")
  const [name, setNameInput] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [otherGoal, setOtherGoal] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const goals = [
    { id: "save", label: "Build Savings", icon: <Icons.PiggyBank size={28} />, color: "cyan" },
    { id: "debt", label: "Pay Off Debt", icon: <Icons.CreditCard size={28} />, color: "cyan" },
    { id: "budget", label: "Track Spending", icon: <Icons.TrendingUp size={28} />, color: "cyan" },
    { id: "advisor", label: "AI Finance Advisory", icon: <Icons.AI size={28} />, color: "cyan" },
  ]

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const normalizePhoneInput = (p: string): string => {
    let clean = p.replace(/\D/g, "")
    if (clean.startsWith("0")) clean = clean.substring(1)
    if (clean.length > 9) clean = clean.slice(-9)
    return clean
  }

  const validatePhone = (p: string) => {
    const clean = normalizePhoneInput(p)
    return /^[79]\d{8}$/.test(clean)
  }

  const handleNext = () => {
    if (step === 1) {
      // Goal step - no validation needed
    }
    if (step === 2) {
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
    if (step === 3) {
      const nameParts = name.trim().split(/\s+/)
      if (nameParts.length < 1) { // Relaxed to just one name based on "Display Name" label
        setPhoneError("Please enter your name")
        return
      }
      setPhoneError("")
    }

    if (step < 4) {
      setStep(step + 1)
    } else {
      let normalizedPhone = phone.replace(/[\s-]/g, "")
      if (normalizedPhone.startsWith("0")) normalizedPhone = normalizedPhone.substring(1)
      normalizedPhone = "0" + normalizedPhone

      setUserPhone(normalizedPhone)
      setUserName(name)

      let finalGoals = selectedGoals.map((id) => goals.find((g) => g.id === id)?.label).join(", ")
      if (otherGoal.trim()) {
        finalGoals = finalGoals ? `${finalGoals}, ${otherGoal}` : otherGoal
      }
      setUserGoal(finalGoals)

      completeOnboarding()
    }
  }

  // --- RENDER HELPERS ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center">
          <div
            className={`h-4 rounded-full transition-all duration-500 flex items-center justify-center ${i <= step
                ? "w-4 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "w-4 bg-gray-200"
              }`}
          >
            {/* Inner glow dot */}
            {i <= step && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          {i < 4 && (
            <div
              className={`h-1.5 w-8 rounded-full mx-[-2px] transition-colors duration-500 ${i < step ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-gray-200"
                }`}
            />
          )}
        </div>
      ))}
      <span className="ml-4 text-sm font-bold text-gray-400">{step}/4</span>
    </div>
  )

  const renderContent = () => {
    switch (step) {
      case 0: // WELCOME
        return (
          <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-md">
            {/* Hero Illustration Placeholder */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-200 to-purple-200 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(168,85,247,0.3)] relative animate-float">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
              <Icons.Wallet size={64} className="text-gray-800 relative z-10" />
            </div>

            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">
              Liq<span className="text-cyan-600">.</span>
            </h1>
            <p className="text-xl font-bold text-gray-800 mb-2">Master Your Money</p>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-10">
              Your AI-powered financial expert. Plan, track, and grow with confidence.
            </p>

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 rounded-[2rem] font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/20 active:scale-[0.98]"
            >
              Get Started
            </button>
            <p className="mt-6 text-xs text-gray-400 font-medium">Already have an account? <span className="text-cyan-600 font-bold">Log in</span></p>
          </div>
        )

      case 1: // GOALS
        return (
          <>
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center px-4 leading-tight">
              What's your main<br />purpose?
            </h2>

            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl shadow-purple-500/5 animate-slide-up">
              {renderStepIndicator()}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {goals.map((g) => {
                  const isSelected = selectedGoals.includes(g.id)
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={`p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 text-center transition-all duration-200 aspect-square ${isSelected
                          ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-400 shadow-lg shadow-cyan-500/10"
                          : "bg-white/80 border-2 border-transparent hover:border-gray-200 shadow-sm"
                        }`}
                    >
                      <div className={isSelected ? "text-cyan-600" : "text-gray-400"}>{g.icon}</div>
                      <span className={`text-xs font-bold leading-tight ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                        {g.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Other Goal Input */}
              <div className="relative mb-8">
                <input
                  type="text"
                  value={otherGoal}
                  onChange={(e) => setOtherGoal(e.target.value)}
                  placeholder="Other goals (e.g., Invest, Save for a car)"
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl p-4 text-sm font-medium text-gray-900 focus:border-cyan-500 focus:bg-white outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )

      case 2: // PHONE
        return (
          <>
            {/* Floating Icon */}
            <div className="mb-6 animate-float">
              <div className="w-24 h-24 bg-gradient-to-br from-white to-cyan-50 rounded-[2rem] shadow-xl flex items-center justify-center border border-white/50">
                <Icons.Phone size={40} className="text-cyan-500" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">
              What's your<br />number?
            </h2>
            <p className="text-gray-500 font-medium mb-8">Outfit</p> {/* Placeholder for font name in design? Or subtitle? Design says "Outfit" above title? Assuming it's a label */}

            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl shadow-purple-500/5 animate-slide-up">
              {/* Input Area */}
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-2 flex items-center mb-8 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all">
                <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-200">
                  <span className="text-xl">🇪🇹</span>
                  <span className="font-bold text-gray-600">+251</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "")
                    setPhone(raw.slice(0, 10))
                    setPhoneError("")
                  }}
                  placeholder="912 345 678"
                  className="w-full bg-transparent p-2 text-lg font-bold text-gray-900 outline-none placeholder-gray-300 tracking-wide"
                  autoFocus
                />
              </div>
              {phoneError && <p className="text-rose-500 text-xs font-bold text-center mb-4 -mt-4">{phoneError}</p>}

              {renderStepIndicator()}
              <p className="text-center text-xs font-bold text-gray-400 mb-8">Step 2 of 4</p>

              <div className="flex items-center gap-4">
                <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">
                  <Icons.ChevronLeft size={20} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )

      case 3: // NAME
        return (
          <>
            {renderStepIndicator()} {/* Design shows indicator at top for this step? No, inside card usually. Let's stick to consistent card layout */}

            <div className="mb-6 animate-float">
              <div className="w-24 h-24 bg-gradient-to-br from-white to-purple-50 rounded-[2rem] shadow-xl flex items-center justify-center border border-white/50">
                <Icons.User size={40} className="text-purple-500" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center leading-tight">
              What should<br />we call you?
            </h2>

            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl shadow-purple-500/5 animate-slide-up">

              <div className="mb-8">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your display name"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-[1.5rem] p-5 text-center text-lg font-bold text-gray-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder-gray-400"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-4 mt-8">
                <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-2">
                  <Icons.ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Next <Icons.ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )

      case 4: // COMPLETION
        return (
          <>
            <h1 className="text-4xl font-black text-gray-900 mb-8 text-center">You're all set!</h1>

            <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl shadow-cyan-500/5 animate-scale-up text-center relative overflow-hidden">

              {/* Shield Icon */}
              <div className="w-40 h-40 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                <Icons.Shield size={120} className="text-cyan-500 relative z-10 drop-shadow-2xl" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Icons.Check size={48} className="text-white drop-shadow-md" strokeWidth={4} />
                </div>
              </div>

              <p className="text-gray-600 font-medium leading-relaxed mb-10">
                Our AI has personalized your profile.<br />Welcome to Liq Finance.
              </p>

              <button
                onClick={handleNext}
                className="w-full py-4 rounded-[1.5rem] font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/20 active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 overflow-hidden bg-[#f0f4f8]">
      {/* HOLOGRAPHIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-200/40 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[-20%] w-[70%] h-[70%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-emerald-200/40 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {renderContent()}
      </div>

      {/* Consent Banner (Only on last step or hidden?) - Keeping it hidden or minimal as per design focus */}
      {step === 4 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
          <p className="text-[10px] text-gray-400">By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      )}
    </div>
  )
}
