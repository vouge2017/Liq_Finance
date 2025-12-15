import React from 'react';
import { AINotification } from '@/services/proactive-ai';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';

interface AINotificationBannerProps {
    notification: AINotification;
    onDismiss: () => void;
}

const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400',
};

export const AINotificationBanner: React.FC<AINotificationBannerProps> = ({
    notification,
    onDismiss
}) => {
    const { setActiveTab } = useAppContext();
    const IconComponent = (Icons as any)[notification.icon] || Icons.Bell;
    const colorClasses = colorMap[notification.color] || colorMap.cyan;

    const handleAction = () => {
        if (notification.actionTab) {
            setActiveTab(notification.actionTab as any);
        }
        onDismiss();
    };

    return (
        <div
            className={`bg-gradient-to-r ${colorClasses} border rounded-2xl p-4 mb-4 animate-slide-up flex items-start gap-3`}
        >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <IconComponent size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h4 className="font-bold text-sm text-theme-primary">{notification.title}</h4>
                        <p className="text-xs text-theme-secondary mt-0.5">{notification.message}</p>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="text-theme-secondary hover:text-theme-primary transition-colors shrink-0"
                    >
                        <Icons.Close size={16} />
                    </button>
                </div>

                {notification.actionLabel && (
                    <button
                        onClick={handleAction}
                        className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {notification.actionLabel} →
                    </button>
                )}
            </div>
        </div>
    );
};

// Multi-notification wrapper
interface AINotificationStackProps {
    notifications: AINotification[];
    onDismiss: (id: string) => void;
    maxVisible?: number;
}

export const AINotificationStack: React.FC<AINotificationStackProps> = ({
    notifications,
    onDismiss,
    maxVisible = 2
}) => {
    const visibleNotifications = notifications.slice(0, maxVisible);
    const hiddenCount = notifications.length - maxVisible;

    return (
        <div className="space-y-2">
            {visibleNotifications.map(notification => (
                <AINotificationBanner
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => onDismiss(notification.id)}
                />
            ))}

            {hiddenCount > 0 && (
                <div className="text-xs text-center text-theme-secondary py-2">
                    +{hiddenCount} more notification{hiddenCount > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};
