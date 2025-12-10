"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import * as dataService from "@/lib/supabase/data-service"
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

export interface UserData {
  profile: dataService.UserProfileData | null
  accounts: Account[]
  transactions: Transaction[]
  savingsGoals: SavingsGoal[]
  iqubs: Iqub[]
  iddirs: Iddir[]
  budgetCategories: BudgetCategory[]
  incomeSources: IncomeSource[]
  recurringTransactions: RecurringTransaction[]
}

export function useUserData() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load user data from Supabase
  const loadData = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      const result = await dataService.loadAllUserData(userId)
      setData(result)
      setError(null)
    } catch (err) {
      console.error("[v0] Failed to load user data:", err)
      setError("Failed to load your data. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh specific data types
  const refreshAccounts = useCallback(async () => {
    if (!user) return
    const accounts = await dataService.getAccounts(user.id)
    setData((prev) => (prev ? { ...prev, accounts } : null))
  }, [user])

  const refreshTransactions = useCallback(async () => {
    if (!user) return
    const transactions = await dataService.getTransactions(user.id)
    setData((prev) => (prev ? { ...prev, transactions } : null))
  }, [user])

  const refreshGoals = useCallback(async () => {
    if (!user) return
    const savingsGoals = await dataService.getSavingsGoals(user.id)
    setData((prev) => (prev ? { ...prev, savingsGoals } : null))
  }, [user])

  const refreshIqubs = useCallback(async () => {
    if (!user) return
    const iqubs = await dataService.getIqubs(user.id)
    setData((prev) => (prev ? { ...prev, iqubs } : null))
  }, [user])

  const refreshIddirs = useCallback(async () => {
    if (!user) return
    const iddirs = await dataService.getIddirs(user.id)
    setData((prev) => (prev ? { ...prev, iddirs } : null))
  }, [user])

  const refreshBudgetCategories = useCallback(async () => {
    if (!user) return
    const budgetCategories = await dataService.getBudgetCategories(user.id)
    setData((prev) => (prev ? { ...prev, budgetCategories } : null))
  }, [user])

  const refreshIncomeSources = useCallback(async () => {
    if (!user) return
    const incomeSources = await dataService.getIncomeSources(user.id)
    setData((prev) => (prev ? { ...prev, incomeSources } : null))
  }, [user])

  const refreshRecurring = useCallback(async () => {
    if (!user) return
    const recurringTransactions = await dataService.getRecurringTransactions(user.id)
    setData((prev) => (prev ? { ...prev, recurringTransactions } : null))
  }, [user])

  const refreshAll = useCallback(async () => {
    if (!user) return
    await loadData(user.id)
  }, [user, loadData])

  // Initialize auth state
  useEffect(() => {
    // If supabase client is null (missing env vars), run in offline mode
    if (!supabase) {
      console.warn('[useUserData] Supabase client unavailable. Running in offline mode.')
      setLoading(false)
      return
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await loadData(user.id)
      } else {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadData(session.user.id)
      } else {
        setData(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadData])

  return {
    user,
    data,
    loading,
    error,
    refreshAccounts,
    refreshTransactions,
    refreshGoals,
    refreshIqubs,
    refreshIddirs,
    refreshBudgetCategories,
    refreshIncomeSources,
    refreshRecurring,
    refreshAll,
  }
}
