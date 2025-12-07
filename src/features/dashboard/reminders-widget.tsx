"use client"

import { useState } from "react"
import { Icons } from "./Icons"
import { useAppContext } from "@/context/AppContext"
import { useReminders } from "@/hooks/use-reminders"

export function RemindersWidget() {
  const { state, showNotification, navigateTo } = useAppContext()
  const { reminders } = useReminders(state, showNotification)
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter to show most important reminders
  const importantReminders = reminders
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
    .slice(0, isExpanded ? 10 : 3)

  if (importantReminders.length === 0) {
    return null
  }

  const criticalCount = reminders.filter((r) => r.urgency === "critical").length
  const highCount = reminders.filter((r) => r.urgency === "high").length

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          icon: "text-rose-500",
          dot: "bg-rose-500",
        }
      case "high":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          icon: "text-amber-500",
          dot: "bg-amber-500",
        }
      case "medium":
        return {
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          icon: "text-cyan-500",
          dot: "bg-cyan-500",
        }
      default:
        return {
          bg: "bg-gray-500/10",
          border: "border-gray-500/30",
          icon: "text-gray-400",
          dot: "bg-gray-400",
        }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "iddir":
        return Icons.Iddir
      case "iqub":
        return Icons.Users
      case "budget":
        return Icons.Budget
      case "goal":
        return Icons.Target
      case "bill":
        return Icons.Zap
      case "payday":
        return Icons.CreditCard
      case "insight":
        return Icons.AI
      default:
        return Icons.Alert
    }
  }

  const handleReminderClick = (reminder: (typeof importantReminders)[0]) => {
    switch (reminder.type) {
      case "iddir":
      case "iqub":
      case "goal":
        navigateTo("goals", null, null)
        break
      case "budget":
        navigateTo("budget", null, null)
        break
      case "bill":
        navigateTo("budget", null, null)
        break
      default:
        break
    }
  }

  return (
    <div className="mb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icons.Bell size={18} className="text-cyan-400" />
            {(criticalCount > 0 || highCount > 0) && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wider">Reminders</h3>
          {reminders.length > 3 && (
            <span className="text-[10px] bg-theme-card px-2 py-0.5 rounded-full text-theme-secondary">
              {reminders.length}
            </span>
          )}
        </div>
        {reminders.length > 3 && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-cyan-400 hover:text-cyan-300">
            {isExpanded ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      {/* Reminder Cards */}
      <div className="space-y-2">
        {importantReminders.map((reminder) => {
          const styles = getUrgencyStyles(reminder.urgency)
          const IconComponent = getTypeIcon(reminder.type)

          return (
            <button
              key={reminder.id}
              onClick={() => handleReminderClick(reminder)}
              className={`w-full p-3 rounded-2xl ${styles.bg} border ${styles.border} flex items-start gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
            >
              <div className={`w-8 h-8 rounded-full ${styles.bg} flex items-center justify-center shrink-0`}>
                <IconComponent size={16} className={styles.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                  <span className="text-xs font-bold text-theme-primary truncate">{reminder.title}</span>
                </div>
                <p className="text-xs text-theme-secondary line-clamp-2">{reminder.message}</p>
              </div>
              <Icons.ChevronRight size={14} className="text-theme-secondary shrink-0 mt-2" />
            </button>
          )
        })}
      </div>

      {/* Summary Footer */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="mt-3 px-3 py-2 bg-theme-card rounded-xl border border-theme">
          <p className="text-[10px] text-theme-secondary text-center">
            {criticalCount > 0 && <span className="text-rose-400 font-bold">{criticalCount} urgent</span>}
            {criticalCount > 0 && highCount > 0 && " · "}
            {highCount > 0 && <span className="text-amber-400 font-bold">{highCount} important</span>}
            {" items need your attention"}
          </p>
        </div>
      )}
    </div>
  )
}
