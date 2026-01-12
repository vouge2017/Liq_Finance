"use client"

import React from 'react'
import { useSubscription } from '@/context/SubscriptionContext'
import { TIER_FEATURES, SubscriptionTier } from '@/types/subscription'
import UpgradePrompt from '@/features/settings/components/UpgradePrompt'

interface FeatureGateProps {
  feature: keyof typeof TIER_FEATURES.free.features
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredTier?: SubscriptionTier
  onUpgradeClick?: () => void
  showPrompt?: boolean
}

/**
 * FeatureGate Component
 * 
 * Wraps features that require specific subscription tiers
 * Shows upgrade prompt if user doesn't have access
 * 
 * Usage:
 * <FeatureGate feature="canUploadCustomPhoto">
 *   <AvatarUploadWidget />
 * </FeatureGate>
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  requiredTier = 'lite',
  onUpgradeClick,
  showPrompt = true,
}) => {
  const { canUseFeature, tier, isPaymentComingSoon } = useSubscription()

  // If payment is coming soon, show children but with warning
  if (isPaymentComingSoon) {
    return (
      <>
        {children}
        {showPrompt && (
          <UpgradePrompt
            feature={feature}
            requiredTier={requiredTier}
            currentTier={tier}
            onUpgradeClick={onUpgradeClick}
            compact
          />
        )}
      </>
    )
  }

  // Check if user has access to this feature
  const hasAccess = canUseFeature(feature)

  if (!hasAccess) {
    // Find the minimum tier that has this feature
    let minRequiredTier = requiredTier
    for (const [tierName, tierFeatures] of Object.entries(TIER_FEATURES)) {
      if (tierFeatures.features[feature]) {
        minRequiredTier = tierName as SubscriptionTier
        break
      }
    }

    return (
      <>
        {fallback && fallback}
        {showPrompt && (
          <UpgradePrompt
            feature={feature}
            requiredTier={minRequiredTier}
            currentTier={tier}
            onUpgradeClick={onUpgradeClick}
          />
        )}
      </>
    )
  }

  // User has access, render the feature
  return <>{children}</>
}

export default FeatureGate
