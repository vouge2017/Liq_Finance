// Security Headers Configuration
// Add these headers to your deployment configuration

export const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Note: unsafe-eval needed for Vite dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co https://api.gemini.com",
        "font-src 'self' https://fonts.gstatic.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; '),

    // X-Content-Type-Options
    'X-Content-Type-Options': 'nosniff',

    // X-Frame-Options
    'X-Frame-Options': 'DENY',

    // X-XSS-Protection
    'X-XSS-Protection': '1; mode=block',

    // Strict-Transport-Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Referrer-Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions-Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}

// For Vercel deployment, add to vercel.json:
/*
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.gemini.com; font-src 'self' https://fonts.gstatic.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
*/

// For Netlify, add to _headers file:
/*
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.gemini.com; font-src 'self' https://fonts.gstatic.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'
*/