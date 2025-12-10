"use client"

import type React from "react"
import { useState } from "react"
import { Icons } from "./Icons"
import { createClient } from "@/lib/supabase/client"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackType = "bug" | "feature" | "general"

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<FeedbackType>("general")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const feedbackTypes: { id: FeedbackType; label: string; icon: React.ElementType; color: string }[] = [
    { id: "bug", label: "Bug Report", icon: Icons.Alert, color: "rose" },
    { id: "feature", label: "Feature Request", icon: Icons.Sparkles, color: "purple" },
    { id: "general", label: "General Feedback", icon: Icons.Heart, color: "cyan" },
  ]

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if Supabase is available
      if (!supabase) {
        setError("Feedback submission unavailable in offline mode. Please try again later.")
        setIsSubmitting(false)
        return
      }

      // Get current user (optional - feedback can be anonymous)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Collect device info for bug reports
      const deviceInfo =
        type === "bug"
          ? {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString(),
          }
          : null

      const { error: insertError } = await supabase.from("feedback").insert({
        user_id: user?.id || null,
        type,
        title: title.trim(),
        description: description.trim() || null,
        device_info: deviceInfo,
        status: "new",
      })

      if (insertError) throw insertError

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        // Reset form
        setType("general")
        setTitle("")
        setDescription("")
      }, 2000)
    } catch (err) {
      console.error("Feedback submission error:", err)
      setError("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up border border-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-bounce">
              <Icons.CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-emerald-500">Thank You!</h3>
            <p className="text-gray-400 text-sm">Your feedback has been submitted.</p>
          </div>
        )}

        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Send Feedback</h2>
            <p className="text-gray-400 text-sm">Help us improve Liq</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Feedback Type Selection */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {feedbackTypes.map((ft) => {
            const Icon = ft.icon
            const isSelected = type === ft.id
            return (
              <button
                key={ft.id}
                onClick={() => setType(ft.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${isSelected
                  ? `bg-${ft.color}-500/10 border-${ft.color}-500 text-${ft.color}-400`
                  : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wide">{ft.label}</span>
              </button>
            )
          })}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "bug"
                  ? "What went wrong?"
                  : type === "feature"
                    ? "What feature would you like?"
                    : "Share your thoughts..."
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Description <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === "bug" ? "Steps to reproduce, expected vs actual behavior..." : "Provide more details..."
              }
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {type === "bug" && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
              <Icons.Alert size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-500/90">
                Device info will be automatically included to help us debug the issue.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2">
              <Icons.Alert size={16} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          className="w-full mt-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Icons.Send size={18} />
              Submit Feedback
            </>
          )}
        </button>
      </div>
    </div>
  )
}
