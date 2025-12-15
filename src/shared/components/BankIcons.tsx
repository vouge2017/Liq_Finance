import React from 'react';

interface BankIconProps {
    size?: number;
    className?: string;
}

// CBE - Commercial Bank of Ethiopia (Purple/Fuchsia theme)
export const CBEIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#cbe-gradient)" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui">CBE</text>
        <defs>
            <linearGradient id="cbe-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
        </defs>
    </svg>
);

// Telebirr (Cyan/Green theme - Ethio Telecom colors)
export const TelebirrIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#telebirr-gradient)" />
        <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <defs>
            <linearGradient id="telebirr-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#10B981" />
            </linearGradient>
        </defs>
    </svg>
);

// CBE Birr (Purple/Blue theme)
export const CBEBirrIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#cbebirr-gradient)" />
        <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" fill="none" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui">B</text>
        <defs>
            <linearGradient id="cbebirr-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
        </defs>
    </svg>
);

// Awash Bank (Blue/Orange theme)
export const AwashIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#awash-gradient)" />
        <path d="M6 16L12 8L18 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="awash-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#1D4ED8" />
                <stop offset="1" stopColor="#F97316" />
            </linearGradient>
        </defs>
    </svg>
);

// Dashen Bank (Navy/Indigo theme)
export const DashenIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#dashen-gradient)" />
        <path d="M8 17V7L16 12L8 17Z" fill="white" />
        <defs>
            <linearGradient id="dashen-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#1E3A8A" />
                <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
        </defs>
    </svg>
);

// Hibret Bank (Rose/Red theme)
export const HibretIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#hibret-gradient)" />
        <path d="M12 6L14 10H18L15 13L16 17L12 14L8 17L9 13L6 10H10L12 6Z" fill="white" />
        <defs>
            <linearGradient id="hibret-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#BE123C" />
                <stop offset="1" stopColor="#E11D48" />
            </linearGradient>
        </defs>
    </svg>
);

// M-Pesa (Green theme)
export const MPesaIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="#22C55E" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="system-ui">M-P</text>
    </svg>
);

// Hi-Birr / HelloCash (Orange theme)
export const HiBirrIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#hibirr-gradient)" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui">Hi</text>
        <defs>
            <linearGradient id="hibirr-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#F97316" />
                <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>
        </defs>
    </svg>
);

// Abyssinia Bank (Green/Teal theme)
export const AbyssiniaIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#abyssinia-gradient)" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui">AB</text>
        <defs>
            <linearGradient id="abyssinia-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#059669" />
                <stop offset="1" stopColor="#14B8A6" />
            </linearGradient>
        </defs>
    </svg>
);

// Cooperative Bank of Oromia (Green/Lime theme)
export const CoopIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#coop-gradient)" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="system-ui">CO</text>
        <defs>
            <linearGradient id="coop-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#166534" />
                <stop offset="1" stopColor="#84CC16" />
            </linearGradient>
        </defs>
    </svg>
);

// Zemen Bank (Yellow/Amber theme)
export const ZemenIcon: React.FC<BankIconProps> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="6" fill="url(#zemen-gradient)" />
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui">Z</text>
        <defs>
            <linearGradient id="zemen-gradient" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#B45309" />
                <stop offset="1" stopColor="#D97706" />
            </linearGradient>
        </defs>
    </svg>
);

// Export all bank icons
export const BankIcons = {
    CBE: CBEIcon,
    Telebirr: TelebirrIcon,
    CBEBirr: CBEBirrIcon,
    Awash: AwashIcon,
    Dashen: DashenIcon,
    Hibret: HibretIcon,
    MPesa: MPesaIcon,
    HiBirr: HiBirrIcon,
    Abyssinia: AbyssiniaIcon,
    Coop: CoopIcon,
    Zemen: ZemenIcon,
};

// Helper to get bank icon by institution name
export const getBankIcon = (institution: string): React.FC<BankIconProps> | null => {
    const name = institution.toLowerCase();
    if (name.includes('cbe') && name.includes('birr')) return CBEBirrIcon;
    if (name.includes('cbe') || name.includes('commercial')) return CBEIcon;
    if (name.includes('telebirr')) return TelebirrIcon;
    if (name.includes('awash')) return AwashIcon;
    if (name.includes('dashen')) return DashenIcon;
    if (name.includes('hibret')) return HibretIcon;
    if (name.includes('m-pesa') || name.includes('mpesa')) return MPesaIcon;
    if (name.includes('hibirr') || name.includes('hello')) return HiBirrIcon;
    if (name.includes('abyssinia')) return AbyssiniaIcon;
    if (name.includes('coop') || name.includes('oromia')) return CoopIcon;
    if (name.includes('zemen')) return ZemenIcon;
    return null;
};
