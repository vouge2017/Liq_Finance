"use client"

import React from 'react'
import { Icons } from '@/shared/components/Icons'

interface NotificationBadgeProps {
    count: number
    max?: number
    variant?: 'default' | 'danger' | 'warning'
    size?: 'sm' | 'md' | 'lg'
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    max = 99,
    variant = 'danger',
    size = 'md'
}) => {
    if (count <= 0) return null

    const sizeClasses = {
        sm: 'w-4 h-4 text-[9px]',
        md: 'w-5 h-5 text-[10px]',
        lg: 'w-6 h-6 text-xs',
    }

    const variantClasses = {
        default: 'bg-primary text-white',
        danger: 'bg-rose-500 text-white',
        warning: 'bg-amber-500 text-white',
    }

    return (
        <span className={`
            ${sizeClasses[size]} ${variantClasses[variant]}
            rounded-full font-bold flex items-center justify-center
            shadow-lg animate-pulse
        `}>
            {count > max ? `${max}+` : count}
        </span>
    )
}

interface NotificationItemProps {
    title: string
    message: string
    time: string
    type?: 'info' | 'success' | 'warning' | 'error'
    read?: boolean
    onClick?: () => void
    action?: {
        label: string
        onClick: () => void
    }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    title,
    message,
    time,
    type = 'info',
    read = false,
    onClick,
    action
}) => {
    const typeColors = {
        info: 'bg-blue-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-rose-500',
    }

    const typeIcons = {
        info: Icons.Info,
        success: Icons.CheckCircle,
        warning: Icons.AlertTriangle,
        error: Icons.Alert,
    }

    const IconComponent = typeIcons[type]

    return (
        <div
            onClick={onClick}
            className={`
                relative p-4 rounded-2xl transition-all duration-200 cursor-pointer
                ${read
                    ? 'bg-gray-50 dark:bg-white/5 opacity-60'
                    : 'bg-white dark:bg-white/5 hover:shadow-md'
                }
            `}
        >
            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl ${typeColors[type]}/10 flex items-center justify-center flex-shrink-0`}>
                    <IconComponent size={20} className={typeColors[type]} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-[#111318] dark:text-white text-sm">{title}</h4>
                        <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
                    {action && (
                        <button
                            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                            className="mt-2 text-xs font-bold text-primary hover:text-primary-dark"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            </div>
            {!read && (
                <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
            )}
        </div>
    )
}

interface NotificationListProps {
    notifications: Array<{
        id: string
        title: string
        message: string
        time: string
        type?: 'info' | 'success' | 'warning' | 'error'
        read?: boolean
    }>
    onItemClick?: (id: string) => void
    onMarkAllRead?: () => void
    emptyMessage?: string
}

export const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    onItemClick,
    onMarkAllRead,
    emptyMessage = "No notifications yet"
}) => {
    const unreadCount = notifications.filter(n => !n.read).length

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Icons.Bell size={32} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div>
            {unreadCount > 0 && onMarkAllRead && (
                <button
                    onClick={onMarkAllRead}
                    className="w-full py-2 mb-4 text-xs font-bold text-primary hover:text-primary-dark flex items-center justify-center gap-1"
                >
                    <Icons.CheckCircle size={14} />
                    Mark all as read
                </button>
            )}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        {...notification}
                        onClick={() => onItemClick?.(notification.id)}
                    />
                ))}
            </div>
        </div>
    )
}
