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

// Mock user ID for demo
const MOCK_USER_ID = "demo-user-123"

// ============ MOCK DATA ============

export const mockProfile = {
    id: MOCK_USER_ID,
    full_name: "Demo User",
    phone: "+251911123456",
    financial_goal: "Save for emergency fund and home purchase",
    preferred_language: "en",
    calendar_mode: "ethiopian",
    theme: "light",
    privacy_mode: false,
    ai_consent: true,
    onboarding_completed: true,
    budget_start_date: 1,
}

export const mockAccounts: Account[] = [
    {
        id: "acc-1",
        name: "Commercial Bank of Ethiopia",
        institution: "CBE",
        type: "Bank",
        balance: 25000,
        accountNumber: "1000123456789",
        color: "#1f77b4",
        profile: "Personal",
    },
    {
        id: "acc-2",
        name: "Dashen Bank Savings",
        institution: "Dashen Bank",
        type: "Bank",
        balance: 50000,
        accountNumber: "2000987654321",
        color: "#ff7f0e",
        profile: "Personal",
    },
    {
        id: "acc-3",
        name: "Awash International Bank",
        institution: "Awash Bank",
        type: "Bank",
        balance: 15000,
        accountNumber: "3000567890123",
        color: "#2ca02c",
        profile: "Business",
    },
]

export const mockTransactions: Transaction[] = [
    {
        id: "tx-1",
        title: "Salary Deposit",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 30000,
        type: "income",
        category: "Salary",
        icon: "💼",
        accountId: "acc-1",
        profile: "Personal",
    },
    {
        id: "tx-2",
        title: "Grocery Shopping",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        amount: -2500,
        type: "expense",
        category: "Food & Dining",
        icon: "🛒",
        accountId: "acc-1",
        profile: "Personal",
    },
    {
        id: "tx-3",
        title: "Electricity Bill",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        amount: -800,
        type: "expense",
        category: "Utilities",
        icon: "⚡",
        accountId: "acc-1",
        profile: "Personal",
    },
    {
        id: "tx-4",
        title: "Coffee Shop",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: -150,
        type: "expense",
        category: "Food & Dining",
        icon: "☕",
        accountId: "acc-2",
        profile: "Personal",
    },
    {
        id: "tx-5",
        title: "Business Revenue",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 15000,
        type: "income",
        category: "Business Income",
        icon: "💰",
        accountId: "acc-3",
        profile: "Business",
    },
]

export const mockSavingsGoals: SavingsGoal[] = [
    {
        id: "goal-1",
        title: "Emergency Fund",
        targetAmount: 100000,
        currentAmount: 35000,
        icon: "🛡️",
        color: "#1f77b4",
        roundUpEnabled: true,
        profile: "Personal",
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        defaultAccountId: "acc-2",
    },
    {
        id: "goal-2",
        title: "Home Down Payment",
        targetAmount: 500000,
        currentAmount: 125000,
        icon: "🏠",
        color: "#ff7f0e",
        roundUpEnabled: false,
        profile: "Personal",
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        defaultAccountId: "acc-2",
    },
]

export const mockIqubs: Iqub[] = [
    {
        id: "iqub-1",
        title: "Monthly Savings Iqub",
        purpose: "Emergency savings and investment",
        amount: 5000,
        cycle: "monthly",
        members: 20,
        currentRound: 8,
        startDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
        myTurnDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        payoutAmount: 100000,
        status: "active",
        nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidRounds: 7,
        hasWon: false,
        winningRound: undefined,
        profile: "Personal",
    },
]

export const mockIddirs: Iddir[] = [
    {
        id: "iddir-1",
        name: "St. Mary Iddir",
        monthlyContribution: 200,
        paymentDate: 15,
        lastPaidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        profile: "Personal",
        reminderEnabled: true,
        reminderDaysBefore: 3,
    },
]

export const mockBudgetCategories: BudgetCategory[] = [
    {
        id: "budget-1",
        name: "Food & Dining",
        type: "variable",
        allocated: 8000,
        spent: 2650,
        icon: "🍽️",
        color: "#1f77b4",
        rolloverEnabled: true,
    },
    {
        id: "budget-2",
        name: "Transportation",
        type: "variable",
        allocated: 5000,
        spent: 1200,
        icon: "🚗",
        color: "#ff7f0e",
        rolloverEnabled: false,
    },
    {
        id: "budget-3",
        name: "Utilities",
        type: "fixed",
        allocated: 3000,
        spent: 800,
        icon: "⚡",
        color: "#2ca02c",
        rolloverEnabled: true,
    },
    {
        id: "budget-4",
        name: "Entertainment",
        type: "variable",
        allocated: 2000,
        spent: 450,
        icon: "🎬",
        color: "#d62728",
        rolloverEnabled: false,
    },
]

export const mockIncomeSources: IncomeSource[] = [
    {
        id: "income-1",
        name: "Software Developer Salary",
        type: "Salary",
        amount: 30000,
        frequency: "Monthly",
        payday: 30,
        stability: "Stable",
        remindPayday: true,
        linkedAccountId: "acc-1",
    },
    {
        id: "income-2",
        name: "Freelance Projects",
        type: "Freelance",
        amount: 15000,
        frequency: "Monthly",
        payday: 15,
        stability: "Variable",
        remindPayday: false,
        linkedAccountId: "acc-3",
    },
]

export const mockRecurringTransactions: RecurringTransaction[] = [
    {
        id: "recurring-1",
        name: "Monthly Rent",
        amount: 8000,
        currency: "ETB",
        category: "Housing",
        recurrence: "monthly",
        next_due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        last_paid_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: "Manual",
        is_active: true,
        profile: "Personal",
        icon: "🏠",
        notes: "Apartment rent payment",
        reminderDays: [3],
    },
    {
        id: "recurring-2",
        name: "Internet Bill",
        amount: 1200,
        currency: "ETB",
        category: "Utilities",
        recurrence: "monthly",
        next_due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        last_paid_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: "Auto-Debit",
        is_active: true,
        profile: "Personal",
        icon: "🌐",
        notes: "Ethio Telecom internet subscription",
        reminderDays: [2],
    },
]

// ============ MOCK DATA SERVICE FUNCTIONS ============

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
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockProfile
}

export async function upsertProfile(userId: string, updates: Partial<UserProfileData>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    Object.assign(mockProfile, updates)
    return true
}

// ============ ACCOUNTS ============

export async function getAccounts(userId: string): Promise<Account[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockAccounts]
}

export async function createAccount(userId: string, account: Omit<Account, "id">): Promise<Account | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newAccount: Account = {
        ...account,
        id: `acc-${Date.now()}`,
    }
    mockAccounts.push(newAccount)
    return newAccount
}

export async function updateAccount(account: Account): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockAccounts.findIndex(a => a.id === account.id)
    if (index !== -1) {
        mockAccounts[index] = account
        return true
    }
    return false
}

export async function deleteAccount(accountId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockAccounts.findIndex(a => a.id === accountId)
    if (index !== -1) {
        mockAccounts.splice(index, 1)
        return true
    }
    return false
}

// ============ TRANSACTIONS ============

export async function getTransactions(userId: string): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockTransactions]
}

export async function createTransaction(userId: string, tx: Omit<Transaction, "id">): Promise<Transaction | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newTransaction: Transaction = {
        ...tx,
        id: `tx-${Date.now()}`,
    }
    mockTransactions.push(newTransaction)
    return newTransaction
}

export async function updateTransaction(tx: Transaction): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockTransactions.findIndex(t => t.id === tx.id)
    if (index !== -1) {
        mockTransactions[index] = tx
        return true
    }
    return false
}

export async function deleteTransaction(txId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockTransactions.findIndex(t => t.id === txId)
    if (index !== -1) {
        mockTransactions.splice(index, 1)
        return true
    }
    return false
}

// ============ SAVINGS GOALS ============

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockSavingsGoals]
}

export async function createSavingsGoal(userId: string, goal: Omit<SavingsGoal, "id">): Promise<SavingsGoal | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newGoal: SavingsGoal = {
        ...goal,
        id: `goal-${Date.now()}`,
    }
    mockSavingsGoals.push(newGoal)
    return newGoal
}

export async function updateSavingsGoal(goal: SavingsGoal): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockSavingsGoals.findIndex(g => g.id === goal.id)
    if (index !== -1) {
        mockSavingsGoals[index] = goal
        return true
    }
    return false
}

export async function deleteSavingsGoal(goalId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockSavingsGoals.findIndex(g => g.id === goalId)
    if (index !== -1) {
        mockSavingsGoals.splice(index, 1)
        return true
    }
    return false
}

// ============ IQUBS ============

export async function getIqubs(userId: string): Promise<Iqub[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockIqubs]
}

export async function createIqub(userId: string, iqub: Omit<Iqub, "id">): Promise<Iqub | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newIqub: Iqub = {
        ...iqub,
        id: `iqub-${Date.now()}`,
    }
    mockIqubs.push(newIqub)
    return newIqub
}

export async function updateIqub(iqub: Iqub): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockIqubs.findIndex(i => i.id === iqub.id)
    if (index !== -1) {
        mockIqubs[index] = iqub
        return true
    }
    return false
}

export async function deleteIqub(iqubId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockIqubs.findIndex(i => i.id === iqubId)
    if (index !== -1) {
        mockIqubs.splice(index, 1)
        return true
    }
    return false
}

// ============ IDDIRS ============

export async function getIddirs(userId: string): Promise<Iddir[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockIddirs]
}

export async function createIddir(userId: string, iddir: Omit<Iddir, "id">): Promise<Iddir | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newIddir: Iddir = {
        ...iddir,
        id: `iddir-${Date.now()}`,
    }
    mockIddirs.push(newIddir)
    return newIddir
}

export async function updateIddir(iddir: Iddir): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockIddirs.findIndex(i => i.id === iddir.id)
    if (index !== -1) {
        mockIddirs[index] = iddir
        return true
    }
    return false
}

export async function deleteIddir(iddirId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockIddirs.findIndex(i => i.id === iddirId)
    if (index !== -1) {
        mockIddirs.splice(index, 1)
        return true
    }
    return false
}

// ============ BUDGET CATEGORIES ============

export async function getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockBudgetCategories]
}

export async function createBudgetCategory(
    userId: string,
    category: Omit<BudgetCategory, "id" | "spent">,
): Promise<BudgetCategory | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newCategory: BudgetCategory = {
        ...category,
        id: `budget-${Date.now()}`,
        spent: 0,
    }
    mockBudgetCategories.push(newCategory)
    return newCategory
}

export async function updateBudgetCategory(categoryId: string, updates: Partial<BudgetCategory>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockBudgetCategories.findIndex(c => c.id === categoryId)
    if (index !== -1) {
        mockBudgetCategories[index] = { ...mockBudgetCategories[index], ...updates }
        return true
    }
    return false
}

export async function deleteBudgetCategory(categoryId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockBudgetCategories.findIndex(c => c.id === categoryId)
    if (index !== -1) {
        mockBudgetCategories.splice(index, 1)
        return true
    }
    return false
}

// ============ INCOME SOURCES ============

export async function getIncomeSources(userId: string): Promise<IncomeSource[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockIncomeSources]
}

export async function createIncomeSource(
    userId: string,
    source: Omit<IncomeSource, "id">,
): Promise<IncomeSource | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newSource: IncomeSource = {
        ...source,
        id: `income-${Date.now()}`,
    }
    mockIncomeSources.push(newSource)
    return newSource
}

export async function updateIncomeSource(source: IncomeSource): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockIncomeSources.findIndex(s => s.id === source.id)
    if (index !== -1) {
        mockIncomeSources[index] = source
        return true
    }
    return false
}

export async function deleteIncomeSource(sourceId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockIncomeSources.findIndex(s => s.id === sourceId)
    if (index !== -1) {
        mockIncomeSources.splice(index, 1)
        return true
    }
    return false
}

// ============ RECURRING TRANSACTIONS ============

export async function getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockRecurringTransactions]
}

export async function createRecurringTransaction(userId: string, tx: Omit<RecurringTransaction, "id">): Promise<RecurringTransaction | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newTransaction: RecurringTransaction = {
        ...tx,
        id: `recurring-${Date.now()}`,
    }
    mockRecurringTransactions.push(newTransaction)
    return newTransaction
}

export async function updateRecurringTransaction(tx: RecurringTransaction): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockRecurringTransactions.findIndex(r => r.id === tx.id)
    if (index !== -1) {
        mockRecurringTransactions[index] = tx
        return true
    }
    return false
}

export async function deleteRecurringTransaction(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockRecurringTransactions.findIndex(r => r.id === id)
    if (index !== -1) {
        mockRecurringTransactions.splice(index, 1)
        return true
    }
    return false
}

// ============ AI CONVERSATIONS ============

export interface AIConversation {
    id: string
    messages: Array<{ role: string; content: string; timestamp: string }>
}

export async function getAIConversation(userId: string): Promise<AIConversation | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
        id: "demo-conversation",
        messages: [
            {
                role: "assistant",
                content: "Hello! I'm your AI financial advisor. I can help you with budgeting, savings goals, and financial planning. What would you like to know?",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
        ],
    }
}

export async function saveAIConversation(userId: string, messages: AIConversation["messages"]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
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
    await new Promise(resolve => setTimeout(resolve, 50))
    return true
}

export async function getAuditLogs(userId: string, limit = 100): Promise<AuditLog[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return []
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

export async function checkDataRetentionCompliance(userId: string): Promise<RetentionComplianceResult> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return { compliant: true, violations: [] }
}

// ============ CONSENT VALIDATION HELPERS ============

export async function validateUserConsent(
    userId: string,
    consentTypeCode: string,
    operation: string = 'data_processing'
): Promise<{ valid: boolean; reason?: string }> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return { valid: true }
}

export async function validateSMSParsingConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateAIProcessingConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateVoiceProcessingConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateReceiptAnalysisConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateDataSharingConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateMarketingConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateAnalyticsConsent(userId: string): Promise<boolean> {
    return true
}

export async function validateCommunityConsent(userId: string): Promise<boolean> {
    return true
}