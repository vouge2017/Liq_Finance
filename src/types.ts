export type ThemeMode = 'dark' | 'light' | 'dim';
export type CalendarMode = 'gregorian' | 'ethiopian';
export type UserProfile = 'Personal' | 'Family' | 'Business' | 'All';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface IncomeSource {
  id: string;
  name: string; // "Salary", "Shop Income"
  type: 'Salary' | 'Business' | 'Freelance' | 'Rent' | 'Iqub' | 'Side Hustle' | 'Other';
  amount: number; // Expected amount
  frequency: 'Monthly' | 'Weekly' | 'Bi-Weekly' | 'Irregular';
  payday?: number; // Day of month (1-31)
  stability: 'Stable' | 'Variable'; // "Salary" is Stable, "Business" is Variable
  remindPayday?: boolean; // New: Reminder preference
  linkedAccountId?: string; // New: Account to deposit into
}

// The "Brain's Memory" - Calculated metrics for advice
export interface FinancialContext {
  monthlyIncome: number; // Total expected
  fixedObligations: number; // Sum of Fixed Envelopes + Subscriptions + Iddir
  disposableIncome: number; // Income - Fixed
  burnRate: number; // Average variable spending over last 3 months
  savingsRate: number; // % of income saved
  runway: number; // Months of survival (Total Balance / Burn Rate)
}

export interface Transaction {
  id: string;
  title: string;
  date: string; // ISO string or simple string
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  icon?: string;
  accountId?: string; // Link transaction to specific account
  profile: UserProfile; // 'Personal' or 'Family'
  goalId?: string; // Link to a savings goal
  iqubId?: string; // Link to an Iqub
  iddirId?: string; // Link to Iddir
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  currency: string; // Default 'ETB'
  category: string;
  recurrence: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  next_due_date: string; // ISO Date
  last_paid_date?: string; // Track when it was last paid
  payment_method: 'Auto-Debit' | 'Manual' | 'CBE Account' | 'Telebirr' | 'Cash';
  source_tx_id?: string; // ID of the detection source
  is_active: boolean;
  profile: UserProfile;
  // New Fields
  icon: string;
  notes?: string;
  reminderDays?: number[]; // e.g. [1, 3] means remind 1 day and 3 days before
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string; // 'car' | 'emergency' | 'house'
  color: string;
  roundUpEnabled?: boolean;
  profile: UserProfile;
  deadline?: string; // ISO Date string
  defaultAccountId?: string; // The preferred account for contributions
}

export interface Iqub {
  id: string;
  title: string;
  purpose: string; // New: What is this for?
  amount: number; // Contribution amount
  cycle: 'daily' | 'weekly' | 'monthly'; // Added 'daily'
  members: number; // Used for total rounds
  currentRound: number; // 1 to members
  startDate: string; // New: Required for schedule generation
  myTurnDate?: string; // Optional (Calculated preferred)
  payoutAmount: number;
  status: 'active' | 'completed';
  nextPaymentDate: string;
  paidRounds: number; // How many times user contributed
  hasWon: boolean; // Did they receive the payout yet?
  winningRound?: number; // Which specific round did they win? (e.g. Round 2)
  profile: UserProfile;
}

export interface Iddir {
  id: string;
  name: string; // "Community Iddir"
  monthlyContribution: number;
  paymentDate: number; // Day of month (1-30)
  lastPaidDate?: string; // ISO Date
  status: 'active' | 'inactive';
  profile: UserProfile;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  color: string; // Tailwind class like 'bg-cyan-400'
  percentage: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'fixed' | 'variable';
  allocated: number; // The limit set by user
  spent: number; // Calculated from transactions
  icon: string;
  color: string;
  rolloverEnabled?: boolean; // New feature
}

export interface Account {
  id: string;
  name: string; // e.g., "Savings", "Salary"
  institution: string; // 'CBE' | 'Dashen' | 'Telebirr' | 'Cash'
  type: 'Bank' | 'Mobile Money' | 'Cash';
  balance: number;
  accountNumber?: string;
  color: string; // Tailwind gradient class
  profile: UserProfile;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Admin' | 'Member' | 'Viewer';
  phone?: string;
  email?: string;
  status: 'Active' | 'Pending' | 'Invited';
  joinedDate: string;
  avatar?: string;
}

export interface Invitation {
  id: string;
  emailOrPhone: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: 'Pending' | 'Accepted' | 'Expired';
  sentDate: string;
}

export interface AppState {
  userName: string; // New: Personalization
  userPhone?: string; // New: Identity
  userGoal?: string; // New: Main financial focus
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  iqubs: Iqub[]; // Added Iqubs
  iddirs: Iddir[]; // Added Iddirs (Phase 2)
  recurringTransactions: RecurringTransaction[]; // Added Recurring
  expenseCategories: ExpenseCategory[];
  budgetCategories: BudgetCategory[]; // Added Budget Categories
  incomeSources: IncomeSource[]; // New: The Financial Brain
  accounts: Account[];
  familyMembers: FamilyMember[]; // New: Community
  invitations: Invitation[]; // New: Community
  defaultAccountId?: string;
}

export interface NavigationState {
  targetId: string | null;
  type: 'budget' | 'goal' | 'iqub' | 'community' | null;
}

export interface AppContextType {
  state: AppState;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Navigation Helper
  navigationState: NavigationState;
  navigateTo: (tab: string, type: 'budget' | 'goal' | 'iqub' | null, id: string | null) => void;
  clearNavigation: () => void;

  formatDate: (dateStr: string) => string;
  aiConsent: boolean;
  setAiConsent: (granted: boolean) => void;

  // User Personalization
  setUserName: (name: string) => void;
  setUserPhone: (phone: string) => void; // New
  setUserGoal: (goal: string) => void;

  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number) => void;

  // Goals & Community Finance
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void; // Added update
  deleteSavingsGoal: (id: string) => void;

  addIqub: (iqub: Iqub) => void;
  updateIqub: (iqub: Iqub) => void;
  deleteIqub: (id: string) => void;
  markIqubPaid: (id: string, accountId: string) => void;
  markIqubWon: (id: string, accountId: string, roundNum: number) => void;

  addIddir: (iddir: Iddir) => void;
  deleteIddir: (id: string) => void;
  markIddirPaid: (id: string, accountId: string) => void;
  updateIddir: (iddir: Iddir) => void;

  contributeToGoal: (goalId: string, amount: number, fromAccountId: string) => void;

  // Recurring
  addRecurringTransaction: (tx: RecurringTransaction) => void;
  updateRecurringTransaction: (tx: RecurringTransaction) => void;
  deleteRecurringTransaction: (id: string) => void;
  scanForSubscriptions: () => void; // Manual trigger for AI detection

  // Budget Management
  addBudgetCategory: (category: BudgetCategory) => void;
  updateBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (id: string) => void;

  // Income Management
  addIncomeSource: (source: IncomeSource) => void;
  updateIncomeSource: (source: IncomeSource) => void; // Added update
  deleteIncomeSource: (id: string) => void;
  getFinancialContext: () => FinancialContext; // Calculated metrics

  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;

  // Global Transaction Modal State
  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  prefillTx?: Partial<Transaction>;
  openTransactionModal: (tx?: Transaction, prefill?: Partial<Transaction>) => void;
  closeTransactionModal: () => void;
  payeeHistory: string[];

  // Receipt Scanning
  scannedImage: string | null;
  setScannedImage: (img: string | null) => void;

  // Pro Features: Widget Management
  visibleWidgets: {
    balance: boolean;
    budget: boolean;
    goals: boolean;
    transactions: boolean;
  };
  toggleWidget: (widget: 'balance' | 'budget' | 'goals' | 'transactions') => void;

  // Notifications
  notification: Notification | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;

  // Community
  addFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (id: string) => void;
  sendInvitation: (emailOrPhone: string, role: 'Admin' | 'Member' | 'Viewer') => void;

  // Onboarding
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  logout: () => void;
}
