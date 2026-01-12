import React from 'react'
import { Icons } from './Icons'

export type PaymentStatus = 'paid' | 'due-soon' | 'overdue' | 'pending'

interface PaymentStatusBadgeProps {
    status: PaymentStatus
    daysUntilDue?: number
    daysOverdue?: number
    large?: boolean
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
    status,
    daysUntilDue,
    daysOverdue,
    large = false
}) => {
    const styles = {
        paid: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-500',
            icon: <Icons.Check size={large ? 20 : 14} />,
            label: 'PAID'
        },
        'due-soon': {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-500',
            icon: <Icons.Error size={large ? 20 : 14} />,
            label: daysUntilDue !== undefined ? `DUE IN ${daysUntilDue}D` : 'DUE SOON'
        },
        overdue: {
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            text: 'text-rose-500',
            icon: <Icons.AlertTriangle size={large ? 20 : 14} />,
            label: daysOverdue !== undefined ? `${daysOverdue}D OVERDUE` : 'OVERDUE'
        },
        pending: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-500',
            icon: <Icons.Clock size={large ? 20 : 14} />,
            label: 'PENDING'
        }
    }

    const style = styles[status]
    const sizeClass = large ? 'px-6 py-3 text-sm' : 'px-3 py-1.5 text-[10px]'

    return (
        <div className={`${style.bg} border ${style.border} rounded-full ${sizeClass} flex items-center gap-2 font-black tracking-wider shadow-sm`}>
            <span className={style.text}>{style.icon}</span>
            <span className={style.text}>{style.label}</span>
        </div>
    )
}
