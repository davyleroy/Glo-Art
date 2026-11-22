import type { PaymentProvider } from '../types';

/**
 * Mock payment provider scaffold. Phase 2 adds createPaymentIntent, confirm,
 * webhook verification, etc. For now this holds the slot in the container.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock' as const;

  supportedCurrencies(): readonly string[] {
    return ['USD', 'EUR', 'GBP', 'RWF', 'KES', 'NGN', 'GHS', 'ZAR'];
  }
}
