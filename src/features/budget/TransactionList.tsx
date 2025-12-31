import React, { useRef } from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/shared/components/EmptyState';
import { SignInPrompt } from '@/shared/components/SignInPrompt';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/shared/components/PullToRefreshIndicator';
import { SwipeableItem } from '@/shared/components/SwipeableItem';

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
      <div className="flex justify-center py-12">
        <Icons.Loader className="animate-spin text-primary" size={32} />
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

      {/* Transaction List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))
        ) : transactions.slice(0, 5).map((tx) => {
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
                  {/* Colored Icon Circle */}
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
                {/* Amount */}
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

        {transactions.length === 0 && (
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
        )}
      </div>
    </div>
  );
};
