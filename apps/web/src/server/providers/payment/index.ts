import type { PaymentProvider } from '../types';
import { MockPaymentProvider } from './mock-payment-provider';

export function createPaymentProvider(): PaymentProvider {
  // Phase 2 reads env.PAYMENT_PROVIDER_DEFAULT and selects stripe/flutterwave/mock.
  return new MockPaymentProvider();
}
