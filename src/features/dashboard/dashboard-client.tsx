"use client"

import { useEffect, useState } from "react"
import { useUserData } from "@/hooks/use-user-data"
import { AppProvider } from "@/context/AppContext"
import App from "@/App"
import { Icons } from "@/shared/components/Icons"
import { DashboardSkeleton } from "@/shared/components/DashboardSkeleton"
import { WeeklySummary } from "@/shared/components/WeeklySummary"

interface DashboardClientProps {
  userId: string
  userEmail?: string | null
}

export function DashboardClient({ userId, userEmail }: DashboardClientProps) {
  const { data, loading, error, refreshAll } = useUserData()

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main p-4">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-4 text-center">
        <Icons.Alert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-theme-primary mb-2">Something went wrong</h2>
        <p className="text-theme-secondary mb-6">{error || 'Failed to load dashboard data'}</p>
        <button
          onClick={() => refreshAll()}
          className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors btn-press"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Render app with data
  return (
    <AppProvider initialData={data} userId={userId} userEmail={userEmail} onRefresh={refreshAll}>
      <App />
    </AppProvider>
  )
}
