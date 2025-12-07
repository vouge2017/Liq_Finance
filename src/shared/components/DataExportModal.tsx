"use client"

import type React from "react"
import { useState } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"

interface DataExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => {
  const { state } = useAppContext()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json")

  const exportData = () => {
    setIsExporting(true)

    try {
      const exportDate = new Date().toISOString().split("T")[0]

      if (exportFormat === "json") {
        const dataToExport = {
          exportDate,
          profile: {
            userName: state.userName,
            userPhone: state.userPhone,
            userGoal: state.userGoal,
          },
          accounts: state.accounts,
          transactions: state.transactions,
          budgetCategories: state.budgetCategories,
          savingsGoals: state.savingsGoals,
          iqubs: state.iqubs,
          iddirs: state.iddirs,
          recurringTransactions: state.recurringTransactions,
          incomeSources: state.incomeSources,
          summary: {
            totalBalance: state.totalBalance,
            totalIncome: state.totalIncome,
            totalExpense: state.totalExpense,
          },
        }

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `finethio-export-${exportDate}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const headers = ["Date", "Title", "Amount", "Type", "Category", "Account", "Profile"]
        const rows = state.transactions.map((t) => {
          const account = state.accounts.find((a) => a.id === t.accountId)
          return [
            t.date.split("T")[0],
            `"${t.title.replace(/"/g, '""')}"`,
            t.amount.toString(),
            t.type,
            t.category,
            account?.name || "N/A",
            t.profile,
          ].join(",")
        })

        const csv = [headers.join(","), ...rows].join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `finethio-transactions-${exportDate}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Export error:", error)
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm bg-gray-900 rounded-3xl p-6 shadow-2xl animate-dialog border border-gray-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <Icons.Download size={28} className="text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Export Your Data</h2>
          <p className="text-gray-400 text-sm mt-1">Download all your financial data</p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setExportFormat("json")}
            className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${exportFormat === "json"
                ? "bg-cyan-500/10 border-cyan-500 text-white"
                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <Icons.FileText size={18} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm">JSON Format</p>
              <p className="text-xs text-gray-500">Complete data backup</p>
            </div>
            {exportFormat === "json" && <Icons.CheckCircle size={20} className="text-cyan-400" />}
          </button>

          <button
            onClick={() => setExportFormat("csv")}
            className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${exportFormat === "csv"
                ? "bg-cyan-500/10 border-cyan-500 text-white"
                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <Icons.Table size={18} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm">CSV Format</p>
              <p className="text-xs text-gray-500">Transactions only</p>
            </div>
            {exportFormat === "csv" && <Icons.CheckCircle size={20} className="text-cyan-400" />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={exportData}
            disabled={isExporting}
            className="flex-1 py-3 bg-cyan-500 rounded-xl font-bold text-black hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Icons.Download size={18} />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
