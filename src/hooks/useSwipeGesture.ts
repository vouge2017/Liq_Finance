import { useState, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
    preventDefaultTouchmoveEvent?: boolean;
}

export const useSwipeGesture = (options: SwipeGestureOptions = {}) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        threshold = 50,
        preventDefaultTouchmoveEvent = true
    } = options;

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const elementRef = useRef<HTMLElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setIsDragging(true);
        setSwipeDirection(null);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;

        setCurrentX(e.touches[0].clientX);
        const diff = startX - currentX;

        if (preventDefaultTouchmoveEvent) {
            e.preventDefault();
        }

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                setSwipeDirection('left');
            } else {
                setSwipeDirection('right');
            }
        }
    }, [isDragging, startX, currentX, threshold, preventDefaultTouchmoveEvent]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;

        const diff = startX - currentX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && onSwipeLeft) {
                onSwipeLeft();
            } else if (diff < 0 && onSwipeRight) {
                onSwipeRight();
            }
        }

        setIsDragging(false);
        setSwipeDirection(null);
    }, [isDragging, startX, currentX, threshold, onSwipeLeft, onSwipeRight]);

    const attachSwipeListeners = useCallback((element: HTMLElement) => {
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        elementRef,
        isDragging,
        swipeDirection,
        attachSwipeListeners,
        swipeProgress: isDragging ? Math.min(Math.abs(startX - currentX) / threshold, 1) : 0
    };
};

export default useSwipeGesture;