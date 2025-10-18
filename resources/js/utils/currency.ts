/**
 * Utility functions for currency formatting
 */

/**
 * Format currency amount to proper format without leading zeros
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format currency with peso symbol
 * @param amount - The amount to format
 * @returns Formatted currency string with peso symbol
 */
export function formatCurrencyWithSymbol(amount: number): string {
    return `₱${formatCurrency(amount)}`;
}
