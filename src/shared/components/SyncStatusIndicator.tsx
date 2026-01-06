/**
 * SyncStatusIndicator - Shows offline sync status in UI
 * 
 * Displays:
 * - Online/Offline status
 * - Pending changes count
 * - Conflict count (if any)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from './Icons';
import { OfflineSyncManager } from '@/lib/offline-sync';
import { ConflictResolutionModal } from './ConflictResolutionModal';

interface SyncStatus {
    queued: number;
    conflicts: number;
    online: boolean;
}

interface SyncStatusIndicatorProps {
    userId: string;
    clientId: string;
    className?: string;
    compact?: boolean; // For header vs settings views
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
    userId,
    clientId,
    className = '',
    compact = true
}) => {
    const [status, setStatus] = useState<SyncStatus>({
        queued: 0,
        conflicts: 0,
        online: typeof navigator !== 'undefined' ? navigator.onLine : true
    });
    const [syncManager, setSyncManager] = useState<OfflineSyncManager | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [showConflicts, setShowConflicts] = useState(false);

    // Initialize sync manager
    useEffect(() => {
        if (userId && clientId) {
            const manager = new OfflineSyncManager(userId, clientId);
            setSyncManager(manager);
        }
    }, [userId, clientId]);

    // Subscribe to sync manager updates
    useEffect(() => {
        if (!syncManager) return;

        const unsubscribe = syncManager.subscribe((newStatus) => {
            setStatus(newStatus);
            if (newStatus.online && !status.online) {
                setLastSyncTime(new Date());
            }
        });

        return () => unsubscribe();
    }, [syncManager, status.online]);

    // Manual sync trigger
    const handleAction = useCallback(async () => {
        if (!syncManager || isSyncing) return;

        if (status.conflicts > 0) {
            setShowConflicts(true);
            return;
        }

        if (!status.online) return;

        setIsSyncing(true);
        try {
            await syncManager.syncWithServer();
            setLastSyncTime(new Date());
        } catch (error) {
            console.error('[SyncStatus] Manual sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [syncManager, isSyncing, status.online, status.conflicts]);

    // Determine status icon and color
    const getStatusDisplay = () => {
        if (!status.online) {
            return {
                icon: <Icons.WifiOff size={16} />,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10',
                label: 'Offline'
            };
        }

        if (status.conflicts > 0) {
            return {
                icon: <Icons.Alert size={16} />,
                color: 'text-rose-500',
                bgColor: 'bg-rose-500/10',
                label: `${status.conflicts} conflicts`
            };
        }

        if (status.queued > 0) {
            return {
                icon: isSyncing ? <Icons.Refresh size={16} className="animate-spin" /> : <Icons.Cloud size={16} />,
                color: 'text-cyan-500',
                bgColor: 'bg-cyan-500/10',
                label: `${status.queued} pending`
            };
        }

        return {
            icon: <Icons.Check size={16} />,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            label: 'Synced'
        };
    };

    const display = getStatusDisplay();

    return (
        <>
            {/* Compact mode for header */}
            {compact ? (
                <button
                    onClick={handleAction}
                    disabled={isSyncing || (!status.online && status.conflicts === 0)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${display.bgColor} ${display.color} ${className}`}
                    title={`${display.label}${lastSyncTime ? `. Last sync: ${lastSyncTime.toLocaleTimeString()}` : ''}`}
                >
                    {display.icon}
                    {(status.queued > 0 || status.conflicts > 0) && (
                        <span className="text-xs font-medium">{status.queued || status.conflicts}</span>
                    )}
                </button>
            ) : (
                /* Expanded mode for settings */
                <div className={`flex items-center justify-between p-4 rounded-xl ${display.bgColor} ${className}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/10 ${display.color}`}>
                            {display.icon}
                        </div>
                        <div>
                            <p className={`font-medium ${display.color}`}>{display.label}</p>
                            {lastSyncTime && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Last sync: {lastSyncTime.toLocaleTimeString()}
                                </p>
                            )}
                            {status.queued > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {status.queued} change{status.queued !== 1 ? 's' : ''} waiting to sync
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {status.conflicts > 0 && (
                            <button
                                onClick={() => setShowConflicts(true)}
                                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
                            >
                                Resolve
                            </button>
                        )}
                        {status.online && status.queued > 0 && (
                            <button
                                onClick={handleAction}
                                disabled={isSyncing}
                                className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
                            >
                                {isSyncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Conflict Resolution Modal */}
            {syncManager && (
                <ConflictResolutionModal
                    isOpen={showConflicts}
                    onClose={() => setShowConflicts(false)}
                    syncManager={syncManager}
                    userId={userId}
                />
            )}
        </>
    );
};

/**
 * Hook to get sync status without UI component
 */
export const useSyncStatus = (userId: string, clientId: string) => {
    const [status, setStatus] = useState<SyncStatus>({
        queued: 0,
        conflicts: 0,
        online: typeof navigator !== 'undefined' ? navigator.onLine : true
    });
    const [syncManager, setSyncManager] = useState<OfflineSyncManager | null>(null);

    useEffect(() => {
        if (userId && clientId) {
            const manager = new OfflineSyncManager(userId, clientId);
            setSyncManager(manager);
        }
    }, [userId, clientId]);

    useEffect(() => {
        if (!syncManager) return;

        const unsubscribe = syncManager.subscribe(setStatus);
        return () => unsubscribe();
    }, [syncManager]);

    return {
        ...status,
        syncManager
    };
};
