import { useCallback } from 'react';

type HapticType = 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy' | 'selection';

export const useHaptic = () => {
    const triggerHaptic = useCallback((type: HapticType) => {
        if (!navigator.vibrate) return;

        switch (type) {
            case 'success':
                navigator.vibrate([50, 50, 50]);
                break;
            case 'error':
                navigator.vibrate([50, 100, 50]);
                break;
            case 'warning':
                navigator.vibrate(200);
                break;
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(50);
                break;
            case 'heavy':
                navigator.vibrate(100);
                break;
            case 'selection':
                navigator.vibrate(5);
                break;
            default:
                break;
        }
    }, []);

    return { triggerHaptic };
};
