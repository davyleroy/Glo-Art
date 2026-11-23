# CLAUDE.md — Agent operating constraints

Product name: **Glo Art** (was codename "Kaleido" in the spec; see ADR-0006).


Source of truth: `productspec.md` and `PRD.md`. This file distills the non-negotiable constraints (spec §0.2) and the Definition of Done (spec §19) that must survive context resets.

## Non-negotiable constraints (spec §0.2)

- Stack is fixed: Next.js (App Router) + TypeScript (strict) + PostgreSQL + Prisma + Tailwind + shadcn/ui. Do not swap it.
- Money is stored as integer minor units plus an ISO 4217 currency code. Never use floats for money.
- Payment, shipping, storage, email, realtime, search/AI, and Unity transport are all behind provider interfaces with a mock implementation.
- Payment card data never touches our servers. Payment UI is never rendered inside the Unity iframe.
- All state transitions for orders, auctions, disputes, and listings go through explicit state machines with tests. No ad-hoc status updates.
- Every mutating endpoint is authenticated (unless explicitly public), authorized by role and ownership, rate limited, validated, and audit logged where §12 requires.
- All user-facing strings exist in `en`, `fr`, and `rw` message files.

## Operating rules (spec §0.1)

1. Build in the phases of spec §17. Do not start a phase until the previous phase's exit criteria pass.
2. Requirement IDs (`AUTH-03`, `AUC-07`, ...) are stable. Reference them in commit messages, test names, PR descriptions.
3. Priority tags: **P0** = demo cut-line, **P1** = complete product, **P2** = stretch, **P3** = documented-only or stubbed.
4. Where the spec says "behind an interface", write the interface first, implement the mock provider first, then the real provider. The mock must remain selectable by environment variable.
5. Never hard-code secrets. Always update `.env.example` when adding a variable. Never commit `.env*` files other than `.env.example`.
6. Every feature ships with: types, validation (zod), authorization checks, unit tests, at least one integration or E2E test for the happy path, i18n keys (no raw strings in components), and an accessibility pass.
7. When the spec is ambiguous, pick the most conventional option, record it in `docs/DECISIONS.md` (short ADR), and continue. Ask the human only if blocked by a missing credential or an irreversible choice.
8. Keep the repo green: `pnpm lint && pnpm typecheck && pnpm test` must pass before every commit.
9. Maintain `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/UNITY_INTEGRATION.md`, `docs/DEMO_SCRIPT.md` as the build progresses.

## Definition of Done (spec §19)

A requirement is done only when:

- Behavior matches the requirement and its acceptance criteria.
- Types strict, no `any` without a justified comment; lint and format clean.
- Authorization enforced server-side and covered by tests (including a negative test).
- Inputs validated; errors use problem-details with stable codes.
- Unit/integration tests written and passing; E2E for user-visible flows.
- i18n keys present in `en`, `fr`, `rw` (key-parity test passes).
- Accessible: keyboard operable, labeled, contrast verified, axe clean on the page.
- Loading, empty, and error states implemented.
- Mobile layout verified at 360 px.
- Analytics events fired where defined; audit logs written where §12 requires.
- Docs updated (API via OpenAPI, ADR if a decision was made, README snippet).
- No secrets, no TODO without a linked issue in `docs/BACKLOG.md`.
- Provider code has a working Mock and the Mock path is tested.

## Project-level gates before calling the build complete

All P0 requirements done, CI green on main, Lighthouse budgets met, security checklist complete, demo script rehearsed end to end on a mid-range phone, Unity contract tests pass against the peer's build (or the mock module if the build is unavailable).
