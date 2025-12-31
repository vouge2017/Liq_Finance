import { createClient } from '../lib/supabase/client';

function getSupabase() {
    const supabase = createClient();
    if (!supabase) {
        console.warn('[DataRetentionService] Supabase not configured. Running in offline mode.');
    }
    return supabase;
}

export interface RetentionCheckResult {
    table: string;
    recordsToDelete: number;
    oldestRecord: Date | null;
}

export interface DeletionResult {
    success: boolean;
    message: string;
    deletedRecords?: number;
}

/**
 * Data Retention Service for GDPR Compliance
 * Handles automated and user-initiated data deletion
 */
export class DataRetentionService {
    /**
     * Check retention status for all tables
     */
    static async checkRetentionStatus(): Promise<RetentionCheckResult[]> {
        const supabase = getSupabase();
        if (!supabase) return [];

        const results: RetentionCheckResult[] = [];

        // Check transactions (7 years)
        const { data: transactionData } = await supabase
            .from('transactions')
            .select('transaction_date')
            .lt('transaction_date', new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString())
            .order('transaction_date', { ascending: true })
            .limit(1);

        results.push({
            table: 'transactions',
            recordsToDelete: transactionData?.length || 0,
            oldestRecord: transactionData?.[0]?.transaction_date ? new Date(transactionData[0].transaction_date) : null
        });

        // Check user data tables (2 years)
        const userTables = ['profiles', 'accounts', 'budget_categories', 'savings_goals', 'iqubs', 'iddirs', 'recurring_transactions', 'income_sources'];
        const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();

        for (const table of userTables) {
            const { data, error } = await supabase
                .from(table)
                .select('created_at')
                .lt('created_at', twoYearsAgo)
                .order('created_at', { ascending: true })
                .limit(1);

            if (!error) {
                results.push({
                    table,
                    recordsToDelete: data?.length || 0,
                    oldestRecord: data?.[0]?.created_at ? new Date(data[0].created_at) : null
                });
            }
        }

        // Check temporary data (30 days)
        const tempTables = ['feedback', 'ai_conversations'];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        for (const table of tempTables) {
            const { data, error } = await supabase
                .from(table)
                .select('created_at')
                .lt('created_at', thirtyDaysAgo)
                .order('created_at', { ascending: true })
                .limit(1);

            if (!error) {
                results.push({
                    table,
                    recordsToDelete: data?.length || 0,
                    oldestRecord: data?.[0]?.created_at ? new Date(data[0].created_at) : null
                });
            }
        }

        return results;
    }

    /**
     * Manually trigger automated deletion (admin function)
     */
    static async triggerAutomatedDeletion(): Promise<DeletionResult> {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: 'Supabase not configured' };

        try {
            // Call the SQL functions
            const { error: error1 } = await supabase.rpc('delete_old_transactions');
            const { error: error2 } = await supabase.rpc('delete_old_user_data');
            const { error: error3 } = await supabase.rpc('delete_temporary_data');

            if (error1 || error2 || error3) {
                return {
                    success: false,
                    message: `Deletion failed: ${error1?.message || error2?.message || error3?.message}`
                };
            }

            return {
                success: true,
                message: 'Automated deletion completed successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error triggering deletion: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * User-initiated data deletion (GDPR right to erasure)
     */
    static async deleteUserData(): Promise<DeletionResult> {
        const supabase = getSupabase();
        if (!supabase) return { success: false, message: 'Supabase not configured' };

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }

            const { error } = await supabase.rpc('delete_user_data', { user_uuid: user.id });

            if (error) {
                return {
                    success: false,
                    message: `Failed to delete user data: ${error.message}`
                };
            }

            // Sign out the user after deletion
            await supabase.auth.signOut();

            return {
                success: true,
                message: 'All user data has been permanently deleted'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error deleting user data: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get audit logs for retention actions
     */
    static async getRetentionAuditLogs(limit: number = 100): Promise<any[]> {
        const supabase = getSupabase();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .in('action', ['data_retention_delete', 'user_data_deletion'])
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching retention audit logs:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Check if data retention is compliant for a user
     */
    static async checkUserCompliance(userId: string): Promise<boolean> {
        const supabase = getSupabase();
        if (!supabase) return true; // Assume compliant if no supabase

        // Check if user has any data older than retention periods
        const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
        const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString();

        const checks = await Promise.all([
            // Check transactions
            supabase.from('transactions').select('id').eq('user_id', userId).lt('transaction_date', sevenYearsAgo).limit(1),
            // Check other user data
            supabase.from('profiles').select('id').eq('id', userId).lt('created_at', twoYearsAgo).limit(1),
            supabase.from('accounts').select('id').eq('user_id', userId).lt('created_at', twoYearsAgo).limit(1),
            supabase.from('savings_goals').select('id').eq('user_id', userId).lt('created_at', twoYearsAgo).limit(1),
            // Add more checks as needed
        ]);

        // If any check returns data, it's not compliant
        return checks.every(({ data }: any) => !data || data.length === 0);
    }
}