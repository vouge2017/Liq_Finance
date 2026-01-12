"use client"

import type React from "react"
import { useState } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"

interface Goal {
  id: string
  title: string
  titleAm?: string
  desc: string
  descAm?: string
  iconType: 'savings' | 'shield' | 'payments' | 'home' | 'visibility' | 'edit' | 'show_chart'
}

export const Onboarding: React.FC = () => {
  const { completeOnboarding, setUserName, setUserPhone, setUserGoal } = useAppContext()
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState<'en' | 'am'>('en')

  // Form State
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [otherGoal, setOtherGoal] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const t = {
    en: {
      welcome: "Welcome to Liq.!",
      welcomeDesc: "Your journey to financial confidence starts here.",
      features: "What Liq. can do for you",
      feat1Title: "Track your spending",
      feat1Desc: "See where your money goes",
      feat2Title: "Build your savings",
      feat2Desc: "Save for what matters most",
      feat3Title: "Join Iqub & Iddir",
      feat3Desc: "Community savings made easy",
      goalsTitle: "What's your goal?",
      goalsDesc: "Select one or more (optional)",
      detailsTitle: "Almost done!",
      detailsDesc: "Enter your details to get started",
      labelFirstname: "First Name",
      labelLastname: "Father's Name",
      labelPhone: "Phone Number",
      phoneInfo: "Your phone number will be your account number. It's safe and private.",
      btnNext: "Continue",
      btnBack: "Back",
      btnFinish: "Get Started",
    },
    am: {
      welcome: "ወደ ሊቅ እንኳን ደህና መጡ!",
      welcomeDesc: "የገንዘብ መታመን ጉዞዎ ከእዚህ ይጀምራል።",
      features: "ሊቅ ምን ያደርጋል?",
      feat1Title: "ወጪዎን ይምሩ",
      feat1Desc: "ገንዘብዎ የት እንደሚሄድ ያውቁ",
      feat2Title: "ቁጠባዎን ያሳድጉ",
      feat2Desc: "ለሚፈልጉት ነገር ያስቆጥሩ",
      feat3Title: "ከእቁብ እና እድር ጋር",
      feat3Desc: "የማህበረሰብ ቁጠባ ቀላል ተደርጎ ተዘጋጀ",
      goalsTitle: "የእርስዎ ግብ ምንድነው?",
      goalsDesc: "አንድ ወይም ብዙ ይምረጡ (አማማኝ)",
      detailsTitle: "ሙሉ ሆኖ ተዘጋጅተዋል!",
      detailsDesc: "ለመጀመሪያ ዝርዝሮችዎን ያስገቡ",
      labelFirstname: "ሥም",
      labelLastname: "የአባት ሥም",
      labelPhone: "ስልክ ቁጥር",
      phoneInfo: "ስልክዎ የሂሳብዎ ቁጥር ይሆናል። ሚስጢር ነው።",
      btnNext: "ቀጥል",
      btnBack: "ተመለስ",
      btnFinish: "ጀምር",
    }
  }

  const goals: Goal[] = [
    { id: 'budget', title: 'Budget Tracking', titleAm: 'የበጀት መምራት', desc: 'Know where your money goes', descAm: 'ገንዘብዎ የት እንደሚሄድ ያውቁ', iconType: 'show_chart' },
    { id: 'emergency', title: 'Emergency Fund', titleAm: 'የአደጋ ጊዜ ቁጠባ', desc: 'Prepare for the unexpected', descAm: 'ለማይተነፈስ ዝግጁ ይሁኑ', iconType: 'shield' },
    { id: 'debt', title: 'Debt Free', titleAm: 'ከብድር ነጻ', desc: 'Pay off loans faster', descAm: 'ብድርዎን በፍጥነት ክፈት', iconType: 'payments' },
    { id: 'purchase', title: 'Big Purchase', titleAm: 'ትልቅ ግዢ', desc: 'Save for a home, car, or wedding', descAm: 'ለቤት፣ ለመኪና ወይም ለሥጋወደሙ ያስቆጥሩ', iconType: 'home' },
    { id: 'exploring', title: 'Just Exploring', titleAm: 'ብቻዬን እጠይቃለሁ', desc: 'I want to look around first', descAm: 'አስቀድሜ መመርመር እፈልጋለሁ', iconType: 'visibility' },
    { id: 'other', title: 'Other', titleAm: 'ሌላ', desc: 'Create my own goal', descAm: 'የራሴን ግብ እፈጥራለሁ', iconType: 'edit' },
  ]

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => 
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
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
    const tt = t[language]

    if (step === 1) {
      // Goal step - no validation needed
    }
    
    if (step === 2) {
      // Phone step
      const cleanPhone = normalizePhoneInput(phone)
      if (!phone.trim()) {
        setPhoneError(language === 'en' ? "Phone number is required" : "ስልክ ቁጥር ያስገቡ")
        return
      }
      if (!validatePhone(cleanPhone)) {
        setPhoneError(language === 'en' ? "Must start with 7 or 9" : "ከ7 ወይም 9 ይጀምር")
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setPhoneError("")
    }

    if (step === 3) {
      // Name step
      if (!firstName.trim()) {
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      if (!lastName.trim()) {
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setPhoneError("")
    }

    if (step < 3) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      const normalizedPhone = phone.replace(/[\s-]/g, "")
      const phoneWithPrefix = normalizedPhone.startsWith("0") 
        ? normalizedPhone 
        : "0" + normalizedPhone

      setUserPhone(phoneWithPrefix)
      setUserName(`${firstName} ${lastName}`)

      const selectedGoalLabels = selectedGoals
        .map(id => goals.find(g => g.id === id))
        .filter(Boolean)
        .map(g => language === 'en' ? g!.title : g!.titleAm || g!.title)

      let finalGoals = selectedGoalLabels.join(", ")
      if (selectedGoals.includes('other') && otherGoal.trim()) {
        finalGoals = finalGoals 
          ? `${finalGoals}, ${otherGoal}` 
          : otherGoal
      }
      setUserGoal(finalGoals)

      completeOnboarding()
    }
  }

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'savings': return <Icons.PiggyBank size={20} />
      case 'shield': return <Icons.Shield size={20} />
      case 'payments': return <Icons.CreditCard size={20} />
      case 'home': return <Icons.Home size={20} />
      case 'visibility': return <Icons.Eye size={20} />
      case 'edit': return <Icons.Edit size={20} />
      case 'show_chart': return <Icons.TrendingUp size={20} />
      default: return <Icons.Star size={20} />
    }
  }

  const renderContent = () => {
    const tt = t[language]

    switch (step) {
      case 0: // WELCOME
        return (
          <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-md mx-auto">
            {/* Decorative */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-ethiopic-green/5 rounded-full blur-[80px]"></div>
              <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[40%] bg-gold/5 rounded-full blur-[60px]"></div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ethiopic-green to-ethiopian-green-light flex items-center justify-center shadow-lg mb-6">
              <Icons.Wallet size={32} className="text-white" />
            </div>

            <h1 className="font-display text-4xl font-bold text-coffee-brown mb-2">
              {tt.welcome}
            </h1>
            <p className="text-text-secondary text-sm max-w-xs leading-relaxed mb-8">
              {tt.welcomeDesc}
            </p>

            {/* Features */}
            <div className="w-full space-y-2 mb-8">
              <h3 className="text-sm font-semibold text-coffee-brown mb-3">{tt.features}</h3>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-ethiopic-green/10">
                <div className="w-9 h-9 rounded-lg bg-ethiopic-green/10 flex items-center justify-center">
                  <Icons.TrendingUp size={18} className="text-ethiopic-green" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-coffee-brown">{tt.feat1Title}</div>
                  <div className="text-xs text-text-secondary">{tt.feat1Desc}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gold/20">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Icons.PiggyBank size={18} className="text-gold" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-coffee-brown">{tt.feat2Title}</div>
                  <div className="text-xs text-text-secondary">{tt.feat2Desc}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-ethiopic-green/10">
                <div className="w-9 h-9 rounded-lg bg-ethiopic-green/10 flex items-center justify-center">
                  <Icons.Users size={18} className="text-ethiopic-green" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-coffee-brown">{tt.feat3Title}</div>
                  <div className="text-xs text-text-secondary">{tt.feat3Desc}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full h-12 rounded-xl bg-ethiopic-green text-white font-semibold text-sm shadow-lg shadow-ethiopic-green/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              {tt.btnNext}
              <Icons.ChevronRight size={18} />
            </button>
          </div>
        )

      case 1: // GOALS
        return (
          <>
            <h2 className="font-display text-2xl font-bold text-coffee-brown text-center mb-1">
              {tt.goalsTitle}
            </h2>
            <p className="text-text-secondary text-xs text-center mb-4">{tt.goalsDesc}</p>

            <div className="flex items-center justify-center gap-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= step ? "flex-1 bg-ethiopic-green" : "flex-1 bg-gray-200"
                  }`}
                  style={{ maxWidth: i === 2 ? 'auto' : '60px' }}
                />
              ))}
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-ethiopic-green bg-ethiopic-green/5"
                        : "border-gray-200 hover:border-ethiopic-green/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-ethiopic-green" : "bg-gray-100"
                    }`}>
                      <span className={isSelected ? "text-white" : "text-text-secondary"}>
                        {getIcon(goal.iconType)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-coffee-brown">
                        {language === 'en' ? goal.title : goal.titleAm}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {language === 'en' ? goal.desc : goal.descAm}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-ethiopic-green bg-ethiopic-green" : "border-gray-300"
                    }`}>
                      {isSelected && <Icons.Check size={12} className="text-white" />}
                    </div>
                  </button>
                )
              })}

              {/* Other Goal Input */}
              {selectedGoals.includes('other') && (
                <input
                  type="text"
                  value={otherGoal}
                  onChange={(e) => setOtherGoal(e.target.value)}
                  placeholder={language === 'en' ? "Type your goal here..." : "ግብዎን እዚህ ይጻፉ..."}
                  className="w-full h-11 px-4 rounded-xl bg-parchment border-2 border-ethiopic-green focus:border-ethiopic-green focus:bg-white outline-none text-sm text-coffee-brown placeholder-text-secondary"
                  autoFocus
                />
              )}
            </div>

            <div className="flex gap-2 mt-6 max-w-sm mx-auto">
              <button 
                onClick={() => setStep(step - 1)} 
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-coffee-brown font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                {tt.btnBack}
              </button>
              <button
                onClick={handleNext}
                className="flex-1 h-11 rounded-xl bg-ethiopic-green text-white font-semibold text-sm shadow-lg shadow-ethiopic-green/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                {tt.btnNext}
                <Icons.ChevronRight size={18} />
              </button>
            </div>
          </>
        )

      case 2: // PHONE
        return (
          <>
            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-ethiopic-green to-ethiopian-green-light flex items-center justify-center shadow-lg mb-4">
              <Icons.Phone size={28} className="text-white" />
            </div>

            <h2 className="font-display text-2xl font-bold text-coffee-brown text-center mb-1">
              {tt.labelPhone}
            </h2>
            <p className="text-text-secondary text-xs text-center mb-4">{tt.phoneInfo}</p>

            <div className="flex items-center justify-center gap-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= step ? "flex-1 bg-ethiopic-green" : "flex-1 bg-gray-200"
                  }`}
                  style={{ maxWidth: i === 2 ? 'auto' : '60px' }}
                />
              ))}
            </div>

            <div className="max-w-sm mx-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">+251</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "")
                    setPhone(raw.slice(0, 9))
                    setPhoneError("")
                  }}
                  placeholder="91 234 5678"
                  className={`w-full h-12 pl-16 pr-4 rounded-xl bg-parchment border-2 ${
                    phoneError ? "border-red-500" : "border-gray-200"
                  } focus:border-ethiopic-green focus:bg-white outline-none text-coffee-brown font-medium transition-colors`}
                  autoFocus
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs font-medium text-center mt-2">{phoneError}</p>
              )}
            </div>

            <div className="flex gap-2 mt-6 max-w-sm mx-auto">
              <button 
                onClick={() => setStep(step - 1)} 
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-coffee-brown font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                {tt.btnBack}
              </button>
              <button
                onClick={handleNext}
                className="flex-1 h-11 rounded-xl bg-ethiopic-green text-white font-semibold text-sm shadow-lg shadow-ethiopic-green/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                {tt.btnNext}
                <Icons.ChevronRight size={18} />
              </button>
            </div>
          </>
        )

      case 3: // NAME
        return (
          <>
            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-ethiopic-green to-ethiopian-green-light flex items-center justify-center shadow-lg mb-4">
              <Icons.User size={28} className="text-white" />
            </div>

            <h2 className="font-display text-2xl font-bold text-coffee-brown text-center mb-1">
              {tt.detailsTitle}
            </h2>
            <p className="text-text-secondary text-xs text-center mb-4">{tt.detailsDesc}</p>

            <div className="flex items-center justify-center gap-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= step ? "flex-1 bg-ethiopic-green" : "flex-1 bg-gray-200"
                  }`}
                  style={{ maxWidth: i === 2 ? 'auto' : '60px' }}
                />
              ))}
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-medium text-coffee-brown mb-1.5">{tt.labelFirstname}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Abebe"
                  className="w-full h-11 px-4 rounded-xl bg-parchment border-2 border-gray-200 focus:border-ethiopic-green focus:bg-white outline-none text-sm text-coffee-brown placeholder-text-secondary transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coffee-brown mb-1.5">{tt.labelLastname}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g., Birhanu"
                  className="w-full h-11 px-4 rounded-xl bg-parchment border-2 border-gray-200 focus:border-ethiopic-green focus:bg-white outline-none text-sm text-coffee-brown placeholder-text-secondary transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6 max-w-sm mx-auto">
              <button 
                onClick={() => setStep(step - 1)} 
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-coffee-brown font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                {tt.btnBack}
              </button>
              <button
                onClick={handleNext}
                className="flex-1 h-11 rounded-xl bg-ethiopic-green text-white font-semibold text-sm shadow-lg shadow-ethiopic-green/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                {tt.btnFinish}
                <Icons.Home size={18} />
              </button>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-parchment px-5 py-8 flex flex-col">
      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
        className="fixed top-4 right-4 z-50 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ethiopic-green text-white text-xs font-semibold shadow-md"
      >
        <span>{language === 'en' ? '🇪🇹' : '🇺🇸'}</span>
        <span>{language === 'en' ? 'EN' : 'አማ'}</span>
      </button>

      {renderContent()}
    </div>
  )
}

export default Onboarding
