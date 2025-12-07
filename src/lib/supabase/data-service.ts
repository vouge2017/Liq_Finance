import { createClient } from "./client"
import type {
  Account,
  Transaction,
  SavingsGoal,
  Iqub,
  Iddir,
  BudgetCategory,
  IncomeSource,
  RecurringTransaction,
} from "@/types"

function getSupabase() {
  const supabase = createClient()
  if (!supabase) {
    console.warn('[DataService] Supabase not configured. Running in offline mode.')
  }
  return supabase
}

// ============ PROFILE ============

export interface UserProfileData {
  id: string
  full_name: string | null
  phone: string | null
  financial_goal: string | null
  preferred_language: string
  calendar_mode: string
  theme: string
  privacy_mode: boolean
  ai_consent: boolean
  onboarding_completed: boolean
}

export async function getProfile(userId: string): Promise<UserProfileData | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("[DataService] Error fetching profile:", error)
    return null
  }
  return data
}

export async function upsertProfile(userId: string, updates: Partial<UserProfileData>): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })

  if (error) {
    console.error("[DataService] Error upserting profile:", error)
    return false
  }
  return true
}

// ============ ACCOUNTS ============

export async function getAccounts(userId: string): Promise<Account[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching accounts:", error)
    return []
  }

  return data.map((a: any) => ({
    id: a.id,
    name: a.name,
    institution: a.institution,
    type: a.type as Account["type"],
    balance: Number(a.balance),
    accountNumber: a.account_number,
    color: a.color,
    profile: a.profile as Account["profile"],
  }))
}

export async function createAccount(userId: string, account: Omit<Account, "id">): Promise<Account | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: account.name,
      institution: account.institution,
      type: account.type,
      balance: account.balance,
      account_number: account.accountNumber,
      color: account.color,
      profile: account.profile,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating account:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    institution: data.institution,
    type: data.type,
    balance: Number(data.balance),
    accountNumber: data.account_number,
    color: data.color,
    profile: data.profile,
  }
}

export async function updateAccount(account: Account): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("accounts")
    .update({
      name: account.name,
      institution: account.institution,
      type: account.type,
      balance: account.balance,
      account_number: account.accountNumber,
      color: account.color,
      profile: account.profile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id)

  if (error) {
    console.error("[v0] Error updating account:", error)
    return false
  }
  return true
}

export async function deleteAccount(accountId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("accounts").delete().eq("id", accountId)

  if (error) {
    console.error("[v0] Error deleting account:", error)
    return false
  }
  return true
}

// ============ TRANSACTIONS ============

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .limit(500)

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }

  return data.map((t: any) => ({
    id: t.id,
    title: t.title,
    date: t.transaction_date,
    amount: Number(t.amount),
    type: t.type as Transaction["type"],
    category: t.category,
    icon: t.icon,
    accountId: t.account_id,
    profile: t.profile as Transaction["profile"],
    goalId: t.goal_id,
    iqubId: t.iqub_id,
    iddirId: t.iddir_id,
  }))
}

export async function createTransaction(userId: string, tx: Omit<Transaction, "id">): Promise<Transaction | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      title: tx.title,
      transaction_date: tx.date,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      icon: tx.icon,
      account_id: tx.accountId,
      profile: tx.profile,
      goal_id: tx.goalId,
      iqub_id: tx.iqubId,
      iddir_id: tx.iddirId,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating transaction:", error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    date: data.transaction_date,
    amount: Number(data.amount),
    type: data.type,
    category: data.category,
    icon: data.icon,
    accountId: data.account_id,
    profile: data.profile,
    goalId: data.goal_id,
    iqubId: data.iqub_id,
    iddirId: data.iddir_id,
  }
}

export async function updateTransaction(tx: Transaction): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("transactions")
    .update({
      title: tx.title,
      transaction_date: tx.date,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      icon: tx.icon,
      account_id: tx.accountId,
      profile: tx.profile,
      goal_id: tx.goalId,
      iqub_id: tx.iqubId,
      iddir_id: tx.iddirId,
    })
    .eq("id", tx.id)

  if (error) {
    console.error("[v0] Error updating transaction:", error)
    return false
  }
  return true
}

export async function deleteTransaction(txId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("transactions").delete().eq("id", txId)

  if (error) {
    console.error("[v0] Error deleting transaction:", error)
    return false
  }
  return true
}

// ============ SAVINGS GOALS ============

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching savings goals:", error)
    return []
  }

  return data.map((g: any) => ({
    id: g.id,
    title: g.title,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    icon: g.icon,
    color: g.color,
    roundUpEnabled: g.round_up_enabled,
    profile: g.profile as SavingsGoal["profile"],
    deadline: g.deadline,
    defaultAccountId: g.default_account_id,
  }))
}

export async function createSavingsGoal(userId: string, goal: Omit<SavingsGoal, "id">): Promise<SavingsGoal | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: userId,
      title: goal.title,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      icon: goal.icon,
      color: goal.color,
      round_up_enabled: goal.roundUpEnabled,
      profile: goal.profile,
      deadline: goal.deadline,
      default_account_id: goal.defaultAccountId,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating savings goal:", error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    icon: data.icon,
    color: data.color,
    roundUpEnabled: data.round_up_enabled,
    profile: data.profile,
    deadline: data.deadline,
    defaultAccountId: data.default_account_id,
  }
}

export async function updateSavingsGoal(goal: SavingsGoal): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("savings_goals")
    .update({
      title: goal.title,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      icon: goal.icon,
      color: goal.color,
      round_up_enabled: goal.roundUpEnabled,
      profile: goal.profile,
      deadline: goal.deadline,
      default_account_id: goal.defaultAccountId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goal.id)

  if (error) {
    console.error("[v0] Error updating savings goal:", error)
    return false
  }
  return true
}

export async function deleteSavingsGoal(goalId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("savings_goals").delete().eq("id", goalId)

  if (error) {
    console.error("[v0] Error deleting savings goal:", error)
    return false
  }
  return true
}

// ============ IQUBS ============

export async function getIqubs(userId: string): Promise<Iqub[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("iqubs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching iqubs:", error)
    return []
  }

  return data.map((i: any) => ({
    id: i.id,
    title: i.title,
    purpose: i.purpose,
    amount: Number(i.amount),
    cycle: i.cycle as Iqub["cycle"],
    members: i.members,
    currentRound: i.current_round,
    startDate: i.start_date,
    myTurnDate: i.my_turn_date,
    payoutAmount: Number(i.payout_amount),
    status: i.status as Iqub["status"],
    nextPaymentDate: i.next_payment_date,
    paidRounds: i.paid_rounds,
    hasWon: i.has_won,
    winningRound: i.winning_round,
    profile: i.profile as Iqub["profile"],
  }))
}

export async function createIqub(userId: string, iqub: Omit<Iqub, "id">): Promise<Iqub | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("iqubs")
    .insert({
      user_id: userId,
      title: iqub.title,
      purpose: iqub.purpose,
      amount: iqub.amount,
      cycle: iqub.cycle,
      members: iqub.members,
      current_round: iqub.currentRound,
      start_date: iqub.startDate,
      my_turn_date: iqub.myTurnDate,
      payout_amount: iqub.payoutAmount,
      status: iqub.status,
      next_payment_date: iqub.nextPaymentDate,
      paid_rounds: iqub.paidRounds,
      has_won: iqub.hasWon,
      winning_round: iqub.winningRound,
      profile: iqub.profile,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating iqub:", error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    purpose: data.purpose,
    amount: Number(data.amount),
    cycle: data.cycle,
    members: data.members,
    currentRound: data.current_round,
    startDate: data.start_date,
    myTurnDate: data.my_turn_date,
    payoutAmount: Number(data.payout_amount),
    status: data.status,
    nextPaymentDate: data.next_payment_date,
    paidRounds: data.paid_rounds,
    hasWon: data.has_won,
    winningRound: data.winning_round,
    profile: data.profile,
  }
}

export async function updateIqub(iqub: Iqub): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("iqubs")
    .update({
      title: iqub.title,
      purpose: iqub.purpose,
      amount: iqub.amount,
      cycle: iqub.cycle,
      members: iqub.members,
      current_round: iqub.currentRound,
      start_date: iqub.startDate,
      my_turn_date: iqub.myTurnDate,
      payout_amount: iqub.payoutAmount,
      status: iqub.status,
      next_payment_date: iqub.nextPaymentDate,
      paid_rounds: iqub.paidRounds,
      has_won: iqub.hasWon,
      winning_round: iqub.winningRound,
      profile: iqub.profile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", iqub.id)

  if (error) {
    console.error("[v0] Error updating iqub:", error)
    return false
  }
  return true
}

export async function deleteIqub(iqubId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("iqubs").delete().eq("id", iqubId)

  if (error) {
    console.error("[v0] Error deleting iqub:", error)
    return false
  }
  return true
}

// ============ IDDIRS ============

export async function getIddirs(userId: string): Promise<Iddir[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("iddirs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching iddirs:", error)
    return []
  }

  return data.map((i: any) => ({
    id: i.id,
    name: i.name,
    monthlyContribution: Number(i.monthly_contribution),
    paymentDate: i.payment_date,
    lastPaidDate: i.last_paid_date,
    status: i.status as Iddir["status"],
    profile: i.profile as Iddir["profile"],
    reminderEnabled: i.reminder_enabled,
    reminderDaysBefore: i.reminder_days_before,
  }))
}

export async function createIddir(userId: string, iddir: Omit<Iddir, "id">): Promise<Iddir | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("iddirs")
    .insert({
      user_id: userId,
      name: iddir.name,
      monthly_contribution: iddir.monthlyContribution,
      payment_date: iddir.paymentDate,
      last_paid_date: iddir.lastPaidDate,
      status: iddir.status,
      profile: iddir.profile,
      reminder_enabled: iddir.reminderEnabled,
      reminder_days_before: iddir.reminderDaysBefore,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating iddir:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    monthlyContribution: Number(data.monthly_contribution),
    paymentDate: data.payment_date,
    lastPaidDate: data.last_paid_date,
    status: data.status,
    profile: data.profile,
    reminderEnabled: data.reminder_enabled,
    reminderDaysBefore: data.reminder_days_before,
  }
}

export async function updateIddir(iddir: Iddir): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("iddirs")
    .update({
      name: iddir.name,
      monthly_contribution: iddir.monthlyContribution,
      payment_date: iddir.paymentDate,
      last_paid_date: iddir.lastPaidDate,
      status: iddir.status,
      profile: iddir.profile,
      reminder_enabled: iddir.reminderEnabled,
      reminder_days_before: iddir.reminderDaysBefore,
    })
    .eq("id", iddir.id)

  if (error) {
    console.error("[v0] Error updating iddir:", error)
    return false
  }
  return true
}

export async function deleteIddir(iddirId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("iddirs").delete().eq("id", iddirId)

  if (error) {
    console.error("[v0] Error deleting iddir:", error)
    return false
  }
  return true
}

// ============ BUDGET CATEGORIES ============

export async function getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching budget categories:", error)
    return []
  }

  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    type: c.type as BudgetCategory["type"],
    allocated: Number(c.allocated),
    spent: 0, // Calculated from transactions
    icon: c.icon,
    color: c.color,
    rolloverEnabled: c.rollover_enabled,
  }))
}

export async function createBudgetCategory(
  userId: string,
  category: Omit<BudgetCategory, "id" | "spent">,
): Promise<BudgetCategory | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("budget_categories")
    .insert({
      user_id: userId,
      name: category.name,
      type: category.type,
      allocated: category.allocated,
      icon: category.icon,
      color: category.color,
      rollover_enabled: category.rolloverEnabled,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating budget category:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    allocated: Number(data.allocated),
    spent: 0,
    icon: data.icon,
    color: data.color,
    rolloverEnabled: data.rollover_enabled,
  }
}

export async function updateBudgetCategory(categoryId: string, updates: Partial<BudgetCategory>): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("budget_categories")
    .update({
      name: updates.name,
      type: updates.type,
      allocated: updates.allocated,
      icon: updates.icon,
      color: updates.color,
      rollover_enabled: updates.rolloverEnabled,
    })
    .eq("id", categoryId)

  if (error) {
    console.error("[v0] Error updating budget category:", error)
    return false
  }
  return true
}

export async function deleteBudgetCategory(categoryId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("budget_categories").delete().eq("id", categoryId)

  if (error) {
    console.error("[v0] Error deleting budget category:", error)
    return false
  }
  return true
}

// ============ INCOME SOURCES ============

export async function getIncomeSources(userId: string): Promise<IncomeSource[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching income sources:", error)
    return []
  }

  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    type: s.type as IncomeSource["type"],
    amount: Number(s.amount),
    frequency: s.frequency as IncomeSource["frequency"],
    payday: s.payday,
    stability: s.stability as IncomeSource["stability"],
    remindPayday: s.remind_payday,
    linkedAccountId: s.linked_account_id,
  }))
}

export async function createIncomeSource(
  userId: string,
  source: Omit<IncomeSource, "id">,
): Promise<IncomeSource | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("income_sources")
    .insert({
      user_id: userId,
      name: source.name,
      type: source.type,
      amount: source.amount,
      frequency: source.frequency,
      payday: source.payday,
      stability: source.stability,
      remind_payday: source.remindPayday,
      linked_account_id: source.linkedAccountId,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating income source:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    amount: Number(data.amount),
    frequency: data.frequency,
    payday: data.payday,
    stability: data.stability,
    remindPayday: data.remind_payday,
    linkedAccountId: data.linked_account_id,
  }
}

export async function updateIncomeSource(source: IncomeSource): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase
    .from("income_sources")
    .update({
      name: source.name,
      type: source.type,
      amount: source.amount,
      frequency: source.frequency,
      payday: source.payday,
      stability: source.stability,
      remind_payday: source.remindPayday,
      linked_account_id: source.linkedAccountId,
    })
    .eq("id", source.id)

  if (error) {
    console.error("[v0] Error updating income source:", error)
    return false
  }
  return true
}

export async function deleteIncomeSource(sourceId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("income_sources").delete().eq("id", sourceId)

  if (error) {
    console.error("[v0] Error deleting income source:", error)
    return false
  }
  return true
}

// ============ RECURRING TRANSACTIONS ============

export async function getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching recurring transactions:", error)
    return []
  }

  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    currency: r.currency,
    category: r.category,
    recurrence: r.recurrence as RecurringTransaction["recurrence"],
    next_due_date: r.next_due_date,
    last_paid_date: r.last_paid_date,
    payment_method: r.payment_method as RecurringTransaction["payment_method"],
    is_active: r.is_active,
    profile: r.profile as RecurringTransaction["profile"],
    icon: r.icon,
    notes: r.notes,
    reminderDays: r.reminder_days,
  }))
}


// ============ AI CONVERSATIONS ============

export interface AIConversation {
  id: string
  messages: Array<{ role: string; content: string; timestamp: string }>
}

export async function getAIConversation(userId: string): Promise<AIConversation | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.from("ai_conversations").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching AI conversation:", error)
    return null
  }

  return data
    ? {
      id: data.id,
      messages: data.messages || [],
    }
    : null
}

export async function saveAIConversation(userId: string, messages: AIConversation["messages"]): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("ai_conversations").upsert({
    user_id: userId,
    messages,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Error saving AI conversation:", error)
    return false
  }
  return true
}

// ============ LOAD ALL USER DATA ============

export async function loadAllUserData(userId: string) {
  const [
    profile,
    accounts,
    transactions,
    savingsGoals,
    iqubs,
    iddirs,
    budgetCategories,
    incomeSources,
    recurringTransactions,
  ] = await Promise.all([
    getProfile(userId),
    getAccounts(userId),
    getTransactions(userId),
    getSavingsGoals(userId),
    getIqubs(userId),
    getIddirs(userId),
    getBudgetCategories(userId),
    getIncomeSources(userId),
    getRecurringTransactions(userId),
  ])

  return {
    profile,
    accounts,
    transactions,
    savingsGoals,
    iqubs,
    iddirs,
    budgetCategories,
    incomeSources,
    recurringTransactions,
  }
}
