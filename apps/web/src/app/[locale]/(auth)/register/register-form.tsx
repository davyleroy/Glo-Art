'use client';

import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { registerAction, type FormResult } from '../actions';

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormResult | null, FormData>(
    registerAction,
    null,
  );

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo.replace(`/${locale}`, '') || '/');
    }
  }, [state, router, locale]);

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const topLevelError =
    state && !state.ok
      ? state.code === 'EMAIL_ALREADY_REGISTERED'
        ? tErr('emailAlreadyRegistered')
        : state.code === 'VALIDATION_FAILED'
          ? undefined
          : tErr('unknown')
      : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="field-label" htmlFor="displayName">
          {t('displayName')}
        </label>
        <input id="displayName" name="displayName" required className="input" />
        {errors.displayName && (
          <p className="field-error">{tErr(errors.displayName[0] ?? 'unknown')}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="username">
          {t('username')}
        </label>
        <input id="username" name="username" required className="input" />
        <p className="mt-1 text-xs text-muted-foreground">{t('usernameHelp')}</p>
        {errors.username && (
          <p className="field-error">{tErr(errors.username[0] ?? 'unknown')}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          {tCommon('email')}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        {errors.email && <p className="field-error">{tErr(errors.email[0] ?? 'unknown')}</p>}
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          {tCommon('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="input"
          minLength={12}
        />
        {errors.password && (
          <p className="field-error">{tErr(errors.password[0] ?? 'unknown')}</p>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="acceptTerms" required className="mt-1" />
        <span>{t('acceptTerms')}</span>
      </label>
      {errors.acceptTerms && (
        <p className="field-error">{tErr(errors.acceptTerms[0] ?? 'unknown')}</p>
      )}

      {topLevelError && (
        <p role="alert" className="field-error">
          {topLevelError}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? tCommon('loading') : t('cta')}
      </button>
    </form>
  );
}
