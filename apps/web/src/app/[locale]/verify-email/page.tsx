import { useTranslations } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { env } from '@/lib/env';
import { verifyEmailToken } from '@/server/services/auth.service';
import { AppError, ERROR_CODES } from '@/lib/errors';
import { logger } from '@/lib/logger';

type Outcome = 'success' | 'invalid' | 'expired' | 'missing';

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);

  let outcome: Outcome = 'missing';
  if (token) {
    try {
      await verifyEmailToken(token);
      outcome = 'success';
    } catch (err) {
      if (err instanceof AppError && err.code === ERROR_CODES.VERIFICATION_TOKEN_EXPIRED) {
        outcome = 'expired';
      } else if (err instanceof AppError && err.code === ERROR_CODES.VERIFICATION_TOKEN_INVALID) {
        outcome = 'invalid';
      } else {
        logger.error({ err }, 'verify-email: unexpected error');
        outcome = 'invalid';
      }
    }
  }

  return <VerifyEmailBody outcome={outcome} />;
}

function VerifyEmailBody({ outcome }: { outcome: Outcome }) {
  const t = useTranslations('auth.verify');
  if (outcome === 'success') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold text-forest">{t('successTitle')}</h1>
        <p className="mt-2 text-muted-foreground">{t('successBody', { brand: env.BRAND_NAME })}</p>
        <div className="mt-6">
          <Link href="/login" className="btn-primary">
            {t('successCta', { brand: env.BRAND_NAME })}
          </Link>
        </div>
      </div>
    );
  }
  if (outcome === 'expired') {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold">{t('expiredTitle')}</h1>
        <p className="mt-2 text-muted-foreground">{t('expiredBody')}</p>
      </div>
    );
  }
  return (
    <div className="card text-center">
      <h1 className="text-2xl font-semibold">{t('invalidTitle')}</h1>
      <p className="mt-2 text-muted-foreground">{t('invalidBody')}</p>
    </div>
  );
}
