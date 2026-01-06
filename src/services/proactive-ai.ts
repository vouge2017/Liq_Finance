import { AppState, IncomeSource } from '@/types';

export interface AINotification {
    id: string;
    type: 'bill-reminder' | 'budget-warning' | 'goal-milestone' | 'weekly-summary' | 'iqub-reminder' | 'tip' | 'cash-risk' | 'payment-risk' | 'goal-delay' | 'community-risk';
    title: string;
    message: string;
    icon: string;
    color: string;
    actionLabel?: string;
    actionTab?: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    dismissed?: boolean;
}

// Check for upcoming bills (recurring transactions)
const checkUpcomingBills = (state: AppState): AINotification[] => {
    const notifications: AINotification[] = [];
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    state.recurringTransactions
        .filter(rt => rt.is_active)
        .forEach(rt => {
            const dueDate = new Date(rt.next_due_date);
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilDue > 0 && daysUntilDue <= 3) {
                notifications.push({
                    id: `bill-${rt.id}-${rt.next_due_date}`,
                    type: 'bill-reminder',
                    title: `${rt.name} Due Soon`,
                    message: `Your ${rt.name} payment of ${rt.amount.toLocaleString()} ETB is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}.`,
                    icon: rt.icon || 'Bell',
                    color: 'cyan',
                    actionLabel: 'View Bills',
                    actionTab: 'budget',
                    priority: daysUntilDue === 1 ? 'high' : 'medium',
                    createdAt: new Date().toISOString()
                });
            }
        });

    return notifications;
};

// Check for budget overspending
const checkBudgetStatus = (state: AppState): AINotification[] => {
    const notifications: AINotification[] = [];

    state.budgetCategories.forEach(cat => {
        if (cat.allocated > 0) {
            const percentSpent = (cat.spent / cat.allocated) * 100;

            if (percentSpent >= 100) {
                notifications.push({
                    id: `budget-over-${cat.id}`,
                    type: 'budget-warning',
                    title: `${cat.name} Over Budget`,
                    message: `You've exceeded your ${cat.name} budget by ${(cat.spent - cat.allocated).toLocaleString()} ETB.`,
                    icon: 'Alert',
                    color: 'rose',
                    actionLabel: 'View Budget',
                    actionTab: 'budget',
                    priority: 'high',
                    createdAt: new Date().toISOString()
                });
            } else if (percentSpent >= 80) {
                notifications.push({
                    id: `budget-warning-${cat.id}`,
                    type: 'budget-warning',
                    title: `${cat.name} Almost Spent`,
                    message: `You've used ${Math.round(percentSpent)}% of your ${cat.name} budget.`,
                    icon: 'Alert',
                    color: 'amber',
                    actionLabel: 'View Budget',
                    actionTab: 'budget',
                    priority: 'medium',
                    createdAt: new Date().toISOString()
                });
            }
        }
    });

    return notifications;
};

// Check for goal milestones
const checkGoalMilestones = (state: AppState): AINotification[] => {
    const notifications: AINotification[] = [];

    state.savingsGoals.forEach(goal => {
        const percentComplete = (goal.currentAmount / goal.targetAmount) * 100;

        if (percentComplete >= 50 && percentComplete < 51) {
            notifications.push({
                id: `goal-50-${goal.id}`,
                type: 'goal-milestone',
                title: `${goal.title} Halfway There!`,
                message: `You're 50% to your ${goal.title} goal. Keep going!`,
                icon: 'Target',
                color: 'emerald',
                actionLabel: 'View Goal',
                actionTab: 'goals',
                priority: 'low',
                createdAt: new Date().toISOString()
            });
        }

        if (percentComplete >= 90 && percentComplete < 100) {
            notifications.push({
                id: `goal-90-${goal.id}`,
                type: 'goal-milestone',
                title: `Almost There: ${goal.title}`,
                message: `Just ${(goal.targetAmount - goal.currentAmount).toLocaleString()} ETB to go!`,
                icon: 'Sparkles',
                color: 'cyan',
                actionLabel: 'Contribute',
                actionTab: 'goals',
                priority: 'medium',
                createdAt: new Date().toISOString()
            });
        }
    });

    return notifications;
};

// Check for Iqub payment reminders
const checkIqubPayments = (state: AppState): AINotification[] => {
    const notifications: AINotification[] = [];
    const today = new Date();

    state.iqubs
        .filter(iqub => iqub.status === 'active')
        .forEach(iqub => {
            const paymentDate = new Date(iqub.nextPaymentDate);
            const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilPayment > 0 && daysUntilPayment <= 2) {
                notifications.push({
                    id: `iqub-${iqub.id}-${iqub.nextPaymentDate}`,
                    type: 'iqub-reminder',
                    title: `${iqub.title} Payment Due`,
                    message: `Your Iqub contribution of ${iqub.amount.toLocaleString()} ETB is due ${daysUntilPayment === 1 ? 'tomorrow' : 'in 2 days'}.`,
                    icon: 'Users',
                    color: 'pink',
                    actionLabel: 'Pay Now',
                    actionTab: 'goals',
                    priority: 'high',
                    createdAt: new Date().toISOString()
                });
            }
        });

    return notifications;
};

// Generate all proactive notifications
export const generateProactiveNotifications = (state: AppState): AINotification[] => {
    const allNotifications: AINotification[] = [
        ...checkUpcomingBills(state),
        ...checkBudgetStatus(state),
        ...checkGoalMilestones(state),
        ...checkIqubPayments(state),
    ];

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return allNotifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Get a smart tip based on user's financial situation
export const getSmartTip = (state: AppState): AINotification | null => {
    const tips: AINotification[] = [];
    const totalBudget = state.budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = state.budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);

    // Suggest budgeting if none set
    if (totalBudget === 0) {
        tips.push({
            id: 'tip-set-budget',
            type: 'tip',
            title: 'Set Your Budget',
            message: 'Creating a budget helps you track spending. Tap to set up your first budget.',
            icon: 'Lightbulb',
            color: 'cyan',
            actionLabel: 'Set Budget',
            actionTab: 'budget',
            priority: 'low',
            createdAt: new Date().toISOString()
        });
    }

    // Suggest savings goal if none exists
    if (state.savingsGoals.length === 0) {
        tips.push({
            id: 'tip-create-goal',
            type: 'tip',
            title: 'Start Saving',
            message: 'Set a savings goal to stay motivated. What are you saving for?',
            icon: 'Target',
            color: 'emerald',
            actionLabel: 'Create Goal',
            actionTab: 'goals',
            priority: 'low',
            createdAt: new Date().toISOString()
        });
    }

    return tips.length > 0 ? tips[Math.floor(Math.random() * tips.length)] : null;
};
