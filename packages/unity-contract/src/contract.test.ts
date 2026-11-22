import { describe, expect, it } from 'vitest';
import { FromUnitySchema, FromHostSchema, PROTOCOL_VERSION } from './index';

describe('unity-contract', () => {
  it('accepts a valid unity ready message', () => {
    expect(() =>
      FromUnitySchema.parse({
        v: PROTOCOL_VERSION,
        event: 'ready',
        payload: { unityVersion: '2023.2' },
      }),
    ).not.toThrow();
  });

  it('rejects wrong protocol version', () => {
    expect(() =>
      FromUnitySchema.parse({ v: 'kv.v2', event: 'ready', payload: {} }),
    ).toThrow();
  });

  it('accepts a host set-locale message', () => {
    expect(() =>
      FromHostSchema.parse({
        v: PROTOCOL_VERSION,
        event: 'set-locale',
        payload: { locale: 'rw' },
      }),
    ).not.toThrow();
  });
});
