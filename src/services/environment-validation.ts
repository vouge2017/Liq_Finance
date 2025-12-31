// Environment Variable Validation
// Ensures all required environment variables are present

interface EnvironmentConfig {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    GEMINI_API_KEY?: string
}

class EnvironmentValidator {
    private requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
    private optionalVars = ['GEMINI_API_KEY']

    validate(): EnvironmentConfig {
        const config: EnvironmentConfig = {
            SUPABASE_URL: '',
            SUPABASE_ANON_KEY: '',
            GEMINI_API_KEY: undefined
        }

        // Check if we're in demo mode (client-side check)
        const isDemoMode = typeof window !== 'undefined' && import.meta.env?.VITE_DEMO_MODE === 'true'

        // Check required variables
        for (const varName of this.requiredVars) {
            const value = process.env[varName]
            if (!value && !isDemoMode) {
                throw new Error(`Missing required environment variable: ${varName}`)
            }
            // Clean up the value (remove quotes if present)
            const cleanValue = value ? value.replace(/['"]/g, '') : ''

            if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
                config.SUPABASE_URL = cleanValue
            } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
                config.SUPABASE_ANON_KEY = cleanValue
            }
        }

        // Check optional variables
        for (const varName of this.optionalVars) {
            const value = process.env[varName]
            if (value) {
                const cleanValue = value.replace(/['"]/g, '')
                if (varName === 'GEMINI_API_KEY') {
                    config.GEMINI_API_KEY = cleanValue
                }
            }
        }

        return config
    }

    validateSupabaseConfig(): boolean {
        try {
            const config = this.validate()
            return !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY
        } catch (error) {
            console.error('Supabase configuration error:', error)
            return false
        }
    }

    validateGeminiConfig(): boolean {
        try {
            const config = this.validate()
            return !!config.GEMINI_API_KEY
        } catch (error) {
            console.error('Gemini configuration error:', error)
            return false
        }
    }
}

export const environmentValidator = new EnvironmentValidator()

// Validate on app start
if (typeof window === 'undefined') {
    // Server-side validation
    try {
        environmentValidator.validate()
        console.log('✅ Environment variables validated successfully')
    } catch (error) {
        console.error('❌ Environment validation failed:', error)
        if (process.env.NODE_ENV === 'production') {
            process.exit(1)
        }
    }
}