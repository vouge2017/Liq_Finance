import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Ethiopian-inspired SVG Icons
 * Based on cultural symbols and heritage
 */

export const EthiopianCrossIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18M3 12h18" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const CoffeeIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8c0-1 .5-2 1.5-2h9c1 0 1.5 1 1.5 2v6c0 .5-.25 1-.75 1.5H6.75c-.5-.5-.75-1-.75-1.5V8z" />
    <path d="M17 10h1.5c.5 0 1 .5 1 1v3c0 .5-.5 1-1 1h-1.5" />
    <path d="M3 16h18" />
    <path d="M5 20h14" />
  </svg>
);

export const IqubIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v18M3 12h18" strokeOpacity="0.5" />
  </svg>
);

export const IdirIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
    <path d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

export const MoneyBagIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 3h6v3H9V3z" />
    <path d="M6 6h12c1 0 2 1 2 2v11c0 1-1 2-2 2H6c-1 0-2-1-2-2V8c0-1 1-2 2-2z" />
    <path d="M12 10c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" />
  </svg>
);

export const BalanceScaleIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v4M12 18v4" />
    <path d="M4 10h16M3 12l9-9 9 9" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
  </svg>
);

export const GoalFlagIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 3v18" />
    <path d="M5 3h12c1 0 2 1 2 2v8c0 1-1 2-2 2H5" />
  </svg>
);

export const SavingsIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2C6.5 2 2 4.5 2 8v8c0 3.5 4.5 6 10 6s10-2.5 10-6V8c0-3.5-4.5-6-10-6z" />
    <path d="M12 10v4" />
    <path d="M10 12h4" />
  </svg>
);

export const TransactionIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 16V7c0-1 1-2 2-2h6c1 0 2 1 2 2v9" />
    <path d="M3 12h18" />
    <path d="M7 12h2" />
    <path d="M15 12h2" />
  </svg>
);

export const BudgetIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 3v18" />
    <circle cx="9" cy="9" r="1" />
    <circle cx="15" cy="9" r="1" />
  </svg>
);

// Icon library grouping
export const EthiopianIconLibrary = {
  cross: EthiopianCrossIcon,
  coffee: CoffeeIcon,
  iqub: IqubIcon,
  iddir: IdirIcon,
  moneyBag: MoneyBagIcon,
  balanceScale: BalanceScaleIcon,
  goalFlag: GoalFlagIcon,
  savings: SavingsIcon,
  transaction: TransactionIcon,
  budget: BudgetIcon,
};

export type EthiopianIconName = keyof typeof EthiopianIconLibrary;

interface EthiopianIconProps extends IconProps {
  name: EthiopianIconName;
}

export const EthiopianIcon: React.FC<EthiopianIconProps> = ({
  name,
  className,
  size = 24,
  color,
}) => {
  const IconComponent = EthiopianIconLibrary[name];
  return <IconComponent className={className} size={size} color={color} />;
};
