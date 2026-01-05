import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    rounded?: boolean;
    lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    rounded = false,
    lines = 1
}) => {
    const baseClasses = 'skeleton';
    const roundedClasses = rounded ? 'rounded-full' : 'rounded';
    const customClasses = `${baseClasses} ${roundedClasses} ${className}`.trim();

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    if (lines > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: lines }, (_, index) => (
                    <div
                        key={index}
                        className={`${customClasses} ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return <div className={customClasses} style={style} />;
};

// Specific skeleton components for common use cases
export const CardSkeleton: React.FC = () => (
    <div className="card-base animate-pulse">
        <div className="flex items-center space-x-4">
            <Skeleton width={48} height={48} rounded />
            <div className="space-y-2 flex-1">
                <Skeleton height={16} />
                <Skeleton height={12} width="75%" />
            </div>
        </div>
    </div>
);

export const BalanceCardSkeleton: React.FC = () => (
    <div className="card-hero animate-pulse" style={{ minHeight: '180px' }}>
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton height={12} width={120} />
                    <Skeleton height={48} width={200} />
                </div>
                <Skeleton width={60} height={24} rounded />
            </div>
            <Skeleton height={12} width={140} />
            <div className="flex space-x-3">
                <div className="flex-1">
                    <Skeleton height={90} />
                </div>
                <div className="flex-1">
                    <Skeleton height={90} />
                </div>
            </div>
        </div>
    </div>
);

export const TransactionSkeleton: React.FC = () => (
    <div className="card-base animate-pulse">
        <div className="flex items-center space-x-4">
            <Skeleton width={40} height={40} rounded />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={16} width={80} />
                </div>
                <Skeleton height={12} width="40%" />
            </div>
        </div>
    </div>
);

export const QuickActionsSkeleton: React.FC = () => (
    <div className="mb-8">
        <Skeleton height={16} width={120} className="mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex flex-col items-center space-y-3">
                    <Skeleton width={64} height={64} rounded={true} className="rounded-2xl" />
                    <Skeleton height={14} width={60} />
                </div>
            ))}
        </div>
    </div>
);

export default Skeleton;