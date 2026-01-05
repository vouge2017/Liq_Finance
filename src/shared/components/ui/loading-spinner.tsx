import React from 'react'
import { Icons } from '../Icons'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin`} />
      {text && <p className="text-theme-secondary text-sm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center p-6">
        {spinner}
      </div>
    )
  }

  return spinner
}

export function LoadingButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const { loading, ...buttonProps } = props as any
  return (
    <button
      {...buttonProps}
      disabled={loading || props.disabled}
      className={`${props.className || ''} relative ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <LoadingSpinner size="sm" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  )
}

