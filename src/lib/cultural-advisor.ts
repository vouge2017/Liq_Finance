/**
 * Culturally Sensitive AI Advisor for Ethiopian Financial Context
 * Implements Islamic finance principles, Ethiopian Orthodox practices, and traditional financial systems
 */

import type { AppState, Transaction, SavingsGoal, Iqub, Iddir } from '@/types'
import { getCurrentBudgetMonth } from '@/utils/dateUtils'

export interface CulturalContext {
    religion: 'islam' | 'orthodox' | 'traditional'
    calendarMode: 'gregorian' | 'ethiopian'
    communityObligations: {
        iqubParticipation: boolean
        iddirMembership: boolean
        familySupport: number // percentage of income
    }
    financialPractices: {
        zakatEligible: boolean
        interestAvoidance: boolean
        communityFirst: boolean
    }
}

export interface ZakatCalculation {
    nisabThreshold: number // Minimum wealth for Zakat obligation
    currentWealth: number
    zakatObligation: number
    category: 'wealth' | 'gold' | 'silver' | 'livestock' | 'crops' | 'trade'
    eligibleForZakat: boolean
}

export interface ReligiousCalendar {
    currentDate: Date
    ethiopianMonth: string
    ethiopianYear: number
    islamicMonth: string
    islamicYear: number
    religiousEvents: ReligiousEvent[]
}

export interface ReligiousEvent {
    name: string
    type: 'fasting' | 'celebration' | 'obligation' | 'recommendation'
    startDate: Date
    endDate?: Date
    financialImpact: {
        expectedExpenses: number
        recommendedSavings: number
        description: string
    }
}

export interface CulturalAdvice {
    category: 'zakat' | 'community' | 'investment' | 'savings' | 'spending' | 'religious'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actionableSteps: string[]
    culturalJustification: string
    religiousReference?: string
}

export class EthiopianCulturalAdvisor {
    private culturalContext: CulturalContext
    private appState: AppState

    constructor(appState: AppState, culturalContext: CulturalContext) {
        this.appState = appState
        this.culturalContext = culturalContext
    }

    /**
     * Generate culturally appropriate financial advice
     */
    generateCulturalAdvice(): CulturalAdvice[] {
        const advice: CulturalAdvice[] = []

        // Zakat guidance for Muslim users
        if (this.culturalContext.financialPractices.zakatEligible) {
            advice.push(...this.generateZakatAdvice())
        }

        // Community obligation advice
        advice.push(...this.generateCommunityAdvice())

        // Religious calendar-based advice
        advice.push(...this.generateReligiousCalendarAdvice())

        // Traditional Ethiopian financial practices
        advice.push(...this.generateTraditionalPracticeAdvice())

        return advice.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
    }

    /**
     * Calculate Zakat obligations for Muslim users
     */
    calculateZakatObligation(): ZakatCalculation {
        if (!this.culturalContext.financialPractices.zakatEligible) {
            return {
                nisabThreshold: 0,
                currentWealth: 0,
                zakatObligation: 0,
                category: 'wealth',
                eligibleForZakat: false
            }
        }

        // Calculate total wealth (excluding primary residence and business assets)
        const totalWealth = this.calculateTotalWealth()

        // Nisab threshold (85g of gold ≈ 400 USD equivalent in ETB)
        const nisabThreshold = 400 * 85 // Approximate in ETB
        const isEligible = totalWealth >= nisabThreshold

        // Zakat rate: 2.5% (1/40) of wealth above Nisab
        const zakatObligation = isEligible ? (totalWealth - nisabThreshold) * 0.025 : 0

        return {
            nisabThreshold,
            currentWealth: totalWealth,
            zakatObligation,
            category: 'wealth',
            eligibleForZakat: isEligible
        }
    }

    /**
     * Generate Zakat-specific advice
     */
    private generateZakatAdvice(): CulturalAdvice[] {
        const zakatCalc = this.calculateZakatObligation()
        const advice: CulturalAdvice[] = []

        if (zakatCalc.eligibleForZakat) {
            advice.push({
                category: 'zakat',
                priority: 'high',
                title: 'Zakat Obligation Reminder',
                description: `You have a Zakat obligation of ${zakatCalc.zakatObligation.toLocaleString()} ETB this year.`,
                actionableSteps: [
                    'Calculate your exact Zakat using current gold prices',
                    'Identify eligible recipients (the poor, those in debt, etc.)',
                    'Distribute Zakat preferably during Ramadan',
                    'Keep records for your Zakat distribution'
                ],
                culturalJustification: 'Zakat is the third pillar of Islam and a divine obligation for those with sufficient wealth.',
                religiousReference: 'Quran 9:60 - "Zakat is for the poor, the needy, those employed to collect Zakat..."'
            })

            // Advice for optimizing wealth for Zakat
            if (this.appState.totalBalance > zakatCalc.nisabThreshold * 2) {
                advice.push({
                    category: 'zakat',
                    priority: 'medium',
                    title: 'Optimize Your Wealth for Zakat',
                    description: 'Consider investing in ways that increase your Zakat-exempt assets while growing wealth.',
                    actionableSteps: [
                        'Invest in business inventory (exempt from Zakat)',
                        'Purchase tools/equipment for your profession',
                        'Invest in real estate for rental income',
                        'Consider agriculture or livestock if appropriate'
                    ],
                    culturalJustification: 'Strategic wealth placement can help minimize Zakat burden while maximizing spiritual rewards.',
                    religiousReference: 'Islamic jurisprudence on Zakat-exempt assets'
                })
            }
        }

        return advice
    }

    /**
     * Generate community-based financial advice
     */
    private generateCommunityAdvice(): CulturalAdvice[] {
        const advice: CulturalAdvice[] = []
        const currentMonth = getCurrentBudgetMonth(1) // Default start date

        // Iqub participation advice
        if (this.culturalContext.communityObligations.iqubParticipation) {
            const activeIqubs = this.appState.iqubs.filter(i => i.status === 'active')

            if (activeIqubs.length === 0) {
                advice.push({
                    category: 'community',
                    priority: 'high',
                    title: 'Consider Joining an Iqub',
                    description: 'Iqub participation is important for community bonds and financial growth.',
                    actionableSteps: [
                        'Identify trustworthy community members',
                        'Calculate your monthly contribution capacity',
                        'Set clear terms for the Iqub cycle',
                        'Choose a meaningful purpose for your payout'
                    ],
                    culturalJustification: 'Iqub is a traditional Ethiopian saving circle that strengthens community bonds.',
                    religiousReference: 'Prophet Muhammad encouraged mutual financial support'
                })
            } else {
                // Advice for active Iqub participants
                const totalIqubCommitment = activeIqubs.reduce((sum, iqub) => sum + iqub.amount, 0)
                const incomeRatio = totalIqubCommitment / Math.max(this.appState.totalIncome, 1)

                if (incomeRatio > 0.3) {
                    advice.push({
                        category: 'community',
                        priority: 'medium',
                        title: 'Review Iqub Commitments',
                        description: `Your Iqub commitments are ${(incomeRatio * 100).toFixed(1)}% of income. Consider if this is sustainable.`,
                        actionableSteps: [
                            'Calculate your actual monthly capacity',
                            'Consider reducing commitments if necessary',
                            'Prioritize Iqubs with shorter cycles',
                            'Ensure you can meet all commitments comfortably'
                        ],
                        culturalJustification: 'Maintaining commitments strengthens trust within the community.',
                        religiousReference: 'Keeping promises and covenants is emphasized in Islamic ethics'
                    })
                }
            }
        }

        // Iddir membership advice
        if (this.culturalContext.communityObligations.iddirMembership) {
            const activeIddirs = this.appState.iddirs.filter(i => i.status === 'active')

            if (activeIddirs.length === 0) {
                advice.push({
                    category: 'community',
                    priority: 'high',
                    title: 'Join an Iddir for Family Protection',
                    description: 'Iddir provides crucial social safety net for Ethiopian families.',
                    actionableSteps: [
                        'Research established Iddirs in your area',
                        'Verify the organization\'s reputation and management',
                        'Understand contribution requirements and benefits',
                        'Consider joining both family and neighborhood Iddirs'
                    ],
                    culturalJustification: 'Iddir is essential for community solidarity and family security in Ethiopian culture.',
                    religiousReference: 'Caring for community members is a religious and cultural obligation'
                })
            }
        }

        return advice
    }

    /**
     * Generate advice based on religious calendar
     */
    private generateReligiousCalendarAdvice(): CulturalAdvice[] {
        const advice: CulturalAdvice[] = []
        const today = new Date()

        // Ethiopian Orthodox calendar considerations
        if (this.culturalContext.religion === 'orthodox') {
            // Lent (Tsome) preparation
            const isLentSeason = this.isLentSeason(today)
            if (isLentSeason) {
                advice.push({
                    category: 'religious',
                    priority: 'high',
                    title: 'Prepare for Fasting Season',
                    description: 'Fasting seasons require special financial planning for Ethiopian Orthodox Christians.',
                    actionableSteps: [
                        'Increase food budget for fasting meals',
                        'Budget for church donations and offerings',
                        'Prepare for increased charity during fasting',
                        'Consider reduced transportation costs (walking to church)'
                    ],
                    culturalJustification: 'Proper preparation ensures spiritual devotion without financial stress.',
                    religiousReference: 'Orthodox Christian fasting traditions emphasize spiritual preparation'
                })
            }
        }

        // Islamic calendar considerations
        if (this.culturalContext.religion === 'islam') {
            // Ramadan preparation
            const isRamadan = this.isRamadan(today)
            if (isRamadan) {
                advice.push({
                    category: 'religious',
                    priority: 'high',
                    title: 'Ramadan Financial Planning',
                    description: 'Prepare financially for increased expenses during the holy month.',
                    actionableSteps: [
                        'Increase food budget for Iftar and Suhoor',
                        'Budget for increased Zakat distribution',
                        'Plan for new clothes and gifts',
                        'Set aside money for charity and community events'
                    ],
                    culturalJustification: 'Ramadan requires both spiritual and financial preparation.',
                    religiousReference: 'Quran 2:185 - Ramadan is the month of increased blessing and charity'
                })

                // Post-Ramadan advice
                advice.push({
                    category: 'religious',
                    priority: 'medium',
                    title: 'Plan for Eid Celebrations',
                    description: 'Budget appropriately for Eid al-Fitr and Eid al-Adha celebrations.',
                    actionableSteps: [
                        'Save specifically for Eid expenses',
                        'Plan for new clothes and gifts',
                        'Budget for community feasts',
                        'Consider travel costs for family visits'
                    ],
                    culturalJustification: 'Eid celebrations strengthen family and community bonds.',
                    religiousReference: 'Celebrating Eid is a Sunnah that brings joy to the community'
                })
            }
        }

        return advice
    }

    /**
     * Generate advice for traditional Ethiopian financial practices
     */
    private generateTraditionalPracticeAdvice(): CulturalAdvice[] {
        const advice: CulturalAdvice[] = []

        // Interest-free banking advice
        if (this.culturalContext.financialPractices.interestAvoidance) {
            advice.push({
                category: 'investment',
                priority: 'medium',
                title: 'Explore Interest-Free Investment Options',
                description: 'Islamic finance principles discourage interest-based investments.',
                actionableSteps: [
                    'Research Islamic banking options in Ethiopia',
                    'Consider profit-sharing investments',
                    'Explore commodity trading opportunities',
                    'Look into real estate investment through partnerships'
                ],
                culturalJustification: 'Avoiding interest aligns with Islamic principles and Ethiopian cultural values.',
                religiousReference: 'Quran 2:275 - "Allah has permitted trade and forbidden interest."'
            })
        }

        // Family financial support
        const familySupportPercentage = this.culturalContext.communityObligations.familySupport
        const monthlyIncome = this.calculateMonthlyIncome()
        const expectedFamilySupport = monthlyIncome * (familySupportPercentage / 100)

        if (this.appState.totalExpense < expectedFamilySupport) {
            advice.push({
                category: 'community',
                priority: 'high',
                title: 'Honor Family Support Obligations',
                description: 'Consider allocating appropriate portion of income for extended family support.',
                actionableSteps: [
                    'Calculate expected monthly family support',
                    'Create a dedicated budget category for family',
                    'Set up automatic transfers for regular support',
                    'Discuss expectations with family members'
                ],
                culturalJustification: 'Supporting extended family is a core value in Ethiopian culture.',
                religiousReference: 'Caring for family is among the most rewarded acts in both Islam and Christianity'
            })
        }

        return advice
    }

    /**
     * Utility methods for calculations
     */
    private calculateTotalWealth(): number {
        // Total assets minus liabilities (simplified)
        return this.appState.totalBalance +
            this.appState.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    }

    private calculateMonthlyIncome(): number {
        const currentMonth = getCurrentBudgetMonth(this.appState.budgetStartDate)
        return this.appState.transactions
            .filter(t => {
                const txDate = new Date(t.date)
                return t.type === 'income' &&
                    txDate >= currentMonth.start &&
                    txDate <= currentMonth.end
            })
            .reduce((sum, t) => sum + t.amount, 0)
    }

    private isLentSeason(date: Date): boolean {
        // Simplified check - Orthodox Lent is 55 days before Easter
        // In reality, this would use the Ethiopian Orthodox calendar
        const month = date.getMonth()
        return month === 2 || month === 3 // March/April approximation
    }

    private isRamadan(date: Date): boolean {
        // Simplified check - Ramadan moves 10-11 days earlier each year
        // In reality, this would use the Islamic calendar
        const month = date.getMonth()
        const year = date.getFullYear()

        // Approximate Ramadan periods for recent years
        const ramadanMonths = [3, 4] // April/May in Gregorian calendar
        return ramadanMonths.includes(month) && year >= 2024
    }

    /**
     * Generate comprehensive financial health assessment
     */
    generateCulturalFinancialHealth(): {
        score: number
        category: 'excellent' | 'good' | 'needs_improvement' | 'critical'
        recommendations: CulturalAdvice[]
        culturalAlignment: number // 0-100 score
    } {
        const recommendations = this.generateCulturalAdvice()
        let score = 50 // Base score
        let culturalAlignment = 50

        // Score based on cultural practices
        if (this.culturalContext.financialPractices.zakatEligible) {
            const zakatCalc = this.calculateZakatObligation()
            if (zakatCalc.eligibleForZakat && zakatCalc.zakatObligation > 0) {
                // Bonus for those who understand Zakat obligations
                score += 15
                culturalAlignment += 20
            }
        }

        if (this.culturalContext.communityObligations.iddirMembership) {
            if (this.appState.iddirs.length > 0) {
                score += 10
                culturalAlignment += 15
            }
        }

        if (this.culturalContext.communityObligations.iqubParticipation) {
            if (this.appState.iqubs.length > 0) {
                score += 10
                culturalAlignment += 15
            }
        }

        // Penalty for poor financial management
        const expenseRatio = this.appState.totalExpense / Math.max(this.appState.totalIncome, 1)
        if (expenseRatio > 0.9) {
            score -= 20
        }

        // Determine category
        let category: 'excellent' | 'good' | 'needs_improvement' | 'critical'
        if (score >= 80) category = 'excellent'
        else if (score >= 65) category = 'good'
        else if (score >= 45) category = 'needs_improvement'
        else category = 'critical'

        return {
            score: Math.max(0, Math.min(100, score)),
            category,
            recommendations,
            culturalAlignment: Math.max(0, Math.min(100, culturalAlignment))
        }
    }
}

/**
 * Cultural Context Builder
 * Creates appropriate cultural context based on user preferences
 */
export function buildCulturalContext(appState: AppState): CulturalContext {
    // This would be enhanced with actual user preference data
    return {
        religion: 'islam', // Would come from user profile
        calendarMode: appState.budgetStartDate === 1 ? 'ethiopian' : 'gregorian',
        communityObligations: {
            iqubParticipation: true,
            iddirMembership: true,
            familySupport: 10 // 10% of income for extended family
        },
        financialPractices: {
            zakatEligible: true,
            interestAvoidance: true,
            communityFirst: true
        }
    }
}

/**
 * Cultural Sensitivity Validator
 * Ensures AI responses align with Ethiopian cultural values
 */
export class CulturalSensitivityValidator {
    static validateAdvice(advice: string, context: CulturalContext): {
        isAppropriate: boolean
        suggestions: string[]
        culturalNotes: string[]
    } {
        const suggestions: string[] = []
        const culturalNotes: string[] = []
        let isAppropriate = true

        // Check for appropriate cultural references
        if (context.financialPractices.zakatEligible && !advice.toLowerCase().includes('zakat')) {
            suggestions.push('Consider mentioning Zakat obligations for Muslim users')
            isAppropriate = false
        }

        if (context.communityObligations.iqubParticipation && !advice.toLowerCase().includes('iqub')) {
            suggestions.push('Include Iqub or traditional saving circle advice')
            culturalNotes.push('Iqub participation is important for Ethiopian community bonds')
        }

        if (context.communityObligations.iddirMembership && !advice.toLowerCase().includes('iddir')) {
            suggestions.push('Mention Iddir community support systems')
            culturalNotes.push('Iddir provides crucial social safety net')
        }

        // Check for interest/riba references
        if (context.financialPractices.interestAvoidance &&
            advice.toLowerCase().includes('interest') &&
            advice.toLowerCase().includes('lending')) {
            suggestions.push('Avoid promoting interest-based lending')
            isAppropriate = false
        }

        return {
            isAppropriate,
            suggestions,
            culturalNotes
        }
    }
}