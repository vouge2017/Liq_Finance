"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Icons } from "@/shared/components/Icons"
import { useAppContext } from "@/context/AppContext"
import { useConsent } from "@/hooks/useConsent"
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import type { AppState } from "@/types"

interface DataManagementModalProps {
    isOpen: boolean
    onClose: () => void
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
    const { state, restoreData } = useAppContext()
    const { consents, consentTypes, hasConsent, updateConsent, loading, refreshConsents } = useConsent()
    const [activeTab, setActiveTab] = useState<'export' | 'import' | 'consent'>('export')

    // Export State
    const [isExporting, setIsExporting] = useState(false)
    const [exportFormat, setExportFormat] = useState<"json" | "csv">("json")

    // Import State
    const [isImporting, setIsImporting] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importError, setImportError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Consent State
    const [consentLoading, setConsentLoading] = useState<string | null>(null)

    const exportData = () => {
        setIsExporting(true)

        try {
            const exportDate = new Date().toISOString().split("T")[0]

            if (exportFormat === "json") {
                const dataToExport = {
                    exportDate,
                    // Full state dump for restore
                    ...state,
                    // Extra metadata for readability/portability
                    profile: {
                        userName: state.userName,
                        userPhone: state.userPhone,
                        userGoal: state.userGoal,
                    },
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
                a.download = `finethio-backup-${exportDate}.json`
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImportFile(file)
            setImportError(null)
        }
    }

    const handleImport = async () => {
        if (!importFile) return

        setIsImporting(true)
        setImportError(null)

        try {
            const text = await importFile.text()
            const data = JSON.parse(text)

            // Basic Validation
            if (!data.accounts || !data.transactions) {
                throw new Error("Invalid backup file format")
            }

            // Restore
            restoreData(data as AppState)

            setTimeout(() => {
                setIsImporting(false)
                onClose()
            }, 1000)
        } catch (error) {
            console.error("Import error:", error)
            setImportError("Failed to parse backup file. Please ensure it's a valid JSON export.")
            setIsImporting(false)
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
                        <Icons.Database size={28} className="text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Data Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Backup and restore your financial data</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-800 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'export' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        Export
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'import' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        Import
                    </button>
                    <button
                        onClick={() => setActiveTab('consent')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'consent' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        Consent
                    </button>
                </div>

                {activeTab === 'export' ? (
                    <div className="space-y-3 mb-6 animate-fade-in">
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
                                <p className="font-bold text-sm">JSON Backup</p>
                                <p className="text-xs text-gray-500">Complete data for restoring later</p>
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
                                <p className="font-bold text-sm">CSV Export</p>
                                <p className="text-xs text-gray-500">Transactions for Excel/Sheets</p>
                            </div>
                            {exportFormat === "csv" && <Icons.CheckCircle size={20} className="text-cyan-400" />}
                        </button>
                    </div>
                ) : activeTab === 'consent' ? (
                    <div className="space-y-4 mb-6 animate-fade-in">
                        {/* Consent Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                                <Shield size={28} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Privacy & Consent</h3>
                            <p className="text-sm text-gray-400">
                                Manage how your data is processed and shared
                            </p>
                        </div>

                        {/* Consent Types */}
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm text-gray-400">Loading consent settings...</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {consentTypes.map((type) => {
                                    const hasUserConsent = hasConsent(type.code)
                                    const isRequired = type.required

                                    return (
                                        <div
                                            key={type.id}
                                            className={`p-4 rounded-xl border transition-all ${hasUserConsent
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : 'bg-gray-800/50 border-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${hasUserConsent
                                                        ? 'bg-emerald-500 border-emerald-500'
                                                        : 'border-gray-500'
                                                    }`}>
                                                    {hasUserConsent ? (
                                                        <CheckCircle size={14} className="text-white" />
                                                    ) : (
                                                        <XCircle size={14} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-white text-sm">{type.name}</h4>
                                                        {isRequired && (
                                                            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mb-2">{type.description}</p>
                                                    <p className="text-[10px] text-gray-500">
                                                        Category: {type.category} • Legal basis: {type.legal_basis}
                                                    </p>
                                                </div>
                                                {!isRequired && (
                                                    <button
                                                        onClick={async () => {
                                                            setConsentLoading(type.code)
                                                            await updateConsent(type.code, !hasUserConsent)
                                                            setConsentLoading(null)
                                                        }}
                                                        disabled={consentLoading === type.code}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${hasUserConsent
                                                                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                                                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                            }`}
                                                    >
                                                        {consentLoading === type.code ? (
                                                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : hasUserConsent ? (
                                                            'Revoke'
                                                        ) : (
                                                            'Grant'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Consent Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-700">
                            <button
                                onClick={refreshConsents}
                                disabled={loading}
                                className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-gray-400 hover:text-white border border-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Icons.Refresh size={16} />
                                Refresh
                            </button>
                        </div>

                        {/* Consent Info */}
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Info size={16} className="text-blue-400 mt-0.5" />
                                <div className="text-xs text-blue-200">
                                    <p className="font-bold mb-1">Your Privacy Rights</p>
                                    <p>You can grant or withdraw consent at any time. Required consent cannot be revoked as it's necessary for the app to function.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mb-6 animate-fade-in">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${importFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-gray-700 hover:border-gray-500 bg-gray-800/30'}`}
                        >
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Icons.Upload size={32} className={`mx-auto mb-2 ${importFile ? 'text-cyan-400' : 'text-gray-500'}`} />
                            <p className="text-sm font-bold text-gray-300">
                                {importFile ? importFile.name : "Tap to select backup file"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : "Only .json files supported"}
                            </p>
                        </div>

                        {importError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-start gap-2">
                                <Icons.Error size={16} className="text-rose-500 mt-0.5" />
                                <p className="text-xs text-rose-200">{importError}</p>
                            </div>
                        )}

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
                            <p className="text-xs text-yellow-200 text-center">
                                Warning: Importing will replace all current data.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    {activeTab === 'export' ? (
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
                    ) : (
                        <button
                            onClick={handleImport}
                            disabled={isImporting || !importFile}
                            className="flex-1 py-3 bg-cyan-500 rounded-xl font-bold text-black hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isImporting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Restoring...
                                </>
                            ) : (
                                <>
                                    <Icons.Refresh size={18} />
                                    Restore
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
