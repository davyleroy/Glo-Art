import { z } from 'zod';

/**
 * Centralized, validated environment. Fails fast at import time if the shape
 * is wrong. Code never reads `process.env` directly.
 */

const booleanish = z
  .union([z.literal('true'), z.literal('false'), z.literal('1'), z.literal('0')])
  .transform((v) => v === 'true' || v === '1');

const csv = z
  .string()
  .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean));

// Many of our env vars are blank in `.env.example` and only filled in later
// phases. Treat an empty string as "unset" so URL validation doesn't fire.
const optionalUrl = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().url().optional(),
);

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  BRAND_NAME: z.string().default('Kaleido'),

  // i18n
  DEFAULT_LOCALE: z.enum(['en', 'fr', 'rw']).default('en'),
  SUPPORTED_LOCALES: csv.default('en,fr,rw'),
  DEFAULT_CURRENCY: z.string().length(3).default('USD'),
  SUPPORTED_CURRENCIES: csv.default('USD,EUR,GBP,RWF,KES,NGN,GHS,ZAR'),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: optionalUrl,

  // Auth
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 chars'),
  AUTH_URL: optionalUrl,
  AUTH_TRUST_HOST: booleanish.default('true'),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  FIELD_ENCRYPTION_KEY: z.string().optional(),

  // Provider selection
  PAYMENT_PROVIDERS_ENABLED: csv.default('mock'),
  PAYMENT_PROVIDER_DEFAULT: z.enum(['mock', 'stripe', 'flutterwave']).default('mock'),
  PAYMENT_MOCK_ENABLED: booleanish.default('true'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp', 'resend']).default('smtp'),
  REALTIME_PROVIDER: z.enum(['memory', 'pusher', 'ably']).default('memory'),
  AI_PROVIDER: z.enum(['mock', 'anthropic']).default('mock'),
  SEARCH_PROVIDER: z.enum(['postgres', 'meilisearch']).default('postgres'),
  FX_PROVIDER: z.enum(['static', 'openexchangerates']).default('static'),
  SCAN_PROVIDER: z.enum(['mock', 'clamav']).default('mock'),
  PUSH_PROVIDER: z.enum(['log', 'webpush']).default('log'),
  ASSET3D_PROVIDER: z.enum(['mock', 'real']).default('mock'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),

  // Flutterwave
  FLW_PUBLIC_KEY: z.string().optional(),
  FLW_SECRET_KEY: z.string().optional(),
  FLW_ENCRYPTION_KEY: z.string().optional(),
  FLW_WEBHOOK_SECRET_HASH: z.string().optional(),

  // Storage (MinIO / S3)
  S3_ENDPOINT: optionalUrl,
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET_PUBLIC: z.string().default('kaleido-public'),
  S3_BUCKET_PRIVATE: z.string().default('kaleido-private'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Email
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default('Kaleido <no-reply@kaleido.local>'),
  RESEND_API_KEY: z.string().optional(),

  // Realtime / jobs / cache
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // AI
  ANTHROPIC_API_KEY: z.string().optional(),
  EMBEDDINGS_PROVIDER_KEY: z.string().optional(),
  AI_DAILY_QUOTA_PER_USER: z.coerce.number().int().nonnegative().default(20),

  // Web push
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),

  // Unity
  UNITY_BUILD_BASE_URL: optionalUrl,
  UNITY_ALLOWED_ORIGIN: z.string().default('http://localhost:3000'),
  VR_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),

  // Business rules
  COMMISSION_BPS: z.coerce.number().int().nonnegative().default(1200),
  BUYER_FEE_BPS: z.coerce.number().int().nonnegative().default(300),
  ESCROW_AUTO_RELEASE_DAYS: z.coerce.number().int().positive().default(3),
  DISPUTE_WINDOW_DAYS: z.coerce.number().int().positive().default(7),
  AUCTION_ANTISNIPE_WINDOW_SEC: z.coerce.number().int().nonnegative().default(120),
  AUCTION_ANTISNIPE_EXTEND_SEC: z.coerce.number().int().nonnegative().default(120),
  AUCTION_PAYMENT_DUE_HOURS: z.coerce.number().int().positive().default(48),

  // Feature flags
  FEATURE_PHYSICAL_CHECKOUT: booleanish.default('false'),
  FEATURE_CRYPTO_PAYMENTS: booleanish.default('false'),
  FEATURE_AI: booleanish.default('true'),
  FEATURE_VR: booleanish.default('true'),
  FEATURE_PROXY_BIDDING: booleanish.default('false'),
  AUTO_PUBLISH_TRUSTED: booleanish.default('true'),

  // Observability
  SENTRY_DSN: z.string().optional(),
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(formatted)
      .map(([k, v]) => `  ${k}: ${v?.join(', ')}`)
      .join('\n');
    throw new Error(`[env] Invalid environment variables:\n${missing}`);
  }
  return parsed.data;
}

// Evaluated once; cached as a module-level constant.
export const env: Env = loadEnv();
