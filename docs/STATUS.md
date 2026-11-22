# Status

Living snapshot of what's done, stubbed, and up next. The build log in
git is the source of truth for diffs; this file is a human orientation.

## Current phase

**Phase 0 — Foundation.** Exit gate (spec §17): "a user can register,
verify email (MailHog), log in, switch locale, see role-aware nav;
CI green; `docs/ARCHITECTURE.md` drafted."

## Completed in Phase 0

- Monorepo (pnpm workspaces): `apps/web`, `packages/unity-contract`,
  `packages/unity-mock-host`.
- Docker compose: Postgres 16 + pgvector + pg_trgm, MailHog, MinIO, Redis.
- Env validation (zod) in `apps/web/src/lib/env.ts`; full `.env.example`
  checked in.
- Prisma identity baseline: `User`, `UserRole`, `Account`, `Session`,
  `VerificationToken`, `EmailVerificationToken`, `PasswordResetToken`,
  `AuditLog`.
- Provider container (`src/server/container.ts`) with Email (SMTP +
  console), Realtime (memory), Storage (local disk), Payment (stub).
- Auth.js v5 + Credentials + Google (auto-enabled when creds present)
  with argon2id, email-verification tokens hashed at rest.
- RBAC policy module with permission-matrix unit tests.
- i18n: `en/fr/rw` message files, routing via next-intl with locale
  prefix, parity test, locale switcher component.
- App shell: root layout with Fraunces + Inter, Afro-contemporary
  design tokens, header with role-aware nav, footer, verification
  banner.
- Auth pages: register, login, verify-email landing, "verification
  email sent" page, dashboard.
- PWA: `manifest.webmanifest` + basic service worker shell + offline
  page.
- Health endpoints: `/api/health`, `/api/health/ready`, `/api/version`.
- GitHub Actions CI: lint, typecheck, unit tests, format check.
- Docs: `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` (ADR-0001..0005),
  this file.

## Stubbed / deferred

- Google OAuth button is only rendered once `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`
  are supplied. Phase 0 flow works without Google.
- Password reset (US-1.2) exists at the schema level; the form and
  email template land in Phase 1.
- Sentry is wired via env but not yet imported at runtime (Phase 5).
- Rate limiting against Upstash Redis — placeholder env; enforced in
  Phase 1 when auth endpoints become network-reachable.
- PWA offline shell is minimal; Serwist precaching + offline shortlist
  lands in Phase 5.
- Unity mock host is a package placeholder only (Phase 4 builds the
  real one).

## Next

Phase 1 — Artists and catalog. See spec §17. First task: storage
provider backed by MinIO/R2 and image upload pipeline.

## How to run Phase 0 locally

```bash
corepack enable && corepack prepare pnpm@9.15.0 --activate
pnpm install
cp .env.example .env
docker compose up -d
pnpm --filter @kaleido/web prisma migrate dev
pnpm --filter @kaleido/web prisma db seed   # creates admin@kaleido.local / Password123!
pnpm dev
```

Open http://localhost:3000. The URL immediately redirects to
`/en`. Register a new account; the verification email lands in the
MailHog inbox at http://localhost:8025. Click the link to verify, then
sign in; you should see the dashboard and the role-aware nav.
