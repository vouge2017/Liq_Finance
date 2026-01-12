/**
 * Settings API Routes
 * Handles user settings, preferences, and profile management
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthenticatedRequest, requireUserMatch } from '../middleware/auth'
import { validateBody, validateParams } from '../middleware/validation'
import { getSupabaseAdmin, verifyUser } from '../supabase'
import { NotFoundError, ValidationError, AuthorizationError } from '../errors'
import { logger } from '../logger'

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

/**
 * Validation schemas
 */
const PreferencesSchema = z.object({
  language: z.enum(['en', 'am']).optional(),
  calendarMode: z.enum(['gregorian', 'ethiopian']).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
})

const ProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().regex(/^[\d\-\+\(\)\s]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
})

const SecuritySchema = z.object({
  pin: z.string().regex(/^\d{4}$/).optional(),
  biometric_enabled: z.boolean().optional(),
  two_fa_enabled: z.boolean().optional(),
})

/**
 * GET /api/settings/preferences
 * Get user preferences
 */
router.get('/preferences', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new AuthorizationError()

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const preferences = data || {
      user_id: userId,
      language: 'en',
      calendarMode: 'gregorian',
      currency: 'ETB',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    }

    res.json({
      status: 200,
      data: preferences,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/settings/preferences
 * Update user preferences
 */
router.put(
  '/preferences',
  validateBody(PreferencesSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) throw new AuthorizationError()

      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            ...req.body,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single()

      if (error) throw error

      logger.info('User preferences updated', { userId })

      res.json({
        status: 200,
        message: 'Preferences updated successfully',
        data,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * GET /api/settings/profile
 * Get user profile
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new AuthorizationError()

    const user = await verifyUser(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    const supabase = getSupabaseAdmin()
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const userProfile = profile || {
      user_id: userId,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      phone: '',
      bio: '',
      avatar_url: user.user_metadata?.avatar_url || '',
      created_at: user.created_at,
      updated_at: user.updated_at,
    }

    res.json({
      status: 200,
      data: userProfile,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/settings/profile
 * Update user profile
 */
router.put(
  '/profile',
  validateBody(ProfileSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) throw new AuthorizationError()

      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            ...req.body,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single()

      if (error) throw error

      logger.info('User profile updated', { userId })

      res.json({
        status: 200,
        message: 'Profile updated successfully',
        data,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * PUT /api/settings/security
 * Update security settings
 */
router.put(
  '/security',
  validateBody(SecuritySchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) throw new AuthorizationError()

      const supabase = getSupabaseAdmin()

      // Get or create security record
      const { data: existing } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data, error } = await supabase
        .from('user_security')
        .upsert(
          {
            user_id: userId,
            ...req.body,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single()

      if (error) throw error

      logger.info('User security settings updated', { userId })

      res.json({
        status: 200,
        message: 'Security settings updated successfully',
        data: {
          ...data,
          // Don't return sensitive PIN information
          pin: undefined,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * GET /api/settings/all
 * Get all user settings (preferences, profile, security)
 */
router.get('/all', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new AuthorizationError()

    const supabase = getSupabaseAdmin()

    // Fetch all settings in parallel
    const [prefsResult, profileResult, securityResult] = await Promise.all([
      supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_security').select('*').eq('user_id', userId).single(),
    ])

    const preferences = prefsResult.data || {
      language: 'en',
      calendarMode: 'gregorian',
      currency: 'ETB',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    }

    const profile = profileResult.data || {
      full_name: '',
      phone: '',
      bio: '',
      avatar_url: '',
    }

    const security = securityResult.data || {
      pin: null,
      biometric_enabled: false,
      two_fa_enabled: false,
    }

    res.json({
      status: 200,
      data: {
        preferences,
        profile,
        security: {
          ...security,
          pin: undefined, // Don't return PIN
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
