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
  const { user, data, loading, error, refreshAll } = useUserData()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (error) {
      setShowError(true)
    }
  }, [error])

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main p-4">
        <DashboardSkeleton />
      </div>
    )
  }
  refreshAll()
}}
className = "px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors btn-press"
  >
  Try Again
        </button >
      </div >
    )
  }

// Render app with data
return (
  <AppProvider initialData={data} userId={userId} userEmail={userEmail} onRefresh={refreshAll}>
    <App />
  </AppProvider>
)
}
