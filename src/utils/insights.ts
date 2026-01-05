import { Transaction } from "@/types"

export interface SpendingInsights {
    totalSpent: number
    dailyAverage: number
    topCategory: { name: string; amount: number; percentage: number } | null
    savingsRate: number
    trend: 'up' | 'down' | 'stable'
    trendPercentage: number
    projectedMonthly: number
}

export const calculateInsights = (
    transactions: Transaction[],
    income: number,
    daysInPeriod: number = 7
): SpendingInsights => {
    // Filter for period (default last 7 days)
    const now = new Date()
    const periodStart = new Date(now.getTime() - daysInPeriod * 24 * 60 * 60 * 1000)

    const periodTransactions = transactions.filter(t =>
        new Date(t.date) >= periodStart && t.type === 'expense'
    )

    const totalSpent = periodTransactions.reduce((sum, t) => sum + t.amount, 0)
    const dailyAverage = totalSpent / daysInPeriod

    // Category Breakdown
    const categories: Record<string, number> = {}
    periodTransactions.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount
    })

    let topCategory = null
    let maxCatAmount = 0

    Object.entries(categories).forEach(([name, amount]) => {
        if (amount > maxCatAmount) {
            maxCatAmount = amount
            topCategory = {
                name,
                amount,
                percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
            }
        }
    })

    // Trend Calculation (vs previous period)
    const prevPeriodStart = new Date(periodStart.getTime() - daysInPeriod * 24 * 60 * 60 * 1000)
    const prevTransactions = transactions.filter(t =>
        new Date(t.date) >= prevPeriodStart &&
        new Date(t.date) < periodStart &&
        t.type === 'expense'
    )
    const prevTotal = prevTransactions.reduce((sum, t) => sum + t.amount, 0)

    let trend: 'up' | 'down' | 'stable' = 'stable'
    let trendPercentage = 0

    if (prevTotal > 0) {
        const diff = totalSpent - prevTotal
        trendPercentage = Math.abs((diff / prevTotal) * 100)
        if (trendPercentage < 5) trend = 'stable'
        else trend = diff > 0 ? 'up' : 'down'
    }

    // Savings Rate (if income provided)
    // Assuming income is monthly, convert to period
    const periodIncome = (income / 30) * daysInPeriod
    const savingsRate = periodIncome > 0 ? ((periodIncome - totalSpent) / periodIncome) * 100 : 0

    return {
        totalSpent,
        dailyAverage,
        topCategory,
        savingsRate,
        trend,
        trendPercentage,
        projectedMonthly: dailyAverage * 30
    }
}
