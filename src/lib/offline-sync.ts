/**
 * Offline-First Conflict Resolution and Sync System
 * Handles concurrent edits, merge strategies, and offline queue management
 * 
 * STORAGE: Uses IndexedDB for durability (survives app reinstall)
 */

import type { Transaction, Account, SavingsGoal, Iqub, Iddir } from '@/types'
import { getSupabaseClient } from '@/lib/supabase/client'
import { dataEncryptionService } from '@/lib/security/data-encryption'

// IndexedDB constants
const SYNC_DB_NAME = 'liq-offline-sync'
const SYNC_DB_VERSION = 1
const QUEUE_STORE = 'sync-queue'
const CONFLICTS_STORE = 'conflicts'

export interface OfflineChange {
    id: string
    type: 'create' | 'update' | 'delete'
    entityType: 'transaction' | 'account' | 'savingsGoal' | 'iqub' | 'iddir'
    entityId: string
    data: any
    timestamp: number
    userId: string
    clientId: string
    checksum: string
    resolved?: boolean
    conflicts?: ConflictInfo[]
}

export interface ConflictInfo {
    changeId: string
    timestamp: number
    data: any
    userId: string
    clientId: string
    conflictType: 'create_create' | 'update_update' | 'create_update' | 'delete_update'
}

export interface MergeStrategy {
    name: string
    resolve: (conflictingChanges: OfflineChange[]) => OfflineChange
    description: string
}

export class OfflineSyncManager {
    private syncQueue: OfflineChange[] = []
    private conflicts: Map<string, ConflictInfo[]> = new Map()
    private db: IDBDatabase | null = null
    private initialized: boolean = false
    private listeners: Set<(status: { queued: number; conflicts: number; online: boolean }) => void> = new Set()

    constructor(private userId: string, private clientId: string) {
        this.initialize()
    }

    /**
     * Subscribe to sync status changes
     */
    subscribe(listener: (status: { queued: number; conflicts: number; online: boolean }) => void): () => void {
        this.listeners.add(listener)
        listener(this.getSyncStatus())
        return () => this.listeners.delete(listener)
    }

    private notifyListeners(): void {
        const status = this.getSyncStatus()
        this.listeners.forEach(l => l(status))
    }

    /**
     * Initialize IndexedDB and load existing data
     */
    private async initialize(): Promise<void> {
        try {
            this.db = await this.openDatabase()
            await this.loadFromIndexedDB()
            this.setupOnlineListener()
            this.initialized = true
            this.notifyListeners()
            console.log('[OfflineSync] Initialized with IndexedDB storage')
        } catch (error) {
            console.error('[OfflineSync] Failed to initialize IndexedDB:', error)
            // Fallback to localStorage for critical degradation
            this.loadFromLocalStorage()
            this.initialized = true
            this.notifyListeners()
        }
    }

    /**
     * Open IndexedDB database
     */
    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(SYNC_DB_NAME, SYNC_DB_VERSION)

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Create sync queue store
                if (!db.objectStoreNames.contains(QUEUE_STORE)) {
                    const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' })
                    queueStore.createIndex('userId', 'userId', { unique: false })
                    queueStore.createIndex('resolved', 'resolved', { unique: false })
                }

                // Create conflicts store
                if (!db.objectStoreNames.contains(CONFLICTS_STORE)) {
                    const conflictStore = db.createObjectStore(CONFLICTS_STORE, { keyPath: 'entityId' })
                    conflictStore.createIndex('userId', 'userId', { unique: false })
                }
            }

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result)
            }

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error)
            }
        })
    }

    /**
     * Wait for initialization
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return
        // Wait up to 3 seconds for initialization
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 100))
            if (this.initialized) return
        }
    }

    /**
     * Add a change to the offline queue
     */
    async queueChange(change: Omit<OfflineChange, 'id' | 'timestamp' | 'userId' | 'clientId' | 'checksum'>): Promise<string> {
        await this.ensureInitialized()

        const fullChange: OfflineChange = {
            ...change,
            id: this.generateChangeId(),
            timestamp: Date.now(),
            userId: this.userId,
            clientId: this.clientId,
            checksum: this.calculateChecksum(change.data),
            resolved: false,
        }

        this.syncQueue.push(fullChange)
        await this.saveToIndexedDB()

        // Check for immediate conflicts if online
        if (this.isOnline()) {
            await this.checkForConflicts(fullChange)
        }

        return fullChange.id
    }

    /**
     * Check for conflicts with existing server data
     */
    private async checkForConflicts(newChange: OfflineChange): Promise<void> {
        const serverVersion = await this.getServerVersion(newChange.entityType, newChange.entityId)

        if (serverVersion && serverVersion.lastModified > newChange.timestamp) {
            // Conflict detected
            const conflict: ConflictInfo = {
                changeId: newChange.id,
                timestamp: newChange.timestamp,
                data: newChange.data,
                userId: newChange.userId,
                clientId: newChange.clientId,
                conflictType: this.determineConflictType(newChange, serverVersion),
            }

            const existingConflicts = this.conflicts.get(newChange.entityId) || []
            existingConflicts.push(conflict)
            this.conflicts.set(newChange.entityId, existingConflicts)

            await this.saveToIndexedDB()
        }
    }

    /**
     * Determine conflict type based on change and server state
     */
    private determineConflictType(change: OfflineChange, serverVersion: any): ConflictInfo['conflictType'] {
        if (change.type === 'create' && serverVersion.exists) return 'create_create'
        if (change.type === 'update' && serverVersion.exists && serverVersion.lastModified > change.timestamp) return 'update_update'
        if (change.type === 'delete' && serverVersion.exists && serverVersion.lastModified > change.timestamp) return 'delete_update'
        if (change.type === 'create' && serverVersion.exists) return 'create_update'

        return 'update_update'
    }

    /**
     * Sync queued changes with server
     */
    async syncWithServer(): Promise<{ success: boolean; conflicts: number; errors: string[] }> {
        if (!this.isOnline()) {
            return { success: false, conflicts: 0, errors: ['No internet connection'] }
        }

        const errors: string[] = []
        let conflictCount = 0

        for (const change of this.syncQueue) {
            if (change.resolved) continue

            try {
                const result = await this.syncSingleChange(change)

                if (result.conflict) {
                    conflictCount++
                    await this.handleConflict(change, result.conflict)
                } else if (result.success) {
                    change.resolved = true
                } else {
                    errors.push(`Failed to sync ${change.entityType} ${change.entityId}: ${result.error}`)
                }
            } catch (error) {
                errors.push(`Error syncing ${change.entityType} ${change.entityId}: ${error}`)
            }
        }

        await this.saveToIndexedDB()
        return { success: errors.length === 0, conflicts: conflictCount, errors }
    }

    /**
     * Sync a single change with conflict resolution
     */
    private async syncSingleChange(change: OfflineChange): Promise<{ success: boolean; conflict?: any; error?: string }> {
        try {
            // Get current server state
            const serverState = await this.getServerVersion(change.entityType, change.entityId)

            if (!serverState.exists) {
                // Create new entity
                const result = await this.createOnServer(change)
                return { success: result }
            }

            if (serverState.lastModified <= change.timestamp) {
                // No conflict, update directly
                const result = await this.updateOnServer(change)
                return { success: result }
            }

            // Conflict detected
            return { success: false, conflict: serverState }

        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    /**
     * Handle conflicts using merge strategies
     */
    private async handleConflict(offlineChange: OfflineChange, serverState: any): Promise<void> {
        const entityConflicts = this.conflicts.get(offlineChange.entityId)
        if (!entityConflicts) return

        // Apply merge strategy based on entity type
        const strategy = this.getMergeStrategy(offlineChange.entityType)
        const resolvedChange = strategy.resolve([offlineChange, ...entityConflicts.map(c => ({
            ...offlineChange,
            data: c.data,
            timestamp: c.timestamp,
            id: c.changeId,
        }))])

        // Apply the resolved change
        try {
            const result = await this.updateOnServer(resolvedChange)
            if (result) {
                resolvedChange.resolved = true
            }
        } catch (error) {
            console.error('Failed to resolve conflict:', error)
        }
    }

    /**
     * Get appropriate merge strategy for entity type
     */
    private getMergeStrategy(entityType: OfflineChange['entityType']): MergeStrategy {
        switch (entityType) {
            case 'transaction':
                return new LastWriterWinsStrategy()
            case 'account':
                return new ManualMergeStrategy()
            case 'savingsGoal':
                return new NumericMergeStrategy()
            case 'iqub':
                return new IqubMergeStrategy()
            case 'iddir':
                return new IddirMergeStrategy()
            default:
                return new LastWriterWinsStrategy()
        }
    }

    /**
     * Server state methods - integrate with Supabase
     */
    private async getServerVersion(entityType: string, entityId: string): Promise<any> {
        const supabase = getSupabaseClient()
        if (!supabase) return { exists: false }

        const table = this.getTableName(entityType)
        if (!table) return { exists: false }

        try {
            const { data, error } = await supabase
                .from(table)
                .select('updated_at, transaction_date, date')
                .eq('id', entityId)
                .single()

            if (error || !data) return { exists: false }

            // Handle different date fields for lastModified
            let lastModified = Date.now()
            if (data.updated_at) {
                lastModified = new Date(data.updated_at).getTime()
            } else if (data.transaction_date) {
                lastModified = new Date(data.transaction_date).getTime()
            } else if (data.date) {
                lastModified = new Date(data.date).getTime()
            }

            return { exists: true, lastModified, data }
        } catch (error) {
            console.error('Error fetching server version:', error)
            return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    private async createOnServer(change: OfflineChange): Promise<boolean> {
        return this.upsertOnServer(change)
    }

    private async updateOnServer(change: OfflineChange): Promise<boolean> {
        return this.upsertOnServer(change)
    }

    private async upsertOnServer(change: OfflineChange): Promise<boolean> {
        const supabase = getSupabaseClient()
        if (!supabase) return false

        const table = this.getTableName(change.entityType)
        if (!table) return false

        try {
            const mappedData = this.mapToSupabase(change.entityType, change.data, change.userId)
            const { error } = await supabase
                .from(table)
                .upsert({
                    id: change.entityId,
                    ...mappedData,
                    updated_at: new Date().toISOString()
                })

            if (error) {
                console.error(`[OfflineSync] Error upserting ${change.entityType}:`, error)
                return false
            }

            console.log(`[OfflineSync] Successfully synced ${change.entityType} ${change.entityId}`)
            return true
        } catch (error) {
            console.error(`[OfflineSync] Exception upserting ${change.entityType}:`, error)
            return false
        }
    }

    private getTableName(entityType: string): string | null {
        switch (entityType) {
            case 'transaction': return 'transactions'
            case 'account': return 'accounts'
            case 'savingsGoal': return 'savings_goals'
            case 'iqub': return 'iqubs'
            case 'iddir': return 'iddirs'
            default: return null
        }
    }

    private mapToSupabase(entityType: string, data: any, userId: string): any {
        const mapped: any = { user_id: userId }

        switch (entityType) {
            case 'transaction':
                return {
                    ...mapped,
                    title: data.title,
                    transaction_date: data.date,
                    amount: this.encryptValue(data.amount),
                    type: data.type,
                    category: data.category,
                    icon: data.icon,
                    account_id: data.accountId,
                    profile: data.profile,
                    goal_id: data.goalId,
                    iqub_id: data.iqubId,
                    iddir_id: data.iddirId,
                }
            case 'account':
                return {
                    ...mapped,
                    name: data.name,
                    institution: data.institution,
                    type: data.type,
                    balance: this.encryptValue(data.balance),
                    account_number: data.accountNumber,
                    color: data.color,
                    profile: data.profile,
                    subtype: data.subtype,
                    loan_details: data.loanDetails,
                }
            case 'savingsGoal':
                return {
                    ...mapped,
                    title: data.title,
                    target_amount: this.encryptValue(data.targetAmount),
                    current_amount: this.encryptValue(data.currentAmount),
                    icon: data.icon,
                    color: data.color,
                    round_up_enabled: data.roundUpEnabled,
                    profile: data.profile,
                    deadline: data.deadline,
                    default_account_id: data.defaultAccountId,
                }
            case 'iqub':
                return {
                    ...mapped,
                    title: data.title,
                    purpose: data.purpose,
                    amount: this.encryptValue(data.amount),
                    cycle: data.cycle,
                    members: data.members,
                    current_round: data.currentRound,
                    start_date: data.startDate,
                    my_turn_date: data.myTurnDate,
                    payout_amount: this.encryptValue(data.payoutAmount),
                    status: data.status,
                    next_payment_date: data.nextPaymentDate,
                    paid_rounds: data.paidRounds,
                    has_won: data.hasWon,
                    winning_round: data.winningRound,
                    profile: data.profile,
                }
            case 'iddir':
                return {
                    ...mapped,
                    name: data.name,
                    monthly_contribution: this.encryptValue(data.monthlyContribution),
                    payment_date: data.paymentDate,
                    last_paid_date: data.lastPaidDate,
                    status: data.status,
                    profile: data.profile,
                    reminder_enabled: data.reminderEnabled,
                    reminder_days_before: data.reminderDaysBefore,
                }
            default:
                return data
        }
    }

    private encryptValue(value: number | string): string {
        const encrypted = dataEncryptionService.encrypt(value.toString())
        return JSON.stringify(encrypted)
    }

    // =========================================================================
    // INDEXEDDB STORAGE METHODS
    // =========================================================================

    /**
     * Load queue and conflicts from IndexedDB
     */
    private async loadFromIndexedDB(): Promise<void> {
        if (!this.db) return

        try {
            // Load sync queue
            const queueTx = this.db.transaction(QUEUE_STORE, 'readonly')
            const queueStore = queueTx.objectStore(QUEUE_STORE)
            const queueIndex = queueStore.index('userId')
            const queueRequest = queueIndex.getAll(this.userId)

            this.syncQueue = await new Promise((resolve, reject) => {
                queueRequest.onsuccess = () => resolve(queueRequest.result || [])
                queueRequest.onerror = () => reject(queueRequest.error)
            })

            // Load conflicts
            const conflictTx = this.db.transaction(CONFLICTS_STORE, 'readonly')
            const conflictStore = conflictTx.objectStore(CONFLICTS_STORE)
            const conflictIndex = conflictStore.index('userId')
            const conflictRequest = conflictIndex.getAll(this.userId)

            const conflictRecords: Array<{ entityId: string; conflicts: ConflictInfo[]; userId: string; checksum?: string }> = await new Promise((resolve, reject) => {
                conflictRequest.onsuccess = () => resolve(conflictRequest.result || [])
                conflictRequest.onerror = () => reject(conflictRequest.error)
            })

            this.conflicts = new Map(conflictRecords.map(r => {
                // Verify checksum for each conflict record if present
                if (r.checksum) {
                    const currentChecksum = this.calculateChecksum(r.conflicts)
                    if (currentChecksum !== r.checksum) {
                        console.warn(`[OfflineSync] Integrity check failed for conflict: ${r.entityId}`)
                    }
                }
                return [r.entityId, r.conflicts]
            }))

            console.log(`[OfflineSync] Loaded ${this.syncQueue.length} queued changes, ${this.conflicts.size} conflicts from IndexedDB`)
        } catch (error) {
            console.error('[OfflineSync] Failed to load from IndexedDB:', error)
        }
    }

    /**
     * Save queue and conflicts to IndexedDB
     */
    private async saveToIndexedDB(): Promise<void> {
        if (!this.db) {
            // Fallback to localStorage if IndexedDB unavailable
            this.saveToLocalStorage()
            return
        }

        try {
            // Save sync queue - clear and re-add all
            const queueTx = this.db.transaction(QUEUE_STORE, 'readwrite')
            const queueStore = queueTx.objectStore(QUEUE_STORE)

            // Add all current queue items (put will update existing)
            for (const change of this.syncQueue) {
                queueStore.put(change)
            }

            await new Promise<void>((resolve, reject) => {
                queueTx.oncomplete = () => resolve()
                queueTx.onerror = () => reject(queueTx.error)
            })

            // Save conflicts
            const conflictTx = this.db.transaction(CONFLICTS_STORE, 'readwrite')
            const conflictStore = conflictTx.objectStore(CONFLICTS_STORE)

            for (const [entityId, conflicts] of this.conflicts.entries()) {
                const checksum = this.calculateChecksum(conflicts)
                conflictStore.put({ entityId, conflicts, userId: this.userId, checksum })
            }

            await new Promise<void>((resolve, reject) => {
                conflictTx.oncomplete = () => resolve()
                conflictTx.onerror = () => reject(conflictTx.error)
            })

            this.notifyListeners()
        } catch (error) {
            console.error('[OfflineSync] Failed to save to IndexedDB:', error)
            // Fallback to localStorage
            this.saveToLocalStorage()
            this.notifyListeners()
        }
    }

    /**
     * Fallback: Load from localStorage (legacy support)
     */
    private loadFromLocalStorage(): void {
        try {
            const stored = localStorage.getItem('liq-offline-changes')
            if (stored) {
                this.syncQueue = JSON.parse(stored)
            }

            const conflictStored = localStorage.getItem('liq-conflicts')
            if (conflictStored) {
                const conflicts = JSON.parse(conflictStored)
                this.conflicts = new Map(Object.entries(conflicts) as [string, ConflictInfo[]][])
            }
            console.log('[OfflineSync] Loaded from localStorage fallback')
        } catch (error) {
            console.error('[OfflineSync] Error loading from localStorage:', error)
        }
    }

    /**
     * Fallback: Save to localStorage
     */
    private saveToLocalStorage(): void {
        try {
            localStorage.setItem('liq-offline-changes', JSON.stringify(this.syncQueue))
            const conflictsObj = Object.fromEntries(this.conflicts)
            localStorage.setItem('liq-conflicts', JSON.stringify(conflictsObj))
        } catch (error) {
            console.error('[OfflineSync] Error saving to localStorage:', error)
        }
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    private generateChangeId(): string {
        return `${this.clientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    private calculateChecksum(data: any): string {
        return btoa(JSON.stringify(data)).slice(0, 16)
    }

    private isOnline(): boolean {
        return typeof navigator !== 'undefined' && navigator.onLine
    }

    private setupOnlineListener(): void {
        if (typeof window === 'undefined') return

        window.addEventListener('online', () => {
            this.notifyListeners()
            this.syncWithServer().then(result => {
                if (result.conflicts > 0) {
                    this.notifyConflicts(result.conflicts)
                }
            })
        })

        window.addEventListener('offline', () => {
            this.notifyListeners()
        })
    }

    private notifyConflicts(count: number): void {
        console.warn(`⚠️ ${count} conflicts detected. Manual resolution required.`)
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * Get sync status for UI display
     */
    getSyncStatus(): { queued: number; conflicts: number; online: boolean } {
        const queued = this.syncQueue.filter(c => !c.resolved).length
        const conflictCount = Array.from(this.conflicts.values()).reduce((sum, c) => sum + c.length, 0)

        return {
            queued,
            conflicts: conflictCount,
            online: this.isOnline()
        }
    }

    /**
     * Get pending conflicts for manual resolution
     */
    getPendingConflicts(): Array<{ entityId: string; conflicts: ConflictInfo[] }> {
        return Array.from(this.conflicts.entries()).map(([entityId, conflicts]) => ({
            entityId,
            conflicts
        }))
    }

    /**
     * Resolve a conflict manually
     */
    async resolveConflict(entityId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any): Promise<void> {
        const entityConflicts = this.conflicts.get(entityId)
        if (!entityConflicts) return

        if (resolution === 'server') {
            // Keep server version, discard local changes
            this.syncQueue = this.syncQueue.filter(c => c.entityId !== entityId)
        } else if (resolution === 'local') {
            // Force local version, mark as resolved for next sync
            const change = this.syncQueue.find(c => c.entityId === entityId)
            if (change) {
                // We'll need to force this on next sync
                // For now, just mark as resolved so it tries to sync again with force
                change.resolved = false
            }
        } else if (resolution === 'merge' && mergedData) {
            // Use merged data
            const change = this.syncQueue.find(c => c.entityId === entityId)
            if (change) {
                change.data = mergedData
                change.resolved = false
            }
        }

        this.conflicts.delete(entityId)
        await this.saveToIndexedDB()
        this.notifyListeners()
    }
}

// =========================================================================
// MERGE STRATEGIES
// =========================================================================

class LastWriterWinsStrategy implements MergeStrategy {
    name = 'Last Writer Wins'
    description = 'Most recent change takes precedence'

    resolve(conflictingChanges: OfflineChange[]): OfflineChange {
        return conflictingChanges.sort((a, b) => b.timestamp - a.timestamp)[0]
    }
}

class ManualMergeStrategy implements MergeStrategy {
    name = 'Manual Merge'
    description = 'Requires user intervention for conflict resolution'

    resolve(conflictingChanges: OfflineChange[]): OfflineChange {
        const latest = conflictingChanges.sort((a, b) => b.timestamp - a.timestamp)[0]
        return {
            ...latest,
            resolved: false // Mark as needing manual resolution
        }
    }
}

class NumericMergeStrategy implements MergeStrategy {
    name = 'Numeric Merge'
    description = 'Intelligently merge numeric values (e.g., savings goals)'

    resolve(conflictingChanges: OfflineChange[]): OfflineChange {
        const latest = conflictingChanges.sort((a, b) => b.timestamp - a.timestamp)[0]
        const mergedData = { ...latest.data }

        conflictingChanges.forEach(change => {
            if (change.data.currentAmount > mergedData.currentAmount) {
                mergedData.currentAmount = change.data.currentAmount
            }
        })

        return { ...latest, data: mergedData }
    }
}

class IqubMergeStrategy implements MergeStrategy {
    name = 'Iqub Merge'
    description = 'Specialized merge for Iqub financial commitments'

    resolve(conflictingChanges: OfflineChange[]): OfflineChange {
        const latest = conflictingChanges.sort((a, b) => b.timestamp - a.timestamp)[0]
        const mergedData = { ...latest.data }

        conflictingChanges.forEach(change => {
            if (change.data.paidRounds > mergedData.paidRounds) {
                mergedData.paidRounds = change.data.paidRounds
                mergedData.currentRound = Math.max(mergedData.currentRound, change.data.currentRound)
            }
        })

        return { ...latest, data: mergedData }
    }
}

class IddirMergeStrategy implements MergeStrategy {
    name = 'Iddir Merge'
    description = 'Specialized merge for Iddir community contributions'

    resolve(conflictingChanges: OfflineChange[]): OfflineChange {
        const latest = conflictingChanges.sort((a, b) => b.timestamp - a.timestamp)[0]
        const mergedData = { ...latest.data }

        conflictingChanges.forEach(change => {
            if (new Date(change.data.lastPaidDate) > new Date(mergedData.lastPaidDate)) {
                mergedData.lastPaidDate = change.data.lastPaidDate
            }
        })

        return { ...latest, data: mergedData }
    }
}