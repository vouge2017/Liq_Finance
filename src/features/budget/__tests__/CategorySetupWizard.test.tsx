import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySetupWizard } from '../components/CategorySetupWizard';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock AppContext
vi.mock('@/context/AppContext', () => ({
    useAppContext: () => ({
        state: {
            accounts: [{ id: '1', type: 'Cash', balance: 10000 }],
            totalIncome: 10000,
            totalExpense: 0,
            totalBalance: 10000,
            transactions: [],
            savingsGoals: [],
            iqubs: [],
            iddirs: [],
            recurringTransactions: [],
            budgetCategories: [],
            familyMembers: [],
            invitations: []
        },
        addBudgetCategory: vi.fn()
    })
}));

describe('CategorySetupWizard', () => {
    const onClose = vi.fn();

    it('renders the welcome step initially', () => {
        render(<CategorySetupWizard onClose={onClose} />);
        expect(screen.getByText(/Set Up Your Budget/i)).toBeDefined();
    });

    it('navigates through steps', async () => {
        render(<CategorySetupWizard onClose={onClose} />);

        // Welcome -> Category Selection
        // Try to find ANY button and click it
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);

        // Check if we reached the next step
        expect(screen.getByText(/Categories/i)).toBeDefined();
    });
});
