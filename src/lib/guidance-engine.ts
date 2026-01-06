/**
 * Guidance Engine - Rule-Based Financial Health Analysis
 * 
 * A "Guardian Layer" that analyzes user data and emits signals (warnings/alerts)
 * based on strict deterministic rules. No AI/ML - pure rule-based logic.
 */

import type { AppState, Iqub, Iddir, SavingsGoal, BudgetCategory, Transaction } from '@/types';
import type { AINotification } from '@/services/proactive-ai';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate average daily spending from transactions
 */
function calculateAverageDailySpend(state: AppState, lookbackDays: number = 30): number {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

    const expenses = state.transactions.filter(tx =>
        tx.type === 'expense' && new Date(tx.date) >= cutoffDate
    );

    const totalSpent = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    return totalSpent / lookbackDays;
}

/**
 * Calculate total current balance across all accounts
 */
function getTotalBalance(state: AppState): number {
    return state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
}

/**
 * Calculate days until a date
 */
function daysUntil(dateStr: string): number {
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Create a unique notification ID
 */
function createNotificationId(prefix: string, suffix: string): string {
    return `${prefix}-${suffix}-${Date.now()}`;
}

// ============================================================================
// RULE A: CASH RUNWAY
// ============================================================================

/**
 * Check cash runway - days of expenses covered by current balance
 */
function checkCashRunway(state: AppState): AINotification[] {
    const notifications: AINotification[] = [];
    const totalBalance = getTotalBalance(state);
    const dailySpend = calculateAverageDailySpend(state);

    // Avoid division by zero
    if (dailySpend <= 0) return notifications;

    const daysRemaining = Math.floor(totalBalance / dailySpend);

    // Rule A1: Critical - less than 3 days
    if (daysRemaining < 3 && daysRemaining >= 0) {
        notifications.push({
            id: createNotificationId('cash-runway', 'critical'),
            type: 'cash-risk',
            title: '⚠️ Cash Emergency',
            message: `URGENT: Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} of expenses covered. Consider reducing spending immediately.`,
            icon: 'AlertTriangle',
            color: 'rose',
            actionLabel: 'View Accounts',
            actionTab: 'accounts',
            priority: 'high',
            createdAt: new Date().toISOString()
        });
    }
    // Rule A2: Warning - less than 7 days
    else if (daysRemaining < 7) {
        notifications.push({
            id: createNotificationId('cash-runway', 'warning'),
            type: 'cash-risk',
            title: 'Low Cash Runway',
            message: `You have approximately ${daysRemaining} days of expenses covered. Time to slow down spending.`,
            icon: 'AlertTriangle',
            color: 'amber',
            actionLabel: 'View Budget',
            actionTab: 'budget',
            priority: 'medium',
            createdAt: new Date().toISOString()
        });
    }

    return notifications;
}

// ============================================================================
// RULE B: UPCOMING PAYMENT RISK
// ============================================================================

/**
 * Check if upcoming payments can be covered
 */
function checkPaymentRisk(state: AppState): AINotification[] {
    const notifications: AINotification[] = [];
    const totalBalance = getTotalBalance(state);
    const dailySpend = calculateAverageDailySpend(state);
    const lookAheadDays = 7;

    // Collect all upcoming payments in the next 7 days
    const upcomingPayments: Array<{ name: string; amount: number; date: string; type: string }> = [];

    // Check recurring transactions
    state.recurringTransactions
        .filter(rt => rt.is_active)
        .forEach(rt => {
            const days = daysUntil(rt.next_due_date);
            if (days >= 0 && days <= lookAheadDays) {
                upcomingPayments.push({
                    name: rt.name,
                    amount: rt.amount,
                    date: rt.next_due_date,
                    type: 'recurring'
                });
            }
        });

    // Check Iqub payments
    state.iqubs
        .filter(iqub => iqub.status === 'active')
        .forEach(iqub => {
            const days = daysUntil(iqub.nextPaymentDate);
            if (days >= 0 && days <= lookAheadDays) {
                upcomingPayments.push({
                    name: iqub.title,
                    amount: iqub.amount,
                    date: iqub.nextPaymentDate,
                    type: 'iqub'
                });
            }
        });

    // Check Iddir payments
    state.iddirs
        .filter(iddir => iddir.status === 'active')
        .forEach(iddir => {
            const today = new Date();
            const paymentDay = iddir.paymentDate;
            const thisMonth = new Date(today.getFullYear(), today.getMonth(), paymentDay);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);

            const checkDate = thisMonth >= today ? thisMonth : nextMonth;
            const days = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (days >= 0 && days <= lookAheadDays) {
                upcomingPayments.push({
                    name: iddir.name,
                    amount: iddir.monthlyContribution,
                    date: checkDate.toISOString(),
                    type: 'iddir'
                });
            }
        });

    // Analyze each payment
    for (const payment of upcomingPayments) {
        const days = daysUntil(payment.date);
        const projectedSpending = dailySpend * days;
        const projectedBalance = totalBalance - projectedSpending;

        // Rule B1: Critical - cannot cover payment
        if (projectedBalance < payment.amount) {
            const shortfall = payment.amount - projectedBalance;
            notifications.push({
                id: createNotificationId('payment-risk', payment.name),
                type: 'payment-risk',
                title: `Cannot Cover ${payment.name}`,
                message: `Your ${payment.name} payment of ${payment.amount.toLocaleString()} ETB is due in ${days} days. You'll be short by ~${Math.ceil(shortfall).toLocaleString()} ETB.`,
                icon: 'AlertCircle',
                color: 'rose',
                actionLabel: payment.type === 'iqub' ? 'View Iqub' : 'View Bills',
                actionTab: payment.type === 'iqub' ? 'community' : 'budget',
                priority: 'high',
                createdAt: new Date().toISOString()
            });
        }
        // Rule B2: Warning - payment takes > 80% of balance
        else if (payment.amount > projectedBalance * 0.8) {
            notifications.push({
                id: createNotificationId('payment-warning', payment.name),
                type: 'payment-risk',
                title: `Large Payment: ${payment.name}`,
                message: `${payment.name} (${payment.amount.toLocaleString()} ETB) due in ${days} days will use most of your available cash.`,
                icon: 'Info',
                color: 'amber',
                actionLabel: 'View Details',
                actionTab: 'budget',
                priority: 'medium',
                createdAt: new Date().toISOString()
            });
        }
    }

    return notifications;
}

// ============================================================================
// RULE C: BUDGET BURN (Enhanced from proactive-ai.ts)
// ============================================================================

/**
 * Check budget category spending - enhanced version
 * Note: Basic version exists in proactive-ai.ts, this adds reallocation suggestions
 */
function checkBudgetBurn(state: AppState): AINotification[] {
    const notifications: AINotification[] = [];

    // Check for multiple categories over budget
    const overBudgetCategories = state.budgetCategories.filter(cat =>
        cat.allocated > 0 && cat.spent > cat.allocated
    );

    // If 3+ categories are over budget, suggest reallocation
    if (overBudgetCategories.length >= 3) {
        const totalOverage = overBudgetCategories.reduce((sum, cat) =>
            sum + (cat.spent - cat.allocated), 0);

        notifications.push({
            id: createNotificationId('budget-burn', 'multiple'),
            type: 'budget-warning',
            title: 'Multiple Budgets Exceeded',
            message: `${overBudgetCategories.length} categories are over budget by ${totalOverage.toLocaleString()} ETB total. Consider reallocating your budget.`,
            icon: 'TrendingDown',
            color: 'rose',
            actionLabel: 'Rebalance Budget',
            actionTab: 'budget',
            priority: 'high',
            createdAt: new Date().toISOString()
        });
    }

    return notifications;
}

// ============================================================================
// RULE D: GOAL DELAY
// ============================================================================

/**
 * Check if goals are on track to meet their deadlines
 */
function checkGoalDelay(state: AppState): AINotification[] {
    const notifications: AINotification[] = [];
    const today = new Date();

    state.savingsGoals.forEach((goal: SavingsGoal) => {
        if (!goal.deadline || goal.currentAmount >= goal.targetAmount) return;

        const deadline = new Date(goal.deadline);
        const daysToDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const remaining = goal.targetAmount - goal.currentAmount;

        // Rule D1: Deadline passed
        if (daysToDeadline < 0) {
            notifications.push({
                id: createNotificationId('goal-delay', goal.id),
                type: 'goal-delay',
                title: `${goal.title} Deadline Passed`,
                message: `Your goal deadline was ${Math.abs(daysToDeadline)} days ago. ${remaining.toLocaleString()} ETB still needed.`,
                icon: 'Clock',
                color: 'rose',
                actionLabel: 'Update Goal',
                actionTab: 'goals',
                priority: 'high',
                createdAt: new Date().toISOString()
            });
            return;
        }

        // Calculate required daily contribution
        if (daysToDeadline > 0) {
            const requiredDaily = remaining / daysToDeadline;

            // Estimate current contribution pace from recent goal contributions
            const recentContributions = state.transactions.filter(tx =>
                tx.goalId === goal.id &&
                new Date(tx.date) >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            );
            const monthlyContribution = recentContributions.reduce((sum, tx) => sum + tx.amount, 0);
            const currentDaily = monthlyContribution / 30;

            // Rule D2: Off track - need to increase contributions
            if (requiredDaily > currentDaily * 1.5 && daysToDeadline <= 60) {
                const neededMonthly = requiredDaily * 30;
                notifications.push({
                    id: createNotificationId('goal-pace', goal.id),
                    type: 'goal-delay',
                    title: `${goal.title} Falling Behind`,
                    message: `To reach your goal on time, save ${Math.ceil(neededMonthly).toLocaleString()} ETB/month. ${daysToDeadline} days remaining.`,
                    icon: 'TrendingUp',
                    color: 'amber',
                    actionLabel: 'Contribute Now',
                    actionTab: 'goals',
                    priority: 'medium',
                    createdAt: new Date().toISOString()
                });
            }
        }
    });

    return notifications;
}

// ============================================================================
// RULE E: COMMUNITY PAYMENT RISK (Iqub/Iddir)
// ============================================================================

/**
 * Check for community payment risks and overlaps
 */
function checkCommunityRisk(state: AppState): AINotification[] {
    const notifications: AINotification[] = [];
    const totalBalance = getTotalBalance(state);
    const lookAheadDays = 7;

    // Collect all community payments in next 7 days
    const communityPayments: Array<{ name: string; amount: number; days: number }> = [];

    // Iqubs
    state.iqubs
        .filter(iqub => iqub.status === 'active')
        .forEach(iqub => {
            const days = daysUntil(iqub.nextPaymentDate);
            if (days >= 0 && days <= lookAheadDays) {
                communityPayments.push({
                    name: iqub.title,
                    amount: iqub.amount,
                    days
                });
            }
        });

    // Iddirs
    state.iddirs
        .filter(iddir => iddir.status === 'active')
        .forEach(iddir => {
            const today = new Date();
            const paymentDay = iddir.paymentDate;
            const thisMonth = new Date(today.getFullYear(), today.getMonth(), paymentDay);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);

            const checkDate = thisMonth >= today ? thisMonth : nextMonth;
            const days = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 1000));

            if (days >= 0 && days <= lookAheadDays) {
                communityPayments.push({
                    name: iddir.name,
                    amount: iddir.monthlyContribution,
                    days
                });
            }
        });

    // Rule E1: Multiple community payments in same week
    if (communityPayments.length >= 2) {
        const totalDue = communityPayments.reduce((sum, p) => sum + p.amount, 0);

        if (totalDue > totalBalance * 0.5) {
            notifications.push({
                id: createNotificationId('community-overlap', 'week'),
                type: 'community-risk',
                title: 'Multiple Community Payments',
                message: `${communityPayments.length} payments (${totalDue.toLocaleString()} ETB) due this week: ${communityPayments.map(p => p.name).join(', ')}.`,
                icon: 'Users',
                color: 'amber',
                actionLabel: 'Plan Ahead',
                actionTab: 'community',
                priority: 'medium',
                createdAt: new Date().toISOString()
            });
        }
    }

    // Rule E2: Individual community payment creates cash shortage
    communityPayments.forEach(payment => {
        if (payment.amount > totalBalance * 0.7 && payment.days <= 3) {
            notifications.push({
                id: createNotificationId('community-shortage', payment.name),
                type: 'community-risk',
                title: `Reserve Funds for ${payment.name}`,
                message: `${payment.name} payment of ${payment.amount.toLocaleString()} ETB due in ${payment.days} day${payment.days !== 1 ? 's' : ''}. Set aside funds now.`,
                icon: 'PiggyBank',
                color: 'amber',
                actionLabel: 'Transfer Funds',
                actionTab: 'accounts',
                priority: 'medium',
                createdAt: new Date().toISOString()
            });
        }
    });

    return notifications;
}

// ============================================================================
// MAIN EXPORT: CHECK FINANCIAL HEALTH
// ============================================================================

/**
 * Main entry point - runs all guidance rules and returns notifications
 * 
 * @param state - Current application state
 * @returns Array of guidance notifications sorted by priority
 */
export function checkFinancialHealth(state: AppState): AINotification[] {
    const allNotifications: AINotification[] = [
        ...checkCashRunway(state),
        ...checkPaymentRisk(state),
        ...checkBudgetBurn(state),
        ...checkGoalDelay(state),
        ...checkCommunityRisk(state),
    ];

    // Sort by priority (high first)
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return allNotifications.sort((a, b) =>
        (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    );
}

// ============================================================================
// PHASE 3: TRANSACTION SIMULATION
// ============================================================================

export interface ImpactSummary {
    beforeBalance: number;
    afterBalance: number;
    beforeRunway: number;
    afterRunway: number;
    budgetImpact?: {
        category: string;
        beforeSpent: number;
        afterSpent: number;
        allocated: number;
    };
    risks: AINotification[];
}

/**
 * Simulate the impact of a transaction before it is saved
 */
export function simulateTransaction(state: AppState, tx: Partial<Transaction>): ImpactSummary {
    const beforeBalance = getTotalBalance(state);
    const dailySpend = calculateAverageDailySpend(state);
    const beforeRunway = dailySpend > 0 ? Math.floor(beforeBalance / dailySpend) : Infinity;

    // Create a simulated state
    const amount = tx.amount || 0;
    const isExpense = tx.type === 'expense';
    const afterBalance = isExpense ? beforeBalance - amount : beforeBalance + amount;

    // Simple runway recalculation (assuming this spend doesn't change the average daily spend yet)
    const afterRunway = dailySpend > 0 ? Math.floor(afterBalance / dailySpend) : Infinity;

    // Budget impact
    let budgetImpact;
    if (isExpense && tx.category) {
        const category = state.budgetCategories.find(c => c.name === tx.category);
        if (category) {
            budgetImpact = {
                category: category.name,
                beforeSpent: category.spent,
                afterSpent: category.spent + amount,
                allocated: category.allocated
            };
        }
    }

    // Risk detection on simulated state
    const simulatedState: AppState = {
        ...state,
        totalBalance: afterBalance,
        // Update budget categories in simulated state for risk check
        budgetCategories: state.budgetCategories.map(c =>
            c.name === tx.category && isExpense
                ? { ...c, spent: c.spent + amount }
                : c
        ),
        // Update accounts (simplified: subtract from first account or default)
        accounts: state.accounts.map((acc, idx) =>
            (idx === 0) ? { ...acc, balance: isExpense ? acc.balance - amount : acc.balance + amount } : acc
        )
    };

    const risks = [
        ...checkCashRunway(simulatedState),
        ...checkPaymentRisk(simulatedState),
        ...checkCommunityRisk(simulatedState)
    ].filter(risk => risk.priority === 'high'); // Only surface high priority risks in preview

    return {
        beforeBalance,
        afterBalance,
        beforeRunway,
        afterRunway,
        budgetImpact,
        risks
    };
}

// Export individual rule checkers for testing
export const _testExports = {
    checkCashRunway,
    checkPaymentRisk,
    checkBudgetBurn,
    checkGoalDelay,
    checkCommunityRisk,
    calculateAverageDailySpend,
    getTotalBalance,
    daysUntil,
};
