# Runbook

Operational cheatsheet. Fills out as each phase exposes new ops concerns.

## Local dev

- Services: `docker compose up -d` brings up Postgres, MailHog, MinIO, Redis.
- Migrations: `pnpm db:migrate` (dev), `pnpm --filter @kaleido/web prisma migrate deploy` (CI/prod).
- Seed: `pnpm db:seed` (idempotent; creates admin + buyer).
- Reset DB (data loss): `pnpm db:reset`.

## Mail

Dev inbox: http://localhost:8025 (MailHog). All email is captured; no
mail leaves your machine.

## Object storage

Dev console: http://localhost:9001 (MinIO). User `minio` / `minio123`.
Buckets `kaleido-public` (anonymous download) and `kaleido-private`
(signed URLs only) are created by the `minio-init` compose service on
first boot.

## Common problems

- **"env … is required"** on startup: copy `.env.example` → `.env` and
  fill `AUTH_SECRET` (`openssl rand -base64 32`).
- **Prisma extensions missing**: the `postgres` service runs
  `docker/postgres/init.sql` which creates `citext`, `pg_trgm`,
  `vector`. If you use an external Postgres, run that SQL manually.
- **Login succeeds but redirect fails**: `AUTH_URL` must match the
  origin you're hitting; locally set to `http://localhost:3000`.

## Observability (planned)

- Sentry: set `SENTRY_DSN`. Phase 5 wires the runtime hook.
- Logs are structured JSON via pino; piped through `pino-pretty` in dev.
