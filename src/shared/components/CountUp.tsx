import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
    end: number;
    duration?: number;
    start?: number;
    decimals?: number;
    separator?: string;
    prefix?: string;
    suffix?: string;
    className?: string;
    onComplete?: () => void;
}

export const CountUp: React.FC<CountUpProps> = ({
    end,
    duration = 0.8,
    start = 0,
    decimals = 0,
    separator = ',',
    prefix = '',
    suffix = '',
    className = '',
    onComplete
}) => {
    const [count, setCount] = useState(start);
    const [isAnimating, setIsAnimating] = useState(false);
    const countRef = useRef<HTMLSpanElement>(null);
    const startTimeRef = useRef<number>();
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        if (count === end) return;

        setIsAnimating(true);
        startTimeRef.current = performance.now();

        const animate = (currentTime: number) => {
            if (!startTimeRef.current) return;

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / (duration * 1000), 1);

            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);

            const currentCount = start + (end - start) * easeOutCubic;
            setCount(currentCount);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end);
                setIsAnimating(false);
                onComplete?.();
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [end, start, duration, onComplete]);

    const formatNumber = (num: number): string => {
        const fixed = num.toFixed(decimals);
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        return parts.join('.');
    };

    return (
        <span
            ref={countRef}
            className={`count-up ${isAnimating ? 'animating' : ''} ${className}`}
        >
            {prefix}{formatNumber(count)}{suffix}
        </span>
    );
};

export default CountUp;