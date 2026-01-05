import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as dataService from '@/lib/supabase/data-service';
import { createAccountSchema } from '@/lib/validation';
import type { Account } from '@/types';

interface AccountContextType {
    // State
    accounts: Account[];
    loading: boolean;
    error: string | null;

    // Account CRUD operations
    addAccount: (account: Omit<Account, 'id'>) => Promise<{ error?: string }>;
    updateAccount: (account: Account) => Promise<{ error?: string }>;
    deleteAccount: (id: string) => Promise<{ error?: string }>;
    setDefaultAccount: (id: string) => void;

    // Transfer operations
    transferFunds: (fromId: string, toId: string, amount: number) => Promise<{ error?: string }>;

    // Computed values
    totalBalance: number;
    defaultAccountId: string | null;
    getAccountById: (id: string) => Account | undefined;
    getAccountsByType: (type: Account['type']) => Account[];

    // UI helpers
    clearError: () => void;
    refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

interface AccountProviderProps {
    children: React.ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
    const { user } = useAuth();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [defaultAccountId, setDefaultAccountIdState] = useState<string | null>(null);

    // Load accounts when user changes
    useEffect(() => {
        if (user) {
            loadAccounts();
        } else {
            // Clear data when user logs out
            setAccounts([]);
            setDefaultAccountIdState(null);
            setLoading(false);
        }
    }, [user]);

    const loadAccounts = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const accountsData = await dataService.getAccounts(user.id);
            setAccounts(accountsData);

            // Set default account if exists
            if (accountsData.length > 0) {
                const primaryAccount = accountsData.find(acc => acc.name === 'Primary') || accountsData[0];
                setDefaultAccountIdState(primaryAccount.id);
            }
        } catch (err) {
            console.error('Error loading accounts:', err);
            setError('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const addAccount = useCallback(async (accountData: Omit<Account, 'id'>) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            setError(null);

            // Validate account data using our schema
            const validation = createAccountSchema.safeParse(accountData);
            if (!validation.success) {
                return { error: 'Invalid account data' };
            }

            // Check for duplicate account names
            const existingAccount = accounts.find(acc =>
                acc.name.toLowerCase() === accountData.name.toLowerCase()
            );
            if (existingAccount) {
                return { error: 'An account with this name already exists' };
            }

            const newAccount = await dataService.createAccount(user.id, accountData);
            if (!newAccount) {
                return { error: 'Failed to create account' };
            }

            setAccounts(prev => [...prev, newAccount]);

            // If this is the first account, make it default
            if (accounts.length === 0) {
                setDefaultAccountIdState(newAccount.id);
            }

            return {};
        } catch (err) {
            console.error('Error adding account:', err);
            return { error: 'An unexpected error occurred' };
        }
    }, [user, accounts]);

    const updateAccount = useCallback(async (account: Account) => {
        try {
            setError(null);

            // Check for duplicate names (excluding current account)
            const existingAccount = accounts.find(acc =>
                acc.id !== account.id &&
                acc.name.toLowerCase() === account.name.toLowerCase()
            );
            if (existingAccount) {
                return { error: 'An account with this name already exists' };
            }

            const success = await dataService.updateAccount(account);
            if (!success) {
                return { error: 'Failed to update account' };
            }

            setAccounts(prev =>
                prev.map(acc => acc.id === account.id ? account : acc)
            );

            return {};
        } catch (err) {
            console.error('Error updating account:', err);
            return { error: 'An unexpected error occurred' };
        }
    }, [accounts]);

    const deleteAccount = useCallback(async (id: string) => {
        try {
            setError(null);

            // Check if account has transactions
            // In a real app, you'd check this with the transaction service
            const accountToDelete = accounts.find(acc => acc.id === id);
            if (!accountToDelete) {
                return { error: 'Account not found' };
            }

            if (accountToDelete.balance !== 0) {
                return { error: 'Cannot delete account with non-zero balance' };
            }

            const success = await dataService.deleteAccount(id);
            if (!success) {
                return { error: 'Failed to delete account' };
            }

            setAccounts(prev => prev.filter(acc => acc.id !== id));

            // If this was the default account, choose a new default
            if (defaultAccountId === id) {
                const remainingAccounts = accounts.filter(acc => acc.id !== id);
                if (remainingAccounts.length > 0) {
                    setDefaultAccountIdState(remainingAccounts[0].id);
                } else {
                    setDefaultAccountIdState(null);
                }
            }

            return {};
        } catch (err) {
            console.error('Error deleting account:', err);
            return { error: 'An unexpected error occurred' };
        }
    }, [accounts, defaultAccountId]);

    const setDefaultAccount = useCallback((id: string) => {
        const account = accounts.find(acc => acc.id === id);
        if (account) {
            setDefaultAccountIdState(id);
        }
    }, [accounts]);

    const transferFunds = useCallback(async (fromId: string, toId: string, amount: number) => {
        if (fromId === toId) {
            return { error: 'Cannot transfer to the same account' };
        }

        if (amount <= 0) {
            return { error: 'Transfer amount must be greater than 0' };
        }

        try {
            setError(null);

            const fromAccount = accounts.find(acc => acc.id === fromId);
            const toAccount = accounts.find(acc => acc.id === toId);

            if (!fromAccount || !toAccount) {
                return { error: 'Account not found' };
            }

            if (fromAccount.balance < amount) {
                return { error: `Insufficient funds. Available: ${fromAccount.balance.toLocaleString()} ETB` };
            }

            // Create updated account objects
            const updatedFromAccount = {
                ...fromAccount,
                balance: fromAccount.balance - amount
            };

            const updatedToAccount = {
                ...toAccount,
                balance: toAccount.balance + amount
            };

            // Update both accounts in parallel
            await Promise.all([
                dataService.updateAccount(updatedFromAccount),
                dataService.updateAccount(updatedToAccount)
            ]);

            // Update local state
            setAccounts(prev =>
                prev.map(acc => {
                    if (acc.id === fromId) return updatedFromAccount;
                    if (acc.id === toId) return updatedToAccount;
                    return acc;
                })
            );

            return {};
        } catch (err) {
            console.error('Error transferring funds:', err);
            return { error: 'Transfer failed' };
        }
    }, [accounts]);

    // Computed values
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    const getAccountById = useCallback((id: string) => {
        return accounts.find(account => account.id === id);
    }, [accounts]);

    const getAccountsByType = useCallback((type: Account['type']) => {
        return accounts.filter(account => account.type === type);
    }, [accounts]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refreshAccounts = useCallback(async () => {
        await loadAccounts();
    }, [user]);

    const value: AccountContextType = {
        // State
        accounts,
        loading,
        error,

        // Account CRUD operations
        addAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount,

        // Transfer operations
        transferFunds,

        // Computed values
        totalBalance,
        defaultAccountId,
        getAccountById,
        getAccountsByType,

        // UI helpers
        clearError,
        refreshAccounts,
    };

    return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccounts = () => {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error('useAccounts must be used within an AccountProvider');
    }
    return context;
};