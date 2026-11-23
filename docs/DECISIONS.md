# Architecture Decision Records (ADRs)

Short, dated entries. Format: context, decision, consequences.

## ADR-0001 — 2026-11-21 — Codename & branding

**Context.** Spec and PRD use **Kaleido** as the working codename. Repo
directory is `Glo-Art`.

**Decision.** `BRAND_NAME=Kaleido` by default; the directory name is
kept as `Glo-Art` because it has no product-facing meaning. The final
name is a spec §17 open question for the owner.

**Consequences.** Every user-facing string uses the `app.brand` i18n key,
so a rename is a single-file change plus env flip.

**Superseded by ADR-0006** on 2026-11-22.

---

## ADR-0002 — 2026-11-21 — Monorepo tool

**Context.** Spec §3.3 asks for pnpm workspaces to share the Unity
contract between web and tests.

**Decision.** pnpm 9 with corepack-managed activation. No Turborepo (not
needed at Phase 0 scale; tasks are `pnpm -r …`).

**Consequences.** Simpler toolchain. If tasks fan out later, revisit.

---

## ADR-0003 — 2026-11-21 — Session strategy

**Context.** Auth.js v5 supports database sessions (Prisma) or JWT.

**Decision.** JWT sessions for now. Reason: the Unity WebGL module will
receive short-lived bearer tokens issued from the same signing secret
(spec §8.2), and keeping both on JWTs removes a lookup per Unity call.
Database `Session` rows are still created by the adapter for OAuth
flows; we just do not rely on them for session lifecycle.

**Consequences.** Logging a user out instantly requires a token-revocation
hook — tracked in `docs/BACKLOG.md` for Phase 1.

---

## ADR-0004 — 2026-11-21 — Password hashing parameters

**Context.** Spec requires argon2id. OWASP cheatsheet recommends tuning
to about 1 second on target hardware.

**Decision.** `memoryCost: 19456 KiB`, `timeCost: 2`, `parallelism: 1`
via `@node-rs/argon2`. Same values hard-coded in `src/server/auth/password.ts`
and `prisma/seed.ts`.

**Consequences.** Rebenchmark before production. Tracked in Phase 5
security pass.

---

## ADR-0006 — 2026-11-22 — Final product name: Glo Art

**Context.** PRD §17 listed the final product name as an open question
with placeholder `Kaleido`. Owner picked **Glo Art**.

**Decision.** User-facing brand is **Glo Art**, configured via
`BRAND_NAME=Glo Art` in `apps/web/.env`. Changed in user-facing surfaces:

- `BRAND_NAME` env default
- i18n `app.brand` (en/fr/rw) and locale-specific strings ("Sell on …")
- `public/manifest.webmanifest` (`name`, `short_name`)
- `public/sw.js` cache name
- `README.md`, `CLAUDE.md`, `docs/*`

**Intentionally not renamed** (internal only, cost > benefit):

- pnpm package scope `@kaleido/web`, `@kaleido/unity-contract`
- Docker container names `kaleido-postgres`, `kaleido-mailhog`, `kaleido-minio`, `kaleido-redis`
- Local DB name `kaleido`
- `PRD.md` and `productspec.md` — kept as historical specification; their inline `Kaleido` references are codename-of-record for traceability

**Consequences.** All in-product UI, emails, PWA metadata, and public
docs now say "Glo Art". If a full internal rename is wanted later,
it's a mechanical find-replace plus `docker compose down -v` and a
fresh install.

---

## ADR-0005 — 2026-11-21 — Email verification token storage

**Context.** Spec §12 requires that a DB compromise cannot forge
verification links.

**Decision.** Generate a 32-byte random URL-safe token; send the token
in the link; store **only** its SHA-256 hash in
`EmailVerificationToken.tokenHash`. On verification, hash the incoming
token and look it up. Tokens are single-use (`consumedAt`) and expire
in 30 minutes (spec PRD US-1.2).

**Consequences.** Users can request a resend; old tokens remain valid
until expiry (not revoked on resend). If we need stricter behavior, add
a bulk-consume step on resend.
