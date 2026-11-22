import 'server-only';
import type {
  EmailProvider,
  PaymentProvider,
  RealtimeProvider,
  StorageProvider,
} from './providers/types';
import { createEmailProvider } from './providers/email';
import { createRealtimeProvider } from './providers/realtime';
import { createStorageProvider } from './providers/storage';
import { createPaymentProvider } from './providers/payment';

/**
 * Single composition root for every external-service provider.
 * Services receive providers through this container, never by importing
 * concrete implementations directly, so tests and the demo fallback can
 * swap in mocks via environment variables.
 */
export interface ProviderContainer {
  email: EmailProvider;
  realtime: RealtimeProvider;
  storage: StorageProvider;
  payment: PaymentProvider;
}

declare global {
  // eslint-disable-next-line no-var
  var __kaleidoContainer: ProviderContainer | undefined;
}

function build(): ProviderContainer {
  return {
    email: createEmailProvider(),
    realtime: createRealtimeProvider(),
    storage: createStorageProvider(),
    payment: createPaymentProvider(),
  };
}

export function getContainer(): ProviderContainer {
  if (!globalThis.__kaleidoContainer) {
    globalThis.__kaleidoContainer = build();
  }
  return globalThis.__kaleidoContainer;
}
