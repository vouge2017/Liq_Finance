"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type {
  AppState,
  AppContextType,
  ThemeMode,
  CalendarMode,
  Account,
  Transaction,
  UserProfile,
  BudgetCategory,
  Iqub,
  SavingsGoal,
  Notification,
  RecurringTransaction,
  NavigationState,
  IncomeSource,
  FinancialContext,
  Iddir,
} from "../types"
import { toEthiopianDateString, toGregorianDateString } from "../utils/dateUtils"
import * as dataService from "@/lib/supabase/data-service"
import type { UserData } from "@/hooks/use-user-data"
import { FamilyMember, Invitation } from "@/types"

// Default budget categories for new users
const defaultBudgetCategories: BudgetCategory[] = [
  {
    id: "rent",
    name: "Rent / Housing",
    type: "fixed",
    allocated: 0,
    spent: 0,
    icon: "Home",
    color: "bg-indigo-500",
    rolloverEnabled: false,
  },
  {
    id: "iddir",
    name: "Iddir & Social",
    type: "fixed",
    allocated: 0,
    spent: 0,
    icon: "Iddir",
    color: "bg-rose-600",
    rolloverEnabled: true,
  },
  {
    id: "bills",
    name: "Bills (Utility)",
    type: "fixed",
    allocated: 0,
    spent: 0,
    icon: "Zap",
    color: "bg-blue-500",
    rolloverEnabled: true,
  },
  {
    id: "groceries",
    name: "Groceries (Teff/Cereals)",
    type: "variable",
    allocated: 0,
    spent: 0,
    icon: "Teff",
    color: "bg-emerald-500",
    rolloverEnabled: false,
  },
  {
    id: "transport",
    name: "Transport (Bajaji/Taxi)",
    type: "variable",
    allocated: 0,
    spent: 0,
    icon: "Bajaji",
    color: "bg-yellow-500",
    rolloverEnabled: false,
  },
  {
    id: "airtime",
    name: "Airtime & Data",
    type: "variable",
    allocated: 0,
    spent: 0,
    icon: "Phone",
    color: "bg-green-500",
    rolloverEnabled: false,
  },
  {
    id: "lifestyle",
    name: "Lifestyle & Cafe",
    type: "variable",
    allocated: 0,
    spent: 0,
    icon: "Coffee",
    color: "bg-purple-400",
    rolloverEnabled: true,
  },
]

// Empty state for new users
const emptyState: AppState = {
  userName: "",
  userPhone: "",
  totalBalance: 0,
  totalIncome: 0,
  totalExpense: 0,
  transactions: [],
  savingsGoals: [],
  iqubs: [],
  iddirs: [],
  recurringTransactions: [],
  expenseCategories: [],
  budgetCategories: defaultBudgetCategories,
  incomeSources: [],
  accounts: [],
  familyMembers: [],
  invitations: [],
  defaultAccountId: undefined,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: React.ReactNode
  initialData?: UserData | null
  userId?: string
  userEmail?: string | null
  onRefresh?: () => Promise<void>
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialData, userId, userEmail, onRefresh }) => {
  // Build initial state from Supabase data or empty
  const buildInitialState = useCallback((): AppState => {
    if (!initialData) return emptyState

    // Calculate totals from transactions
    const totalIncome = initialData.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = initialData.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = initialData.accounts.reduce((sum, a) => sum + a.balance, 0)

    // Calculate spent for budget categories
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const budgetWithSpent = (
      initialData.budgetCategories.length > 0 ? initialData.budgetCategories : defaultBudgetCategories
    ).map((cat) => {
      const spent = initialData.transactions
        .filter((t) => {
          const d = new Date(t.date)
          return (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear &&
            t.type === "expense" &&
            t.category === cat.name
          )
        })
        .reduce((sum, t) => sum + t.amount, 0)
      return { ...cat, spent }
    })

    return {
      userName: initialData.profile?.full_name || "",
      userPhone: initialData.profile?.phone || "",
      userGoal: initialData.profile?.financial_goal || "",
      totalBalance,
      totalIncome,
      totalExpense,
      transactions: initialData.transactions,
      savingsGoals: initialData.savingsGoals,
      iqubs: initialData.iqubs,
      iddirs: initialData.iddirs,
      recurringTransactions: initialData.recurringTransactions,
      expenseCategories: [],
      budgetCategories: budgetWithSpent,
      incomeSources: initialData.incomeSources,
      accounts: initialData.accounts,
      familyMembers: [], // TODO: Load from Supabase
      invitations: [], // TODO: Load from Supabase
      defaultAccountId: initialData.accounts.find((a) => a.name === "Primary")?.id || initialData.accounts[0]?.id,
    }
  }, [initialData])

  const [fullState, setFullState] = useState<AppState>(buildInitialState)

  // Update state when initialData changes
  useEffect(() => {
    setFullState(buildInitialState())
  }, [initialData, buildInitialState])

  // Theme and preferences from profile
  const [theme, setThemeState] = useState<ThemeMode>((initialData?.profile?.theme as ThemeMode) || "dark")
  const [calendarMode, setCalendarModeState] = useState<CalendarMode>(
    (initialData?.profile?.calendar_mode as CalendarMode) || "gregorian",
  )
  const [activeProfile, setActiveProfile] = useState<UserProfile>("Personal")
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [isPrivacyMode, setIsPrivacyMode] = useState(initialData?.profile?.privacy_mode || false)

  const [hasOnboarded, setHasOnboarded] = useState<boolean>(initialData?.profile?.onboarding_completed || false)

  const [aiConsent, setAiConsentState] = useState<boolean>(initialData?.profile?.ai_consent || false)

  const [navigationState, setNavigationState] = useState<NavigationState>({ targetId: null, type: null })

  const [visibleWidgets, setVisibleWidgets] = useState({
    balance: true,
    budget: true,
    goals: true,
    transactions: true,
  })

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [prefillTx, setPrefillTx] = useState<Partial<Transaction> | undefined>(undefined)
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  // Save theme/preferences to Supabase when they change
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme)
      if (userId) {
        dataService.upsertProfile(userId, { theme: newTheme })
      }
    },
    [userId],
  )

  const setCalendarMode = useCallback(
    (mode: CalendarMode) => {
      setCalendarModeState(mode)
      if (userId) {
        dataService.upsertProfile(userId, { calendar_mode: mode })
      }
    },
    [userId],
  )

  const setAiConsent = useCallback(
    (granted: boolean) => {
      setAiConsentState(granted)
      if (userId) {
        dataService.upsertProfile(userId, { ai_consent: granted })
      }
    },
    [userId],
  )

  const completeOnboarding = useCallback(async () => {
    setHasOnboarded(true)
    if (userId) {
      await dataService.upsertProfile(userId, { onboarding_completed: true })
    }
  }, [userId])

  const logout = useCallback(async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = "/auth/login"
  }, [])

  const showNotification = useCallback((message: string, type: "success" | "error" | "info") => {
    setNotification({ id: Date.now(), message, type })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  const navigateTo = useCallback((tab: string, type: "budget" | "goal" | "iqub" | null, id: string | null) => {
    setActiveTab(tab)
    setNavigationState({ targetId: id, type })
  }, [])

  const clearNavigation = useCallback(() => {
    setNavigationState({ targetId: null, type: null })
  }, [])

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => {
      const newValue = !prev
      if (userId) {
        dataService.upsertProfile(userId, { privacy_mode: newValue })
      }
      return newValue
    })
  }, [userId])

  const toggleWidget = useCallback((widget: "balance" | "budget" | "goals" | "transactions") => {
    setVisibleWidgets((prev) => ({ ...prev, [widget]: !prev[widget] }))
  }, [])

  // User profile updates
  const setUserName = useCallback(
    (name: string) => {
      setFullState((prev) => ({ ...prev, userName: name }))
      if (userId) {
        dataService.upsertProfile(userId, { full_name: name })
      }
    },
    [userId],
  )

  const setUserPhone = useCallback(
    (phone: string) => {
      setFullState((prev) => ({ ...prev, userPhone: phone }))
      if (userId) {
        dataService.upsertProfile(userId, { phone })
      }
    },
    [userId],
  )

  const setUserGoal = useCallback(
    (goal: string) => {
      setFullState((prev) => ({ ...prev, userGoal: goal }))
      if (userId) {
        dataService.upsertProfile(userId, { financial_goal: goal })
      }
    },
    [userId],
  )

  // ============ ACCOUNT CRUD WITH SUPABASE SYNC ============

  const addAccount = useCallback(
    async (account: Account) => {
      if (!userId) return

      const newAccount = await dataService.createAccount(userId, account)
      if (newAccount) {
        setFullState((prev) => ({ ...prev, accounts: [...prev.accounts, newAccount] }))
        showNotification("Account added successfully", "success")
      } else {
        showNotification("Could not create account. Please try again.", "error")
      }
    },
    [userId, showNotification],
  )

  const updateAccount = useCallback(
    async (updatedAccount: Account) => {
      const success = await dataService.updateAccount(updatedAccount)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          accounts: prev.accounts.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)),
        }))
        showNotification("Account updated", "success")
      } else {
        showNotification("Failed to update account", "error")
      }
    },
    [showNotification],
  )

  const deleteAccount = useCallback(
    async (id: string) => {
      const success = await dataService.deleteAccount(id)
      if (success) {
        setFullState((prev) => {
          const newAccounts = prev.accounts.filter((a) => a.id !== id)
          const newDefault = prev.defaultAccountId === id ? newAccounts[0]?.id : prev.defaultAccountId
          return { ...prev, accounts: newAccounts, defaultAccountId: newDefault }
        })
        showNotification("Account deleted", "info")
      } else {
        showNotification("Failed to delete account", "error")
      }
    },
    [showNotification],
  )

  const setDefaultAccount = useCallback((id: string) => {
    setFullState((prev) => ({ ...prev, defaultAccountId: id }))
  }, [])

  // ============ TRANSACTION CRUD WITH SUPABASE SYNC ============

  const addTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!userId) return

      const isIncome = transaction.type === "income"

      // Create transaction in DB
      const newTx = await dataService.createTransaction(userId, transaction)
      if (!newTx) {
        showNotification("Could not save transaction. Check your connection.", "error")
        return
      }

      // Update local state and account balance
      setFullState((prev) => {
        let newAccounts = prev.accounts

        if (transaction.accountId) {
          newAccounts = prev.accounts.map((acc) => {
            if (acc.id === transaction.accountId) {
              const newBalance = acc.balance + (isIncome ? transaction.amount : -transaction.amount)
              // Also update in DB
              dataService.updateAccount({ ...acc, balance: newBalance })
              return { ...acc, balance: newBalance }
            }
            return acc
          })
        }

        return {
          ...prev,
          transactions: [newTx, ...prev.transactions],
          accounts: newAccounts,
          totalIncome: isIncome ? prev.totalIncome + transaction.amount : prev.totalIncome,
          totalExpense: !isIncome ? prev.totalExpense + transaction.amount : prev.totalExpense,
          totalBalance: isIncome ? prev.totalBalance + transaction.amount : prev.totalBalance - transaction.amount,
        }
      })

      showNotification("Transaction added", "success")
    },
    [userId, showNotification],
  )

  const updateTransaction = useCallback(
    async (updatedTx: Transaction) => {
      const success = await dataService.updateTransaction(updatedTx)
      if (!success) {
        showNotification("Failed to update transaction", "error")
        return
      }

      setFullState((prev) => {
        const oldTx = prev.transactions.find((t) => t.id === updatedTx.id)
        if (!oldTx) return prev

        let newAccounts = prev.accounts

        // Revert old transaction effect
        if (oldTx.accountId) {
          const oldIsIncome = oldTx.type === "income"
          newAccounts = newAccounts.map((acc) => {
            if (acc.id === oldTx.accountId) {
              return { ...acc, balance: acc.balance - (oldIsIncome ? oldTx.amount : -oldTx.amount) }
            }
            return acc
          })
        }

        // Apply new transaction effect
        if (updatedTx.accountId) {
          const newIsIncome = updatedTx.type === "income"
          newAccounts = newAccounts.map((acc) => {
            if (acc.id === updatedTx.accountId) {
              const newAcc = { ...acc, balance: acc.balance + (newIsIncome ? updatedTx.amount : -updatedTx.amount) }
              dataService.updateAccount(newAcc)
              return newAcc
            }
            return acc
          })
        }

        return {
          ...prev,
          accounts: newAccounts,
          transactions: prev.transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t)),
        }
      })

      showNotification("Transaction updated", "success")
    },
    [showNotification],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      const success = await dataService.deleteTransaction(id)
      if (!success) {
        showNotification("Failed to delete transaction", "error")
        return
      }

      setFullState((prev) => {
        const tx = prev.transactions.find((t) => t.id === id)
        if (!tx) return prev

        let newAccounts = prev.accounts
        if (tx.accountId) {
          newAccounts = newAccounts.map((acc) => {
            if (acc.id === tx.accountId) {
              const newAcc = { ...acc, balance: acc.balance - (tx.type === "income" ? tx.amount : -tx.amount) }
              dataService.updateAccount(newAcc)
              return newAcc
            }
            return acc
          })
        }

        return { ...prev, accounts: newAccounts, transactions: prev.transactions.filter((t) => t.id !== id) }
      })

      showNotification("Transaction deleted", "info")
    },
    [showNotification],
  )

  const transferFunds = useCallback(
    async (fromId: string, toId: string, amount: number) => {
      if (!userId) return

      const fromAcc = fullState.accounts.find((a) => a.id === fromId)
      const toAcc = fullState.accounts.find((a) => a.id === toId)

      if (!fromAcc || !toAcc) {
        showNotification("Account error", "error")
        return
      }

      if (fromAcc.balance < amount) {
        showNotification(`Insufficient funds in ${fromAcc.name}. Balance: ${fromAcc.balance.toLocaleString()}`, "error")
        return
      }

      // Update accounts in DB
      const newFromAcc = { ...fromAcc, balance: fromAcc.balance - amount }
      const newToAcc = { ...toAcc, balance: toAcc.balance + amount }

      await Promise.all([dataService.updateAccount(newFromAcc), dataService.updateAccount(newToAcc)])

      // Create transfer transaction
      const transferTx: Omit<Transaction, "id"> = {
        title: `Transfer to ${toAcc.name}`,
        amount: amount,
        type: "transfer",
        category: "Transfer",
        date: new Date().toISOString(),
        icon: "card",
        accountId: fromId,
        profile: fromAcc.profile,
      }

      const newTx = await dataService.createTransaction(userId, transferTx)

      setFullState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc) => {
          if (acc.id === fromId) return newFromAcc
          if (acc.id === toId) return newToAcc
          return acc
        }),
        transactions: newTx ? [{ ...transferTx, id: newTx.id }, ...prev.transactions] : prev.transactions,
      }))

      showNotification("Transfer successful", "success")
    },
    [userId, fullState.accounts, showNotification],
  )

  // ============ SAVINGS GOALS CRUD ============

  const addSavingsGoal = useCallback(
    async (goal: SavingsGoal) => {
      if (!userId) return

      const newGoal = await dataService.createSavingsGoal(userId, goal)
      if (newGoal) {
        setFullState((prev) => ({ ...prev, savingsGoals: [...prev.savingsGoals, newGoal] }))
        showNotification("Goal created!", "success")
      } else {
        showNotification("Failed to create goal", "error")
      }
    },
    [userId, showNotification],
  )

  const updateSavingsGoal = useCallback(
    async (updatedGoal: SavingsGoal) => {
      const success = await dataService.updateSavingsGoal(updatedGoal)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          savingsGoals: prev.savingsGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
        }))
        showNotification("Goal updated", "success")
      }
    },
    [showNotification],
  )

  const deleteSavingsGoal = useCallback(
    async (id: string) => {
      const success = await dataService.deleteSavingsGoal(id)
      if (success) {
        setFullState((prev) => ({ ...prev, savingsGoals: prev.savingsGoals.filter((g) => g.id !== id) }))
        showNotification("Goal deleted", "info")
      }
    },
    [showNotification],
  )

  const contributeToGoal = useCallback(
    async (goalId: string, amount: number, fromAccountId: string) => {
      if (!userId) return

      const fromAcc = fullState.accounts.find((a) => a.id === fromAccountId)
      const goal = fullState.savingsGoals.find((g) => g.id === goalId)

      if (!fromAcc || !goal) return

      if (fromAcc.balance < amount) {
        showNotification(`Insufficient funds in ${fromAcc.name} to contribute.`, "error")
        return
      }

      // Update account and goal
      const newAcc = { ...fromAcc, balance: fromAcc.balance - amount }
      const newGoal = { ...goal, currentAmount: goal.currentAmount + amount }

      await Promise.all([dataService.updateAccount(newAcc), dataService.updateSavingsGoal(newGoal)])

      // Create contribution transaction
      const tx: Omit<Transaction, "id"> = {
        title: `Contribute to ${goal.title}`,
        amount: amount,
        type: "transfer",
        category: "Savings",
        date: new Date().toISOString(),
        icon: "Target",
        accountId: fromAccountId,
        profile: fromAcc.profile,
        goalId: goalId,
      }

      const newTx = await dataService.createTransaction(userId, tx)

      setFullState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.id === fromAccountId ? newAcc : a)),
        savingsGoals: prev.savingsGoals.map((g) => (g.id === goalId ? newGoal : g)),
        transactions: newTx ? [{ ...tx, id: newTx.id }, ...prev.transactions] : prev.transactions,
      }))

      showNotification(`Added ${amount.toLocaleString()} to ${goal.title}!`, "success")
    },
    [userId, fullState.accounts, fullState.savingsGoals, showNotification],
  )

  // ============ IQUB CRUD ============

  const addIqub = useCallback(
    async (iqub: Iqub) => {
      if (!userId) return

      const newIqub = await dataService.createIqub(userId, iqub)
      if (newIqub) {
        setFullState((prev) => ({ ...prev, iqubs: [...prev.iqubs, newIqub] }))
        showNotification("Iqub started!", "success")
      }
    },
    [userId, showNotification],
  )

  const updateIqub = useCallback(
    async (updatedIqub: Iqub) => {
      const success = await dataService.updateIqub(updatedIqub)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          iqubs: prev.iqubs.map((i) => (i.id === updatedIqub.id ? updatedIqub : i)),
        }))
        showNotification("Iqub updated", "success")
      }
    },
    [showNotification],
  )

  const deleteIqub = useCallback(
    async (id: string) => {
      const success = await dataService.deleteIqub(id)
      if (success) {
        setFullState((prev) => ({ ...prev, iqubs: prev.iqubs.filter((i) => i.id !== id) }))
        showNotification("Iqub deleted", "info")
      }
    },
    [showNotification],
  )

  const markIqubPaid = useCallback(
    async (id: string, accountId: string) => {
      if (!userId) return

      const iqub = fullState.iqubs.find((i) => i.id === id)
      const account = fullState.accounts.find((a) => a.id === accountId)

      if (!iqub || !account) return

      if (account.balance < iqub.amount) {
        showNotification(`Insufficient funds in ${account.name} for Iqub payment.`, "error")
        return
      }

      const newAcc = { ...account, balance: account.balance - iqub.amount }
      const newIqub = {
        ...iqub,
        paidRounds: iqub.paidRounds + 1,
        currentRound: Math.min(iqub.currentRound + 1, iqub.members),
      }

      await Promise.all([dataService.updateAccount(newAcc), dataService.updateIqub(newIqub)])

      const tx: Omit<Transaction, "id"> = {
        title: `Iqub Payment: ${iqub.title}`,
        amount: iqub.amount,
        type: "expense",
        category: "Iqub",
        date: new Date().toISOString(),
        icon: "Users",
        accountId: accountId,
        profile: account.profile,
        iqubId: id,
      }

      const newTx = await dataService.createTransaction(userId, tx)

      setFullState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.id === accountId ? newAcc : a)),
        iqubs: prev.iqubs.map((i) => (i.id === id ? newIqub : i)),
        transactions: newTx ? [{ ...tx, id: newTx.id }, ...prev.transactions] : prev.transactions,
      }))

      showNotification("Iqub payment successful!", "success")
    },
    [userId, fullState.iqubs, fullState.accounts, showNotification],
  )

  const markIqubWon = useCallback(
    async (id: string, accountId: string, roundNum: number) => {
      if (!userId) return

      const iqub = fullState.iqubs.find((i) => i.id === id)
      const account = fullState.accounts.find((a) => a.id === accountId)

      if (!iqub || !account) return

      const newAcc = { ...account, balance: account.balance + iqub.payoutAmount }
      const newIqub = { ...iqub, hasWon: true, winningRound: roundNum }

      await Promise.all([dataService.updateAccount(newAcc), dataService.updateIqub(newIqub)])

      const tx: Omit<Transaction, "id"> = {
        title: `Iqub Win: ${iqub.title}`,
        amount: iqub.payoutAmount,
        type: "income",
        category: "Iqub Win",
        date: new Date().toISOString(),
        icon: "Trophy",
        accountId: accountId,
        profile: activeProfile === "All" ? "Personal" : activeProfile,
        iqubId: id,
      }

      const newTx = await dataService.createTransaction(userId, tx)

      setFullState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.id === accountId ? newAcc : a)),
        iqubs: prev.iqubs.map((i) => (i.id === id ? newIqub : i)),
        transactions: newTx ? [{ ...tx, id: newTx.id }, ...prev.transactions] : prev.transactions,
      }))

      showNotification("Payout received!", "success")
    },
    [userId, fullState.iqubs, fullState.accounts, activeProfile, showNotification],
  )

  // ============ IDDIR CRUD ============

  const addIddir = useCallback(
    async (iddir: Iddir) => {
      if (!userId) return

      const newIddir = await dataService.createIddir(userId, iddir)
      if (newIddir) {
        setFullState((prev) => ({ ...prev, iddirs: [...prev.iddirs, newIddir] }))
        showNotification("Iddir added to profile", "success")
      }
    },
    [userId, showNotification],
  )

  const updateIddir = useCallback(
    async (updatedIddir: Iddir) => {
      const success = await dataService.updateIddir(updatedIddir)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          iddirs: prev.iddirs.map((i) => (i.id === updatedIddir.id ? updatedIddir : i)),
        }))
        showNotification("Iddir updated", "success")
      }
    },
    [showNotification],
  )

  const deleteIddir = useCallback(
    async (id: string) => {
      const success = await dataService.deleteIddir(id)
      if (success) {
        setFullState((prev) => ({ ...prev, iddirs: prev.iddirs.filter((i) => i.id !== id) }))
        showNotification("Iddir removed", "info")
      }
    },
    [showNotification],
  )

  const markIddirPaid = useCallback(
    async (id: string, accountId: string) => {
      if (!userId) return

      const iddir = fullState.iddirs.find((i) => i.id === id)
      const account = fullState.accounts.find((a) => a.id === accountId)

      if (!iddir || !account) return

      if (account.balance < iddir.monthlyContribution) {
        showNotification("Insufficient balance", "error")
        return
      }

      const newAcc = { ...account, balance: account.balance - iddir.monthlyContribution }
      const newIddir = { ...iddir, lastPaidDate: new Date().toISOString() }

      await Promise.all([dataService.updateAccount(newAcc), dataService.updateIddir(newIddir)])

      const tx: Omit<Transaction, "id"> = {
        title: `Iddir Payment: ${iddir.name}`,
        amount: iddir.monthlyContribution,
        type: "expense",
        category: "Iddir & Social",
        date: new Date().toISOString(),
        icon: "Iddir",
        accountId: accountId,
        profile: account.profile,
        iddirId: id,
      }

      const newTx = await dataService.createTransaction(userId, tx)

      setFullState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.id === accountId ? newAcc : a)),
        iddirs: prev.iddirs.map((i) => (i.id === id ? newIddir : i)),
        transactions: newTx ? [{ ...tx, id: newTx.id }, ...prev.transactions] : prev.transactions,
      }))

      showNotification("Iddir payment recorded", "success")
    },
    [userId, fullState.iddirs, fullState.accounts, showNotification],
  )

  // ============ RECURRING TRANSACTIONS ============

  const addRecurringTransaction = useCallback(
    async (tx: RecurringTransaction) => {
      if (!userId) return

      const newTx = await dataService.createRecurringTransaction(userId, tx)
      if (newTx) {
        setFullState((prev) => ({
          ...prev,
          recurringTransactions: [...prev.recurringTransactions, newTx],
        }))
        showNotification("Subscription Added", "success")
      }
    },
    [userId, showNotification],
  )

  const updateRecurringTransaction = useCallback(
    async (tx: RecurringTransaction) => {
      const success = await dataService.updateRecurringTransaction(tx)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          recurringTransactions: prev.recurringTransactions.map((t) => (t.id === tx.id ? tx : t)),
        }))
        showNotification("Subscription Updated", "success")
      }
    },
    [showNotification],
  )

  const deleteRecurringTransaction = useCallback(
    async (id: string) => {
      const success = await dataService.deleteRecurringTransaction(id)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          recurringTransactions: prev.recurringTransactions.filter((t) => t.id !== id),
        }))
        showNotification("Subscription Deleted", "info")
      }
    },
    [showNotification],
  )

  const scanForSubscriptions = useCallback(() => {
    showNotification("Scanning for subscriptions...", "info")
    // This would be enhanced with AI detection in production
  }, [showNotification])

  // ============ BUDGET CATEGORIES ============

  const addBudgetCategory = useCallback(
    async (category: BudgetCategory) => {
      if (!userId) return

      const newCat = await dataService.createBudgetCategory(userId, category)
      if (newCat) {
        setFullState((prev) => ({
          ...prev,
          budgetCategories: [...prev.budgetCategories, newCat],
        }))
        showNotification(`Budget category '${category.name}' added`, "success")
      }
    },
    [userId, showNotification],
  )

  const updateBudgetCategory = useCallback(
    async (id: string, updates: Partial<BudgetCategory>) => {
      const success = await dataService.updateBudgetCategory(id, updates)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          budgetCategories: prev.budgetCategories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
        }))
        if (updates.name) showNotification("Category updated", "success")
      }
    },
    [showNotification],
  )

  const deleteBudgetCategory = useCallback(
    async (id: string) => {
      const success = await dataService.deleteBudgetCategory(id)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          budgetCategories: prev.budgetCategories.filter((c) => c.id !== id),
        }))
        showNotification("Budget category deleted", "info")
      }
    },
    [showNotification],
  )

  // ============ INCOME SOURCES ============

  const addIncomeSource = useCallback(
    async (source: IncomeSource) => {
      if (!userId) return

      const newSource = await dataService.createIncomeSource(userId, source)
      if (newSource) {
        setFullState((prev) => ({
          ...prev,
          incomeSources: [...prev.incomeSources, newSource],
        }))
        showNotification("Income Source Added", "success")
      }
    },
    [userId, showNotification],
  )

  const updateIncomeSource = useCallback(
    async (updatedSource: IncomeSource) => {
      const success = await dataService.updateIncomeSource(updatedSource)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          incomeSources: prev.incomeSources.map((s) => (s.id === updatedSource.id ? updatedSource : s)),
        }))
        showNotification("Income Source Updated", "success")
      }
    },
    [showNotification],
  )

  const deleteIncomeSource = useCallback(
    async (id: string) => {
      const success = await dataService.deleteIncomeSource(id)
      if (success) {
        setFullState((prev) => ({
          ...prev,
          incomeSources: prev.incomeSources.filter((s) => s.id !== id),
        }))
        showNotification("Income Source Removed", "info")
      }
    },
    [showNotification],
  )

  // ============ FINANCIAL CONTEXT ============

  const getFinancialContext = useCallback((): FinancialContext => {
    const { incomeSources, budgetCategories, recurringTransactions, totalBalance, iddirs } = fullState

    const monthlyIncome = incomeSources.reduce((sum, src) => {
      if (src.frequency === "Monthly") return sum + src.amount
      if (src.frequency === "Weekly") return sum + src.amount * 4
      if (src.frequency === "Bi-Weekly") return sum + src.amount * 2
      return sum
    }, 0)

    const fixedBudgets = budgetCategories.filter((c) => c.type === "fixed").reduce((sum, c) => sum + c.allocated, 0)
    const subs = recurringTransactions
      .filter((r) => r.is_active && r.recurrence === "monthly")
      .reduce((sum, r) => sum + r.amount, 0)
    const iddirCost = iddirs.filter((i) => i.status === "active").reduce((sum, i) => sum + i.monthlyContribution, 0)

    const fixedObligations = fixedBudgets + subs + iddirCost
    const variableAllocated = budgetCategories
      .filter((c) => c.type === "variable")
      .reduce((sum, c) => sum + c.allocated, 0)
    const burnRate = variableAllocated

    return {
      monthlyIncome,
      fixedObligations,
      disposableIncome: Math.max(0, monthlyIncome - fixedObligations),
      burnRate,
      savingsRate: monthlyIncome > 0 ? (monthlyIncome - fixedObligations - burnRate) / monthlyIncome : 0,
      runway: burnRate > 0 ? totalBalance / burnRate : 0,
    }
  }, [fullState])

  // ============ PAYEE HISTORY ============

  const payeeHistory = useMemo(() => {
    const uniqueTitles = new Set(fullState.transactions.map((t) => t.title))
    return Array.from(uniqueTitles)
  }, [fullState.transactions])

  const mostFrequentAccountId = useMemo(() => {
    const counts: Record<string, number> = {}
    fullState.transactions.forEach((t) => {
      if (t.accountId) counts[t.accountId] = (counts[t.accountId] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted.length > 0 ? sorted[0][0] : fullState.accounts[0]?.id
  }, [fullState.transactions, fullState.accounts])

  // ============ BUDGET SPENT CALCULATION ============

  useEffect(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    setFullState((prev) => {
      const newBudgetCategories = prev.budgetCategories.map((cat) => {
        const spent = prev.transactions
          .filter((t) => {
            const d = new Date(t.date)
            return (
              d.getMonth() === currentMonth &&
              d.getFullYear() === currentYear &&
              t.type === "expense" &&
              t.category === cat.name
            )
          })
          .reduce((sum, t) => sum + t.amount, 0)

        return cat.spent !== spent ? { ...cat, spent } : cat
      })

      const isDifferent = JSON.stringify(newBudgetCategories) !== JSON.stringify(prev.budgetCategories)
      if (!isDifferent) return prev

      return { ...prev, budgetCategories: newBudgetCategories }
    })
  }, [fullState.transactions])

  // ============ FILTERED STATE ============

  const filteredState = useMemo(() => {
    if (activeProfile === "All") return fullState

    return {
      ...fullState,
      accounts: fullState.accounts.filter((a) => a.profile === activeProfile),
      transactions: fullState.transactions.filter((t) => t.profile === activeProfile),
      savingsGoals: fullState.savingsGoals.filter((g) => g.profile === activeProfile),
      iqubs: fullState.iqubs.filter((i) => i.profile === activeProfile),
      iddirs: fullState.iddirs.filter((i) => i.profile === activeProfile),
      recurringTransactions: fullState.recurringTransactions.filter((r) => r.profile === activeProfile),
      totalBalance: fullState.accounts
        .filter((a) => a.profile === activeProfile)
        .reduce((sum, acc) => sum + acc.balance, 0),
      totalIncome: fullState.transactions
        .filter((t) => t.profile === activeProfile && t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: fullState.transactions
        .filter((t) => t.profile === activeProfile && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    }
  }, [fullState, activeProfile])

  // ============ TRANSACTION MODAL ============

  const openTransactionModal = useCallback(
    (tx?: Transaction, prefill?: Partial<Transaction>) => {
      if (tx) {
        setEditingTransaction(tx)
        setPrefillTx(undefined)
      } else {
        setEditingTransaction(null)
        const defaultAccId = fullState.defaultAccountId || mostFrequentAccountId
        setPrefillTx({ accountId: defaultAccId, date: new Date().toISOString(), type: "expense", ...prefill })
      }
      setIsTransactionModalOpen(true)
    },
    [fullState.defaultAccountId, mostFrequentAccountId],
  )

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false)
    setEditingTransaction(null)
    setPrefillTx(undefined)
  }, [])

  // ============ THEME EFFECT ============

  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
  }, [theme])

  // ============ DATE FORMATTING ============

  const formatDate = useCallback(
    (dateStr: string) => {
      if (!dateStr) return ""
      if (calendarMode === "ethiopian") {
        return toEthiopianDateString(dateStr)
      }
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
    [calendarMode],
  )

  // ============ COMMUNITY ============

  const addFamilyMember = useCallback((member: FamilyMember) => {
    setFullState((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, member],
    }))
    showNotification(`Added ${member.name} to family`, "success")
  }, [showNotification])

  const removeFamilyMember = useCallback((id: string) => {
    setFullState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((m) => m.id !== id),
    }))
    showNotification("Family member removed", "info")
  }, [showNotification])

  const sendInvitation = useCallback((emailOrPhone: string, role: 'Admin' | 'Member' | 'Viewer') => {
    const newInvite: Invitation = {
      id: Date.now().toString(),
      emailOrPhone,
      role,
      status: 'Pending',
      sentDate: new Date().toISOString(),
    }
    setFullState((prev) => ({
      ...prev,
      invitations: [...prev.invitations, newInvite],
    }))
    showNotification(`Invitation sent to ${emailOrPhone}`, "success")
  }, [showNotification])

  const value = useMemo(
    () => ({
      state: filteredState,
      theme,
      setTheme,
      calendarMode,
      setCalendarMode,
      activeProfile,
      setActiveProfile,
      activeTab,
      setActiveTab,
      navigationState,
      navigateTo,
      clearNavigation,
      formatDate,
      aiConsent,
      setAiConsent,
      setUserName: (name: string) => setFullState((prev) => ({ ...prev, userName: name })),
      setUserPhone: (phone: string) => setFullState((prev) => ({ ...prev, userPhone: phone })),
      setUserGoal: (goal: string) => setFullState((prev) => ({ ...prev, userGoal: goal })),
      addAccount,
      updateAccount,
      deleteAccount,
      setDefaultAccount,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      transferFunds,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addIqub,
      updateIqub,
      deleteIqub,
      markIqubPaid,
      markIqubWon,
      addIddir,
      deleteIddir,
      markIddirPaid,
      updateIddir,
      contributeToGoal,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      scanForSubscriptions,
      addBudgetCategory,
      updateBudgetCategory,
      deleteBudgetCategory,
      addIncomeSource,
      updateIncomeSource,
      deleteIncomeSource,
      getFinancialContext,
      isPrivacyMode,
      togglePrivacyMode,
      isTransactionModalOpen,
      editingTransaction,
      prefillTx,
      openTransactionModal,
      closeTransactionModal,
      payeeHistory,
      scannedImage,
      setScannedImage,
      visibleWidgets,
      toggleWidget,
      notification,
      showNotification,
      hasOnboarded,
      completeOnboarding,
      logout,
      addFamilyMember,
      removeFamilyMember,
      sendInvitation,
    }),
    [
      filteredState,
      theme,
      setTheme,
      calendarMode,
      setCalendarMode,
      activeProfile,
      activeTab,
      navigationState,
      navigateTo,
      clearNavigation,
      formatDate,
      aiConsent,
      setAiConsent,
      addAccount,
      updateAccount,
      deleteAccount,
      setDefaultAccount,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      transferFunds,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addIqub,
      updateIqub,
      deleteIqub,
      markIqubPaid,
      markIqubWon,
      addIddir,
      deleteIddir,
      markIddirPaid,
      updateIddir,
      contributeToGoal,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      scanForSubscriptions,
      addBudgetCategory,
      updateBudgetCategory,
      deleteBudgetCategory,
      addIncomeSource,
      updateIncomeSource,
      deleteIncomeSource,
      getFinancialContext,
      isPrivacyMode,
      togglePrivacyMode,
      isTransactionModalOpen,
      editingTransaction,
      prefillTx,
      openTransactionModal,
      closeTransactionModal,
      payeeHistory,
      scannedImage,
      visibleWidgets,
      toggleWidget,
      notification,
      showNotification,
      hasOnboarded,
      completeOnboarding,
      logout,
      addFamilyMember,
      removeFamilyMember,
      sendInvitation,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) throw new Error("useAppContext must be used within an AppProvider")
  return context
}
