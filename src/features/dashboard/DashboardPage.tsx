"use client"

import React, { useMemo, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Icons } from '@/shared/components/Icons'
import { ProfilePage } from '@/features/profile/ProfilePage'

export const DashboardPage: React.FC = () => {
    const { state, openTransactionModal, setActiveTab, navigateTo } = useAppContext()
    const [showProfile, setShowProfile] = useState(false)
    const { accounts, transactions, budgetCategories, savingsGoals, recurringTransactions, iddirs } = state

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 18) return "Good Afternoon"
        return "Good Evening"
    }

    const formatEthiopianDate = () => {
        const now = new Date()
        const ethMonths = ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"]
        return `${ethMonths[now.getMonth()]} ${now.getDate()}, ${now.getFullYear() - 8} ዓ.ም`
    }

    const netWorth = useMemo(() => {
        return accounts.reduce((acc: number, curr) => {
            if (curr.type === 'Loan') return acc - curr.balance
            return acc + curr.balance
        }, 0)
    }, [accounts])

    const bankAccounts = useMemo(() => accounts.filter(a => a.type === 'Bank'), [accounts])
    const mobileAccounts = useMemo(() => accounts.filter(a => a.type === 'Mobile Money'), [accounts])

    const fixedObligations = useMemo(() => {
        const fixedBudget = budgetCategories
            .filter(b => b.type === 'fixed')
            .reduce((sum, b) => sum + (b.allocated || 0), 0)
        const iddirTotal = iddirs.reduce((sum, i) => sum + (i.monthlyContribution || 0), 0)
        return fixedBudget + iddirTotal
    }, [budgetCategories, iddirs])

    const budgetSpent = useMemo(() => {
        return budgetCategories.reduce((sum, b) => sum + (b.spent || 0), 0)
    }, [budgetCategories])

    const safeToSpend = useMemo(() => {
        return Math.max(0, netWorth - fixedObligations - budgetSpent)
    }, [netWorth, fixedObligations, budgetSpent])

    const sparklineData = useMemo(() => {
        const days: number[] = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dayStart = new Date(date.setHours(0, 0, 0, 0))
            const dayEnd = new Date(date.setHours(23, 59, 59, 999))

            const dailySpending = transactions
                .filter((t: any) => t.type === 'expense')
                .filter((t: any) => {
                    const txDate = new Date(t.date)
                    return txDate >= dayStart && txDate <= dayEnd
                })
                .reduce((sum: number, t: any) => sum + t.amount, 0)

            days.push(dailySpending)
        }
        const maxSpending = Math.max(...days, 100)
        return days.map(d => Math.round((d / maxSpending) * 100))
    }, [transactions])

    const upcomingBills = useMemo(() => {
        const today = new Date()
        const next30Days = new Date()
        next30Days.setDate(today.getDate() + 30)

        const recurringBills = recurringTransactions
            .filter(rt => rt.is_active && rt.next_due_date)
            .filter(rt => {
                const dueDate = new Date(rt.next_due_date)
                return dueDate >= today && dueDate <= next30Days
            })
            .map(rt => ({
                id: rt.id,
                name: rt.name,
                amount: rt.amount,
                dueDate: new Date(rt.next_due_date),
                icon: rt.icon || 'Zap',
                priority: rt.category === 'iddir' ? 'high' : 'normal'
            }))

        const iddirBills = iddirs
            .filter(i => i.status === 'active')
            .map(i => {
                const today = new Date()
                const paymentDay = i.paymentDate || 15
                let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay)
                if (nextPaymentDate < today) {
                    nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay)
                }
                return {
                    id: i.id,
                    name: i.name,
                    amount: i.monthlyContribution,
                    dueDate: nextPaymentDate,
                    icon: 'Users',
                    priority: 'high'
                }
            })
            .filter(b => b.dueDate <= next30Days)

        return [...recurringBills, ...iddirBills]
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .slice(0, 3)
    }, [recurringTransactions, iddirs])

    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4)
    }, [transactions])

    const topGoals = useMemo(() => {
        return [...savingsGoals]
            .sort((a, b) => {
                const progressA = (a.currentAmount / a.targetAmount) * 100
                const progressB = (b.currentAmount / b.targetAmount) * 100
                return progressB - progressA
            })
            .slice(0, 3)
    }, [savingsGoals])

    const formatRelativeTime = (date: Date) => {
        const now = new Date()
        const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 0) return 'Today'
        if (diff === 1) return 'Tomorrow'
        if (diff < 7) return `in ${diff} days`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const formatTransactionDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffHours < 48) return 'Yesterday'
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="min-h-screen bg-[#f9fafa] dark:bg-gray-950 pb-40 font-sans">
            <div className="max-w-[430px] mx-auto">
                <Header greeting={greeting()} ethiopianDate={formatEthiopianDate()} userName={state.userName || "Dawit Kebede"} onProfileClick={() => setShowProfile(true)} />

                <main className="flex flex-col gap-6 p-4">
                    {balanceSection(netWorth, bankAccounts, mobileAccounts, safeToSpend)}
                    {spendingTrend(sparklineData, daysOfWeek)}
                    {quickActions(openTransactionModal, setActiveTab, navigateTo)}
                    {recentActivities(recentTransactions, formatTransactionDate, navigateTo)}
                    {aiInsights()}
                    {goalsProgress(topGoals, navigateTo)}
                    {upcomingBillsSection(upcomingBills, formatRelativeTime, openTransactionModal)}
                </main>
            </div>

            {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
        </div>
    )
}

const Header = ({ greeting, ethiopianDate, userName, onProfileClick }: { greeting: string, ethiopianDate: string, userName: string, onProfileClick?: () => void }) => (
    <header className="sticky top-0 z-50 flex items-center bg-[#f9fafa]/80 dark:bg-gray-950/80 backdrop-blur-md p-4 justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
            <button onClick={onProfileClick} className="w-10 h-10 shrink-0 overflow-hidden rounded-full border-2 border-[#a14c3e]/30 hover:scale-105 active:scale-95 transition-transform">
                <div className="w-full h-full bg-gradient-to-br from-[#a14c3e] to-[#7f6d54] flex items-center justify-center text-white font-bold text-sm">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
            </button>
            <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">{greeting}</p>
                <h2 className="text-gray-800 dark:text-white text-base font-bold leading-tight">{userName}</h2>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{ethiopianDate}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="relative flex w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Icons.Bell size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#a14c3e] rounded-full border-2 border-white dark:border-gray-950"></span>
            </button>
        </div>
    </header>
)

const balanceSection = (netWorth: number, bankAccounts: any[], mobileAccounts: any[], safeToSpend: number) => (
    <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-gray-800 dark:text-white font-bold text-lg">Total Net Worth</h3>
            <button onClick={() => { }} className="text-xs font-bold text-[#a14c3e]">View All</button>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-2 px-1 -mx-1 no-scrollbar">
            <div className="min-w-[80vw] sm:min-w-[280px] rounded-xl bg-[#a14c3e] p-6 shadow-lg shadow-[#a14c3e]/20 text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div>
                    <p className="text-sm font-medium opacity-90">Overall Balance</p>
                    <h1 className="mt-1 text-4xl font-extrabold tracking-tight">{netWorth.toLocaleString()} <span className="text-xl font-medium">ETB</span></h1>
                </div>
                <div className="flex items-center mt-4 text-xs opacity-90">
                    <Icons.TrendingUp size={18} className="mr-1" />
                    <p className="font-semibold">Safe to Spend: {safeToSpend.toLocaleString()} ETB</p>
                </div>
            </div>
            {bankAccounts.map(account => (
                <div key={account.id} className="min-w-[80vw] sm:min-w-[280px] rounded-xl bg-[#4a6c4a] p-6 shadow-lg shadow-[#4a6c4a]/20 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div>
                        <div className="flex items-center gap-2 opacity-90">
                            <Icons.Bank size={22} />
                            <p className="text-sm font-medium">{account.name}</p>
                        </div>
                        <h2 className="mt-1 text-3xl font-bold tracking-tight">{account.balance.toLocaleString()} <span className="text-lg font-medium">ETB</span></h2>
                    </div>
                    <div className="w-full mt-4">
                        <p className="text-xs opacity-90 mb-1">Last 7 days trend</p>
                        <Sparkline height={32} color="bg-white/20" />
                    </div>
                </div>
            ))}
            {mobileAccounts.map(account => (
                <div key={account.id} className="min-w-[80vw] sm:min-w-[280px] rounded-xl bg-[#7f6d54] p-6 shadow-lg shadow-[#7f6d54]/20 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div>
                        <div className="flex items-center gap-2 opacity-90">
                            <Icons.Phone size={22} />
                            <p className="text-sm font-medium">{account.name}</p>
                        </div>
                        <h2 className="mt-1 text-3xl font-bold tracking-tight">{account.balance.toLocaleString()} <span className="text-lg font-medium">ETB</span></h2>
                    </div>
                    <div className="w-full mt-4">
                        <p className="text-xs opacity-90 mb-1">Recent activity</p>
                        <div className="flex items-center justify-between text-xs font-medium bg-white/10 px-3 py-2 rounded-lg">
                            <span>Recent txn</span>
                            <span>+{Math.floor(account.balance * 0.05)} ETB</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </section>
)

const Sparkline = ({ height = 40, color = "bg-[#a14c3e]" }: { height?: number, color?: string }) => (
    <div className="flex items-end gap-[2px] overflow-hidden bg-white/10 rounded-sm p-1" style={{ height: `${height}px` }}>
        {[40, 65, 35, 85, 45, 60, 95].map((h, i) => (
            <div key={i} className={`flex-1 ${color} rounded-t-[1px] min-w-[2px]`} style={{ height: `${h}%` }} />
        ))}
    </div>
)

const spendingTrend = (sparklineData: number[], daysOfWeek: string[]) => (
    <section className="rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white font-bold text-sm">Spending Trend</h3>
            <span className="text-xs text-[#a14c3e] font-bold">+12% vs last week</span>
        </div>
        <div className="flex items-end h-[60px] gap-[2px]">
            {sparklineData.map((h, i) => (
                <div key={i} className={`flex-1 bg-[#a14c3e] rounded-t-[1px] min-w-[2px]`} style={{ height: `${h}%` }} />
            ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
            {daysOfWeek.map((day, i) => (
                <span key={i} className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{day}</span>
            ))}
        </div>
    </section>
)

const quickActions = (openTransactionModal: () => void, setActiveTab: (tab: string) => void, navigateTo: (tab: string, type: any, id: any) => void) => (
    <section className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
        <button onClick={openTransactionModal} className="flex flex-col items-center gap-2 min-w-[90px] group">
            <div className="w-14 h-14 rounded-2xl bg-[#a14c3e]/10 text-[#a14c3e] flex items-center justify-center group-active:scale-95 transition-transform">
                <Icons.Plus size={28} />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Add Trans.</span>
        </button>
        <button onClick={() => setActiveTab('budget')} className="flex flex-col items-center gap-2 min-w-[90px] group">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <Icons.PieChart size={28} />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">View Budget</span>
        </button>
        <button onClick={() => navigateTo('goals', null, null)} className="flex flex-col items-center gap-2 min-w-[90px] group">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <Icons.Target size={28} />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Set Goal</span>
        </button>
        <button onClick={() => navigateTo('accounts', null, null)} className="flex flex-col items-center gap-2 min-w-[90px] group">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-active:scale-95 transition-transform">
                <Icons.Transfer size={28} />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Transfer</span>
        </button>
    </section>
)

const recentActivities = (transactions: any[], formatDate: (date: string) => string, navigateTo: (tab: string, type: any, id: any) => void) => (
    <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <h3 className="text-gray-800 dark:text-white font-bold text-lg">Recent Activities</h3>
            <button onClick={() => navigateTo('accounts', null, null)} className="text-xs font-bold text-[#a14c3e]">See All</button>
        </div>
        {transactions.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Icons.Inbox size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400">Add your first transaction to get started</p>
            </div>
        ) : (
            <div className="flex flex-col gap-2">
                {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                {tx.type === 'income' ? <Icons.ArrowDown size={20} /> : <Icons.ArrowUp size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{tx.title}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{formatDate(tx.date)}</p>
                            </div>
                        </div>
                        <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} ETB
                        </p>
                    </div>
                ))}
            </div>
        )}
    </section>
)

const aiInsights = () => (
    <section className="flex flex-col gap-3">
        <h3 className="text-gray-800 dark:text-white font-bold text-lg">AI Insights</h3>
        <div className="flex overflow-x-auto gap-3 pb-2 px-1 -mx-1 no-scrollbar">
            <div className="min-w-[70vw] sm:min-w-[240px] rounded-xl bg-white dark:bg-gray-900 p-4 flex flex-col items-start gap-2 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#a14c3e]/10 flex items-center justify-center text-[#a14c3e]">
                    <Icons.TrendingUp size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Spending is up 15% this week.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Consider reviewing your budget categories.</p>
                <button className="text-xs font-bold text-[#a14c3e] mt-1">Analyze spending</button>
            </div>
            <div className="min-w-[70vw] sm:min-w-[240px] rounded-xl bg-white dark:bg-gray-900 p-4 flex flex-col items-start gap-2 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#a14c3e]/10 flex items-center justify-center text-[#a14c3e]">
                    <Icons.CreditCard size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">You could save 500 ETB monthly.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">By cutting down on non-essential subscriptions.</p>
                <button className="text-xs font-bold text-[#a14c3e] mt-1">See suggestions</button>
            </div>
            <div className="min-w-[70vw] sm:min-w-[240px] rounded-xl bg-white dark:bg-gray-900 p-4 flex flex-col items-start gap-2 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#a14c3e]/10 flex items-center justify-center text-[#a14c3e]">
                    <Icons.Wallet size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Investment opportunity found!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">High-yield savings account matching your goals.</p>
                <button className="text-xs font-bold text-[#a14c3e] mt-1">Explore options</button>
            </div>
        </div>
    </section>
)

const goalsProgress = (goals: any[], navigateTo: (tab: string, type: any, id: any) => void) => (
    <section className="flex flex-col gap-3">
        <h3 className="text-gray-800 dark:text-white font-bold text-lg">Goals Progress</h3>
        {goals.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Icons.Target size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No savings goals yet</p>
                <p className="text-sm text-gray-400">Create your first goal to start saving</p>
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-3">
                {goals.map(goal => {
                    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
                    const offset = 100 - progress
                    return (
                        <div key={goal.id} onClick={() => navigateTo('goals', 'goal', goal.id)} className="rounded-xl bg-white dark:bg-gray-900 p-3 flex flex-col items-center gap-2 text-center border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:border-[#a14c3e]/40 transition-all">
                            <div className="relative w-12 h-12">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <circle className="stroke-gray-200 dark:stroke-gray-700" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                                    <circle className="stroke-[#a14c3e]" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset={offset} strokeLinecap="round" strokeWidth="3" style={{ transition: 'stroke-dashoffset 0.5s ease' }}></circle>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-gray-800 dark:text-white">{progress}%</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate w-full">{goal.title}</p>
                        </div>
                    )
                })}
            </div>
        )}
    </section>
)

const upcomingBillsSection = (bills: any[], formatRelativeTime: (date: Date) => string, openTransactionModal: (tx?: any) => void) => (
    <section className="flex flex-col gap-3">
        <h3 className="text-gray-800 dark:text-white font-bold text-lg">Upcoming Bills & Alerts</h3>
        {bills.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Icons.Calendar size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No upcoming bills</p>
                <p className="text-sm text-gray-400">Great job staying on top of payments!</p>
            </div>
        ) : (
            <div className="flex flex-col gap-3">
                {bills.map(bill => (
                    <div key={bill.id} className={`flex items-center justify-between p-4 rounded-xl ${bill.priority === 'high' ? 'bg-[#a14c3e]/5 border-[#a14c3e]/40' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'} border shadow-sm relative overflow-hidden`}>
                        {bill.priority === 'high' && <div className="absolute inset-y-0 left-0 w-1 bg-[#a14c3e] rounded-l-xl"></div>}
                        <div className={`flex items-center gap-3 ${bill.priority === 'high' ? 'pl-2' : ''}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bill.priority === 'high' ? 'bg-[#a14c3e] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                                {bill.icon === 'Users' && <Icons.Users size={20} />}
                                {bill.icon === 'Zap' && <Icons.Zap size={20} />}
                                {bill.icon === 'Wifi' && <Icons.Wifi size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{bill.name}</p>
                                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">{formatRelativeTime(bill.dueDate)} • {bill.amount.toLocaleString()} ETB</p>
                            </div>
                        </div>
                        <button onClick={openTransactionModal} className={`text-[11px] font-extrabold px-4 py-2 rounded-lg uppercase tracking-wide transition-all ${bill.priority === 'high' ? 'bg-[#a14c3e] text-white hover:brightness-110' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'} active:scale-95`}>
                            Pay Now
                        </button>
                    </div>
                ))}
            </div>
        )}
    </section>
)