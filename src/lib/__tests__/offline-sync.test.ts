import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OfflineSyncManager } from '../offline-sync'
import { getSupabaseClient } from '../supabase/client'

// Mock Supabase client
vi.mock('../supabase/client', () => ({
    getSupabaseClient: vi.fn()
}))

// Mock Encryption service
vi.mock('../security/data-encryption', () => ({
    dataEncryptionService: {
        encrypt: vi.fn((val) => ({ encrypted: `enc_${val}`, iv: 'iv', authTag: 'tag' })),
        decrypt: vi.fn((val) => val.encrypted.replace('enc_', ''))
    }
}))

describe('OfflineSyncManager', () => {
    let manager: OfflineSyncManager
    const userId = 'test-user'
    const clientId = 'test-client'

    beforeEach(() => {
        vi.clearAllMocks()

        // @ts-ignore
        global.indexedDB = {
            open: vi.fn(() => ({
                onsuccess: null,
                onupgradeneeded: null,
                onerror: null
            }))
        }

        manager = new OfflineSyncManager(userId, clientId)
    })

    it('should correctly map entity types to table names', () => {
        // @ts-ignore - accessing private method for test
        expect(manager.getTableName('transaction')).toBe('transactions')
        // @ts-ignore
        expect(manager.getTableName('account')).toBe('accounts')
        // @ts-ignore
        expect(manager.getTableName('savingsGoal')).toBe('savings_goals')
    })

    it('should encrypt financial values before syncing', () => {
        const amount = 1000
        // @ts-ignore
        const encrypted = manager.encryptValue(amount)
        expect(encrypted).toContain('enc_1000')
    })

    it('should detect conflicts when server timestamp is newer', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { updated_at: new Date(Date.now() + 10000).toISOString() },
                error: null
            })
        };
        (getSupabaseClient as any).mockReturnValue(mockSupabase)

        const change = {
            type: 'update' as const,
            entityType: 'transaction' as const,
            entityId: 'tx-1',
            data: { amount: 100 },
            timestamp: Date.now()
        }

        // @ts-ignore
        const result = await manager.syncSingleChange({
            ...change,
            id: 'change-1',
            userId,
            clientId,
            checksum: 'abc'
        })

        expect(result.conflict).toBeDefined()
        expect(result.success).toBe(false)
    })

    it('should sync successfully when no conflict exists', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { updated_at: new Date(Date.now() - 10000).toISOString() },
                error: null
            }),
            upsert: vi.fn().mockResolvedValue({ error: null })
        };
        (getSupabaseClient as any).mockReturnValue(mockSupabase)

        const change = {
            type: 'update' as const,
            entityType: 'transaction' as const,
            entityId: 'tx-1',
            data: { amount: 100 },
            timestamp: Date.now()
        }

        // @ts-ignore
        const result = await manager.syncSingleChange({
            ...change,
            id: 'change-1',
            userId,
            clientId,
            checksum: 'abc'
        })

        expect(result.success).toBe(true)
        expect(result.conflict).toBeUndefined()
    })
})
