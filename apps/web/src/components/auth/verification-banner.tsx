import { getTranslations } from 'next-intl/server';
import { ResendVerificationButton } from './resend-verification-button';

export async function VerificationBanner({ email }: { email: string }) {
  const t = await getTranslations('auth.banner');
  return (
    <div role="status" className="border-b border-ochre/40 bg-ochre/20 px-4 py-2 text-sm">
      <div className="container flex flex-wrap items-center justify-between gap-2">
        <p>
          <strong>{t('unverifiedTitle')}</strong>{' '}
          <span className="text-muted-foreground">{t('unverifiedBody', { email })}</span>
        </p>
        <ResendVerificationButton email={email} />
      </div>
    </div>
  );
}
