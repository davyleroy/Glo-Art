import { describe, expect, it } from 'vitest';
import { Role } from '@prisma/client';
import { ACTIONS, GUEST, can, type Subject } from './policies';

const subject = (opts: Partial<Subject> = {}): Subject => ({
  isAuthenticated: true,
  isEmailVerified: true,
  roles: [Role.BUYER],
  ...opts,
});

describe('authz policies — spec §2.3 permission matrix', () => {
  it('guests can only browse the catalog', () => {
    expect(can(GUEST, ACTIONS.CATALOG_BROWSE)).toBe(true);
    expect(can(GUEST, ACTIONS.SOCIAL_INTERACT)).toBe(false);
    expect(can(GUEST, ACTIONS.BID)).toBe(false);
    expect(can(GUEST, ACTIONS.BUY)).toBe(false);
    expect(can(GUEST, ACTIONS.LISTING_CREATE)).toBe(false);
  });

  it('unverified buyers cannot bid or buy', () => {
    const s = subject({ isEmailVerified: false, roles: [Role.BUYER] });
    expect(can(s, ACTIONS.BID)).toBe(false);
    expect(can(s, ACTIONS.BUY)).toBe(false);
    expect(can(s, ACTIONS.SOCIAL_INTERACT)).toBe(true);
  });

  it('verified buyers can bid, buy, chat, review', () => {
    const s = subject();
    expect(can(s, ACTIONS.BID)).toBe(true);
    expect(can(s, ACTIONS.BUY)).toBe(true);
    expect(can(s, ACTIONS.CHAT)).toBe(true);
    expect(can(s, ACTIONS.REVIEW)).toBe(true);
    expect(can(s, ACTIONS.LISTING_CREATE)).toBe(false);
  });

  it('artists can create and edit listings but need verification to publish', () => {
    const unverified = subject({ roles: [Role.ARTIST], isEmailVerified: false });
    const verified = subject({ roles: [Role.ARTIST] });
    expect(can(unverified, ACTIONS.LISTING_CREATE)).toBe(true);
    expect(can(unverified, ACTIONS.LISTING_PUBLISH)).toBe(false);
    expect(can(verified, ACTIONS.LISTING_PUBLISH)).toBe(true);
    expect(can(verified, ACTIONS.AUCTION_RUN)).toBe(true);
  });

  it('curators can create galleries from any published work', () => {
    const s = subject({ roles: [Role.CURATOR] });
    expect(can(s, ACTIONS.GALLERY_CREATE_ANY)).toBe(true);
    // Curators are not automatically artists:
    expect(can(s, ACTIONS.LISTING_CREATE)).toBe(false);
  });

  it('moderators can approve verifications and resolve limited disputes, but not platform settings', () => {
    const s = subject({ roles: [Role.MODERATOR] });
    expect(can(s, ACTIONS.VERIFICATION_APPROVE)).toBe(true);
    expect(can(s, ACTIONS.LISTING_MODERATE)).toBe(true);
    expect(can(s, ACTIONS.DISPUTE_RESOLVE_LIMITED)).toBe(true);
    expect(can(s, ACTIONS.DISPUTE_RESOLVE_ANY)).toBe(false);
    expect(can(s, ACTIONS.PLATFORM_SETTINGS)).toBe(false);
  });

  it('admins can do everything', () => {
    const s = subject({ roles: [Role.ADMIN] });
    const every = Object.values(ACTIONS);
    for (const action of every) {
      expect(can(s, action), `admin should be allowed: ${action}`).toBe(true);
    }
  });

  it('negative: a non-admin cannot edit platform settings even if authed and verified', () => {
    for (const role of [Role.BUYER, Role.ARTIST, Role.CURATOR, Role.MODERATOR]) {
      const s = subject({ roles: [role] });
      expect(can(s, ACTIONS.PLATFORM_SETTINGS)).toBe(false);
      expect(can(s, ACTIONS.ROLE_GRANT)).toBe(false);
    }
  });
});
