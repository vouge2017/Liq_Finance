import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import * as dataService from '@/lib/supabase/data-service';
import { userProfileSchema } from '@/lib/validation';
import type { ThemeMode, CalendarMode } from '@/types';

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

interface AuthContextType {
    // User state
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;

    // Authentication methods
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error?: string }>;

    // Profile methods
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
    completeOnboarding: () => Promise<void>;

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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

    // Initialize Supabase auth listener
    useEffect(() => {
        const supabase = createClient();
        if (!supabase) {
            console.warn('Supabase not configured. Running in offline mode.');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
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
        const supabase = createClient();
        if (!supabase) {
            return { error: 'Authentication not configured' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error: error.message };
            }

            // Log successful login
            if (data?.user?.id) {
                await dataService.logAuditEvent(data.user.id, 'login_success', {
                    status: 'success',
                    details: { email },
                });
            }

            return {};
        } catch (error) {
            return { error: 'An unexpected error occurred' };
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
        const supabase = createClient();
        if (!supabase) {
            return { error: 'Authentication not configured' };
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) {
                return { error: error.message };
            }

            return {};
        } catch (error) {
            return { error: 'An unexpected error occurred' };
        }
    }, []);

    const signOut = useCallback(async () => {
        // Log logout before signing out
        if (user?.id) {
            await dataService.logAuditEvent(user.id, 'logout', {
                status: 'success',
            });
        }

        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        // Clear local state
        setUser(null);
        setProfile(null);
        setUserNameState('');
        setUserPhoneState('');
        setUserGoalState('');
    }, [user]);

    const resetPassword = useCallback(async (email: string) => {
        const supabase = createClient();
        if (!supabase) {
            return { error: 'Authentication not configured' };
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                return { error: error.message };
            }
            return {};
        } catch (error) {
            return { error: 'An unexpected error occurred' };
        }
    }, []);

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

    const value: AuthContextType = {
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
