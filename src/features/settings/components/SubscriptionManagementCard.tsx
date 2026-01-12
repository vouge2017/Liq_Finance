"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'
import { useSubscription } from '@/context/SubscriptionContext'
import { TIER_FEATURES } from '@/types/subscription'

export const SubscriptionManagementCard: React.FC = () => {
  const { subscription, tier, isPaymentComingSoon } = useSubscription()

  const tierInfo = TIER_FEATURES[tier]

  return (
    <div className="space-y-4">
      {/* Current Plan Card */}
      <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {tierInfo.name} Plan
              </h3>
              {tier === 'free' && <span className="text-[10px] font-bold text-gray-500">DEFAULT</span>}
              {tier !== 'free' && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-600 text-[10px] font-bold rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tierInfo.description}</p>
          </div>
        </div>

        {/* Coming Soon Banner */}
        {isPaymentComingSoon && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Icons.Clock size={16} className="text-amber-600" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-200">
                  Premium features coming soon
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-300">
                  Payment system launching soon. Stay tuned!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Price */}
        {tier === 'free' ? (
          <div className="mb-4">
            <p className="text-3xl font-black text-gray-900 dark:text-white">FREE</p>
            <p className="text-xs text-gray-500 mt-1">All essential features included</p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {tierInfo.monthlyPrice}
              </span>
              <span className="text-gray-500">ETB/month</span>
            </div>
            {subscription && (
              <p className="text-xs text-gray-500 mt-2">
                Renews on {new Date(subscription.renewalDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        )}

        {/* Features List */}
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Includes:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(tierInfo.features)
              .filter(([key, value]) => {
                if (typeof value === 'boolean') return value
                if (typeof value === 'number') return value > 0
                return false
              })
              .slice(0, 6)
              .map(([key]) => (
                <div key={key} className="flex items-start gap-2">
                  <Icons.Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {key
                      .replace(/^(can|has|max)/, '')
                      .replace(/([A-Z])/g, ' $1')
                      .trim()}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        {!isPaymentComingSoon && tier !== 'business' && (
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-2">
            <button className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
              {tier === 'free' ? 'View Plans' : 'Upgrade Plan'}
            </button>
          </div>
        )}

        {/* Coming Soon Actions */}
        {isPaymentComingSoon && (
          <div className="pt-4 border-t border-gray-100 dark:border-white/10">
            <button
              disabled
              className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed opacity-50"
            >
              Upgrade (Coming Soon)
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-2">
              Payment system will be available soon
            </p>
          </div>
        )}
      </div>

      {/* Tier Comparison Info */}
      {tier === 'free' && !isPaymentComingSoon && (
        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
            Ready to unlock premium features?
          </h4>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Photo Upload</span>
              <span className="font-bold text-blue-600">Lite+</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Unlimited Groups</span>
              <span className="font-bold text-orange-600">Pro+</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Advanced Analytics</span>
              <span className="font-bold text-orange-600">Pro+</span>
            </div>
          </div>
          <button className="w-full py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
            Compare Plans
          </button>
        </div>
      )}

      {/* Coming Soon Notice */}
      {isPaymentComingSoon && (
        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Icons.Zap size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-100 mb-1">
                Premium Launch Coming Soon
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-200 mb-3">
                We're building an amazing premium experience with:
              </p>
              <ul className="space-y-1 mb-3">
                <li className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Custom photo uploads
                </li>
                <li className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Cloud backup & sync
                </li>
                <li className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Advanced analytics
                </li>
              </ul>
              <p className="text-[10px] text-amber-700 dark:text-amber-300">
                Be the first to know when it launches. Check back soon!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionManagementCard
