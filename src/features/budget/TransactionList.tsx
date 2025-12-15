import React, { useRef } from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/shared/components/EmptyState';
import { SignInPrompt } from '@/shared/components/SignInPrompt';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/shared/components/PullToRefreshIndicator';
import { SwipeableItem } from '@/shared/components/SwipeableItem';

export const TransactionList: React.FC = () => {
  const { user, loading, isOffline } = useAuth();
  const { state, formatDate, activeProfile, isPrivacyMode, setActiveTab, openTransactionModal, setScannedImage, showNotification, refreshTransactions, deleteTransaction } = useAppContext();
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Icons.Loader className="animate-spin text-cyan-500" size={32} />
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="mb-24">
        <EmptyState
          icon={<Icons.Alert size={32} />}
          title="Offline Mode"
          description="Transactions are unavailable in demo/offline mode. Please check your connection or sign in."
        />
      </div>
    );
  }

  if (!user) {
    return <div className="mb-24"><SignInPrompt /></div>;
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
    <div className="mb-24 relative" ref={containerRef}>
      <PullToRefreshIndicator isRefreshing={isRefreshing} pullProgress={pullProgress} />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Section Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          <div>
            <h3 className="text-theme-primary text-base font-bold">Recent Activity</h3>
            <p className="text-theme-secondary text-[10px] ethiopic">የቅርብ ጊዜ ግብይቶች</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleScanClick}
            className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all duration-200"
            title="Scan Receipt"
          >
            <Icons.Scan size={16} />
          </button>
          <button
            onClick={() => openTransactionModal()}
            className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition-all duration-200"
            title="Add Transaction"
          >
            <Icons.Plus size={16} />
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className="text-cyan-400 text-xs font-semibold hover:text-cyan-300 ml-1 transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.slice(0, 5).map((tx) => (
          <SwipeableItem
            key={tx.id}
            onDelete={() => deleteTransaction(tx.id)}
            onEdit={() => openTransactionModal(tx)}
          >
            <div
              onClick={() => openTransactionModal(tx)}
              className="bg-theme-card rounded-2xl p-4 flex items-center gap-4 border border-theme cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10 transition-all duration-200"
            >
              {/* Colored indicator bar */}
              <div className={`w-1 h-12 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-emerald-500' :
                tx.type === 'transfer' ? 'bg-blue-500' :
                  'bg-rose-500'
                }`}></div>

              {/* Icon circle */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-500' :
                tx.type === 'transfer' ? 'bg-blue-500/15 text-blue-500' :
                  'bg-rose-500/15 text-rose-500'
                }`}>
                {tx.type === 'transfer' ? <Icons.Transfer size={20} /> :
                  tx.icon === 'coffee' ? <Icons.Coffee size={20} /> :
                    tx.icon === 'shopping' ? <Icons.Shopping size={20} /> :
                      tx.icon === 'card' ? <Icons.CreditCard size={20} /> :
                        tx.type === 'income' ? <Icons.Wallet size={20} /> :
                          <Icons.Shopping size={20} />
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-theme-primary font-semibold text-sm truncate">{tx.title}</h4>
                <p className="text-theme-secondary text-xs">{formatDate(tx.date)}</p>
              </div>

              {/* Amount */}
              <div className={`font-bold text-sm shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPrivacyMode ? '••••' : (
                  <>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </>
                )}
              </div>
            </div>
          </SwipeableItem>
        ))}

        {transactions.length === 0 && (
          <EmptyState
            icon={<Icons.Shopping size={32} />}
            title="It's quiet here..."
            description="Add your first expense or scan a receipt to start tracking your financial health."
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
