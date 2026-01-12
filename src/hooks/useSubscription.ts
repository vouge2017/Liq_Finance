/**
 * useSubscription Hook
 * Frontend hook for subscription API integration
 */

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export type SubscriptionTier = 'free' | 'lite' | 'pro' | 'business'
export type BillingCycle = 'monthly' | 'annual'

export interface SubscriptionData {
  id?: string
  user_id?: string
  tier: SubscriptionTier
  status: 'active' | 'cancelled' | 'paused' | 'expired' | 'pending'
  start_date?: string
  renewal_date?: string
  payment_method?: string
  auto_renew: boolean
  price: number
  billing_cycle: BillingCycle
  features: Record<string, unknown>
}

export interface SubscriptionFeatures {
  maxTransactions: number
  maxBudgets: number
  aiAnalysis: boolean
  voiceInput: boolean
  receiptScanning: boolean
  advancedReporting: boolean
  prioritySupport: boolean
}

interface SubscriptionState {
  subscription: SubscriptionData | null
  features: SubscriptionFeatures | null
  billingHistory: Array<Record<string, unknown>>
  loading: boolean
  error: string | null
}

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001'

export function useSubscription() {
  const { user, getToken } = useAuth()
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    features: null,
    billingHistory: [],
    loading: false,
    error: null,
  })

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const token = await getToken()
      const response = await fetch(`${API_BASE}/api/subscriptions/current`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`)
      }

      const data = await response.json()

      setState((prev) => ({
        ...prev,
        subscription: data.data,
        features: data.data.features,
        loading: false,
      }))

      return data.data
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMsg)
      setState((prev) => ({ ...prev, loading: false }))
      throw error
    }
  }, [user, getToken])

  const upgradeSubscription = useCallback(
    async (tier: SubscriptionTier) => {
      if (!user) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const token = await getToken()
        const response = await fetch(`${API_BASE}/api/subscriptions/upgrade`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 402) {
            // Payment required
            setError(`Payment processing not available: ${errorData.message}`)
            setState((prev) => ({ ...prev, loading: false }))
            return errorData
          }
          throw new Error(`Failed to upgrade subscription: ${response.statusText}`)
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          subscription: data.data,
          features: data.data.features,
          loading: false,
        }))

        return data.data
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMsg)
        setState((prev) => ({ ...prev, loading: false }))
        throw error
      }
    },
    [user, getToken],
  )

  const cancelSubscription = useCallback(async () => {
    if (!user) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const token = await getToken()
      const response = await fetch(`${API_BASE}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${response.statusText}`)
      }

      const data = await response.json()

      setState((prev) => ({
        ...prev,
        subscription: data.data,
        features: data.data.features,
        loading: false,
      }))

      return data.data
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMsg)
      setState((prev) => ({ ...prev, loading: false }))
      throw error
    }
  }, [user, getToken])

  const fetchBillingHistory = useCallback(
    async (limit = 50) => {
      if (!user) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const token = await getToken()
        const response = await fetch(`${API_BASE}/api/subscriptions/billing-history?limit=${limit}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch billing history: ${response.statusText}`)
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          billingHistory: data.data,
          loading: false,
        }))

        return data.data
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMsg)
        setState((prev) => ({ ...prev, loading: false }))
        throw error
      }
    },
    [user, getToken],
  )

  const fetchTierFeatures = useCallback(async (tier: SubscriptionTier) => {
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/features/${tier}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch tier features: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMsg)
      throw error
    }
  }, [])

  return {
    subscription: state.subscription,
    features: state.features,
    billingHistory: state.billingHistory,
    loading: state.loading,
    error: state.error,
    fetchCurrentSubscription,
    upgradeSubscription,
    cancelSubscription,
    fetchBillingHistory,
    fetchTierFeatures,
  }
}
