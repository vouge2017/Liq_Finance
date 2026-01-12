// types/subscription.ts

export type SubscriptionTier = 'free' | 'lite' | 'pro' | 'business'
export type PaymentMethod = 'telebirr' | 'cbe' | 'card' | 'stripe'
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'expired' | 'pending'

export interface TierFeatures {
  id: SubscriptionTier
  name: string
  description: string
  monthlyPrice: number // in ETB
  annualPrice?: number
  features: {
    // Profile & Avatar
    canUploadCustomPhoto: boolean
    canEditBio: boolean
    canChangeProfileFrame: boolean
    hasVerificationBadge: boolean
    canCustomizeProfileTheme: boolean

    // Backup & Restore
    hasCloudBackup: boolean
    hasAutoBackup: boolean
    backupRetentionDays: number
    canRestoreFromDate: boolean

    // Device Sync
    canSyncAcrossDevices: boolean
    canManageDevices: boolean
    canAutoLogin: boolean

    // Financial Tools
    maxIdirGroups: number
    maxIqubGroups: number
    canViewSubscriptions: boolean

    // Data Management
    canExportJSON: boolean
    canExportCSV: boolean
    canScheduleExports: boolean
    hasAccessToAPI: boolean

    // Analytics
    hasBasicAnalytics: boolean
    hasAdvancedAnalytics: boolean
    hasAIInsights: boolean
    hasSpendingTrends: boolean

    // Support
    supportLevel: 'email' | 'priority' | '24/7' | 'dedicated'
    hasVideoTutorials: boolean
    canContactSupport: boolean

    // Social/Growth
    canInviteFriends: boolean
    hasReferralRewards: boolean
    canJoinCommunity: boolean
  }
}

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  startDate: Date
  renewalDate: Date
  paymentMethod?: PaymentMethod
  autoRenew: boolean
  price: number
  billingCycle: 'monthly' | 'annual'
  paymentId?: string // External payment service ID
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  subscriptionId: string
  userId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  paymentMethod?: PaymentMethod
  transactionId?: string
  createdAt: Date
}

export interface PaymentIntent {
  id: string
  userId: string
  tier: SubscriptionTier
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paymentMethod: PaymentMethod
  paymentMethodDetails?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

// Tier features configuration
export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic personal finance tracking',
    monthlyPrice: 0,
    features: {
      canUploadCustomPhoto: false,
      canEditBio: false,
      canChangeProfileFrame: false,
      hasVerificationBadge: false,
      canCustomizeProfileTheme: false,

      hasCloudBackup: false,
      hasAutoBackup: false,
      backupRetentionDays: 0,
      canRestoreFromDate: false,

      canSyncAcrossDevices: false,
      canManageDevices: false,
      canAutoLogin: false,

      maxIdirGroups: 0,
      maxIqubGroups: 0,
      canViewSubscriptions: true,

      canExportJSON: true,
      canExportCSV: false,
      canScheduleExports: false,
      hasAccessToAPI: false,

      hasBasicAnalytics: true,
      hasAdvancedAnalytics: false,
      hasAIInsights: false,
      hasSpendingTrends: false,

      supportLevel: 'email',
      hasVideoTutorials: false,
      canContactSupport: true,

      canInviteFriends: true,
      hasReferralRewards: false,
      canJoinCommunity: false,
    },
  },

  lite: {
    id: 'lite',
    name: 'Lite',
    description: 'Perfect for individuals & families',
    monthlyPrice: 99,
    annualPrice: 1000,
    features: {
      canUploadCustomPhoto: true,
      canEditBio: true,
      canChangeProfileFrame: false,
      hasVerificationBadge: false,
      canCustomizeProfileTheme: false,

      hasCloudBackup: true,
      hasAutoBackup: true,
      backupRetentionDays: 30,
      canRestoreFromDate: false,

      canSyncAcrossDevices: true,
      canManageDevices: false,
      canAutoLogin: false,

      maxIdirGroups: 1,
      maxIqubGroups: 1,
      canViewSubscriptions: true,

      canExportJSON: true,
      canExportCSV: true,
      canScheduleExports: false,
      hasAccessToAPI: false,

      hasBasicAnalytics: true,
      hasAdvancedAnalytics: false,
      hasAIInsights: false,
      hasSpendingTrends: false,

      supportLevel: 'priority',
      hasVideoTutorials: true,
      canContactSupport: true,

      canInviteFriends: true,
      hasReferralRewards: true,
      canJoinCommunity: false,
    },
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious financial managers',
    monthlyPrice: 499,
    annualPrice: 4990,
    features: {
      canUploadCustomPhoto: true,
      canEditBio: true,
      canChangeProfileFrame: true,
      hasVerificationBadge: true,
      canCustomizeProfileTheme: true,

      hasCloudBackup: true,
      hasAutoBackup: true,
      backupRetentionDays: 365,
      canRestoreFromDate: true,

      canSyncAcrossDevices: true,
      canManageDevices: true,
      canAutoLogin: true,

      maxIdirGroups: 999,
      maxIqubGroups: 999,
      canViewSubscriptions: true,

      canExportJSON: true,
      canExportCSV: true,
      canScheduleExports: true,
      hasAccessToAPI: false,

      hasBasicAnalytics: true,
      hasAdvancedAnalytics: true,
      hasAIInsights: true,
      hasSpendingTrends: true,

      supportLevel: '24/7',
      hasVideoTutorials: true,
      canContactSupport: true,

      canInviteFriends: true,
      hasReferralRewards: true,
      canJoinCommunity: true,
    },
  },

  business: {
    id: 'business',
    name: 'Business',
    description: 'For cooperatives & organizations',
    monthlyPrice: 2999,
    annualPrice: 29990,
    features: {
      canUploadCustomPhoto: true,
      canEditBio: true,
      canChangeProfileFrame: true,
      hasVerificationBadge: true,
      canCustomizeProfileTheme: true,

      hasCloudBackup: true,
      hasAutoBackup: true,
      backupRetentionDays: 3650,
      canRestoreFromDate: true,

      canSyncAcrossDevices: true,
      canManageDevices: true,
      canAutoLogin: true,

      maxIdirGroups: 999,
      maxIqubGroups: 999,
      canViewSubscriptions: true,

      canExportJSON: true,
      canExportCSV: true,
      canScheduleExports: true,
      hasAccessToAPI: true,

      hasBasicAnalytics: true,
      hasAdvancedAnalytics: true,
      hasAIInsights: true,
      hasSpendingTrends: true,

      supportLevel: 'dedicated',
      hasVideoTutorials: true,
      canContactSupport: true,

      canInviteFriends: true,
      hasReferralRewards: true,
      canJoinCommunity: true,
    },
  },
}

// Price tiers list (for displaying)
export const TIERS: SubscriptionTier[] = ['free', 'lite', 'pro', 'business']

// Payment methods
export const PAYMENT_METHODS: Record<PaymentMethod, { name: string; icon: string; description: string }> = {
  telebirr: {
    name: 'Telebirr',
    icon: 'phone',
    description: 'Pay with Telebirr - No credit card needed',
  },
  cbe: {
    name: 'CBE Banking',
    icon: 'bank',
    description: 'Direct bank transfer from CBE account',
  },
  card: {
    name: 'Credit/Debit Card',
    icon: 'card',
    description: 'Visa, Mastercard, or other cards',
  },
  stripe: {
    name: 'Stripe',
    icon: 'credit',
    description: 'International payment via Stripe',
  },
}
