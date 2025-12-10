import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icons } from '@/shared/components/Icons';

export const NotificationToast: React.FC = () => {
    const { notification } = useAppContext();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300); // Allow exit animation
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!notification && !visible) return null;

    // Use the notification data if available, otherwise keep showing the last one during exit animation
    // (This is a simplified approach, for now just hiding when null is fine or using a ref to store last)
    if (!notification) return null;

    const isSuccess = notification.type === 'success';
    const isError = notification.type === 'error';

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md ${isSuccess ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                    isError ? 'bg-rose-500/90 border-rose-400 text-white' :
                        'bg-gray-800/90 border-gray-700 text-gray-200'
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSuccess ? 'bg-white/20' : isError ? 'bg-white/20' : 'bg-gray-700'
                    }`}>
                    {isSuccess && <Icons.Check size={18} />}
                    {isError && <Icons.Alert size={18} />}
                    {!isSuccess && !isError && <Icons.Bell size={18} />}
                </div>
                <div>
                    <p className="font-bold text-sm">{notification.message}</p>
                </div>
            </div>
        </div>
    );
};
