"use client"

import { useEffect } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

// Types
export type UserTier = 'free' | 'pro' | 'trial'

export interface AIUsageStats {
    voiceCount: number
    receiptCount: number
    lastResetDate: string // ISO date string
    trialStartDate?: string
}

export const AI_LIMITS = {
    free: {
        voice: 3,
        receipt: 2
    },
    trial: {
        voice: 10,
        receipt: 5,
        days: 7
    },
    pro: {
        voice: Infinity,
        receipt: Infinity
    }
}

// Hook to manage AI usage
export const useAIUsage = () => {
    const [usage, setUsage] = useLocalStorage<AIUsageStats>("ai_usage_stats", {
        voiceCount: 0,
        receiptCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
    })

    // BETA OVERRIDE: Default to 'pro' for all users during beta
    const [userTier, setUserTier] = useLocalStorage<UserTier>("user_tier", "pro")
    const [trialStart, setTrialStart] = useLocalStorage<string>("trial_start_date", new Date().toISOString())

    // BETA OVERRIDE: Force upgrade existing users to 'pro'
    useEffect(() => {
        if (userTier !== 'pro') {
            setUserTier('pro')
        }
    }, [userTier, setUserTier])

    // Reset daily counts if new day
    const checkAndResetDaily = () => {
        const today = new Date().toISOString().split('T')[0]
        if (usage.lastResetDate !== today) {
            setUsage({
                ...usage,
                voiceCount: 0,
                receiptCount: 0,
                lastResetDate: today
            })
            return true
        }
        return false
    }

    // Check if trial expired
    const checkTrialStatus = () => {
        if (userTier === 'trial') {
            const start = new Date(trialStart).getTime()
            const now = new Date().getTime()
            const daysPassed = (now - start) / (1000 * 60 * 60 * 24)

            if (daysPassed > AI_LIMITS.trial.days) {
                // BETA OVERRIDE: Don't downgrade to free, stay on pro/trial or upgrade
                // setUserTier('free') 
                // return false 
                setUserTier('pro') // Just upgrade them
                return true
            }
        }
        return true
    }

    // Check if user can use feature
    const canUseFeature = (feature: 'voice' | 'receipt'): { allowed: boolean, reason?: string, remaining: number } => {
        checkAndResetDaily()
        // checkTrialStatus() // Not needed if everyone is Pro

        const limit = AI_LIMITS[userTier][feature]
        const current = feature === 'voice' ? usage.voiceCount : usage.receiptCount

        if (current >= limit) {
            return {
                allowed: false,
                reason: userTier === 'trial' ? 'daily_limit' : 'upgrade_required',
                remaining: 0
            }
        }

        return {
            allowed: true,
            remaining: limit === Infinity ? 9999 : limit - current
        }
    }

    // Increment usage
    const incrementUsage = (feature: 'voice' | 'receipt') => {
        checkAndResetDaily()
        setUsage({
            ...usage,
            voiceCount: feature === 'voice' ? usage.voiceCount + 1 : usage.voiceCount,
            receiptCount: feature === 'receipt' ? usage.receiptCount + 1 : usage.receiptCount
        })
    }

    // Upgrade to Pro (Mock)
    const upgradeToPro = () => {
        setUserTier('pro')
    }

    return {
        usage,
        userTier,
        limits: AI_LIMITS[userTier],
        canUseFeature,
        incrementUsage,
        upgradeToPro,
        remainingTrialDays: userTier === 'trial'
            ? Math.max(0, AI_LIMITS.trial.days - Math.floor((new Date().getTime() - new Date(trialStart).getTime()) / (1000 * 60 * 60 * 24)))
            : 0
    }
}
