# PRODUCT SPEC: Global Art Marketplace with AR/VR Gallery Integration

> Working codename: **Kaleido** (placeholder, configurable through `BRAND_NAME`).
> Document status: v1.0, source of truth for the build agent.
> Audience: an autonomous AI coding agent (Claude Code) building the web app from zero, plus the human owner (Davy) and the Unity developer (peer) who plugs the AR/VR module in.

---

## 0. HOW THE AGENT MUST USE THIS DOCUMENT

### 0.1 Operating rules

1. Read this entire file before writing code. Then copy Section 0.2 and Section 19 (Definition of Done) into `CLAUDE.md` at the repo root so they survive context resets.
2. Build in the phases of Section 17. Do not start a phase until the previous phase's exit criteria pass.
3. Requirement IDs (for example `AUTH-03`, `AUC-07`) are stable. Reference them in commit messages, test names, and PR descriptions.
4. Priority tags: **P0** = needed for the capstone demo (MVP cut-line), **P1** = expected of a complete product, **P2** = stretch, **P3** = documented-only or stubbed.
5. Where this document says "behind an interface", write the interface first, implement the mock provider first, then the real provider. The mock must always remain selectable by environment variable so the demo can never be blocked by a third party.
6. Never hard-code secrets. Always update `.env.example` when you add a variable. Never commit `.env*` files other than `.env.example`.
7. Every feature ships with: types, validation (zod), authorization checks, unit tests, at least one integration or E2E test for the happy path, i18n keys (no raw strings in components), and an accessibility pass.
8. When the spec is ambiguous, pick the most conventional option, record the decision in `docs/DECISIONS.md` (ADR style, one short entry), and continue. Ask the human only if blocked by a missing credential or an irreversible choice.
9. Keep the repo green: `pnpm lint && pnpm typecheck && pnpm test` must pass before every commit.
10. Maintain `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/API.md` (generated from OpenAPI), `docs/UNITY_INTEGRATION.md`, and `docs/DEMO_SCRIPT.md` as the build progresses.

### 0.2 Non-negotiable constraints (paste into CLAUDE.md)

- Stack is fixed: Next.js (App Router) + TypeScript (strict) + PostgreSQL + Prisma + Tailwind + shadcn/ui. Do not swap it.
- Money is stored as integer minor units plus an ISO 4217 currency code. Never use floats for money.
- Payment, shipping, storage, email, realtime, search/AI, and Unity transport are all behind provider interfaces with a mock implementation.
- Payment card data never touches our servers. Payment UI is never rendered inside the Unity iframe.
- All state transitions for orders, auctions, disputes, and listings go through explicit state machines with tests. No ad-hoc status updates.
- Every mutating endpoint is authenticated (unless explicitly public), authorized by role and ownership, rate limited, validated, and audit logged where Section 12 requires.
- All user-facing strings exist in `en`, `fr`, and `rw` message files.

---

## 1. PRODUCT OVERVIEW

### 1.1 One-paragraph description

A web application, installable as a PWA (and optionally wrapped for app stores), where artists worldwide sell artwork directly to buyers worldwide through fixed-price listings and timed auctions. Buyers can browse a catalog, follow artists, chat with them, and buy with international payment rails (Stripe, Flutterwave, plus a mock fallback and a crypto/wallet option that is designed but not enabled). A distinguishing feature is an immersive AR/VR gallery, built in Unity by a peer and embedded as a WebGL module: curators build virtual galleries, buyers walk through them, shortlist the pieces they like, preview art in their own room with AR, and can start checkout from inside the experience. This spec covers everything except the Unity internals: the web app, backend, data, payments, trust and safety, and a precise integration contract for the Unity module.

### 1.2 Goals

- G1: A complete, believable, secure marketplace that a stranger could use end to end without help.
- G2: A first-class Unity integration contract so the peer can build against a stable API and a mock host without waiting for this app.
- G3: Trust between strangers worldwide: artist verification, escrow-style payout holds, disputes, and provenance records.
- G4: Works on low bandwidth and mid-range phones (PWA, image optimization, offline shell).
- G5: Multi-language (English, French, Kinyarwanda) and multi-currency display.
- G6: Capstone-grade engineering: tests, CI/CD, observability, documentation, security.

### 1.3 Non-goals (v1)

- Native Unity internals, scene authoring, 3D rendering logic (owned by the peer).
- Live crypto/wallet payments and NFT minting (interface and UI stub only, disabled).
- Physical shipping logistics: label purchase, carrier rates, customs. Physical goods exist in the catalog but are not transactable in v1 (see Section 1.5).
- Native iOS/Android codebases. Mobile is PWA first, Capacitor wrapper optional (P2).
- Tax filing, VAT/GST calculation per jurisdiction (documented as future work; a simple configurable tax-rate hook exists).

### 1.4 Decisions locked from the discovery interview

| Topic             | Decision                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Sales model       | Fixed-price listings plus optional timed auctions                                                                                  |
| Product types     | Physical artworks, digital art, 3D/AR-VR assets, prints/merch on demand                                                            |
| Payments          | Stripe (Connect, sandbox) + Flutterwave, plus a Mock provider as demo fallback, plus a Crypto/Wallet provider stubbed and disabled |
| Mobile            | PWA first                                                                                                                          |
| Stack             | Next.js + TypeScript + PostgreSQL                                                                                                  |
| Roles             | Buyer, Artist/Seller, Admin/Moderator, Curator/Gallery                                                                             |
| Trust             | Escrow-style payout hold, artist verification (KYC-lite), dispute + refund flow, authenticity/provenance records                   |
| Localization      | English, French, Kinyarwanda, multi-currency display                                                                               |
| Unity integration | Unity WebGL embedded in an iframe, postMessage + REST contract                                                                     |
| Walkthrough flow  | Shortlist sync, AR in-room placement, curator-built virtual galleries, buy from inside VR (via checkout handoff)                   |
| Depth             | Full production-grade spec, no fixed deadline, phases by priority                                                                  |
| Extras            | Real-time chat and notifications, analytics dashboards, AI features, social layer                                                  |
| Money model       | Commission per sale, featured/promoted listings, buyer-side service fee                                                            |
| Shipping          | Out of scope for v1: digital and AR/VR assets are the transactable types                                                           |
| Brand             | Placeholder name, Afro-contemporary gallery look                                                                                   |

### 1.5 Reconciliation note: physical goods vs "shipping out of scope"

The interview lists physical artworks and prints/merch as product types, but also puts shipping out of scope. Resolution used in this spec (override only if the owner says otherwise):

- Physical (`PHYSICAL`) and print-on-demand (`PRINT`) listings are fully supported in the **catalog, artist dashboard, social layer, VR galleries, shortlist, AR preview, and chat**.
- **Checkout for these types is gated** behind feature flag `FEATURE_PHYSICAL_CHECKOUT` (default `false`). When off, the "Buy" button becomes **"Inquire about this piece"**, which opens a chat thread with the artist and records a `PURCHASE_INQUIRY` event.
- The `ShippingProvider` interface, address model, and `Order.fulfillmentType` are built so enabling the flag later requires only a provider implementation (a `ManualShippingProvider` with artist-entered tracking is specified in Section 7.6 as P3).
- **Transactable in v1:** `DIGITAL` and `ASSET_3D` listings, for both fixed-price and auction sales.

---

## 2. USERS, ROLES, AND PERMISSIONS

### 2.1 Personas

- **Amina, emerging artist (Kigali):** wants a global audience, low fees, fast payout, a professional storefront, and her art shown in virtual galleries.
- **Lucas, collector (Lyon):** wants to discover diverse African and diaspora artists, trust authenticity, bid in auctions, and preview pieces on his wall.
- **Grace, curator (Nairobi):** assembles themed virtual exhibitions, invites artists, and shares gallery links.
- **Moderator Ines:** reviews artist verifications, flagged listings, and disputes.

### 2.2 Roles

A user has one account and can hold multiple roles. `BUYER` is granted at sign-up. `ARTIST` requires onboarding and verification. `CURATOR` requires an application approved by an admin (P1) or admin grant (P0). `ADMIN` and `MODERATOR` are granted only by an admin.

### 2.3 Permission matrix (summary)

| Capability                                    | Guest | Buyer | Artist                     | Curator                                      | Moderator         | Admin |
| --------------------------------------------- | ----- | ----- | -------------------------- | -------------------------------------------- | ----------------- | ----- |
| Browse catalog, artist pages, galleries       | Yes   | Yes   | Yes                        | Yes                                          | Yes               | Yes   |
| Like, follow, comment, shortlist              | No    | Yes   | Yes                        | Yes                                          | Yes               | Yes   |
| Bid, buy, chat, review                        | No    | Yes   | Yes (not own)              | Yes                                          | Yes               | Yes   |
| Create/edit own listings                      | No    | No    | Yes (verified for publish) | No                                           | No                | Yes   |
| Run auctions                                  | No    | No    | Yes (verified)             | No                                           | No                | Yes   |
| Create virtual galleries                      | No    | No    | Yes (own work only)        | Yes (any published work with artist consent) | No                | Yes   |
| Approve artist verification                   | No    | No    | No                         | No                                           | Yes               | Yes   |
| Moderate listings, comments, reports          | No    | No    | No                         | No                                           | Yes               | Yes   |
| Resolve disputes, issue refunds               | No    | No    | No                         | No                                           | Yes (up to limit) | Yes   |
| Platform settings, fees, roles, feature flags | No    | No    | No                         | No                                           | No                | Yes   |

Authorization is enforced server-side with a central policy module (`src/server/authz/policies.ts`) using a `can(user, action, resource)` function. UI hiding is a convenience only. Include a policy unit-test table covering every row above.

---

## 3. TECH STACK AND ARCHITECTURE

### 3.1 Stack

| Layer           | Choice                                                                                                                                          | Notes                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Framework       | Next.js (App Router, React Server Components), TypeScript strict                                                                                | Route handlers for REST, server actions only for simple same-origin form mutations |
| UI              | Tailwind CSS, shadcn/ui, Radix primitives, Lucide icons, Framer Motion (sparingly)                                                              | Design tokens in Section 14                                                        |
| DB              | PostgreSQL 16 (Neon in prod, Docker locally)                                                                                                    | `pgvector` and `pg_trgm` extensions                                                |
| ORM             | Prisma                                                                                                                                          | Migrations committed                                                               |
| Auth            | Auth.js (NextAuth v5): email+password (argon2id), Google OAuth, email magic link, optional TOTP 2FA                                             | JWT access token for API clients (Unity), database sessions for web                |
| Validation      | zod everywhere, shared schemas in `src/schemas`                                                                                                 | OpenAPI generated from zod                                                         |
| Storage         | S3-compatible (Cloudflare R2 in prod, MinIO locally)                                                                                            | Signed URLs, `StorageProvider` interface, local-disk mock                          |
| Realtime        | `RealtimeProvider` interface: Pusher Channels or Ably in prod, SSE + polling fallback, in-memory mock                                           | Serverless-safe                                                                    |
| Background jobs | Inngest (works with Vercel), fallback to a Vercel Cron route plus a DB-backed job table                                                         | Auction closing, escrow release, emails, exchange rates                            |
| Email           | Resend (prod), console/MailHog (dev) behind `EmailProvider`                                                                                     | React Email templates                                                              |
| Search          | Postgres full-text + `pg_trgm` for keyword/typo tolerance; `pgvector` for semantic search                                                       | `SearchProvider` interface                                                         |
| AI              | `AIProvider` interface (default Anthropic API for text and vision; embeddings via a configurable provider), mock returns deterministic fixtures | All AI is optional and degrades gracefully                                         |
| Rate limiting   | Upstash Redis (prod) or in-memory (dev)                                                                                                         | Sliding window                                                                     |
| Cache           | Next.js cache + Upstash Redis for hot reads and auction state                                                                                   |                                                                                    |
| Observability   | Sentry (errors), OpenTelemetry traces, structured JSON logs (pino), Vercel Analytics                                                            |                                                                                    |
| Testing         | Vitest, Testing Library, Playwright, axe-core, k6 (auction load)                                                                                | Section 15                                                                         |
| CI/CD           | GitHub Actions + Vercel previews + Neon branch DBs                                                                                              | Section 16                                                                         |
| Package manager | pnpm workspaces                                                                                                                                 | Monorepo layout below                                                              |
| PWA             | Serwist (service worker), web app manifest, VAPID web push                                                                                      | Section 9                                                                          |

### 3.2 High-level architecture

```
Browser / PWA                    Unity WebGL (iframe, peer-built)
   |  React UI (RSC + client)         |  postMessage (kv.v1)  +  REST (Bearer vr token)
   v                                  v
+-----------------------------------------------------------+
|                 Next.js app (Vercel)                      |
|  Route handlers /api/v1/*   |   Server components        |
|  authz policies | services | state machines | providers   |
+--------+--------------+-------------+-----------+---------+
         |              |             |           |
   PostgreSQL      S3/R2 storage   Redis      Inngest jobs
   (+pgvector)     (signed URLs)   (limits,   (auctions, escrow,
                                    cache)     email, rates)
         |
  Providers (all behind interfaces, each with a Mock):
  Payment{Stripe,Flutterwave,Mock,Crypto(stub)}  Email  Realtime
  Storage  Shipping(stub)  AI  Search  Exchange rates  Push
```

Layering rule: `route handler -> service -> repository (Prisma) -> DB`. Handlers parse/validate and call services. Services hold business rules and are the only place state machines are invoked. Providers are injected through a small container (`src/server/container.ts`) chosen by environment variables.

### 3.3 Repository layout

```
/
  apps/
    web/                      Next.js app
      src/
        app/                  routes: (public), (auth), (buyer), (artist), (curator), (admin), api/v1
        components/           ui/ (shadcn), domain/ (ArtworkCard, BidPanel, ...)
        server/
          authz/ services/ repositories/ providers/ jobs/ state-machines/ container.ts
        schemas/              zod schemas shared by API and forms
        i18n/                 messages/en.json fr.json rw.json, config
        lib/                  money.ts, dates.ts, errors.ts, env.ts, logger.ts
      prisma/                 schema.prisma, migrations/, seed/
      public/
        unity/                (placeholder) peer drops WebGL build here
      tests/                  unit/, integration/, e2e/, a11y/, load/
  packages/
    unity-contract/           TypeScript types + JSON Schema for postMessage + REST manifests
    unity-mock-host/          standalone page that mimics Unity module for the web team (and a mock host for the Unity dev)
  docs/                       ARCHITECTURE.md API.md UNITY_INTEGRATION.md DECISIONS.md DEMO_SCRIPT.md RUNBOOK.md SECURITY.md
  .github/workflows/
  docker-compose.yml          postgres, minio, mailhog, redis
  CLAUDE.md  README.md  CHANGELOG.md  .env.example
```

### 3.4 Environments

`local` (Docker), `preview` (per PR, Neon branch, mock providers by default), `staging` (real sandboxes), `production` (demo-grade, sandbox keys unless owner decides otherwise). Each environment has a documented env matrix in `docs/RUNBOOK.md`.

---

## 4. DOMAIN MODEL

Prisma-style sketch. The agent writes the full `schema.prisma`; names below are binding, extra fields allowed. All tables have `id` (cuid2), `createdAt`, `updatedAt`. Soft-delete (`deletedAt`) on user-generated content. Index every foreign key and every column used in filters or sorts.

### 4.1 Identity

- `User`: email (unique, citext), emailVerifiedAt, passwordHash?, displayName, username (unique), avatarUrl, bio, country (ISO 3166), locale (`en|fr|rw`), preferredCurrency, timezone, status (`ACTIVE|SUSPENDED|DELETED`), twoFactorSecret? (encrypted), lastLoginAt.
- `UserRole`: userId, role (`BUYER|ARTIST|CURATOR|MODERATOR|ADMIN`), grantedById, grantedAt.
- `Account`, `Session`, `VerificationToken` (Auth.js standard).
- `ArtistProfile`: userId (unique), storeSlug (unique), storeName, statement, location, socialLinks (json), portfolioLinks (json), languages, payoutCurrency, stripeAccountId?, flutterwaveSubaccountId?, verificationStatus (`NONE|PENDING|APPROVED|REJECTED|REVOKED`), verifiedAt, tier (`FREE|PRO`, P2), commissionOverrideBps?.
- `VerificationRequest`: artistProfileId, status, submittedDocs (relation to `VerificationDocument`), portfolioNotes, reviewerId?, decisionReason?, decidedAt.
- `VerificationDocument`: requestId, storageKey (private bucket, encrypted at rest), docType (`GOV_ID|PROOF_OF_WORK|SELFIE`), uploadedAt. Never expose through public URLs. Delete 90 days after decision unless required by dispute.
- `CuratorProfile`: userId, displayName, bio, approvedAt.

### 4.2 Catalog

- `Artwork`: artistProfileId, title, slug, description (rich text, sanitized), type (`PHYSICAL|DIGITAL|ASSET_3D|PRINT`), medium, style, year, dimensions (width, height, depth, unit), orientation, editionSize?, editionNumber?, priceAmount, priceCurrency, saleMode (`FIXED|AUCTION|BOTH_EXCLUSIVE`), status (`DRAFT|PENDING_REVIEW|PUBLISHED|SOLD|ARCHIVED|REJECTED|SUSPENDED`), rejectionReason?, aiTags (json), embedding (vector(1024)?), viewCount, likeCount, publishedAt, isFeaturedUntil?.
- `ArtworkMedia`: artworkId, kind (`IMAGE|VIDEO|GLB|USDZ|THUMBNAIL`), storageKey, width, height, bytes, altText (per locale json), sortOrder, watermarked (bool).
- `Asset3D`: artworkId, glbKey, usdzKey?, polyCount, textureBytes, boundingBox (json: meters), realWorldScale (meters), defaultPlacement (`WALL|FLOOR|TABLE`), validatedAt, validationReport (json).
- `DigitalFile`: artworkId, storageKey (private), fileName, bytes, mime, checksumSha256, virusScanStatus (`PENDING|CLEAN|INFECTED`), licenseId.
- `License`: artworkId, type (`PERSONAL|COMMERCIAL|EXTENDED`), termsMarkdown (per locale), allowsResale (bool).
- `Category`, `Tag`, `ArtworkTag`, `ArtworkCategory`.
- `ProvenanceRecord`: artworkId, sequence, event (`CREATED|LISTED|SOLD|TRANSFERRED|VERIFIED|DISPUTED_RESOLVED`), fromUserId?, toUserId?, orderId?, notes, hash (sha256 of canonical payload + previous hash). This forms a tamper-evident hash chain.
- `Certificate`: artworkId, orderId, buyerId, serial (unique, human-friendly), pdfKey, qrPayload (verification URL), issuedAt, revokedAt?.

### 4.3 Selling

- `Auction`: artworkId (unique active), startsAt, endsAt, originalEndsAt, startPrice, reservePrice?, bidIncrementRule (json: tiered), currency, status (`SCHEDULED|LIVE|ENDED_SOLD|ENDED_NO_BIDS|ENDED_RESERVE_NOT_MET|PAYMENT_PENDING|SETTLED|DEFAULTED|CANCELLED`), antiSnipeWindowSec, antiSnipeExtendSec, winningBidId?, paymentDueAt?.
- `Bid`: auctionId, bidderId, amount, maxAutoBid? (proxy bidding, P1), placedAt, isWinning, source (`WEB|VR|API`). Unique (auctionId, amount).
- `Cart`, `CartItem` (artworkId, unitPrice snapshot optional), `Shortlist` (one default per user, plus named shortlists P1), `ShortlistItem` (artworkId, galleryId?, note, addedFrom `WEB|VR|AR`).
- `Order`: buyerId, status, subtotalAmount, buyerFeeAmount, taxAmount, totalAmount, currency, paymentProvider, paymentIntentRef, fulfillmentType (`DIGITAL|PHYSICAL`), idempotencyKey, auctionId?, placedAt, paidAt, deliveredAt, completedAt, cancelledAt.
- `OrderItem`: orderId, artworkId, artistProfileId, unitAmount, commissionBps, commissionAmount, artistNetAmount, licenseId?, downloadCount.
- `Payment`: orderId, provider, providerRef, status (`REQUIRES_ACTION|PENDING|AUTHORIZED|CAPTURED|FAILED|REFUNDED|PARTIALLY_REFUNDED`), amount, currency, rawLastEvent (json), createdAt.
- `PaymentEvent`: provider, eventId (unique, for webhook idempotency), type, payload (json), processedAt.
- `EscrowHold`: orderItemId, amount, currency, status (`HELD|RELEASE_SCHEDULED|RELEASED|REFUNDED|FROZEN`), releaseAfter, releasedAt, frozenReason.
- `Payout`: artistProfileId, amount, currency, provider, providerRef, status (`PENDING|PAID|FAILED`), escrowHoldIds.
- `Refund`: orderId, amount, reason, initiatedById, providerRef, status.
- `Dispute`: orderId, openedById, reason (`NOT_AS_DESCRIBED|FILE_CORRUPT|NOT_DELIVERED|UNAUTHORIZED|OTHER`), status (`OPEN|AWAITING_ARTIST|AWAITING_BUYER|UNDER_REVIEW|RESOLVED_REFUND|RESOLVED_PARTIAL|RESOLVED_RELEASE|CLOSED`), resolution notes, resolvedById, resolvedAt. `DisputeEvidence`, `DisputeMessage`.
- `FeaturedPromotion`: artworkId, buyerOfPromotion (artistProfileId), package (`DAYS_3|DAYS_7|DAYS_14`), amount, startsAt, endsAt, paymentRef, status.
- `FeeConfig`: scope (`GLOBAL|ARTIST|CATEGORY`), commissionBps, buyerFeeBps, buyerFeeFixedAmount, minFee, effectiveFrom. Defaults: commission 1200 bps (12%), buyer fee 300 bps (3%), configurable by admin.
- `ExchangeRate`: base, quote, rate, fetchedAt.

### 4.4 Social and communication

- `Follow` (followerId, artistProfileId or curatorId), `Like` (userId, artworkId), `Collection` + `CollectionItem` (buyer-curated public/private boards), `Comment` (artworkId, parentId?, body, status), `Review` (orderId unique, rating 1-5, body, artist reply), `Report` (reporterId, targetType, targetId, reason, status).
- `Conversation` (type `ARTWORK_INQUIRY|ORDER|DIRECT`, artworkId?, orderId?), `ConversationParticipant`, `Message` (body, attachments, readAt, status), `BlockedUser`.
- `Notification` (userId, type, payload json, readAt, channel flags), `NotificationPreference`, `PushSubscription` (endpoint, keys, userAgent).

### 4.5 Virtual galleries (AR/VR)

- `Gallery`: curatorUserId, title, slug, description (per locale), templateId, status (`DRAFT|PENDING_REVIEW|PUBLISHED|ARCHIVED`), coverMediaKey, theme (json: lighting preset, wall color, floor), visibility (`PUBLIC|UNLISTED|PRIVATE`), viewCount.
- `GalleryTemplate`: key (matches a room prefab id in Unity), name, slots (json: array of `{slotId, position, rotation, maxWidth, maxHeight, kind: WALL|PEDESTAL|FLOOR}`), previewImageKey, unityPrefab.
- `GalleryPlacement`: galleryId, slotId, artworkId, scaleOverride?, notes. Constraint: artwork's artist must have consented (`ArtistGalleryConsent`) when curator is not the artist.
- `ArtistGalleryConsent`: artistProfileId, galleryId, status (`REQUESTED|GRANTED|DECLINED`).
- `VrSession`: userId?, galleryId, startedAt, endedAt, deviceInfo (json), itemsViewed, itemsShortlisted. Used by analytics.

### 4.6 Platform

- `AnalyticsEvent` (anonymousId, userId?, type, entityType, entityId, props json, occurredAt, country). Append-only, partitioned monthly (P2), rolled up by jobs into `DailyMetric`.
- `AuditLog` (actorId, action, entityType, entityId, before json, after json, ip, userAgent, occurredAt). Append-only.
- `FeatureFlag` (key, enabled, rules json). `SystemSetting`.
- `ApiToken` (for VR short-lived tokens, hashed, scope, expiresAt, userId, galleryId?).

---

## 5. STATE MACHINES (implement with a small typed transition table, test every legal and illegal transition)

### 5.1 Artwork

```
DRAFT -> PENDING_REVIEW -> PUBLISHED -> SOLD
                        \-> REJECTED -> DRAFT (after edit)
PUBLISHED -> ARCHIVED | SUSPENDED (moderator) -> PUBLISHED (reinstated)
```

Publishing requires: artist `APPROVED`, at least one image, price or auction config, a license for digital/3D types, and passing automated checks (file validation, AI moderation flag score below threshold). In P0, first-time artists' listings go to `PENDING_REVIEW`; verified artists with 3+ approved listings auto-publish (setting `AUTO_PUBLISH_TRUSTED`).

### 5.2 Order

```
PENDING_PAYMENT -> PAID_HELD -> DELIVERED -> COMPLETED
PENDING_PAYMENT -> EXPIRED | CANCELLED | FAILED
PAID_HELD / DELIVERED -> DISPUTED -> (REFUNDED | COMPLETED | PARTIALLY_REFUNDED)
```

- `PAID_HELD`: payment captured, funds in escrow hold, digital delivery unlocked immediately.
- `DELIVERED`: buyer downloaded/accessed the file at least once or artist marked delivered.
- `COMPLETED`: buyer confirms, or auto-confirm after `ESCROW_AUTO_RELEASE_DAYS` (default 3 for digital, setting) with no open dispute. Release triggers payout scheduling.
- Opening a dispute freezes the hold (`FROZEN`).

### 5.3 Auction

```
SCHEDULED -> LIVE -> ENDED_SOLD -> PAYMENT_PENDING -> SETTLED
                  \-> ENDED_NO_BIDS | ENDED_RESERVE_NOT_MET
PAYMENT_PENDING -> DEFAULTED (not paid within 48h) -> second-chance offer to next highest bidder (P1)
SCHEDULED|LIVE -> CANCELLED (admin only once bids exist)
```

### 5.4 Dispute

`OPEN -> AWAITING_ARTIST -> UNDER_REVIEW -> RESOLVED_*`, with `AWAITING_BUYER` loops for evidence. Each transition writes `DisputeMessage` system entries, notifies both parties, and an audit log row.

### 5.5 Artist verification

`NONE -> PENDING -> APPROVED | REJECTED(reason) -> (resubmit) PENDING`; `APPROVED -> REVOKED` by admin with reason.

---

## 6. FEATURE MODULES (functional requirements)

Each requirement: ID, priority, statement. Where marked "AC", the acceptance criteria are listed in Given/When/Then.

### 6.1 Authentication and account (AUTH)

- AUTH-01 P0: Register with email+password (argon2id, min 10 chars, breached-password check via k-anonymity range API behind a provider, mock offline). Email verification required before bidding, buying, or publishing.
- AUTH-02 P0: Login with email+password, Google OAuth, and magic link.
- AUTH-03 P0: Password reset with single-use, 30-minute tokens; generic responses (no account enumeration).
- AUTH-04 P0: Sessions: httpOnly, secure, SameSite=Lax cookies; session list with revoke (P1).
- AUTH-05 P1: TOTP 2FA, mandatory for ARTIST payout settings changes, ADMIN, and MODERATOR.
- AUTH-06 P0: Role-aware navigation and redirects after login.
- AUTH-07 P0: Account settings: profile, locale, currency, notification prefs, connected providers, delete account (30-day grace, anonymize content, keep legally required order records).
- AUTH-08 P1: Data export (JSON zip) and deletion request flow (privacy compliance).
- AUTH-09 P0: Brute-force protection: 5 failed logins per 15 min per account+IP triggers a backoff and an email alert.

AC (AUTH-01): Given a new visitor, When they register with a valid email and strong password, Then an unverified account is created, a verification email is sent, and attempts to bid return `403 EMAIL_NOT_VERIFIED` with a localized message.

### 6.2 Artist onboarding, store, and verification (ART)

- ART-01 P0: "Become an artist" wizard: store name, slug availability check, bio, location, links, payout country and currency, language(s).
- ART-02 P0: Verification (KYC-lite): upload government ID image, selfie (optional), two proof-of-work links or images. Documents go to a private bucket. Status shown on dashboard.
- ART-03 P0: Moderator queue: view submissions, approve, reject with reason template, request more info. Decision emails the artist and writes audit logs.
- ART-04 P0: Verified badge on profile and cards.
- ART-05 P0: Payout setup: Stripe Connect Express onboarding link (sandbox) or Flutterwave subaccount form or Mock. Show onboarding state and block publishing paid listings until payout is configured (setting; the Mock provider auto-completes).
- ART-06 P0: Public artist storefront `/artists/[slug]`: banner, avatar, statement, listings grid with filters, follower count, verified badge, reviews, "Message artist", "Follow".
- ART-07 P1: Storefront customization: accent color from approved palette, featured piece, announcement bar.
- ART-08 P2: Subscription tiers (`FREE|PRO`) with listing limits and analytics depth (data model present, billing stubbed).

### 6.3 Listings and media (LST)

- LST-01 P0: Multi-step listing editor with autosave drafts: type -> details -> media -> pricing/sale mode -> license (digital/3D) -> preview -> submit.
- LST-02 P0: Image upload with direct-to-storage signed URLs, client-side resize preview, server-side processing (sharp): responsive variants (320, 640, 1280, 2048 webp/avif), blurhash, EXIF stripping (GPS removed), size limit 25 MB per image, max 12 images.
- LST-03 P0: Digital file upload (max 500 MB, resumable multipart), checksum, virus scan hook (`ScanProvider`; mock marks clean; real option ClamAV container). Digital files are never publicly addressable.
- LST-04 P0: 3D asset upload (GLB required, USDZ optional, max 50 MB): validation job checks polygon count (warn above 500k, reject above 2M), texture size (max 4096), glTF validity (`gltf-validator`), real-world scale in meters required from the artist, default placement type. Generates a preview thumbnail (headless render, or artist-supplied if rendering is unavailable).
- LST-05 P0: Watermarked previews for digital art: public views use a lower-resolution watermarked variant; full resolution only after purchase.
- LST-06 P0: Metadata: title, description (markdown subset, sanitized), medium, style, year, dimensions, categories (max 3), tags (max 10), edition info.
- LST-07 P0: Per-locale title/description optional: artist may add `fr` and `rw` versions; fallback to `en`.
- LST-08 P1: Bulk actions: archive, price change, duplicate listing.
- LST-09 P1: AI assist (Section 6.14): suggested description, tags, alt text. Always editable; artist approves.
- LST-10 P0: Listing preview identical to public rendering.
- LST-11 P0: Editions: digital and print listings can have limited edition counts; sold-out state auto-applied.

### 6.4 Discovery: catalog, search, filters (DSC)

- DSC-01 P0: Home page: hero, featured/promoted carousel (clearly labeled "Featured"), trending, new arrivals, live auctions ending soon, featured galleries, featured artists.
- DSC-02 P0: Catalog `/explore` with server-side filtering and cursor pagination: type, category, medium, style, price range (in display currency), orientation, color (dominant color extracted at upload), location of artist (country), sale mode (buy now / auction), verified artists only, has AR/3D preview.
- DSC-03 P0: Sorts: newest, price asc/desc, ending soonest, most liked, trending (view+like decay score), relevance (when searching).
- DSC-04 P0: Keyword search with typo tolerance (`pg_trgm`) across title, artist, tags, and description; autocomplete suggestions (debounced) with recent searches (local).
- DSC-05 P1: Semantic search ("warm abstract with Rwandan hills") via `pgvector` embeddings; falls back to keyword when AI provider is mock/off.
- DSC-06 P1: "More like this" on artwork pages (vector similarity + same artist + same category).
- DSC-07 P0: SEO: SSR pages, canonical URLs, OpenGraph/Twitter cards with the artwork image, JSON-LD (`Product`, `VisualArtwork`, `Offer`), sitemap.xml and robots.txt, hreflang for en/fr/rw.
- DSC-08 P0: Artwork detail page: gallery of media with zoom, 3D viewer (`<model-viewer>`) when GLB exists, "View in your room" (AR) button, provenance summary, license summary, price in buyer currency with original currency shown, bid panel or buy panel, artist card, reviews, comments, related items, report button.
- DSC-09 P1: Saved searches with alerts (new matches notify).
- DSC-10 P0: Empty, loading (skeleton), and error states for every list and detail view.

### 6.5 Auctions (AUC)

- AUC-01 P0: Artist creates an auction: start price, optional reserve (hidden, shows "Reserve met / not met"), start/end datetimes (min 1 hour, max 14 days), increment tiers (defaults: under 100 -> 5, 100-500 -> 10, 500-1000 -> 25, above 1000 -> 50 in the auction currency).
- AUC-02 P0: Place bid: must be verified email, not the seller, at least current price + increment. Bid is atomic: wrap in a serializable transaction or `SELECT ... FOR UPDATE` on the auction row; reject stale bids with `409 BID_TOO_LOW` returning the current price.
- AUC-03 P0: Real-time updates: current price, bid count, time remaining, outbid status pushed via `RealtimeProvider`; clients use server time offset to render countdowns (never trust the local clock).
- AUC-04 P0: Anti-sniping: a bid within the final `antiSnipeWindowSec` (default 120) extends the end by `antiSnipeExtendSec` (default 120). Cap total extension at 24 h.
- AUC-05 P0: Auction closing job: scheduled at `endsAt`; idempotent; handles extensions by rescheduling; sets final status; notifies winner, seller, and outbid bidders.
- AUC-06 P0: Winner flow: order created in `PENDING_PAYMENT` with `paymentDueAt = end + 48h`; payment reminders at 24h and 6h left.
- AUC-07 P1: Proxy (maximum) bidding with automatic counter-bids.
- AUC-08 P1: Non-payment handling: default, strike on buyer account (3 strikes lock bidding), second-chance offer to next bidder.
- AUC-09 P0: Bid history list with masked bidder names (`b***r`), full names visible to the seller only after close.
- AUC-10 P0: Bidders watching list ("Watchlist") with end-soon alerts.
- AUC-11 P0: Cancel rules: seller cannot cancel after the first bid; admin can, with reason and notifications.
- AUC-12 P2: Admin tooling to detect shill bidding patterns (same IP/device cluster, always-bidding-up accounts) with a flag report.

AC (AUC-02): Given a live auction at current price 100 with increment 5, When two buyers submit bids of 105 within the same millisecond, Then exactly one succeeds, the other receives `409 BID_TOO_LOW` with `currentPrice: 105`, and only one `isWinning=true` bid exists.

AC (AUC-04): Given an auction ending in 90 seconds with a 120 second window, When a valid bid arrives, Then `endsAt` increases by 120 seconds, `originalEndsAt` is unchanged, and the close job is rescheduled.

### 6.6 Cart, shortlist, and checkout (CHK)

- CHK-01 P0: Fixed-price items can be added to Cart. Auction items cannot. Digital/3D items are single-quantity per buyer (license), edition-limited items are quantity-limited.
- CHK-02 P0: **Shortlist** is separate from Cart: a saved set of pieces the buyer is considering, populated from web, AR, or VR. Moving a shortlist item to cart is one click. Shortlist is the sync bridge with Unity (Section 8).
- CHK-03 P0: Checkout: review items, buyer fee line, tax line (configurable rate, default 0), total in the charge currency, currency conversion notice if display currency differs, license acceptance checkbox for digital/3D, payment method selection from enabled providers.
- CHK-04 P0: Providers in checkout: Stripe (card, wallets as Stripe supports), Flutterwave (cards, mobile money, bank transfer as available), Mock (always visible when `PAYMENT_MOCK_ENABLED=true`, labeled "Demo payment"), Crypto/Wallet (visible only when `FEATURE_CRYPTO_PAYMENTS=true`; default false: not rendered).
- CHK-05 P0: Idempotent order creation: client sends `Idempotency-Key`; duplicate submissions return the same order.
- CHK-06 P0: Inventory reservation: for edition-limited items, reserve for 15 minutes while payment is pending; release on expiry via job.
- CHK-07 P0: Post-payment confirmation page and email with receipt, license, and download links.
- CHK-08 P0: Price integrity: price is re-read server-side at order creation; client-sent prices are ignored.
- CHK-09 P0: Order mixed-artist carts split into per-artist `OrderItem`s; one payment, multiple escrow holds and payouts.
- CHK-10 P1: Promo codes (percentage/fixed, admin-created, funded by platform commission).
- CHK-11 P0 (physical, gated): When `FEATURE_PHYSICAL_CHECKOUT=false`, `PHYSICAL` and `PRINT` listings show "Inquire" and cannot be added to cart.

### 6.7 Payments, fees, escrow, payouts (PAY)

See Section 10 for the detailed money flow. Requirements:

- PAY-01 P0: `PaymentProvider` interface:
  ```ts
  interface PaymentProvider {
    id: "stripe" | "flutterwave" | "mock" | "crypto";
    createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>; // returns redirect URL or client secret
    handleWebhook(
      rawBody: Buffer,
      headers: Headers,
    ): Promise<PaymentEventResult>;
    capture?(ref: string): Promise<void>;
    refund(input: RefundInput): Promise<RefundResult>;
    createPayout(input: PayoutInput): Promise<PayoutResult>;
    onboardArtist(
      input: OnboardInput,
    ): Promise<OnboardingLink | OnboardingState>;
    supportedCurrencies(): string[];
    isEnabled(): boolean;
  }
  ```
- PAY-02 P0: **Stripe**: Checkout Sessions or Payment Element, Connect Express accounts for artists, "separate charges and transfers" model so the platform receives funds, holds them, then transfers on release. Sandbox keys. Webhooks verified by signature; handled idempotently via `PaymentEvent.eventId`.
- PAY-03 P0: **Flutterwave**: Standard checkout redirect, webhook verification via secret hash header, transaction verification call before marking paid, subaccount/transfer API for payouts in sandbox.
- PAY-04 P0: **Mock**: a fake checkout page that lets the demo operator pick "Succeed", "Fail", "Require action", or "Delay 10s then succeed". Produces the same webhook-like events internally. Mock payouts mark `PAID` instantly. Must be selectable by `PAYMENT_PROVIDER_DEFAULT=mock` and must also be available in production as a labeled fallback when `PAYMENT_MOCK_ENABLED=true`.
- PAY-05 P3: **Crypto/Wallet**: interface implementation `CryptoPaymentProvider` that throws `FeatureDisabledError`; UI component with wallet-connect button placeholder behind the flag; `docs/CRYPTO_ROADMAP.md` describing a later design (stablecoin on an L2, wallet signature for auth, on-chain provenance anchoring of the `ProvenanceRecord` hash). Not wired to any live network in v1.
- PAY-06 P0: Fees (Section 10.2): commission per sale (default 12%, admin-configurable, per-artist override), buyer service fee (default 3%, min amount configurable), both shown transparently before payment.
- PAY-07 P0: Escrow-style hold: funds are held until release conditions (Section 5.2) and then paid out; the artist dashboard shows `Pending (held)`, `Available`, `Paid out` balances.
- PAY-08 P0: Payout schedule: release job runs hourly; payouts batch per artist per currency; minimum payout threshold configurable.
- PAY-09 P0: Refunds: full or partial, by moderator/admin via dispute resolution or by artist-initiated goodwill refund; funds come from the hold if not yet released, otherwise recorded as a negative balance (P1) on the artist ledger.
- PAY-10 P0: A double-entry style **ledger** table (`LedgerEntry`: account, debit/credit, amount, currency, orderId, ref) so every cent is traceable; admin reconciliation page compares ledger vs provider events.
- PAY-11 P1: Featured listing purchase flow (package, payment, scheduling, automatic start/stop).
- PAY-12 P0: Multi-currency: charge currency = listing currency; provider must support it, else block with a clear message. Display conversion is informational, using `ExchangeRate` refreshed daily (provider interface with a static mock table).

### 6.8 Fulfillment, downloads, licenses (FUL)

- FUL-01 P0: After `PAID_HELD`, buyer sees "Your purchases" with secure download buttons. Download URLs are short-lived signed URLs (5 minutes), generated per request, logged, and limited (default 5 downloads per item, resettable by artist/admin).
- FUL-02 P0: License PDF/Certificate generated at payment: buyer name, artwork, artist, license type, serial, QR to `/verify/[serial]`.
- FUL-03 P0: Public verification page `/verify/[serial]` showing authenticity, current owner (masked), and provenance chain integrity status (hash chain recomputed on view).
- FUL-04 P0: 3D asset delivery: buyer receives GLB (and USDZ if present) plus an "Open in AR/VR gallery" action.
- FUL-05 P0: Artist can mark delivered (non-digital placeholder) and buyer can confirm receipt, triggering release.
- FUL-06 P1: Re-download after file update (artist uploads a new version; buyers notified).

### 6.9 Disputes, refunds, reviews (DSP)

- DSP-01 P0: Buyer can open a dispute within `DISPUTE_WINDOW_DAYS` (default 7) of delivery or payment, with reason and evidence uploads.
- DSP-02 P0: Opening a dispute freezes the escrow hold and notifies the artist who has 72 hours to respond.
- DSP-03 P0: Moderator console: timeline, evidence, chat transcript link, decision actions (full refund, partial refund, release to artist, request more info), templated resolution messages. Decisions are audit logged and require a reason.
- DSP-04 P1: Auto-resolution rules (artist non-response after 72 hours resolves in favor of the buyer for digital goods where the file is demonstrably corrupt per checksum failure).
- DSP-05 P0: Reviews: only buyers with `COMPLETED` orders; one review per order; artist may reply once; moderators can hide abusive reviews.
- DSP-06 P1: Artist trust score (completion rate, dispute rate, response time) shown as badges.

### 6.10 Provenance and authenticity (PRV)

- PRV-01 P0: Every artwork gets a `CREATED` provenance record on first publish; every sale appends `SOLD` and `TRANSFERRED`.
- PRV-02 P0: Hash chain: `hash = sha256(prevHash || canonicalJson(payload))`. Public verification recomputes the chain.
- PRV-03 P0: Certificate of authenticity PDF with QR (generated with `pdf-lib` or ReportLab-equivalent in Node; use `pdf-lib`).
- PRV-04 P3: Optional anchoring of the latest chain hash to a blockchain (documented only; see PAY-05 roadmap).

### 6.11 Messaging and notifications (MSG, NTF)

- MSG-01 P0: Start a conversation from an artwork ("Ask the artist") or from an order. One thread per (buyer, artwork) pair.
- MSG-02 P0: Real-time delivery, typing indicator (P1), read receipts, attachments (images, PDFs up to 10 MB, scanned), pagination, unread badge.
- MSG-03 P0: Safety: rate limits (30 messages/min), block/report user, link and off-platform payment-solicitation warning banner using a simple keyword heuristic (P1: AI classifier).
- MSG-04 P0: Moderators can read threads only when attached to a report or dispute, and each access is audit logged.
- NTF-01 P0: In-app notification center with unread count, mark read, filters.
- NTF-02 P0: Email notifications (React Email templates in en/fr/rw): verification, receipt, outbid, auction won/lost, payment due, new message (digest if unread after 15 minutes), dispute updates, verification decision, listing decision.
- NTF-03 P1: Web push via VAPID (PWA), user-controlled per category.
- NTF-04 P0: Notification preferences matrix (category x channel).
- NTF-05 P0: Quiet-hours and digest option (P1).

### 6.12 Social layer (SOC)

- SOC-01 P0: Like artworks (optimistic UI), follow artists and curators.
- SOC-02 P0: Following feed: new listings, auctions starting, gallery publications, price drops.
- SOC-03 P1: Collections: buyers create named public/private boards and add pieces; shareable URLs with OG images.
- SOC-04 P1: Comments on artworks with threading (1 level), report/hide, rate limit, mention (`@username`) notifications (P2).
- SOC-05 P1: Public buyer profile with collections, activity opt-in.
- SOC-06 P0: Share buttons and Web Share API for mobile.

### 6.13 Virtual galleries and curator tools (GAL)

- GAL-01 P0: Curator creates a gallery: pick template (room layout), theme (lighting, wall color), then place published artworks into template slots with a 2D top-down editor (drag artworks into slots; slot constraints enforced: aspect ratio hints and max size).
- GAL-02 P0: Artists must grant consent for inclusion when the curator is not the owner (request/accept flow with notifications). Artists can withdraw consent; placement is removed and the curator is notified.
- GAL-03 P0: Gallery publication goes through moderator review (P1; P0 uses admin approval toggle).
- GAL-04 P0: Public gallery page `/galleries/[slug]`: cover, description, curator, artist list, "Enter gallery (VR)" button, a 2D fallback walkthrough (scrolling carousel of placed works) for devices that cannot run the Unity build.
- GAL-05 P0: Gallery manifest endpoint for Unity (Section 8.3), cached, ETag-aware, with signed asset URLs.
- GAL-06 P1: Private/unlisted galleries shareable by link (private-for-me gallery: a buyer's own "dream room" assembled from their shortlist).
- GAL-07 P0: "Walk the shortlist": from `/shortlist`, "View my shortlist in VR" auto-generates a temporary private gallery from the shortlisted items using a default template (this directly supports the stated use case: select products while walking through, then use the info to decide).
- GAL-08 P1: Gallery analytics: visits, dwell per artwork (from `VrSession` + telemetry), shortlist rate.

### 6.14 AI features (AIF) (all optional, provider-abstracted, degrade gracefully)

- AIF-01 P1: Auto-tagging and dominant color/style suggestion at upload (vision model), with confidence; artist accepts or edits.
- AIF-02 P1: Listing description assistant: given title, medium, artist notes, produce 2-3 draft descriptions in the artist's language; artist edits. Must never fabricate provenance facts; the prompt template instructs to avoid claims not provided.
- AIF-03 P1: Alt-text generation per locale for accessibility.
- AIF-04 P1: Semantic search embeddings (see DSC-05) and "more like this".
- AIF-05 P1: Personalized recommendations ("For you"): hybrid of embedding similarity to liked/shortlisted/purchased works plus popularity, with a diversity re-ranker so results include at least 30% from artists the user has not seen.
- AIF-06 P2: Moderation assist: flag potentially prohibited content (explicit, hateful, copyright signals) with a score; always human-confirmed before suspension.
- AIF-07 P2: Price guidance for artists: show comparable listings' median by medium/size (statistical, not generative).
- AIF-08 P2: Conversational "art concierge" that searches the catalog via tool calls (only returns real listings from DB).
- AIF-09 P0: AI usage guardrails: per-user daily quota, logging of prompts/outputs metadata (not PII), cost cap setting, kill switch flag `FEATURE_AI`.

### 6.15 Analytics dashboards (ANA)

- ANA-01 P0: Artist dashboard: revenue (held, available, paid), orders, views, likes, conversion (view->purchase), top listings, auction performance, traffic by country, VR/AR engagement (views in galleries, shortlists), time-range filter, CSV export.
- ANA-02 P0: Admin dashboard: GMV, platform revenue (commission + buyer fees + promotions), active buyers/artists, new signups, orders by status, dispute rate, auction sell-through rate, top categories, payment provider mix, moderation queue sizes.
- ANA-03 P0: Event tracking: client SDK wrapper `track(type, props)` sending to `/api/v1/events` (batched, `sendBeacon`), consent-aware (cookie banner; analytics events anonymized until consent).
- ANA-04 P0: Rollup jobs generate daily aggregates so dashboards are fast.
- ANA-05 P1: Buyer insights: purchase history, spend summary.
- ANA-06 P0: Charts use accessible colors and have table fallbacks.

### 6.16 Admin and moderation (ADM)

- ADM-01 P0: Dashboard (ANA-02), user search and detail, suspend/unsuspend, role grants (audit logged).
- ADM-02 P0: Moderation queues: artist verifications, listings pending review, reports, galleries, disputes, comments.
- ADM-03 P0: Fee configuration, feature flags, system settings editor with validation and audit.
- ADM-04 P0: Orders and payments explorer, ledger/reconciliation page, manual refund tool (with reason).
- ADM-05 P0: Content management: categories, tags, curated home sections, static pages (about, terms, privacy, FAQ) editable in markdown per locale.
- ADM-06 P1: Impersonation ("view as user") for support, read-only, loud banner, audit logged, requires 2FA.
- ADM-07 P0: Audit log viewer with filters.
- ADM-08 P1: Email template previews, send test.

### 6.17 Localization and currency (I18N)

- I18N-01 P0: `next-intl`, locales `en` (default), `fr`, `rw`; locale in URL prefix `/en`, `/fr`, `/rw`; detection from `Accept-Language` on first visit; user preference overrides.
- I18N-02 P0: ICU message format with plurals; no string concatenation for sentences; dates and numbers via `Intl`.
- I18N-03 P0: Kinyarwanda and French files are initially drafted by the agent and flagged `"_needsReview": true` per key group in a tracking file `docs/I18N_REVIEW.md`; a native speaker (the owner) reviews before the demo.
- I18N-04 P0: Currencies supported for pricing: USD, EUR, GBP, RWF, KES, NGN, GHS, ZAR (configurable list). Display conversion via exchange rates with "approximate" label; charge currency always the listing currency. Minor-unit exponent per currency (RWF has 0 decimals) handled in `money.ts`.
- I18N-05 P0: User-generated content can be multi-language (LST-07); language chip shows when content is displayed in fallback.

### 6.18 Legal and compliance pages (LEG)

- LEG-01 P0: Terms of Service, Privacy Policy, Cookie Policy, Seller Agreement, Buyer Protection summary, Prohibited Items policy, IP/DMCA-style takedown process, all as editable markdown with clear "template, not legal advice" notes to be reviewed by the owner.
- LEG-02 P0: Cookie consent banner with granular choices; analytics only after consent.
- LEG-03 P1: Takedown report flow for IP complaints with counter-notice states.

---

## 7. PROVIDER INTERFACES (every external dependency)

For each provider: define the interface, a Mock, and a Real implementation. Selection through env vars in `container.ts`. Each Mock must produce realistic latency (configurable) and errors (toggle) for demo and testing.

| Provider       | Interface file         | Real                              | Mock                                 | Env switch                                          |
| -------------- | ---------------------- | --------------------------------- | ------------------------------------ | --------------------------------------------------- |
| Payment        | `providers/payment/*`  | Stripe, Flutterwave               | Mock, Crypto(stub)                   | `PAYMENT_PROVIDERS_ENABLED=stripe,flutterwave,mock` |
| Storage        | `providers/storage/*`  | S3/R2                             | Local disk/MinIO                     | `STORAGE_PROVIDER`                                  |
| Email          | `providers/email/*`    | Resend                            | Console/MailHog                      | `EMAIL_PROVIDER`                                    |
| Realtime       | `providers/realtime/*` | Pusher/Ably                       | In-memory + SSE                      | `REALTIME_PROVIDER`                                 |
| AI             | `providers/ai/*`       | Anthropic (+ embeddings provider) | Deterministic fixtures               | `AI_PROVIDER`                                       |
| Search         | `providers/search/*`   | Postgres FTS+pgvector             | In-memory                            | `SEARCH_PROVIDER`                                   |
| Exchange rates | `providers/fx/*`       | Open exchange API                 | Static table                         | `FX_PROVIDER`                                       |
| Virus scan     | `providers/scan/*`     | ClamAV                            | Always clean                         | `SCAN_PROVIDER`                                     |
| Push           | `providers/push/*`     | Web Push (VAPID)                  | Log only                             | `PUSH_PROVIDER`                                     |
| Shipping       | `providers/shipping/*` | (P3) Manual/carrier               | Stub throwing `FeatureDisabledError` | `FEATURE_PHYSICAL_CHECKOUT`                         |
| 3D validation  | `providers/assets3d/*` | gltf-validator + sharp            | Always valid                         | `ASSET3D_PROVIDER`                                  |

### 7.6 Shipping stub (P3, documentation + interface only)

```ts
interface ShippingProvider {
  quote(input: QuoteInput): Promise<ShippingQuote[]>;
  createShipment(input: ShipmentInput): Promise<Shipment>;
  track(trackingNumber: string): Promise<TrackingStatus>;
}
```

The `ManualShippingProvider` (artist enters carrier and tracking number; buyer confirms delivery) is the first implementation to add when the flag is enabled. Address book and `Order.shippingAddress` fields exist but are hidden.

---

## 8. UNITY AR/VR INTEGRATION CONTRACT

This is the most critical integration surface. The peer builds the Unity WebGL module against this contract. The web app provides a **mock host** and a **mock Unity module** so neither side blocks the other.

### 8.1 Embedding model

- The Unity WebGL build is hosted as static files at `/public/unity/` (or a CDN origin set by `UNITY_BUILD_BASE_URL`). The Next.js page `/[locale]/galleries/[slug]/enter` renders a full-viewport iframe: `<iframe src="{UNITY_BUILD_BASE_URL}/index.html?v={build}" allow="fullscreen; xr-spatial-tracking; camera; microphone *; accelerometer; gyroscope" />`.
- Required hosting headers for Unity builds: correct `Content-Encoding` for `.br`/`.gz` files, `Content-Type: application/wasm`, and CORS for the app origin. Document and implement in `next.config.js` headers or CDN config. Provide a "build health check" page `/admin/unity` that loads the iframe and reports `READY` or the failure reason.
- If the iframe fails to report `READY` within 20 seconds (or WebGL2 is unavailable), show the **2D fallback walkthrough** (GAL-04) with an explanation and a retry.
- Mobile: the iframe route supports landscape lock prompt, fullscreen request, and "Reduce quality" toggle sent to Unity as `SET_QUALITY`.
- Security: the iframe is cross-origin sandboxed where possible. Messages are accepted only when `event.origin === UNITY_ORIGIN` and `event.source === iframe.contentWindow`. Payment forms never render inside it.

### 8.2 Authentication handoff

1. The web app (logged-in or guest) requests `POST /api/v1/vr/session` with `{ galleryId }` and receives a **short-lived VR token** (15 minutes, scope `vr:read vr:shortlist`, bound to `userId` or guest id and `galleryId`) plus `sessionId`.
2. The web app sends it to Unity in the `INIT` message. Unity uses it as `Authorization: Bearer <token>` for all REST calls.
3. On expiry, Unity sends `REQUEST_TOKEN`; the host fetches a new token and replies with `TOKEN_REFRESH`.
4. Guests can walk through public galleries read-only; actions that mutate (shortlist add/remove) require login. Unity receives `user: null` and shows a "Sign in to save" prompt, which sends `REQUEST_LOGIN` to the host.

### 8.3 REST endpoints for Unity (versioned, stable, documented in OpenAPI)

All under `/api/v1/vr`. JSON, UTF-8, camelCase, ISO 8601 dates, money as `{ amount: number (minor units), currency: "USD", display: "$120.00" }`.

| Method | Path                              | Purpose                                                                                                     |
| ------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| POST   | `/vr/session`                     | Create VR session and token (called by the web host, not Unity)                                             |
| GET    | `/vr/galleries/{id}/manifest`     | Full gallery manifest (below). ETag + `Cache-Control: private, max-age=60`                                  |
| GET    | `/vr/artworks/{id}`               | Detail for a focused artwork (title, artist, description in locale, price/auction state, dimensions, media) |
| GET    | `/vr/shortlist`                   | Current user's shortlist items (ids + minimal fields)                                                       |
| PUT    | `/vr/shortlist/items/{artworkId}` | Add to shortlist (idempotent), body `{ galleryId, note? }`                                                  |
| DELETE | `/vr/shortlist/items/{artworkId}` | Remove                                                                                                      |
| POST   | `/vr/telemetry`                   | Batched events: `ARTWORK_FOCUSED`, `DWELL`, `GALLERY_EXIT` (rate limited)                                   |
| POST   | `/vr/sessions/{id}/end`           | Close session with summary                                                                                  |

Gallery manifest shape (`packages/unity-contract/schemas/manifest.v1.json` is the source of truth; TypeScript types generated from it):

```json
{
  "schemaVersion": "1.0",
  "gallery": {
    "id": "gal_...",
    "title": "Rwanda Rising",
    "curator": { "id": "usr_...", "name": "Grace" },
    "locale": "en",
    "template": { "key": "room_loft_01", "unityPrefab": "Rooms/Loft01" },
    "theme": {
      "lighting": "warm_evening",
      "wallColor": "#F6EFE4",
      "floor": "oak"
    }
  },
  "placements": [
    {
      "slotId": "wall_north_1",
      "artwork": {
        "id": "art_...",
        "title": "Imigongo Dusk",
        "artist": { "id": "ap_...", "name": "Amina", "verified": true },
        "type": "DIGITAL",
        "dimensions": {
          "width": 0.9,
          "height": 1.2,
          "depth": 0.04,
          "unit": "m"
        },
        "price": { "amount": 45000, "currency": "USD", "display": "$450.00" },
        "saleMode": "AUCTION",
        "auction": {
          "endsAt": "2026-12-01T18:00:00Z",
          "currentBid": {
            "amount": 52000,
            "currency": "USD",
            "display": "$520.00"
          }
        },
        "media": {
          "texture": {
            "url": "https://signed...",
            "width": 2048,
            "height": 2731,
            "expiresAt": "..."
          },
          "model": { "glbUrl": "https://signed...", "bytes": 4200000 }
        },
        "shortlisted": true
      },
      "scaleOverride": null
    }
  ],
  "limits": { "maxTextureSize": 2048, "recommendedPolyBudget": 100000 },
  "links": { "web": "https://app/.../galleries/rwanda-rising" }
}
```

Rules: URLs are signed and expire (default 30 minutes); manifests are re-fetchable. Textures served at a size appropriate for the `quality` hint (`?quality=low|med|high`). Physical/print works have `type` `PHYSICAL`/`PRINT` and a 2D texture so they appear on walls even though checkout is gated.

### 8.4 postMessage protocol `kv.v1`

Envelope for every message in both directions:

```json
{
  "proto": "kv.v1",
  "type": "<MESSAGE_TYPE>",
  "id": "<uuid>",
  "replyTo": "<uuid|null>",
  "ts": 1732200000000,
  "payload": {}
}
```

**Host -> Unity**

| type                | payload                                                                                               | Notes                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------- | ----- | ----------------------- | ------------------ |
| `INIT`              | `{ apiBaseUrl, token, tokenExpiresAt, sessionId, galleryId, locale, currency, user: {id, displayName} | null, theme: "light"                                        | "dark", quality: "low" | "med" | "high", featureFlags }` | Sent after `READY` |
| `TOKEN_REFRESH`     | `{ token, tokenExpiresAt }`                                                                           | Reply to `REQUEST_TOKEN`                                    |
| `SHORTLIST_UPDATED` | `{ artworkIds: string[] }`                                                                            | Host changed the shortlist (for example from the web panel) |
| `FOCUS_ARTWORK`     | `{ artworkId }`                                                                                       | Teleport to a piece (deep link)                             |
| `SET_QUALITY`       | `{ quality }`                                                                                         |                                                             |
| `PAUSE` / `RESUME`  | `{}`                                                                                                  | When the tab is hidden or a modal opens                     |
| `LOCALE_CHANGED`    | `{ locale }`                                                                                          |                                                             |

**Unity -> Host**

| type                                 | payload                                                               | Host behavior                                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `READY`                              | `{ unityVersion, buildId, capabilities: ["shortlist","ar","focus"] }` | Host sends `INIT`                                                                                                                           |
| `REQUEST_TOKEN`                      | `{ reason }`                                                          | Host fetches new VR token                                                                                                                   |
| `REQUEST_LOGIN`                      | `{}`                                                                  | Host opens login modal (outside iframe), then sends `INIT`-like `TOKEN_REFRESH` and `SHORTLIST_UPDATED`                                     |
| `ARTWORK_FOCUSED`                    | `{ artworkId }`                                                       | Host shows artwork side panel (title, price, bid/buy CTA)                                                                                   |
| `SHORTLIST_ADD` / `SHORTLIST_REMOVE` | `{ artworkId }`                                                       | Host calls the REST API (or Unity already did; host reconciles) and replies with `SHORTLIST_UPDATED`                                        |
| `ADD_TO_CART`                        | `{ artworkId }`                                                       | Host adds to cart; shows toast                                                                                                              |
| `CHECKOUT_REQUEST`                   | `{ artworkIds: string[] }`                                            | Host exits fullscreen, pauses Unity, navigates to `/checkout?from=vr&ids=...` (payment never inside iframe), and offers "Return to gallery" |
| `VIEW_AR_REQUEST`                    | `{ artworkId }`                                                       | Host opens the AR placement sheet (Section 8.5)                                                                                             |
| `OPEN_ARTWORK_PAGE`                  | `{ artworkId }`                                                       | Host opens detail page in a new tab/drawer                                                                                                  |
| `EXIT`                               | `{ reason }`                                                          | Host closes the experience, ends session                                                                                                    |
| `ERROR`                              | `{ code, message, fatal }`                                            | Host logs to Sentry; if fatal, shows fallback                                                                                               |
| `TELEMETRY`                          | `{ events: [...] }`                                                   | Optional; forwarded to `/vr/telemetry`                                                                                                      |

Contract rules:

- Unknown message types are ignored and logged (forward compatibility). Unity and host each ignore messages with a different `proto` major version and respond with `ERROR { code: "PROTO_MISMATCH" }`.
- Every message that expects an outcome carries an `id`; replies set `replyTo`.
- All payloads are validated on the host with zod schemas generated from `packages/unity-contract`.
- A JS helper `unityBridge.ts` and a C# reference snippet (`docs/unity/KaleidoBridge.jslib` and `KaleidoBridge.cs`) are included in `docs/UNITY_INTEGRATION.md` so the peer can copy them.

### 8.5 AR in the buyer's own room

Because the Unity iframe cannot be guaranteed to expose camera AR on every device, the product ships a web-native AR path that works independent of Unity:

- Use `<model-viewer>` with `ar` enabled: Scene Viewer (Android), Quick Look with USDZ (iOS), WebXR where available, from any artwork with a GLB (and optional USDZ). Wall-art 2D pieces use an auto-generated thin framed-plane GLB with the artwork texture at real-world scale so "place on wall" works for paintings and prints.
- Accurate scale: uses `realWorldScale` and dimensions from the artwork record; show a "true size" label.
- The Unity module may offer its own AR mode. If so, it signals `capabilities: ["ar"]` in `READY`, and `VIEW_AR_REQUEST` is routed to Unity (`START_AR`) when the user prefers it; otherwise the web AR sheet is used.
- Track `AR_VIEW_STARTED` events for analytics.

### 8.6 Shortlist as the shared brain

- The shortlist is a server-side entity (4.3). Web, AR, and VR all read/write it through the same service, so a piece shortlisted in VR appears on the web shortlist page and vice versa within a second (via `RealtimeProvider` events to the host, which relays `SHORTLIST_UPDATED` to Unity).
- The Shortlist page `/shortlist` offers: compare view (side-by-side price, size, medium), notes per item, "Move to cart", "View in VR", "Share (read-only link)", and AI "Help me decide" summary (P2) that references only the actual shortlisted data.

### 8.7 Mock tooling (build in Phase 1, before real Unity exists)

- `packages/unity-mock-host`: a minimal HTML page that loads any Unity WebGL build URL and simulates the host (sends `INIT`, logs and answers messages) so the peer can develop without the full web app.
- `packages/unity-mock-module`: a small HTML/Three.js page that implements the Unity side of `kv.v1` (renders placements as textured planes, lets you click to shortlist) so the web team can test the full flow without Unity. This module is the default shown if `UNITY_BUILD_BASE_URL` is unset.
- Contract tests: Playwright test drives the mock module through `READY -> INIT -> ARTWORK_FOCUSED -> SHORTLIST_ADD -> CHECKOUT_REQUEST` and asserts the web app's behavior at each step.
- Seed data includes 3 galleries x 8 artworks with real GLB samples (CC0) and textures.

AC (VR checkout handoff): Given a logged-in buyer in a gallery with two shortlisted pieces, When Unity sends `CHECKOUT_REQUEST` with both ids, Then the host pauses Unity, navigates to checkout with those two items preloaded, and after payment offers "Return to gallery"; at no point is a payment field rendered inside the iframe.

---

## 9. PWA AND MOBILE

- MOB-01 P0: Web app manifest (name, short_name, icons maskable 192/512, theme/background colors from tokens, `display: standalone`, `start_url`, shortcuts: Explore, Shortlist, My Orders).
- MOB-02 P0: Service worker (Serwist): precache app shell, runtime cache for images (stale-while-revalidate with size caps), offline fallback page, offline-readable Shortlist and recently viewed items.
- MOB-03 P0: Install prompt UX (custom, dismissible, shown after meaningful engagement).
- MOB-04 P1: Web push notifications (NTF-03), including outbid and auction ending alerts.
- MOB-05 P0: Mobile-first responsive layouts tested at 360, 390, 768, 1024, 1440 px. Touch targets at least 44 px. Bottom navigation on mobile for primary destinations.
- MOB-06 P0: Performance budget on a mid-range Android on 4G: LCP under 2.5 s on home and artwork pages, JS per route under 200 KB gzipped (excluding model-viewer and Unity, which are lazy-loaded).
- MOB-07 P2: Capacitor wrapper project (`apps/mobile-shell`) producing Android/iOS builds that load the production URL with native share, push, and camera permissions; documented in `docs/MOBILE_WRAPPER.md`.
- MOB-08 P1: Lighthouse CI in pipeline: PWA, performance, accessibility, SEO budgets.

---

## 10. MONEY FLOWS IN DETAIL

### 10.1 Happy path (fixed price, Stripe)

1. Buyer checks out; server creates `Order(PENDING_PAYMENT)` with server-computed totals and an `Idempotency-Key`.
2. `PaymentProvider.createCheckout` returns a session; the buyer pays; the provider sends a webhook.
3. Webhook handler: verify signature, upsert `PaymentEvent(eventId)`, if new -> transition order to `PAID_HELD`, create `EscrowHold` per `OrderItem`, post ledger entries, generate certificate and license, append provenance `SOLD` (pending transfer), enqueue notifications.
4. Buyer downloads. On `COMPLETED` (confirmation or auto-release), release job transfers `artistNetAmount` to the artist via `createPayout` and posts ledger entries.
5. Provenance `TRANSFERRED` finalized at completion.

### 10.2 Fee math (example, USD)

- Listing price: 100.00. Buyer fee 3% = 3.00. Buyer total = 103.00 (tax 0).
- Commission 12% of 100.00 = 12.00. Artist net = 88.00.
- Platform revenue = 3.00 + 12.00 = 15.00 (before provider processing fees; track provider fees in the ledger as an expense once known).
- Rounding: compute in minor units with banker's rounding at each line; the sum of lines must equal the total; unit tests include RWF (0 decimal) and a mixed cart.

### 10.3 Ledger accounts

`buyer_funds_in`, `escrow_liability`, `artist_payable`, `platform_revenue`, `provider_fees`, `refunds`, `payouts_out`. Each financial event posts balanced entries. A nightly job verifies that the sum of all entries per currency is zero and alerts on drift.

### 10.4 Failure handling

- Webhook retries: idempotent by `eventId`; unknown events logged.
- Payment succeeds but order missing (race): reconcile job finds `PaymentEvent` without a matching order transition and repairs or alerts.
- Payout failure: status `FAILED`, retried with exponential backoff up to 5 times, then admin alert.
- Double-submit and double-click: idempotency keys plus disabled buttons.
- Provider outage: checkout shows enabled alternatives; the Mock remains selectable if enabled.

---

## 11. API DESIGN

- Style: REST under `/api/v1`, JSON, zod-validated, OpenAPI 3.1 generated and served at `/api/v1/openapi.json` and a docs UI at `/docs/api` (admin or dev only in prod).
- Auth: cookie session for the web app; `Authorization: Bearer` for VR tokens and future API clients.
- Errors: RFC 9457 problem details: `{ type, title, status, code, detail, instance, errors? }` with stable `code` values (for example `EMAIL_NOT_VERIFIED`, `BID_TOO_LOW`, `AUCTION_ENDED`, `FORBIDDEN`, `VALIDATION_FAILED`, `RATE_LIMITED`, `FEATURE_DISABLED`).
- Pagination: cursor-based `?limit=24&cursor=...`, response `{ items, nextCursor }`.
- Idempotency: required `Idempotency-Key` header for `POST /orders`, `POST /payments/*`, `POST /bids`.
- Versioning: breaking changes get `/v2`. The VR contract has its own `schemaVersion`.
- Rate limits (defaults): anonymous 60/min/IP, authenticated 120/min/user, bids 10/min/user, auth endpoints 10/min/IP, messages 30/min/user, uploads 20/hour/user. Responses include `RateLimit-*` headers.

### 11.1 Endpoint inventory (non-exhaustive but binding for naming)

| Area           | Endpoints                                                                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth           | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/2fa/setup`, `/auth/2fa/verify`                                                                                                   |
| Me             | `GET/PATCH /me`, `GET /me/sessions`, `DELETE /me/sessions/{id}`, `POST /me/export`, `DELETE /me`                                                                                                                                                                     |
| Artists        | `POST /artists/apply`, `GET /artists/{slug}`, `PATCH /artists/me`, `POST /artists/me/verification`, `GET /artists/me/balance`, `POST /artists/me/payout-setup`                                                                                                       |
| Artworks       | `GET /artworks` (filters), `GET /artworks/{id}`, `POST /artworks`, `PATCH /artworks/{id}`, `POST /artworks/{id}/submit`, `POST /artworks/{id}/archive`, `POST /artworks/{id}/media/upload-url`, `POST /artworks/{id}/files/upload-url`, `GET /artworks/{id}/related` |
| Search         | `GET /search?q=`, `GET /search/suggest?q=`, `POST /search/semantic`                                                                                                                                                                                                  |
| Auctions       | `POST /artworks/{id}/auction`, `GET /auctions/{id}`, `GET /auctions/{id}/bids`, `POST /auctions/{id}/bids`, `POST /auctions/{id}/watch`, `DELETE /auctions/{id}/watch`, `POST /auctions/{id}/cancel`                                                                 |
| Cart/Shortlist | `GET/PUT/DELETE /cart/items/{artworkId}`, `GET /shortlist`, `PUT/DELETE /shortlist/items/{artworkId}`, `POST /shortlist/share`                                                                                                                                       |
| Orders         | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/confirm-receipt`, `GET /orders/{id}/downloads/{itemId}` (returns signed URL), `GET /orders/{id}/certificate`                                                                                   |
| Payments       | `POST /payments/{provider}/checkout`, `POST /webhooks/stripe`, `POST /webhooks/flutterwave`, `POST /payments/mock/resolve` (mock only)                                                                                                                               |
| Disputes       | `POST /orders/{id}/disputes`, `GET /disputes/{id}`, `POST /disputes/{id}/messages`, `POST /disputes/{id}/resolve` (mod)                                                                                                                                              |
| Reviews        | `POST /orders/{id}/review`, `POST /reviews/{id}/reply`, `POST /reviews/{id}/hide` (mod)                                                                                                                                                                              |
| Social         | `PUT/DELETE /artworks/{id}/like`, `PUT/DELETE /follows/{targetId}`, `GET /feed`, `POST /collections`, `PUT /collections/{id}/items/{artworkId}`, `GET/POST /artworks/{id}/comments`                                                                                  |
| Messaging      | `GET /conversations`, `POST /conversations`, `GET /conversations/{id}/messages`, `POST /conversations/{id}/messages`, `POST /conversations/{id}/read`, `POST /users/{id}/block`                                                                                      |
| Notifications  | `GET /notifications`, `POST /notifications/read`, `GET/PUT /notification-preferences`, `POST /push/subscribe`                                                                                                                                                        |
| Galleries      | `GET /galleries`, `GET /galleries/{slug}`, `POST /galleries`, `PATCH /galleries/{id}`, `PUT /galleries/{id}/placements/{slotId}`, `POST /galleries/{id}/submit`, `POST /galleries/{id}/consent-requests`, `POST /consents/{id}/respond`                              |
| VR             | Section 8.3                                                                                                                                                                                                                                                          |
| Promotions     | `GET /promotions/packages`, `POST /artworks/{id}/promote`                                                                                                                                                                                                            |
| Analytics      | `POST /events`, `GET /analytics/artist`, `GET /admin/analytics`                                                                                                                                                                                                      |
| Admin          | `GET/POST /admin/users...`, `/admin/verifications...`, `/admin/moderation...`, `/admin/fees`, `/admin/flags`, `/admin/ledger`, `/admin/audit`, `/admin/content`                                                                                                      |
| Reports        | `POST /reports`                                                                                                                                                                                                                                                      |
| FX             | `GET /fx/rates`                                                                                                                                                                                                                                                      |
| Health         | `GET /healthz`, `GET /readyz`                                                                                                                                                                                                                                        |

### 11.2 Realtime channels (RealtimeProvider)

`auction:{id}` events `bid.placed`, `auction.extended`, `auction.ended`; `user:{id}` events `notification.new`, `message.new`, `outbid`, `shortlist.updated`, `order.updated`; `conversation:{id}` events `message.new`, `typing`, `read`. Private channels are authorized server-side per subscription.

---

## 12. SECURITY, PRIVACY, AND TRUST AND SAFETY

Target: OWASP ASVS Level 2 for the web app. Maintain `docs/SECURITY.md` with the threat model (STRIDE table for auth, payments, uploads, auctions, VR bridge) and mitigations.

- SEC-01 P0: Input validation with zod on every boundary; output encoding via React; sanitize rich text (DOMPurify or `sanitize-html` allowlist) on the server.
- SEC-02 P0: CSRF: SameSite cookies plus origin checking on mutating routes; no CSRF exposure on Bearer routes.
- SEC-03 P0: Security headers: CSP (nonce-based; allow the Unity origin in `frame-src`, Stripe/Flutterwave as needed), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/xr only for self and Unity origin), `frame-ancestors 'self'`.
- SEC-04 P0: Secrets only in env; startup validation of env via zod (`env.ts`) fails fast.
- SEC-05 P0: Upload security: MIME sniffing on server, extension allowlist, size limits, image re-encode (strip metadata and polyglots), private buckets for digital files and verification docs, signed URLs with short TTL, malware scan hook.
- SEC-06 P0: Webhook signature verification, replay protection (timestamp tolerance), idempotency.
- SEC-07 P0: Authorization checks via central policies; ownership checks on every resource lookup (prevent IDOR). Test with a negative-path matrix (buyer A cannot read buyer B's order, etc.).
- SEC-08 P0: Rate limiting (Section 11); bot protection on register/login/bid with Turnstile (provider interface; mock passes).
- SEC-09 P0: Audit logs for: role changes, verification decisions, fee changes, refunds, payout changes, dispute resolutions, impersonation, admin reads of private conversations.
- SEC-10 P0: PII minimization: verification documents encrypted (application-level envelope encryption with a KMS key abstraction), access only by moderators with a logged reason, auto-deleted after retention window.
- SEC-11 P0: Dependency hygiene: `pnpm audit`, Dependabot/Renovate, `npm`-package provenance check, lockfile committed, CodeQL or Semgrep in CI.
- SEC-12 P0: Logging excludes secrets, tokens, full card data, document contents, and raw message bodies.
- SEC-13 P1: Account takeover protection: new-device login email, session revoke on password change, 2FA enforcement for privileged roles.
- SEC-14 P1: Content moderation: report flows, takedown, repeat-infringer policy, AI-assisted flagging (AIF-06).
- SEC-15 P0: Anti-fraud basics: velocity checks on orders/bids, mismatch country flags, manual review queue for first large orders (threshold setting).
- SEC-16 P0: VR bridge hardening: strict origin checks, schema validation, token scope limited to VR endpoints, no cookies sent from Unity, rate-limited telemetry.
- SEC-17 P0: Privacy: cookie consent, data export/deletion, data processing records in `docs/PRIVACY.md`, no selling data, minimal analytics.

---

## 13. NON-FUNCTIONAL REQUIREMENTS

| Area                 | Target                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance          | p95 API latency under 300 ms for reads, under 600 ms for writes (excluding provider calls); LCP under 2.5 s mobile on 4G for home/artwork                                                                                             |
| Scalability          | Stateless app; DB indexes verified with `EXPLAIN` on top 15 queries; auction bids handle 50 concurrent bids/sec on one auction in load test without double-wins                                                                       |
| Availability         | Graceful degradation: if realtime is down, polling fallback every 5 s; if AI is down, features hide; if payment provider is down, show alternatives                                                                                   |
| Accessibility        | WCAG 2.2 AA: keyboard navigation, focus states, color contrast 4.5:1, aria-live for bid updates, reduced motion respected, alt text required (AIF-03 helps), form errors announced, 3D viewer has a text alternative, axe tests in CI |
| Internationalization | See I18N; no layout breaks with 40% longer French strings; Kinyarwanda diacritics render in the chosen fonts                                                                                                                          |
| Browser support      | Last 2 versions of Chrome, Edge, Safari, Firefox; iOS Safari 16+; Chrome Android; Unity WebGL requires WebGL2                                                                                                                         |
| Observability        | Request IDs on all logs, Sentry with release tracking, health endpoints, business metrics (orders, bids, payments failures) in a dashboard, alerting on webhook failure rate and ledger drift                                         |
| Backups              | Daily DB backups (provider), restore procedure tested once and documented                                                                                                                                                             |
| Data integrity       | FK constraints, unique constraints, check constraints (`amount >= 0`, `endsAt > startsAt`), transactions around money and bid operations                                                                                              |
| Maintainability      | ESLint (strict), Prettier, `tsc --noEmit`, dependency-cruiser rule: handlers must not import repositories directly; conventional commits                                                                                              |
| Documentation        | Every module has a README section; ADRs for non-obvious choices                                                                                                                                                                       |

---

## 14. UX AND UI DESIGN SYSTEM

### 14.1 Look and feel: Afro-contemporary gallery

Concept: a modern white-cube gallery warmed by earth tones and subtle geometric pattern references (for example Rwandan _imigongo_-inspired motifs used sparingly as section dividers and empty-state illustrations, never as busy backgrounds). Art is the hero: generous whitespace, large imagery, restrained UI chrome, editorial typography.

Design tokens (CSS variables, light and dark; verify contrast programmatically in a test):

| Token                    | Light             | Dark      |
| ------------------------ | ----------------- | --------- |
| `--bg`                   | `#FBF6EE` (cream) | `#14110F` |
| `--surface`              | `#FFFFFF`         | `#1D1916` |
| `--ink`                  | `#1B1714`         | `#F4ECE1` |
| `--muted`                | `#6B5F55`         | `#B8A999` |
| `--primary` (terracotta) | `#B5482A`         | `#E0714F` |
| `--accent-ochre`         | `#D79A2B`         | `#E8B04A` |
| `--accent-indigo`        | `#24306E`         | `#8C9BFF` |
| `--accent-forest`        | `#1E5A45`         | `#5CC29B` |
| `--danger`               | `#B3261E`         | `#FF8A80` |
| `--border`               | `#E6DCCB`         | `#3A322B` |

Typography: display serif (Fraunces or DM Serif Display) for titles; humanist sans (Inter or Source Sans 3) for UI; tabular numerals for prices and countdowns. Fonts self-hosted via `next/font`, subsets including Latin Extended for French and Kinyarwanda. Scale: 12/14/16/18/20/24/30/36/48/60. Spacing 4px grid. Radius: 12 for cards, 999 for chips. Motion: 150-250 ms ease-out, disabled under `prefers-reduced-motion`.

Brand placeholder: wordmark text "Kaleido" in display serif with a small geometric glyph; logo and name replaceable via `BRAND_NAME` and `public/brand/*`.

### 14.2 Core components (build in Storybook, P1; at least documented in `docs/UI.md`)

ArtworkCard (image with blurhash, badges: Verified, Auction, 3D/AR, Featured), PriceTag (multi-currency with "approx" tooltip), BidPanel (live), CountdownTimer (server-synced, aria-live polite with throttled announcements), ArtistChip, FilterBar (sheet on mobile), MediaGallery with zoom, ModelViewerAR, ShortlistButton, ConversationList/Thread, NotificationBell, DataTable (admin), Stepper (listing editor, checkout), Toasts, EmptyState with imigongo-inspired illustration, LocalePicker, CurrencyPicker, ConsentBanner, StatusBadge for orders/auctions/disputes.

### 14.3 Information architecture and routes

Public: `/` home, `/explore`, `/artworks/[slug]`, `/artists`, `/artists/[slug]`, `/galleries`, `/galleries/[slug]`, `/galleries/[slug]/enter`, `/auctions`, `/verify/[serial]`, `/about`, `/faq`, `/legal/*`, `/search`.
Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/2fa`.
Buyer: `/shortlist`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/purchases` (downloads), `/watchlist`, `/messages`, `/notifications`, `/collections`, `/settings`.
Artist: `/studio` (dashboard), `/studio/listings`, `/studio/listings/new`, `/studio/listings/[id]/edit`, `/studio/auctions`, `/studio/orders`, `/studio/earnings`, `/studio/analytics`, `/studio/verification`, `/studio/profile`, `/studio/promotions`, `/studio/consents`.
Curator: `/curate`, `/curate/galleries`, `/curate/galleries/new`, `/curate/galleries/[id]/edit`.
Admin: `/admin`, `/admin/users`, `/admin/verifications`, `/admin/listings`, `/admin/galleries`, `/admin/disputes`, `/admin/reports`, `/admin/orders`, `/admin/ledger`, `/admin/fees`, `/admin/flags`, `/admin/content`, `/admin/audit`, `/admin/analytics`, `/admin/unity`.

All routes exist under `/[locale]/...`.

### 14.4 Key UX rules

- Primary actions are single and obvious per screen; destructive actions confirmed with specific wording.
- Prices always show currency code or symbol unambiguously; converted prices labeled "approx."
- Fees are disclosed before payment, with an expandable breakdown.
- Trust cues (verified, protected payment, escrow explainer "Funds are released to the artist after delivery is confirmed") near every payment action.
- Never dead-end: every error offers a next step.
- Forms: inline validation on blur, preserved input on error, accessible error summaries.
- Auction page: price, time left, and bid input visible above the fold on mobile; sticky bid bar.

---

## 15. TESTING STRATEGY

| Layer         | Tooling                                                                              | Required coverage                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit          | Vitest                                                                               | `money.ts`, fee calculator, state machines (all legal/illegal transitions), auction rules (increments, anti-snipe, reserve), authz policies matrix, hash chain, i18n key parity, zod schemas                                    |
| Integration   | Vitest + Testcontainers (Postgres)                                                   | Services with real DB: bidding concurrency (parallel promises), order creation idempotency, webhook idempotency, escrow release job, ledger balance invariants                                                                  |
| API contract  | zod/OpenAPI + schemathesis-style fuzz (P1)                                           | Every route returns documented shapes and problem-details errors                                                                                                                                                                |
| E2E           | Playwright (desktop + mobile viewport)                                               | Register -> verify -> become artist -> verification -> publish -> buyer buys with Mock -> download -> review; auction flow with two browsers; dispute flow; VR contract flow with mock module; locale switch; PWA install check |
| Accessibility | axe-core in Playwright on key pages                                                  | Zero serious/critical violations                                                                                                                                                                                                |
| Visual        | Playwright screenshots (P2)                                                          | Home, artwork page, checkout                                                                                                                                                                                                    |
| Load          | k6                                                                                   | Auction concurrency, explore queries                                                                                                                                                                                            |
| Security      | CI SAST (Semgrep/CodeQL), dependency audit, manual checklist from `docs/SECURITY.md` |                                                                                                                                                                                                                                 |
| Seed realism  | `pnpm db:seed`                                                                       | 40 artists, 300 artworks across types, 12 live auctions, 3 galleries, sample orders, disputes, messages                                                                                                                         |

Minimum thresholds: 80% line coverage on `src/server/services` and `src/server/state-machines`, 100% on `money.ts`, fee calculator, and authz policies. CI fails below thresholds.

---

## 16. DEVOPS, CI/CD, AND OPERATIONS

- GitHub Actions workflows: `ci.yml` (install, lint, typecheck, unit, integration with service containers, build), `e2e.yml` (Playwright on preview URL), `security.yml` (audit, Semgrep), `lighthouse.yml`.
- Vercel: preview deployment per PR; production on main merge; Neon branching for preview databases; `prisma migrate deploy` in the deploy step; seed only in preview/staging.
- Migrations: forward-only, reviewed; destructive changes use expand/contract.
- Feature flags: DB-backed with env overrides; list in `docs/FLAGS.md`: `FEATURE_PHYSICAL_CHECKOUT`, `FEATURE_CRYPTO_PAYMENTS`, `FEATURE_AI`, `FEATURE_VR`, `FEATURE_PROXY_BIDDING`, `AUTO_PUBLISH_TRUSTED`, `PAYMENT_MOCK_ENABLED`.
- Runbook (`docs/RUNBOOK.md`): how to rotate secrets, replay a webhook, fix a stuck auction, release or freeze an escrow hold manually, switch the default payment provider to Mock during a live demo, restore a DB backup.
- Docker Compose for local: Postgres (with pgvector), MinIO, MailHog, Redis; `pnpm dev:up` starts everything and seeds.
- One-command setup: `pnpm setup` (install, compose up, migrate, seed, create admin `admin@example.com` with a printed temp password in dev only).

---

## 17. DELIVERY PLAN (phases by priority, no fixed dates)

Each phase has an exit gate. Do not advance until it passes.

### Phase 0: Foundation (P0)

Monorepo, tooling, CI, Docker, env validation, Prisma baseline, design tokens, i18n scaffold (3 locales), layout shell, auth (AUTH-01..04, 06, 07, 09), RBAC policies, error/logging framework, provider container with mocks, health endpoints, PWA manifest + basic service worker.
**Exit gate:** a user can register, verify email (MailHog), log in, switch locale, see role-aware nav; CI green; `docs/ARCHITECTURE.md` drafted.

### Phase 1: Artists and catalog (P0)

ART-01..06, LST-01..07,10,11, storage + image pipeline, 3D validation, moderation queue (verification + listing), DSC-01..04,07,08,10, artwork pages with `<model-viewer>`, seed data, unity-contract package and mocks (8.7).
**Exit gate:** artist verified by admin, publishes digital and 3D listings; buyer discovers via search/filters; mock Unity module renders a gallery from the manifest in a test page.

### Phase 2: Buying, money, trust (P0)

CHK-01..09, 11, PAY-01..04,06..10,12, escrow, ledger, FUL-01..05, PRV-01..03, notifications (NTF-01,02,04), reviews (DSP-05), disputes (DSP-01..03).
**Exit gate:** full purchase with Mock, Stripe sandbox, and Flutterwave sandbox; funds held then released; certificate verifies; dispute freezes funds; ledger balanced; webhook idempotency tests pass.

### Phase 3: Auctions and realtime (P0)

AUC-01..06, 09..11, realtime provider, anti-sniping, closing job, winner flow, messaging (MSG-01..04), social basics (SOC-01,02,06), watchlist.
**Exit gate:** concurrent bid load test passes; live two-browser auction E2E passes; messaging real-time works.

### Phase 4: Galleries, shortlist, AR/VR integration (P0)

Shortlist (CHK-02), GAL-01..05, 07, VR endpoints (8.3), bridge (8.4), AR web path (8.5), VR checkout handoff, 2D fallback, `/admin/unity` check, `docs/UNITY_INTEGRATION.md`.
**Exit gate:** with the mock module, the full flow (enter gallery -> focus -> shortlist -> AR view -> checkout handoff) passes E2E; the peer confirms their build passes the contract tests (`pnpm test:contract -- --build-url=...`).

### Phase 5: Dashboards, admin, compliance (P0/P1)

ANA-01..04, 06, ADM-01..05,07, LEG-01,02, cookie consent, i18n review pass, accessibility pass, SEO pass, performance pass.
**Exit gate:** Lighthouse budgets met; axe clean; admin can operate every queue; `docs/DEMO_SCRIPT.md` rehearsed.

### Phase 6: Completeness (P1)

AI features (AIF-01..05, 09), semantic search, recommendations, proxy bidding, 2FA, push notifications, collections, comments, saved searches, promo codes, featured listings purchase (PAY-11), trust score, data export.

### Phase 7: Stretch (P2/P3)

Moderation AI, price guidance, concierge, Capacitor wrapper, subscription tiers, shill-bid detection, crypto roadmap doc, shipping provider, gallery analytics.

### MVP cut-line for the demo

Everything marked P0 in Phases 0 to 5. If time runs short, Phase 5's compliance and polish items beat any Phase 6 item.

---

## 18. DEMO AND SEED PLAN (build alongside, finalize in Phase 5)

Demo script (`docs/DEMO_SCRIPT.md`), target 12 minutes:

1. Landing in French, switch to Kinyarwanda, switch currency to RWF (shows i18n + multi-currency).
2. Artist Amina's storefront; verified badge; her 3D asset with AR preview on a phone (QR code on screen).
3. Buyer browses, semantic search ("warm abstract"), likes and shortlists three pieces.
4. Curator's gallery: enter the VR module (Unity or mock), walk, focus a piece, shortlist from inside VR, see it appear on the web shortlist instantly.
5. Live auction on two devices: bid war, anti-snipe extension, outbid notification.
6. Checkout with Stripe sandbox; then show Flutterwave; then simulate failure and switch to Mock fallback.
7. Download, certificate, `/verify/serial` hash chain check.
8. Open a dispute on another order; moderator freezes funds, resolves partial refund; ledger reconciliation page.
9. Artist analytics and admin dashboards.
10. Wrap-up: architecture slide and security posture.

Seed must be deterministic (`faker` with a fixed seed), idempotent, and tag demo data with `isDemo` for easy cleanup. Provide two switchable "demo clocks" helpers for auctions: a dev-only admin tool to shorten an auction's end time to N seconds.

---

## 19. DEFINITION OF DONE AND QUALITY GATES

A requirement is done only when:

- [ ] Behavior matches the requirement and its acceptance criteria.
- [ ] Types strict, no `any` without a justified comment; lint and format clean.
- [ ] Authorization enforced server-side and covered by tests (including a negative test).
- [ ] Inputs validated; errors use problem-details with stable codes.
- [ ] Unit/integration tests written and passing; E2E for user-visible flows.
- [ ] i18n keys present in `en`, `fr`, `rw` (key parity test passes).
- [ ] Accessible: keyboard operable, labeled, contrast verified, axe clean on the page.
- [ ] Loading, empty, and error states implemented.
- [ ] Mobile layout verified at 360 px.
- [ ] Analytics events fired where defined; audit logs written where Section 12 requires.
- [ ] Docs updated (API via OpenAPI, ADR if a decision was made, README snippet).
- [ ] No secrets, no TODO without a linked issue in `docs/BACKLOG.md`.
- [ ] Provider code has a working Mock and the Mock path is tested.

Project-level gates before calling the build complete: all P0 requirements done, CI green on main, Lighthouse budgets met, security checklist complete, demo script rehearsed end to end on a mid-range phone, Unity contract tests pass against the peer's build (or the mock module if the build is unavailable).

---

## 20. RISKS, ASSUMPTIONS, AND OPEN ITEMS

### 20.1 Risks and mitigations

| Risk                                            | Mitigation                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Unity WebGL performance on mobile browsers      | Quality hints, texture size caps in manifest, 2D fallback, web-native AR path independent of Unity                  |
| Unity build not ready for the demo              | Mock module is the default experience; contract tests keep both sides honest                                        |
| Payment provider sandbox issues during demo     | Mock provider fallback, switchable at runtime by an admin flag                                                      |
| Flutterwave/Stripe currency or country limits   | `supportedCurrencies()` gating with clear errors; document per-country constraints                                  |
| Realtime on serverless                          | Managed provider (Pusher/Ably) with polling fallback                                                                |
| Auction correctness under concurrency           | DB-level locking, unique constraints, load test in CI nightly                                                       |
| Legal exposure (KYC, tax, art authenticity, IP) | Templates labeled as such; moderation and takedown flows; owner to obtain legal review before any real-money launch |
| Scope size                                      | Strict phases and the P0 cut-line                                                                                   |
| Kinyarwanda translation quality                 | Review file and native review before demo                                                                           |
| AI hallucination in listing descriptions        | Prompts forbid unprovided facts; human approval required; marked "AI-assisted" internally                           |

### 20.2 Assumptions

- Sandbox/test payment credentials will be supplied by the owner; nothing in this build moves real money.
- Real-money production use would require legal review, formal KYC provider, tax handling, and payout compliance; this build is capstone/demo grade by design.
- The Unity peer follows the `kv.v1` contract and the manifest schema; changes require a version bump and a note in `docs/UNITY_INTEGRATION.md`.

### 20.3 Open items for the owner to confirm (defaults are used if unanswered)

1. Final product name and logo (default: Kaleido placeholder).
2. Whether physical and print listings should become transactable before the demo (default: no; inquiry flow, Section 1.5).
3. Default commission (12%) and buyer fee (3%).
4. Escrow auto-release period for digital goods (default 3 days) and dispute window (default 7 days).
5. Currency list beyond the eight defaults.
6. Whether curators apply and get approved (P1) or are admin-granted only (P0 default).
7. Hosting accounts: Vercel, Neon, Cloudflare R2, Pusher/Ably, Resend, Sentry, Upstash credentials needed for staging.
8. Unity peer's target build hosting origin and Unity version (affects headers and compression settings).

---

## 21. APPENDICES

### A. Environment variables (`.env.example` must contain all of these)

```
# App
NEXT_PUBLIC_APP_URL=
BRAND_NAME=Kaleido
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,fr,rw
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,EUR,GBP,RWF,KES,NGN,GHS,ZAR

# Database
DATABASE_URL=
DIRECT_URL=

# Auth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
FIELD_ENCRYPTION_KEY=

# Providers (select)
PAYMENT_PROVIDERS_ENABLED=mock
PAYMENT_PROVIDER_DEFAULT=mock
PAYMENT_MOCK_ENABLED=true
STORAGE_PROVIDER=local
EMAIL_PROVIDER=console
REALTIME_PROVIDER=memory
AI_PROVIDER=mock
SEARCH_PROVIDER=postgres
FX_PROVIDER=static
SCAN_PROVIDER=mock
PUSH_PROVIDER=log
ASSET3D_PROVIDER=mock

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=

# Flutterwave
FLW_PUBLIC_KEY=
FLW_SECRET_KEY=
FLW_ENCRYPTION_KEY=
FLW_WEBHOOK_SECRET_HASH=

# Storage
S3_ENDPOINT=
S3_REGION=
S3_BUCKET_PUBLIC=
S3_BUCKET_PRIVATE=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Email / Realtime / Jobs / Cache
RESEND_API_KEY=
EMAIL_FROM=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
ANTHROPIC_API_KEY=
EMBEDDINGS_PROVIDER_KEY=
AI_DAILY_QUOTA_PER_USER=20

# Web push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Unity
UNITY_BUILD_BASE_URL=
UNITY_ALLOWED_ORIGIN=
VR_TOKEN_TTL_SECONDS=900

# Business rules
COMMISSION_BPS=1200
BUYER_FEE_BPS=300
ESCROW_AUTO_RELEASE_DAYS=3
DISPUTE_WINDOW_DAYS=7
AUCTION_ANTISNIPE_WINDOW_SEC=120
AUCTION_ANTISNIPE_EXTEND_SEC=120
AUCTION_PAYMENT_DUE_HOURS=48

# Feature flags (env overrides)
FEATURE_PHYSICAL_CHECKOUT=false
FEATURE_CRYPTO_PAYMENTS=false
FEATURE_AI=true
FEATURE_VR=true
FEATURE_PROXY_BIDDING=false
AUTO_PUBLISH_TRUSTED=true

# Observability / bot protection
SENTRY_DSN=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

### B. Error code catalogue (starter)

`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_FAILED`, `RATE_LIMITED`, `EMAIL_NOT_VERIFIED`, `ARTIST_NOT_VERIFIED`, `PAYOUT_NOT_CONFIGURED`, `FEATURE_DISABLED`, `LISTING_NOT_AVAILABLE`, `EDITION_SOLD_OUT`, `AUCTION_NOT_LIVE`, `AUCTION_ENDED`, `BID_TOO_LOW`, `OWN_LISTING_BID`, `PAYMENT_FAILED`, `PAYMENT_PROVIDER_UNSUPPORTED_CURRENCY`, `IDEMPOTENCY_CONFLICT`, `DOWNLOAD_LIMIT_REACHED`, `DISPUTE_WINDOW_CLOSED`, `PROTO_MISMATCH`, `VR_TOKEN_EXPIRED`.

### C. Glossary

- **Escrow-style hold:** funds are captured by the platform and only released to the artist after delivery confirmation or timeout; this is a platform ledger/transfer mechanism, not a licensed escrow service.
- **Shortlist:** a buyer's server-side consideration list shared by web, AR, and VR.
- **Manifest:** the JSON description of a gallery consumed by Unity.
- **Provenance chain:** hash-linked history of an artwork's creation and ownership transfers.
- **Mock provider:** deterministic fake implementation of an external service used for tests and demo fallback.
- **bps:** basis points; 100 bps = 1%.

### D. Suggested first prompt for the agent

> Read `PRODUCT_SPEC.md` completely. Create `CLAUDE.md` from Sections 0.2 and 19. Then execute Phase 0 exactly as specified in Section 17, committing in small conventional commits referencing requirement IDs. After Phase 0's exit gate passes, write a short status note in `docs/STATUS.md` listing what is done, what is stubbed, and any decisions logged in `docs/DECISIONS.md`, then continue to Phase 1 without waiting unless blocked by a missing credential.

---

_End of specification._
