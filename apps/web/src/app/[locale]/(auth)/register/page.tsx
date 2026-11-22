import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { RegisterForm } from './register-form';

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RegisterPageBody locale={locale} />;
}

function RegisterPageBody({ locale }: { locale: string }) {
  const t = useTranslations('auth.register');
  return (
    <div className="card">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      <div className="mt-6">
        <RegisterForm locale={locale} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link href="/login" className="btn-link">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
