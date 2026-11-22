'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { resendVerificationAction } from '@/app/[locale]/(auth)/actions';

export function ResendVerificationButton({ email }: { email: string }) {
  const t = useTranslations('auth.banner');
  const tv = useTranslations('auth.verify');
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await resendVerificationAction(email);
      setDone(true);
    });
  }

  if (done) return <span className="text-sm text-forest">{tv('resendSent')}</span>;
  return (
    <button onClick={onClick} disabled={isPending} className="btn-link text-sm">
      {t('resendCta')}
    </button>
  );
}
