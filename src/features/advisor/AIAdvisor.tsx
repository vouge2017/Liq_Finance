"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat, type UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import { buildFinancialContext } from "@/lib/ai-service"
import { Lock, Sparkles, Send } from "lucide-react"

export const AIAdvisor: React.FC = () => {
  const { state, aiConsent, setAiConsent, activeProfile } = useAppContext()

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

  // Build context for AI
  const financialContext = aiConsent ? buildFinancialContext(state, activeProfile) : undefined

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
        parts: [{ type: "text", text: getInitialGreeting() }],
      } as any,
    ],
  })

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, aiConsent, chatError])

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input
    if (!textToSend.trim()) return

    setInput("")
    sendMessage({ content: textToSend } as any)
  }



  const QuickPrompt = ({
    text,
    icon: Icon,
  }: {
    text: string
    icon: React.ElementType
  }) => (
    <button
      onClick={() => handleSend(text)}
      className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full text-xs font-medium text-gray-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all whitespace-nowrap"
    >
      <Icon size={14} />
      {text}
    </button>
  )

  const isLoading = status === "streaming" || status === "submitted"
  const hasError = !!chatError

  // CONSENT SCREEN UI
  if (!aiConsent) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] p-6 text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative z-10">
          <Icons.AI className="text-cyan-400" size={48} />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-white relative z-10">Activate Financial Coach</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto relative z-10">
          I&apos;m not just a chatbot. I analyze your <span className="text-cyan-400">Spending Patterns</span> and{" "}
          <span className="text-pink-500">Goals</span> to give you disciplined, high-end advice.
        </p>

        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-3xl border border-gray-800 w-full mb-8 text-left space-y-4 relative z-10">
          <div className="flex gap-3 items-start">
            <Sparkles className="text-yellow-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-white">Proactive Insights</p>
              <p className="text-xs text-gray-400">I&apos;ll tell you when you&apos;re off track before you ask.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Lock className="text-emerald-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-white">Private & Secure</p>
              <p className="text-xs text-gray-400">Your data never leaves the secure processing context.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAiConsent(true)}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all relative z-10"
        >
          Authorize Access
        </button>
      </div>
    )
  }

  // CHAT UI
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative">
      {/* Header / Context Indicator */}
      <div className="absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-10 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Analyzing {activeProfile} Data
          </span>
        </div>
        <button onClick={() => setAiConsent(false)} className="text-[10px] text-gray-500 hover:text-rose-500">
          Reset Access
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pt-10 space-y-6">
        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mr-2 mt-2 shadow-lg shadow-cyan-500/20">
                <Icons.AI size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === "user"
                ? "bg-gray-800 border border-gray-700 text-white rounded-tr-none"
                : "bg-gray-900 text-gray-100 border border-gray-800 rounded-tl-none"
                }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {(msg as any).parts?.map((part: any, i: number) => {
                  if (part.type === "text") {
                    return part.text.split("\n").map((line: string, j: number) => (
                      <span key={`${i}-${j}`} className="block mb-1">
                        {line}
                      </span>
                    ))
                  }
                  return null
                }) ||
                  (msg as any).content?.split("\n").map((line: string, i: number) => (
                    <span key={i} className="block mb-1">
                      {line}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ))}

        {/* Error State */}
        {hasError && (
          <div className="w-full flex justify-center animate-bounce mt-4">
            <div
              className="flex items-center gap-3 bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-rose-500/30 border-2 border-rose-400"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Icons.Alert size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Connection Failed</p>
                <p className="text-[10px] opacity-90 font-medium">Please try again later</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <Icons.AI size={16} className="text-gray-400" />
            </div>
            <div className="flex space-x-1 bg-gray-900 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-800">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      {!isLoading && !hasError && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          <QuickPrompt text="Analyze my spending" icon={Icons.Budget} />
          <QuickPrompt text="Manage subscriptions" icon={Icons.Recurring} />
          <QuickPrompt text="Review my Iqub" icon={Icons.Users} />
          <QuickPrompt text="Am I over budget?" icon={Icons.Alert} />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-black/95 backdrop-blur-md border-t border-gray-800 sticky bottom-0 z-20">
        <div className="flex items-end gap-2 bg-gray-900 rounded-3xl p-2 pl-4 border border-gray-800 focus-within:border-cyan-500/50 transition-colors shadow-lg">
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
            placeholder="Ask your advisor..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 resize-none py-3 max-h-32"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 transition transform active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
