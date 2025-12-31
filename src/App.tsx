"use client"

import React, { useState } from "react"
import { Icons } from "@/shared/components/Icons"
import { BalanceCard } from "@/features/accounts/BalanceCard"
import { TransactionList } from "@/features/budget/TransactionList"
import { BottomNav } from "@/shared/components/BottomNav"
import { AIAdvisor } from "@/features/advisor/AIAdvisor"
import { AccountsPage } from "@/features/accounts/AccountsPage"
import { BudgetPage } from "@/features/budget/BudgetPage"
import { GoalsPage } from "@/features/goals/GoalsPage"
import { CommunityPage } from "@/features/community/CommunityPage"
import { AppProvider, useAppContext } from "@/context/AppContext"
import { AuthProvider } from "@/context/AuthContext"
import { TransactionModal } from "@/features/budget/TransactionModal"
import { Onboarding } from "@/features/auth/Onboarding"
import { FinancialProfileModal } from "@/features/auth/FinancialProfileModal"
import { FeedbackModal } from "@/shared/components/FeedbackModal"
import { DataManagementModal } from "@/shared/components/DataManagementModal"
import { GlobalConsentBanner } from "@/components/GlobalConsentBanner"
import PrivacyPolicy from "@/components/PrivacyPolicy"
import TermsOfService from "@/components/TermsOfService"
import { OfflineBanner } from "@/shared/components/OfflineBanner"
import { QuickActions } from "@/features/dashboard/QuickActions"
import { AINotificationStack } from "@/shared/components/AINotificationBanner"
import { SubscriptionModal } from "@/shared/components/SubscriptionModal"
import { SubscriptionWidget } from "@/features/dashboard/SubscriptionWidget"

// Global Notification Component
const NotificationToast = () => {
  const { notification } = useAppContext()
  if (!notification) return null

  const isError = notification.type === "error"
  const bgColor = isError ? "bg-ethiopian-red" : notification.type === "success" ? "bg-ethiopian-green" : "bg-ethiopian-blue"
  const icon = isError ? (
    <Icons.Error size={20} className="text-white" />
  ) : (
    <Icons.CheckCircle size={20} className="text-white" />
  )

  return (
    <div className="fixed z-[200] animate-slide-down flex justify-center pointer-events-none" style={{ top: '16px', left: '20px', right: '20px' }}>
      <div
        className={`${bgColor} text-white px-5 py-4 rounded-2xl shadow-elevation-5 flex items-center gap-3 min-w-[320px] pointer-events-auto border border-white/10`}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="font-bold text-sm tracking-tight">{notification.message}</span>
      </div>
    </div>
  )
}

function MainLayout() {
  const {
    state,
    activeProfile,
    activeTab,
    setActiveTab,
    visibleWidgets,
    hasOnboarded,
    logout,
    dismissAINotification,
  } = useAppContext()

  // Simple hash-based routing for legal pages
  const [currentRoute, setCurrentRoute] = React.useState(window.location.hash)

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Handle legal page routes
  if (currentRoute === '#/legal/privacy') {
    return <PrivacyPolicy />
  }
  if (currentRoute === '#/legal/terms') {
    return <TermsOfService />
  }

  const [showFinancialProfile, setShowFinancialProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showDataManagementModal, setShowDataManagementModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showConsentSettings, setShowConsentSettings] = useState(false)

  // Show Onboarding if not completed
  if (!hasOnboarded) {
    return <Onboarding />
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display relative transition-colors duration-300 selection:bg-primary/20">
      {/* Offline Status Banner */}
      <OfflineBanner />

      {/* Global Modals & Toasts */}
      <TransactionModal />
      {showFinancialProfile && <FinancialProfileModal onClose={() => setShowFinancialProfile(false)} />}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      <DataManagementModal
        isOpen={showDataManagementModal || showConsentSettings}
        onClose={() => {
          setShowDataManagementModal(false)
          setShowConsentSettings(false)
        }}
      />
      <NotificationToast />
      <div className="px-5 pt-4">
        <AINotificationStack
          notifications={state.aiNotifications}
          onDismiss={dismissAINotification}
        />
      </div>

      {/* Header - Stitch Design */}
      <header className="flex items-center justify-between p-6 pb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-2 border-white dark:border-surface-dark shadow-sm"
                style={{ backgroundImage: `url("${activeProfile === "Personal" ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Family"}")` }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Good Morning</span>
              <h2 className="text-xl font-bold leading-tight tracking-tight text-[#111318] dark:text-white">
                Selam, {state.userName?.split(' ')[0] || "User"}
              </h2>
            </div>
          </div>
          {/* Date Pill with Calendar Toggle */}
          <div className="flex items-center gap-2 mt-2 ml-14">
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
              <span className="text-gray-700 dark:text-gray-200 text-xs font-bold tracking-wide">24/10/2023</span>
              <div className="w-px h-3 bg-gray-200 dark:bg-gray-700"></div>
              <button className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors">
                <span className="text-[10px] font-black">GC</span>
                <Icons.Refresh size={12} />
              </button>
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Icons.Bell size={24} />
        </button>
      </header>

      {/* Global Consent Banner */}
      <GlobalConsentBanner
        onConsentUpdate={() => console.log('Global consent updated')}
        onManageConsent={() => setShowConsentSettings(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-5 py-4">
        {activeTab === "dashboard" && (
          <div className="animate-fade-in pb-28">
            {visibleWidgets.balance && <BalanceCard />}
            <QuickActions
              onOpenSubscription={() => setShowSubscriptionModal(true)}
              onOpenFinancialProfile={() => setShowFinancialProfile(true)}
            />
            <SubscriptionWidget onOpenModal={() => setShowSubscriptionModal(true)} />
            {visibleWidgets.transactions && <TransactionList />}
          </div>
        )}

        {activeTab === "accounts" && <AccountsPage />}
        {activeTab === "budget" && <BudgetPage />}
        {activeTab === "goals" && <GoalsPage />}
        {activeTab === "community" && <CommunityPage />}
        {activeTab === "ai" && <AIAdvisor />}
      </main>

      {/* Navigation */}
      <BottomNav />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 modal-overlay z-[120] flex items-center justify-center p-6" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 animate-dialog text-center shadow-2xl relative border border-black/[0.05]" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Icons.Alert size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Log Out?</h3>
            <p className="text-sm text-zinc-500 mb-6">This will reset your session and clear all local data on this device.</p>
            <div className="space-y-3">
              <button onClick={logout} className="w-full py-4 bg-rose-500 rounded-2xl text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20">Confirm Reset</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 bg-zinc-100 rounded-2xl text-zinc-600 font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <React.Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] text-blue-600">
            <Icons.Loader className="animate-spin" size={32} />
          </div>
        }>
          <MainLayout />
        </React.Suspense>
      </AppProvider>
    </AuthProvider>
  )
}
