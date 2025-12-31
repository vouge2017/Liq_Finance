/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Stitch Design Palette
                'primary': '#135bec',
                'primary-dark': '#0e46b9',
                'background-light': '#f6f6f8',
                'background-dark': '#101622',
                'surface-light': '#ffffff',
                'surface-dark': '#1a2230',
                // Ethiopian Color Semantics
                'ethiopian': {
                    'blue': '#00b4d8',
                    'blue-hover': '#0096c7',
                    'green': '#10b981',
                    'green-hover': '#059669',
                    'yellow': '#f59e0b',
                    'yellow-hover': '#d97706',
                    'red': '#ef4444',
                    'red-hover': '#dc2626',
                },
                // Surface elevation colors
                'surface': {
                    'main': 'var(--bg-main)',
                    'card': 'var(--bg-card)',
                    'elevated': 'var(--bg-elevated)',
                    'dropdown': 'var(--bg-dropdown)',
                }
            },
            fontFamily: {
                'display': ['Manrope', 'sans-serif'],
                'ethiopic': ['Noto Sans Ethiopic', 'sans-serif'],
            },
            fontSize: {
                'hero': ['48px', '56px'],
                'primary-heading': ['24px', '32px'],
                'secondary-heading': ['18px', '24px'],
                'body': ['16px', '24px'],
                'label': ['14px', '20px'],
                'caption': ['12px', '16px'],
            },
            borderRadius: {
                'DEFAULT': '1rem',
                'lg': '1.5rem',
                'xl': '2rem',
                '2xl': '2.5rem',
                '3xl': '3rem',
                'full': '9999px',
            },
            spacing: {
                '0': '0',
                '1': '4px',
                '2': '8px',
                '3': '12px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '8': '32px',
                '10': '40px',
                '12': '48px',
                '14': '56px',
                '16': '64px',
                '20': '80px',
                '24': '96px',
            },
            height: {
                'touch-min': '44px',
                'button-primary': '56px',
                'button-secondary': '48px',
                'button-tertiary': '40px',
            },
            minHeight: {
                'touch-target': '44px',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(19, 91, 236, 0.3)',
                'glow-lg': '0 15px 40px -10px rgba(19, 91, 236, 0.4)',
                'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'elevation-2': '0 2px 4px rgba(0, 0, 0, 0.1)',
                'elevation-3': '0 4px 8px rgba(0, 0, 0, 0.15)',
                'elevation-4': '0 8px 16px rgba(0, 0, 0, 0.2)',
                'elevation-5': '0 12px 24px rgba(0, 0, 0, 0.25)',
                'glow-primary': '0 0 15px rgba(6, 182, 212, 0.5)',
                'glow-success': '0 0 15px rgba(16, 185, 129, 0.5)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-slower': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}