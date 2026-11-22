import type { RealtimeMessage, RealtimeProvider } from '../types';

type Handler = (event: string, payload: unknown) => void;

export class MemoryRealtimeProvider implements RealtimeProvider {
  readonly name = 'memory' as const;
  private subs = new Map<string, Set<Handler>>();

  async publish<T>(message: RealtimeMessage<T>): Promise<void> {
    const set = this.subs.get(message.channel);
    if (!set) return;
    for (const h of set) h(message.event, message.payload);
  }

  subscribe<T>(channel: string, handler: (event: string, payload: T) => void): () => void {
    const set = this.subs.get(channel) ?? new Set<Handler>();
    const wrapped: Handler = (event, payload) => handler(event, payload as T);
    set.add(wrapped);
    this.subs.set(channel, set);
    return () => set.delete(wrapped);
  }
}
