
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkFinancialHealth, simulateTransaction, _testExports } from '../guidance-engine';
import { AppState, Transaction, Account, SavingsGoal, Iqub, Iddir, RecurringTransaction, BudgetCategory } from '@/types';

// Mock Date to ensure consistent testing
const MOCK_DATE = '2025-01-01T00:00:00.000Z';

describe('Guidance Engine', () => {
    let mockState: AppState;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(MOCK_DATE));

        // Basic empty state
        mockState = {
            userName: 'Test User',
            totalBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
            transactions: [],
            savingsGoals: [],
            iqubs: [],
            iddirs: [],
            recurringTransactions: [],
            expenseCategories: [],
            budgetCategories: [],
            incomeSources: [],
            accounts: [],
            familyMembers: [],
            invitations: [],
            achievements: {
                savingsStreak: 0,
                totalSaved: 0,
                goalsCompleted: 0,
                iqubsWon: 0,
                badges: []
            },
            aiNotifications: [],
            budgetStartDate: 1,
            navigationState: { targetId: null, type: null }
        } as unknown as AppState; // Partial mock
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rule A: Cash Runway', () => {
        it('should return no notifications if daily spend is 0', () => {
            mockState.accounts = [{ balance: 1000 } as Account];
            mockState.transactions = []; // No spend

            const result = _testExports.checkCashRunway(mockState);
            expect(result).toHaveLength(0);
        });

        it('should return critical warning if runway < 3 days', () => {
            // Spend 1000/day
            mockState.transactions = Array(30).fill({
                type: 'expense',
                amount: 1000,
                date: MOCK_DATE
            } as Transaction);

            // Balance 2000 (2 days runway)
            mockState.accounts = [{ balance: 2000 } as Account];

            const result = _testExports.checkCashRunway(mockState);
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('cash-risk');
            expect(result[0].priority).toBe('high');
        });

        it('should return warning if runway < 7 days', () => {
            // Spend 1000/day
            mockState.transactions = Array(30).fill({
                type: 'expense',
                amount: 1000,
                date: MOCK_DATE
            } as Transaction);

            // Balance 5000 (5 days runway)
            mockState.accounts = [{ balance: 5000 } as Account];

            const result = _testExports.checkCashRunway(mockState);
            expect(result).toHaveLength(1);
            expect(result[0].priority).toBe('medium');
        });
    });

    describe('Rule B: Upcoming Payment Risk', () => {
        it('should detect critical payment risk', () => {
            mockState.accounts = [{ balance: 500 } as Account];
            mockState.transactions = []; // No daily spend to complicate things

            // Payment due in 2 days
            const dueDate = new Date(MOCK_DATE);
            dueDate.setDate(dueDate.getDate() + 2);

            mockState.recurringTransactions = [{
                id: '1',
                name: 'Rent',
                amount: 1000,
                next_due_date: dueDate.toISOString(),
                is_active: true
            } as RecurringTransaction];

            const result = _testExports.checkPaymentRisk(mockState);
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('payment-risk');
            expect(result[0].priority).toBe('high');
        });
    });

    describe('Rule C: Budget Burn', () => {
        it('should detect multiple over-budget categories', () => {
            mockState.budgetCategories = [
                { id: '1', name: 'Food', allocated: 1000, spent: 1100 } as BudgetCategory,
                { id: '2', name: 'Transport', allocated: 500, spent: 600 } as BudgetCategory,
                { id: '3', name: 'Ent', allocated: 200, spent: 300 } as BudgetCategory,
            ];

            const result = _testExports.checkBudgetBurn(mockState);
            expect(result).toHaveLength(1);
            expect(result[0].title).toContain('Multiple Budgets Exceeded');
        });
    });

    describe('Rule D: Goal Delay', () => {
        it('should detect passed deadline', () => {
            const pastDate = new Date(MOCK_DATE);
            pastDate.setDate(pastDate.getDate() - 5);

            mockState.savingsGoals = [{
                id: '1',
                title: 'Car',
                targetAmount: 10000,
                currentAmount: 5000,
                deadline: pastDate.toISOString()
            } as SavingsGoal];

            const result = _testExports.checkGoalDelay(mockState);
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('goal-delay');
            expect(result[0].priority).toBe('high');
        });
    });

    describe('Rule E: Community Risk', () => {
        it('should detect multiple community payments in same week', () => {
            const date1 = new Date(MOCK_DATE);
            date1.setDate(date1.getDate() + 2);

            const date2 = new Date(MOCK_DATE);
            date2.setDate(date2.getDate() + 3);

            mockState.iqubs = [{
                id: '1',
                title: 'Iqub 1',
                amount: 1000,
                nextPaymentDate: date1.toISOString(),
                status: 'active'
            } as Iqub];

            mockState.iddirs = [{
                id: '2',
                name: 'Iddir 1',
                monthlyContribution: 500,
                paymentDate: date2.getDate(),
                status: 'active'
            } as Iddir];

            mockState.accounts = [{ balance: 1000 } as Account]; // Low balance to trigger overlap warning

            const result = _testExports.checkCommunityRisk(mockState);
            // Should trigger overlap warning (E1) and shortage warning (E2) for Iqub
            expect(result.length).toBeGreaterThanOrEqual(1);
            expect(result.some(n => n.id.includes('community-overlap'))).toBe(true);
        });
    });

    describe('Phase 3: Transaction Simulation', () => {
        it('should correctly simulate balance and runway impact', () => {
            mockState.accounts = [{ balance: 10000 } as Account];
            mockState.transactions = Array(30).fill({
                type: 'expense',
                amount: 1000,
                date: MOCK_DATE
            } as Transaction);

            // Proposed expense of 5000
            const tx: Partial<Transaction> = {
                amount: 5000,
                type: 'expense',
                category: 'Food'
            };

            const summary = simulateTransaction(mockState, tx);

            expect(summary.beforeBalance).toBe(10000);
            expect(summary.afterBalance).toBe(5000);
            expect(summary.beforeRunway).toBe(10);
            expect(summary.afterRunway).toBe(5);
        });

        it('should detect risks in simulated state', () => {
            mockState.accounts = [{ balance: 6000 } as Account];
            mockState.transactions = Array(30).fill({
                type: 'expense',
                amount: 1000,
                date: MOCK_DATE
            } as Transaction);

            // Proposed expense of 5000 (leaves 1000 balance = 1 day runway)
            const tx: Partial<Transaction> = {
                amount: 5000,
                type: 'expense',
                category: 'Food'
            };

            const summary = simulateTransaction(mockState, tx);

            expect(summary.risks).toHaveLength(1);
            expect(summary.risks[0].type).toBe('cash-risk');
            expect(summary.risks[0].priority).toBe('high');
        });

        it('should show budget impact', () => {
            mockState.budgetCategories = [
                { id: '1', name: 'Food', allocated: 2000, spent: 1000 } as BudgetCategory
            ];
            mockState.accounts = [{ balance: 10000 } as Account];

            const tx: Partial<Transaction> = {
                amount: 500,
                type: 'expense',
                category: 'Food'
            };

            const summary = simulateTransaction(mockState, tx);

            expect(summary.budgetImpact).toBeDefined();
            expect(summary.budgetImpact?.beforeSpent).toBe(1000);
            expect(summary.budgetImpact?.afterSpent).toBe(1500);
            expect(summary.budgetImpact?.allocated).toBe(2000);
        });
    });
});
