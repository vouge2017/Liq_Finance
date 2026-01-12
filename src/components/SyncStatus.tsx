"use client"

import React, { useEffect, useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'

interface SyncStatusProps {
    showLabels?: boolean
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ showLabels = true }) => {
    const { getSyncStatus, syncOfflineChanges, getPendingConflicts } = useAppContext()
    const [status, setStatus] = useState<{ queued: number; conflicts: number; online: boolean } | null>(null)
    const [pendingConflicts, setPendingConflicts] = useState<any[]>([])
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        const updateStatus = () => {
            const syncStatus = getSyncStatus()
            setStatus(syncStatus)
            setPendingConflicts(getPendingConflicts())
        }

        updateStatus()

        const interval = setInterval(updateStatus, 5000)
        return () => clearInterval(interval)
    }, [getSyncStatus, getPendingConflicts])

    const handleSync = async () => {
        if (isSyncing || !status?.online) return
        setIsSyncing(true)
        try {
            await syncOfflineChanges()
            const syncStatus = getSyncStatus()
            setStatus(syncStatus)
            setPendingConflicts(getPendingConflicts())
        } catch (error) {
            console.error('Sync failed:', error)
        } finally {
            setIsSyncing(false)
        }
    }

    if (!status) return null

    const hasChanges = status.queued > 0 || status.conflicts > 0
    const hasConflicts = status.conflicts > 0 || pendingConflicts.length > 0

    return (
        <div className="flex items-center gap-2">
            {/* Online/Offline Indicator */}
            <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                    status.online
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                }`}
            >
                <div
                    className={`w-2 h-2 rounded-full animate-pulse ${
                        status.online ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                />
                <span
                    className={`text-xs font-bold ${
                        status.online
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                    }`}
                >
                    {status.online ? 'Online' : 'Offline'}
                </span>
            </div>

            {/* Pending Changes Indicator */}
            {hasChanges && (
                <button
                    onClick={handleSync}
                    disabled={isSyncing || !status.online}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                        hasConflicts
                            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
                            : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                    } ${!status.online ? 'opacity-50' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                >
                    {isSyncing ? (
                        <Icons.Loader size={14} className="animate-spin text-blue-600 dark:text-blue-400" />
                    ) : hasConflicts ? (
                        <Icons.AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
                    ) : (
                        <Icons.Upload size={14} className="text-blue-600 dark:text-blue-400" />
                    )}
                    <span
                        className={`text-xs font-bold ${
                            hasConflicts
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-blue-700 dark:text-blue-400'
                        }`}
                    >
                        {status.queued > 0 ? `${status.queued} pending` : `${status.conflicts} conflicts`}
                    </span>
                </button>
            )}

            {/* Sync Now Button */}
            {hasChanges && status.online && (
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                    title="Sync now"
                >
                    <Icons.Refresh size={14} className={isSyncing ? 'animate-spin' : ''} />
                </button>
            )}
        </div>
    )
}
