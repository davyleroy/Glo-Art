/**
 * Money is stored as integer minor units + ISO 4217 code.
 * Never use floats for money (spec §0.2).
 *
 * Minor-unit scale is 2 for most currencies; exceptions below.
 */

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG',
  'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

const THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

export function minorUnitScale(currency: string): number {
  const c = currency.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(c)) return 3;
  return 2;
}

export interface Money {
  amount: number; // integer minor units
  currency: string; // ISO 4217
}

export function money(amount: number, currency: string): Money {
  if (!Number.isInteger(amount)) {
    throw new Error(`Money.amount must be an integer; got ${amount}`);
  }
  return { amount, currency: currency.toUpperCase() };
}

export function formatMoney(m: Money, locale: string): string {
  const scale = minorUnitScale(m.currency);
  const value = m.amount / 10 ** scale;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: m.currency,
    minimumFractionDigits: scale,
    maximumFractionDigits: scale,
  }).format(value);
}

export function parseMoneyFromMajor(major: string | number, currency: string): Money {
  const scale = minorUnitScale(currency);
  const asNumber = typeof major === 'number' ? major : Number(major);
  if (!Number.isFinite(asNumber)) {
    throw new Error(`parseMoneyFromMajor: invalid value ${major}`);
  }
  const minor = Math.round(asNumber * 10 ** scale);
  return money(minor, currency);
}
