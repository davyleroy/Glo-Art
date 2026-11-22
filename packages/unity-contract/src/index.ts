import { z } from 'zod';

/**
 * Unity ↔ Web postMessage protocol: kv.v1 (spec §8.4).
 * This package is the single source of truth for the shape of messages
 * exchanged between the web host and the Unity WebGL module. Both sides
 * import from here (TypeScript on the web; generated C# / JSON Schema
 * for Unity — Phase 4 adds the schema export).
 */

export const PROTOCOL_VERSION = 'kv.v1' as const;

export const UnityEvent = z.enum([
  'ready',
  'focus-artwork',
  'shortlist-add',
  'shortlist-remove',
  'request-checkout',
  'telemetry',
  'error',
]);
export type UnityEvent = z.infer<typeof UnityEvent>;

export const HostEvent = z.enum([
  'load-manifest',
  'set-locale',
  'set-token',
  'shortlist-sync',
  'nudge',
]);
export type HostEvent = z.infer<typeof HostEvent>;

const Base = z.object({
  v: z.literal(PROTOCOL_VERSION),
  requestId: z.string().optional(),
});

export const FromUnitySchema = z.discriminatedUnion('event', [
  Base.extend({
    event: z.literal('ready'),
    payload: z.object({ unityVersion: z.string().optional() }).passthrough(),
  }),
  Base.extend({
    event: z.literal('focus-artwork'),
    payload: z.object({ listingId: z.string(), slotId: z.string().optional() }),
  }),
  Base.extend({
    event: z.literal('shortlist-add'),
    payload: z.object({ listingId: z.string() }),
  }),
  Base.extend({
    event: z.literal('shortlist-remove'),
    payload: z.object({ listingId: z.string() }),
  }),
  Base.extend({
    event: z.literal('request-checkout'),
    payload: z.object({ listingIds: z.array(z.string()).min(1) }),
  }),
  Base.extend({
    event: z.literal('telemetry'),
    payload: z.record(z.string(), z.unknown()),
  }),
  Base.extend({
    event: z.literal('error'),
    payload: z.object({ code: z.string(), message: z.string().optional() }),
  }),
]);
export type FromUnity = z.infer<typeof FromUnitySchema>;

export const FromHostSchema = z.discriminatedUnion('event', [
  Base.extend({
    event: z.literal('load-manifest'),
    payload: z.object({ manifestUrl: z.string().url() }),
  }),
  Base.extend({
    event: z.literal('set-locale'),
    payload: z.object({ locale: z.enum(['en', 'fr', 'rw']) }),
  }),
  Base.extend({
    event: z.literal('set-token'),
    payload: z.object({ token: z.string().min(1), expiresAt: z.string() }),
  }),
  Base.extend({
    event: z.literal('shortlist-sync'),
    payload: z.object({ listingIds: z.array(z.string()) }),
  }),
  Base.extend({
    event: z.literal('nudge'),
    payload: z.object({ kind: z.enum(['ending-soon', 'refresh']) }),
  }),
]);
export type FromHost = z.infer<typeof FromHostSchema>;

/**
 * Simple gallery manifest (spec §8.3). Phase 4 fleshes out slot layout,
 * artwork metadata, and quality tiers.
 */
export const GalleryManifestSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  galleryId: z.string(),
  locale: z.enum(['en', 'fr', 'rw']),
  slots: z.array(
    z.object({
      slotId: z.string(),
      listingId: z.string(),
      modelUrl: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
    }),
  ),
});
export type GalleryManifest = z.infer<typeof GalleryManifestSchema>;
