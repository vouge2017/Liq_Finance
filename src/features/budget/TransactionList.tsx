"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useAppContext } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { EmptyState } from '@/shared/components/EmptyState'
import type { Transaction } from '@/types'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { PullToRefreshIndicator } from '@/shared/components/PullToRefreshIndicator'
import { TransactionListSkeleton } from '@/shared/components/OptimizedSkeletons'
import { TransactionItem } from './components/TransactionItem'

export const TransactionList: React.FC = () => {
    const { user, loading: authLoading } = useAuth()
    const {
        state,
        formatDate,
        isPrivacyMode,
        openTransactionModal,
        setScannedImage,
        showNotification,
        refreshTransactions,
        deleteTransaction
    } = useAppContext()
    const { transactions } = state
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

    const { containerRef, isRefreshing, pullProgress } = usePullToRefresh({
        onRefresh: async () => {
            if (refreshTransactions) {
                await refreshTransactions()
                await new Promise(resolve => setTimeout(resolve, 800))
            }
        }
    })

    const handleScanClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setScannedImage(base64String)
            openTransactionModal()
        }
        reader.onerror = () => {
            showNotification("Error reading file", "error")
        }
        reader.readAsDataURL(file)

        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [setScannedImage, openTransactionModal, showNotification])

    if (authLoading) {
        return (
            <div className="w-full mb-24">
                <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-4">Recent Transactions</h3>
                <TransactionListSkeleton count={5} />
            </div>
        )
    }

    if (!user) {
        return <div className="mb-24 text-center py-8 text-gray-400 text-sm">Sign in to view transactions</div>
    }

    const handleEdit = (tx: Transaction) => openTransactionModal(tx)
    const handleDelete = (id: string) => deleteTransaction(id)
    const handleItemClick = (tx: Transaction) => openTransactionModal(tx)

    return (
        <div className="w-full mb-24 relative" ref={containerRef}>
            <PullToRefreshIndicator isRefreshing={isRefreshing} pullProgress={pullProgress} />

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-2">Recent Transactions</h3>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilterType('all')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterType === 'all' 
                            ? 'bg-[#1B4D3E] text-white shadow-md' 
                            : 'bg-white text-[#2C2416] border border-gray-200 hover:border-[#1B4D3E]/30'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilterType('income')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterType === 'income' 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'bg-white text-[#2C2416] border border-gray-200 hover:border-emerald-500/30'
                    }`}
                >
                    <Icons.TrendingUp size={14} />
                    Income
                </button>
                <button
                    onClick={() => setFilterType('expense')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterType === 'expense' 
                            ? 'bg-rose-500 text-white shadow-md' 
                            : 'bg-white text-[#2C2416] border border-gray-200 hover:border-rose-500/30'
                    }`}
                >
                    <Icons.ArrowDown size={14} />
                    Expense
                </button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setTimeRange('week')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeRange === 'week' 
                            ? 'bg-[#1B4D3E] text-white shadow-md' 
                            : 'bg-white text-[#2C2416] border border-gray-200 hover:border-[#1B4D3E]/30'
                    }`}
                >
                    7 Days
                </button>
                <button
                    onClick={() => setTimeRange('month')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeRange === 'month' 
                            ? 'bg-[#1B4D3E] text-white shadow-md' 
                            : 'bg-white text-[#2C2416] border border-gray-200 hover:border-[#1B4D3E]/30'
                    }`}
                >
                    30 Days
                </button>
                <button
                    onClick={() => setTimeRange('all')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeRange === 'all' 
                            ? 'bg-[#1B4D3E] text-white shadow-md' 
                            : 'bg-white text-[#2C2416] border border-gray-200 hover:border-[#1B4D3E]/30'
                    }`}
                >
                    All Time
                </button>
            </div>

            {transactions.length > 0 && (
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                    {transactions.filter(t => {
                        if (filterType === 'all') return true
                        return t.type === filterType
                    }).length} items
                </span>
            )}

            {transactions.length === 0 ? (
                <EmptyState
                    icon={<Icons.Shopping size={32} />}
                    title="No transactions yet"
                    description="Start tracking your expenses by adding your first transaction."
                    action={{
                        label: "Add Transaction",
                        onClick: () => openTransactionModal(),
                        icon: <Icons.Plus size={18} />
                    }}
                />
            ) : transactions.length <= 10 ? (
                <div className="flex flex-col gap-3">
                    {transactions.map((tx) => (
                        <TransactionItem
                            key={tx.id}
                            transaction={tx}
                            formatDate={formatDate}
                            isPrivacyMode={isPrivacyMode}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onClick={handleItemClick}
                        />
                    ))}
                </div>
            ) : (
                <VirtualizedTransactionList
                    transactions={transactions}
                    formatDate={formatDate}
                    isPrivacyMode={isPrivacyMode}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onItemClick={handleItemClick}
                />
            )}
        </div>
    )
}

interface VirtualizedTransactionListProps {
    transactions: Transaction[]
    formatDate: (dateStr: string) => string
    isPrivacyMode: boolean
    onEdit: (tx: Transaction) => void
    onDelete: (id: string) => void
    onItemClick: (tx: Transaction) => void
}

const VirtualizedTransactionList: React.FC<VirtualizedTransactionListProps> = ({
    transactions,
    formatDate,
    isPrivacyMode,
    onEdit,
    onDelete,
    onItemClick
}) => {
    const [FixedSizeList, setFixedSizeList] = useState<React.ComponentType<any> | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        import('react-window').then((module) => {
            setFixedSizeList(() => (module as any).FixedSizeList)
            setLoading(false)
        })
    }, [])

    if (loading || !FixedSizeList) {
        return (
            <div className="flex flex-col gap-3">
                {transactions.slice(0, 10).map((tx) => (
                    <TransactionItem
                        key={tx.id}
                        transaction={tx}
                        formatDate={formatDate}
                        isPrivacyMode={isPrivacyMode}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onClick={onItemClick}
                    />
                ))}
            </div>
        )
    }

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const tx = transactions[index]
        return (
            <div style={{ ...style, paddingBottom: '12px' }}>
                <TransactionItem
                    transaction={tx}
                    formatDate={formatDate}
                    isPrivacyMode={isPrivacyMode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onItemClick}
                />
            </div>
        )
    }

    return (
        <div style={{ height: Math.min(transactions.length * 100, 600) }}>
            <FixedSizeList
                height={Math.min(transactions.length * 100, 600)}
                itemCount={transactions.length}
                itemSize={100}
                width="100%"
                className="scrollbar-thin"
            >
                {Row}
            </FixedSizeList>
        </div>
    )
}
