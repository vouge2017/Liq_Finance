/**
 * Centralized Design Tokens for Liq Finance
 * Single source of truth for all design values
 */

export const BORDER_RADIUS = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '16px',
  '2xl': '16px',
  '3xl': '20px',
  full: '9999px',
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const TYPOGRAPHY = {
  hero: { size: '48px', lineHeight: '56px', weight: 700 },
  primaryHeading: { size: '24px', lineHeight: '32px', weight: 600 },
  secondaryHeading: { size: '18px', lineHeight: '24px', weight: 600 },
  body: { size: '16px', lineHeight: '24px', weight: 400 },
  label: { size: '14px', lineHeight: '20px', weight: 500 },
  caption: { size: '12px', lineHeight: '16px', weight: 400 },
} as const;

export const BUTTON_HEIGHTS = {
  primary: '56px', // h-14
  secondary: '48px', // h-12
  tertiary: '40px', // h-10
  small: '40px', // h-10
} as const;

export const COLORS = {
  ethiopian: {
    blue: '#00b4d8',
    blueHover: '#0096c7',
    green: '#10b981',
    greenHover: '#059669',
    yellow: '#f59e0b',
    yellowHover: '#d97706',
    red: '#ef4444',
    redHover: '#dc2626',
  },
  dark: {
    bg: '#0f0f0f',
    card: '#1a1a1a',
    elevated: '#232323',
    dropdown: '#2d2d2d',
    border: '#2a2a2a',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
  },
  light: {
    bg: '#f9fafb',
    card: '#ffffff',
    elevated: '#f3f4f6',
    dropdown: '#ffffff',
    border: '#e5e7eb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
  },
} as const;

export const SHADOWS = {
  elevation1: '0 1px 2px rgba(0, 0, 0, 0.05)',
  elevation2: '0 2px 4px rgba(0, 0, 0, 0.1)',
  elevation3: '0 4px 8px rgba(0, 0, 0, 0.15)',
  elevation4: '0 8px 16px rgba(0, 0, 0, 0.2)',
  elevation5: '0 12px 24px rgba(0, 0, 0, 0.25)',
  glowPrimary: '0 0 15px rgba(6, 182, 212, 0.5)',
  glowSuccess: '0 0 15px rgba(16, 185, 129, 0.5)',
} as const;

export const ANIMATIONS = {
  timings: {
    fast: '100ms',
    quick: '200ms',
    standard: '300ms',
    slow: '400ms',
  },
  easings: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export const TOUCH_TARGET = {
  min: '44px',
  recommended: '56px',
} as const;

export const SCREEN_PADDING = {
  top: '16px',
  bottom: '88px',
  horizontal: '20px',
} as const;
