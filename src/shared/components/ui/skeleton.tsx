import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-theme-card border border-theme'
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: ''
  }

  const computedStyle: React.CSSProperties = { ...style }
  if (width) computedStyle.width = typeof width === 'number' ? `${width}px` : width
  if (height) computedStyle.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={computedStyle}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-theme-card rounded-3xl p-6 mb-6 border border-theme">
      <Skeleton variant="text" width="40%" height={16} className="mb-4" />
      <Skeleton variant="text" width="60%" height={32} className="mb-6" />
      <div className="flex gap-4">
        <Skeleton variant="rectangular" width="48%" height={60} />
        <Skeleton variant="rectangular" width="48%" height={60} />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-theme-card rounded-2xl p-4 mb-3 border border-theme flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" height={16} className="mb-2" />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
          <Skeleton variant="text" width={80} height={20} />
        </div>
      ))}
    </>
  )
}
