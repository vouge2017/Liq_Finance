/**
 * useSettings Hook
 * Frontend hook for settings API integration
 */

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface UserPreferences {
  language: 'en' | 'am'
  calendarMode: 'gregorian' | 'ethiopian'
  currency: string
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface UserProfile {
  full_name?: string
  phone?: string
  bio?: string
  avatar_url?: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface UserSecurity {
  pin?: string
  biometric_enabled?: boolean
  two_fa_enabled?: boolean
  two_fa_method?: string
}

interface SettingsState {
  preferences: UserPreferences | null
  profile: UserProfile | null
  security: UserSecurity | null
  loading: boolean
  error: string | null
}

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001'

export function useSettings() {
  const { user, getToken } = useAuth()
  const [state, setState] = useState<SettingsState>({
    preferences: null,
    profile: null,
    security: null,
    loading: false,
    error: null,
  })

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const fetchAllSettings = useCallback(async () => {
    if (!user) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const token = await getToken()
      const response = await fetch(`${API_BASE}/api/settings/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`)
      }

      const data = await response.json()

      setState((prev) => ({
        ...prev,
        preferences: data.data.preferences,
        profile: data.data.profile,
        security: data.data.security,
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

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      if (!user) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const token = await getToken()
        const response = await fetch(`${API_BASE}/api/settings/preferences`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        })

        if (!response.ok) {
          throw new Error(`Failed to update preferences: ${response.statusText}`)
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          preferences: { ...prev.preferences, ...data.data },
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

  const updateProfile = useCallback(
    async (profile: Partial<UserProfile>) => {
      if (!user) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const token = await getToken()
        const response = await fetch(`${API_BASE}/api/settings/profile`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        })

        if (!response.ok) {
          throw new Error(`Failed to update profile: ${response.statusText}`)
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...data.data },
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

  const updateSecurity = useCallback(
    async (security: Partial<UserSecurity>) => {
      if (!user) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const token = await getToken()
        const response = await fetch(`${API_BASE}/api/settings/security`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(security),
        })

        if (!response.ok) {
          throw new Error(`Failed to update security settings: ${response.statusText}`)
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          security: { ...prev.security, ...data.data },
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

  return {
    preferences: state.preferences,
    profile: state.profile,
    security: state.security,
    loading: state.loading,
    error: state.error,
    fetchAllSettings,
    updatePreferences,
    updateProfile,
    updateSecurity,
  }
}
