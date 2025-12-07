"use client"

import { useEffect, useCallback, useRef } from "react"
import type { AppState } from "@/types"

interface ReminderConfig {
  enabled: boolean
  checkInterval: number // in milliseconds
}

interface Reminder {
  id: string
  type: "iddir" | "iqub" | "budget" | "goal" | "bill" | "payday" | "insight"
  title: string
  message: string
  urgency: "low" | "medium" | "high" | "critical"
  actionLabel?: string
  onAction?: () => void
}

export function useReminders(
  state: AppState,
  showNotification: (message: string, type: "success" | "error" | "info") => void,
  config: ReminderConfig = { enabled: true, checkInterval: 1000 * 60 * 30 }, // 30 minutes
) {
  const lastCheckRef = useRef<string | null>(null)
  const notifiedRef = useRef<Set<string>>(new Set())

  const generateReminders = useCallback((): Reminder[] => {
    const reminders: Reminder[] = []
    const today = new Date()
    const dayOfMonth = today.getDate()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    // Check Iddir payments
    state.iddirs
      .filter((i) => i.status === "active" && i.reminderEnabled)
      .forEach((iddir) => {
        const dueDay = iddir.paymentDate
        const reminderDays = iddir.reminderDaysBefore || 3
        const daysUntilDue = dueDay >= dayOfMonth ? dueDay - dayOfMonth : daysInMonth - dayOfMonth + dueDay

        if (daysUntilDue <= reminderDays && daysUntilDue >= 0) {
          const isOverdue =
            iddir.lastPaidDate &&
            new Date(iddir.lastPaidDate).getMonth() === today.getMonth() &&
            new Date(iddir.lastPaidDate).getFullYear() === today.getFullYear()

          if (!isOverdue) {
            reminders.push({
              id: `iddir-${iddir.id}-${today.toDateString()}`,
              type: "iddir",
              title: "Iddir Payment Due",
              message:
                daysUntilDue === 0
                  ? `${iddir.name} payment of ${iddir.monthlyContribution.toLocaleString()} ETB is due TODAY!`
                  : `${iddir.name} payment of ${iddir.monthlyContribution.toLocaleString()} ETB due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`,
              urgency: daysUntilDue === 0 ? "critical" : daysUntilDue <= 1 ? "high" : "medium",
            })
          }
        }
      })

    // Check Iqub payments
    state.iqubs
      .filter((i) => i.status === "active")
      .forEach((iqub) => {
        const nextPayment = new Date(iqub.nextPaymentDate)
        const daysUntilPayment = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilPayment <= 3 && daysUntilPayment >= 0) {
          reminders.push({
            id: `iqub-${iqub.id}-${today.toDateString()}`,
            type: "iqub",
            title: "Iqub Payment Coming",
            message:
              daysUntilPayment === 0
                ? `${iqub.title} Iqub contribution of ${iqub.amount.toLocaleString()} ETB is due TODAY!`
                : `${iqub.title} Iqub contribution of ${iqub.amount.toLocaleString()} ETB due in ${daysUntilPayment} day${daysUntilPayment > 1 ? "s" : ""}`,
            urgency: daysUntilPayment === 0 ? "critical" : "medium",
          })
        }

        // Check if it might be their turn soon
        if (!iqub.hasWon && iqub.paidRounds >= Math.floor(iqub.members * 0.7)) {
          reminders.push({
            id: `iqub-turn-${iqub.id}`,
            type: "iqub",
            title: "Iqub Payout Coming",
            message: `Your turn in ${iqub.title} might be coming soon! Plan how to use your ${iqub.payoutAmount.toLocaleString()} ETB payout wisely.`,
            urgency: "low",
          })
        }
      })

    // Check budget categories
    state.budgetCategories.forEach((cat) => {
      if (cat.allocated > 0) {
        const percentage = (cat.spent / cat.allocated) * 100
        const daysRemaining = daysInMonth - dayOfMonth

        if (percentage >= 100) {
          reminders.push({
            id: `budget-over-${cat.id}-${today.getMonth()}`,
            type: "budget",
            title: "Budget Exceeded",
            message: `You've exceeded your ${cat.name} budget by ${(cat.spent - cat.allocated).toLocaleString()} ETB this month.`,
            urgency: "high",
          })
        } else if (percentage >= 80 && dayOfMonth < 20) {
          reminders.push({
            id: `budget-warning-${cat.id}-${today.getMonth()}`,
            type: "budget",
            title: "Budget Warning",
            message: `${cat.name} is at ${Math.round(percentage)}% with ${daysRemaining} days left in the month.`,
            urgency: "medium",
          })
        }
      }
    })

    // Check recurring bills
    state.recurringTransactions
      .filter((r) => r.is_active)
      .forEach((bill) => {
        const dueDate = new Date(bill.next_due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        const reminderDays = bill.reminderDays || [1, 3]
        if (reminderDays.includes(daysUntilDue)) {
          reminders.push({
            id: `bill-${bill.id}-${daysUntilDue}`,
            type: "bill",
            title: "Bill Due Soon",
            message:
              daysUntilDue === 0
                ? `${bill.name} (${bill.amount.toLocaleString()} ETB) is due TODAY!`
                : `${bill.name} (${bill.amount.toLocaleString()} ETB) due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`,
            urgency: daysUntilDue === 0 ? "high" : "medium",
          })
        }
      })

    // Check payday reminders
    state.incomeSources
      .filter((s) => s.remindPayday && s.payday)
      .forEach((source) => {
        const payday = source.payday!
        const daysUntilPayday = payday >= dayOfMonth ? payday - dayOfMonth : daysInMonth - dayOfMonth + payday

        if (daysUntilPayday === 1) {
          reminders.push({
            id: `payday-${source.id}-${today.getMonth()}`,
            type: "payday",
            title: "Payday Tomorrow",
            message: `${source.name} (${source.amount.toLocaleString()} ETB) arrives tomorrow. Plan your budget allocation!`,
            urgency: "low",
          })
        }
      })

    // Check goal milestones
    state.savingsGoals.forEach((goal) => {
      const percentage = (goal.currentAmount / goal.targetAmount) * 100

      if (percentage >= 90 && percentage < 100) {
        reminders.push({
          id: `goal-almost-${goal.id}`,
          type: "goal",
          title: "Goal Almost Complete!",
          message: `Just ${(goal.targetAmount - goal.currentAmount).toLocaleString()} ETB more to reach your ${goal.title} goal!`,
          urgency: "low",
        })
      }

      // Check deadline warnings
      if (goal.deadline) {
        const deadline = new Date(goal.deadline)
        const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const remaining = goal.targetAmount - goal.currentAmount

        if (daysUntilDeadline <= 30 && remaining > 0) {
          const monthlyNeeded = remaining / (daysUntilDeadline / 30)
          reminders.push({
            id: `goal-deadline-${goal.id}`,
            type: "goal",
            title: "Goal Deadline Approaching",
            message: `${goal.title} deadline is in ${daysUntilDeadline} days. You need to save ${Math.round(monthlyNeeded).toLocaleString()} ETB/month to reach it.`,
            urgency: daysUntilDeadline <= 7 ? "high" : "medium",
          })
        }
      }
    })

    // Financial health insights
    const monthlyExpense = state.totalExpense || 1
    const runway = state.totalBalance / monthlyExpense

    if (runway < 1) {
      reminders.push({
        id: "runway-critical",
        type: "insight",
        title: "Financial Emergency",
        message: "Your financial runway is less than 1 month. Cut non-essential spending immediately.",
        urgency: "critical",
      })
    } else if (runway < 3) {
      reminders.push({
        id: "runway-warning",
        type: "insight",
        title: "Build Your Safety Net",
        message: `You have ${Math.round(runway)} months of runway. Aim for at least 3 months of emergency savings.`,
        urgency: "medium",
      })
    }

    return reminders
  }, [state])

  const checkAndNotify = useCallback(() => {
    if (!config.enabled) return

    const todayKey = new Date().toDateString()
    if (lastCheckRef.current === todayKey) return

    const reminders = generateReminders()

    // Filter out already notified reminders
    const newReminders = reminders.filter((r) => !notifiedRef.current.has(r.id))

    // Show critical and high urgency reminders
    newReminders
      .filter((r) => r.urgency === "critical" || r.urgency === "high")
      .slice(0, 3) // Max 3 notifications at once
      .forEach((reminder) => {
        showNotification(reminder.message, reminder.urgency === "critical" ? "error" : "info")
        notifiedRef.current.add(reminder.id)
      })

    lastCheckRef.current = todayKey
  }, [config.enabled, generateReminders, showNotification])

  // Check on mount and periodically
  useEffect(() => {
    checkAndNotify()

    const interval = setInterval(checkAndNotify, config.checkInterval)
    return () => clearInterval(interval)
  }, [checkAndNotify, config.checkInterval])

  // Also check when state changes significantly
  useEffect(() => {
    const timer = setTimeout(checkAndNotify, 1000)
    return () => clearTimeout(timer)
  }, [state.iddirs, state.iqubs, state.recurringTransactions, checkAndNotify])

  return {
    reminders: generateReminders(),
    checkNow: checkAndNotify,
  }
}
