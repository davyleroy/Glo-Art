'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { RegisterSchema, LoginSchema } from '@/schemas/auth';
import { registerUser, resendVerificationEmail } from '@/server/services/auth.service';
import { signIn } from '@/server/auth';
import { AppError, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

export type FormResult =
  | { ok: true; message?: string; redirectTo?: string }
  | { ok: false; code: string; fieldErrors?: Record<string, string[]>; message?: string };

export async function registerAction(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const h = await headers();
  try {
    const result = await registerUser(parsed.data, {
      ip: h.get('x-forwarded-for') ?? null,
      userAgent: h.get('user-agent') ?? null,
    });
    const target = `/${parsed.data.locale}/verify-email/sent?email=${encodeURIComponent(parsed.data.email)}`;
    return { ok: true, redirectTo: target, message: String(result.emailSent) };
  } catch (err) {
    if (err instanceof AppError) {
      return { ok: false, code: err.code, message: err.message };
    }
    logger.error({ err }, 'registerAction unexpected error');
    return { ok: false, code: 'UNKNOWN' };
  }
}

export async function loginAction(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_FAILED,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { ok: false, code: 'INVALID_CREDENTIALS' };
  }

  const locale = (formData.get('locale') as string) || 'en';
  redirect(`/${locale}/dashboard`);
}

export async function resendVerificationAction(email: string): Promise<void> {
  try {
    await resendVerificationEmail(email);
  } catch (err) {
    logger.warn({ err }, 'resendVerificationAction failed (ignored)');
  }
}
