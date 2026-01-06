/**
 * ConflictResolutionModal - UI for manual conflict resolution
 * 
 * Allows users to choose between local changes and server state
 * when a conflict is detected during sync.
 */

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { OfflineSyncManager, ConflictInfo } from '@/lib/offline-sync';

interface ConflictResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    syncManager: OfflineSyncManager;
    userId: string;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
    isOpen,
    onClose,
    syncManager,
    userId
}) => {
    const [conflicts, setConflicts] = useState<Array<{ entityId: string; conflicts: ConflictInfo[] }>>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [resolving, setResolving] = useState(false);

    // Load conflicts when modal opens
    useEffect(() => {
        if (isOpen) {
            setConflicts(syncManager.getPendingConflicts());
            setCurrentIndex(0);
        }
    }, [isOpen, syncManager]);

    if (!isOpen || conflicts.length === 0) return null;

    const currentConflict = conflicts[currentIndex];
    const conflictInfo = currentConflict.conflicts[0]; // Take the first conflict for this entity

    const handleResolve = async (resolution: 'local' | 'server') => {
        setResolving(true);
        try {
            await syncManager.resolveConflict(currentConflict.entityId, resolution);

            // Move to next conflict or close if done
            const remaining = syncManager.getPendingConflicts();
            if (remaining.length > 0) {
                setConflicts(remaining);
                setCurrentIndex(Math.min(currentIndex, remaining.length - 1));
            } else {
                onClose();
            }
        } catch (error) {
            console.error('[ConflictResolution] Failed to resolve:', error);
        } finally {
            setResolving(false);
        }
    };

    const formatData = (data: any) => {
        if (!data) return 'No data';
        // Simple formatting for common fields
        const fields = [];
        if (data.title) fields.push(`Title: ${data.title}`);
        if (data.amount !== undefined) fields.push(`Amount: ${data.amount} ETB`);
        if (data.name) fields.push(`Name: ${data.name}`);
        if (data.balance !== undefined) fields.push(`Balance: ${data.balance} ETB`);

        return fields.length > 0 ? fields.join('\n') : JSON.stringify(data, null, 2);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl animate-dialog border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                        <Icons.Alert size={28} className="text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Conflict Detected</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Conflict {currentIndex + 1} of {conflicts.length}
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center px-4">
                        Changes were made on another device or by another user. Which version should we keep?
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        {/* Local Version */}
                        <button
                            onClick={() => handleResolve('local')}
                            disabled={resolving}
                            className="p-4 rounded-2xl border-2 border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Your Version (Local)</span>
                                <Icons.Phone size={16} className="text-cyan-500" />
                            </div>
                            <pre className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {formatData(conflictInfo.data)}
                            </pre>
                            <p className="text-[10px] text-gray-500 mt-2 italic">
                                Last edited: {new Date(conflictInfo.timestamp).toLocaleString()}
                            </p>
                        </button>

                        <div className="flex items-center justify-center">
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                            <span className="px-3 text-[10px] font-bold text-gray-400 uppercase">OR</span>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                        </div>

                        {/* Server Version */}
                        <button
                            onClick={() => handleResolve('server')}
                            disabled={resolving}
                            className="p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Server Version</span>
                                <Icons.Globe size={16} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                The version currently saved on the server. Choosing this will discard your local changes.
                            </p>
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                        Resolve Later
                    </button>
                </div>
            </div>
        </div>
    );
};