"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Subscription,
  SubscriptionTier,
  TIER_FEATURES,
  PaymentIntent,
  SubscriptionStatus,
} from '@/types/subscription'

interface SubscriptionContextType {
  subscription: Subscription | null
  tier: SubscriptionTier
  isLoading: boolean
  isPaymentComingSoon: boolean // Feature flag for "Coming Soon"
  error: string | null

  // Feature checking
  canUseFeature: (featureName: keyof typeof TIER_FEATURES.free.features) => boolean
  getFeatureValue: (featureName: keyof typeof TIER_FEATURES.free.features) => any
  canAccessTier: (requiredTier: SubscriptionTier) => boolean

  // Subscription management
  upgradeTier: (newTier: SubscriptionTier, billingCycle?: 'monthly' | 'annual') => Promise<void>
  cancelSubscription: () => Promise<void>
  renewSubscription: () => Promise<void>

  // Payment
  initiatePayment: (tier: SubscriptionTier, paymentMethod: string) => Promise<PaymentIntent | null>
  verifyPayment: (paymentId: string) => Promise<boolean>
  getPaymentStatus: (paymentId: string) => Promise<SubscriptionStatus>

  // UI helpers
  getTierInfo: (tier: SubscriptionTier) => typeof TIER_FEATURES[SubscriptionTier]
  getAllTiers: () => typeof TIER_FEATURES
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // FEATURE FLAG: Set to false when payments are live
  const isPaymentComingSoon = true

  // Load subscription on mount
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoading(true)

        // Try to load from localStorage first (for development)
        const storedTier = localStorage.getItem('userTier') as SubscriptionTier | null
        const storedSubscription = localStorage.getItem('subscription')

        if (storedSubscription) {
          setSubscription(JSON.parse(storedSubscription))
          return
        }

        // TODO: Load from Supabase in production
        // const { data, error } = await supabase
        //   .from('subscriptions')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .single()

        // Default to free tier
        const defaultSubscription: Subscription = {
          id: 'free-' + Date.now(),
          userId: 'user-' + Date.now(), // TODO: Get from auth
          tier: 'free',
          status: 'active',
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: false,
          price: 0,
          billingCycle: 'monthly',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        setSubscription(defaultSubscription)
        localStorage.setItem('subscription', JSON.stringify(defaultSubscription))
      } catch (err) {
        console.error('Failed to load subscription:', err)
        setError(err instanceof Error ? err.message : 'Failed to load subscription')
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [])

  const tier = subscription?.tier || 'free'

  const canUseFeature = (featureName: keyof typeof TIER_FEATURES.free.features): boolean => {
    const features = TIER_FEATURES[tier].features
    const value = features[featureName]

    // Handle different types of values
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'number') {
      return value > 0 // For numeric features (e.g., maxIdirGroups), return true if > 0
    }
    return false
  }

  const getFeatureValue = (featureName: keyof typeof TIER_FEATURES.free.features): any => {
    return TIER_FEATURES[tier].features[featureName]
  }

  const canAccessTier = (requiredTier: SubscriptionTier): boolean => {
    const tierHierarchy = { free: 0, lite: 1, pro: 2, business: 3 }
    return tierHierarchy[tier] >= tierHierarchy[requiredTier]
  }

  const upgradeTier = async (newTier: SubscriptionTier, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    if (isPaymentComingSoon) {
      throw new Error('Payment system is coming soon. Try again later.')
    }

    try {
      // TODO: Implement payment flow
      // 1. Create payment intent
      // 2. Show payment UI
      // 3. Process payment
      // 4. Update subscription in DB
      console.log('Upgrading to:', newTier, billingCycle)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed')
      throw err
    }
  }

  const cancelSubscription = async () => {
    if (isPaymentComingSoon) {
      throw new Error('Payment system is coming soon. Try again later.')
    }

    try {
      // TODO: Implement cancellation
      console.log('Cancelling subscription')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed')
      throw err
    }
  }

  const renewSubscription = async () => {
    if (isPaymentComingSoon) {
      throw new Error('Payment system is coming soon. Try again later.')
    }

    try {
      // TODO: Implement renewal
      console.log('Renewing subscription')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Renewal failed')
      throw err
    }
  }

  const initiatePayment = async (tier: SubscriptionTier, paymentMethod: string): Promise<PaymentIntent | null> => {
    if (isPaymentComingSoon) {
      console.warn('Payments coming soon')
      return null
    }

    try {
      // TODO: Implement payment initiation
      // 1. Call payment service
      // 2. Return payment intent
      console.log('Initiating payment:', tier, paymentMethod)
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed')
      return null
    }
  }

  const verifyPayment = async (paymentId: string): Promise<boolean> => {
    if (isPaymentComingSoon) {
      console.warn('Payments coming soon')
      return false
    }

    try {
      // TODO: Implement payment verification
      console.log('Verifying payment:', paymentId)
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment verification failed')
      return false
    }
  }

  const getPaymentStatus = async (paymentId: string): Promise<SubscriptionStatus> => {
    if (isPaymentComingSoon) {
      console.warn('Payments coming soon')
      return 'pending'
    }

    try {
      // TODO: Implement status checking
      console.log('Getting payment status:', paymentId)
      return 'pending'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status check failed')
      return 'pending'
    }
  }

  const getTierInfo = (t: SubscriptionTier) => {
    return TIER_FEATURES[t]
  }

  const getAllTiers = () => {
    return TIER_FEATURES
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        tier,
        isLoading,
        isPaymentComingSoon,
        error,
        canUseFeature,
        getFeatureValue,
        canAccessTier,
        upgradeTier,
        cancelSubscription,
        renewSubscription,
        initiatePayment,
        verifyPayment,
        getPaymentStatus,
        getTierInfo,
        getAllTiers,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}
