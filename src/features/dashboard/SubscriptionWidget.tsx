import React from 'react'
import { useAppContext } from '@/context/AppContext'
import { Icons } from '@/shared/components/Icons'
import { HorizontalScrollWrapper } from '@/shared/components/ScrollIndicator'

interface SubscriptionWidgetProps {
    onOpenModal: () => void
    onSeeAll?: () => void
}

export const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = ({ onOpenModal, onSeeAll }) => {
    const { state } = useAppContext()
    const { recurringTransactions } = state

    if (recurringTransactions.length === 0) return null

    const sortedSubscriptions = [...recurringTransactions].sort((a, b) =>
        new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
    )

    const totalMonthly = recurringTransactions
        .filter(r => r.recurrence === 'monthly')
        .reduce((sum, r) => sum + r.amount, 0)

    const upcomingThisWeek = sortedSubscriptions.filter(sub => {
        const dueDate = new Date(sub.next_due_date)
        const now = new Date()
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return dueDate >= now && dueDate <= weekFromNow
    })

    const colorThemes = [
        { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-500/20', accent: 'bg-orange-500' },
        { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20', accent: 'bg-blue-500' },
        { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-500/20', accent: 'bg-green-500' },
        { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-500/20', accent: 'bg-purple-500' },
        { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-500/20', accent: 'bg-rose-500' },
    ]

    const getTheme = (index: number) => colorThemes[index % colorThemes.length]

    const getRecurrenceLabel = (recurrence: string) => {
        switch (recurrence) {
            case 'weekly': return 'Weekly'
            case 'monthly': return 'Monthly'
            case 'quarterly': return 'Quarterly'
            case 'annual': return 'Yearly'
            default: return recurrence
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'bills': case 'utilities': return Icons.Zap
            case 'rent': case 'housing': return Icons.Home
            case 'food': case 'groceries': return Icons.Utensils
            case 'transport': return Icons.Car
            case 'shopping': return Icons.Shopping
            case 'entertainment': return Icons.Film
            case 'education': return Icons.Education
            case 'health': return Icons.Heart
            default: return Icons.Recurring
        }
    }

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#111318] dark:text-white">Upcoming Bills</h3>
                    {upcomingThisWeek.length > 0 && (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold animate-pulse">
                            {upcomingThisWeek.length} due soon
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right mr-2 hidden sm:block">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly Total</p>
                        <p className="text-sm font-black text-[#111318] dark:text-white">{totalMonthly.toLocaleString()} ETB</p>
                    </div>
                    <button
                        onClick={onSeeAll || onOpenModal}
                        className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 px-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20"
                    >
                        See All
                        <Icons.ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <HorizontalScrollWrapper className="-mx-5 px-5">
                <div className="flex space-x-4 pb-4">
                    {sortedSubscriptions.slice(0, 5).map((sub, index) => {
                        const date = new Date(sub.next_due_date)
                        const month = date.toLocaleString('default', { month: 'short' })
                        const day = date.getDate()
                        const theme = getTheme(index)
                        const IconComponent = getCategoryIcon(sub.category)

                        const isOverdue = date < new Date()
                        const isDueSoon = !isOverdue && date <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

                        return (
                            <div
                                key={sub.id}
                                className={`w-[280px] shrink-0 ${theme.bg} ${theme.border} border rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${theme.accent}`} />

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-xl ${theme.bg} flex items-center justify-center ${theme.text} shrink-0 font-bold border ${theme.border}`}>
                                        <IconComponent size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-[#111318] dark:text-white text-sm truncate">{sub.name}</h4>
                                            {isOverdue && (
                                                <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded flex-shrink-0">OVERDUE</span>
                                            )}
                                            {isDueSoon && !isOverdue && (
                                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded flex-shrink-0">SOON</span>
                                            )}
                                        </div>
                                        <p className={`text-xs font-medium ${theme.text}`}>
                                            {getRecurrenceLabel(sub.recurrence)} • {sub.payment_method}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">Due</p>
                                        <p className="text-lg font-black text-[#111318] dark:text-white">
                                            {month} {day}
                                        </p>
                                    </div>
                                    <p className="font-bold text-[#111318] dark:text-white text-lg">
                                        {sub.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })} <span className="text-xs font-medium text-gray-400">ETB</span>
                                    </p>
                                </div>

                                {sub.reminderDays && sub.reminderDays.length > 0 && (
                                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-black/[0.03] dark:border-white/10">
                                        <Icons.Bell size={12} className={theme.text} />
                                        <span className="text-[10px] font-medium text-gray-500">Reminder: {sub.reminderDays.join(', ')} day(s) before</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {sortedSubscriptions.length === 0 && (
                        <div className="w-full py-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Icons.Recurring size={32} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">No subscriptions yet</p>
                            <button
                                onClick={onOpenModal}
                                className="mt-3 text-xs font-bold text-primary hover:text-primary-dark"
                            >
                                + Add your first subscription
                            </button>
                        </div>
                    )}
                </div>
            </HorizontalScrollWrapper>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .no-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
