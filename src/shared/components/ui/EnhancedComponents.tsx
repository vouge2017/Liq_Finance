import React from 'react'
import { Icons } from '@/shared/components/Icons'

// Enhanced Button with better hover states and focus
interface EnhancedButtonProps {
    children: React.ReactNode
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    className?: string
    icon?: React.ReactNode
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    icon
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
        primary: 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black shadow-lg hover:shadow-xl focus:ring-cyan-500',
        secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 focus:ring-gray-500',
        ghost: 'hover:bg-gray-800 hover:bg-opacity-50 text-gray-300 hover:text-white focus:ring-gray-500'
    }

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    )
}

// Enhanced Card with better hover effects
interface EnhancedCardProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    hover?: boolean
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
    children,
    className = '',
    onClick,
    hover = true
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-theme-card border border-theme rounded-2xl p-6 transition-all duration-300
        ${hover ? 'card-enhanced' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

// Enhanced Input with better focus states
interface EnhancedInputProps {
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    className?: string
    label?: string
    error?: string
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    label,
    error
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-theme-secondary">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`
          w-full bg-theme-main border border-theme rounded-xl px-4 py-3
          text-theme-primary placeholder-gray-400
          transition-all duration-200
          focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
          ${className}
        `}
            />
            {error && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                    <Icons.Alert size={12} />
                    {error}
                </p>
            )}
        </div>
    )
}

// Enhanced Navigation Item
interface EnhancedNavItemProps {
    children: React.ReactNode
    onClick: () => void
    active?: boolean
    icon?: React.ReactNode
}

export const EnhancedNavItem: React.FC<EnhancedNavItemProps> = ({
    children,
    onClick,
    active = false,
    icon
}) => {
    return (
        <button
            onClick={onClick}
            className={`
        nav-item flex flex-col items-center gap-1 p-2 w-full
        ${active ? 'active' : ''}
      `}
        >
            {icon && (
                <div className={`p-2 rounded-xl transition-all ${active ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {icon}
                </div>
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-cyan-400' : 'text-gray-500'}`}>
                {children}
            </span>
        </button>
    )
}