# Backlog

Open items picked up as work advances. Reference spec IDs where applicable.

## Phase 0 follow-ups

- [ ] Session revocation hook so logging out invalidates the JWT immediately (see ADR-0003).
- [ ] Rate limit on `registerAction`, `loginAction`, `resendVerificationAction` once Redis is wired (Phase 1).
- [ ] Add a CSRF double-submit cookie layer for server actions (currently relying on Next.js same-origin defaults).
- [ ] Replace favicon + manifest icons with real brand assets once the final name is picked.

## Phase 1 candidates

- [ ] Password reset flow (PRD US-1.2).
- [ ] Email verification resend rate limit and audit log entries.
- [ ] Switch `SmtpEmailProvider` to Resend REST for production.

## Spec open items (from PRD §17)

- [ ] Final product name and logo.
- [ ] Enable physical / print checkout before the demo.
- [ ] Commission, buyer fee, featured package prices.
- [ ] Escrow auto-release and dispute windows.
- [ ] Curator approval workflow vs. admin-granted.
- [ ] Decide whether to run a closed pilot.
- [ ] Supported currencies beyond the default eight.
- [ ] Unity build hosting origin and version.
- [ ] Kinyarwanda and French review owner and date.
