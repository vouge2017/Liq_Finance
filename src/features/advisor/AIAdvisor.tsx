"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import { useConsent } from "@/hooks/useConsent"
import { buildCulturalFinancialContext, buildCulturalFinancialContext as buildContext } from "@/lib/ai-service"
import { Lock, Sparkles, Send } from "lucide-react"
import { AIOnboardingModal } from "./AIOnboardingModal"

// Type guard to safely extract message content (handles SDK version differences)
function getMessageContent(msg: UIMessage): string {
  // @ai-sdk/react message structure varies - use type-safe access
  const msgAny = msg as unknown as { content?: string | object }
  if (msgAny.content !== undefined) {
    return typeof msgAny.content === 'string'
      ? msgAny.content
      : JSON.stringify(msgAny.content)
  }
  return ''
}

// Type guard to check for spending pattern in message
function hasSpendingPattern(msg: UIMessage): boolean {
  const content = getMessageContent(msg)
  return content.includes("15% less") || content.includes("expenses are 90%")
}

export const AIAdvisor: React.FC = () => {
  const { state, activeProfile, setActiveTab } = useAppContext()
  const { hasConsent, loading: consentLoading } = useConsent()

  // Initial greeting based on financial health
  const getInitialGreeting = () => {
    const activeSubs = state.recurringTransactions.filter((r) => r.is_active)
    if (activeSubs.length > 0) {
      const sub = activeSubs[0]
      return `Hello! I was reviewing your recurring bills. You are paying ${sub.amount} ETB for '${sub.name}' monthly. Are you still using this service regularly?`
    }

    const income = state.totalIncome
    const expense = state.totalExpense
    const ratio = expense / (income || 1)

    if (ratio > 0.9)
      return "Warning: I noticed your expenses are 90% of your income this month. We need to talk about cutting costs immediately."
    if (state.savingsGoals.length === 0)
      return "Hello! I see you have income coming in, but no defined Savings Goals. Shall we set one up today?"
    return "Hello! Your finances are looking active. I'm ready to review your recent Iqub payments or budget status. What's on your mind?"
  }

  // Check AI consent using the consent service
  const hasAIConsent = hasConsent('ai_advisor')
  const financialContext = hasAIConsent ? buildContext(state, activeProfile) : undefined

  const {
    messages,
    sendMessage,
    status,
    error: chatError,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { context: financialContext },
    }),
    initialMessages: [
      {
        id: "greeting",
        role: "assistant",
        content: getInitialGreeting(),
      } as any,
    ],
  } as any)

  const [input, setInput] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('liq_ai_onboarding_seen')
    if (!hasSeenOnboarding && hasAIConsent) {
      setShowOnboarding(true)
    }
  }, [hasAIConsent])

  const handleOnboardingComplete = () => {
    localStorage.setItem('liq_ai_onboarding_seen', 'true')
    setShowOnboarding(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, hasAIConsent, chatError])

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input
    if (!textToSend.trim()) return

    setInput("")
    sendMessage({ content: textToSend } as any)
  }

  const isLoading = status === "streaming" || status === "submitted"
  const hasError = !!chatError

  // CONSENT SCREEN UI
  if (!hasAIConsent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in relative overflow-hidden bg-[#f6f6f8] dark:bg-[#101622]">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/30 shadow-glow relative z-10">
          <Icons.AI className="text-primary" size={48} />
        </div>

        <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white relative z-10 tracking-tight">Activate Financial Coach</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 leading-relaxed max-w-xs mx-auto relative z-10 font-medium">
          I analyze your <span className="text-primary font-bold">Spending Patterns</span> and{" "}
          <span className="text-rose-500 font-bold">Goals</span> to give you disciplined, high-end advice.
        </p>

        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/10 w-full mb-8 text-left space-y-6 relative z-10 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">Proactive Insights</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">I'll tell you when you're off track before you ask.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Lock className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">Private & Secure</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your data never leaves the secure processing context.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            alert("Please go to Settings > Privacy to enable AI Advisor.");
          }}
          className="w-full py-4 bg-primary rounded-[1.5rem] text-white font-bold text-lg shadow-glow hover:bg-primary-dark active:scale-95 transition-all relative z-10"
        >
          Enable Access
        </button>

        {consentLoading && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-primary font-bold">Checking consent status...</p>
          </div>
        )}
      </div>
    )
  }

  // CHAT UI
  return (
    <div className="fixed inset-0 z-[60] bg-[#f6f6f8] dark:bg-[#101622] flex flex-col animate-fade-in">
      {/* Immersive Header */}
      {showOnboarding && <AIOnboardingModal onComplete={handleOnboardingComplete} />}
      <div className="px-6 pt-6 pb-4 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-xl flex justify-between items-center z-10 border-b border-white/20 dark:border-white/5 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm border border-white/20 dark:border-white/5 active:scale-90 transition-all"
          >
            <Icons.ArrowLeft size={20} className="text-gray-900 dark:text-white" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 dark:border-white/10 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white">
                <Icons.AI size={20} />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#f6f6f8] dark:border-[#101622]"></div>
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">Liq Advisor</h2>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Online</span>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-white/20 dark:border-white/5 text-gray-400 active:scale-90 transition-all">
          <Icons.MoreHorizontal size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-6" style={{ paddingBottom: 'calc(10rem + env(safe-area-inset-bottom))' }}>
        <div className="text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200 dark:bg-white/5 px-3 py-1 rounded-full">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-slide-up`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Icons.AI size={16} />
              </div>
            )}
            <div className="flex flex-col gap-1 max-w-[85%]">
              <div
                className={`rounded-[2rem] p-5 shadow-sm ${msg.role === "user"
                  ? "bg-primary text-white rounded-tr-none shadow-glow"
                  : "bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-white/20 dark:border-white/5 rounded-tl-none"
                  }`}
              >
                <div className="text-[14px] leading-relaxed font-medium">
                  {getMessageContent(msg)}
                </div>
              </div>
              {msg.role === "user" && (
                <span className="text-[10px] text-gray-400 font-bold text-right mr-2">Read</span>
              )}

              {/* Demo: Weekly Spending Card inside Assistant Message */}
              {msg.role === "assistant" && hasSpendingPattern(msg) && (
                <div className="mt-3 bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-white/20 dark:border-white/5 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Spending</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">4,200 <span className="text-xs text-gray-400 font-bold">ETB</span></p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Icons.ArrowDownRight size={20} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              <Icons.AI size={16} />
            </div>
            <div className="flex space-x-1.5 bg-white dark:bg-white/5 px-5 py-4 rounded-[2rem] rounded-tl-none border border-white/20 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {!isLoading && !hasError && messages.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-2 justify-center">
            <button onClick={() => handleSend("Check my balance")} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-white/20 dark:border-white/10 px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/30 shadow-sm transition-all active:scale-95">
              <Icons.Wallet size={14} className="text-primary" /> Check Balance
            </button>
            <button onClick={() => handleSend("I want to make a transfer")} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-white/20 dark:border-white/10 px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/30 shadow-sm transition-all active:scale-95">
              <Icons.Transfer size={14} className="text-cyan-500" /> Transfer
            </button>
            <button onClick={() => handleSend("Give me some saving tips")} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-white/20 dark:border-white/10 px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/30 shadow-sm transition-all active:scale-95">
              <Icons.Zap size={14} className="text-orange-500" /> Tips
            </button>
          </div>
        )}

        <div ref={messagesEndRef} className="h-20" />
      </div>

      {/* Immersive Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f6f6f8] via-[#f6f6f8] to-transparent dark:from-[#101622] dark:via-[#101622] z-[60] pb-safe">
        {/* Voice Waveform */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-1 h-8">
            {[0.2, 0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.3, 0.7, 0.4, 0.2].map((h, i) => (
              <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Tap to speak</span>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-surface-dark rounded-[32px] p-2 pl-5 border border-white/20 dark:border-white/10 shadow-xl shadow-black/5">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask Liq..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white text-[14px] outline-none placeholder-gray-400 resize-none py-3 max-h-32 font-medium"
            style={{ minHeight: '44px' }}
          />
          <button className="p-2 text-gray-400 hover:text-primary transition-all">
            <Icons.Paperclip size={20} />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition transform active:scale-90 shadow-glow"
          >
            {input.trim() ? <Send size={20} /> : <Icons.Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
