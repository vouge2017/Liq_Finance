import type { AppState } from "@/types"

export function buildFinancialContext(state: AppState, activeProfile: string): string {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const dayOfMonth = today.getDate()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysRemaining = daysInMonth - dayOfMonth

  // Calculate totals
  const totalAllocated = state.budgetCategories.reduce((sum, c) => sum + c.allocated, 0)
  const totalSpent = state.budgetCategories.reduce((sum, c) => sum + c.spent, 0)
  const savingsRate =
    state.totalIncome > 0 ? (((state.totalIncome - state.totalExpense) / state.totalIncome) * 100).toFixed(1) : "0"
  const hasIncomeData = state.incomeSources.length > 0

  const fixedCategories = state.budgetCategories.filter((c) => c.type === "fixed")
  const variableCategories = state.budgetCategories.filter((c) => c.type === "variable")

  // Calculate runway (months of survival)
  const monthlyExpense = state.totalExpense || 1
  const runway = Math.round(state.totalBalance / monthlyExpense)

  // Find categories at risk (>80% spent)
  const atRiskCategories = state.budgetCategories.filter((c) => c.allocated > 0 && c.spent / c.allocated >= 0.8)

  // Calculate daily budget remaining
  const budgetRemaining = totalAllocated - totalSpent
  const dailyBudget = daysRemaining > 0 ? Math.round(budgetRemaining / daysRemaining) : 0

  // Recent spending patterns (last 7 days)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentExpenses = state.transactions.filter((t) => t.type === "expense" && new Date(t.date) >= sevenDaysAgo)
  const weeklySpend = recentExpenses.reduce((sum, t) => sum + t.amount, 0)
  const avgDailySpend = Math.round(weeklySpend / 7)

  // Upcoming Iqub payments
  const activeIqubs = state.iqubs.filter((i) => i.status === "active")
  const upcomingIqubPayments = activeIqubs.map((i) => ({
    name: i.title,
    amount: i.amount,
    nextDate: i.nextPaymentDate,
    round: i.currentRound,
    totalRounds: i.members,
  }))

  // Upcoming Iddir payments
  const activeIddirs = state.iddirs.filter((i) => i.status === "active")
  const upcomingIddirPayments = activeIddirs.map((i) => {
    const dueDay = i.paymentDate
    const daysUntilDue = dueDay >= dayOfMonth ? dueDay - dayOfMonth : daysInMonth - dayOfMonth + dueDay
    return {
      name: i.name,
      amount: i.monthlyContribution,
      daysUntilDue,
      lastPaid: i.lastPaidDate,
    }
  })

  // Recurring bills coming up
  const upcomingBills = state.recurringTransactions
    .filter((r) => r.is_active)
    .map((r) => {
      const dueDate = new Date(r.next_due_date)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        name: r.name,
        amount: r.amount,
        daysUntilDue,
        category: r.category,
      }
    })
    .filter((r) => r.daysUntilDue <= 14 && r.daysUntilDue >= 0)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

  // Category spending breakdown
  const categoryBreakdown = state.budgetCategories
    .filter((c) => c.spent > 0 || c.allocated > 0)
    .map((c) => ({
      name: c.name,
      spent: c.spent,
      allocated: c.allocated,
      percentage: c.allocated > 0 ? Math.round((c.spent / c.allocated) * 100) : 0,
      status:
        c.allocated > 0
          ? c.spent / c.allocated >= 1
            ? "OVER"
            : c.spent / c.allocated >= 0.8
              ? "WARNING"
              : "OK"
          : "NO_BUDGET",
    }))

  // Top spending categories this month
  const topSpendingCategories = [...categoryBreakdown].sort((a, b) => b.spent - a.spent).slice(0, 5)

  // Goal progress
  const goalProgress = state.savingsGoals.map((g) => {
    const percentage = Math.round((g.currentAmount / g.targetAmount) * 100)
    const remaining = g.targetAmount - g.currentAmount
    let monthsToGoal = null

    if (g.deadline) {
      const deadlineDate = new Date(g.deadline)
      const monthsRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const monthlyNeeded = monthsRemaining > 0 ? Math.round(remaining / monthsRemaining) : remaining
      monthsToGoal = { monthsRemaining, monthlyNeeded }
    }

    return {
      name: g.title,
      current: g.currentAmount,
      target: g.targetAmount,
      percentage,
      remaining,
      deadline: g.deadline,
      monthsToGoal,
    }
  })

  // Account balances
  const accountSummary = state.accounts.map((a) => ({
    name: a.name,
    type: a.type,
    balance: a.balance,
    institution: a.institution,
  }))

  return `
USER PROFILE: ${activeProfile} View
DATE: ${today.toLocaleDateString("en-ET", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
DAYS LEFT IN MONTH: ${daysRemaining}

====== FINANCIAL HEALTH OVERVIEW ======

TOTAL LIQUID ASSETS: ${state.totalBalance.toLocaleString()} ETB
FINANCIAL RUNWAY: ${runway} months ${runway < 1 ? "⚠️ CRITICAL - EMERGENCY MODE" : runway < 3 ? "⚠️ WARNING - BUILD RESERVES" : runway < 6 ? "✓ Stable" : "✓✓ Strong"}

ACCOUNTS:
${accountSummary.map((a) => `  • ${a.name} (${a.institution}): ${a.balance.toLocaleString()} ETB`).join("\n")}

====== THIS MONTH'S BUDGET STATUS ======

INCOME: ${hasIncomeData ? `${state.totalIncome.toLocaleString()} ETB` : "NOT SET - Ask about their income!"}
TOTAL BUDGETED: ${totalAllocated.toLocaleString()} ETB
TOTAL SPENT: ${totalSpent.toLocaleString()} ETB (${totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}%)
REMAINING: ${budgetRemaining.toLocaleString()} ETB
DAILY BUDGET REMAINING: ${dailyBudget.toLocaleString()} ETB/day for ${daysRemaining} days
${hasIncomeData ? `SAVINGS RATE: ${savingsRate}%` : ""}

${
  atRiskCategories.length > 0
    ? `⚠️ CATEGORIES AT RISK (>80% spent):
${atRiskCategories.map((c) => `  • ${c.name}: ${c.spent.toLocaleString()}/${c.allocated.toLocaleString()} ETB (${Math.round((c.spent / c.allocated) * 100)}%)`).join("\n")}`
    : ""
}

BUDGET BY CATEGORY:
Fixed Expenses:
${fixedCategories.map((c) => `  • ${c.name}: ${c.spent.toLocaleString()}/${c.allocated.toLocaleString()} ETB ${c.allocated > 0 && c.spent > c.allocated ? "⚠️ OVER!" : ""}`).join("\n")}

Variable Expenses:
${variableCategories.map((c) => `  • ${c.name}: ${c.spent.toLocaleString()}/${c.allocated.toLocaleString()} ETB ${c.allocated > 0 && c.spent > c.allocated ? "⚠️ OVER!" : ""}`).join("\n")}

====== SPENDING PATTERNS ======

LAST 7 DAYS: ${weeklySpend.toLocaleString()} ETB total
AVERAGE DAILY: ${avgDailySpend.toLocaleString()} ETB/day

TOP SPENDING THIS MONTH:
${topSpendingCategories.map((c, i) => `  ${i + 1}. ${c.name}: ${c.spent.toLocaleString()} ETB`).join("\n")}

====== COMMUNITY FINANCE ======

ACTIVE IQUBS (${activeIqubs.length}):
${
  activeIqubs.length > 0
    ? activeIqubs
        .map(
          (i) =>
            `  • ${i.title}: ${i.amount.toLocaleString()} ETB/${i.cycle}, Round ${i.currentRound}/${i.members}${i.hasWon ? " (Already Won!)" : ""}, Next: ${i.nextPaymentDate}`,
        )
        .join("\n")
    : "  None - Consider joining one for lump sum savings!"
}

IDDIR MEMBERSHIPS (${activeIddirs.length}):
${
  activeIddirs.length > 0
    ? upcomingIddirPayments
        .map((i) => `  • ${i.name}: ${i.amount.toLocaleString()} ETB/month, Due in ${i.daysUntilDue} days`)
        .join("\n")
    : "  None"
}

====== UPCOMING OBLIGATIONS (Next 14 days) ======

${
  upcomingBills.length > 0
    ? upcomingBills
        .map((b) => `  • ${b.name}: ${b.amount.toLocaleString()} ETB due in ${b.daysUntilDue} days`)
        .join("\n")
    : "  No upcoming bills"
}

====== SAVINGS GOALS ======

${
  goalProgress.length > 0
    ? goalProgress
        .map(
          (g) =>
            `  • ${g.name}: ${g.current.toLocaleString()}/${g.target.toLocaleString()} ETB (${g.percentage}%)
    ${g.remaining.toLocaleString()} ETB remaining${g.monthsToGoal ? `, need ${g.monthsToGoal.monthlyNeeded.toLocaleString()} ETB/month to hit deadline` : ""}`,
        )
        .join("\n")
    : "  No savings goals set - This is concerning. Suggest setting at least an Emergency Fund goal."
}

====== RECENT TRANSACTIONS (Last 10) ======

${state.transactions
  .slice(0, 10)
  .map(
    (t) =>
      `  ${t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()} ETB: ${t.title} (${t.category}) - ${new Date(t.date).toLocaleDateString()}`,
  )
  .join("\n")}

====== RECURRING SUBSCRIPTIONS ======

${
  state.recurringTransactions.filter((r) => r.is_active).length > 0
    ? `Active subscriptions: ${state.recurringTransactions
        .filter((r) => r.is_active)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()} ETB/month
${state.recurringTransactions
  .filter((r) => r.is_active)
  .map((r) => `  • ${r.name}: ${r.amount.toLocaleString()} ETB/${r.recurrence}`)
  .join("\n")}`
    : "  No recurring subscriptions tracked"
}

====== INCOME SOURCES ======

${
  state.incomeSources.length > 0
    ? state.incomeSources
        .map(
          (s) =>
            `  • ${s.name} (${s.type}): ${s.amount.toLocaleString()} ETB/${s.frequency}${s.payday ? `, payday: ${s.payday}th` : ""}`,
        )
        .join("\n")
    : "  No income sources set - Ask about their income to provide better advice!"
}
`.trim()
}

// Analyze receipt using the API route
export async function analyzeReceipt(
  imageBase64: string,
  mimeType = "image/jpeg",
): Promise<{
  title: string
  amount: number
  date: string
  category: string
  type: "expense"
} | null> {
  try {
    const response = await fetch("/api/analyze-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze receipt")
    }

    const result = await response.json()
    if (result.success) {
      return result.data
    }
    return null
  } catch (error) {
    console.error("Receipt analysis error:", error)
    return null
  }
}

// Generate proactive insights based on financial data
export function generateProactiveInsights(state: AppState): string[] {
  const insights: string[] = []
  const today = new Date()
  const dayOfMonth = today.getDate()

  // Check for budget overruns
  state.budgetCategories.forEach((cat) => {
    if (cat.allocated > 0) {
      const percentage = (cat.spent / cat.allocated) * 100
      if (percentage >= 100) {
        insights.push(`You've exceeded your ${cat.name} budget by ${(cat.spent - cat.allocated).toLocaleString()} ETB`)
      } else if (percentage >= 80) {
        insights.push(`${cat.name} is at ${Math.round(percentage)}% - consider slowing down`)
      }
    }
  })

  // Check upcoming Iddir payments
  state.iddirs
    .filter((i) => i.status === "active")
    .forEach((iddir) => {
      const dueDay = iddir.paymentDate
      const daysUntil = dueDay >= dayOfMonth ? dueDay - dayOfMonth : 0
      if (daysUntil <= 3 && daysUntil > 0) {
        insights.push(
          `Iddir payment for ${iddir.name} (${iddir.monthlyContribution.toLocaleString()} ETB) due in ${daysUntil} days`,
        )
      }
    })

  // Check Iqub status
  state.iqubs
    .filter((i) => i.status === "active")
    .forEach((iqub) => {
      if (!iqub.hasWon && iqub.paidRounds >= iqub.members / 2) {
        insights.push(
          `Your turn in ${iqub.title} Iqub is coming up! Plan how to use your ${iqub.payoutAmount.toLocaleString()} ETB payout`,
        )
      }
    })

  // Check goal progress
  state.savingsGoals.forEach((goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100
    if (percentage >= 90 && percentage < 100) {
      insights.push(
        `You're almost there! Just ${(goal.targetAmount - goal.currentAmount).toLocaleString()} ETB more to reach your ${goal.title} goal`,
      )
    }
  })

  // Check runway
  const monthlyExpense = state.totalExpense || 1
  const runway = state.totalBalance / monthlyExpense
  if (runway < 1) {
    insights.push(
      `URGENT: Your financial runway is less than 1 month. Consider cutting non-essential expenses immediately.`,
    )
  }

  return insights
}
