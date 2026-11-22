import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ResendVerificationButton } from '@/components/auth/resend-verification-button';

export default async function VerifyEmailSentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { email } = await searchParams;
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <VerifySentBody email={email ?? ''} />
      </div>
    </div>
  );
}

function VerifySentBody({ email }: { email: string }) {
  const t = useTranslations('auth.verify');
  const tReg = useTranslations('auth.register');
  return (
    <div className="card text-center">
      <h1 className="text-2xl font-semibold">{t('pendingTitle')}</h1>
      <p className="mt-2 text-muted-foreground">{t('pendingBody')}</p>
      {email && (
        <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm">
          {tReg('successBody', { email })}
        </p>
      )}
      {email && (
        <div className="mt-6">
          <ResendVerificationButton email={email} />
        </div>
      )}
    </div>
  );
}
