import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] Missing env variables — running without backend")
    return null
  }

  client = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return client
}

export const createClient = getSupabaseClient
