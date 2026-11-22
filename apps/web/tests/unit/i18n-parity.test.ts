import { describe, expect, it } from 'vitest';
import en from '@/i18n/messages/en.json';
import fr from '@/i18n/messages/fr.json';
import rw from '@/i18n/messages/rw.json';

type Dict = Record<string, unknown>;

function flatten(obj: Dict, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v)
      ? flatten(v as Dict, key)
      : [key];
  });
}

describe('i18n message-key parity (en/fr/rw)', () => {
  const enKeys = flatten(en as Dict).sort();
  const frKeys = flatten(fr as Dict).sort();
  const rwKeys = flatten(rw as Dict).sort();

  it('fr has the same keys as en', () => {
    expect(frKeys).toEqual(enKeys);
  });

  it('rw has the same keys as en', () => {
    expect(rwKeys).toEqual(enKeys);
  });
});
