/**
 * Format Ethiopian Birr with proper symbol and formatting
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted Birr string
 */
export function formatBirr(
    amount: number,
    options: {
        showSymbol?: boolean;
        decimals?: number;
        compact?: boolean;
    } = {}
): string {
    const {
        showSymbol = true,
        decimals = 2,
        compact = false
    } = options;

    // Compact notation for large numbers
    if (compact && Math.abs(amount) >= 1000) {
        const suffixes = ['', 'K', 'M', 'B'];
        const tier = Math.floor(Math.log10(Math.abs(amount)) / 3);
        const scaled = amount / Math.pow(1000, tier);
        const formatted = scaled.toFixed(tier > 0 ? 1 : decimals);
        return showSymbol
            ? `${formatted}${suffixes[tier]} ብር`
            : `${formatted}${suffixes[tier]}`;
    }

    // Standard formatting
    const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    return showSymbol ? `${formatted} ብር` : formatted;
}

/**
 * Parse Birr string back to number
 */
export function parseBirr(birrString: string): number {
    // Remove Birr symbol and spaces
    const cleanString = birrString.replace(/[ብርETBetb,\s]/g, '');
    return parseFloat(cleanString) || 0;
}
