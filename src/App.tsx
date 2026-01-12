"use client"

import React, { useState, Suspense, lazy } from "react"
import { Icons } from "@/shared/components/Icons"
import { TransactionList } from "@/features/budget/TransactionList"
import { BottomNav } from "@/shared/components/BottomNav"

import { AppProvider, useAppContext } from "@/context/AppContext"
import { AuthProvider } from "@/context/AuthContext"
import { TransactionModal } from "@/features/budget/TransactionModal"
import { Onboarding } from "@/features/auth/Onboarding"
import { LandingPage } from "@/features/auth/LandingPage"
import { FinancialProfileModal } from "@/features/auth/FinancialProfileModal"
import { FeedbackModal } from "@/shared/components/FeedbackModal"
import { DataManagementModal } from "@/shared/components/DataManagementModal"
import { GlobalConsentBanner } from "@/components/GlobalConsentBanner"
import PrivacyPolicy from "@/components/PrivacyPolicy"
import TermsOfService from "@/components/TermsOfService"
import { OfflineBanner } from "@/shared/components/OfflineBanner"
import { AINotificationStack } from "@/shared/components/AINotificationBanner"
import { SubscriptionModal } from "@/shared/components/SubscriptionModal"
import { SubscriptionWidget } from "@/features/dashboard/SubscriptionWidget"
import { PageLoader } from "@/shared/components/PageLoader"
import { DashboardPage } from "@/features/dashboard/DashboardPage"

// Lazy-loaded page components for code splitting
const AIAdvisor = lazy(() => import("@/features/advisor/AIAdvisor").then(module => ({ default: module.AIAdvisor })))
const AccountsPage = lazy(() => import("@/features/accounts/AccountsPage").then(module => ({ default: module.AccountsPage })))
const BudgetPage = lazy(() => import("@/features/budget/BudgetPage").then(module => ({ default: module.BudgetPage })))
const GoalsPage = lazy(() => import("@/features/goals/GoalsPage").then(module => ({ default: module.GoalsPage })))

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
    return <LandingPage />
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

      {/* Global Consent Banner */}
      <GlobalConsentBanner
        onConsentUpdate={() => console.log('Global consent updated')}
        onManageConsent={() => setShowConsentSettings(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-5 py-4">
        {activeTab === "dashboard" && (
          <DashboardPage />
        )}

        {activeTab === "accounts" && (
          <Suspense fallback={<PageLoader />}>
            <AccountsPage />
          </Suspense>
        )}

        {activeTab === "budget" && (
          <Suspense fallback={<PageLoader />}>
            <BudgetPage />
          </Suspense>
        )}

        {activeTab === "goals" && (
          <Suspense fallback={<PageLoader />}>
            <GoalsPage />
          </Suspense>
        )}

        {activeTab === "ai" && (
          <Suspense fallback={<PageLoader />}>
            <AIAdvisor />
          </Suspense>
        )}
      </main>

      {/* Navigation */}
      <BottomNav />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* LOGOUT CONFIRMATION MODAL */}
      {
        showLogoutConfirm && (
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
        )
      }
    </div >
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
