import 'server-only';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { AppError, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getContainer } from '@/server/container';
import { hashPassword, verifyPassword } from '@/server/auth/password';
import { generateToken, hashToken } from '@/server/auth/tokens';
import type { RegisterInput, LoginInput } from '@/schemas/auth';
import { recordAudit } from './audit.service';
import { renderEmailVerification } from './email-templates';

const VERIFICATION_TOKEN_TTL_MIN = 30;

export interface RegistrationResult {
  userId: string;
  emailSent: boolean;
}

export async function registerUser(
  input: RegisterInput,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<RegistrationResult> {
  const existingByEmail = await db.user.findUnique({ where: { email: input.email } });
  if (existingByEmail) {
    throw new AppError(ERROR_CODES.EMAIL_ALREADY_REGISTERED, 'Email already registered');
  }

  const existingByUsername = await db.user.findUnique({ where: { username: input.username } });
  if (existingByUsername) {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED, 'Username already taken', {
      details: { field: 'username' },
    });
  }

  const passwordHash = await hashPassword(input.password);
  const { token, hash: tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MIN * 60_000);

  const user = await db.user.create({
    data: {
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      passwordHash,
      locale: input.locale,
      roles: { create: [{ role: Role.BUYER }] },
      verificationTokens: {
        create: {
          tokenHash,
          expiresAt,
        },
      },
    },
    select: { id: true, email: true, displayName: true, locale: true },
  });

  const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/${user.locale}/verify-email?token=${token}`;
  const rendered = renderEmailVerification({
    displayName: user.displayName,
    verificationUrl,
    locale: user.locale as 'en' | 'fr' | 'rw',
  });

  let emailSent = false;
  try {
    await getContainer().email.send({
      to: user.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
    emailSent = true;
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to send verification email');
    // We don't fail registration — the user can request a resend. The audit
    // log keeps a record for ops.
  }

  await recordAudit({
    actorId: user.id,
    action: 'user.register',
    entity: 'User',
    entityId: user.id,
    metadata: { emailSent },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { userId: user.id, emailSent };
}

export interface VerificationResult {
  userId: string;
  alreadyVerified: boolean;
}

export async function verifyEmailToken(token: string): Promise<VerificationResult> {
  const tokenHash = hashToken(token);
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerifiedAt: true } } },
  });
  if (!record) {
    throw new AppError(ERROR_CODES.VERIFICATION_TOKEN_INVALID, 'Verification token not found');
  }
  if (record.consumedAt) {
    throw new AppError(ERROR_CODES.VERIFICATION_TOKEN_INVALID, 'Token already used');
  }
  if (record.expiresAt < new Date()) {
    throw new AppError(ERROR_CODES.VERIFICATION_TOKEN_EXPIRED, 'Verification token expired');
  }

  const alreadyVerified = !!record.user.emailVerifiedAt;
  const now = new Date();

  await db.$transaction([
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: now },
    }),
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: alreadyVerified ? record.user.emailVerifiedAt : now },
    }),
  ]);

  await recordAudit({
    actorId: record.userId,
    action: 'user.email_verified',
    entity: 'User',
    entityId: record.userId,
    metadata: { alreadyVerified },
  });

  return { userId: record.userId, alreadyVerified };
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  locale: string;
  roles: Role[];
  emailVerifiedAt: Date | null;
}

export async function authenticateWithPassword(
  input: LoginInput,
): Promise<AuthenticatedUser | null> {
  const user = await db.user.findUnique({
    where: { email: input.email },
    include: { roles: true },
  });
  if (!user || !user.passwordHash) return null;
  if (user.status !== 'ACTIVE') return null;

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) return null;

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    locale: user.locale,
    emailVerifiedAt: user.emailVerifiedAt,
    roles: user.roles.map((r) => r.role),
  };
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email } });
  // Always succeed from the caller's perspective to avoid leaking account existence.
  if (!user || user.emailVerifiedAt) return;

  const { token, hash: tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MIN * 60_000);
  await db.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/${user.locale}/verify-email?token=${token}`;
  const rendered = renderEmailVerification({
    displayName: user.displayName,
    verificationUrl,
    locale: user.locale as 'en' | 'fr' | 'rw',
  });
  await getContainer().email.send({
    to: user.email,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}
