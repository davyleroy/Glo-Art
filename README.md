# Glo Art — Global Art Marketplace with AR/VR Gallery

> A web app, installable as a PWA, where artists worldwide sell to buyers worldwide through fixed-price listings and timed auctions, with a Unity-WebGL AR/VR gallery experience.

See [`PRD.md`](./PRD.md) and [`productspec.md`](./productspec.md) for the full specification. See [`CLAUDE.md`](./CLAUDE.md) for the agent operating constraints and definition of done.

## Status

Phase 0 — Foundation. See [`docs/STATUS.md`](./docs/STATUS.md).

## Local setup

Requires Node 20+, pnpm 9+ (via corepack), Docker.

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate

pnpm install
cp .env.example .env
docker compose up -d                              # postgres, mailhog, minio, redis
pnpm --filter @kaleido/web prisma migrate dev
pnpm --filter @kaleido/web prisma db seed
pnpm dev                                          # http://localhost:3000
```

Mail inbox (dev): http://localhost:8025
MinIO console: http://localhost:9001 (user/pass: `minio`/`minio123`)

> **Note:** the internal pnpm package scope is still `@kaleido/*` and the
> docker containers / local DB are still named `kaleido-*`. These are
> purely internal; the user-facing brand is **Glo Art** (configured via
> `BRAND_NAME` in `apps/web/.env`). See ADR-0006.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Repository layout

```
apps/web/                      Next.js app (app router, strict TS)
packages/unity-contract/       postMessage + REST types for Unity
packages/unity-mock-host/      standalone mock Unity host for the web team
docs/                          architecture, ADRs, runbook, security, demo script
docker-compose.yml             local infra: postgres + mailhog + minio + redis
```
