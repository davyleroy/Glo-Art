import 'server-only';
import { auth } from '@/server/auth';
import type { Subject } from './policies';
import { GUEST } from './policies';
import type { Role } from '@prisma/client';
import { db } from '@/lib/db';

/**
 * Current-request subject, built from the Auth.js session.
 * Email-verified status is derived from DB (not the JWT) so revoking it
 * takes effect immediately.
 */
export async function currentSubject(): Promise<Subject & { userId?: string }> {
  const session = await auth();
  if (!session?.user?.id) return GUEST;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerifiedAt: true, status: true },
  });
  if (!user || user.status !== 'ACTIVE') return GUEST;

  return {
    isAuthenticated: true,
    isEmailVerified: !!user.emailVerifiedAt,
    roles: (session.user as unknown as { roles?: Role[] }).roles ?? [],
    userId: session.user.id,
  };
}
