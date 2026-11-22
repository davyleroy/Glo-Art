/**
 * Provider interfaces. Every external dependency hides behind one of these
 * and has at least a Mock implementation (spec §7, §0.2).
 *
 * Phase 0 implements Email (SMTP/console) and stubs the others.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<{ id: string }>;
}

export interface RealtimeMessage<T = unknown> {
  channel: string;
  event: string;
  payload: T;
}

export interface RealtimeProvider {
  readonly name: string;
  publish<T>(message: RealtimeMessage<T>): Promise<void>;
  // Subscribe is only meaningful for in-memory tests; real providers deliver
  // events to clients over WebSockets.
  subscribe?<T>(channel: string, handler: (event: string, payload: T) => void): () => void;
}

export interface StoredObject {
  key: string;
  url: string;
  size?: number;
  contentType?: string;
}

export interface StorageProvider {
  readonly name: string;
  putObject(opts: {
    bucket: 'public' | 'private';
    key: string;
    body: Buffer | Uint8Array | string;
    contentType?: string;
  }): Promise<StoredObject>;
  getSignedUrl(opts: {
    bucket: 'public' | 'private';
    key: string;
    expiresInSec?: number;
  }): Promise<string>;
}

export interface PaymentProvider {
  readonly name: 'mock' | 'stripe' | 'flutterwave' | 'crypto';
  supportedCurrencies(): readonly string[];
  // More methods added in Phase 2 (createPaymentIntent, confirm, webhook, etc.)
}

export interface AIProvider {
  readonly name: string;
  generateTags(input: { title: string; description?: string }): Promise<string[]>;
}

export interface SearchProvider {
  readonly name: string;
}

export interface PushProvider {
  readonly name: string;
  send(opts: { subscription: unknown; payload: unknown }): Promise<void>;
}

export interface FxProvider {
  readonly name: string;
  getRate(from: string, to: string): Promise<number>;
}
