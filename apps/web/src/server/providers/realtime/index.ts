import { env } from '@/lib/env';
import type { RealtimeProvider } from '../types';
import { MemoryRealtimeProvider } from './memory-realtime-provider';

export function createRealtimeProvider(): RealtimeProvider {
  switch (env.REALTIME_PROVIDER) {
    case 'memory':
    default:
      // Pusher / Ably wiring lands in Phase 3.
      return new MemoryRealtimeProvider();
  }
}
