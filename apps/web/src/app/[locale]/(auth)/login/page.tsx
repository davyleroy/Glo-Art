import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { env } from '@/lib/env';
import { LoginForm } from './login-form';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginPageBody locale={locale} />;
}

function LoginPageBody({ locale }: { locale: string }) {
  const t = useTranslations('auth.login');
  return (
    <div className="card">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('subtitle', { brand: env.BRAND_NAME })}
      </p>
      <div className="mt-6">
        <LoginForm locale={locale} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/register" className="btn-link">
          {t('register')}
        </Link>
      </p>
    </div>
  );
}
