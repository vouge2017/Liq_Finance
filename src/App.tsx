"use client"

import React, { useState } from "react"
import { Icons } from "@/shared/components/Icons"
import { BalanceCard } from "@/features/accounts/BalanceCard"
import { ExpenseTracking } from "@/features/budget/ExpenseTracking"
import { SavingsGoals } from "@/features/goals/SavingsGoals"
import { TransactionList } from "@/features/budget/TransactionList"
import { BottomNav } from "@/shared/components/BottomNav"
import { AIAdvisor } from "@/features/advisor/AIAdvisor"
import { AccountsPage } from "@/features/accounts/AccountsPage"
import { BudgetPage } from "@/features/budget/BudgetPage"
import { GoalsPage } from "@/features/goals/GoalsPage"
import { CommunityPage } from "@/features/community/CommunityPage"
import { AppProvider, useAppContext } from "@/context/AppContext"
import { TransactionModal } from "@/features/budget/TransactionModal"
import { Onboarding } from "@/features/auth/Onboarding"
import { FinancialProfileModal } from "@/features/auth/FinancialProfileModal"
import { FeedbackModal } from "@/shared/components/FeedbackModal"
import { DataExportModal } from "@/shared/components/DataExportModal"
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher"
import { OfflineBanner } from "@/shared/components/OfflineBanner"


// Global Notification Component
const NotificationToast = () => {
  const { notification } = useAppContext()
  if (!notification) return null

  const isError = notification.type === "error"
  const bgColor = isError ? "bg-rose-500" : notification.type === "success" ? "bg-emerald-500" : "bg-cyan-500"
  const icon = isError ? (
    <Icons.Error size={20} className="text-white" />
  ) : (
    <Icons.CheckCircle size={20} className="text-white" />
  )

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] animate-slide-down flex justify-center pointer-events-none">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[300px] pointer-events-auto`}
      >
        {icon}
        <span className="font-bold text-sm">{notification.message}</span>
      </div>
    </div>
  )
}

function MainLayout() {
  const {
    state,
    theme,
    setTheme,
    calendarMode,
    setCalendarMode,
    activeProfile,
    setActiveProfile,
    isPrivacyMode,
    togglePrivacyMode,
    activeTab,
    setActiveTab,
    visibleWidgets,
    toggleWidget,
    hasOnboarded,
    logout,
  } = useAppContext()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showFinancialProfile, setShowFinancialProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // UI State for Profile Modal Collapsibles
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false)

  // Cycle themes: dark -> dim -> light -> dark
  const toggleTheme = () => {
    if (theme === "dark") setTheme("dim")
    else if (theme === "dim") setTheme("light")
    else setTheme("dark")
  }

  const toggleCalendar = () => {
    setCalendarMode(calendarMode === "gregorian" ? "ethiopian" : "gregorian")
  }

  const toggleProfile = () => {
    // Toggle: Personal -> Family -> All -> Personal
    if (activeProfile === "Personal") setActiveProfile("Family")
    else if (activeProfile === "Family") setActiveProfile("All")
    else setActiveProfile("Personal")
  }

  // Show Onboarding if not completed
  if (!hasOnboarded) {
    return <Onboarding />
  }

  return (
    <div className="min-h-screen bg-theme-main text-theme-primary relative transition-colors duration-300">
      {/* Offline Status Banner */}
      <OfflineBanner />

      {/* Global Modals & Toasts */}
      <TransactionModal />
      {showFinancialProfile && <FinancialProfileModal onClose={() => setShowFinancialProfile(false)} />}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      <DataExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <NotificationToast />

      {/* Header */}
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-theme-main/80 backdrop-blur-md z-40 border-b border-transparent transition-colors duration-300">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowProfileModal(true)}>
            <div className="w-10 h-10 rounded-full bg-theme-card flex items-center justify-center border border-theme shadow-sm relative">
              {activeProfile === "All" ? (
                <Icons.Users className="text-gray-400" size={20} />
              ) : (
                <Icons.User className="text-gray-400" size={20} />
              )}
              {/* Status Dot */}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-theme-card ${activeProfile === "Personal" ? "bg-cyan-400" : activeProfile === "Family" ? "bg-pink-500" : "bg-yellow-500"}`}
              ></div>
            </div>
            <div>
              <h1 className="text-xl font-bold">Hello, {state.userName}!</h1>
              <div className="flex items-center gap-1 group">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md transition-colors ${activeProfile === "Personal" ? "bg-cyan-500/20 text-cyan-400" : activeProfile === "Family" ? "bg-pink-500/20 text-pink-500" : "bg-yellow-500/20 text-yellow-400"}`}
                >
                  {activeProfile} View
                </span>
                <Icons.ChevronRight size={12} className="text-theme-secondary group-hover:text-theme-primary" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher - Moved here */}
            <div className="scale-90 origin-right">
              <LanguageSwitcher />
            </div>

            {/* Privacy Toggle */}
            <button
              onClick={togglePrivacyMode}
              className="h-10 w-10 rounded-full bg-theme-card flex items-center justify-center border border-theme hover:border-cyan-500/50 transition shadow-sm text-theme-secondary hover:text-cyan-400"
              title={isPrivacyMode ? "Show Amounts" : "Hide Amounts"}
            >
              {isPrivacyMode ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
            </button>

            {/* Calendar Toggle */}
            <button
              onClick={toggleCalendar}
              className="h-10 px-3 rounded-full bg-theme-card flex items-center justify-center border border-theme hover:border-cyan-500/50 transition shadow-sm"
              title="Toggle Calendar"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary">
                {calendarMode === "gregorian" ? "GC" : "EC"}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-theme-card flex items-center justify-center border border-theme hover:bg-theme-main transition shadow-sm"
              title={`Current Theme: ${theme}`}
            >
              {theme === "light" ? (
                <Icons.Sun size={20} className="text-orange-400" />
              ) : theme === "dim" ? (
                <Icons.Cloud size={20} className="text-blue-400" />
              ) : (
                <Icons.Moon className="text-indigo-300" size={20} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 pb-4">
        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            {visibleWidgets.balance && <BalanceCard />}
            {visibleWidgets.budget && <ExpenseTracking />}
            {visibleWidgets.goals && <SavingsGoals />}
            {visibleWidgets.transactions && <TransactionList />}

            {!visibleWidgets.balance &&
              !visibleWidgets.budget &&
              !visibleWidgets.goals &&
              !visibleWidgets.transactions && (
                <div className="text-center py-20 opacity-50">
                  <p className="text-sm">All widgets hidden.</p>
                  <p className="text-xs">Check Profile settings to customize.</p>
                </div>
              )}
          </div>
        )}

        {activeTab === "accounts" && <AccountsPage />}

        {/* Render Budget Page */}
        {activeTab === "budget" && <BudgetPage />}

        {/* Render Goals Page */}
        {activeTab === "goals" && <GoalsPage />}

        {/* Render Community Page */}
        {activeTab === "community" && <CommunityPage />}

        {activeTab === "ai" && (
          <div className="animate-fade-in">
            <AIAdvisor />
          </div>
        )}
      </main>

      {/* Navigation */}
      <BottomNav />

      {/* PROFILE & SETTINGS MODAL */}
      {showProfileModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false)
          }}
          className="fixed inset-0 modal-overlay z-[100] flex items-end sm:items-center justify-center"
        >
          <div className="modal-content w-full max-w-sm mx-auto sm:rounded-3xl rounded-t-[2rem] p-6 animate-slide-up shadow-2xl h-[85vh] sm:h-auto overflow-y-auto">
            <div className="w-16 h-1.5 modal-handle rounded-full mx-auto mb-6 sm:hidden"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-theme-main border-2 border-theme shadow-md flex items-center justify-center relative">
                <Icons.User size={32} className="text-theme-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">{state.userName}</h2>
                <div className="flex items-center gap-2 mt-1 text-theme-secondary">
                  <Icons.Phone size={12} />
                  <p className="text-xs font-mono">
                    {state.userPhone
                      ? `+251 ${state.userPhone.startsWith("0") ? state.userPhone.substring(1) : state.userPhone}`
                      : "No Phone"}
                  </p>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md mt-2 inline-block font-bold">
                  Beta Tester
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {/* Manage Accounts - Primary Action */}
              <button
                onClick={() => {
                  setActiveTab("accounts")
                  setShowProfileModal(false)
                }}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-theme-card transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Icons.CreditCard size={20} />
                  </div>
                  <span className="font-bold text-theme-primary">Manage Accounts</span>
                </div>
                <Icons.ChevronRight size={18} className="text-theme-secondary" />
              </button>

              {/* Financial Profile (Income Center) */}
              <button
                onClick={() => {
                  setShowFinancialProfile(true)
                  setShowProfileModal(false)
                }}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-theme-card transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icons.Briefcase size={20} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-theme-primary block">Financial Profile</span>
                    <span className="text-[10px] text-theme-secondary">Manage Income & Paydays</span>
                  </div>
                </div>
                <Icons.ChevronRight size={18} className="text-theme-secondary" />
              </button>

              {/* Switch Profile */}
              <button
                onClick={toggleProfile}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-theme-card transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Icons.Users size={20} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-theme-primary block">Switch Profile</span>
                    <span className="text-[10px] text-theme-secondary">Currently: {activeProfile}</span>
                  </div>
                </div>
                <Icons.ChevronRight size={18} className="text-theme-secondary" />
              </button>

              {/* Community Hub */}
              <button
                onClick={() => {
                  setActiveTab("community")
                  setShowProfileModal(false)
                }}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-theme-card transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Icons.Users size={20} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-theme-primary block">Family Hub</span>
                    <span className="text-[10px] text-theme-secondary">Manage members & invites</span>
                  </div>
                </div>
                <Icons.ChevronRight size={18} className="text-theme-secondary" />
              </button>

              <button
                onClick={() => {
                  setShowExportModal(true)
                  setShowProfileModal(false)
                }}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-theme-card transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Icons.Download size={20} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-theme-primary block">Export Data</span>
                    <span className="text-[10px] text-theme-secondary">Download your financial data</span>
                  </div>
                </div>
                <Icons.ChevronRight size={18} className="text-theme-secondary" />
              </button>

              <button
                onClick={() => {
                  setShowFeedbackModal(true)
                  setShowProfileModal(false)
                }}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-theme-card transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Icons.Feedback size={20} />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-theme-primary block">Send Feedback</span>
                    <span className="text-[10px] text-theme-secondary">Report bugs or suggest features</span>
                  </div>
                </div>
                <Icons.ChevronRight size={18} className="text-theme-secondary" />
              </button>

              {/* --- PRO FEATURE: WIDGET MANAGEMENT (COLLAPSIBLE) --- */}
              <div
                className={`rounded-2xl bg-theme-main border border-theme transition-all duration-300 ${isDashboardSettingsOpen ? "p-4" : "p-0"}`}
              >
                <button
                  onClick={() => setIsDashboardSettingsOpen(!isDashboardSettingsOpen)}
                  className={`w-full flex items-center justify-between p-4 ${isDashboardSettingsOpen ? "pb-2 border-b border-theme/50 mb-2" : ""} hover:bg-theme-card rounded-2xl transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400">
                      <Icons.Settings size={20} />
                    </div>
                    <span className="font-bold text-theme-primary">Customize Dashboard</span>
                  </div>
                  <Icons.ChevronRight
                    size={18}
                    className={`text-theme-secondary transition-transform duration-300 ${isDashboardSettingsOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {isDashboardSettingsOpen && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    {(["balance", "budget", "goals", "transactions"] as const).map((w) => (
                      <div key={w} className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-medium text-theme-secondary capitalize">
                          {w === "budget" ? "Budget Health" : w}
                        </span>
                        <div
                          onClick={() => toggleWidget(w)}
                          className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${visibleWidgets[w] ? "bg-cyan-500" : "bg-gray-700"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${visibleWidgets[w] ? "left-5" : "left-1"}`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center pt-4 border-t border-theme-secondary/10">
                <div className="flex justify-center gap-4 text-[10px] text-theme-secondary">
                  <a href="/legal/privacy" className="hover:text-theme-primary">
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a href="/legal/terms" className="hover:text-theme-primary">
                    Terms of Service
                  </a>
                </div>
                <p className="text-[10px] text-theme-secondary/50 mt-2">Version 1.0.0-beta (Build 250)</p>
              </div>

              {/* Log Out Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full p-4 rounded-2xl bg-theme-main border border-theme flex items-center justify-between hover:bg-rose-500/10 hover:border-rose-500/50 transition-colors group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <Icons.LogOut size={20} />
                  </div>
                  <span className="font-bold text-theme-primary group-hover:text-rose-500">Log Out</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-4 rounded-2xl bg-theme-main font-bold text-theme-secondary hover:text-theme-primary border border-theme"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL - Center Pop Up */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 modal-overlay z-[120] flex items-center justify-center p-6"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="modal-content w-full max-w-sm rounded-3xl p-6 animate-dialog text-center shadow-2xl relative border-2 border-rose-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Icons.Alert size={32} />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2">Log Out?</h3>
            <p className="text-sm text-theme-secondary mb-6 leading-relaxed">
              This will reset your session and clear all local data on this device.
              <br />
              <span className="text-rose-400 text-xs font-bold mt-2 block">This action cannot be undone.</span>
            </p>

            <div className="space-y-3">
              <button
                onClick={logout}
                className="w-full py-4 bg-rose-500 rounded-2xl text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 bg-theme-main border border-theme rounded-2xl text-theme-secondary font-bold hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { AuthProvider } from "./context/AuthContext"

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <React.Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-black text-cyan-500">
            <Icons.Loader className="animate-spin" size={32} />
          </div>
        }>
          <MainLayout />
        </React.Suspense>
      </AppProvider>
    </AuthProvider>
  )
}
