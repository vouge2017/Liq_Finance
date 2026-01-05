import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction, createAccount, getAccounts } from '../data-service';

// Mock Supabase client
vi.mock('../client', () => ({
    default: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                    order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                })),
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
            update: vi.fn(() => Promise.resolve({ data: null, error: null })),
            delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
    })),
}));

describe('Data Service Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Transaction Management', () => {
        it('should create a new transaction', async () => {
            const transaction = {
                title: 'Test transaction',
                date: new Date().toISOString(),
                amount: 100,
                type: 'expense' as const,
                category: 'Food',
                accountId: 'account-1',
                profile: 'Personal' as const,
            };

            const result = await createTransaction('user-id', transaction);

            expect(result).toBeDefined();
            expect(result?.title).toBe('Test transaction');
        });

        it('should retrieve transactions for a user', async () => {
            const transactions = await getTransactions('user-id');

            expect(Array.isArray(transactions)).toBe(true);
        });

        it('should update an existing transaction', async () => {
            const transaction = {
                id: 'tx-1',
                title: 'Updated transaction',
                date: new Date().toISOString(),
                amount: 150,
                type: 'expense' as const,
                category: 'Food',
                accountId: 'account-1',
                profile: 'Personal' as const,
            };

            const result = await updateTransaction(transaction);

            expect(result).toBe(true);
        });

        it('should delete a transaction', async () => {
            const result = await deleteTransaction('transaction-id');

            expect(result).toBe(true);
        });
    });

    describe('Account Management', () => {
        it('should create a new account', async () => {
            const account = {
                name: 'Test Account',
                type: 'Bank' as const,
                balance: 1000,
                institution: 'Test Bank',
                profile: 'Personal' as const,
                color: 'bg-blue-500',
            };

            const result = await createAccount('user-id', account);

            expect(result).toBeDefined();
            expect(result?.name).toBe('Test Account');
        });

        it('should retrieve user accounts', async () => {
            const accounts = await getAccounts('user-id');

            expect(Array.isArray(accounts)).toBe(true);
        });
    });
});