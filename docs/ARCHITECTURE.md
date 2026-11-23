# Glo Art — Architecture (Phase 0 draft)

This document is a living architecture map. Keep it in step with the code.

## Shape

```
Browser / PWA                            Unity WebGL (iframe, peer)
   |  React UI (RSC + client)                 |  kv.v1 postMessage + REST
   v                                          v
+-----------------------------------------------------------+
|                 Next.js app (apps/web)                    |
|  Route handlers /api/*    |  Server components            |
|  authz | services | state machines | provider container  |
+--------+--------------+-------------+-----------+---------+
         |              |             |           |
   PostgreSQL      S3/R2 storage   Redis      Inngest jobs
   (+pgvector)     (signed URLs)   (limits,   (auctions, escrow,
                                    cache)     email, rates)
```

Layering rule: `route handler → service → repository (Prisma) → DB`.
Route handlers parse + validate input and delegate to services. Services
own business rules and are the only place state machines are invoked.
Providers are injected through `src/server/container.ts` and chosen by
environment variables, so the mock path can always be selected (spec
§0.2).

## Repository layout

```
apps/web/                      Next.js app
  src/
    app/                       routes (locale-prefixed, grouped)
      api/                     route handlers
      [locale]/                page tree per supported locale
    components/                site shell + domain components
    i18n/                      en/fr/rw messages, routing, request config
    lib/                       env, logger, db, errors, money, utils
    schemas/                   zod schemas shared by API + forms
    server/
      auth/                    Auth.js config + password + tokens
      authz/                   can(), policies, current-request subject
      services/                business logic
      providers/               interface + mock + real impls
      container.ts             composition root
    types/                     ambient type augmentations
  prisma/
    schema.prisma              identity (Phase 0); catalog+ later
    seed.ts
  public/
    manifest.webmanifest       PWA manifest
    sw.js                      service worker shell
packages/
  unity-contract/              kv.v1 types + zod schemas (web ↔ Unity)
  unity-mock-host/             scaffolding for Phase 4 mock host
docs/                          this directory
docker-compose.yml             postgres (pgvector), mailhog, minio, redis
```

## Routing

All non-API traffic passes through `src/middleware.ts` (next-intl). The
first path segment is the locale (`en|fr|rw`). Pages live under
`src/app/[locale]/...`. API routes are locale-agnostic at `/api/...`.

## Auth + authorization

- Auth.js v5 (NextAuth) + Prisma adapter.
- Email + password via Credentials provider; argon2id via `@node-rs/argon2`.
- Google OAuth lights up automatically when `AUTH_GOOGLE_ID` and
  `AUTH_GOOGLE_SECRET` are set.
- Session strategy: JWT (so Unity-origin API tokens can share the same
  signing secret in later phases).
- Email verification is owned by us (tokens hashed at rest).
- Authorization: central `can(subject, action)` in `src/server/authz/policies.ts`
  with a unit test covering every row of the permission matrix (spec §2.3).
  `currentSubject()` in `src/server/authz/session.ts` builds the subject
  from the live session.

## Data

- PostgreSQL 16 with `citext`, `pg_trgm`, `vector` extensions (installed
  via docker-entrypoint-initdb SQL).
- Prisma 5 with `postgresqlExtensions` preview feature.
- Phase 0 tables: `User`, `UserRole`, `Account`, `Session`,
  `VerificationToken`, `EmailVerificationToken`, `PasswordResetToken`,
  `AuditLog`.

## i18n

- `next-intl` with `localePrefix: 'always'` (every URL starts with the
  locale).
- Message files: `src/i18n/messages/{en,fr,rw}.json`.
- `tests/unit/i18n-parity.test.ts` fails CI if keys drift between
  locales (spec §0.2 and §6.17).

## Providers

Every outbound integration is behind an interface in
`src/server/providers/types.ts` with a mock implementation. Current state:

| Interface  | Mock               | Real plan                        |
| ---------- | ------------------ | -------------------------------- |
| Email      | console (logs)     | SMTP (MailHog in dev, Resend prod via SMTP relay or REST in Phase 2) |
| Realtime   | memory event bus   | Pusher/Ably in Phase 3           |
| Storage    | local disk         | MinIO/R2 in Phase 1              |
| Payment    | mock stub          | Stripe + Flutterwave in Phase 2  |
| AI/Search/FX/Push/Shipping | stubbed in `types.ts` | fleshed out per phase |

## PWA

`public/manifest.webmanifest` + `public/sw.js` give a basic offline
shell. Phase 5 upgrades to Serwist with precaching, offline shortlist,
and web push.

## Observability

`src/lib/logger.ts` exports a pino logger with auto-redaction of common
secret fields. Sentry (`SENTRY_DSN`) is a Phase 5 addition.

## Testing

- Unit: Vitest + Testing Library (JSDOM).
- E2E: Playwright (Phase 0 adds the register→verify→login smoke test).
- Contract tests for the Unity protocol live in `packages/unity-contract/src/*.test.ts`.
