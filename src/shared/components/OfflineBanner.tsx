import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Show "Back online" message briefly
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${isOnline
                    ? 'bg-emerald-500 text-white'
                    : 'bg-yellow-500 text-black'
                }`}
            role="alert"
        >
            {isOnline ? (
                <>
                    <Icons.Check size={16} />
                    Back online! Changes will sync now.
                </>
            ) : (
                <>
                    <Icons.Alert size={16} />
                    You're offline. Changes will sync when connected.
                </>
            )}
        </div>
    );
};
