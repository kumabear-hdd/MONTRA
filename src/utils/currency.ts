import type { CurrencyCode } from '../types/finance';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; label: string; locale: string; decimals: number }> = {
  IDR: { symbol: 'Rp', label: 'Indonesian Rupiah (IDR)', locale: 'id-ID', decimals: 0 },
  USD: { symbol: '$', label: 'US Dollar (USD)', locale: 'en-US', decimals: 2 },
  EUR: { symbol: '€', label: 'Euro (EUR)', locale: 'de-DE', decimals: 2 },
  GBP: { symbol: '£', label: 'British Pound (GBP)', locale: 'en-GB', decimals: 2 },
  SGD: { symbol: 'S$', label: 'Singapore Dollar (SGD)', locale: 'en-SG', decimals: 2 },
  JPY: { symbol: '¥', label: 'Japanese Yen (JPY)', locale: 'ja-JP', decimals: 0 },
};

/**
 * Formats a monetary integer/number into cleanly formatted string.
 * For IDR: e.g. Rp15.000, Rp1.250.000, -Rp50.000
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'IDR'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.IDR;

  if (currency === 'IDR') {
    const formatted = absAmount.toLocaleString('id-ID');
    return `${isNegative ? '-' : ''}Rp${formatted}`;
  }

  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${formatted}`;
}

/**
 * Format compact numbers for small badge or metric display (e.g. Rp1.2M, Rp450k)
 */
export function formatCompactCurrency(amount: number, currency: CurrencyCode = 'IDR'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (currency === 'IDR') {
    if (absAmount >= 1_000_000_000) {
      return `${isNegative ? '-' : ''}Rp${(absAmount / 1_000_000_000).toFixed(1)}M`;
    }
    if (absAmount >= 1_000_000) {
      return `${isNegative ? '-' : ''}Rp${(absAmount / 1_000_000).toFixed(1)}jt`;
    }
    if (absAmount >= 1_000) {
      return `${isNegative ? '-' : ''}Rp${(absAmount / 1_000).toFixed(0)}rb`;
    }
    return `${isNegative ? '-' : ''}Rp${absAmount}`;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.IDR;
  return `${isNegative ? '-' : ''}${config.symbol}${formatter.format(absAmount)}`;
}

/**
 * Parse a raw text input (e.g. "150.000", "150000", "Rp 50.000") into a clean number.
 */
export function parseCurrencyInput(val: string): number {
  if (!val) return 0;
  // Strip any non-numeric characters except decimals if applicable
  const cleaned = val.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}
