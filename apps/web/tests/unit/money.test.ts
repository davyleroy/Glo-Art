import { describe, expect, it } from 'vitest';
import { formatMoney, minorUnitScale, money, parseMoneyFromMajor } from '@/lib/money';

describe('money', () => {
  it('rejects non-integer amounts', () => {
    expect(() => money(99.5, 'USD')).toThrow();
  });

  it('knows the scale of zero-decimal currencies', () => {
    expect(minorUnitScale('RWF')).toBe(0);
    expect(minorUnitScale('JPY')).toBe(0);
    expect(minorUnitScale('USD')).toBe(2);
    expect(minorUnitScale('KWD')).toBe(3);
  });

  it('parses major units into integer minor units', () => {
    expect(parseMoneyFromMajor('100.00', 'USD')).toEqual({ amount: 10000, currency: 'USD' });
    expect(parseMoneyFromMajor('100', 'RWF')).toEqual({ amount: 100, currency: 'RWF' });
  });

  it('formats money per locale', () => {
    const m = money(10000, 'USD');
    expect(formatMoney(m, 'en-US')).toMatch(/\$100\.00/);
  });
});
