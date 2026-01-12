/**
 * Supabase Client
 * Server-side client for database operations
 */

import { createClient } from '@supabase/supabase-js'
import { config } from './config'
import { logger } from './logger'
import { DatabaseError } from './errors'

let supabaseAdmin: ReturnType<typeof createClient> | null = null

/**
 * Get or create Supabase admin client
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    } catch (error) {
      logger.error('Failed to initialize Supabase admin client', error instanceof Error ? error : new Error(String(error)))
      throw new DatabaseError('Failed to initialize database client')
    }
  }

  return supabaseAdmin
}

/**
 * Verify user exists in Supabase auth
 */
export async function verifyUser(userId: string) {
  try {
    const supabase = getSupabaseAdmin()
    const { data: user, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      logger.warn('User verification failed', { userId, error: error.message })
      return null
    }

    return user
  } catch (error) {
    logger.error('User verification error', error instanceof Error ? error : new Error(String(error)), { userId })
    throw new DatabaseError('Failed to verify user')
  }
}

/**
 * Subscription operations
 */
export const subscriptionOps = {
  async create(userId: string, data: Record<string, unknown>) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert([{ user_id: userId, ...data }])
        .select()
        .single()

      if (error) throw error
      return subscription
    } catch (error) {
      logger.error('Failed to create subscription', error instanceof Error ? error : new Error(String(error)), { userId })
      throw new DatabaseError('Failed to create subscription')
    }
  },

  async getByUserId(userId: string) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error
      }

      return subscription || null
    } catch (error) {
      logger.error('Failed to fetch subscription', error instanceof Error ? error : new Error(String(error)), { userId })
      throw new DatabaseError('Failed to fetch subscription')
    }
  },

  async update(subscriptionId: string, data: Record<string, unknown>) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .update(data)
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return subscription
    } catch (error) {
      logger.error('Failed to update subscription', error instanceof Error ? error : new Error(String(error)), { subscriptionId })
      throw new DatabaseError('Failed to update subscription')
    }
  },
}

/**
 * Invoice operations
 */
export const invoiceOps = {
  async create(userId: string, subscriptionId: string, data: Record<string, unknown>) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert([{ user_id: userId, subscription_id: subscriptionId, ...data }])
        .select()
        .single()

      if (error) throw error
      return invoice
    } catch (error) {
      logger.error('Failed to create invoice', error instanceof Error ? error : new Error(String(error)), { userId, subscriptionId })
      throw new DatabaseError('Failed to create invoice')
    }
  },

  async getBySubscriptionId(subscriptionId: string) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('issue_date', { ascending: false })

      if (error) throw error
      return invoices || []
    } catch (error) {
      logger.error('Failed to fetch invoices', error instanceof Error ? error : new Error(String(error)), { subscriptionId })
      throw new DatabaseError('Failed to fetch invoices')
    }
  },
}

/**
 * Payment intent operations
 */
export const paymentIntentOps = {
  async create(userId: string, data: Record<string, unknown>) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: intent, error } = await supabase
        .from('payment_intents')
        .insert([{ user_id: userId, ...data }])
        .select()
        .single()

      if (error) throw error
      return intent
    } catch (error) {
      logger.error('Failed to create payment intent', error instanceof Error ? error : new Error(String(error)), { userId })
      throw new DatabaseError('Failed to create payment intent')
    }
  },

  async getById(intentId: string) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: intent, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', intentId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return intent || null
    } catch (error) {
      logger.error('Failed to fetch payment intent', error instanceof Error ? error : new Error(String(error)), { intentId })
      throw new DatabaseError('Failed to fetch payment intent')
    }
  },

  async update(intentId: string, data: Record<string, unknown>) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: intent, error } = await supabase
        .from('payment_intents')
        .update(data)
        .eq('id', intentId)
        .select()
        .single()

      if (error) throw error
      return intent
    } catch (error) {
      logger.error('Failed to update payment intent', error instanceof Error ? error : new Error(String(error)), { intentId })
      throw new DatabaseError('Failed to update payment intent')
    }
  },
}

/**
 * Billing history operations
 */
export const billingHistoryOps = {
  async create(userId: string, data: Record<string, unknown>) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: entry, error } = await supabase
        .from('billing_history')
        .insert([{ user_id: userId, ...data }])
        .select()
        .single()

      if (error) throw error
      return entry
    } catch (error) {
      logger.error('Failed to create billing history entry', error instanceof Error ? error : new Error(String(error)), { userId })
      throw new DatabaseError('Failed to create billing history entry')
    }
  },

  async getByUserId(userId: string, limit = 50) {
    try {
      const supabase = getSupabaseAdmin()
      const { data: history, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return history || []
    } catch (error) {
      logger.error('Failed to fetch billing history', error instanceof Error ? error : new Error(String(error)), { userId })
      throw new DatabaseError('Failed to fetch billing history')
    }
  },
}
