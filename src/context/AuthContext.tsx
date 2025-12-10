"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // If supabase client is null (missing env vars), run in offline mode
        if (!supabase) {
            console.warn('[AuthContext] Supabase client unavailable. Running in offline mode.')
            setLoading(false)
            return
        }

        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession()
            if (error) throw error
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        setData()

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [supabase])

    const signOut = async () => {
        if (!supabase) {
            console.warn('[AuthContext] Cannot sign out: Supabase client unavailable.')
            return
        }
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
    }

    const value = {
        user,
        session,
        loading,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
