'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { loginAction, type FormResult } from '../actions';

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const tErr = useTranslations('errors');

  const [state, formAction, isPending] = useActionState<FormResult | null, FormData>(
    loginAction,
    null,
  );

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const topLevelError =
    state && !state.ok
      ? state.code === 'INVALID_CREDENTIALS'
        ? t('invalid')
        : state.code === 'VALIDATION_FAILED'
          ? undefined
          : tErr('unknown')
      : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="field-label" htmlFor="email">
          {tCommon('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
        />
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
          autoComplete="current-password"
          required
          className="input"
        />
        {errors.password && (
          <p className="field-error">{tErr(errors.password[0] ?? 'unknown')}</p>
        )}
      </div>

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
