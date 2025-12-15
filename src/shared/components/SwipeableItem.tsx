import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '@/shared/components/Icons';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete?: () => void;
    onEdit?: () => void;
    threshold?: number;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
    children,
    onDelete,
    onEdit,
    threshold = 80
}) => {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const startX = useRef<number | null>(null);
    const itemRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX.current === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // Only allow swiping left (negative translate)
        if (diff < 0) {
            // Limit swipe to -160px (width of two buttons)
            setTranslateX(Math.max(diff, -160));
        } else {
            setTranslateX(0);
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        startX.current = null;

        // Snap to open or closed
        if (translateX < -threshold) {
            setTranslateX(-140); // Keep open
        } else {
            setTranslateX(0); // Close
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
                setTranslateX(0);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl mb-3" ref={itemRef}>
            {/* Background Actions */}
            <div className="absolute inset-0 flex justify-end items-center bg-gray-900 rounded-2xl">
                <div className="flex h-full">
                    {onEdit && (
                        <button
                            onClick={() => {
                                onEdit();
                                setTranslateX(0);
                            }}
                            className="w-[70px] bg-blue-600 flex flex-col items-center justify-center text-white active:bg-blue-700 transition-colors"
                        >
                            <Icons.Edit size={20} />
                            <span className="text-[10px] font-bold mt-1">Edit</span>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => {
                                onDelete();
                                setTranslateX(0);
                            }}
                            className="w-[70px] bg-rose-600 flex flex-col items-center justify-center text-white rounded-r-2xl active:bg-rose-700 transition-colors"
                        >
                            <Icons.Delete size={20} />
                            <span className="text-[10px] font-bold mt-1">Delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Foreground Content */}
            <div
                className="relative bg-theme-card z-10 transition-transform duration-200 ease-out"
                style={{
                    transform: `translateX(${translateX}px)`,
                    touchAction: 'pan-y' // Allow vertical scroll, block horizontal
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};
