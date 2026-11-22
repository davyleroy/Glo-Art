import { Role } from '@prisma/client';

/**
 * Centralized RBAC. Every mutating action and every role-gated UI decision
 * runs through `can()`. UI hiding is a convenience; authorization is always
 * enforced server-side (spec §2.3).
 *
 * Phase 0 covers browse / social / artist / curator / moderation / admin
 * at role-level granularity. Resource-level ownership checks (e.g.,
 * "edit own listing") are composed in services as role gate + ownership
 * predicate — see helpers below.
 */

export const ACTIONS = {
  // Catalog
  CATALOG_BROWSE: 'catalog.browse',
  // Social
  SOCIAL_INTERACT: 'social.interact', // like, follow, comment, shortlist
  // Commerce
  BID: 'commerce.bid',
  BUY: 'commerce.buy',
  CHAT: 'commerce.chat',
  REVIEW: 'commerce.review',
  // Artist
  LISTING_CREATE: 'listing.create',
  LISTING_EDIT_OWN: 'listing.edit.own',
  LISTING_PUBLISH: 'listing.publish',
  AUCTION_RUN: 'auction.run',
  // Curator
  GALLERY_CREATE_OWN_ARTWORK: 'gallery.create.ownArtwork',
  GALLERY_CREATE_ANY: 'gallery.create.any',
  // Moderation
  VERIFICATION_APPROVE: 'moderation.verification.approve',
  LISTING_MODERATE: 'moderation.listing',
  DISPUTE_RESOLVE_LIMITED: 'dispute.resolve.limited',
  // Admin
  DISPUTE_RESOLVE_ANY: 'dispute.resolve.any',
  PLATFORM_SETTINGS: 'platform.settings',
  ROLE_GRANT: 'role.grant',
  FEATURE_FLAG_EDIT: 'featureFlag.edit',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export interface Subject {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  roles: Role[];
}

const anyRole = (roles: Role[]) => (s: Subject) => s.roles.some((r) => roles.includes(r));
const authed = (s: Subject) => s.isAuthenticated;
const verified = (s: Subject) => s.isEmailVerified;

type Guard = (s: Subject) => boolean;
const all =
  (...guards: Guard[]): Guard =>
  (s) =>
    guards.every((g) => g(s));

/**
 * Policy table. The permission matrix in spec §2.3 is the source of truth;
 * if a row is added there, add it here and in the unit-test matrix.
 */
const POLICIES: Record<Action, Guard> = {
  // Guests + everyone
  [ACTIONS.CATALOG_BROWSE]: () => true,

  // Authenticated interactions
  [ACTIONS.SOCIAL_INTERACT]: authed,
  [ACTIONS.BID]: all(authed, verified),
  [ACTIONS.BUY]: all(authed, verified),
  [ACTIONS.CHAT]: all(authed, verified),
  [ACTIONS.REVIEW]: all(authed, verified),

  // Artist
  [ACTIONS.LISTING_CREATE]: all(authed, anyRole([Role.ARTIST, Role.ADMIN])),
  [ACTIONS.LISTING_EDIT_OWN]: all(authed, anyRole([Role.ARTIST, Role.ADMIN])),
  [ACTIONS.LISTING_PUBLISH]: all(authed, verified, anyRole([Role.ARTIST, Role.ADMIN])),
  [ACTIONS.AUCTION_RUN]: all(authed, verified, anyRole([Role.ARTIST, Role.ADMIN])),

  // Curator
  [ACTIONS.GALLERY_CREATE_OWN_ARTWORK]: all(authed, anyRole([Role.ARTIST, Role.ADMIN])),
  [ACTIONS.GALLERY_CREATE_ANY]: all(authed, anyRole([Role.CURATOR, Role.ADMIN])),

  // Moderation
  [ACTIONS.VERIFICATION_APPROVE]: all(authed, anyRole([Role.MODERATOR, Role.ADMIN])),
  [ACTIONS.LISTING_MODERATE]: all(authed, anyRole([Role.MODERATOR, Role.ADMIN])),
  [ACTIONS.DISPUTE_RESOLVE_LIMITED]: all(authed, anyRole([Role.MODERATOR, Role.ADMIN])),

  // Admin
  [ACTIONS.DISPUTE_RESOLVE_ANY]: all(authed, anyRole([Role.ADMIN])),
  [ACTIONS.PLATFORM_SETTINGS]: all(authed, anyRole([Role.ADMIN])),
  [ACTIONS.ROLE_GRANT]: all(authed, anyRole([Role.ADMIN])),
  [ACTIONS.FEATURE_FLAG_EDIT]: all(authed, anyRole([Role.ADMIN])),
};

export function can(subject: Subject, action: Action): boolean {
  const guard = POLICIES[action];
  return guard ? guard(subject) : false;
}

// Convenience: compose role gate with an ownership predicate at the call site.
export function canOnResource<T>(
  subject: Subject,
  action: Action,
  resource: T,
  isOwner: (s: Subject, r: T) => boolean,
): boolean {
  if (!can(subject, action)) return false;
  return isOwner(subject, resource);
}

export const GUEST: Subject = { isAuthenticated: false, isEmailVerified: false, roles: [] };
