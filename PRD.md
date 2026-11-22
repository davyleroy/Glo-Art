# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Global Art Marketplace with AR/VR Gallery Integration (codename: Kaleido)

| Field              | Value                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document type      | Product Requirements Document                                                                                                                                                                                |
| Version            | 1.0                                                                                                                                                                                                          |
| Status             | Draft for owner approval                                                                                                                                                                                     |
| Product owner      | Davy Mbuto Nkurunziza                                                                                                                                                                                        |
| Engineering        | AI coding agent (Claude Code) building from this PRD and `PRODUCT_SPEC.md`                                                                                                                                   |
| AR/VR partner      | Peer developer (Unity WebGL module)                                                                                                                                                                          |
| Companion document | `PRODUCT_SPEC.md` (technical and functional specification). This PRD says **why and what**; the spec says **how**. Where they conflict, the PRD wins on intent and scope, the spec wins on technical detail. |
| Context            | Capstone project, demo-grade, sandbox payments only                                                                                                                                                          |

---

## 1. EXECUTIVE SUMMARY

Kaleido is a web app, installable as a mobile app (PWA), where artists anywhere in the world sell artwork directly to buyers anywhere in the world through fixed-price listings and timed auctions. It is built for the people most marketplaces underserve: artists in Africa and other non-mainstream art regions who struggle with global reach, payment access, and trust, and buyers who want to discover them with confidence.

Its signature feature is an immersive gallery experience. Curators assemble virtual exhibitions; buyers walk through them in an AR/VR module (built in Unity by a partner), shortlist pieces as they go, preview art in their own room with AR, and carry their shortlist straight into checkout. The marketplace itself handles everything around that experience: accounts, artist verification, listings, search, auctions, payments (Stripe, Flutterwave, a demo-safe mock, and a designed-but-disabled crypto option), escrow-style payout holds, disputes, provenance certificates, messaging, notifications, analytics, and administration, in English, French, and Kinyarwanda.

**One-line pitch:** "A trusted global marketplace where art from underrepresented regions is discovered by walking through it, not scrolling past it."

---

## 2. BACKGROUND AND PROBLEM STATEMENT

### 2.1 The problem

1. **Artists lack reach and rails.** Talented artists in Africa often cannot easily accept international payments, are absent from major platforms' discovery algorithms, and have little leverage on fees and presentation.
2. **Buyers lack trust.** Buying art from a stranger across borders raises fear of fakes, non-delivery, and unfair disputes. Without strong verification and buyer protection, buyers default to familiar names.
3. **Online art browsing is flat.** Grids of thumbnails fail to convey scale, texture, and how a piece will feel in a space. This is the main reason buyers hesitate on higher-value pieces.
4. **Curation is hard to scale.** Curators have few tools to turn an idea into an experience people can actually enter.
5. **Digital and 3D art lack a proper home.** Creators of digital art and 3D assets (including assets reusable in AR/VR) need licensing, secure delivery, and proof of authenticity that works without blockchain complexity.

### 2.2 Why now

- Phones can render 3D and AR in the browser (WebGL2, WebXR, Quick Look, Scene Viewer), so immersive previews no longer require special hardware.
- Cross-border payment options for African markets (cards, mobile money, bank rails) are available through providers such as Flutterwave alongside global rails such as Stripe.
- Interest in African and diaspora art is growing, while tooling for artists and curators there remains thin.

### 2.3 Opportunity statement

Build a marketplace that wins on **trust** (verification, escrow-style holds, provenance), **presentation** (AR/VR galleries and in-room preview), and **access** (local payment rails and languages), and demonstrate it end to end as a capstone-grade product.

---

## 3. VISION, POSITIONING, AND DIFFERENTIATION

### 3.1 Vision

Every artist, wherever they live, can show their work to the world in a way that does it justice and get paid fairly and safely; every buyer can discover and buy that work with confidence.

### 3.2 Positioning

For art buyers and artists who want to transact across borders with confidence, Kaleido is a global art marketplace that makes discovery immersive and purchases safe. Unlike generic marketplaces (no art-specific trust or presentation), print-on-demand shops (no originals or auctions), and crypto-first art platforms (high friction, speculative), Kaleido combines verified artists, fair fees, local payment rails, authenticity records without blockchain, and walkable virtual galleries.

### 3.3 Differentiators (the "reasons to believe")

| #   | Differentiator             | Proof in product                                                                                       |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| D1  | Immersive discovery        | Curator-built virtual galleries with Unity WebGL, shortlist sync, AR in-room preview                   |
| D2  | Trust by design            | Artist verification, escrow-style payout hold, dispute flow, provenance hash chain, certificates       |
| D3  | Access                     | Flutterwave + Stripe, multi-currency display, English/French/Kinyarwanda, PWA for low-end devices      |
| D4  | Fair, transparent fees     | Fee breakdown shown before payment; artist net visible while listing                                   |
| D5  | Digital and 3D first-class | Licensing, secure delivery, 3D validation, reuse in galleries                                          |
| D6  | Demo resilience            | Mock provider and mock Unity module mean the product always demonstrates, even when third parties fail |

### 3.4 Competitive landscape (categories, qualitative)

| Category                          | What they do well                 | Gap Kaleido targets                                                       |
| --------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| General handmade/art marketplaces | Large audience, familiar checkout | Limited art-specific trust, no immersive viewing, weak regional focus     |
| Gallery-style online art sellers  | Curation, higher-end buyers       | Gatekept, high commissions, little access for emerging artists            |
| Print-on-demand / merch platforms | Easy fulfilment                   | No originals, no auctions, no provenance                                  |
| NFT / crypto art markets          | Provenance, digital ownership     | Onboarding friction, volatility, reputation concerns, limited fiat access |
| Virtual gallery tools             | Immersive spaces                  | Usually disconnected from commerce and payments                           |

(The owner should validate this table with a short desk review before any external presentation. No market-size figures are asserted in this document.)

---

## 4. TARGET USERS

### 4.1 Segments

| Segment             | Who                                                                                                               | Core need                                            | Primary success signal                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| Artists (supply)    | Emerging and established visual artists, digital creators, 3D artists, mainly in Africa and diaspora, also global | Reach, fair pay, professional presence, safety       | First sale, repeat sales, positive reviews                          |
| Buyers (demand)     | Individual collectors, design-conscious consumers, diaspora buyers, small businesses decorating spaces            | Discover, trust, buy confidently, see art in context | Completed purchase, return visits, shortlist-to-purchase conversion |
| Curators            | Independent curators, galleries, cultural organizations, art educators                                            | Build and share exhibitions                          | Galleries published and visited                                     |
| Moderators / Admins | Platform operations                                                                                               | Keep marketplace safe and healthy                    | Low dispute rate, short queue times                                 |

### 4.2 Personas

**Amina, 27, emerging painter and digital illustrator, Kigali.** Sells locally via Instagram and WhatsApp, struggles with international buyers and payment. Wants verified status, simple listing, payout in RWF or USD, and to see her work in a virtual show. Fears: scams, unfair fees, complicated tools.

**Lucas, 41, collector, Lyon.** Buys 3 to 5 pieces a year, enjoys auctions, wants authenticity assurance and to see how art looks on his wall. Fears: fakes, non-delivery, hidden fees, FX surprises. Prefers French.

**Grace, 34, independent curator, Nairobi.** Organizes pop-up exhibitions, wants a digital venue and a shareable link with attribution to artists and a path to sales.

**Ines, 30, moderator.** Reviews artist verifications, listings, disputes. Wants a fast queue, full context in one screen, and clear policy templates.

### 4.3 Jobs to be done

- When I want to reach buyers abroad, I want to list my work and get paid safely, so I can build a sustainable art income. (Artist)
- When I find a piece I love from someone I have never met, I want proof it is genuine and protection if something goes wrong, so I can buy without anxiety. (Buyer)
- When I am unsure if a piece suits my space, I want to see it at real size in my room, so I can decide confidently. (Buyer)
- When I have an exhibition idea, I want to place works into a room and share a link, so people can experience it without travel. (Curator)

---

## 5. GOALS, NON-GOALS, AND SUCCESS METRICS

### 5.1 Product goals

| ID  | Goal                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- |
| PG1 | Deliver a complete, secure, end-to-end marketplace for digital and 3D art, with physical and print listings visible and inquirable |
| PG2 | Make AR/VR galleries a first-class, commerce-connected feature via a stable Unity contract                                         |
| PG3 | Build buyer trust with verification, escrow-style holds, disputes, and provenance                                                  |
| PG4 | Serve a multilingual, multi-currency audience including Kinyarwanda and French speakers                                            |
| PG5 | Demonstrate engineering excellence (tests, security, accessibility, CI/CD, docs) suitable for capstone assessment                  |

### 5.2 Non-goals (v1)

Native Unity internals; live crypto payments or NFT minting; physical shipping logistics and checkout (flag-gated); native mobile codebases; tax compliance by jurisdiction; real-money production operations.

### 5.3 Success metrics

Because this is a capstone with no live market, metrics are split into **product-quality targets (measured in testing and demo)** and **pilot targets (measured if a small pilot with real users is run with sandbox money)**.

**North Star (pilot):** Number of completed purchases (sandbox) per week made after a buyer interacted with a gallery, shortlist, or AR preview. This captures the core thesis that immersive discovery drives confident buying.

| Category            | Metric                                                                   | Target                                |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| Activation (artist) | Registered artist to first published listing within 24 h of verification | 60% (pilot)                           |
| Activation (buyer)  | Visitors who view 3+ artworks in a session                               | 50%                                   |
| Conversion          | Shortlist-to-cart rate                                                   | 25%                                   |
| Conversion          | Cart-to-paid order rate                                                  | 55%                                   |
| Engagement          | Gallery visitors who shortlist at least one piece                        | 35%                                   |
| Engagement          | Artwork pages with AR preview launched (where available)                 | 10% of eligible views                 |
| Auctions            | Sell-through rate (auctions ending with a winner)                        | 60%                                   |
| Auctions            | Winner payment completion within 48 h                                    | 85%                                   |
| Trust               | Dispute rate (disputes per completed order)                              | under 3%                              |
| Trust               | Median verification review time                                          | under 24 h (demo: under 5 min)        |
| Reliability         | Checkout success rate (excluding user abandonment)                       | above 98%                             |
| Reliability         | Webhook processing success                                               | above 99.5%, 0 duplicate side effects |
| Performance         | Mobile LCP on artwork and home pages                                     | under 2.5 s                           |
| Quality             | Lighthouse PWA / Accessibility / SEO                                     | 90+ / 95+ / 95+                       |
| Quality             | Accessibility violations (serious/critical) on key pages                 | 0                                     |
| Quality             | P0 requirement completion                                                | 100%                                  |
| Quality             | Automated test pass rate on main                                         | 100%                                  |
| Localization        | Message key parity across en/fr/rw                                       | 100%                                  |

Guardrail metrics: refund rate, chargebacks (sandbox simulated), moderation backlog size, page error rate, support requests per 100 orders.

---

## 6. SCOPE AND RELEASE PLAN

### 6.1 Prioritization (MoSCoW)

**Must have (P0, demo cut-line):** accounts and roles; artist onboarding and verification; listings with image, digital file, and 3D upload; catalog, search, filters, artwork pages with 3D viewer and AR; auctions with anti-sniping and real-time updates; cart, shortlist, checkout; Stripe, Flutterwave, and Mock payments; fees; escrow-style hold and payouts; ledger; digital delivery; licenses and provenance certificates; disputes and reviews; messaging and notifications; curator galleries and Unity integration (with mock module); analytics dashboards; admin and moderation; i18n (en/fr/rw) and multi-currency display; PWA; legal pages and consent; security baseline.

**Should have (P1):** AI features (tagging, descriptions, semantic search, recommendations); proxy bidding; 2FA; web push; collections; comments; saved searches; promo codes; featured listing purchase; artist trust score; data export.

**Could have (P2):** moderation AI; price guidance; concierge; Capacitor wrapper; subscription tiers; shill-bid detection; gallery analytics depth.

**Will not have in v1 (P3, documented only):** live crypto payments, NFT anchoring, physical shipping implementation.

### 6.2 Delivery phases (no fixed dates; each gated)

| Phase | Theme                         | Outcome the user would notice                                           |
| ----- | ----------------------------- | ----------------------------------------------------------------------- |
| 0     | Foundation                    | Sign up, log in, switch language, installable app shell                 |
| 1     | Artists and catalog           | Artists get verified and publish; buyers discover and view in 3D        |
| 2     | Buying, money, trust          | Complete purchase with held funds, certificate, disputes                |
| 3     | Auctions and realtime         | Live bidding and chat                                                   |
| 4     | Galleries and AR/VR           | Walk a gallery, shortlist, AR preview, checkout handoff                 |
| 5     | Dashboards, admin, compliance | Artists see earnings; admins run the platform; polish and accessibility |
| 6     | Completeness                  | AI, push, collections, comments, and more                               |
| 7     | Stretch                       | Optional extras                                                         |

Details and exit gates: `PRODUCT_SPEC.md` Section 17.

### 6.3 Scope decision on physical goods

Physical artworks and print-on-demand pieces are visible, discoverable, shortlist-able, placeable in galleries, and previewable in AR. Purchase is replaced by an **"Inquire about this piece"** conversation until physical checkout is enabled by feature flag. This reconciles the product's intended breadth with the decision to defer shipping. (Spec Section 1.5.)

---

## 7. USER JOURNEYS

### 7.1 Buyer: discover, decide, buy

1. Lands on home (language auto-detected, currency selectable), sees featured work, ending auctions, and featured galleries.
2. Searches "warm abstract" or filters by medium and country; opens an artwork page.
3. Zooms images, spins the 3D model, taps "View in your room" to see true size on a wall.
4. Likes the piece, adds it to the shortlist; enters a curated gallery in VR and shortlists two more while walking.
5. Opens the shortlist, compares side by side, messages an artist with a question.
6. Moves chosen items to cart, reviews fees, accepts license, pays via card or mobile money (or demo payment).
7. Downloads files, receives certificate; confirms receipt; leaves a review.

Moments that matter: seeing the piece at true size; fee transparency; seeing "funds held until you confirm" before paying; the certificate and verification page.

### 7.2 Buyer: auction

Watchlist an auction, receive an "ending soon" alert, bid, get outbid notification, rebid, see an extension when a late bid lands (anti-sniping), win, pay within 48 hours, receive certificate.

### 7.3 Artist: onboard to payout

1. Applies as artist, completes store profile and uploads ID and proof of work.
2. Verification approved by a moderator; verified badge appears.
3. Sets up payouts (Stripe Connect, Flutterwave, or mock in demo).
4. Creates listing: uploads images, a digital file or 3D model, sets price or auction, license, descriptions in up to three languages; AI suggests tags and alt text (P1).
5. Listing is reviewed (first listings) then published; shares link.
6. Receives bids, messages, and an order; sees funds as "held", then "available", then "paid out".
7. Monitors analytics; responds to a review; promotes a listing (P1).

### 7.4 Curator: build a gallery

Creates a gallery, picks a room template and mood, places published artworks into slots, requests consent from artists who are not the curator, submits for review, shares the link, sees visits and shortlist counts (P1).

### 7.5 Moderator: resolve a dispute

Opens dispute queue, reads timeline and evidence, requests more info if needed, decides refund, partial refund, or release; the system freezes and moves funds accordingly and notifies both sides.

### 7.6 Edge journeys to design explicitly

Payment fails or is abandoned; payment provider is down; bidder never pays; artist unresponsive in dispute; file download corrupted; Unity module fails to load (2D fallback); user switches language mid-checkout; user is offline (shortlist visible offline); buyer in a currency the provider does not support (clear block with alternatives).

---

## 8. FUNCTIONAL REQUIREMENTS (PRODUCT LEVEL)

Each epic below states the product intent, key user stories, and acceptance criteria summaries. Detailed technical requirements and IDs live in `PRODUCT_SPEC.md`; the "Spec ref" column gives the mapping.

### 8.1 Epics overview and traceability

| Epic | Description                                 | Priority | Spec ref          |
| ---- | ------------------------------------------- | -------- | ----------------- |
| E1   | Accounts, roles, security                   | P0       | 6.1 AUTH, 12 SEC  |
| E2   | Artist onboarding, verification, storefront | P0       | 6.2 ART           |
| E3   | Listings, media, 3D and digital assets      | P0       | 6.3 LST           |
| E4   | Discovery, search, artwork pages            | P0/P1    | 6.4 DSC           |
| E5   | Auctions                                    | P0/P1    | 6.5 AUC           |
| E6   | Shortlist, cart, checkout                   | P0       | 6.6 CHK           |
| E7   | Payments, fees, escrow, payouts             | P0       | 6.7 PAY, 10       |
| E8   | Fulfillment, licenses, certificates         | P0       | 6.8 FUL, 6.10 PRV |
| E9   | Disputes, refunds, reviews                  | P0       | 6.9 DSP           |
| E10  | Messaging and notifications                 | P0/P1    | 6.11 MSG NTF      |
| E11  | Social layer                                | P0/P1    | 6.12 SOC          |
| E12  | Virtual galleries and Unity integration, AR | P0       | 6.13 GAL, 8       |
| E13  | AI features                                 | P1/P2    | 6.14 AIF          |
| E14  | Analytics dashboards                        | P0       | 6.15 ANA          |
| E15  | Admin and moderation                        | P0       | 6.16 ADM          |
| E16  | Localization and currency                   | P0       | 6.17 I18N         |
| E17  | PWA and mobile                              | P0       | 9 MOB             |
| E18  | Legal, privacy, compliance                  | P0       | 6.18 LEG, 12      |

### 8.2 User stories with acceptance criteria

Format: As a [role], I want [capability], so that [benefit]. Acceptance criteria in Given/When/Then.

**E1 Accounts**

- US-1.1 As a visitor, I want to sign up with email or Google, so that I can bid and buy.
  - Given a new visitor, When they register with valid details, Then an account is created, a verification email is sent, and they cannot bid or buy until verified.
- US-1.2 As a user, I want to reset a forgotten password safely.
  - Given a registered email, When a reset is requested, Then a single-use 30-minute link is emailed and the response is identical for unknown emails.
- US-1.3 As a privileged user, I want two-factor authentication so that my account cannot be easily taken over. (P1)

**E2 Artist onboarding**

- US-2.1 As an artist, I want to apply and submit verification documents so that I can sell with a verified badge.
  - Given a completed application, When the moderator approves it, Then the artist is notified, the badge appears, and publishing is enabled.
  - Given a rejection, Then a reason is shown and the artist can resubmit.
- US-2.2 As an artist, I want to set up payouts in my currency so that I can get paid.
- US-2.3 As a buyer, I want to visit an artist's storefront and follow them.

**E3 Listings**

- US-3.1 As an artist, I want a guided listing editor with autosave so that I never lose work.
- US-3.2 As an artist, I want to upload images, a digital file, and a 3D model with immediate validation feedback.
  - Given a GLB over the polygon limit, When uploaded, Then it is rejected with a plain-language reason and a fix suggestion.
- US-3.3 As an artist, I want to describe my work in English, French, and Kinyarwanda so that buyers see it in their language.
- US-3.4 As an artist, I want to choose fixed price or auction and a license for digital/3D work.

**E4 Discovery**

- US-4.1 As a buyer, I want to search with typo tolerance and filter by type, price, medium, country, and "has 3D/AR".
- US-4.2 As a buyer, I want to see price in my currency with the original currency shown so that I understand what I will be charged.
- US-4.3 As a buyer, I want an artwork page with zoomable images, 3D spin, and "view in your room".
  - Given a listing with a GLB, When the buyer taps the AR button on a supported phone, Then the model appears at true size (per stored real-world scale).
- US-4.4 As a buyer, I want semantic search ("warm abstract with hills") and "more like this". (P1)

**E5 Auctions**

- US-5.1 As an artist, I want to run a timed auction with an optional hidden reserve.
- US-5.2 As a bidder, I want to place bids and see live price and time remaining.
  - Given two simultaneous winning-amount bids, Then exactly one wins and the other sees the updated price.
- US-5.3 As a bidder, I want to be notified when I am outbid or an auction I watch is ending.
- US-5.4 As a bidder, I want fairness: Given a bid in the final two minutes, Then the end time extends by two minutes (capped).
- US-5.5 As a winner, I want 48 hours and reminders to pay.

**E6 Shortlist, cart, checkout**

- US-6.1 As a buyer, I want a shortlist separate from my cart, filled from web, AR, or VR, so that I can consider without committing.
- US-6.2 As a buyer, I want to compare shortlisted pieces side by side and add notes.
- US-6.3 As a buyer, I want a clear checkout with fee breakdown, license acceptance, and my choice of payment method.
  - Given an item priced 100.00 USD with 3% buyer fee, Then checkout shows 103.00 total with the breakdown visible.
- US-6.4 As a buyer, I want double-clicks and refreshes not to create duplicate orders.

**E7 Payments and escrow**

- US-7.1 As a buyer, I want to pay by card or mobile money through trusted providers.
- US-7.2 As a demo operator, I want a Mock payment option that can succeed, fail, or delay on command, so the demo never depends on third parties.
- US-7.3 As an artist, I want to see earnings as Held, Available, and Paid out, and understand fees before I list.
- US-7.4 As a buyer, I want assurance that the artist is paid only after I receive the work (or a short timeout) so that I am protected.
  - Given a paid order, When no dispute is opened and 3 days pass after delivery, Then funds are released automatically.
- US-7.5 As a finance admin, I want every money movement recorded in a balanced ledger and reconciled against provider events.

**E8 Fulfillment and authenticity**

- US-8.1 As a buyer, I want secure, limited, expiring download links for my files.
- US-8.2 As a buyer, I want a certificate of authenticity with a QR code that anyone can verify publicly.
  - Given a certificate serial, When opened at the verification page, Then the page shows authenticity and whether the provenance chain is intact.

**E9 Disputes and reviews**

- US-9.1 As a buyer, I want to open a dispute with evidence within the dispute window so that I can get help.
- US-9.2 As an artist, I want to respond with my evidence within 72 hours.
- US-9.3 As a moderator, I want one screen with the timeline, evidence, chat, and decision actions with required reasons.
- US-9.4 As a buyer, I want to review a completed order; as an artist, I want to reply once.

**E10 Messaging and notifications**

- US-10.1 As a buyer, I want to ask an artist a question about a piece in real time.
- US-10.2 As a user, I want notifications in-app, by email, and push (P1) with per-category control.
- US-10.3 As a user, I want warnings about off-platform payment requests so that I avoid scams.

**E11 Social**

- US-11.1 As a buyer, I want to like pieces and follow artists and see a following feed.
- US-11.2 As a buyer, I want public or private collections to organize my taste. (P1)

**E12 Galleries, Unity, AR**

- US-12.1 As a curator, I want to place artworks into a room template and publish a shareable gallery.
- US-12.2 As an artist, I want to consent or decline when a curator wants to include my work.
- US-12.3 As a buyer, I want to walk a gallery, focus a piece, and see its details and price.
- US-12.4 As a buyer, I want pieces I shortlist in VR to appear on my web shortlist immediately.
- US-12.5 As a buyer, I want to start checkout from inside the VR experience and continue safely in the web checkout.
  - Given two shortlisted pieces, When I choose checkout in VR, Then I land in the web checkout with both pieces and can return to the gallery after paying; no payment fields appear inside the VR frame.
- US-12.6 As a buyer on a device that cannot run the VR module, I want a 2D walkthrough so that I still see the exhibition.
- US-12.7 As a buyer, I want to generate a private VR room from my own shortlist ("walk my shortlist") to decide between pieces in context.
- US-12.8 As the Unity developer, I want a stable contract, mock host, and contract tests so I can build independently.

**E13 AI (P1/P2)**

- US-13.1 As an artist, I want suggested tags, alt text, and description drafts that I can edit.
- US-13.2 As a buyer, I want recommendations that include artists I have not seen.

**E14 Analytics**

- US-14.1 As an artist, I want to see revenue, views, favorites, conversion, top listings, auction results, and country breakdown, and export CSV.
- US-14.2 As an admin, I want GMV, revenue, dispute rate, and queue sizes at a glance.

**E15 Admin**

- US-15.1 As an admin, I want to manage users, roles, fees, feature flags, and content with an audit trail of every sensitive action.

**E16 Localization**

- US-16.1 As a Kinyarwanda, French, or English speaker, I want the whole interface and emails in my language.
- US-16.2 As a buyer, I want clear currency handling, with converted amounts labeled approximate.

**E17 PWA**

- US-17.1 As a mobile user on a slow network, I want the app to load fast, be installable, and show my shortlist offline.

**E18 Legal**

- US-18.1 As a user, I want clear terms, privacy policy, cookie choices, and a way to report infringement.

---

## 9. BUSINESS MODEL AND PRICING

### 9.1 Revenue streams (as decided)

| Stream                       | Mechanism                                                | Default                                       |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| Commission per sale          | Percentage of listing price taken from artist's proceeds | 12% (admin-configurable, per-artist override) |
| Buyer service fee            | Percentage added at checkout, with a minimum             | 3% (configurable)                             |
| Featured / promoted listings | Artists buy time-boxed placement packages                | 3, 7, 14 day packages (prices set by admin)   |

Future (documented, not built): artist subscription tiers, gallery sponsorships.

### 9.2 Worked example

Listing 100.00 USD. Buyer pays 103.00 (3.00 fee). Artist net 88.00 (12.00 commission). Platform gross 15.00 before provider processing fees, which are tracked as an expense in the ledger.

### 9.3 Pricing principles

Fees are always disclosed before commitment. Artists see their net on the listing editor. Commission is lower than typical gallery rates and charged only on successful sales. No listing fees in v1.

### 9.4 Unit economics note

Because this is a capstone using sandbox money, no revenue is realized. The ledger and admin dashboards still compute platform revenue so the business model is demonstrable and auditable.

---

## 10. TRUST, SAFETY, AND POLICY REQUIREMENTS (PRODUCT LEVEL)

| Policy area             | Requirement                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artist verification     | Government ID, proof of work, moderator approval; verified badge; revocation with reason                                                             |
| Buyer protection        | Funds held until delivery confirmation or timeout; dispute window of 7 days; refund paths                                                            |
| Authenticity            | Certificate with serial and QR; public verification; tamper-evident provenance chain                                                                 |
| Prohibited content      | Illegal content, hate, explicit content, infringing or stolen work, misleading AI-generated work presented as hand-made; report and takedown process |
| Off-platform payments   | Discouraged and warned in chat; repeat offenders can be sanctioned                                                                                   |
| Auction integrity       | No seller bidding on own items, anti-sniping, non-payment strikes, shill-bid review (P2)                                                             |
| Privacy                 | Consent-based analytics, data export and deletion, minimal data, verification documents access-controlled and deleted after retention                |
| AI use                  | AI suggestions are editable and never auto-publish; no fabricated provenance; kill switch                                                            |
| Moderation transparency | Reasons given for rejections and suspensions; appeals via message to moderators                                                                      |

Legal pages are templates marked "not legal advice" and require owner or counsel review before any real-money use.

---

## 11. UX PRINCIPLES AND DESIGN DIRECTION

1. **Art first.** Large imagery, quiet interface, generous whitespace.
2. **Warm, Afro-contemporary gallery feel.** Earth-tone palette (terracotta, ochre, indigo, forest on cream), editorial serif display type, subtle geometric motifs inspired by traditional patterns used sparingly.
3. **Trust visible at decision points.** Verified badges, escrow explainer, fee breakdown, and certificate previews near payment actions.
4. **One primary action per screen.** Clear hierarchy, mobile-first thumb zones, bottom navigation on phones.
5. **Never a dead end.** Every error and empty state offers a next step.
6. **Accessible by default.** WCAG 2.2 AA, keyboard and screen reader support, reduced motion, readable contrast, text alternatives for 3D.
7. **Language and currency as first-class.** Layout tolerates longer French text; Kinyarwanda diacritics render correctly; prices unambiguous.
8. **Graceful degradation.** If VR, AI, realtime, or a payment provider is unavailable, the user still completes their task.

Design tokens, components, and route map: `PRODUCT_SPEC.md` Section 14.

---

## 12. ASSUMPTIONS, DEPENDENCIES, CONSTRAINTS

### 12.1 Assumptions

- Sandbox credentials for Stripe and Flutterwave and accounts for hosting services will be provided by the owner.
- The Unity peer will deliver a WebGL build compatible with the `kv.v1` contract, or the mock module will stand in for the demo.
- Users have modern browsers with WebGL2 for the VR module; others get the 2D walkthrough.
- Kinyarwanda and French drafts will be reviewed by a native speaker before the demo.
- Demo audience values correctness, security, and polish over breadth of real-world operations.

### 12.2 Dependencies

| Dependency                                               | Owner      | Risk if late       | Mitigation                             |
| -------------------------------------------------------- | ---------- | ------------------ | -------------------------------------- |
| Unity WebGL build                                        | Peer       | VR demo missing    | Mock module is default; contract tests |
| Stripe / Flutterwave sandboxes                           | Owner      | Payment demo fails | Mock provider, switchable live         |
| Hosting (Vercel, Neon, R2, Pusher/Ably, Resend, Upstash) | Owner      | Staging blocked    | Local Docker stack with mocks          |
| 3D sample assets                                         | Owner/Peer | Thin demo          | CC0 sample GLBs in seed                |
| Translation review                                       | Owner      | Awkward UI text    | Review tracking file                   |

### 12.3 Constraints

Capstone-grade scope; sandbox money only; no legal/financial licensing; fixed technology stack (Next.js, TypeScript, PostgreSQL); physical shipping deferred; crypto deferred.

---

## 13. RISKS

| Risk                                                     | Likelihood | Impact | Mitigation                                                  |
| -------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| Scope too large for a single builder                     | High       | High   | Strict phases, P0 cut-line, AI agent with gated exits       |
| Unity performance on phones                              | Medium     | Medium | Quality tiers, texture caps, 2D fallback, web AR path       |
| Provider outages during demo                             | Medium     | High   | Mock payments, runtime provider switch, rehearsed fallback  |
| Auction race conditions                                  | Medium     | High   | DB locking, load test, invariants                           |
| Fraud and abuse themes (fake artists, shill bids, scams) | Medium     | High   | Verification, rate limits, audit logs, moderation tools     |
| Legal misunderstanding (escrow, KYC, tax, IP)            | Medium     | High   | Clear "demo-grade" labeling; legal review before real money |
| Translation quality                                      | Medium     | Medium | Native review pass                                          |
| AI misstatements in descriptions                         | Medium     | Medium | Human approval, restricted prompts                          |
| Accessibility regressions                                | Medium     | Medium | axe in CI, manual keyboard pass                             |

---

## 14. GO-TO-MARKET AND LAUNCH PLAN (CAPSTONE CONTEXT)

### 14.1 Stages

1. **Internal alpha:** owner and peer test the full flow with seed data.
2. **Closed pilot (optional):** 5 to 10 artists and 20 to 30 buyers from the owner's network use the sandbox platform for two weeks; collect feedback through an in-app form and short interviews.
3. **Capstone demo:** rehearsed 12-minute walkthrough (spec Section 18), with backup recording.
4. **Post-demo:** decide whether to pursue real-money operation (requires legal review, KYC provider, payout compliance).

### 14.2 Positioning for the demo audience

Lead with the problem (artists lack reach and trust; buyers lack confidence), show the immersive gallery, then prove the platform is real by running money, auctions, disputes, and dashboards end to end. Close with security and engineering quality.

### 14.3 Pilot feedback questions

Would you trust this to buy or sell? What made you hesitate? Was the fee breakdown clear? Did the gallery/AR help your decision? What is missing?

---

## 15. CAPSTONE EVALUATION MAPPING

| Typical assessment dimension | Where the product demonstrates it                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Problem definition and users | Sections 2 to 4                                                                    |
| Requirements quality         | This PRD plus spec with IDs and acceptance criteria                                |
| Architecture and design      | Spec Sections 3 to 5, provider interfaces, state machines                          |
| Implementation completeness  | P0 coverage across all epics                                                       |
| Data and algorithms          | Auction engine, ledger, hash-chain provenance, recommendations and semantic search |
| Integration                  | Stripe, Flutterwave, realtime, email, Unity contract                               |
| Security and privacy         | Spec Section 12, audit logs, document handling                                     |
| Testing and quality          | Unit, integration, E2E, accessibility, load tests                                  |
| DevOps                       | CI/CD, preview deployments, runbook                                                |
| UX and accessibility         | Section 11, WCAG targets                                                           |
| Innovation                   | AR/VR gallery commerce, shortlist sync, authenticity without blockchain            |
| Documentation                | PRD, spec, ADRs, API docs, Unity integration guide, demo script                    |

---

## 16. RELEASE CRITERIA (PRODUCT-LEVEL "READY TO DEMO")

- [ ] All P0 stories in Section 8 pass their acceptance criteria.
- [ ] A new visitor can complete the buyer journey (7.1) and the artist journey (7.3) without assistance.
- [ ] Auction journey (7.2) works across two devices, including an anti-sniping extension.
- [ ] Dispute journey (7.5) works and ledger remains balanced.
- [ ] VR contract flow passes with the mock module, and with the peer's build if available.
- [ ] Stripe sandbox, Flutterwave sandbox, and Mock payment all complete an order.
- [ ] All three languages complete the core journeys; no untranslated keys.
- [ ] Accessibility and performance targets in 5.3 are met.
- [ ] No critical or high security findings open.
- [ ] Demo rehearsed on a mid-range phone and on a laptop, with fallback plans verified.

---

## 17. OPEN QUESTIONS AND DECISIONS TO CONFIRM

| #   | Question                                             | Default if unanswered      | Owner |
| --- | ---------------------------------------------------- | -------------------------- | ----- |
| 1   | Final product name and logo                          | Kaleido (placeholder)      | Davy  |
| 2   | Enable physical/print checkout before the demo?      | No (inquiry flow)          | Davy  |
| 3   | Commission, buyer fee, featured package prices       | 12%, 3%, admin-set         | Davy  |
| 4   | Escrow auto-release and dispute window               | 3 days, 7 days             | Davy  |
| 5   | Curators: approval workflow or admin-granted only    | Admin-granted (P0)         | Davy  |
| 6   | Run a closed pilot with real people (sandbox money)? | Optional                   | Davy  |
| 7   | Which supported currencies beyond the default eight  | Default list               | Davy  |
| 8   | Unity build hosting origin and version               | Mock module until supplied | Peer  |
| 9   | Kinyarwanda and French review owner and date         | Davy before demo           | Davy  |

---

## 18. TRACEABILITY: PRD GOALS TO SPEC

| PRD goal                          | Primary spec sections       |
| --------------------------------- | --------------------------- |
| PG1 Complete marketplace          | 6.1 to 6.12, 6.14 to 6.18   |
| PG2 AR/VR commerce                | 6.13, 8, 4.5                |
| PG3 Trust                         | 5, 6.2, 6.7 to 6.10, 10, 12 |
| PG4 Multilingual / multi-currency | 6.17, 7, 10.2               |
| PG5 Engineering excellence        | 13, 15, 16, 19              |

---

## 19. GLOSSARY

- **Artwork / listing:** a piece offered for sale; types are physical, digital, 3D asset, print.
- **Shortlist:** a buyer's consideration list shared across web, AR, and VR.
- **Escrow-style hold:** platform-held funds released to the artist after delivery confirmation or timeout (not a licensed escrow service).
- **Provenance chain:** tamper-evident, hash-linked history of an artwork.
- **Manifest:** data package describing a gallery to the Unity module.
- **Mock provider:** safe fake of an external service for tests and demo fallback.
- **PWA:** progressive web app, installable from the browser.
- **GMV:** gross merchandise value, total value of goods sold.

---

## 20. CHANGE LOG

| Version | Date       | Change                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| 1.0     | 2026-11-21 | Initial PRD created from discovery interview and companion spec |

---

_End of PRD._
