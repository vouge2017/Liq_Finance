import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string;
    height?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1
}) => {
    const baseClasses = 'bg-gray-800 animate-pulse';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl'
    };

    const style = {
        width: width || (variant === 'circular' ? height : undefined),
        height: height
    };

    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    ));

    return count > 1 ? <div className="space-y-3">{skeletons}</div> : skeletons[0];
};
