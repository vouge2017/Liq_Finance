"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"

interface Goal {
  id: string
  title: string
  titleAm?: string
  desc: string
  descAm?: string
  iconType: string
}

export const LandingPage: React.FC = () => {
  const { completeOnboarding, setUserName, setUserPhone, setUserGoal, setUserPassword } = useAppContext()

  const [pageState, setPageState] = useState<'landing' | 'onboarding' | 'signin' | 'completed'>('landing')
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [signInStep, setSignInStep] = useState(0)
  const [language, setLanguage] = useState<'en' | 'am'>('en')
  const [showConfetti, setShowConfetti] = useState(false)

  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [otherGoal, setOtherGoal] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [authError, setAuthError] = useState("")
  const [onboardingError, setOnboardingError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const t = {
    en: {
      heroGreeting: "Hello, friend.",
      heroSubtitle: "Take control of your money with confidence. Simple, secure, and designed for you.",
      value1Title: "Simple as 1-2-3",
      value1Desc: "Track expenses, save for goals, and grow your wealth effortlessly.",
      value2Title: "Smart Guidance",
      value2Desc: "AI-powered insights that help you make better financial decisions.",
      value3Title: "Bank-Grade Security",
      value3Desc: "Your data is protected with the highest security standards.",
      statUsers: "Users",
      statSaved: "Saved",
      statRating: "Rating",
      cultureTitle: "Made for Ethiopia",
      cultureDesc: "Built for Iqub, Iddir, family budgets, and the Ethiopian way of managing money.",
      btnGetStarted: "Get Started",
      btnSignin: "Sign In",
      securityText: "Bank-grade security",
      onboardWelcomeTitle: "Welcome to Liq.!",
      onboardWelcomeDesc: "Your journey to financial confidence starts here.",
      featuresTitle: "What Liq. can do for you",
      feat1Title: "Track your spending",
      feat1Desc: "See where your money goes",
      feat2Title: "Build your savings",
      feat2Desc: "Save for what matters most",
      feat3Title: "Join Iqub & Iddir",
      feat3Desc: "Community savings made easy",
      goalsTitle: "What's your goal?",
      goalsDesc: "Select one or more (optional)",
      goalsCount: "selected",
      selectAll: "Select All",
      detailsTitle: "Almost done!",
      detailsDesc: "Enter your details to get started",
      labelFirstname: "Full Name",
      labelLastname: "Password",
      labelPhone: "Phone Number",
      phoneInfo: "Your phone number will be your account number. It's safe and private.",
      btnNext: "Continue",
      btnBack: "Back",
      btnFinish: "Get Started",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Must start with 7 or 9",
      signinTitle: "Welcome Back",
      signinDesc: "Enter your phone number to sign in",
      enterOtp: "Enter the code",
      otpSent: "We sent a code to",
      didntReceive: "Didn't receive?",
      resend: "Resend",
      verify: "Verify",
      step: "Step",
      of: "of",
      btnResetPassword: "Reset Password",
      resetSent: "A temporary password has been sent to your Telegram.",
      backToSignin: "Back to Sign In",
    },
    am: {
      heroGreeting: "ሰላም ያለልግት፣",
      heroSubtitle: "ገንዘብዎን በመታመን ያስተዳድሩ። ቀላል፣ ደህንነቱ የተጠበቀ፣ ለእርስዎ የተዘጋ ነው።",
      value1Title: "ቀላል እንደ አንድ እና ሁለት",
      value1Desc: "ወጪዎን ይምሩ፣ ለግቦችዎ ያስቆጥሩ፣ ንብረትዎን በቀላሉ ያሳድጉ።",
      value2Title: "በማስተማሪ የተጎለበተ",
      value2Desc: "የ AI የተጎለበተ ምክሮች የተሻለ የገንዘብ ውሳኔ እንዲደርጉ ይረዷል።",
      value3Title: "የባንክ ደህንነት",
      value3Desc: "የሚስጢርዎ ከከፍታ ደህንነት ጋር ይጠበቃል።",
      statUsers: "ተጠቃሚ",
      statSaved: "ተቆጠበ",
      statRating: "ደረጃ",
      cultureTitle: "ለኢትዮጵያ የተሰራ",
      cultureDesc: "ለእቁብ፣ ለእድር፣ ለቤተሰብ በጀት እና ለኢትዮጵያ የገንዘብ አስተዳደር የተዘጋ።",
      btnGetStarted: "አሁን ጀምር",
      btnSignin: "ይግቡ",
      securityText: "የባንክ ደህንነት",
      onboardWelcomeTitle: "ወደ ሊቅ እንኳን ደህና መጡ!",
      onboardWelcomeDesc: "የገንዘብ መታመን ጉዞዎ ከእዚህ ይጀምራል።",
      featuresTitle: "ሊቅ ምን ያደርጋል?",
      feat1Title: "ወጪዎን ይምሩ",
      feat1Desc: "ገንዘብዎ የት እንደሚሄድ ያውቁ",
      feat2Title: "ቁጠባዎን ያሳድጉ",
      feat2Desc: "ለሚፈልጉት ነገር ያስቆጥሩ",
      feat3Title: "ከእቁብ እና እድር ጋር",
      feat3Desc: "የማህበረሰብ ቁጠባ ቀላል ተዘጋጅተዋል",
      goalsTitle: "የእርስዎ ግብ ምንድነው?",
      goalsDesc: "አንድ ወይም ብዙ ይምረጡ (አማማኝ)",
      goalsCount: "ተመርጠዋል",
      selectAll: "ሁሉንም ይምረጡ",
      detailsTitle: "ሙሉ ሆኖ ተዘጋጅተዋል!",
      detailsDesc: "ለመጀመሪያ ዝርዝሮችዎን ያስገቡ",
      labelFirstname: "ሙሉ ሥም",
      labelLastname: "የይለፍ ቃል",
      labelPhone: "ስልክ ቁጥር",
      phoneInfo: "ስልክዎ የሂሳብዎ ቁጥር ይሆናል። ሚስጢር ነው።",
      btnNext: "ቀጥል",
      btnBack: "ተመለስ",
      btnFinish: "ጀምር",
      phoneRequired: "ስልክ ቁጥር ያስገቡ",
      phoneInvalid: "ከ7 ወይም 9 ይጀምር",
      signinTitle: "ተመልሰው እንኳን ደህና መጡ",
      signinDesc: "ለመግባት ስልክዎን ያስገቡ",
      enterOtp: "ኮድ ያስገቡ",
      otpSent: "ኮድ ልከናል",
      didntReceive: "አልደረሰም?",
      resend: "እንደገና ላክ",
      verify: "አረጋግጥ",
      step: "ደረጃ",
      of: "ከ",
      btnResetPassword: "የይለፍ ቃል ቀይር",
      resetSent: "ጊዜያዊ የይለፍ ቃል በቴሌግራም ተልኮልዎታል።",
      backToSignin: "ወደ መግቢያ ተመለስ",
    }
  }

  const goals: Goal[] = [
    { id: 'budget', title: 'Budget Tracking', titleAm: 'የበጀት መምራት', desc: 'Know where your money goes', descAm: 'ገንዘብዎ የት እንደሚሄድ ያውቁ', iconType: 'chart' },
    { id: 'emergency', title: 'Emergency Fund', titleAm: 'የአደጋ ጊዜ ቁጠባ', desc: 'Prepare for the unexpected', descAm: 'ለማይተነፈስ ዝግጁ ይሁኑ', iconType: 'shield' },
    { id: 'debt', title: 'Debt Free', titleAm: 'ከብድር ነጻ', desc: 'Pay off loans faster', descAm: 'ብድርዎን በፍጥነት ክፈት', iconType: 'payments' },
    { id: 'purchase', title: 'Big Purchase', titleAm: 'ትልቅ ግዢ', desc: 'Save for a home, car, or wedding', descAm: 'ለቤት፣ ለመኪና ወይም ለሥጋወደሙ ያስቆጥሩ', iconType: 'home' },
    { id: 'exploring', title: 'Just Exploring', titleAm: 'ብቻዬን እጠይቃለሁ', desc: 'I want to look around first', descAm: 'አስቀድሜ መመርመር እፈልጋለሁ', iconType: 'visibility' },
    { id: 'other', title: 'Other', titleAm: 'ሌላ', desc: 'Create my own goal', descAm: 'የራሴን ግብ እፈጥራለሁ', iconType: 'edit' },
  ]

  const tt = t[language]

  useEffect(() => {
    if (signInStep === 1 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [signInStep, resendTimer])

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const allIds = goals.map(g => g.id).filter(id => id !== 'other')
    setSelectedGoals(selectedGoals.length === allIds.length ? [] : allIds)
  }

  const selectAllSelected = selectedGoals.length === goals.filter(g => g.id !== 'other').length

  const normalizePhoneInput = (p: string): string => {
    let clean = p.replace(/\D/g, "")
    if (clean.startsWith("0")) clean = clean.substring(1)
    if (clean.length > 9) clean = clean.slice(-9)
    return clean
  }

  const formatPhoneDisplay = (p: string): string => {
    const clean = normalizePhoneInput(p)
    if (clean.length <= 3) return clean
    if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`
  }

  const validatePhone = (p: string) => {
    const clean = normalizePhoneInput(p)
    // Ethiopian mobile numbers are 9 digits (after 0 or +251) and start with 7 or 9
    return /^[79]\d{8}$/.test(clean)
  }

  const handleStepChange = useCallback((newStep: number, direction: 'next' | 'prev') => {
    setSlideDirection(direction === 'next' ? 'left' : 'right')
    setIsAnimating(true)
    setTimeout(() => {
      setOnboardingStep(newStep)
      setIsAnimating(false)
      setSlideDirection(null)
    }, 200)
  }, [])

  const handleOnboardingNext = () => {
    if (onboardingStep === 0) {
      handleStepChange(1, 'next')
      return
    }
    if (onboardingStep === 1) {
      handleStepChange(2, 'next')
      return
    }
    if (onboardingStep === 2) {
      const cleanPhone = normalizePhoneInput(phone)
      if (!phone.trim()) {
        setPhoneError(tt.phoneRequired)
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      if (!validatePhone(cleanPhone)) {
        setPhoneError(tt.phoneInvalid)
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setPhoneError("")
      handleStepChange(3, 'next')
      return
    }
    if (onboardingStep === 3) {
      if (!fullName.trim()) {
        setOnboardingError(language === 'en' ? "Please enter your full name" : "ሙሉ ሥምዎን ያስገቡ")
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      if (password.length < 6) {
        setOnboardingError(language === 'en' ? "Password must be at least 6 characters" : "የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት")
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setOnboardingError("")
      const normalizedPhone = phone.replace(/[\s-]/g, "")
      const phoneWithPrefix = normalizedPhone.startsWith("0") ? normalizedPhone : "0" + normalizedPhone
      setUserPhone(phoneWithPrefix)
      setUserName(fullName)
      setUserPassword(password)
      const selectedGoalLabels = selectedGoals
        .map(id => goals.find(g => g.id === id))
        .filter(Boolean)
        .map(g => language === 'en' ? g!.title : g!.titleAm || g!.title)
      let finalGoals = selectedGoalLabels.join(", ")
      if (selectedGoals.includes('other') && otherGoal.trim()) {
        finalGoals = finalGoals ? `${finalGoals}, ${otherGoal}` : otherGoal
      }
      setUserGoal(finalGoals)
      setIsAnimating(true)
      setTimeout(() => {
        completeOnboarding()
        setPageState('completed')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }, 300)
    }
  }

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return
    if (direction === 'left' && onboardingStep < 3) {
      handleOnboardingNext()
    } else if (direction === 'right' && onboardingStep > 0) {
      handleStepChange(onboardingStep - 1, 'prev')
    }
  }, [isAnimating, onboardingStep, handleOnboardingNext, handleStepChange])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeThreshold = 50
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > swipeThreshold) {
      handleSwipe(diff > 0 ? 'left' : 'right')
    }
  }

  const startOnboarding = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setPageState('onboarding')
      setOnboardingStep(0)
      setIsAnimating(false)
    }, 200)
  }

  const startSignIn = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setPageState('signin')
      setSignInStep(0)
      setPhone("")
      setPhoneError("")
      setAuthError("")
      setResendTimer(30)
      setIsAnimating(false)
    }, 200)
  }

  const goBackToLanding = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setPageState('landing')
      setIsAnimating(false)
    }, 200)
  }

  const handleSignInNext = () => {
    if (signInStep === 0) {
      if (!phone.trim()) {
        setPhoneError(tt.phoneRequired)
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      if (!validatePhone(phone)) {
        setPhoneError(tt.phoneInvalid)
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setPhoneError("")
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setSignInStep(1)
        setResendTimer(30)
      }, 800)
    } else if (signInStep === 1) {
      if (password.length < 6) {
        setAuthError(language === 'en' ? "Password must be at least 6 characters" : "የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት")
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      setAuthError("")
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        completeOnboarding()
        setPageState('completed')
      }, 600)
    }
  }

  const handleResetPassword = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setResetSuccess(true)
    }, 1500)
  }

  const handleResendOtp = () => {
    if (resendTimer === 0) setResendTimer(30)
  }

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'chart': return <Icons.TrendingUp size={20} />
      case 'shield': return <Icons.Shield size={20} />
      case 'payments': return <Icons.CreditCard size={20} />
      case 'home': return <Icons.Home size={20} />
      case 'visibility': return <Icons.Eye size={20} />
      case 'edit': return <Icons.Edit size={20} />
      default: return <Icons.Star size={20} />
    }
  }

  return (
    <div className="h-screen w-full bg-parchment flex flex-col overflow-hidden font-body" style={{
      WebkitOverflowScrolling: 'touch'
    }}>

      {/* Landing Page */}
      {pageState === 'landing' && (
        <div className="flex-1 flex flex-col relative">

          {/* Header */}
          <header className="flex items-center justify-between px-5 pt-12 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ethiopic-green flex items-center justify-center">
                <Icons.Wallet size={22} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-coffee-brown font-display">Liq.</span>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ethiopic-green text-white text-xs font-semibold active:opacity-80 transition-opacity"
            >
              <span>{language === 'en' ? '🇪🇹' : '🇺🇸'}</span>
              <span>{language === 'en' ? 'EN' : 'አማ'}</span>
            </button>
          </header>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto px-5 pb-32">

            {/* Hero */}
            <div className="text-center pt-6 pb-6">
              <h1 className="text-5xl font-bold text-coffee-brown leading-tight font-display">
                {tt.heroGreeting}
              </h1>
              <p className="mt-4 text-lg text-landing-secondary leading-relaxed px-2">
                {tt.heroSubtitle}
              </p>
            </div>

            {/* Value Props */}
            <div className="space-y-3">
              {[
                { icon: Icons.Zap, title: tt.value1Title, desc: tt.value1Desc, color: '[#1B4D3E]' },
                { icon: Icons.AI, title: tt.value2Title, desc: tt.value2Desc, color: '[#C5A059]' },
                { icon: Icons.Shield, title: tt.value3Title, desc: tt.value3Desc, color: '[#1B4D3E]' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}>
                    <feature.icon size={24} className={`text-${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-brown text-base">{feature.title}</h3>
                    <p className="text-landing-secondary text-sm mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 py-6 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-bold text-ethiopic-green">{tt.statUsers}</div>
                <div className="text-xs text-landing-secondary uppercase tracking-wider">50K+</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">{tt.statSaved}</div>
                <div className="text-xs text-landing-secondary uppercase tracking-wider">2B+</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ethiopic-green">{tt.statRating}</div>
                <div className="text-xs text-landing-secondary uppercase tracking-wider">4.9★</div>
              </div>
            </div>

            {/* Cultural Note */}
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Heart size={16} className="text-ethiopic-green" />
                <span className="font-semibold text-ethiopic-green">{tt.cultureTitle}</span>
              </div>
              <p className="text-landing-secondary text-sm leading-relaxed">
                {tt.cultureDesc}
              </p>
            </div>

          </main>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4 bg-white border-t border-gray-200">
            <div className="max-w-lg mx-auto space-y-2.5">
              <button
                onClick={startOnboarding}
                className="w-full h-14 rounded-2xl bg-ethiopic-green text-white font-semibold text-base flex items-center justify-center gap-2 active:bg-ethiopian-green-light active:scale-[0.98] transition-all"
              >
                <Icons.Plus size={18} />
                {tt.btnGetStarted}
              </button>
              <button
                onClick={startSignIn}
                className="w-full h-12 rounded-2xl border border-ethiopic-green/30 text-coffee-brown font-medium text-base flex items-center justify-center active:bg-ethiopic-green/5 active:scale-[0.98] transition-all"
              >
                {tt.btnSignin}
              </button>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Icons.Shield size={13} className="text-ethiopic-green" />
                <span className="text-xs text-landing-secondary">{tt.securityText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding */}
      {pageState === 'onboarding' && (
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`fixed inset-0 z-50 bg-parchment flex flex-col transition-all duration-200 ease-out ${isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-3" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div className="flex-1"></div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-ethiopic-green text-white text-xs font-bold active:scale-95 transition-transform"
            >
              <span>{language === 'en' ? '🇪🇹' : '🇺🇸'}</span>
              <span>{language === 'en' ? 'EN' : 'አማ'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ethiopic-green">{tt.step} {onboardingStep + 1} {tt.of} 4</span>
              <span className="text-sm font-semibold text-gold">{Math.round((onboardingStep + 1) / 4 * 100)}%</span>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= onboardingStep ? 'bg-ethiopic-green' : 'bg-gray-200'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 pb-24">

            {onboardingStep === 0 && (
              <div className="space-y-6">
                <div className="text-center pt-4 space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-ethiopic-green flex items-center justify-center">
                    <Icons.User size={36} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-coffee-brown font-display">
                    {tt.onboardWelcomeTitle}
                  </h2>
                  <p className="text-landing-secondary text-base px-4">
                    {tt.onboardWelcomeDesc}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Icons.TrendingUp, title: tt.feat1Title, desc: tt.feat1Desc },
                    { icon: Icons.PiggyBank, title: tt.feat2Title, desc: tt.feat2Desc },
                    { icon: Icons.Users, title: tt.feat3Title, desc: tt.feat3Desc },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
                      <div className="w-12 h-12 rounded-xl bg-ethiopic-green/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon size={22} className="text-ethiopic-green" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-coffee-brown text-base">{feature.title}</div>
                        <div className="text-landing-secondary text-sm">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-coffee-brown font-display">
                    {tt.goalsTitle}
                  </h2>
                  <p className="text-landing-secondary mt-2 text-sm">{tt.goalsDesc}</p>
                </div>

                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm font-medium text-ethiopic-green flex items-center gap-1.5"
                  >
                    <Icons.Check size={14} />
                    {selectAllSelected ? "Deselect All" : tt.selectAll}
                  </button>
                  {selectedGoals.length > 0 && (
                    <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full">
                      {selectedGoals.length} {tt.goalsCount}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {goals.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id)
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                          ? "border-ethiopic-green bg-ethiopic-green/5"
                          : "border-gray-200 hover:border-ethiopic-green/30 bg-white"
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-ethiopic-green" : goal.id === 'emergency' || goal.id === 'purchase' ? "bg-gold/10" : "bg-ethiopic-green/10"
                          }`}>
                          <span className={isSelected ? "text-white" : goal.id === 'emergency' || goal.id === 'purchase' ? "text-gold" : "text-ethiopic-green"}>
                            {getIcon(goal.iconType)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-coffee-brown">
                            {language === 'en' ? goal.title : goal.titleAm}
                          </div>
                          <div className="text-landing-secondary text-sm">
                            {language === 'en' ? goal.desc : goal.descAm}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-ethiopic-green bg-ethiopic-green" : "border-gray-300"
                          }`}>
                          {isSelected && <Icons.Check size={12} className="text-white" />}
                        </div>
                      </button>
                    )
                  })}

                  {selectedGoals.includes('other') && (
                    <input
                      type="text"
                      value={otherGoal}
                      onChange={(e) => setOtherGoal(e.target.value)}
                      placeholder={language === 'en' ? "Type your goal here..." : "ግብዎን እዚህ ይጻፉ..."}
                      className="w-full h-12 px-4 rounded-xl bg-white border-2 border-ethiopic-green focus:border-ethiopic-green outline-none text-coffee-brown placeholder-landing-secondary"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-5">
                <div className="text-center pt-2">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-ethiopic-green flex items-center justify-center">
                    <Icons.Phone size={28} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-coffee-brown mt-4 font-display">
                    {tt.labelPhone}
                  </h2>
                  <p className="text-landing-secondary mt-2 text-sm">{tt.phoneInfo}</p>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-coffee-brown mb-2">{tt.labelPhone}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-landing-secondary">+251</span>
                    <input
                      type="tel"
                      value={formatPhoneDisplay(phone)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "")
                        const clean = raw.startsWith("0") ? raw.substring(1) : raw

                        // Only allow if it starts with 7 or 9 (or is empty)
                        if (clean.length > 0 && !/^[79]/.test(clean)) {
                          return
                        }

                        setPhone(clean.slice(0, 9))
                        setPhoneError("")
                      }}
                      placeholder="91 234 5678"
                      className={`w-full h-12 pl-16 pr-4 rounded-xl ${phoneError ? "border-red-500" : "border-gray-200"
                        } border-2 focus:border-ethiopic-green bg-white outline-none text-coffee-brown placeholder-landing-secondary transition-colors`}
                      autoFocus
                    />
                  </div>
                  {phoneError && (
                    <p className="text-red-500 text-xs font-medium mt-2">{phoneError}</p>
                  )}
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-5">
                <div className="text-center pt-2">
                  {fullName ? (
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-ethiopic-green flex items-center justify-center">
                      <Icons.User size={28} className="text-white" />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-coffee-brown mt-4 font-display">
                    {tt.detailsTitle}
                  </h2>
                  <p className="text-landing-secondary mt-2 text-sm">{tt.detailsDesc}</p>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-coffee-brown mb-2">{tt.labelFirstname}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        setOnboardingError("")
                      }}
                      placeholder="e.g., Abebe Birhanu"
                      className={`w-full h-12 px-4 rounded-xl border-2 ${onboardingError && !fullName ? "border-red-500" : "border-gray-200"} focus:border-ethiopic-green bg-white outline-none text-coffee-brown placeholder-landing-secondary`}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-brown mb-2">{tt.labelLastname}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setOnboardingError("")
                      }}
                      placeholder="••••••"
                      className={`w-full h-12 px-4 rounded-xl border-2 ${onboardingError && password.length < 6 ? "border-red-500" : "border-gray-200"} focus:border-ethiopic-green bg-white outline-none text-coffee-brown placeholder-landing-secondary`}
                    />
                    {onboardingError && (
                      <p className="text-red-500 text-xs font-medium mt-2">{onboardingError}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-ethiopic-green/5 rounded-xl border border-ethiopic-green/10">
                  <div className="flex items-start gap-2">
                    <Icons.Info size={16} className="text-ethiopic-green mt-0.5" />
                    <p className="text-landing-secondary text-sm leading-relaxed">{tt.phoneInfo}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-gray-200">
            <div className="max-w-lg mx-auto flex gap-3">
              <button
                onClick={() => {
                  if (onboardingStep > 0) {
                    handleStepChange(onboardingStep - 1, 'prev')
                  } else {
                    goBackToLanding()
                  }
                }}
                className="flex-1 h-14 rounded-2xl border-2 border-gray-200 text-coffee-brown font-semibold text-base flex items-center justify-center gap-2 active:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <Icons.ArrowLeft size={18} />
                {tt.btnBack}
              </button>
              <button
                onClick={handleOnboardingNext}
                className="flex-[2] h-14 rounded-2xl bg-ethiopic-green text-white font-semibold text-base flex items-center justify-center gap-2 active:bg-ethiopian-green-light active:scale-[0.98] transition-all"
              >
                {onboardingStep === 3 ? (
                  <>
                    <Icons.Check size={18} />
                    {tt.btnFinish}
                  </>
                ) : (
                  <>
                    {tt.btnNext}
                    <Icons.ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign In */}
      {pageState === 'signin' && (
        <div className={`fixed inset-0 z-50 bg-parchment flex flex-col transition-all duration-200 ease-out ${isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>

          <div className="flex items-center justify-between px-5 pt-6 pb-3" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div className="flex-1"></div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-ethiopic-green text-white text-xs font-bold active:scale-95 transition-transform"
            >
              <span>{language === 'en' ? '🇪🇹' : '🇺🇸'}</span>
              <span>{language === 'en' ? 'EN' : 'አማ'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4" style={{ scrollbarWidth: 'none', maxWidth: '640px', margin: '0 auto', width: '100%' }}>

            {signInStep === 0 && (
              <div className="space-y-8 pt-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-ethiopic-green flex items-center justify-center">
                    <Icons.Lock size={36} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-coffee-brown mt-6 font-display tracking-tight">
                    {tt.signinTitle}
                  </h2>
                  <p className="text-landing-secondary mt-3 text-base leading-relaxed">{tt.signinDesc}</p>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-coffee-brown mb-2">{tt.labelPhone}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-landing-secondary">+251</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "")
                        const clean = raw.startsWith("0") ? raw.substring(1) : raw

                        // Only allow if it starts with 7 or 9 (or is empty)
                        if (clean.length > 0 && !/^[79]/.test(clean)) {
                          return
                        }

                        setPhone(clean.slice(0, 9))
                        setPhoneError("")
                      }}
                      placeholder="91 234 5678"
                      className={`w-full h-12 pl-16 pr-4 rounded-xl ${phoneError ? "border-red-500" : "border-gray-200"
                        } border-2 focus:border-ethiopic-green bg-white outline-none text-coffee-brown placeholder-landing-secondary transition-colors`}
                      autoFocus
                    />
                  </div>
                  {phoneError && (
                    <p className="text-red-500 text-xs font-medium mt-2">{phoneError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (signInStep > 0) {
                        setSignInStep(signInStep - 1)
                      } else {
                        goBackToLanding()
                      }
                    }}
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-coffee-brown font-semibold text-sm active:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icons.ArrowLeft size={18} />
                    {tt.btnBack}
                  </button>
                  <button
                    onClick={handleSignInNext}
                    disabled={isLoading}
                    className="flex-[2] h-12 rounded-xl bg-ethiopic-green text-white font-semibold text-sm active:bg-ethiopian-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Icons.Loader size={20} className="animate-spin" />
                    ) : (
                      <>
                        {tt.btnNext}
                        <Icons.ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {signInStep === 1 && (
              <div className="space-y-8 pt-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-ethiopic-green flex items-center justify-center">
                    <Icons.Lock size={36} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-coffee-brown mt-6 font-display tracking-tight">
                    {resetSuccess ? tt.btnResetPassword : tt.signinTitle}
                  </h2>
                  <p className="text-landing-secondary mt-3 text-base leading-relaxed">
                    {resetSuccess ? tt.resetSent : tt.signinDesc}
                  </p>
                </div>

                {!resetSuccess ? (
                  <>
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-coffee-brown mb-2">{tt.labelLastname}</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setAuthError("") }}
                        placeholder="••••••"
                        className={`w-full h-12 px-4 rounded-xl border-2 ${authError ? "border-red-500" : "border-gray-200"} focus:border-ethiopic-green bg-white outline-none text-coffee-brown placeholder-landing-secondary transition-colors`}
                        autoFocus
                      />
                      {authError && (
                        <p className="text-red-500 text-xs font-medium mt-2">{authError}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSignInStep(0)}
                        className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-coffee-brown font-semibold text-sm active:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Icons.ArrowLeft size={18} />
                        {tt.btnBack}
                      </button>
                      <button
                        onClick={handleSignInNext}
                        disabled={isLoading || password.length < 6}
                        className="flex-[2] h-12 rounded-xl bg-ethiopic-green text-white font-semibold text-sm active:bg-ethiopian-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Icons.Loader size={20} className="animate-spin" />
                        ) : (
                          <>
                            <Icons.Check size={18} />
                            {tt.btnSignin}
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={handleResetPassword}
                        disabled={isLoading}
                        className="text-ethiopic-green font-bold text-sm hover:text-ethiopian-green-light active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
                      >
                        <Icons.Help size={16} />
                        {tt.btnResetPassword}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setResetSuccess(false)
                        setSignInStep(0)
                      }}
                      className="h-12 px-8 rounded-xl bg-ethiopic-green text-white font-semibold text-sm active:bg-ethiopian-green-light transition-colors flex items-center justify-center gap-2"
                    >
                      {tt.backToSignin}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Completed */}
      {pageState === 'completed' && (
        <div className="fixed inset-0 z-50 bg-ethiopic-green flex items-center justify-center overflow-hidden">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => {
                const left = Math.random() * 100
                const delay = Math.random() * 2
                const colors = ['#1B4D3E', '#C5A059', '#2C2416', '#6B5D4D', '#D4B86A']
                const color = colors[Math.floor(Math.random() * colors.length)]
                const size = Math.random() * 8 + 4
                return (
                  <div
                    key={i}
                    className="absolute animate-fall"
                    style={{
                      left: `${left}%`,
                      top: '-20px',
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: color,
                      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                      animationDelay: `${delay}s`,
                      animationDuration: `${Math.random() * 2 + 2}s`
                    }}
                  />
                )
              })}
            </div>
          )}
          <div className="text-center text-white px-6 animate-fade-in relative z-10">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center">
              <Icons.Check size={48} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold mt-6 font-display">
              {language === 'en' ? 'Welcome to Liq.! 🚀' : 'ወደ ሊቅ እንኳን ደህና መጡ! 🚀'}
            </h1>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-fall {
          animation: fall 3s linear forwards;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
