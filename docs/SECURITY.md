# Security

Phase 0 baseline. Full checklist tracked in spec §12.

## In place

- Strict security headers on every response (`X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
- Password hashing: argon2id (`@node-rs/argon2`) with OWASP-recommended
  parameters.
- Email verification tokens are random 32-byte URL-safe strings; only
  their SHA-256 hash is stored.
- Secrets never land in source. `.env` is git-ignored; `.env.example`
  is the only committed env file.
- Env validation fails fast at process start — a missing `AUTH_SECRET`
  halts the server before it accepts traffic.
- Audit log captures `user.register` and `user.email_verified`.
- Resend-verification endpoint responds uniformly whether or not the
  account exists, to prevent account enumeration.
- All auth state changes are server actions (same-origin by Next.js
  default), not open REST.

## Follow-ups

- CSRF double-submit cookie on server actions (Phase 1).
- Rate limiting via Upstash sliding window (Phase 1).
- Turnstile bot challenge on register + login (Phase 1).
- Session revocation (Phase 1).
- 2FA / TOTP (Phase 6).
- Content Security Policy (Phase 5) — relaxed-until-nailed-down for dev.
- Dependency audit in CI and Dependabot (Phase 5).
