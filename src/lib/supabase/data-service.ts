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
import { consentService, type ConsentValidationResult } from "@/services/consent-service"
import { dataEncryptionService, type EncryptedData } from "@/lib/security/data-encryption"

// Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// ============ ENCRYPTION HELPERS ============

/**
 * Encrypt a financial value for storage
 */
function encryptFinancialValue(value: number | string): string {
  const encrypted = dataEncryptionService.encrypt(value.toString())
  return JSON.stringify(encrypted)
}

/**
 * Decrypt a financial value from storage
 */
function decryptFinancialValue(encryptedString: string): string {
  try {
    const encrypted: EncryptedData = JSON.parse(encryptedString)
    return dataEncryptionService.decrypt(encrypted)
  } catch {
    console.error('[DataService] Failed to decrypt financial value')
    return '0'
  }
}

/**
 * Check if a value appears to be encrypted (JSON with encryption structure)
 */
function isEncrypted(value: string): boolean {
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && 'encrypted' in parsed && 'iv' in parsed && 'authTag' in parsed
  } catch {
    return false
  }
}

/**
 * Safely parse a value that may be encrypted or plain
 */
function parseFinancialValue(value: any): number {
  if (value === null || value === undefined) return 0

  if (typeof value === 'number') return value

  if (typeof value === 'string') {
    if (isEncrypted(value)) {
      const decrypted = decryptFinancialValue(value)
      return parseFloat(decrypted) || 0
    }
    return parseFloat(value) || 0
  }

  return 0
}

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
  budget_start_date: number
}

export async function getProfile(userId: string): Promise<UserProfileData | null> {
  if (isDemoMode) {
    const { getProfile: mockGetProfile } = await import('../mock/mock-data-service')
    return mockGetProfile(userId)
  }

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
  if (isDemoMode) {
    const { getAccounts: mockGetAccounts } = await import('../mock/mock-data-service')
    return mockGetAccounts(userId)
  }

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
    balance: parseFinancialValue(a.balance),
    accountNumber: a.account_number,
    color: a.color,
    profile: a.profile as Account["profile"],
    subtype: a.subtype,
    loanDetails: a.loan_details,
  }))
}

export async function createAccount(userId: string, account: Omit<Account, "id">): Promise<Account | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  // Encrypt the balance before storing
  const encryptedBalance = encryptFinancialValue(account.balance)

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      name: account.name,
      institution: account.institution,
      type: account.type,
      balance: encryptedBalance, // Store encrypted balance
      account_number: account.accountNumber,
      color: account.color,
      profile: account.profile,
      subtype: account.subtype,
      loan_details: account.loanDetails,
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
    balance: parseFinancialValue(data.balance),
    accountNumber: data.account_number,
    color: data.color,
    profile: data.profile,
    subtype: data.subtype,
    loanDetails: data.loan_details,
  }
}

export async function updateAccount(account: Account): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  // Encrypt the balance before storing
  const encryptedBalance = encryptFinancialValue(account.balance)

  const { error } = await supabase
    .from("accounts")
    .update({
      name: account.name,
      institution: account.institution,
      type: account.type,
      balance: encryptedBalance, // Store encrypted balance
      account_number: account.accountNumber,
      color: account.color,
      profile: account.profile,
      subtype: account.subtype,
      loan_details: account.loanDetails,
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
  if (isDemoMode) {
    const { getTransactions: mockGetTransactions } = await import('../mock/mock-data-service')
    return mockGetTransactions(userId)
  }

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
    amount: parseFinancialValue(t.amount),
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

  // Encrypt the amount before storing
  const encryptedAmount = encryptFinancialValue(tx.amount)

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      title: tx.title,
      transaction_date: tx.date,
      amount: encryptedAmount, // Store encrypted amount
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
    amount: parseFinancialValue(data.amount),
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

  // Encrypt the amount before storing
  const encryptedAmount = encryptFinancialValue(tx.amount)

  const { error } = await supabase
    .from("transactions")
    .update({
      title: tx.title,
      transaction_date: tx.date,
      amount: encryptedAmount, // Store encrypted amount
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
    targetAmount: parseFinancialValue(g.target_amount),
    currentAmount: parseFinancialValue(g.current_amount),
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

  // Encrypt financial amounts
  const encryptedTargetAmount = encryptFinancialValue(goal.targetAmount)
  const encryptedCurrentAmount = encryptFinancialValue(goal.currentAmount)

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: userId,
      title: goal.title,
      target_amount: encryptedTargetAmount,
      current_amount: encryptedCurrentAmount,
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
    targetAmount: parseFinancialValue(data.target_amount),
    currentAmount: parseFinancialValue(data.current_amount),
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

  // Encrypt financial amounts
  const encryptedTargetAmount = encryptFinancialValue(goal.targetAmount)
  const encryptedCurrentAmount = encryptFinancialValue(goal.currentAmount)

  const { error } = await supabase
    .from("savings_goals")
    .update({
      title: goal.title,
      target_amount: encryptedTargetAmount,
      current_amount: encryptedCurrentAmount,
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
    amount: parseFinancialValue(i.amount),
    cycle: i.cycle as Iqub["cycle"],
    members: i.members,
    currentRound: i.current_round,
    startDate: i.start_date,
    myTurnDate: i.my_turn_date,
    payoutAmount: parseFinancialValue(i.payout_amount),
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

  // Encrypt financial amounts
  const encryptedAmount = encryptFinancialValue(iqub.amount)
  const encryptedPayoutAmount = encryptFinancialValue(iqub.payoutAmount)

  const { data, error } = await supabase
    .from("iqubs")
    .insert({
      user_id: userId,
      title: iqub.title,
      purpose: iqub.purpose,
      amount: encryptedAmount,
      cycle: iqub.cycle,
      members: iqub.members,
      current_round: iqub.currentRound,
      start_date: iqub.startDate,
      my_turn_date: iqub.myTurnDate,
      payout_amount: encryptedPayoutAmount,
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
    amount: parseFinancialValue(data.amount),
    cycle: data.cycle,
    members: data.members,
    currentRound: data.current_round,
    startDate: data.start_date,
    myTurnDate: data.my_turn_date,
    payoutAmount: parseFinancialValue(data.payout_amount),
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

  // Encrypt financial amounts
  const encryptedAmount = encryptFinancialValue(iqub.amount)
  const encryptedPayoutAmount = encryptFinancialValue(iqub.payoutAmount)

  const { error } = await supabase
    .from("iqubs")
    .update({
      title: iqub.title,
      purpose: iqub.purpose,
      amount: encryptedAmount,
      cycle: iqub.cycle,
      members: iqub.members,
      current_round: iqub.currentRound,
      start_date: iqub.startDate,
      my_turn_date: iqub.myTurnDate,
      payout_amount: encryptedPayoutAmount,
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
    monthlyContribution: parseFinancialValue(i.monthly_contribution),
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

  // Encrypt monthly contribution
  const encryptedMonthlyContribution = encryptFinancialValue(iddir.monthlyContribution)

  const { data, error } = await supabase
    .from("iddirs")
    .insert({
      user_id: userId,
      name: iddir.name,
      monthly_contribution: encryptedMonthlyContribution,
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
    monthlyContribution: parseFinancialValue(data.monthly_contribution),
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

  // Encrypt monthly contribution
  const encryptedMonthlyContribution = encryptFinancialValue(iddir.monthlyContribution)

  const { error } = await supabase
    .from("iddirs")
    .update({
      name: iddir.name,
      monthly_contribution: encryptedMonthlyContribution,
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
    allocated: parseFinancialValue(c.allocated),
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

  // Encrypt allocated amount
  const encryptedAllocated = encryptFinancialValue(category.allocated)

  const { data, error } = await supabase
    .from("budget_categories")
    .insert({
      user_id: userId,
      name: category.name,
      type: category.type,
      allocated: encryptedAllocated,
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
    allocated: parseFinancialValue(data.allocated),
    spent: 0,
    icon: data.icon,
    color: data.color,
    rolloverEnabled: data.rollover_enabled,
  }
}

export async function updateBudgetCategory(categoryId: string, updates: Partial<BudgetCategory>): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  // Encrypt allocated if present
  const updateData: any = {
    name: updates.name,
    type: updates.type,
    icon: updates.icon,
    color: updates.color,
    rollover_enabled: updates.rolloverEnabled,
  }

  if (updates.allocated !== undefined) {
    updateData.allocated = encryptFinancialValue(updates.allocated)
  }

  const { error } = await supabase
    .from("budget_categories")
    .update(updateData)
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
    amount: parseFinancialValue(s.amount),
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

  // Encrypt amount
  const encryptedAmount = encryptFinancialValue(source.amount)

  const { data, error } = await supabase
    .from("income_sources")
    .insert({
      user_id: userId,
      name: source.name,
      type: source.type,
      amount: encryptedAmount,
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
    amount: parseFinancialValue(data.amount),
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

  // Encrypt amount
  const encryptedAmount = encryptFinancialValue(source.amount)

  const { error } = await supabase
    .from("income_sources")
    .update({
      name: source.name,
      type: source.type,
      amount: encryptedAmount,
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

// // ============ RECURRING TRANSACTIONS ============

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
    amount: parseFinancialValue(r.amount),
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

// <<< Add these stubs here >>>
export async function createRecurringTransaction(userId: string, tx: Omit<RecurringTransaction, "id">): Promise<RecurringTransaction | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  // Encrypt amount
  const encryptedAmount = encryptFinancialValue(tx.amount)

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: userId,
      name: tx.name,
      amount: encryptedAmount,
      currency: tx.currency,
      category: tx.category,
      recurrence: tx.recurrence,
      next_due_date: tx.next_due_date,
      last_paid_date: tx.last_paid_date,
      payment_method: tx.payment_method,
      is_active: tx.is_active,
      profile: tx.profile,
      icon: tx.icon,
      notes: tx.notes,
      reminder_days: tx.reminderDays,
    })
    .select()
    .single()

  if (error) {
    console.error("[DataService] Error creating recurring transaction:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    amount: parseFinancialValue(data.amount),
    currency: data.currency,
    category: data.category,
    recurrence: data.recurrence,
    next_due_date: data.next_due_date,
    last_paid_date: data.last_paid_date,
    payment_method: data.payment_method,
    is_active: data.is_active,
    profile: data.profile,
    icon: data.icon,
    notes: data.notes,
    reminderDays: data.reminder_days,
  }
}

export async function updateRecurringTransaction(tx: RecurringTransaction): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  // Encrypt amount
  const encryptedAmount = encryptFinancialValue(tx.amount)

  const { error } = await supabase
    .from("recurring_transactions")
    .update({
      name: tx.name,
      amount: encryptedAmount,
      currency: tx.currency,
      category: tx.category,
      recurrence: tx.recurrence,
      next_due_date: tx.next_due_date,
      last_paid_date: tx.last_paid_date,
      payment_method: tx.payment_method,
      is_active: tx.is_active,
      profile: tx.profile,
      icon: tx.icon,
      notes: tx.notes,
      reminder_days: tx.reminderDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tx.id)

  if (error) {
    console.error("[DataService] Error updating recurring transaction:", error)
    return false
  }
  return true
}

export async function deleteRecurringTransaction(id: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from("recurring_transactions").delete().eq("id", id)

  if (error) {
    console.error("[DataService] Error deleting recurring transaction:", error)
    return false
  }
  return true
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
  if (isDemoMode) {
    const { loadAllUserData: mockLoadAllUserData } = await import('../mock/mock-data-service')
    return mockLoadAllUserData(userId)
  }

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

// ============ AUDIT LOGS ============

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource?: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  status: 'success' | 'failure' | 'warning'
  error_message?: string
  created_at: string
}

export async function logAuditEvent(
  userId: string,
  action: string,
  options: {
    resource?: string
    resourceId?: string
    details?: Record<string, any>
    status?: 'success' | 'failure' | 'warning'
    errorMessage?: string
  } = {}
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    resource: options.resource,
    resource_id: options.resourceId,
    details: options.details,
    status: options.status || 'success',
    error_message: options.errorMessage,
    // Note: ip_address and user_agent would need to be captured from the request context
    // For client-side logging, we can capture user_agent from navigator.userAgent
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  })

  if (error) {
    console.error("[DataService] Error logging audit event:", error)
    return false
  }
  return true
}

export async function getAuditLogs(userId: string, limit = 100): Promise<AuditLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[DataService] Error fetching audit logs:", error)
    return []
  }

  return data.map((log: any) => ({
    id: log.id,
    user_id: log.user_id,
    action: log.action,
    resource: log.resource,
    resource_id: log.resource_id,
    details: log.details,
    ip_address: log.ip_address,
    user_agent: log.user_agent,
    session_id: log.session_id,
    status: log.status,
    error_message: log.error_message,
    created_at: log.created_at,
  }))
}

// ============ DATA RETENTION COMPLIANCE ============

export interface RetentionComplianceResult {
  compliant: boolean;
  violations: {
    table: string;
    count: number;
    oldestRecord: Date | null;
  }[];
}

/**
 * Check if user's data complies with GDPR retention policies
 * - Financial transactions: 7 years
 * - User profiles and non-essential data: 2 years
 */
export async function checkDataRetentionCompliance(userId: string): Promise<RetentionComplianceResult> {
  const supabase = getSupabase();
  if (!supabase) return { compliant: true, violations: [] };

  const violations: RetentionComplianceResult['violations'] = [];

  // Check transactions (7 years)
  const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString();
  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .select('transaction_date')
    .eq('user_id', userId)
    .lt('transaction_date', sevenYearsAgo)
    .order('transaction_date', { ascending: true })
    .limit(1);

  if (!txError && txData && txData.length > 0) {
    violations.push({
      table: 'transactions',
      count: txData.length,
      oldestRecord: new Date(txData[0].transaction_date)
    });
  }

  // Check user data tables (2 years)
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
  const userTables = ['profiles', 'accounts', 'budget_categories', 'savings_goals', 'iqubs', 'iddirs', 'recurring_transactions', 'income_sources'];

  for (const table of userTables) {
    const { data, error } = await supabase
      .from(table)
      .select('created_at')
      .eq('user_id', userId)
      .lt('created_at', twoYearsAgo)
      .order('created_at', { ascending: true })
      .limit(1);

    if (!error && data && data.length > 0) {
      violations.push({
        table,
        count: data.length,
        oldestRecord: new Date(data[0].created_at)
      });
    }
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}

// ============ CONSENT VALIDATION HELPERS ============

/**
 * Validate user consent before processing sensitive data
 */
export async function validateUserConsent(
  userId: string,
  consentTypeCode: string,
  operation: string = 'data_processing'
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const validation = await consentService.validateConsent(userId, consentTypeCode);

    if (!validation.isValid) {
      await logAuditEvent(userId, 'consent_validation_failed', {
        resource: 'consent_validation',
        resourceId: consentTypeCode,
        details: {
          operation,
          reason: validation.reason,
          consentType: validation.consentType?.name
        },
        status: 'warning'
      });

      return {
        valid: false,
        reason: validation.reason
      };
    }

    await logAuditEvent(userId, 'consent_validation_success', {
      resource: 'consent_validation',
      resourceId: consentTypeCode,
      details: {
        operation,
        consentType: validation.consentType?.name
      }
    });

    return { valid: true };
  } catch (error) {
    console.error('[DataService] Error validating consent:', error);
    return {
      valid: false,
      reason: 'Consent validation error'
    };
  }
}

/**
 * Check if user has granted consent for SMS parsing
 */
export async function validateSMSParsingConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'sms_parsing', 'sms_parsing');
  return validation.valid;
}

/**
 * Check if user has granted consent for AI processing
 */
export async function validateAIProcessingConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'ai_advisor', 'ai_processing');
  return validation.valid;
}

/**
 * Check if user has granted consent for voice processing
 */
export async function validateVoiceProcessingConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'voice_processing', 'voice_processing');
  return validation.valid;
}

/**
 * Check if user has granted consent for receipt analysis
 */
export async function validateReceiptAnalysisConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'receipt_analysis', 'receipt_analysis');
  return validation.valid;
}

/**
 * Check if user has granted consent for data sharing
 */
export async function validateDataSharingConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'data_sharing', 'data_sharing');
  return validation.valid;
}

/**
 * Check if user has granted consent for marketing
 */
export async function validateMarketingConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'marketing', 'marketing');
  return validation.valid;
}

/**
 * Check if user has granted consent for analytics
 */
export async function validateAnalyticsConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'analytics', 'analytics');
  return validation.valid;
}

/**
 * Check if user has granted consent for community features
 */
export async function validateCommunityConsent(userId: string): Promise<boolean> {
  const validation = await validateUserConsent(userId, 'community', 'community_features');
  return validation.valid;
}

// ============ GDPR CONSENT MANAGEMENT ============

export async function getUserConsents(userId: string) {
  return consentService.getUserConsents(userId)
}

export async function updateUserConsent(userId: string, consentTypeCode: string, granted: boolean) {
  return consentService.updateConsent(userId, consentTypeCode, granted)
}
