import React, { useRef } from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/shared/components/EmptyState';
import { SignInPrompt } from '@/shared/components/SignInPrompt';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/shared/components/PullToRefreshIndicator';

export const TransactionList: React.FC = () => {
  const { user, loading, isOffline } = useAuth();
  const { state, formatDate, activeProfile, isPrivacyMode, setActiveTab, openTransactionModal, setScannedImage, showNotification, refreshTransactions } = useAppContext();
  const { transactions } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: async () => {
      if (refreshTransactions) {
        await refreshTransactions();
        // Add a small artificial delay so the user sees the spinner
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
      setScannedImage(base64String); // Pass to context
      openTransactionModal(); // Open modal which will handle analysis
    };
    reader.onerror = () => {
      showNotification("Error reading file", "error");
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mb-24 relative" ref={containerRef}> {/* Extra margin for bottom nav */}
      <PullToRefreshIndicator isRefreshing={isRefreshing} pullProgress={pullProgress} />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h3 className="text-theme-primary text-lg font-bold">Recent Transactions</h3>
          <p className="text-theme-secondary text-xs ethiopic">የቅርብ ጊዜ ግብይቶች</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleScanClick}
            className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-colors"
            title="Scan Receipt"
          >
            <Icons.Scan size={16} />
          </button>
          <button
            onClick={() => openTransactionModal()}
            className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition-colors"
            title="Add Transaction"
          >
            <Icons.Plus size={16} />
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className="text-cyan-400 text-sm font-medium hover:text-cyan-300 ml-1"
          >
            View All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.slice(0, 5).map((tx) => (
          <div
            key={tx.id}
            onClick={() => openTransactionModal(tx)}
            className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  tx.type === 'transfer' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                    'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400'
                }`}>
                {tx.type === 'transfer' ? <Icons.Transfer size={20} /> :
                  tx.icon === 'coffee' ? <Icons.Coffee size={20} /> :
                    tx.icon === 'shopping' ? <Icons.Shopping size={20} /> :
                      tx.icon === 'card' ? <Icons.CreditCard size={20} /> :
                        tx.type === 'income' ? <Icons.Wallet size={20} /> :
                          <Icons.Shopping size={20} />
                }
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-bold text-sm">{tx.title}</h4>
                <p className="text-gray-500 text-xs">{formatDate(tx.date)}</p>
              </div>
            </div>
            <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPrivacyMode ? '••••' : (
                <>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </>
              )}
            </div>
          </div>
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
