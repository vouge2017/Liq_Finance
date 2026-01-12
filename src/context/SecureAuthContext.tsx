/**
 * Enhanced Authentication Context with Security Features
 * Integrates secure authentication service with React context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { secureAuthService, type SecureAuthResult } from '@/lib/security/secure-auth-service';
import { SecurityUtils, type PasswordStrength } from '@/lib/security/auth-security';
import * as dataService from '@/lib/supabase/data-service';
import { userProfileSchema } from '@/lib/validation';
import type { ThemeMode, CalendarMode } from '@/types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserProfile {
    id: string;
    full_name: string | null;
    phone: string | null;
    financial_goal: string | null;
    preferred_language: string;
    calendar_mode: string;
    theme: string;
    privacy_mode: boolean;
    ai_consent: boolean;
    onboarding_completed: boolean;
    budget_start_date: number;
}

interface RateLimitInfo {
    blocked: boolean;
    remaining: number;
    resetTime: number;
    nextAllowedTime?: number;
}

interface SecureAuthContextType {
    // User state
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;

    // Authentication methods with security
    signIn: (email: string, password: string) => Promise<{
        error?: string;
        rateLimitInfo?: RateLimitInfo;
        needsEmailConfirmation?: boolean;
    }>;
    signUp: (email: string, password: string, metadata?: any) => Promise<{
        error?: string;
        rateLimitInfo?: RateLimitInfo;
        passwordStrength?: PasswordStrength;
        needsEmailConfirmation?: boolean;
    }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{
        error?: string;
        rateLimitInfo?: RateLimitInfo;
    }>;

    // Profile methods
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
    completeOnboarding: () => Promise<void>;

    // Security utilities
    validatePassword: (password: string) => PasswordStrength;
    validateEmail: (email: string) => { valid: boolean; error?: string };
    getRateLimitStatus: (email: string, operation: 'LOGIN' | 'SIGNUP' | 'PASSWORD_RESET') => Promise<RateLimitInfo>;
    getSecurityEvents: () => any[];

    // Preferences
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    calendarMode: CalendarMode;
    setCalendarMode: (mode: CalendarMode) => void;
    isPrivacyMode: boolean;
    togglePrivacyMode: () => void;
    aiConsent: boolean;
    setAiConsent: (granted: boolean) => void;

    // User info
    userName: string;
    setUserName: (name: string) => void;
    userPhone: string;
    setUserPhone: (phone: string) => void;
    userGoal: string;
    setUserGoal: (goal: string) => void;
    budgetStartDate: number;
    setBudgetStartDate: (day: number) => void;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

interface SecureAuthProviderProps {
    children: React.ReactNode;
}

export const SecureAuthProvider: React.FC<SecureAuthProviderProps> = ({ children }) => {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // UI Preferences
    const [theme, setThemeState] = useState<ThemeMode>('dark');
    const [calendarMode, setCalendarModeState] = useState<CalendarMode>('gregorian');
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const [aiConsent, setAiConsentState] = useState(false);

    // User info
    const [userName, setUserNameState] = useState('');
    const [userPhone, setUserPhoneState] = useState('');
    const [userGoal, setUserGoalState] = useState('');
    const [budgetStartDate, setBudgetStartDateState] = useState(1);

    // Get client info for security logging
    const clientInfo = secureAuthService.getClientInfo();

    // Initialize Supabase auth listener
    useEffect(() => {
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadUserProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (userId: string) => {
        try {
            const profileData = await dataService.getProfile(userId);
            if (profileData) {
                setProfile(profileData);

                // Update local state from profile
                setUserNameState(profileData.full_name || '');
                setUserPhoneState(profileData.phone || '');
                setUserGoalState(profileData.financial_goal || '');
                setBudgetStartDateState(profileData.budget_start_date || 1);
                setThemeState((profileData.theme as ThemeMode) || 'dark');
                setCalendarModeState((profileData.calendar_mode as CalendarMode) || 'gregorian');
                setIsPrivacyMode(profileData.privacy_mode || false);
                setAiConsentState(profileData.ai_consent || false);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const result = await secureAuthService.secureSignIn(
                email,
                password,
                {
                    ...clientInfo,
                    validatePassword: false // Don't validate password on login
                }
            );

            if (result.success && result.data?.user) {
                setUser(result.data.user);
                if (result.data.user) {
                    await loadUserProfile(result.data.user.id);
                }
                return {};
            } else {
                const rateLimitInfo: RateLimitInfo | undefined = result.data ? {
                    blocked: result.data.rateLimited || false,
                    remaining: 0,
                    resetTime: result.data.nextAllowedTime || Date.now(),
                    nextAllowedTime: result.data.nextAllowedTime
                } : undefined;

                return {
                    error: result.error,
                    rateLimitInfo
                };
            }
        } catch (error) {
            return { error: 'An unexpected error occurred during sign in' };
        }
    }, [clientInfo]);

    const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
        try {
            const result = await secureAuthService.secureSignUp(
                email,
                password,
                metadata,
                {
                    ...clientInfo,
                    validatePassword: true,
                    requireStrongPassword: true
                }
            );

            if (result.success) {
                // Don't automatically set user on signup - wait for email confirmation
                return {
                    needsEmailConfirmation: result.data?.needsEmailConfirmation,
                    passwordStrength: result.data?.passwordStrength
                };
            } else {
                const rateLimitInfo: RateLimitInfo | undefined = result.data ? {
                    blocked: result.data.rateLimited || false,
                    remaining: 0,
                    resetTime: result.data.nextAllowedTime || Date.now(),
                    nextAllowedTime: result.data.nextAllowedTime
                } : undefined;

                return {
                    error: result.error,
                    rateLimitInfo,
                    passwordStrength: result.data?.passwordStrength
                };
            }
        } catch (error) {
            return { error: 'An unexpected error occurred during sign up' };
        }
    }, [clientInfo]);

    const signOut = useCallback(async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
            // Clear local state
            setUser(null);
            setProfile(null);
            setUserNameState('');
            setUserPhoneState('');
            setUserGoalState('');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        try {
            const result = await secureAuthService.securePasswordReset(
                email,
                clientInfo
            );

            if (result.success) {
                return {};
            } else {
                const rateLimitInfo: RateLimitInfo | undefined = result.data ? {
                    blocked: result.data.rateLimited || false,
                    remaining: 0,
                    resetTime: result.data.nextAllowedTime || Date.now(),
                    nextAllowedTime: result.data.nextAllowedTime
                } : undefined;

                return {
                    error: result.error,
                    rateLimitInfo
                };
            }
        } catch (error) {
            return { error: 'An unexpected error occurred during password reset' };
        }
    }, [clientInfo]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            // Validate updates using our schema
            const validation = userProfileSchema.safeParse(updates);
            if (!validation.success) {
                return { error: 'Invalid profile data' };
            }

            const success = await dataService.upsertProfile(user.id, updates);
            if (success) {
                setProfile(prev => prev ? { ...prev, ...updates } : null);
                return {};
            }
            return { error: 'Failed to update profile' };
        } catch (error) {
            return { error: 'An unexpected error occurred' };
        }
    }, [user]);

    const completeOnboarding = useCallback(async () => {
        if (!user) return;

        await dataService.upsertProfile(user.id, { onboarding_completed: true });
        setProfile(prev => prev ? { ...prev, onboarding_completed: true } : null);
    }, [user]);

    // Security utilities
    const validatePassword = useCallback((password: string) => {
        return SecurityUtils.validatePasswordStrength(password);
    }, []);

    const validateEmail = useCallback((email: string) => {
        return SecurityUtils.validateEmail(email);
    }, []);

    const getRateLimitStatus = useCallback(async (
        email: string,
        operation: 'LOGIN' | 'SIGNUP' | 'PASSWORD_RESET'
    ): Promise<{ blocked: boolean; remaining: number; resetTime: number }> => {
        const status = await secureAuthService.getRateLimitStatus(email, operation, clientInfo.ipAddress);
        return {
            blocked: status.blocked,
            remaining: status.remaining,
            resetTime: status.resetTime
        };
    }, [clientInfo.ipAddress]);

    const getSecurityEvents = useCallback(() => {
        return secureAuthService.getSecurityEvents({
            since: Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
        });
    }, []);

    // Preference setters that persist to database
    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme);
        if (user) {
            dataService.upsertProfile(user.id, { theme: newTheme });
        }
    }, [user]);

    const setCalendarMode = useCallback((mode: CalendarMode) => {
        setCalendarModeState(mode);
        if (user) {
            dataService.upsertProfile(user.id, { calendar_mode: mode });
        }
    }, [user]);

    const togglePrivacyMode = useCallback(() => {
        const newValue = !isPrivacyMode;
        setIsPrivacyMode(newValue);
        if (user) {
            dataService.upsertProfile(user.id, { privacy_mode: newValue });
        }
    }, [user, isPrivacyMode]);

    const setAiConsent = useCallback((granted: boolean) => {
        setAiConsentState(granted);
        if (user) {
            dataService.upsertProfile(user.id, { ai_consent: granted });
        }
    }, [user]);

    // User info setters that persist to database
    const setUserName = useCallback((name: string) => {
        setUserNameState(name);
        if (user) {
            dataService.upsertProfile(user.id, { full_name: name });
        }
    }, [user]);

    const setUserPhone = useCallback((phone: string) => {
        setUserPhoneState(phone);
        if (user) {
            dataService.upsertProfile(user.id, { phone });
        }
    }, [user]);

    const setUserGoal = useCallback((goal: string) => {
        setUserGoalState(goal);
        if (user) {
            dataService.upsertProfile(user.id, { financial_goal: goal });
        }
    }, [user]);

    const setBudgetStartDate = useCallback((day: number) => {
        setBudgetStartDateState(day);
        if (user) {
            dataService.upsertProfile(user.id, { budget_start_date: day });
        }
    }, [user]);

    const value: SecureAuthContextType = {
        // User state
        user,
        profile,
        loading,

        // Authentication methods
        signIn,
        signUp,
        signOut,
        resetPassword,

        // Profile methods
        updateProfile,
        completeOnboarding,

        // Security utilities
        validatePassword,
        validateEmail,
        getRateLimitStatus,
        getSecurityEvents,

        // Preferences
        theme,
        setTheme,
        calendarMode,
        setCalendarMode,
        isPrivacyMode,
        togglePrivacyMode,
        aiConsent,
        setAiConsent,

        // User info
        userName,
        setUserName,
        userPhone,
        setUserPhone,
        userGoal,
        setUserGoal,
        budgetStartDate,
        setBudgetStartDate,
    };

    return <SecureAuthContext.Provider value={value}>{children}</SecureAuthContext.Provider>;
};

export const useSecureAuth = () => {
    const context = useContext(SecureAuthContext);
    if (context === undefined) {
        throw new Error('useSecureAuth must be used within a SecureAuthProvider');
    }
    return context;
};