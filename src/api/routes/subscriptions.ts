/**
 * Subscriptions API Routes
 * Handles subscription management without payment gateway integration
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { subscriptionOps, billingHistoryOps } from '../supabase'
import { NotFoundError, ValidationError, ConflictError } from '../errors'
import { logger } from '../logger'

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

/**
 * Validation schemas
 */
const SubscriptionTierSchema = z.enum(['free', 'lite', 'pro', 'business'])

const CreateSubscriptionSchema = z.object({
  tier: SubscriptionTierSchema,
  billing_cycle: z.enum(['monthly', 'annual']),
  payment_method: z.enum(['telebirr', 'cbe', 'card', 'stripe']).optional(),
})

const UpgradeSubscriptionSchema = z.object({
  tier: SubscriptionTierSchema,
})

/**
 * Subscription tier prices (in ETB)
 */
const TIER_PRICES = {
  free: 0,
  lite: 99,
  pro: 299,
  business: 999,
}

const RENEWAL_DAYS = {
  monthly: 30,
  annual: 365,
}

/**
 * GET /api/subscriptions/current
 * Get user's current subscription
 */
router.get('/current', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new Error('User not authenticated')

    const subscription = await subscriptionOps.getByUserId(userId)

    if (!subscription) {
      // Return default free tier
      return res.json({
        status: 200,
        data: {
          tier: 'free',
          status: 'active',
          auto_renew: false,
          features: getFeaturesForTier('free'),
        },
      })
    }

    res.json({
      status: 200,
      data: {
        ...subscription,
        features: getFeaturesForTier(subscription.tier),
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/subscriptions/create
 * Create a new subscription (free tier)
 */
router.post(
  '/create',
  validateBody(CreateSubscriptionSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) throw new Error('User not authenticated')

      const { tier, billing_cycle, payment_method } = req.body

      // Check for existing subscription
      const existing = await subscriptionOps.getByUserId(userId)
      if (existing) {
        throw new ConflictError('User already has an active subscription')
      }

      // For non-free tiers, would require payment processing
      if (tier !== 'free') {
        return res.status(402).json({
          status: 402,
          code: 'PAYMENT_REQUIRED',
          message: 'Payment processing not available in this demo',
          details: {
            tier,
            amount: TIER_PRICES[tier as keyof typeof TIER_PRICES],
            currency: 'ETB',
          },
        })
      }

      const renewalDate = new Date()
      renewalDate.setDate(renewalDate.getDate() + RENEWAL_DAYS[billing_cycle as keyof typeof RENEWAL_DAYS])

      const subscription = await subscriptionOps.create(userId, {
        tier,
        status: 'active',
        billing_cycle,
        payment_method: payment_method || null,
        auto_renew: false,
        price: TIER_PRICES[tier as keyof typeof TIER_PRICES],
        renewal_date: renewalDate.toISOString(),
      })

      // Log billing event
      await billingHistoryOps.create(userId, {
        subscription_id: subscription.id,
        event_type: 'subscription_created',
        tier_before: 'none',
        tier_after: tier,
        status: 'completed',
      })

      logger.info('Subscription created', { userId, tier })

      res.status(201).json({
        status: 201,
        message: 'Subscription created successfully',
        data: {
          ...subscription,
          features: getFeaturesForTier(tier),
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * POST /api/subscriptions/upgrade
 * Upgrade subscription tier
 */
router.post(
  '/upgrade',
  validateBody(UpgradeSubscriptionSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) throw new Error('User not authenticated')

      const { tier } = req.body

      const subscription = await subscriptionOps.getByUserId(userId)
      if (!subscription) {
        throw new NotFoundError('Subscription')
      }

      // Check if upgrading to same or lower tier
      const tierOrder = ['free', 'lite', 'pro', 'business']
      const currentIndex = tierOrder.indexOf(subscription.tier)
      const newIndex = tierOrder.indexOf(tier)

      if (newIndex <= currentIndex) {
        throw new ValidationError('Can only upgrade to a higher tier')
      }

      // For non-free upgrades, would require payment processing
      if (tier !== 'free') {
        return res.status(402).json({
          status: 402,
          code: 'PAYMENT_REQUIRED',
          message: 'Payment processing not available in this demo',
          details: {
            from_tier: subscription.tier,
            to_tier: tier,
            amount: TIER_PRICES[tier as keyof typeof TIER_PRICES],
            currency: 'ETB',
          },
        })
      }

      const updated = await subscriptionOps.update(subscription.id, {
        tier,
        status: 'active',
      })

      // Log billing event
      await billingHistoryOps.create(userId, {
        subscription_id: subscription.id,
        event_type: 'upgrade',
        tier_before: subscription.tier,
        tier_after: tier,
        amount: Math.abs(TIER_PRICES[tier as keyof typeof TIER_PRICES] - subscription.price),
      })

      logger.info('Subscription upgraded', { userId, from: subscription.tier, to: tier })

      res.json({
        status: 200,
        message: 'Subscription upgraded successfully',
        data: {
          ...updated,
          features: getFeaturesForTier(tier),
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 */
router.post('/cancel', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new Error('User not authenticated')

    const subscription = await subscriptionOps.getByUserId(userId)
    if (!subscription) {
      throw new NotFoundError('Subscription')
    }

    const updated = await subscriptionOps.update(subscription.id, {
      status: 'cancelled',
      auto_renew: false,
    })

    // Log billing event
    await billingHistoryOps.create(userId, {
      subscription_id: subscription.id,
      event_type: 'cancellation',
      tier_before: subscription.tier,
      tier_after: 'free',
      status: 'completed',
    })

    logger.info('Subscription cancelled', { userId })

    res.json({
      status: 200,
      message: 'Subscription cancelled successfully',
      data: {
        ...updated,
        features: getFeaturesForTier('free'),
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/subscriptions/billing-history
 * Get user's billing history
 */
router.get('/billing-history', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new Error('User not authenticated')

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const history = await billingHistoryOps.getByUserId(userId, limit)

    res.json({
      status: 200,
      data: history,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/subscriptions/features/:tier
 * Get features for a subscription tier
 */
router.get('/features/:tier', (req: Request, res: Response) => {
  const { tier } = req.params

  if (!['free', 'lite', 'pro', 'business'].includes(tier)) {
    return res.status(400).json({
      status: 400,
      code: 'INVALID_TIER',
      message: 'Invalid subscription tier',
    })
  }

  const features = getFeaturesForTier(tier as any)

  res.json({
    status: 200,
    data: {
      tier,
      price: TIER_PRICES[tier as keyof typeof TIER_PRICES],
      currency: 'ETB',
      billing_cycles: ['monthly', 'annual'],
      features,
    },
  })
})

/**
 * Helper function to get features for a tier
 */
function getFeaturesForTier(tier: string) {
  const features: Record<string, any> = {
    free: {
      maxTransactions: 50,
      maxBudgets: 1,
      aiAnalysis: false,
      voiceInput: false,
      receiptScanning: false,
      advancedReporting: false,
      prioritySupport: false,
    },
    lite: {
      maxTransactions: 500,
      maxBudgets: 5,
      aiAnalysis: true,
      voiceInput: true,
      receiptScanning: false,
      advancedReporting: false,
      prioritySupport: false,
    },
    pro: {
      maxTransactions: 5000,
      maxBudgets: 20,
      aiAnalysis: true,
      voiceInput: true,
      receiptScanning: true,
      advancedReporting: true,
      prioritySupport: false,
    },
    business: {
      maxTransactions: -1, // unlimited
      maxBudgets: -1,
      aiAnalysis: true,
      voiceInput: true,
      receiptScanning: true,
      advancedReporting: true,
      prioritySupport: true,
    },
  }

  return features[tier] || features.free
}

export default router
