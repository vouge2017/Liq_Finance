/**
 * Offline-First Conflict Resolution and Sync System
 * Handles concurrent edits, merge strategies, and offline queue management
 */

import type { Transaction, Account, SavingsGoal, Iqub, Iddir } from '@/types'

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
    private storageKey = 'liq-offline-changes'
    private conflictStorageKey = 'liq-conflicts'
    private syncQueue: OfflineChange[] = []
    private conflicts: Map<string, ConflictInfo[]> = new Map()

    constructor(private userId: string, private clientId: string) {
        this.loadFromStorage()
        this.setupOnlineListener()
    }

    /**
     * Add a change to the offline queue
     */
    async queueChange(change: Omit<OfflineChange, 'id' | 'timestamp' | 'userId' | 'clientId' | 'checksum'>): Promise<string> {
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
        this.saveToStorage()

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

            this.saveConflictsToStorage()
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

        this.saveToStorage()
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
     * Server state simulation methods
     */
    private async getServerVersion(entityType: string, entityId: string): Promise<any> {
        // This would integrate with your actual Supabase data service
        // For now, returning a mock implementation
        try {
            // Import actual data service
            const { getTransactions, getAccounts, getSavingsGoals, getIqubs, getIddirs } = await import('@/lib/supabase/data-service')

            switch (entityType) {
                case 'transaction':
                    const transactions = await getTransactions(this.userId)
                    const tx = transactions.find(t => t.id === entityId)
                    return tx ? { exists: true, lastModified: new Date(tx.date).getTime() } : { exists: false }

                case 'account':
                    const accounts = await getAccounts(this.userId)
                    const acc = accounts.find(a => a.id === entityId)
                    return acc ? { exists: true, lastModified: Date.now() } : { exists: false }

                case 'savingsGoal':
                    const goals = await getSavingsGoals(this.userId)
                    const goal = goals.find(g => g.id === entityId)
                    return goal ? { exists: true, lastModified: Date.now() } : { exists: false }

                case 'iqub':
                    const iqubs = await getIqubs(this.userId)
                    const iqub = iqubs.find(i => i.id === entityId)
                    return iqub ? { exists: true, lastModified: Date.now() } : { exists: false }

                case 'iddir':
                    const iddirs = await getIddirs(this.userId)
                    const iddir = iddirs.find(i => i.id === entityId)
                    return iddir ? { exists: true, lastModified: Date.now() } : { exists: false }

                default:
                    return { exists: false }
            }
        } catch (error) {
            console.error('Error fetching server version:', error)
            return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    private async createOnServer(change: OfflineChange): Promise<boolean> {
        // Implementation would create entity on server
        console.log('Creating on server:', change.entityType, change.entityId)
        return true
    }

    private async updateOnServer(change: OfflineChange): Promise<boolean> {
        // Implementation would update entity on server
        console.log('Updating on server:', change.entityType, change.entityId)
        return true
    }

    /**
     * Utility methods
     */
    private generateChangeId(): string {
        return `${this.clientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    private calculateChecksum(data: any): string {
        // Simple checksum for change validation
        return btoa(JSON.stringify(data)).slice(0, 16)
    }

    private isOnline(): boolean {
        return navigator.onLine
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey)
            if (stored) {
                this.syncQueue = JSON.parse(stored)
            }

            const conflictStored = localStorage.getItem(this.conflictStorageKey)
            if (conflictStored) {
                const conflicts = JSON.parse(conflictStored)
                this.conflicts = new Map(Object.entries(conflicts))
            }
        } catch (error) {
            console.error('Error loading offline changes:', error)
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.syncQueue))
        } catch (error) {
            console.error('Error saving offline changes:', error)
        }
    }

    private saveConflictsToStorage(): void {
        try {
            const conflictsObj = Object.fromEntries(this.conflicts)
            localStorage.setItem(this.conflictStorageKey, JSON.stringify(conflictsObj))
        } catch (error) {
            console.error('Error saving conflicts:', error)
        }
    }

    private setupOnlineListener(): void {
        window.addEventListener('online', () => {
            this.syncWithServer().then(result => {
                if (result.conflicts > 0) {
                    // Notify user of conflicts that need manual resolution
                    this.notifyConflicts(result.conflicts)
                }
            })
        })
    }

    private notifyConflicts(count: number): void {
        // This would trigger a UI notification
        console.warn(`⚠️ ${count} conflicts detected. Manual resolution required.`)
    }

    /**
     * Public API for getting sync status
     */
    getSyncStatus(): { queued: number; conflicts: number; online: boolean } {
        const queued = this.syncQueue.filter(c => !c.resolved).length
        const conflicts = Array.from(this.conflicts.values()).reduce((sum, conflicts) => sum + conflicts.length, 0)

        return {
            queued,
            conflicts,
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
}

/**
 * Merge Strategies
 */

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
        // For accounts, prefer manual resolution
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
        // For savings goals, merge numeric fields intelligently
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
        // For Iqub, preserve payment history and latest state
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
        // For Iddir, preserve payment dates and amounts
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