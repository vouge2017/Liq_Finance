"use client"

import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'
import { useSubscription } from '@/context/SubscriptionContext'
import { TIER_FEATURES, SubscriptionTier } from '@/types/subscription'

interface UpgradePromptProps {
  feature: string // Human-readable feature name
  requiredTier: SubscriptionTier
  currentTier: SubscriptionTier
  onUpgradeClick?: () => void
  compact?: boolean
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredTier,
  currentTier,
  onUpgradeClick,
  compact = false,
}) => {
  const { isPaymentComingSoon } = useSubscription()
  const [showDetails, setShowDetails] = useState(false)

  const tierInfo = TIER_FEATURES[requiredTier]
  const tierHierarchy = { free: 0, lite: 1, pro: 2, business: 3 }
  const needsUpgrade = tierHierarchy[currentTier] < tierHierarchy[requiredTier]

  if (!needsUpgrade) {
    return null
  }

  return (
    <div
      className={`
        rounded-2xl border
        transition-all
        ${
          isPaymentComingSoon
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-blue-500/10 border-blue-500/20'
        }
      `}
    >
      <div className={compact ? 'p-3' : 'p-4'}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`
              rounded-lg flex items-center justify-center shrink-0
              ${
                isPaymentComingSoon
                  ? 'bg-amber-500/20 text-amber-600'
                  : 'bg-blue-500/20 text-blue-600'
              }
            `}
            style={{
              width: compact ? '32px' : '40px',
              height: compact ? '32px' : '40px',
            }}
          >
            {isPaymentComingSoon ? (
              <Icons.Clock size={compact ? 16 : 20} />
            ) : (
              <Icons.Lock size={compact ? 16 : 20} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`
                font-bold
                ${
                  isPaymentComingSoon
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-blue-900 dark:text-blue-100'
                }
                ${compact ? 'text-sm' : 'text-base'}
              `}
            >
              {isPaymentComingSoon ? 'Coming Soon' : `Unlock: ${feature}`}
            </h3>

            {/* Description */}
            {!compact && (
              <p
                className={`
                  text-sm mt-1
                  ${
                    isPaymentComingSoon
                      ? 'text-amber-800 dark:text-amber-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }
                `}
              >
                {isPaymentComingSoon
                  ? `${feature} will be available when premium features launch`
                  : `Upgrade to ${tierInfo.name} (${tierInfo.monthlyPrice} ETB/mo)`}
              </p>
            )}
          </div>
        </div>

        {/* Features included (if expanded) */}
        {!compact && showDetails && !isPaymentComingSoon && (
          <div className="mt-4 pt-4 border-t border-blue-500/20">
            <p className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-2">Includes:</p>
            <ul className="space-y-1 text-xs">
              {Object.entries(TIER_FEATURES[requiredTier].features)
                .filter(([key, value]) => {
                  if (typeof value === 'boolean') return value
                  if (typeof value === 'number') return value > 0
                  return false
                })
                .slice(0, 5)
                .map(([key]) => (
                  <li key={key} className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Icons.Check size={14} className="text-blue-600" />
                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {!compact && (
          <div className="mt-4 flex gap-2">
            {!isPaymentComingSoon && (
              <>
                <button
                  onClick={onUpgradeClick}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-3 py-2.5 bg-blue-500/20 text-blue-700 dark:text-blue-200 rounded-xl font-bold text-sm hover:bg-blue-500/30 transition-all"
                >
                  {showDetails ? <Icons.ChevronUp size={16} /> : <Icons.Info size={16} />}
                </button>
              </>
            )}

            {isPaymentComingSoon && (
              <button
                disabled
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm cursor-not-allowed opacity-50"
              >
                Coming Soon
              </button>
            )}
          </div>
        )}

        {/* Compact version action */}
        {compact && (
          <div className="mt-2">
            {isPaymentComingSoon ? (
              <span
                className={`
                  inline-block px-2 py-1 rounded-lg text-[10px] font-bold
                  bg-amber-500/20 text-amber-700 dark:text-amber-200
                `}
              >
                Coming Soon
              </span>
            ) : (
              <button
                onClick={onUpgradeClick}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Plans →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UpgradePrompt
