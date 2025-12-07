import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                      process.env.NEXT_PUBLIC_SUPABASE_URL
  
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. App will run in offline mode.')
    // Return a mock client that won't break the app
    return null as any
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return client
}
