/**
 * Conflict Resolution Modal Component
 * Provides UI for resolving offline sync conflicts
 */

import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, X, Clock, User } from 'lucide-react'

interface ConflictInfo {
    changeId: string
    timestamp: number
    data: any
    userId: string
    clientId: string
    conflictType: 'create_create' | 'update_update' | 'create_update' | 'delete_update'
}

interface ConflictResolutionModalProps {
    isOpen: boolean
    onClose: () => void
    conflicts: Array<{ entityId: string; conflicts: ConflictInfo[] }>
    onResolve: (entityId: string, resolution: 'keep_local' | 'keep_server' | 'merge') => void
    entityType: string
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
    isOpen,
    onClose,
    conflicts,
    onResolve,
    entityType
}) => {
    const [selectedConflicts, setSelectedConflicts] = useState<Record<string, 'keep_local' | 'keep_server' | 'merge'>>({})

    if (!isOpen) return null

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    const getConflictTypeLabel = (type: ConflictInfo['conflictType']) => {
        switch (type) {
            case 'create_create':
                return 'Multiple users created this item'
            case 'update_update':
                return 'Multiple users updated this item'
            case 'create_update':
                return 'One user created while another updated'
            case 'delete_update':
                return 'One user deleted while another updated'
            default:
                return 'Unknown conflict'
        }
    }

    const handleResolve = (entityId: string) => {
        const resolution = selectedConflicts[entityId]
        if (resolution) {
            onResolve(entityId, resolution)
            // Remove from selected conflicts
            const newSelected = { ...selectedConflicts }
            delete newSelected[entityId]
            setSelectedConflicts(newSelected)
        }
    }

    const getDataPreview = (data: any) => {
        if (!data) return 'No data'

        if (entityType === 'transaction') {
            return `${data.title} - ${data.amount?.toLocaleString()} ETB`
        } else if (entityType === 'account') {
            return `${data.name} - ${data.balance?.toLocaleString()} ETB`
        } else if (entityType === 'savingsGoal') {
            return `${data.title} - ${data.currentAmount?.toLocaleString()}/${data.targetAmount?.toLocaleString()} ETB`
        } else if (entityType === 'iqub') {
            return `${data.title} - ${data.amount?.toLocaleString()} ETB (Round ${data.currentRound}/${data.members})`
        } else if (entityType === 'iddir') {
            return `${data.name} - ${data.monthlyContribution?.toLocaleString()} ETB/month`
        }

        return JSON.stringify(data, null, 2).substring(0, 100) + '...'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <AlertTriangle className="text-orange-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Sync Conflicts Detected</h2>
                            <p className="text-sm text-gray-400">
                                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} need resolution
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conflict List */}
                <div className="space-y-4 mb-6">
                    {conflicts.map(({ entityId, conflicts: entityConflicts }) => (
                        <div key={entityId} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white">
                                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)}: {entityId}
                                </h3>
                                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                                    {entityConflicts.length} conflict{entityConflicts.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Conflict Details */}
                            <div className="space-y-2 mb-4">
                                {entityConflicts.map((conflict, index) => (
                                    <div key={conflict.changeId} className="bg-gray-700/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-300">{formatTimestamp(conflict.timestamp)}</span>
                                            <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                                                {conflict.conflictType.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">
                                            {getConflictTypeLabel(conflict.conflictType)}
                                        </p>
                                        <div className="bg-gray-600 rounded p-2">
                                            <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                                                {getDataPreview(conflict.data)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Resolution Options */}
                            <div className="border-t border-gray-700 pt-3">
                                <p className="text-sm text-gray-300 mb-3">How would you like to resolve this conflict?</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => setSelectedConflicts(prev => ({ ...prev, [entityId]: 'keep_local' }))}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedConflicts[entityId] === 'keep_local'
                                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                            }`}
                                    >
                                        <CheckCircle size={18} />
                                        <div className="text-left">
                                            <div className="font-medium">Keep Local Changes</div>
                                            <div className="text-xs opacity-80">Use the most recent local changes</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedConflicts(prev => ({ ...prev, [entityId]: 'keep_server' }))}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedConflicts[entityId] === 'keep_server'
                                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                            }`}
                                    >
                                        <User size={18} />
                                        <div className="text-left">
                                            <div className="font-medium">Keep Server Changes</div>
                                            <div className="text-xs opacity-80">Use the server version</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedConflicts(prev => ({ ...prev, [entityId]: 'merge' }))}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedConflicts[entityId] === 'merge'
                                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                                            }`}
                                    >
                                        <AlertTriangle size={18} />
                                        <div className="text-left">
                                            <div className="font-medium">Smart Merge</div>
                                            <div className="text-xs opacity-80">Intelligently combine changes</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Resolve Button */}
                                {selectedConflicts[entityId] && (
                                    <button
                                        onClick={() => handleResolve(entityId)}
                                        className="w-full mt-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Resolve This Conflict
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                        {Object.keys(selectedConflicts).length > 0 && (
                            <span>{Object.keys(selectedConflicts).length} conflict(s) selected for resolution</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                // Resolve all conflicts with default strategy
                                conflicts.forEach(({ entityId }) => {
                                    if (selectedConflicts[entityId]) {
                                        onResolve(entityId, selectedConflicts[entityId])
                                    }
                                })
                                onClose()
                            }}
                            disabled={Object.keys(selectedConflicts).length === 0}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            Resolve All Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}