import React, { useRef, useState, useEffect } from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/shared/components/EmptyState';
import { SignInPrompt } from '@/shared/components/SignInPrompt';
import type { Transaction } from '@/types';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/shared/components/PullToRefreshIndicator';
import { SwipeableItem } from '@/shared/components/SwipeableItem';
import { TransactionListSkeleton } from '@/shared/components/OptimizedSkeletons';

// Category icon and color mapping
const CATEGORY_STYLES: Record<string, { icon: React.ElementType; bgColor: string; textColor: string }> = {
  transport: { icon: Icons.Car, bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-600 dark:text-slate-400' },
  food: { icon: Icons.Coffee, bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400' },
  shopping: { icon: Icons.Shopping, bgColor: 'bg-pink-50 dark:bg-pink-900/20', textColor: 'text-pink-600 dark:text-pink-400' },
  utilities: { icon: Icons.Zap, bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
  income: { icon: Icons.Wallet, bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
  transfer: { icon: Icons.Transfer, bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', textColor: 'text-cyan-600 dark:text-cyan-400' },
  default: { icon: Icons.CreditCard, bgColor: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-600 dark:text-gray-400' },
};

export const TransactionList: React.FC = () => {
  const { user, loading } = useAuth();
  const { state, formatDate, isPrivacyMode, setActiveTab, openTransactionModal, setScannedImage, showNotification, refreshTransactions, deleteTransaction } = useAppContext();
  const { transactions } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: async () => {
      if (refreshTransactions) {
        await refreshTransactions();
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  });

  const getCategoryStyle = (tx: typeof transactions[0]) => {
    if (tx.type === 'transfer') return CATEGORY_STYLES.transfer;
    if (tx.type === 'income') return CATEGORY_STYLES.income;
    if (tx.category?.toLowerCase().includes('transport') || tx.title?.toLowerCase().includes('uber')) return CATEGORY_STYLES.transport;
    if (tx.category?.toLowerCase().includes('food') || tx.title?.toLowerCase().includes('coffee')) return CATEGORY_STYLES.food;
    if (tx.category?.toLowerCase().includes('shopping')) return CATEGORY_STYLES.shopping;
    if (tx.category?.toLowerCase().includes('utilities') || tx.title?.toLowerCase().includes('telecom')) return CATEGORY_STYLES.utilities;
    return CATEGORY_STYLES.default;
  };

  if (loading) {
    return (
      <div className="w-full mb-24">
        <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-4">Recent Transactions</h3>
        <TransactionListSkeleton count={5} />
      </div>
    );
  }

  if (!user) {
    return <div className="mb-24 text-center py-8 text-gray-400 text-sm">Sign in to view transactions</div>;
  }

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setScannedImage(base64String);
      openTransactionModal();
    };
    reader.onerror = () => {
      showNotification("Error reading file", "error");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

      {/* Section Header */}
      <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-4">Recent Transactions</h3>

      {/* Transaction List - Virtualized for performance */}
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
        // For small lists (< 10 items), use regular rendering (better for SwipeableItem)
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => {
            const style = getCategoryStyle(tx);
            const IconComponent = style.icon;

            return (
              <SwipeableItem
                key={tx.id}
                onDelete={() => deleteTransaction(tx.id)}
                onEdit={() => openTransactionModal(tx)}
              >
                <div
                  onClick={() => openTransactionModal(tx)}
                  className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${style.bgColor} flex items-center justify-center ${style.textColor}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-[#111318] dark:text-white text-sm">{tx.title}</p>
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const d = new Date(tx.date);
                          const now = new Date();
                          const isToday = d.toDateString() === now.toDateString();
                          const yesterday = new Date(now);
                          yesterday.setDate(now.getDate() - 1);
                          const isYesterday = d.toDateString() === yesterday.toDateString();
                          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          if (isToday) return `Today, ${time}`;
                          if (isYesterday) return `Yesterday`;
                          return formatDate(tx.date);
                        })()}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[#111318] dark:text-white">
                    {isPrivacyMode ? '••••' : (
                      <>
                        {tx.type === 'income' ? '+ ' : '- '}ETB {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </>
                    )}
                  </p>
                </div>
              </SwipeableItem>
            );
          })}
        </div>
      ) : (
        // For large lists (> 10 items), use virtualization (lazy-loaded)
        <VirtualizedTransactionList
          transactions={transactions}
          getCategoryStyle={getCategoryStyle}
          formatDate={formatDate}
          isPrivacyMode={isPrivacyMode}
          deleteTransaction={deleteTransaction}
          openTransactionModal={openTransactionModal}
        />
      )}
    </div>
  );
};

// Lazy-loaded virtualized list component (only loads react-window when needed)
const VirtualizedTransactionList: React.FC<{
  transactions: Transaction[];
  getCategoryStyle: (tx: Transaction) => { icon: React.ElementType; bgColor: string; textColor: string };
  formatDate: (date: string) => string;
  isPrivacyMode: boolean;
  deleteTransaction: (id: string) => void;
  openTransactionModal: (tx?: Transaction) => void;
}> = ({ transactions, getCategoryStyle, formatDate, isPrivacyMode, deleteTransaction, openTransactionModal }) => {
  const [FixedSizeList, setFixedSizeList] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically import react-window only when needed
    import('react-window').then((module) => {
      // react-window exports FixedSizeList as a named export
      setFixedSizeList(() => (module as any).FixedSizeList);
      setLoading(false);
    });
  }, []);

  if (loading || !FixedSizeList) {
    // Fallback to regular rendering while loading
    return (
      <div className="flex flex-col gap-3">
        {transactions.map((tx) => {
          const style = getCategoryStyle(tx);
          const IconComponent = style.icon;
          return (
            <SwipeableItem
              key={tx.id}
              onDelete={() => deleteTransaction(tx.id)}
              onEdit={() => openTransactionModal(tx)}
            >
              <div
                onClick={() => openTransactionModal(tx)}
                className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${style.bgColor} flex items-center justify-center ${style.textColor}`}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[#111318] dark:text-white text-sm">{tx.title}</p>
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const d = new Date(tx.date);
                        const now = new Date();
                        const isToday = d.toDateString() === now.toDateString();
                        const yesterday = new Date(now);
                        yesterday.setDate(now.getDate() - 1);
                        const isYesterday = d.toDateString() === yesterday.toDateString();
                        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        if (isToday) return `Today, ${time}`;
                        if (isYesterday) return `Yesterday`;
                        return formatDate(tx.date);
                      })()}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-[#111318] dark:text-white">
                  {isPrivacyMode ? '••••' : (
                    <>
                      {tx.type === 'income' ? '+ ' : '- '}ETB {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </>
                  )}
                </p>
              </div>
            </SwipeableItem>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ height: Math.min(transactions.length * 88, 600) }}>
      <FixedSizeList
        height={Math.min(transactions.length * 88, 600)}
        itemCount={transactions.length}
        itemSize={88}
        width="100%"
        className="scrollbar-thin"
      >
            {({ index, style: itemStyle }: { index: number; style: React.CSSProperties }) => {
              const tx = transactions[index];
              const style = getCategoryStyle(tx);
              const IconComponent = style.icon;

              return (
                <div style={{ ...itemStyle, paddingBottom: '12px' }}>
                  <SwipeableItem
                    key={tx.id}
                    onDelete={() => deleteTransaction(tx.id)}
                    onEdit={() => openTransactionModal(tx)}
                  >
                    <div
                      onClick={() => openTransactionModal(tx)}
                      className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${style.bgColor} flex items-center justify-center ${style.textColor}`}>
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-[#111318] dark:text-white text-sm">{tx.title}</p>
                          <p className="text-xs text-gray-500">
                            {(() => {
                              const d = new Date(tx.date);
                              const now = new Date();
                              const isToday = d.toDateString() === now.toDateString();
                              const yesterday = new Date(now);
                              yesterday.setDate(now.getDate() - 1);
                              const isYesterday = d.toDateString() === yesterday.toDateString();
                              const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              if (isToday) return `Today, ${time}`;
                              if (isYesterday) return `Yesterday`;
                              return formatDate(tx.date);
                            })()}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-[#111318] dark:text-white">
                        {isPrivacyMode ? '••••' : (
                          <>
                            {tx.type === 'income' ? '+ ' : '- '}ETB {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </>
                        )}
                      </p>
                    </div>
                  </SwipeableItem>
                </div>
              );
            }}
      </FixedSizeList>
    </div>
  );
};
